import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 *
 * @param {HTMLElement} component
 */
export default async function (component) {
  const centersList = component.querySelector("[data-centers='list']")
  const mapEl = component.querySelector("[data-centers='map']")
  const zipField = component.querySelector("[data-centers='zip-field']")
  const categoriesSelect = component.querySelector(
    "[data-centers='categories-select']"
  )
  const itemTemplate = document
    .querySelector('[data-centers="list-item"]')
    .cloneNode(true)

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

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  // Fetch health centers data
  let healthCenters = []
  try {
    const response = await fetch(
      'https://go2-centers-worker.nahuel-eba.workers.dev/centers'
    )
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    healthCenters = Object.values(await response.json())
  } catch (error) {
    console.error('Error fetching health centers data:', error)
    return
  }

  let markers = [] // keep track of map markers

  function clearMarkers() {
    markers.forEach((marker) => map.removeLayer(marker))
    markers = []
  }

  function renderCenters(filtered) {
    // Clear list and markers
    centersList.innerHTML = ''
    clearMarkers()

    const bounds = []

    filtered.forEach((center) => {
      const {
        id,
        category,
        lat,
        lng,
        loc_name,
        loc_main_address,
        city,
        zip,
        loc_image,
        loc_main_phone,
        loc_main_url,
      } = center

      const item = itemTemplate.cloneNode(true)
      item.dataset.id = id
      const fields = [
        { selector: '[data-center="icon"]', value: category, isIcon: true },
        { selector: '[data-center="name"]', value: loc_name },
        { selector: '[data-center="city"]', value: city },
        { selector: '[data-center="zip-code"]', value: zip },
        {
          selector: '[data-center="where"]',
          value: loc_main_url,
          isLink: true,
        },
        { selector: '[data-center="accreditations"]', value: category },
      ]
      fields.forEach(({ selector, value, isIcon, isLink }) => {
        const el = item.querySelector(selector)
        if (!value) {
          el?.parentElement?.remove()
        } else {
          el.textContent = value
          if (isIcon) {
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
          }
          if (isLink) el.href = value
        }
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
          iconUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [52, 42],
          iconAnchor: [26, 42],
          popupAnchor: [0, -35],
        })

      const marker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(popupContent)
      markers.push(marker)
      bounds.push([lat, lng])
    })

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

  // Bind filter events
  zipField.addEventListener('input', applyFilters)
  categoriesSelect.addEventListener('change', applyFilters)

  // remove the original template element from DOM
  document.querySelector('[data-centers="list-item"]').remove()
}

//   const filteredCenters = healthCenters.map(center => {
//     const { id, meta } = center;
//     const { lat, lng, loc_name, loc_main_address, loc_image, loc_main_phone, loc_main_url } = meta;
//     const city = meta["loc_main_address-value"]?.city ?? null;
//     const zip = meta["loc_main_address-value"]?.zip ?? null;

//     return { id, lat, lng, loc_name, loc_main_address, loc_image, loc_main_phone, loc_main_url, city, zip };
// });
// const filteredJSON = JSON.stringify(filteredCenters, null, 2);
// console.log(filteredJSON);
