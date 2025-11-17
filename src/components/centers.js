// centers.js
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

/**
 *
 * @param {HTMLElement} component
 */
export default async function (component) {
  // --- Exposed cluster config (tweak in console before the module runs) ---
  // Example: CENTERS_CLUSTER_CONFIG.maxClusterRadius = 120
  const CENTERS_CLUSTER_CONFIG = {
    maxClusterRadius: 30, // pixels
    disableClusteringAtZoom: 16,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    animate: true,
    chunkedLoading: true,
  }

  const centersList = component.querySelector("[data-centers='list']")
  const mapEl = component.querySelector("[data-centers='map']")
  const zipField = component.querySelector("[data-custom='centers-zip-field']")
  const categoriesSelect = component.querySelector("[data-centers='categories-select']")
  const itemTemplate = document.querySelector('[data-centers="list-item"]').cloneNode(true)

  // Initialize map
  const map = L.map(mapEl).setView([37.5, -95.7], 4) // Centered on US

  // Define custom icons
  const baseIconUrl = 'https://go2-centers-worker.nahuel-eba.workers.dev/'
  const iconConfig = {
    'GO2 designated': L.icon({
      iconUrl: `${baseIconUrl}pin-go2.png`,
      shadowUrl: `${baseIconUrl}pin-shadow.png`,
      iconSize: [62, 62],
      iconAnchor: [31, 62],
      shadowSize: [52, 32],
      shadowAnchor: [26, 8],
      popupAnchor: [0, -35],
    }),
    COC: L.icon({
      iconUrl: `${baseIconUrl}pin-coc.png`,
      shadowUrl: `${baseIconUrl}pin-shadow.png`,
      iconSize: [52, 52],
      iconAnchor: [26, 52],
      shadowSize: [52, 32],
      shadowAnchor: [26, 8],
      popupAnchor: [0, -35],
    }),
    'NCI designated': L.icon({
      iconUrl: `${baseIconUrl}pin-nci.png`,
      shadowUrl: `${baseIconUrl}pin-shadow.png`,
      iconSize: [52, 52],
      iconAnchor: [26, 52],
      shadowAnchor: [26, 8],
      popupAnchor: [0, -35],
    }),
  }

  // Inject minimal cluster icon stylesheet (custom appearance per request)
  ;(function injectClusterStyles() {
    const css = `
      .custom-cluster {
        background: transparent;
        border-radius: 50vw;
        display: inline-block;
        line-height: 1;
        text-align: center;
      }
      .custom-cluster > div {
        background: #ffffff;
        border: 3px solid #2c3495;
        border-radius: 50vw;
        display: inline-block;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 3rem;
        height: 3rem;
      }
      .custom-cluster span {
        color: #2c3495;
        font-weight: 800;
        font-family: Arial, Helvetica, sans-serif;
        display: inline-block;
        font-size: 1rem;
      }
    `
    const s = document.createElement('style')
    s.setAttribute('data-generated', 'centers-cluster-styles')
    s.appendChild(document.createTextNode(css))
    document.head.appendChild(s)
  })()

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  // Fetch health centers data
  let healthCenters = []
  try {
    const response = await fetch('https://go2-centers-worker.nahuel-eba.workers.dev/centers')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    healthCenters = Object.values(await response.json())
  } catch (error) {
    console.error('Error fetching health centers data:', error)
    return
  }

  // markers (flat array of L.Marker)
  let markers = []

  // Cluster group reference
  let clusterGroup = null

  // Helper to create the cluster icon (shows count and uses requested colors)
  function createClusterIcon(cluster) {
    const count = cluster.getChildCount()
    // scale size based on count (simple heuristic)
    const digits = String(count).length
    const multiplier = digits > 2 ? 1.4 : digits === 2 ? 1.2 : 1
    const html = `<div><span>${count}</span></div>`
    return L.divIcon({
      html,
      className: 'custom-cluster',
      iconSize: L.point(30 * multiplier, 30 * multiplier),
    })
  }

  // Build cluster options from exposed config
  function buildClusterOptions() {
    const cfg = CENTERS_CLUSTER_CONFIG || {}
    return {
      maxClusterRadius: cfg.maxClusterRadius,
      disableClusteringAtZoom: cfg.disableClusteringAtZoom,
      spiderfyOnMaxZoom: cfg.spiderfyOnMaxZoom,
      showCoverageOnHover: cfg.showCoverageOnHover,
      animate: typeof cfg.animate === 'boolean' ? cfg.animate : true,
      chunkedLoading: typeof cfg.chunkedLoading === 'boolean' ? cfg.chunkedLoading : true,
      iconCreateFunction: createClusterIcon,
      // keep default behavior for cluster click (zoom in / expand)
      // other options can be added to CENTERS_CLUSTER_CONFIG as needed
    }
  }

  function ensureClusterGroup() {
    // remove old group if exists
    if (clusterGroup) {
      clusterGroup.clearLayers()
      if (map.hasLayer(clusterGroup)) map.removeLayer(clusterGroup)
      clusterGroup = null
    }
    clusterGroup = L.markerClusterGroup(buildClusterOptions())
    // default cluster click behavior is provided by MarkerCluster plugin (zoom in)
    // but keep a safety handler to fit bounds if required by map state:
    clusterGroup.on('clusterclick', function (a) {
      // allow default behavior (zoom in). If disableClusteringAtZoom would show markers,
      // plugin handles this. We do not override to "zoom out".
      // No-op here so default behavior remains.
    })
  }

  function clearMarkers() {
    if (clusterGroup) {
      clusterGroup.clearLayers()
      if (map.hasLayer(clusterGroup)) map.removeLayer(clusterGroup)
    }
    markers.forEach((m) => {
      // ensure removed from any map
      try {
        map.removeLayer(m)
      } catch (e) {}
    })
    markers = []
  }

  function renderCenters(filtered) {
    // Clear list and previous markers/clusters
    centersList.innerHTML = ''
    clearMarkers()
    ensureClusterGroup()

    const bounds = []

    filtered.forEach((center) => {
      const { id, category, lat, lng, loc_name, loc_main_address, city, zip, loc_image, loc_main_phone, loc_main_url } =
        center

      const item = itemTemplate.cloneNode(true)
      item.dataset.id = id
      const fields = [
        { selector: '[data-center="icon"]', value: category, isIcon: true },
        { selector: '[data-custom="center-name"]', value: loc_name },
        { selector: '[data-custom="center-city"]', value: city },
        { selector: '[data-custom="center-zip-code"]', value: zip },
        {
          selector: '[data-centers="where"]',
          value: loc_main_url,
          isLink: true,
        },
        { selector: '[data-custom="center-accreditations"]', value: category },
      ]
      fields.forEach(({ selector, value, isIcon, isLink }) => {
        const el = item.querySelector(selector)
        if (!value) {
          el?.parentElement?.remove()
          return
        }
        if (isIcon) {
          el.alt = value
          const prefix = 'https://go2-centers-worker.nahuel-eba.workers.dev/'
          switch (value) {
            case 'GO2 designated':
              el.src = `${prefix}pin-go2.png`
              break
            case 'NCI designated':
              el.src = `${prefix}pin-nci.png`
              break
            case 'COC':
              el.src = `${prefix}pin-coc.png`
              break

            default:
              el?.parentElement?.remove()
              break
          }
          return
        }
        if (isLink) el.href = value
        el.textContent = value
      })
      item.addEventListener('click', () => {
        if (lat && lng) map.setView([lat, lng], 14, { animate: false })
      })
      centersList.appendChild(item)

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return

      const popupContent = `
        <div style="max-width:200px">
          <strong>${loc_name}</strong><br>
          ${loc_main_address}<br>
          ${loc_image ? `<img src="${loc_image}" alt="${loc_name}" style="width:100%;margin-top:4px;margin-bottom:4px;border-radius:4px;" />` : ''}
          <a href="tel:${loc_main_phone}">${loc_main_phone}</a>
        </div>
      `

      const markerIcon =
        iconConfig[category] ||
        L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [52, 42],
          iconAnchor: [26, 42],
          popupAnchor: [0, -35],
        })

      const markerOptions = { icon: markerIcon }
      if (category === 'GO2 designated') markerOptions.zIndexOffset = 1

      // Create marker but DO NOT immediately add to the map; add to clusterGroup
      const marker = L.marker([lat, lng], markerOptions).bindPopup(popupContent)
      markers.push(marker)
      clusterGroup.addLayer(marker)
      bounds.push([lat, lng])
    })

    // Add cluster group once constructed
    clusterGroup.addTo(map)

    // Fit bounds if we have results
    if (bounds.length) {
      map.fitBounds(bounds)
    }
  }

  function applyFilters() {
    const zipValue = zipField.value.trim()
    const categoryValue = categoriesSelect.value

    let filtered = healthCenters

    if (zipValue) {
      filtered = filtered.filter((c) => String(c.zip).startsWith(zipValue))
    }
    if (categoryValue && categoryValue !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryValue)
    }

    renderCenters(filtered)
  }

  // Initial render
  renderCenters(healthCenters)

  // Bind filter events — on each change we rebuild clusters (recalculate)
  zipField.addEventListener('input', applyFilters)
  categoriesSelect.addEventListener('change', applyFilters)

  // remove the original template element from DOM
  document.querySelector('[data-centers="list-item"]').remove()
}
