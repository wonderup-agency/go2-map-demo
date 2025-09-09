import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import healthCentersData from '../json/locations.json'

/**
 *
 * @param {HTMLElement} component
 */
export default function (component) {
  const mapEl = component.querySelector("[data-centers='map']")
  const centersList = component.querySelector("[data-centers='list']")

  // Initialize map
  const map = L.map(mapEl).setView([37.5, -95.7], 4) // Centered on US

  L.Marker.prototype.options.icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -35],
  })

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  // Convert object values to array
  const healthCenters = Object.values(healthCentersData)

  const bounds = []

  healthCenters.forEach((center) => {
    const {
      id,
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

    const item = document
      .querySelector('[data-centers="list-item"]')
      .cloneNode(true)
    item.dataset.id = id
    const fields = [
      { selector: '[data-center="name"]', value: loc_name },
      { selector: '[data-center="city"]', value: city },
      { selector: '[data-center="zip-code"]', value: zip },
      { selector: '[data-center="where"]', value: loc_main_url, isLink: true },
    ]
    fields.forEach(({ selector, value, isLink }) => {
      const el = item.querySelector(selector)
      if (!value) {
        el?.parentElement?.remove()
      } else {
        el.textContent = value
        if (isLink) el.href = value
      }
    })
    item.addEventListener('click', () => {
      map.setView([lat, lng], 14, { animate: false })
    })
    centersList.appendChild(item)

    // Skip if coords are missing or invalid
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return
    }

    const popupContent = `
      <div style="max-width:200px">
        <strong>${loc_name}</strong><br>
        ${loc_main_address}<br>
        ${loc_image ? `<img src="${loc_image}" alt="${loc_name}" style="width:100%;margin-top:5px;border-radius:4px;" />` : ''}
        <a href="tel:${loc_main_phone}">${loc_main_phone}</a>
      </div>
    `

    L.marker([lat, lng]).addTo(map).bindPopup(popupContent)

    bounds.push([lat, lng])
  })
  document.querySelector('[data-centers="list-item"]').remove()

  if (bounds.length) {
    map.fitBounds(bounds)
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
}
