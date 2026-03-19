import { s as setOptions, i as importLibrary, M as MarkerClusterer, S as SuperClusterAlgorithm } from './index.esm-Cx65cC6w.js';

// centers-all.js
//
// This component fetches ALL facility data (COE, NCI, COC) from the normalized
// /centers endpoint, then draws pins on a Google Map and renders a scrollable
// list of centers next to it. Users can filter by zip code and/or category
// dropdown (All, GO2 designated, NCI designated, COC).


// =============================================================================
// SETTINGS — edit these values to configure the map
// =============================================================================

// Where to fetch the list of facilities from (normalized, all categories)
var API_URL = 'https://go2-worker.nahuel-eba.workers.dev/centers/pins';

// Google Maps API key
var GOOGLE_MAPS_API_KEY = 'AIzaSyDzjnzJImLe2q2uc8ziZYmQVPrI9TDukww';

// Where the map is centered when it first loads (lat/lng of central US)
var STARTING_LAT = 37.5;
var STARTING_LNG = -95.7;

// How far zoomed in/out the map starts (lower = more zoomed out)
var STARTING_ZOOM = 4;

// How far to zoom in when a user clicks on a center
var CLICK_ZOOM = 14;

// How close pins need to be (in pixels) before they merge into a cluster
var CLUSTER_RADIUS = 60;

// How many list items to show per page (pagination)
var ITEMS_PER_PAGE = 3;

// -----------------------------------------------------------------------------
// PIN IMAGES — each pin type has its own image, size, and anchor point.
// -----------------------------------------------------------------------------

var COE_PIN = {
  imageUrl: 'https://cdn.prod.website-files.com/685abc7fe66bf3b67a6af38e/69a5829ede217c58b6303bb4_pin-coe-1.png',
  size: [52, 52],
  anchor: [26, 52],
};

var NCI_PIN = {
  imageUrl: 'https://cdn.prod.website-files.com/685abc7fe66bf3b67a6af38e/699cbe556ade1b088be0322b_pin-nci.png',
  size: [32, 32],
  anchor: [16, 32],
};

var COC_PIN = {
  imageUrl: 'https://cdn.prod.website-files.com/685abc7fe66bf3b67a6af38e/699cbe5541e827aa53093410_pin-coc.png',
  size: [32, 32],
  anchor: [16, 32],
};

// Maps the select dropdown values to the API category field
var CATEGORY_MAP = {
  'GO2 designated': 'COE',
  'NCI designated': 'NCI',
  COC: 'COC',
};

