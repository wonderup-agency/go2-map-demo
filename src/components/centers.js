// centers.js
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer'

// ─── Step 1: Configuration ──────────────────────────────────────────────────

const CONFIG = {
  API_URL: 'https://hcp.go2.org/wp-json/go2/v1/facilities?year=2025,2026&per_page=500',
  GOOGLE_MAPS_API_KEY: 'AIzaSyDzjnzJImLe2q2uc8ziZYmQVPrI9TDukww',
  DEFAULT_CENTER: { lat: 37.5, lng: -95.7 },
  DEFAULT_ZOOM: 4,
  CLICK_ZOOM: 14,
  CLUSTER_RADIUS: 60, // pixels — lower = pins must be closer to cluster, higher = clusters more aggressively
}

const DESIGNATION_TYPES = {
  screening: { label: 'Screening Center', color: '#BBCB32' },
  cancer_care: { label: 'Cancer Care Center', color: '#835A91' },
  ipn: { label: 'IPN Center', color: '#7AD1E5' },
  biomarker: { label: 'Biomarker Center', color: '#2c3495' },
}

// ─── Step 8: SVG marker icon builder ────────────────────────────────────────

function buildPinSvgUrl(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="16" r="7" fill="#fff"/>
  </svg>`
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

// ─── Step 9: Custom cluster renderer ────────────────────────────────────────

class CustomClusterRenderer {
  render({ count, position }) {
    const digits = String(count).length
    const size = digits > 2 ? 48 : digits === 2 ? 40 : 36
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#ffffff" stroke="#2c3495" stroke-width="3"/>
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central" fill="#2c3495" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="14">${count}</text>
    </svg>`
    const icon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    }
    return new google.maps.Marker({ position, icon, zIndex: 1000 + count })
  }
}

// ─── Step 7: Data transformation ────────────────────────────────────────────

function buildPinRecords(facilities) {
  const pins = []

  for (const f of facilities) {
    if (!f.designations || !f.designations.length) continue

    // Group designations by resolved lat/lng
    const locationMap = new Map()

    for (const des of f.designations) {
      const type = des.type
      if (!DESIGNATION_TYPES[type]) continue

      const hasOverrideAddress =
        des.overrides &&
        des.overrides.address &&
        des.overrides.address.latitude != null &&
        des.overrides.address.longitude != null

      let lat, lng, address, phone, website

      if (hasOverrideAddress) {
        const oa = des.overrides.address
        lat = parseFloat(oa.latitude)
        lng = parseFloat(oa.longitude)
        const parts = [oa.line1, oa.line2, oa.city, oa.state, oa.zip].filter(Boolean)
        address = parts.join(', ')
        phone = des.overrides.phone || f.phone
        website = des.overrides.url || f.website
      } else {
        lat = parseFloat(f.latitude)
        lng = parseFloat(f.longitude)
        const a = f.address || {}
        const parts = [a.line1, a.line2, a.city, a.state, a.zip].filter(Boolean)
        address = parts.join(', ')
        phone = f.phone
        website = f.website
      }

      if (isNaN(lat) || isNaN(lng)) continue

      const key = `${lat},${lng}`
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          lat,
          lng,
          address,
          phone,
          website,
          designationTypes: [],
        })
      }
      locationMap.get(key).designationTypes.push(type)
    }

    for (const [, loc] of locationMap) {
      const a = f.address || {}
      pins.push({
        fid: f.fid,
        name: f.name,
        lat: loc.lat,
        lng: loc.lng,
        address: loc.address,
        phone: loc.phone,
        website: loc.website,
        imageUrl: f.image_url,
        designationTypes: loc.designationTypes,
        primaryType: loc.designationTypes[0],
        zip: a.zip || '',
        city: a.city || '',
        state: a.state || '',
      })
    }
  }

  return pins
}

// ─── Main export ────────────────────────────────────────────────────────────

/**
 * @param {HTMLElement} component
 */
