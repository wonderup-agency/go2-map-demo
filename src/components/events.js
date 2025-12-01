/**
 *
 * @param {HTMLElement} component
 */
export default async function (component) {
  const eventsSource = component.querySelector('[data-events="source"]')
  const events = Array.from(eventsSource.querySelectorAll('[data-events="event-element"]'))
  const eventsList = component.querySelector('[data-events="list"]')
  const eventTemplate = component.querySelector('[data-events="event-template"]')
  const citiesArr = []
  const select = component.querySelector('[data-events="select-cities"]')
  const search = component.querySelector('[data-events="search"] input')
  const nextBtn = component.querySelector('[data-events="next"]')
  const prevBtn = component.querySelector('[data-events="prev"]')
  const emptyState = component.querySelector('[data-events="empty"]')
  const form = component.querySelector('form')
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
  }

  events.forEach((event) => {
    const dayElement = event.querySelector('[data-events="DD"]')
    const monthYearElement = event.querySelector('[data-events="MMM-YYYY"]')
    const timeElement = event.querySelector('[data-custom="start-end-date"]')

    const { startDate: startDateStr, endDate: endDateStr, timezone: timezoneId } = event.dataset
    if (!startDateStr || !endDateStr || !timezoneId) return event.parentElement.remove()

    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)
    const currentDate = new Date()

    const getUTCDateStamp = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())

    if (getUTCDateStamp(endDate) + 86400000 <= getUTCDateStamp(currentDate)) return event.parentElement.remove()

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezoneId,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const dateParts = Object.fromEntries(dateFormatter.formatToParts(startDate).map((part) => [part.type, part.value]))

    dayElement.textContent = dateParts.day
    monthYearElement.textContent = `${dateParts.month} ${dateParts.year}`

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezoneId,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const extractTime = (d) => Object.fromEntries(timeFormatter.formatToParts(d).map((part) => [part.type, part.value]))

    const startTime = extractTime(startDate)
    const endTime = extractTime(endDate)

    timeElement.textContent =
      `${startTime.hour}:${startTime.minute}${startTime.dayPeriod} - ` +
      `${endTime.hour}:${endTime.minute}${endTime.dayPeriod}`

    const city = event.dataset.city || ''
    if (city != '') citiesArr.push(city)
    eventsList.appendChild(event)
  })

  eventTemplate.remove()
  eventsSource.remove()
  const uniqueCities = [...new Set(citiesArr)].sort()
  populateSelectCities(select, uniqueCities)

  let currentPage = 1

  function updateDisplay() {
    const selectedCity = (select.value || '').trim()
    const searchText = (search.value || '').trim().toLowerCase()
    const itemsPerPage = 3
    const allEvents = Array.from(eventsList.querySelectorAll('[data-events="event-element"]'))
    const visibleEvents = []

    allEvents.forEach((event) => {
      const eventCity = (event.dataset.city || '').trim().toLowerCase()
      const eventName = (event.dataset.name || '').trim().toLowerCase()
      const eventVenue = (event.dataset.venue || '').trim().toLowerCase()
      const cityMatch = selectedCity === '' || event.dataset.city.trim() === selectedCity
      const textMatch =
        searchText === '' ||
        eventName.includes(searchText) ||
        eventCity.includes(searchText) ||
        eventVenue.includes(searchText)
      if (cityMatch && textMatch) {
        visibleEvents.push(event)
      } else {
        event.classList.add('hide-event')
        event.classList.remove('show-event')
      }
    })

    const totalVisible = visibleEvents.length
    const totalPages = Math.ceil(totalVisible / itemsPerPage)

    if (totalVisible === 0) {
      nextBtn.style.display = 'none'
      prevBtn.style.display = 'none'
      emptyState.style.display = 'block'
    } else {
      emptyState.style.display = 'none'
      nextBtn.style.display = 'block'
      prevBtn.style.display = 'block'

      prevBtn.disabled = currentPage === 1
      nextBtn.disabled = currentPage >= totalPages

      visibleEvents.forEach((event, index) => {
        if (index >= (currentPage - 1) * itemsPerPage && index < currentPage * itemsPerPage) {
          event.classList.add('show-event')
          event.classList.remove('hide-event')
        } else {
          event.classList.add('hide-event')
          event.classList.remove('show-event')
        }
      })
    }
  }

  select.addEventListener('change', () => {
    currentPage = 1
    updateDisplay()
  })

  search.addEventListener('input', () => {
    currentPage = 1
    updateDisplay()
  })

  nextBtn.addEventListener('click', () => {
    currentPage++
    updateDisplay()
  })

  prevBtn.addEventListener('click', () => {
    currentPage--
    updateDisplay()
  })

  // Initial display setup
  updateDisplay()
}

function populateSelectCities(select, uniqueCities) {
  if (select) {
    uniqueCities.forEach((city) => {
      const option = document.createElement('option')
      option.value = city
      option.textContent = city
      select.appendChild(option)
    })
  }
}
