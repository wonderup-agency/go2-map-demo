// centers-coe.js
//
// This component fetches facility data from an API, then draws pins on a
// Google Map and renders a scrollable list of centers next to it.
// Users can filter centers by typing a zip code and/or selecting designation
// type checkboxes (e.g. Screening, Cancer Care, etc.).

import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer'

// =============================================================================
// SETTINGS — edit these values to configure the map
// =============================================================================

// Where to fetch the list of facilities from
var API_URL = 'https://go2-worker.nahuel-eba.workers.dev/centers?category=COE'

// Where to fetch the list of available designation types from
var DESIGNATIONS_URL = 'https://go2-worker.nahuel-eba.workers.dev/centers/designations'

// Google Maps API key
var GOOGLE_MAPS_API_KEY = 'AIzaSyDzjnzJImLe2q2uc8ziZYmQVPrI9TDukww'

// Where the map is centered when it first loads (lat/lng of central US)
var STARTING_LAT = 37.5
var STARTING_LNG = -95.7

// How far zoomed in/out the map starts (lower = more zoomed out)
var STARTING_ZOOM = 4

// How far to zoom in when a user clicks on a center
var CLICK_ZOOM = 14

// How close pins need to be (in pixels) before they merge into a cluster
var CLUSTER_RADIUS = 60

// How many list items to show per page (pagination)
var ITEMS_PER_PAGE = 2

// -----------------------------------------------------------------------------
// PIN IMAGES — each pin type has its own image, size, and anchor point.
//
// "size" is [width, height] in pixels — how big the pin appears on the map.
// "anchor" is [x, y] — which pixel of the image sits on the exact map
// coordinate. For a typical pin shape, use [width/2, height] so the bottom
// center of the image touches the location.
// -----------------------------------------------------------------------------

var COE_PIN = {
  imageUrl: 'https://cdn.prod.website-files.com/685abc7fe66bf3b67a6af38e/69a5829ede217c58b6303bb4_pin-coe-1.png',
  size: [52, 52],
  anchor: [26, 52],
}

var NCI_PIN = {
  imageUrl: 'https://cdn.prod.website-files.com/685abc7fe66bf3b67a6af38e/699cbe556ade1b088be0322b_pin-nci.png',
  size: [32, 32],
  anchor: [16, 32],
}

var COC_PIN = {
  imageUrl: 'https://cdn.prod.website-files.com/685abc7fe66bf3b67a6af38e/699cbe5541e827aa53093410_pin-coc.png',
  size: [32, 32],
  anchor: [16, 32],
}

// -----------------------------------------------------------------------------
// DESIGNATION LABELS — human-readable names for the designation types
// that come from the API (e.g. "cancer_care" becomes "Cancer Care").
// Add new entries here if the API adds new types in the future.
// -----------------------------------------------------------------------------

var DESIGNATION_LABELS = {
  screening: 'Screening',
  cancer_care: 'Cancer Care',
  ipn: 'IPN',
  biomarker: 'Biomarker',
}

// Fallback: if a type isn't in the list above, capitalize it and replace underscores
function getDesignationLabel(type) {
  if (DESIGNATION_LABELS[type]) {
    return DESIGNATION_LABELS[type]
  }
  // "some_new_type" → "Some new type"
  var words = type.replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Takes a pin config (like COE_PIN) and turns it into a Google Maps icon object.
 * Google Maps needs icons in a specific format — this does that conversion.
 */
function createGoogleMapsIcon(pinConfig) {
  return {
    url: pinConfig.imageUrl,
    scaledSize: new google.maps.Size(pinConfig.size[0], pinConfig.size[1]),
    anchor: new google.maps.Point(pinConfig.anchor[0], pinConfig.anchor[1]),
  }
}

/**
 * Creates the SVG bubble shown when multiple pins are clustered together.
 * It's a white circle with a blue border and the count number inside.
 */
function createClusterIcon(count) {
  // Make the bubble bigger when the number has more digits
  var numberOfDigits = String(count).length
  var bubbleSize = 36
  if (numberOfDigits === 2) bubbleSize = 40
  if (numberOfDigits > 2) bubbleSize = 48

  var center = bubbleSize / 2
  var radius = center - 2

  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg"' +
    ' width="' +
    bubbleSize +
    '"' +
    ' height="' +
    bubbleSize +
    '"' +
    ' viewBox="0 0 ' +
    bubbleSize +
    ' ' +
    bubbleSize +
    '">' +
    '<circle cx="' +
    center +
    '" cy="' +
    center +
    '" r="' +
    radius +
    '"' +
    ' fill="#ffffff" stroke="#2c3495" stroke-width="3"/>' +
    '<text x="' +
    center +
    '" y="' +
    center +
    '"' +
    ' text-anchor="middle" dominant-baseline="central"' +
    ' fill="#2c3495" font-family="Arial,Helvetica,sans-serif"' +
    ' font-weight="800" font-size="14">' +
    count +
    '</text>' +
    '</svg>'

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(bubbleSize, bubbleSize),
    anchor: new google.maps.Point(center, center),
  }
}