// Human-readable labels for categories
var CATEGORY_LABELS = {
  COE: 'GO2 Center of Excellence',
  NCI: 'NCI Cancer Center',
  COC: 'COC Accredited',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

var NEARBY_RADIUS_MILES = 50;
var MAX_SEARCH_ZOOM = 13;

function haversineDistance(lat1, lng1, lat2, lng2) {
  var R = 3959;
  var dLat = ((lat2 - lat1) * Math.PI) / 180;
  var dLng = ((lng2 - lng1) * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c
}

var geocoder = null;

async function geocodeInput(input) {
  if (!geocoder) geocoder = new google.maps.Geocoder();
  return new Promise(function (resolve) {
    geocoder.geocode({ address: input }, function (results, status) {
      if (status === 'OK' && results.length > 0) {
        var result = results[0];
        var location = result.geometry.location;
        var city = '',
          state = '';
        for (var i = 0; i < result.address_components.length; i++) {
          var comp = result.address_components[i];
          if (comp.types.indexOf('locality') !== -1) city = comp.long_name;
          if (comp.types.indexOf('administrative_area_level_1') !== -1) state = comp.short_name;
        }
        resolve({ lat: location.lat(), lng: location.lng(), city: city, state: state, placeId: result.place_id });
      } else {
        resolve(null);
      }
    });
  })
}

function createGoogleMapsIcon(pinConfig) {
  return {
    url: pinConfig.imageUrl,
    scaledSize: new google.maps.Size(pinConfig.size[0], pinConfig.size[1]),
    anchor: new google.maps.Point(pinConfig.anchor[0], pinConfig.anchor[1]),
  }
}

function createAdvancedPin(category) {
  return new google.maps.marker.PinElement({
    background: category === 'COE' ? '#BBCB32' : category === 'NCI' ? '#835A91' : '#235189',
    borderColor: '#FFFFFF',
    glyphColor: '#FFFFFF',
    scale: category === 'COE' ? 1.5 : 1.0,
  })
}

function createClusterSvg(count) {
  var numberOfDigits = String(count).length;
  var bubbleSize = 36;
  if (numberOfDigits === 2) bubbleSize = 40;
  if (numberOfDigits > 2) bubbleSize = 48;

  var center = bubbleSize / 2;
  var radius = center - 2;

  return (
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
  )
}

/**
 * Takes the normalized facility data from the API and turns each facility into
 * a simple "pin" object with just the fields we need for the map and list.
 * The normalized endpoint returns: name, address, city, state, zip, phone,
 * website, lat, lng, category.
 */
function turnFacilitiesIntoPins(facilities) {
  var allPins = [];

  for (var i = 0; i < facilities.length; i++) {
    var facility = facilities[i];

    var lat = parseFloat(facility.lat);
    var lng = parseFloat(facility.lng);

    // Skip if the coordinates are not valid numbers
    if (isNaN(lat) || isNaN(lng)) {
      continue
    }

    allPins.push({
      name: facility.name,
      lat: lat,
      lng: lng,
      address: facility.address || '',
      city: facility.city || '',
      state: facility.state || '',
      zip: facility.zip || '',
      phone: facility.phone || '',
      website: facility.website || '',
      imageUrl: facility.image_url || '',
      category: facility.category || '',
    });
  }

  return allPins
}

// =============================================================================
// MAIN — this function runs when the component loads on the page
// =============================================================================

function reorderMobileLayout(component) {
  var filters = component.querySelector('.map_filters');
  if (!filters) return

  var mapRight = component.querySelector('.map_right');

  function reorder() {
    if (window.innerWidth <= 991) {
      component.insertBefore(filters, component.firstChild);
    } else if (mapRight) {
      mapRight.insertBefore(filters, mapRight.firstChild);
    }
  }

  reorder();
  window.addEventListener('resize', reorder);
}

async function centersAll (component) {
  console.log('[ALL] Component initializing...');

  reorderMobileLayout(component);

  // --------------------------------------------------------------------------
  // 1. FIND THE HTML ELEMENTS WE NEED
  // --------------------------------------------------------------------------

  var centersList = component.querySelector("[data-centers='list']");
  var mapContainer = component.querySelector("[data-centers='map']");
  var zipInput = component.querySelector("[data-custom='centers-zip-field']");
  var categorySelect = component.querySelector('[data-centers="categories-select"]');
  var paginationContainer = component.querySelector('[data-centers="pagination"]');
  var listItemTemplate = document.querySelector('[data-centers="list-item"]').cloneNode(true);

  console.log('[ALL] DOM elements found:', {
    centersList: !!centersList,
    mapContainer: !!mapContainer,
    zipInput: !!zipInput,
    categorySelect: !!categorySelect,
    paginationContainer: !!paginationContainer,
    listItemTemplate: !!listItemTemplate,
  });

  // Show a loading message while data is being fetched
  centersList.innerHTML = '<p style="padding:1rem;color:#666;">Loading centers...</p>';

  // Prevent all form submissions within this component and disable Webflow form handling
  var forms = component.querySelectorAll('form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', function (e) {
      e.preventDefault();
    });
    forms[i].removeAttribute('data-wf-page-id');
    forms[i].removeAttribute('data-wf-element-id');
    forms[i].removeAttribute('data-name');
    forms[i].removeAttribute('action');
  }
  var formMessages = component.querySelectorAll('.w-form-done, .w-form-fail');
  for (var i = 0; i < formMessages.length; i++) {
    formMessages[i].remove();
  }

  // --------------------------------------------------------------------------
  // 2. LOAD THE GOOGLE MAPS LIBRARY
  // --------------------------------------------------------------------------

  try {
    setOptions({ key: GOOGLE_MAPS_API_KEY, v: 'weekly' });
    await importLibrary('maps');
    await importLibrary('marker');
    console.log('[ALL] Google Maps loaded successfully');
  } catch (error) {
    console.error('Google Maps failed to load:', error);
    mapContainer.innerHTML =
      '<p style="padding:1rem;color:red;">Failed to load Google Maps. Please try again later.</p>';
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
    mapId: '883ace1c7764e279269aed54',
  });

  // --------------------------------------------------------------------------
  // 4. PREPARE THE PIN ICONS
  // --------------------------------------------------------------------------

  var coeIcon = createGoogleMapsIcon(COE_PIN);
  var nciIcon = createGoogleMapsIcon(NCI_PIN);
  var cocIcon = createGoogleMapsIcon(COC_PIN);

  function getIconForCategory(category) {
    if (category === 'COE') return coeIcon
    if (category === 'NCI') return nciIcon
    if (category === 'COC') return cocIcon
    return coeIcon // fallback
  }

  // --------------------------------------------------------------------------
  // 5. CREATE A SHARED INFO WINDOW
  // --------------------------------------------------------------------------

  var infoWindow = new google.maps.InfoWindow({ disableAutoPan: true });

  var infoWindowStyle = document.createElement('style');
  infoWindowStyle.textContent =
    '.gm-style-iw { background: none !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; max-width: none !important; }' +
    '.gm-style-iw-d { overflow: auto !important; padding: 0 !important; max-width: none !important; }' +
    '.gm-style-iw-tc { display: none !important; }' +
    '.gm-ui-hover-effect { display: none !important; }';
  document.head.appendChild(infoWindowStyle);

  infoWindow.addListener('domready', function () {
    var iwContent = document.querySelector('.gm-style-iw');
    if (iwContent) {
      iwContent.onmouseover = function () {
        clearTimeout(closeTimeout);
      };
      iwContent.onmouseout = function () {
        closeTimeout = setTimeout(function () {
          infoWindow.close();
        }, 300);
      };
    }
  });

  // --------------------------------------------------------------------------
  // 6. FETCH DATA
  // --------------------------------------------------------------------------

  var allFacilities = [];

  try {
    var response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Facilities HTTP ' + response.status)
    }
    var data = await response.json();
    allFacilities = data.pins || [];
    console.log('[ALL] Facilities fetched:', allFacilities.length, 'facilities');
  } catch (error) {
    console.error('Error fetching data:', error);
    centersList.innerHTML = '<p style="padding:1rem;color:red;">Failed to load centers. Please try again later.</p>';
    return
  }

  // --------------------------------------------------------------------------
  // 7. TRANSFORM THE RAW DATA INTO PIN RECORDS
  // --------------------------------------------------------------------------

  var allPins = turnFacilitiesIntoPins(allFacilities);
  console.log('[ALL] Pins created from facilities:', allPins.length, 'pins');

  // --------------------------------------------------------------------------
  // 8. STATE
  // --------------------------------------------------------------------------

  var currentMarkers = [];
  var currentClusterer = null;
  var closeTimeout = null;
  var isInitialRender = true;
  var currentPage = 1;
  var currentFilteredPins = [];
  var searchLocation = null;
  var searchLocationMarker = null;
  var searchNearbyCount = 0;
  var debounceTimer = null;
  var postalCodeLayer = null;
  var searchMessage = component.querySelector('[data-centers="search-message"]');
  console.log('[ALL] searchMessage element found:', !!searchMessage, searchMessage);
  if (searchMessage) searchMessage.style.display = 'none';

  // --------------------------------------------------------------------------
  // 9. RENDER FUNCTION
  // --------------------------------------------------------------------------

  function renderCenters(pinsToShow) {
    console.log('[ALL] Rendering', pinsToShow.length, 'centers');

    // Store filtered pins for pagination navigation
    currentFilteredPins = pinsToShow;

    // ── Clear previous markers ──────────────────────────────────────────
    if (currentClusterer) {
      currentClusterer.clearMarkers();
      currentClusterer = null;
    }
    for (var i = 0; i < currentMarkers.length; i++) {
      currentMarkers[i].map = null;
    }
    currentMarkers = [];
    if (searchLocationMarker) {
      searchLocationMarker.map = null;
      searchLocationMarker = null;
    }

    // ── Render the list (paginated) ─────────────────────────────────────
    renderListPage();

    // ── Update search message ───────────────────────────────────────────
    console.log(
      '[ALL] Search message update — searchMessage:',
      !!searchMessage,
      'searchLocation:',
      searchLocation,
      'pinsToShow.length:',
      pinsToShow.length,
      'searchNearbyCount:',
      searchNearbyCount
    );
    if (searchMessage) {
      if (searchLocation && pinsToShow.length > 0) {
        var locationLabel = searchLocation.city + ', ' + searchLocation.state;
        if (searchNearbyCount > 0) {
          searchMessage.textContent =
            pinsToShow.length + ' center' + (pinsToShow.length !== 1 ? 's' : '') + ' near ' + locationLabel;
        } else {
          var miles = Math.round(pinsToShow[0]._distance);
          searchMessage.textContent = 'Nearest center: ' + miles + ' miles from ' + locationLabel;
        }
        console.log('[ALL] Search message SHOWN:', searchMessage.textContent);
        searchMessage.style.display = '';
      } else {
        console.log('[ALL] Search message HIDDEN (no searchLocation or no pins)');
        searchMessage.style.display = 'none';
      }
    }

    if (pinsToShow.length === 0) {
      return
    }

    // ── Create ALL map markers (not paginated) ──────────────────────────
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < pinsToShow.length; i++) {
      var pin = pinsToShow[i];
      var position = { lat: pin.lat, lng: pin.lng };

      var collisionBehavior;
      if (pin.category === 'COE') {
        collisionBehavior = google.maps.CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL;
      } else {
        collisionBehavior = google.maps.CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY;
      }

      var marker = new google.maps.marker.AdvancedMarkerElement({
        position: position,
        map: null,
        content: createAdvancedPin(pin.category),
        collisionBehavior: collisionBehavior,
        zIndex: pin.category === 'COE' ? 1000 : pin.category === 'NCI' ? 500 : 100,
      });

      marker.element.addEventListener('mouseenter', createMarkerClickHandler(marker, pin));
      marker.element.addEventListener('mouseleave', function () {
        closeTimeout = setTimeout(function () {
          infoWindow.close();
        }, 300);
      });

      currentMarkers.push(marker);
      bounds.extend(position);
    }

    // ── Set up clustering ───────────────────────────────────────────────
    currentClusterer = new MarkerClusterer({
      map: map,
      markers: currentMarkers,
      renderer: { render: renderCluster },
      algorithm: new SuperClusterAlgorithm({ radius: CLUSTER_RADIUS, minPoints: 3 }),
    });

    // ── Show or hide the search location marker ─────────────────────────
    if (searchLocationMarker) {
      searchLocationMarker.map = null;
      searchLocationMarker = null;
    }

    if (searchLocation) {
      var searchDot = document.createElement('div');
      searchDot.style.cssText =
        'width:20px;height:20px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);';

      searchLocationMarker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: searchLocation.lat, lng: searchLocation.lng },
        map: map,
        content: searchDot,
        zIndex: 9999,
        title: 'Your search location',
      });

      bounds.extend({ lat: searchLocation.lat, lng: searchLocation.lng });
    }

    // ── Adjust the map view to show all pins ────────────────────────────
    if (isInitialRender) {
      map.setCenter({ lat: STARTING_LAT, lng: STARTING_LNG });
      map.setZoom(STARTING_ZOOM);
      isInitialRender = false;
    } else if (searchLocation) {
      map.fitBounds(bounds, { padding: 50 });
      google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
        if (map.getZoom() > MAX_SEARCH_ZOOM) {
          map.setZoom(MAX_SEARCH_ZOOM);
        }
      });
    } else if (currentMarkers.length > 1) {
      map.fitBounds(bounds);
    } else if (currentMarkers.length === 1) {
      map.setCenter(currentMarkers[0].position);
      map.setZoom(CLICK_ZOOM);
    }
  }

  // --------------------------------------------------------------------------
  // 9b. RENDER LIST PAGE (only the current page of items)
  // --------------------------------------------------------------------------

  function renderListPage() {
    centersList.innerHTML = '';
    if (paginationContainer) paginationContainer.innerHTML = '';

    if (currentFilteredPins.length === 0) {
      centersList.innerHTML = '<p style="padding:1rem;color:#666;">No centers match your search.</p>';
      return
    }

    var totalPages = Math.ceil(currentFilteredPins.length / ITEMS_PER_PAGE);

    // Clamp current page
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    var startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    var endIndex = startIndex + ITEMS_PER_PAGE;
    if (endIndex > currentFilteredPins.length) endIndex = currentFilteredPins.length;

    // ── Render the page's list items ──────────────────────────────────────
    for (var i = startIndex; i < endIndex; i++) {
      var pin = currentFilteredPins[i];
      var pinIcon = getIconForCategory(pin.category);

      var listItem = listItemTemplate.cloneNode(true);

      var iconElement = listItem.querySelector('[data-center="icon"]');
      if (iconElement) {
        iconElement.src = pinIcon.url;
        iconElement.alt = 'Map pin';
      }

      var imageElement = listItem.querySelector('[data-center="image"]');
      if (imageElement) {
        if (pin.imageUrl) {
          imageElement.src = pin.imageUrl;
          imageElement.alt = pin.name;
        } else {
          imageElement.remove();
        }
      }

      var nameElement = listItem.querySelector('[data-custom="center-name"]');
      if (nameElement) nameElement.textContent = pin.name;

      var typeElement = listItem.querySelector('[data-custom="center-type"]');
      if (typeElement) {
        typeElement.textContent = CATEGORY_LABELS[pin.category] || pin.category;
      }

      var addressElement = listItem.querySelector('[data-custom="center-address"]');
      if (addressElement) addressElement.textContent = pin.address;

      var cityStateElement = listItem.querySelector('[data-custom="center-city-state"]');
      if (cityStateElement) {
        cityStateElement.textContent = [pin.city, pin.state].filter(Boolean).join(', ');
      }

      var phoneLink = listItem.querySelector('[data-centers="phone"]');
      if (phoneLink) {
        if (pin.phone) {
          phoneLink.textContent = pin.phone;
          phoneLink.href = 'tel:' + pin.phone.replace(/[^+\d]/g, '');
        } else {
          if (phoneLink.parentElement) {
            phoneLink.parentElement.remove();
          }
        }
      }

      var websiteLink = listItem.querySelector('[data-center="website"]');
      if (websiteLink) {
        if (pin.website) {
          websiteLink.href = pin.website;
        } else {
          websiteLink.remove();
        }
      }

      var directionsLink = listItem.querySelector('[data-centers="directions"]');
      if (directionsLink) {
        directionsLink.href =
          'https://www.google.com/maps/dir/?api=1&destination=' + pin.lat + ',' + pin.lng + '&travelmode=driving';
      }

      listItem.addEventListener('click', createListItemClickHandler(pin));
      centersList.appendChild(listItem);
    }

    // ── Render pagination controls into dedicated container ───────────────
    if (totalPages > 1 && paginationContainer) {
      buildPaginationControls(paginationContainer, totalPages);
    }
  }

  // --------------------------------------------------------------------------
  // 9c. PAGINATION CONTROLS
  // --------------------------------------------------------------------------

  function buildPaginationControls(container, totalPages) {
    container.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:4px;padding:12px 8px;';

    // ── Prev arrow ──
    var prevBtn = document.createElement('button');
    prevBtn.textContent = '\u2039';
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.cssText = paginationButtonStyle(false, prevBtn.disabled);
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) {
        currentPage--;
        renderListPage();
        centersList.scrollTop = 0;
      }
    });
    container.appendChild(prevBtn);

    // ── Page number buttons (max 3: prev sibling, current, next sibling) ──
    var pages = getPageNumbers(currentPage, totalPages, 3);
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      if (page === '...') {
        var ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.cssText = 'padding:0 4px;color:#666;font-size:14px;user-select:none;';
        container.appendChild(ellipsis);
      } else {
        var pageBtn = document.createElement('button');
        pageBtn.textContent = page;
        var isActive = page === currentPage;
        pageBtn.style.cssText = paginationButtonStyle(isActive, false);
        pageBtn.addEventListener('click', createPageClickHandler(page));
        container.appendChild(pageBtn);
      }
    }

    // ── Next arrow ──
    var nextBtn = document.createElement('button');
    nextBtn.textContent = '\u203A';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.style.cssText = paginationButtonStyle(false, nextBtn.disabled);
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages) {
        currentPage++;
        renderListPage();
        centersList.scrollTop = 0;
      }
    });
    container.appendChild(nextBtn);
  }

  function createPageClickHandler(page) {
    return function () {
      currentPage = page;
      renderListPage();
      centersList.scrollTop = 0;
    }
  }

  function paginationButtonStyle(isActive, isDisabled) {
    var base =
      'min-width:32px;height:32px;border:1px solid #ddd;border-radius:4px;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0 6px;';
    if (isActive) return base + 'background:#2c3495;color:#fff;border-color:#2c3495;font-weight:700;'
    if (isDisabled) return base + 'background:#f5f5f5;color:#ccc;cursor:default;'
    return base + 'background:#fff;color:#333;'
  }

  /**
   * Returns an array of page numbers and '...' ellipses to display.
   * Always shows at most `maxButtons` numbered buttons.
   */
  function getPageNumbers(current, total, maxButtons) {
    if (total <= maxButtons) {
      var arr = [];
      for (var i = 1; i <= total; i++) arr.push(i);
      return arr
    }

    // Always include first and last page
    var pages = [];
    var half = Math.floor(maxButtons / 2);
    var start = current - half;
    var end = current + half;

    // Shift window if near edges
    if (start < 1) {
      end += 1 - start;
      start = 1;
    }
    if (end > total) {
      start -= end - total;
      end = total;
    }
    if (start < 1) start = 1;

    // Build the page list
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }
    for (var i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < total) {
      if (end < total - 1) pages.push('...');
      pages.push(total);
    }

    return pages
  }

  // --------------------------------------------------------------------------
  // 10. BUILD INFO WINDOW ELEMENT
  // --------------------------------------------------------------------------

  function buildInfoWindowElement(pin) {
    var item = listItemTemplate.cloneNode(true);
    item.style.maxWidth = '18.5rem';
    var pinIcon = getIconForCategory(pin.category);

    var iconElement = item.querySelector('[data-center="icon"]');
    if (iconElement) {
      iconElement.src = pinIcon.url;
      iconElement.alt = 'Map pin';
    }

    var imageElement = item.querySelector('[data-center="image"]');
    if (imageElement) {
      imageElement.remove();
    }

    var nameElement = item.querySelector('[data-custom="center-name"]');
    if (nameElement) nameElement.textContent = pin.name;

    var typeElement = item.querySelector('[data-custom="center-type"]');
    if (typeElement) {
      typeElement.textContent = CATEGORY_LABELS[pin.category] || pin.category;
    }

    var addressElement = item.querySelector('[data-custom="center-address"]');
    if (addressElement) addressElement.textContent = pin.address;

    var cityStateElement = item.querySelector('[data-custom="center-city-state"]');
    if (cityStateElement) {
      cityStateElement.textContent = [pin.city, pin.state].filter(Boolean).join(', ');
    }

    var phoneLink = item.querySelector('[data-centers="phone"]');
    if (phoneLink) {
      if (pin.phone) {
        phoneLink.textContent = pin.phone;
        phoneLink.href = 'tel:' + pin.phone.replace(/[^+\d]/g, '');
      } else {
        if (phoneLink.parentElement) {
          phoneLink.parentElement.remove();
        }
      }
    }

    var websiteLink = item.querySelector('[data-center="website"]');
    if (websiteLink) {
      if (pin.website) {
        websiteLink.href = pin.website;
      } else {
        websiteLink.remove();
      }
    }

    var directionsLink = item.querySelector('[data-centers="directions"]');
    if (directionsLink) {
      directionsLink.href =
        'https://www.google.com/maps/dir/?api=1&destination=' + pin.lat + ',' + pin.lng + '&travelmode=driving';
    }

    return item
  }

  // --------------------------------------------------------------------------
  // 11. CLICK HANDLERS
  // --------------------------------------------------------------------------

  function createListItemClickHandler(pin) {
    return function () {
      map.setCenter({ lat: pin.lat, lng: pin.lng });
      map.setZoom(CLICK_ZOOM);

      for (var i = 0; i < currentMarkers.length; i++) {
        var markerPosition = currentMarkers[i].position;
        if (markerPosition.lat === pin.lat && markerPosition.lng === pin.lng) {
          infoWindow.setContent(buildInfoWindowElement(pin));
          infoWindow.open({ map: map, anchor: currentMarkers[i] });
          break
        }
      }
    }
  }

  function createMarkerClickHandler(marker, pin) {
    return function () {
      clearTimeout(closeTimeout);
      infoWindow.setContent(buildInfoWindowElement(pin));
      infoWindow.open({ map: map, anchor: marker });
    }
  }

  // --------------------------------------------------------------------------
  // 12. CLUSTER RENDERER
  // --------------------------------------------------------------------------

  function renderCluster(clusterData) {
    var count = clusterData.count;
    var position = clusterData.position;
    var svg = createClusterSvg(count);

    var clusterElement = document.createElement('div');
    clusterElement.innerHTML = svg;
    clusterElement.style.cursor = 'pointer';

    return new google.maps.marker.AdvancedMarkerElement({
      position: position,
      content: clusterElement,
      zIndex: 1000 + count,
    })
  }

  // --------------------------------------------------------------------------
  // 13. FILTER LOGIC
  //     Handles both zip code filter AND category dropdown filter.
  // --------------------------------------------------------------------------

  async function applyAllFilters() {
    currentPage = 1;
    var filteredPins = allPins;
    console.log('[ALL] Applying filters... (starting with', allPins.length, 'total pins)');

    // ── Step 1: Filter by category dropdown ─────────────────────────────
    // Applied BEFORE zip/density search so the density-adaptive logic
    // only considers facilities of the selected category.
    if (categorySelect) {
      var selectedValue = categorySelect.value;
      var apiCategory = CATEGORY_MAP[selectedValue];

      if (apiCategory) {
        var categoryMatches = [];
        for (var i = 0; i < filteredPins.length; i++) {
          if (filteredPins[i].category === apiCategory) {
            categoryMatches.push(filteredPins[i]);
          }
        }
        filteredPins = categoryMatches;
        console.log(
          '[ALL] Category filter "' + selectedValue + '" (' + apiCategory + '):',
          filteredPins.length,
          'matches'
        );
      } else {
        console.log('[ALL] Category filter: showing all');
      }
    }

    // ── Step 2: Filter by search input (zip code or city/state) ────────
    var typedInput = zipInput.value.trim();

    console.log('[ALL] typedInput:', JSON.stringify(typedInput), 'length:', typedInput.length);

    if (typedInput.length >= 3) {
      // ── 3+ chars: geocode and distance-based search ──
      console.log('[ALL] Calling geocodeInput for:', typedInput);
      var geo = await geocodeInput(typedInput);
      console.log('[ALL] Geocode response:', geo);
      if (geo) {
        searchLocation = { lat: geo.lat, lng: geo.lng, city: geo.city, state: geo.state };

        // Show zip boundary outline if available
        if (geo.placeId && postalCodeLayer) {
          var searchedPlaceId = geo.placeId;
          postalCodeLayer.style = function (options) {
            if (options.feature.placeId === searchedPlaceId) {
              return { strokeColor: '#2c3495', strokeWeight: 2, fillOpacity: 0.05, fillColor: '#2c3495' }
            }
            return null
          };
        }

        for (var i = 0; i < filteredPins.length; i++) {
          filteredPins[i]._distance = haversineDistance(geo.lat, geo.lng, filteredPins[i].lat, filteredPins[i].lng);
        }

        filteredPins = filteredPins.slice().sort(function (a, b) {
          return a._distance - b._distance
        });

        var nearby = filteredPins.filter(function (p) {
          return p._distance <= NEARBY_RADIUS_MILES
        });
        searchNearbyCount = nearby.length;
        filteredPins = nearby.length > 0 ? nearby : [filteredPins[0]];
        console.log('[ALL] Distance search from', geo.city + ', ' + geo.state + ':', filteredPins.length, 'results');
      } else {
        searchLocation = null;
        if (postalCodeLayer) postalCodeLayer.style = null;
        filteredPins = [];
        console.log('[ALL] Geocode failed for:', typedInput);
      }
    } else if (typedInput.length > 0) {
      // ── 1-2 chars: too short, do nothing (keep all pins) ──
      searchLocation = null;
      if (postalCodeLayer) postalCodeLayer.style = null;
      console.log('[ALL] Input too short, showing all');
    } else {
      searchLocation = null;
      if (postalCodeLayer) postalCodeLayer.style = null;
    }

    // ── Step 3: Render the filtered results ─────────────────────────────
    console.log('[ALL] Final filtered count:', filteredPins.length, 'pins to render');
    renderCenters(filteredPins);
  }

  // --------------------------------------------------------------------------
  // 14. START EVERYTHING
  // --------------------------------------------------------------------------

  // Clean up: remove the template element from the page BEFORE initial render
  // so it doesn't get confused with rendered list items
  var templateElement = document.querySelector('[data-centers="list-item"]');
  if (templateElement) {
    templateElement.remove();
  }

  // Try to get the POSTAL_CODE feature layer for zip boundary outlines
  try {
    postalCodeLayer = map.getFeatureLayer('POSTAL_CODE');
  } catch (e) {
    console.log('[ALL] POSTAL_CODE feature layer not available:', e.message);
  }

  console.log('[ALL] Initial render with', allPins.length, 'total pins');
  renderCenters(allPins);

  // Prevent Enter key from triggering form submission on the zip field
  zipInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });

  // Re-render whenever the user types in the search field (debounced for geocode)
  zipInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    var val = zipInput.value.trim();
    console.log('[ALL] Search input changed:', JSON.stringify(val), 'length:', val.length);

    if (val.length >= 3) {
      console.log('[ALL] Debouncing geocode call for:', val);
      debounceTimer = setTimeout(function () {
        applyAllFilters();
      }, 500);
    } else if (val.length === 0) {
      applyAllFilters();
    }
  });

  // Re-render whenever the category dropdown changes
  if (categorySelect) {
    categorySelect.addEventListener('change', applyAllFilters);
  }

  console.log('[ALL] Component ready!');
}

export { centersAll as default };
//# sourceMappingURL=centers-all-CQbCaLGg.js.map