export default async function (component) {
  // ─── Step 2: DOM references ─────────────────────────────────────────────
  const centersList = component.querySelector("[data-centers='list']")
  const mapEl = component.querySelector("[data-centers='map']")
  const zipField = component.querySelector("[data-custom='centers-zip-field']")
  const categoriesSelect = component.querySelector("[data-centers='categories-select']")
  const itemTemplate = document.querySelector('[data-centers="list-item"]').cloneNode(true)

  // ─── Step 3: Rebuild dropdown options ───────────────────────────────────
  categoriesSelect.innerHTML = ''
  const allOption = document.createElement('option')
  allOption.value = 'all'
  allOption.textContent = 'All'
  categoriesSelect.appendChild(allOption)

  for (const [key, { label }] of Object.entries(DESIGNATION_TYPES)) {
    const option = document.createElement('option')
    option.value = key
    option.textContent = label
    categoriesSelect.appendChild(option)
  }

  // ─── Loading state ──────────────────────────────────────────────────────
  centersList.innerHTML = '<p style="padding:1rem;color:#666;">Loading centers...</p>'

  // ─── Step 4: Load Google Maps API ───────────────────────────────────────
  try {
    setOptions({ key: CONFIG.GOOGLE_MAPS_API_KEY, v: 'weekly' })
    await importLibrary('maps')
  } catch (err) {
    console.error('Google Maps failed to load:', err)
    mapEl.innerHTML = '<p style="padding:1rem;color:red;">Failed to load Google Maps. Please try again later.</p>'
    return
  }

  // ─── Step 5: Initialize map ─────────────────────────────────────────────
  const map = new google.maps.Map(mapEl, {
    center: CONFIG.DEFAULT_CENTER,
    zoom: CONFIG.DEFAULT_ZOOM,
  })

  // ─── Build icon map ─────────────────────────────────────────────────────
  const iconMap = {}
  for (const [type, { color }] of Object.entries(DESIGNATION_TYPES)) {
    iconMap[type] = {
      url: buildPinSvgUrl(color),
      scaledSize: new google.maps.Size(32, 44),
      anchor: new google.maps.Point(16, 44),
    }
  }

  // ─── Step 10: Shared InfoWindow ─────────────────────────────────────────
  const infoWindow = new google.maps.InfoWindow()

  // ─── Step 6: Fetch facility data ────────────────────────────────────────
  let allFacilities = []
  try {
    const res = await fetch(CONFIG.API_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    allFacilities = data.facilities || []

    // Defensive pagination
    if (data.total_pages > 1) {
      const pagePromises = []
      for (let p = 2; p <= data.total_pages; p++) {
        pagePromises.push(
          fetch(`${CONFIG.API_URL}&page=${p}`)
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((d) => d.facilities || [])
        )
      }
      const pages = await Promise.all(pagePromises)
      for (const page of pages) {
        allFacilities = allFacilities.concat(page)
      }
    }
  } catch (err) {
    console.error('Error fetching facility data:', err)
    centersList.innerHTML = '<p style="padding:1rem;color:red;">Failed to load centers. Please try again later.</p>'
    return
  }

  // ─── Step 7 (apply): Transform to pin records ──────────────────────────
  const allPinRecords = buildPinRecords(allFacilities)

  // ─── State ──────────────────────────────────────────────────────────────
  let markers = []
  let clusterer = null

  // ─── Step 11: Render function ───────────────────────────────────────────
  function renderCenters(pinRecords) {
    // Clear previous
    centersList.innerHTML = ''
    if (clusterer) {
      clusterer.clearMarkers()
      clusterer = null
    }
    markers.forEach((m) => m.setMap(null))
    markers = []

    if (pinRecords.length === 0) {
      centersList.innerHTML = '<p style="padding:1rem;color:#666;">No centers match your search.</p>'
      return
    }

    const bounds = new google.maps.LatLngBounds()

    pinRecords.forEach((pin) => {
      // ── List item ────────────────────────────────────────────────────
      const item = itemTemplate.cloneNode(true)
      item.dataset.id = pin.fid

      const iconEl = item.querySelector('[data-center="icon"]')
      if (iconEl) {
        if (iconMap[pin.primaryType]) {
          iconEl.src = iconMap[pin.primaryType].url
          iconEl.alt = DESIGNATION_TYPES[pin.primaryType]?.label || pin.primaryType
        } else {
          iconEl.parentElement?.remove()
        }
      }

      const nameEl = item.querySelector('[data-custom="center-name"]')
      if (nameEl) nameEl.textContent = pin.name

      const cityEl = item.querySelector('[data-custom="center-city"]')
      if (cityEl) cityEl.textContent = pin.city

      const zipEl = item.querySelector('[data-custom="center-zip-code"]')
      if (zipEl) zipEl.textContent = pin.zip

      const whereEl = item.querySelector('[data-centers="where"]')
      if (whereEl) {
        if (pin.website) {
          whereEl.href = pin.website
          whereEl.textContent = pin.website
        } else {
          whereEl.parentElement?.remove()
        }
      }

      const accreditationsEl = item.querySelector('[data-custom="center-accreditations"]')
      if (accreditationsEl) {
        const labels = pin.designationTypes.map((t) => DESIGNATION_TYPES[t]?.label || t).join(', ')
        accreditationsEl.textContent = labels
      }

      item.addEventListener('click', () => {
        map.setCenter({ lat: pin.lat, lng: pin.lng })
        map.setZoom(CONFIG.CLICK_ZOOM)
        // Open the marker's InfoWindow
        const markerObj = markers.find((m) => m.getPosition().lat() === pin.lat && m.getPosition().lng() === pin.lng)
        if (markerObj) {
          openInfoWindow(markerObj, pin)
        }
      })

      centersList.appendChild(item)

      // ── Map marker ───────────────────────────────────────────────────
      const position = { lat: pin.lat, lng: pin.lng }
      const marker = new google.maps.Marker({
        position,
        icon: iconMap[pin.primaryType] || undefined,
        map: null, // clusterer manages the map
      })

      marker.addListener('click', () => openInfoWindow(marker, pin))

      markers.push(marker)
      bounds.extend(position)
    })

    // ── Cluster ──────────────────────────────────────────────────────────
    clusterer = new MarkerClusterer({
      map,
      markers,
      renderer: new CustomClusterRenderer(),
      algorithm: new SuperClusterAlgorithm({ radius: CONFIG.CLUSTER_RADIUS }),
    })

    // Fit bounds
    if (markers.length > 1) {
      map.fitBounds(bounds)
    } else if (markers.length === 1) {
      map.setCenter(markers[0].getPosition())
      map.setZoom(CONFIG.CLICK_ZOOM)
    }
  }

  function openInfoWindow(marker, pin) {
    const designationLabels = pin.designationTypes
      .map((t) => {
        const cfg = DESIGNATION_TYPES[t]
        return cfg
          ? `<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:${cfg.color};color:#fff;font-size:12px;margin:2px 2px 2px 0;">${cfg.label}</span>`
          : ''
      })
      .join('')

    const content = `
      <div style="max-width:240px;font-family:Arial,sans-serif;">
        <strong style="font-size:14px;">${pin.name}</strong>
        <div style="margin:6px 0;">${designationLabels}</div>
        <div style="font-size:13px;color:#444;margin-bottom:6px;">${pin.address}</div>
        ${pin.imageUrl ? `<img src="${pin.imageUrl}" alt="${pin.name}" style="width:100%;border-radius:4px;margin-bottom:6px;" />` : ''}
        ${pin.phone ? `<div><a href="tel:${pin.phone}" style="font-size:13px;">${pin.phone}</a></div>` : ''}
        <div style="margin-top:4px;">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}&travelmode=driving" target="_blank" rel="noopener" style="font-size:13px;">Get Directions</a>
        </div>
      </div>
    `
    infoWindow.setContent(content)
    infoWindow.open(map, marker)
  }

  // ─── Step 12: Filter logic ──────────────────────────────────────────────
  function applyFilters() {
    const zipValue = zipField.value.trim()
    const categoryValue = categoriesSelect.value

    let filtered = allPinRecords

    if (zipValue) {
      filtered = filtered.filter((p) => String(p.zip).startsWith(zipValue))
    }
    if (categoryValue && categoryValue !== 'all') {
      filtered = filtered.filter((p) => p.designationTypes.includes(categoryValue))
    }

    renderCenters(filtered)
  }

  // ─── Initial render ─────────────────────────────────────────────────────
  renderCenters(allPinRecords)

  // ─── Bind filter events ─────────────────────────────────────────────────
  zipField.addEventListener('input', applyFilters)
  categoriesSelect.addEventListener('change', applyFilters)

  // ─── Step 13: Remove template from DOM ──────────────────────────────────
  document.querySelector('[data-centers="list-item"]')?.remove()
}