/**
 * Takes the raw facility data from the API and turns each facility into a
 * simpler "pin" object with just the fields we need for the map and list.
 *
 * Some facilities have "override addresses" on their designations — for
 * example, a screening program at a different building. When an override
 * address exists, we use that location instead of the facility's main address.
 * This can result in one facility having multiple pins at different spots.
 *
 * Each pin also gets a "designationTypes" array (e.g. ["screening", "cancer_care"])
 * so we can filter by designation type later.
 */
function turnFacilitiesIntoPins(facilities) {
  var allPins = []

  for (var i = 0; i < facilities.length; i++) {
    var facility = facilities[i]

    // Skip facilities that have no designations at all
    if (!facility.designations || facility.designations.length === 0) {
      continue
    }

    // Collect ALL designation types this facility has (e.g. ["screening", "cancer_care"])
    var facilityDesignationTypes = []
    for (var d = 0; d < facility.designations.length; d++) {
      var desType = facility.designations[d].type
      if (desType && facilityDesignationTypes.indexOf(desType) === -1) {
        facilityDesignationTypes.push(desType)
      }
    }

    // We use this to avoid placing two pins at the exact same spot for one facility.
    // The key is "lat,lng" and the value is the location info.
    var uniqueLocations = {}

    for (var j = 0; j < facility.designations.length; j++) {
      var designation = facility.designations[j]

      // Check if this designation has an override address with valid coordinates
      var hasOverride =
        designation.overrides &&
        designation.overrides.address &&
        designation.overrides.address.latitude != null &&
        designation.overrides.address.longitude != null

      var lat, lng, address, streetAddress, locationCity, locationState, locationZip, phone, website

      if (hasOverride) {
        // Use the override address (different building/location)
        var overrideAddr = designation.overrides.address
        lat = parseFloat(overrideAddr.latitude)
        lng = parseFloat(overrideAddr.longitude)

        // Build a readable address string from the override parts
        var overrideParts = [
          overrideAddr.line1,
          overrideAddr.line2,
          overrideAddr.city,
          overrideAddr.state,
          overrideAddr.zip,
        ]
        address = overrideParts.filter(Boolean).join(', ')
        streetAddress = [overrideAddr.line1, overrideAddr.line2].filter(Boolean).join(', ')
        locationCity = overrideAddr.city || ''
        locationState = overrideAddr.state || ''
        locationZip = overrideAddr.zip || ''

        phone = designation.overrides.phone || facility.phone
        website = designation.overrides.url || facility.website
      } else {
        // Use the facility's main address
        lat = parseFloat(facility.latitude)
        lng = parseFloat(facility.longitude)

        var mainAddr = facility.address || {}
        var mainParts = [mainAddr.line1, mainAddr.line2, mainAddr.city, mainAddr.state, mainAddr.zip]
        address = mainParts.filter(Boolean).join(', ')
        streetAddress = [mainAddr.line1, mainAddr.line2].filter(Boolean).join(', ')
        locationCity = mainAddr.city || ''
        locationState = mainAddr.state || ''
        locationZip = mainAddr.zip || ''

        phone = facility.phone
        website = facility.website
      }

      // Skip if the coordinates are not valid numbers
      if (isNaN(lat) || isNaN(lng)) {
        continue
      }

      // Only keep the first location we find at each lat/lng
      var locationKey = lat + ',' + lng
      if (!uniqueLocations[locationKey]) {
        uniqueLocations[locationKey] = {
          lat: lat,
          lng: lng,
          address: address,
          streetAddress: streetAddress,
          city: locationCity,
          state: locationState,
          zip: locationZip,
          phone: phone,
          website: website,
        }
      }
    }

    // Create a pin for each unique location of this facility
    var facilityAddr = facility.address || {}
    var locationKeys = Object.keys(uniqueLocations)

    for (var k = 0; k < locationKeys.length; k++) {
      var location = uniqueLocations[locationKeys[k]]

      allPins.push({
        fid: facility.fid,
        name: facility.name,
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        streetAddress: location.streetAddress,
        phone: location.phone,
        website: location.website,
        imageUrl: facility.image_url,
        zip: location.zip,
        city: location.city,
        state: location.state,
        designationTypes: facilityDesignationTypes,
      })
    }
  }

  return allPins
}

