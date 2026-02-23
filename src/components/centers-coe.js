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
var API_URL = 'https://go2-worker.nahuel-eba.workers.dev/centers'

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

// -----------------------------------------------------------------------------
// PIN IMAGES — each pin type has its own image, size, and anchor point.
//
// "size" is [width, height] in pixels — how big the pin appears on the map.
// "anchor" is [x, y] — which pixel of the image sits on the exact map
// coordinate. For a typical pin shape, use [width/2, height] so the bottom
// center of the image touches the location.
// -----------------------------------------------------------------------------

var COE_PIN = {
  imageUrl: 'https://cdn.prod.website-files.com/685abc7fe66bf3b67a6af38e/699cc04ab55333725658f5c0_pin-coe.png',
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
 * Builds the HTML that appears in the popup when you click a pin on the map.
 */
function buildInfoWindowHTML(pin) {
  var html = '<div style="max-width:240px;font-family:Arial,sans-serif;">'

  // Center name
  html += '<strong style="font-size:14px;">' + pin.name + '</strong>'

  // Address
  html += '<div style="font-size:13px;color:#444;margin:6px 0;">' + pin.address + '</div>'

  // Photo (if available)
  if (pin.imageUrl) {
    html +=
      '<img src="' +
      pin.imageUrl +
      '"' +
      ' alt="' +
      pin.name +
      '"' +
      ' style="width:100%;border-radius:4px;margin-bottom:6px;" />'
  }

  // Phone number (if available)
  if (pin.phone) {
    html += '<div><a href="tel:' + pin.phone + '" style="font-size:13px;">' + pin.phone + '</a></div>'
  }

  // Directions link
  var directionsUrl =
    'https://www.google.com/maps/dir/?api=1' + '&destination=' + pin.lat + ',' + pin.lng + '&travelmode=driving'

  html +=
    '<div style="margin-top:4px;">' +
    '<a href="' +
    directionsUrl +
    '" target="_blank" rel="noopener" style="font-size:13px;">' +
    'Get Directions</a></div>'

  html += '</div>'
  return html
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

      var lat, lng, address, phone, website

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

        phone = designation.overrides.phone || facility.phone
        website = designation.overrides.url || facility.website
      } else {
        // Use the facility's main address
        lat = parseFloat(facility.latitude)
        lng = parseFloat(facility.longitude)

        var mainAddr = facility.address || {}
        var mainParts = [mainAddr.line1, mainAddr.line2, mainAddr.city, mainAddr.state, mainAddr.zip]
        address = mainParts.filter(Boolean).join(', ')

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
        phone: location.phone,
        website: location.website,
        imageUrl: facility.image_url,
        zip: facilityAddr.zip || '',
        city: facilityAddr.city || '',
        state: facilityAddr.state || '',
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
    listItemTemplate: !!listItemTemplate,
  })
  console.log('[COE] Mode:', showOnlyScreening ? 'SCREENING-ONLY' : 'NORMAL (all designations)')

  // Show a loading message while data is being fetched
  centersList.innerHTML = '<p style="padding:1rem;color:#666;">Loading centers...</p>'

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

  var infoWindow = new google.maps.InfoWindow()

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
    allFacilities = facilitiesData.facilities || []
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
    var checkboxFilterWrapper = checkboxContainer.closest('.map_filters-right')
    console.log('[COE] Screening-only mode — removing checkbox wrapper:', !!checkboxFilterWrapper)
    if (checkboxFilterWrapper) {
      checkboxFilterWrapper.remove()
    }
  } else {
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

  // --------------------------------------------------------------------------
  // 10. RENDER FUNCTION — draws pins on the map and items in the list
  //     Called on first load and every time the user changes a filter.
  // --------------------------------------------------------------------------

  function renderCenters(pinsToShow) {
    console.log('[COE] Rendering', pinsToShow.length, 'centers')

    // Clear the old list
    centersList.innerHTML = ''

    // Remove old clusters and markers from the map
    if (currentClusterer) {
      currentClusterer.clearMarkers()
      currentClusterer = null
    }
    for (var i = 0; i < currentMarkers.length; i++) {
      currentMarkers[i].setMap(null)
    }
    currentMarkers = []

    // If there's nothing to show, display a message and stop
    if (pinsToShow.length === 0) {
      centersList.innerHTML = '<p style="padding:1rem;color:#666;">No centers match your search.</p>'
      return
    }

    // We'll use "bounds" to auto-zoom the map to fit all visible pins
    var bounds = new google.maps.LatLngBounds()

    for (var i = 0; i < pinsToShow.length; i++) {
      var pin = pinsToShow[i]

      // ── Create the list item ────────────────────────────────────────
      var listItem = listItemTemplate.cloneNode(true)
      listItem.dataset.id = pin.fid

      // Set the list item icon to match the map pin image
      var iconElement = listItem.querySelector('[data-center="icon"]')
      if (iconElement) {
        iconElement.src = defaultIcon.url
        iconElement.alt = 'Map pin'
      }

      var nameElement = listItem.querySelector('[data-custom="center-name"]')
      if (nameElement) nameElement.textContent = pin.name

      var cityElement = listItem.querySelector('[data-custom="center-city"]')
      if (cityElement) cityElement.textContent = pin.city

      var zipElement = listItem.querySelector('[data-custom="center-zip-code"]')
      if (zipElement) zipElement.textContent = pin.zip

      var websiteLink = listItem.querySelector('[data-centers="where"]')
      if (websiteLink) {
        if (pin.website) {
          websiteLink.href = pin.website
          // Show only the domain + TLD (e.g. "example.com" from "https://www.example.com/path")
          try {
            var hostname = new URL(pin.website).hostname // e.g. "www.example.com"
            // Remove "www." prefix if present
            if (hostname.indexOf('www.') === 0) {
              hostname = hostname.slice(4)
            }
            websiteLink.textContent = hostname
          } catch (e) {
            websiteLink.textContent = pin.website
          }
        } else {
          // Remove the website link if this center doesn't have one
          if (websiteLink.parentElement) {
            websiteLink.parentElement.remove()
          }
        }
      }

      // Show the designation types in the "Accreditations" field
      // e.g. "Screening, Cancer Care"
      var accreditationsElement = listItem.querySelector('[data-custom="center-accreditations"]')
      if (accreditationsElement) {
        var labels = []
        for (var d = 0; d < pin.designationTypes.length; d++) {
          labels.push(getDesignationLabel(pin.designationTypes[d]))
        }
        accreditationsElement.textContent = labels.join(', ')
      }

      // When a list item is clicked, zoom the map to that center and open its popup
      listItem.addEventListener('click', createListItemClickHandler(pin))

      centersList.appendChild(listItem)

      // ── Create the map marker ───────────────────────────────────────
      var position = { lat: pin.lat, lng: pin.lng }

      var marker = new google.maps.Marker({
        position: position,
        icon: defaultIcon,
        map: null, // the clusterer will add it to the map
      })

      // When a pin on the map is clicked, open its popup
      marker.addListener('click', createMarkerClickHandler(marker, pin))

      currentMarkers.push(marker)
      bounds.extend(position)
    }

    // ── Set up clustering ───────────────────────────────────────────────
    // This groups nearby pins into numbered bubbles when zoomed out
    currentClusterer = new MarkerClusterer({
      map: map,
      markers: currentMarkers,
      renderer: { render: renderCluster },
      algorithm: new SuperClusterAlgorithm({ radius: CLUSTER_RADIUS }),
    })

    // ── Adjust the map view to show all pins ────────────────────────────
    if (currentMarkers.length > 1) {
      map.fitBounds(bounds)
    } else if (currentMarkers.length === 1) {
      map.setCenter(currentMarkers[0].getPosition())
      map.setZoom(CLICK_ZOOM)
    }
  }

  // --------------------------------------------------------------------------
  // 11. CLICK HANDLERS
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
          infoWindow.setContent(buildInfoWindowHTML(pin))
          infoWindow.open(map, currentMarkers[i])
          break
        }
      }
    }
  }

  function createMarkerClickHandler(marker, pin) {
    return function () {
      infoWindow.setContent(buildInfoWindowHTML(pin))
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
    if (!showOnlyScreening) {
      var checkedBoxes = checkboxContainer.querySelectorAll('input[name="designations"]:checked')
      for (var i = 0; i < checkedBoxes.length; i++) {
        selectedTypes.push(checkedBoxes[i].value)
      }
      console.log(
        '[COE] Designation filter — checked types:',
        selectedTypes.length > 0 ? selectedTypes : '(none — showing all)'
      )
    }

    // Only filter if at least one checkbox is checked.
    // If none are checked, we show everything (no designation filter).
    if (selectedTypes.length > 0) {
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

  // Draw all centers on first load
  console.log('[COE] Initial render with', allPins.length, 'total pins')
  renderCenters(allPins)

  // Re-render whenever the user types in the zip field
  zipInput.addEventListener('input', applyAllFilters)

  // (Checkbox listeners were already added in step 7 when we created them)

  // Clean up: remove the template element from the page so it doesn't show
  var templateElement = document.querySelector('[data-centers="list-item"]')
  if (templateElement) {
    templateElement.remove()
  }

  console.log('[COE] Component ready!')
}