// =============================================================================
// MAIN — this function runs when the component loads on the page
// =============================================================================

export default async function (component) {
  console.log('[COE] Component initializing...')

  // --------------------------------------------------------------------------
  // 1. FIND THE HTML ELEMENTS WE NEED
  // --------------------------------------------------------------------------

  // The scrollable list of centers next to the map
  var centersList = component.querySelector("[data-centers='list']")

  // The div where the Google Map will be rendered
  var mapContainer = component.querySelector("[data-centers='map']")

  // The zip code text input for filtering
  var zipInput = component.querySelector("[data-custom='centers-zip-field']")

  // The dropdown nav that holds the designation checkboxes
  // (In Webflow this is the <nav> inside the "Designations" dropdown)
  var checkboxContainer = component.querySelector('.map_filters-right-category-nav')

  // The container where pagination controls will be rendered
  var paginationContainer = component.querySelector('[data-centers="pagination"]')

  // Clone the list item template (we'll reuse this to create each list entry)
  var listItemTemplate = document.querySelector('[data-centers="list-item"]').cloneNode(true)

  // Check if this instance should only show screening centers.
  // Set data-show-only-screening="true" on the component element in Webflow
  // to lock this map to screening-only mode (hides the designation checkboxes).
  var showOnlyScreening = component.getAttribute('data-show-only-screening') === 'true'

  console.log('[COE] DOM elements found:', {
    centersList: !!centersList,
    mapContainer: !!mapContainer,
    zipInput: !!zipInput,
    checkboxContainer: !!checkboxContainer,
    paginationContainer: !!paginationContainer,
    listItemTemplate: !!listItemTemplate,
  })
  console.log('[COE] Mode:', showOnlyScreening ? 'SCREENING-ONLY' : 'NORMAL (all designations)')

  // Show a loading message while data is being fetched
  centersList.innerHTML = '<p style="padding:1rem;color:#666;">Loading centers...</p>'

  // Prevent all form submissions within this component and disable Webflow form handling
  var forms = component.querySelectorAll('form')
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', function (e) {
      e.preventDefault()
    })
    forms[i].removeAttribute('data-wf-page-id')
    forms[i].removeAttribute('data-wf-element-id')
    forms[i].removeAttribute('data-name')
    forms[i].removeAttribute('action')
  }
  var formMessages = component.querySelectorAll('.w-form-done, .w-form-fail')
  for (var i = 0; i < formMessages.length; i++) {
    formMessages[i].remove()
  }

  // --------------------------------------------------------------------------
  // 2. LOAD THE GOOGLE MAPS LIBRARY
  // --------------------------------------------------------------------------

  try {
    setOptions({ key: GOOGLE_MAPS_API_KEY, v: 'weekly' })
    await importLibrary('maps')
    await importLibrary('marker')
    console.log('[COE] Google Maps loaded successfully')
  } catch (error) {
    console.error('Google Maps failed to load:', error)
    mapContainer.innerHTML =
      '<p style="padding:1rem;color:red;">Failed to load Google Maps. Please try again later.</p>'
    return
  }

  // --------------------------------------------------------------------------
  // 3. CREATE THE MAP
  // --------------------------------------------------------------------------

  var map = new google.maps.Map(mapContainer, {
    center: { lat: STARTING_LAT, lng: STARTING_LNG },
    zoom: STARTING_ZOOM,
    mapTypeControl: false,
    streetViewControl: false,
  })

  // --------------------------------------------------------------------------
  // 4. PREPARE THE PIN ICONS
  //    Convert our simple pin configs into the format Google Maps expects.
  // --------------------------------------------------------------------------

  var coeIcon = createGoogleMapsIcon(COE_PIN)
  var nciIcon = createGoogleMapsIcon(NCI_PIN)
  var cocIcon = createGoogleMapsIcon(COC_PIN)

  // This is the icon used for all markers right now.
  // TODO: assign the correct icon per facility once the logic is defined.
  var defaultIcon = coeIcon

  // --------------------------------------------------------------------------
  // 5. CREATE A SHARED INFO WINDOW
  //    Only one popup can be open at a time — Google Maps reuses this one.
  // --------------------------------------------------------------------------

  var infoWindow = new google.maps.InfoWindow({ disableAutoPan: true })

  // Remove the default Google Maps InfoWindow styling (bg, shadow, arrow, close button)
  var infoWindowStyle = document.createElement('style')
  infoWindowStyle.textContent =
    '.gm-style-iw { background: none !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; max-width: none !important; }' +
    '.gm-style-iw-d { overflow: auto !important; padding: 0 !important; max-width: none !important; }' +
    '.gm-style-iw-tc { display: none !important; }' +
    '.gm-ui-hover-effect { display: none !important; }'
  document.head.appendChild(infoWindowStyle)

  // Keep the info window open when the user hovers over it
  infoWindow.addListener('domready', function () {
    var iwContent = document.querySelector('.gm-style-iw')
    if (iwContent) {
      iwContent.onmouseover = function () {
        clearTimeout(closeTimeout)
      }
      iwContent.onmouseout = function () {
        closeTimeout = setTimeout(function () {
          infoWindow.close()
        }, 300)
      }
    }
  })

  // --------------------------------------------------------------------------
  // 6. FETCH DATA — facilities and designations at the same time
  // --------------------------------------------------------------------------

  var allFacilities = []
  var designationTypes = [] // e.g. ["screening", "cancer_care", "ipn", "biomarker"]

  try {
    // Fetch both endpoints at the same time for speed
    var facilitiesPromise = fetch(API_URL)
    var designationsPromise = fetch(DESIGNATIONS_URL)

    // Wait for the facilities response
    var facilitiesResponse = await facilitiesPromise
    if (!facilitiesResponse.ok) {
      throw new Error('Facilities HTTP ' + facilitiesResponse.status)
    }
    var facilitiesData = await facilitiesResponse.json()
    allFacilities = facilitiesData.centers || []
    console.log('[COE] Facilities fetched:', allFacilities.length, 'facilities')

    // Wait for the designations response
    var designationsResponse = await designationsPromise
    if (!designationsResponse.ok) {
      throw new Error('Designations HTTP ' + designationsResponse.status)
    }
    var designationsData = await designationsResponse.json()

    // Extract just the type names: ["screening", "cancer_care", "ipn", "biomarker"]
    if (designationsData.types && designationsData.types.length > 0) {
      for (var i = 0; i < designationsData.types.length; i++) {
        designationTypes.push(designationsData.types[i].type)
      }
    }
    console.log('[COE] Designation types from API:', designationTypes)
  } catch (error) {
    console.error('Error fetching data:', error)
    centersList.innerHTML = '<p style="padding:1rem;color:red;">Failed to load centers. Please try again later.</p>'
    return
  }

  // --------------------------------------------------------------------------
  // 7. POPULATE THE DESIGNATION CHECKBOXES
  //    Replace the placeholder checkboxes from Webflow with real ones
  //    based on the designation types returned by the API.
  //    If screening-only mode is on, remove the entire checkbox filter instead.
  // --------------------------------------------------------------------------

  if (showOnlyScreening) {
    // In screening-only mode, remove the checkbox filter wrapper from the page
    // entirely so the user can't toggle designation types.
    if (checkboxContainer) {
      var checkboxFilterWrapper = checkboxContainer.closest('.map_filters-right')
      console.log('[COE] Screening-only mode — removing checkbox wrapper:', !!checkboxFilterWrapper)
      if (checkboxFilterWrapper) {
        checkboxFilterWrapper.remove()
      }
    }

    // Also remove the map references/legend section
    var mapReferences = component.querySelector('.map_references')
    if (mapReferences) {
      mapReferences.remove()
    }
  } else if (checkboxContainer) {
    // Normal mode — populate the checkboxes from the API

    // Clear the placeholder checkboxes that were in the Webflow template
    checkboxContainer.innerHTML = ''

    for (var i = 0; i < designationTypes.length; i++) {
      var type = designationTypes[i] // e.g. "cancer_care"
      var label = getDesignationLabel(type) // e.g. "Cancer Care"

      // Build the checkbox wrapper (same HTML structure as the Webflow template)
      var wrapper = document.createElement('div')
      wrapper.className = 'multi-step_checkbox-wrapper'

      var checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.name = 'designations'
      checkbox.id = 'designation-' + type // e.g. "designation-screening"
      checkbox.value = type // e.g. "screening"
      checkbox.className = 'multi-step_checkbox_icon'
      checkbox.checked = true

      var labelEl = document.createElement('label')
      labelEl.htmlFor = checkbox.id
      labelEl.className = 'form_field-label'
      labelEl.textContent = label

      wrapper.appendChild(checkbox)
      wrapper.appendChild(labelEl)
      checkboxContainer.appendChild(wrapper)

      // Re-render the map and list whenever a checkbox is toggled
      checkbox.addEventListener('change', applyAllFilters)
    }
    console.log('[COE] Checkboxes created for:', designationTypes)
  }

  // --------------------------------------------------------------------------
  // 8. TRANSFORM THE RAW DATA INTO PIN RECORDS
  // --------------------------------------------------------------------------

  var allPins = turnFacilitiesIntoPins(allFacilities)
  console.log('[COE] Pins created from facilities:', allPins.length, 'pins')

  // If screening-only mode is on, keep only pins that have a "screening" designation
  if (showOnlyScreening) {
    var screeningOnly = []
    for (var i = 0; i < allPins.length; i++) {
      if (allPins[i].designationTypes.indexOf('screening') !== -1) {
        screeningOnly.push(allPins[i])
      }
    }
    allPins = screeningOnly
    console.log('[COE] Screening-only filter applied:', allPins.length, 'pins remaining')
  }

  // --------------------------------------------------------------------------
  // 9. STATE — these variables are updated every time we re-render
  // --------------------------------------------------------------------------

  var currentMarkers = [] // Google Maps marker objects currently on the map
  var currentClusterer = null // the clustering engine that groups nearby markers
  var closeTimeout = null // timer for delayed info window close on mouseout
  var isInitialRender = true
  var currentPage = 1
  var currentFilteredPins = []

  // --------------------------------------------------------------------------
  // 10. RENDER FUNCTION — draws pins on the map and items in the list
  //     Called on first load and every time the user changes a filter.
  // --------------------------------------------------------------------------

  function renderCenters(pinsToShow) {
    console.log('[COE] Rendering', pinsToShow.length, 'centers')

    // Store filtered pins for pagination navigation
    currentFilteredPins = pinsToShow

    // ── Clear previous markers ──────────────────────────────────────────
    if (currentClusterer) {
      currentClusterer.clearMarkers()
      currentClusterer = null
    }
    for (var i = 0; i < currentMarkers.length; i++) {
      currentMarkers[i].setMap(null)
    }
    currentMarkers = []

    // ── Render the list (paginated) ─────────────────────────────────────
    renderListPage()

    if (pinsToShow.length === 0) {
      return
    }

    // ── Create ALL map markers (not paginated) ──────────────────────────
    var bounds = new google.maps.LatLngBounds()

    for (var i = 0; i < pinsToShow.length; i++) {
      var pin = pinsToShow[i]
      var position = { lat: pin.lat, lng: pin.lng }

      var marker = new google.maps.Marker({
        position: position,
        icon: defaultIcon,
        map: null,
      })

      marker.addListener('mouseover', createMarkerClickHandler(marker, pin))
      marker.addListener('mouseout', function () {
        closeTimeout = setTimeout(function () {
          infoWindow.close()
        }, 300)
      })

      currentMarkers.push(marker)
      bounds.extend(position)
    }

    // ── Set up clustering ───────────────────────────────────────────────
    currentClusterer = new MarkerClusterer({
      map: map,
      markers: currentMarkers,
      renderer: { render: renderCluster },
      algorithm: new SuperClusterAlgorithm({ radius: CLUSTER_RADIUS }),
    })

    // ── Adjust the map view to show all pins ────────────────────────────
    if (isInitialRender) {
      map.setCenter({ lat: STARTING_LAT, lng: STARTING_LNG })
      map.setZoom(STARTING_ZOOM)
      isInitialRender = false
    } else if (currentMarkers.length > 1) {
      map.fitBounds(bounds)
    } else if (currentMarkers.length === 1) {
      map.setCenter(currentMarkers[0].getPosition())
      map.setZoom(CLICK_ZOOM)
    }
  }

  // --------------------------------------------------------------------------
  // 10b. RENDER LIST PAGE (only the current page of items)
  // --------------------------------------------------------------------------

  function renderListPage() {
    centersList.innerHTML = ''
    if (paginationContainer) paginationContainer.innerHTML = ''

    if (currentFilteredPins.length === 0) {
      centersList.innerHTML = '<p style="padding:1rem;color:#666;">No centers match your search.</p>'
      return
    }

    var totalPages = Math.ceil(currentFilteredPins.length / ITEMS_PER_PAGE)

    // Clamp current page
    if (currentPage > totalPages) currentPage = totalPages
    if (currentPage < 1) currentPage = 1

    var startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    var endIndex = startIndex + ITEMS_PER_PAGE
    if (endIndex > currentFilteredPins.length) endIndex = currentFilteredPins.length

    // ── Render the page's list items ──────────────────────────────────────
    for (var i = startIndex; i < endIndex; i++) {
      var pin = currentFilteredPins[i]

      var listItem = listItemTemplate.cloneNode(true)
      listItem.dataset.id = pin.fid

      var iconElement = listItem.querySelector('[data-center="icon"]')
      if (iconElement) {
        iconElement.src = defaultIcon.url
        iconElement.alt = 'Map pin'
      }

      var imageElement = listItem.querySelector('[data-center="image"]')
      if (imageElement) {
        if (pin.imageUrl) {
          imageElement.src = pin.imageUrl
          imageElement.alt = pin.name
        } else {
          imageElement.remove()
        }
      }

      var nameElement = listItem.querySelector('[data-custom="center-name"]')
      if (nameElement) nameElement.textContent = pin.name

      var typeElement = listItem.querySelector('[data-custom="center-type"]')
      if (typeElement) {
        var labels = []
        for (var d = 0; d < pin.designationTypes.length; d++) {
          labels.push(getDesignationLabel(pin.designationTypes[d]))
        }
        typeElement.textContent = labels.join(', ')
      }

      var addressElement = listItem.querySelector('[data-custom="center-address"]')
      if (addressElement) addressElement.textContent = pin.streetAddress

      var cityStateElement = listItem.querySelector('[data-custom="center-city-state"]')
      if (cityStateElement) {
        cityStateElement.textContent = [pin.city, pin.state].filter(Boolean).join(', ')
      }

      var phoneLink = listItem.querySelector('[data-centers="phone"]')
      if (phoneLink) {
        if (pin.phone) {
          phoneLink.textContent = pin.phone
          phoneLink.href = 'tel:' + pin.phone.replace(/[^+\d]/g, '')
        } else {
          if (phoneLink.parentElement) {
            phoneLink.parentElement.remove()
          }
        }
      }

      var websiteLink = listItem.querySelector('[data-center="website"]')
      if (websiteLink) {
        if (pin.website) {
          websiteLink.href = pin.website
        } else {
          websiteLink.remove()
        }
      }

      var directionsLink = listItem.querySelector('[data-centers="directions"]')
      if (directionsLink) {
        directionsLink.href =
          'https://www.google.com/maps/dir/?api=1&destination=' + pin.lat + ',' + pin.lng + '&travelmode=driving'
      }

      listItem.addEventListener('click', createListItemClickHandler(pin))
      centersList.appendChild(listItem)
    }

    // ── Render pagination controls into dedicated container ───────────────
    if (totalPages > 1 && paginationContainer) {
      buildPaginationControls(paginationContainer, totalPages)
    }
  }

  // --------------------------------------------------------------------------
  // 10c. PAGINATION CONTROLS
  // --------------------------------------------------------------------------

  function buildPaginationControls(container, totalPages) {
    container.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:4px;padding:12px 8px;'

    // ── Prev arrow ──
    var prevBtn = document.createElement('button')
    prevBtn.textContent = '\u2039'
    prevBtn.disabled = currentPage === 1
    prevBtn.style.cssText = paginationButtonStyle(false, prevBtn.disabled)
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) {
        currentPage--
        renderListPage()
        centersList.scrollTop = 0
      }
    })
    container.appendChild(prevBtn)

    // ── Page number buttons (max 3: prev sibling, current, next sibling) ──
    var pages = getPageNumbers(currentPage, totalPages, 3)
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i]
      if (page === '...') {
        var ellipsis = document.createElement('span')
        ellipsis.textContent = '...'
        ellipsis.style.cssText = 'padding:0 4px;color:#666;font-size:14px;user-select:none;'
        container.appendChild(ellipsis)
      } else {
        var pageBtn = document.createElement('button')
        pageBtn.textContent = page
        var isActive = page === currentPage
        pageBtn.style.cssText = paginationButtonStyle(isActive, false)
        pageBtn.addEventListener('click', createPageClickHandler(page))
        container.appendChild(pageBtn)
      }
    }

    // ── Next arrow ──
    var nextBtn = document.createElement('button')
    nextBtn.textContent = '\u203A'
    nextBtn.disabled = currentPage === totalPages
    nextBtn.style.cssText = paginationButtonStyle(false, nextBtn.disabled)
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages) {
        currentPage++
        renderListPage()
        centersList.scrollTop = 0
      }
    })
    container.appendChild(nextBtn)
  }

  function createPageClickHandler(page) {
    return function () {
      currentPage = page
      renderListPage()
      centersList.scrollTop = 0
    }
  }

  function paginationButtonStyle(isActive, isDisabled) {
    var base =
      'min-width:32px;height:32px;border:1px solid #ddd;border-radius:4px;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0 6px;'
    if (isActive) return base + 'background:#2c3495;color:#fff;border-color:#2c3495;font-weight:700;'
    if (isDisabled) return base + 'background:#f5f5f5;color:#ccc;cursor:default;'
    return base + 'background:#fff;color:#333;'
  }

  function getPageNumbers(current, total, maxButtons) {
    if (total <= maxButtons) {
      var arr = []
      for (var i = 1; i <= total; i++) arr.push(i)
      return arr
    }

    var pages = []
    var half = Math.floor(maxButtons / 2)
    var start = current - half
    var end = current + half

    if (start < 1) {
      end += 1 - start
      start = 1
    }
    if (end > total) {
      start -= end - total
      end = total
    }
    if (start < 1) start = 1

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }
    for (var i = start; i <= end; i++) {
      pages.push(i)
    }
    if (end < total) {
      if (end < total - 1) pages.push('...')
      pages.push(total)
    }

    return pages
  }

  // --------------------------------------------------------------------------
  // 11. BUILD INFO WINDOW ELEMENT
  //     Creates a popup element for the map by cloning the list item template.
  // --------------------------------------------------------------------------

  function buildInfoWindowElement(pin) {
    var item = listItemTemplate.cloneNode(true)
    item.style.maxWidth = '18.5rem'

    var iconElement = item.querySelector('[data-center="icon"]')
    if (iconElement) {
      iconElement.src = defaultIcon.url
      iconElement.alt = 'Map pin'
    }

    var imageElement = item.querySelector('[data-center="image"]')
    if (imageElement) {
      if (pin.imageUrl) {
        imageElement.src = pin.imageUrl
        imageElement.alt = pin.name
        imageElement.style.maxHeight = '8rem'
        imageElement.style.objectFit = 'cover'
      } else {
        imageElement.remove()
      }
    }

    var nameElement = item.querySelector('[data-custom="center-name"]')
    if (nameElement) nameElement.textContent = pin.name

    var typeElement = item.querySelector('[data-custom="center-type"]')
    if (typeElement) {
      var labels = []
      for (var d = 0; d < pin.designationTypes.length; d++) {
        labels.push(getDesignationLabel(pin.designationTypes[d]))
      }
      typeElement.textContent = labels.join(', ')
    }

    var addressElement = item.querySelector('[data-custom="center-address"]')
    if (addressElement) addressElement.textContent = pin.streetAddress

    var cityStateElement = item.querySelector('[data-custom="center-city-state"]')
    if (cityStateElement) {
      cityStateElement.textContent = [pin.city, pin.state].filter(Boolean).join(', ')
    }

    var phoneLink = item.querySelector('[data-centers="phone"]')
    if (phoneLink) {
      if (pin.phone) {
        phoneLink.textContent = pin.phone
        phoneLink.href = 'tel:' + pin.phone.replace(/[^+\d]/g, '')
      } else {
        if (phoneLink.parentElement) {
          phoneLink.parentElement.remove()
        }
      }
    }

    var websiteLink = item.querySelector('[data-center="website"]')
    if (websiteLink) {
      if (pin.website) {
        websiteLink.href = pin.website
      } else {
        websiteLink.remove()
      }
    }

    var directionsLink = item.querySelector('[data-centers="directions"]')
    if (directionsLink) {
      directionsLink.href =
        'https://www.google.com/maps/dir/?api=1&destination=' + pin.lat + ',' + pin.lng + '&travelmode=driving'
    }

    return item
  }

  // --------------------------------------------------------------------------
  // 12. CLICK HANDLERS
  //     These are separate functions because creating functions inside a loop
  //     can cause bugs where all items share the same variable values.
  // --------------------------------------------------------------------------

  function createListItemClickHandler(pin) {
    return function () {
      map.setCenter({ lat: pin.lat, lng: pin.lng })
      map.setZoom(CLICK_ZOOM)

      // Find the matching marker on the map and open its popup
      for (var i = 0; i < currentMarkers.length; i++) {
        var markerPosition = currentMarkers[i].getPosition()
        if (markerPosition.lat() === pin.lat && markerPosition.lng() === pin.lng) {
          infoWindow.setContent(buildInfoWindowElement(pin))
          infoWindow.open(map, currentMarkers[i])
          break
        }
      }
    }
  }

  function createMarkerClickHandler(marker, pin) {
    return function () {
      clearTimeout(closeTimeout)
      infoWindow.setContent(buildInfoWindowElement(pin))
      infoWindow.open(map, marker)
    }
  }

  // --------------------------------------------------------------------------
  // 12. CLUSTER RENDERER
  //     This function is called by MarkerClusterer to draw each cluster bubble.
  // --------------------------------------------------------------------------

  function renderCluster(clusterData) {
    var count = clusterData.count
    var position = clusterData.position
    var icon = createClusterIcon(count)
    return new google.maps.Marker({
      position: position,
      icon: icon,
      zIndex: 1000 + count,
    })
  }

  // --------------------------------------------------------------------------
  // 13. FILTER LOGIC
  //     This single function handles BOTH the zip code filter AND the
  //     designation checkbox filter. It runs whenever either one changes.
  //     When no checkboxes are checked, all designation types are shown.
  // --------------------------------------------------------------------------

  function applyAllFilters() {
    currentPage = 1
    var filteredPins = allPins
    console.log('[COE] Applying filters... (starting with', allPins.length, 'total pins)')

    // ── Step 1: Filter by zip code ──────────────────────────────────────
    var typedZip = zipInput.value.trim()

    if (typedZip !== '') {
      var zipMatches = []
      for (var i = 0; i < filteredPins.length; i++) {
        if (String(filteredPins[i].zip).startsWith(typedZip)) {
          zipMatches.push(filteredPins[i])
        }
      }
      filteredPins = zipMatches
      console.log('[COE] Zip filter "' + typedZip + '":', filteredPins.length, 'matches')
    }

    // ── Step 2: Filter by designation checkboxes ────────────────────────
    // In screening-only mode the checkboxes were removed, so skip this step.
    if (showOnlyScreening) {
      console.log('[COE] Designation filter skipped (screening-only mode)')
    }

    // Find which checkboxes are currently checked
    var selectedTypes = []
    if (!showOnlyScreening && checkboxContainer) {
      var checkedBoxes = checkboxContainer.querySelectorAll('input[name="designations"]:checked')
      for (var i = 0; i < checkedBoxes.length; i++) {
        selectedTypes.push(checkedBoxes[i].value)
      }
      console.log(
        '[COE] Designation filter — checked types:',
        selectedTypes.length > 0 ? selectedTypes : '(none — showing all)'
      )
    }

    // If no checkboxes are checked, show no results.
    // Otherwise filter to only the selected designation types.
    if (!showOnlyScreening && selectedTypes.length === 0) {
      filteredPins = []
      console.log('[COE] No designations selected — showing no results')
    } else if (selectedTypes.length > 0) {
      var designationMatches = []
      for (var i = 0; i < filteredPins.length; i++) {
        var pin = filteredPins[i]

        // Check if this pin has ANY of the selected designation types
        var pinMatchesFilter = false
        for (var j = 0; j < selectedTypes.length; j++) {
          if (pin.designationTypes.indexOf(selectedTypes[j]) !== -1) {
            pinMatchesFilter = true
            break
          }
        }

        if (pinMatchesFilter) {
          designationMatches.push(pin)
        }
      }
      filteredPins = designationMatches
      console.log('[COE] Designation filter result:', filteredPins.length, 'matches')
    }

    // ── Step 3: Render the filtered results ─────────────────────────────
    console.log('[COE] Final filtered count:', filteredPins.length, 'pins to render')
    renderCenters(filteredPins)
  }

  // --------------------------------------------------------------------------
  // 14. START EVERYTHING
  // --------------------------------------------------------------------------

  // Clean up: remove the template element from the page BEFORE initial render
  // so it doesn't get confused with rendered list items
  var templateElement = document.querySelector('[data-centers="list-item"]')
  if (templateElement) {
    templateElement.remove()
  }

  // Draw all centers on first load
  console.log('[COE] Initial render with', allPins.length, 'total pins')
  renderCenters(allPins)

  // Prevent Enter key from triggering form submission on the zip field
  zipInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  })

  // Re-render whenever the user types in the zip field
  zipInput.addEventListener('input', applyAllFilters)

  // (Checkbox listeners were already added in step 7 when we created them)

  console.log('[COE] Component ready!')
}
