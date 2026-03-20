/**
 *
 * @param {HTMLElement} component
 */
async function events (component) {
  const eventsSource = component.querySelector('[data-events="source"]');
  const events = Array.from(eventsSource ? eventsSource.querySelectorAll('[data-events="event-element"]') : []);
  const eventsList = component.querySelector('[data-events="list"]');
  const eventTemplate = component.querySelector('[data-events="event-template"]');
  const citiesArr = [];
  const typesArr = [];

  const select = component.querySelector('[data-events="select-cities"]');
  const selectType = component.querySelector('[data-events="select-type"]');
  const search = component.querySelector('[data-events="search"] input');
  const nextBtn = component.querySelector('[data-events="next"]');
  const prevBtn = component.querySelector('[data-events="prev"]');
  const emptyState = component.querySelector('[data-events="empty"]');
  const form = component.querySelector('form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // If the list container doesn't exist on the screen, stop execution
  if (!eventsList) return

  // LOOP PROCESSING EVENTS WITH A FAIL-SAFE "TRY...CATCH" BLOCK
  events.forEach((event) => {
    const dayElement = event.querySelector('[data-events="DD"]');
    const monthYearElement = event.querySelector('[data-events="MMM-YYYY"]');
    const timeElement = event.querySelector('[data-custom="start-end-date"]');

    const { startDate: startDateStr, endDate: endDateStr, timezone: timezoneId } = event.dataset;

    // 1. Check if the required data actually exists in the CMS
    if (!startDateStr || !endDateStr || !timezoneId) {
      if (event.parentElement) event.parentElement.remove();
      return
    }

    try {
      // 2. Attempt formatting (If the timezone is invalid, execution jumps to the catch block)
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // If the date is not a valid number
      if (isNaN(startDate) || isNaN(endDate)) throw new Error('Invalid date format')

      const currentDate = new Date();
      const getUTCDateStamp = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

      // Hide/Remove past events
      if (getUTCDateStamp(endDate) + 86400000 <= getUTCDateStamp(currentDate)) {
        if (event.parentElement) event.parentElement.remove();
        return
      }

      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneId,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const dateParts = Object.fromEntries(
        dateFormatter.formatToParts(startDate).map((part) => [part.type, part.value])
      );
      if (dayElement) dayElement.textContent = dateParts.day;
      if (monthYearElement) monthYearElement.textContent = `${dateParts.month} ${dateParts.year}`;

      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneId,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      });

      const extractTime = (d) =>
        Object.fromEntries(timeFormatter.formatToParts(d).map((part) => [part.type, part.value]));
      const startTime = extractTime(startDate);

      if (timeElement) {
        let period = (startTime.dayPeriod || '').toLowerCase();
        if (period === 'am') period = 'a.m.';
        if (period === 'pm') period = 'p.m.';

        timeElement.textContent = `${startTime.hour}:${startTime.minute} ${period} ${startTime.timeZoneName}`;
      }

      const city = event.dataset.city || '';
      if (city !== '') citiesArr.push(city);

      const type = event.dataset.type || '';
      if (type !== '') typesArr.push(type);

      eventsList.appendChild(event); // Move the item to the visible list
    } catch (error) {
      // 3. CATCH BLOCK: Prevents the site from crashing!
      console.warn('Invalid event found in the database. Skipping...', error);
      if (event.parentElement) event.parentElement.remove();
    }
  });

  // Remove leftover elements from the screen
  if (eventTemplate) eventTemplate.remove();
  if (eventsSource) eventsSource.remove();

  const uniqueCities = [...new Set(citiesArr)].sort();
  // DODATO: Prosljeđujemo tekst za početnu opciju
  populateSelectOptions(select, uniqueCities, 'All locations');

  const uniqueTypes = [...new Set(typesArr)].sort();
  // DODATO: Prosljeđujemo tekst za početnu opciju
  populateSelectOptions(selectType, uniqueTypes, 'All types');

  let currentPage = 1;

  function updateDisplay() {
    const selectedCity = (select && select.value ? select.value : '').trim();
    const selectedType = (selectType && selectType.value ? selectType.value : '').trim();

    const searchText = (search && search.value ? search.value : '').trim().toLowerCase();
    const itemsPerPage = 4; // Number of items per page
    const allEvents = Array.from(eventsList.querySelectorAll('[data-events="event-element"]'));
    const visibleEvents = [];

    const tokens = searchText
      ? searchText
          .split('/')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    allEvents.forEach((event) => {
      const eventCity = (event.dataset.city || '').trim().toLowerCase();
      const eventName = (event.dataset.name || '').trim().toLowerCase();
      const eventVenue = (event.dataset.venue || '').trim().toLowerCase();

      const cityMatch = selectedCity === '' || (event.dataset.city || '').trim() === selectedCity;
      const typeMatch = selectedType === '' || (event.dataset.type || '').trim() === selectedType;

      const textMatch =
        tokens.length === 0 ||
        tokens.some((t) => eventName.includes(t) || eventCity.includes(t) || eventVenue.includes(t));

      if (cityMatch && typeMatch && textMatch) {
        visibleEvents.push(event);
      } else {
        event.classList.add('hide-event');
        event.classList.remove('show-event');
      }
    });

    const totalVisible = visibleEvents.length;
    const totalPages = Math.ceil(totalVisible / itemsPerPage);

    if (totalVisible === 0) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'block';
      if (prevBtn) prevBtn.style.display = 'block';

      if (prevBtn) prevBtn.disabled = currentPage === 1;
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

      visibleEvents.forEach((event, index) => {
        if (index >= (currentPage - 1) * itemsPerPage && index < currentPage * itemsPerPage) {
          event.classList.add('show-event');
          event.classList.remove('hide-event');
        } else {
          event.classList.add('hide-event');
          event.classList.remove('show-event');
        }
      });
    }
  }

  // EVENT LISTENERS WITH CHECKS
  if (select)
    select.addEventListener('change', () => {
      currentPage = 1;
      updateDisplay();
    });

  if (selectType)
    selectType.addEventListener('change', () => {
      currentPage = 1;
      updateDisplay();
    });

  if (search)
    search.addEventListener('input', () => {
      currentPage = 1;
      updateDisplay();
    });
  if (nextBtn)
    nextBtn.addEventListener('click', () => {
      currentPage++;
      updateDisplay();
    });
  if (prevBtn)
    prevBtn.addEventListener('click', () => {
      currentPage--;
      updateDisplay();
    });

  // WALK/RUN BUTTON
  if (!window.__walkRunButtonBound) {
    window.__walkRunButtonBound = true;
    document.addEventListener('click', (e) => {
      const buttonEl = e.target.closest('.button');
      if (!buttonEl) return

      const linkEl = buttonEl.querySelector('a.item-link[href^="#"]');
      if (!linkEl) return

      const href = linkEl.getAttribute('href') || '';
      if (href !== '#events') return

      e.preventDefault();

      const target = document.querySelector(href);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (search) {
        search.value = 'walk/run';
        currentPage = 1;
        updateDisplay();
      }
    });
  }

  updateDisplay();
}

// IZMIJENJENO: Dodato kreiranje početne opcije ("All types")
function populateSelectOptions(selectElement, uniqueItems, defaultText) {
  if (selectElement) {
    // Čistimo dropdown u slučaju da je Webflow ubacio neke prazne option tagove
    selectElement.innerHTML = '';

    // Kreiramo početnu opciju ("All locations" ili "All types")
    const defaultOption = document.createElement('option');
    defaultOption.value = ''; // Vrijednost ostavljamo praznu da bi prošlo kroz "selectedType === ''" filter
    defaultOption.textContent = defaultText || 'All';
    selectElement.appendChild(defaultOption);

    // Dodajemo ostale opcije iz baze
    uniqueItems.forEach((item) => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      selectElement.appendChild(option);
    });
  }

  /*
  const eventsSource = component.querySelector('[data-events="source"]')
  const events = Array.from(eventsSource ? eventsSource.querySelectorAll('[data-events="event-element"]') : [])
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

  // If the list container doesn't exist on the screen, stop execution
  if (!eventsList) return

  // LOOP PROCESSING EVENTS WITH A FAIL-SAFE "TRY...CATCH" BLOCK
  events.forEach((event) => {
    const dayElement = event.querySelector('[data-events="DD"]')
    const monthYearElement = event.querySelector('[data-events="MMM-YYYY"]')
    const timeElement = event.querySelector('[data-custom="start-end-date"]')

    const { startDate: startDateStr, endDate: endDateStr, timezone: timezoneId } = event.dataset

    // 1. Check if the required data actually exists in the CMS
    if (!startDateStr || !endDateStr || !timezoneId) {
      if (event.parentElement) event.parentElement.remove()
      return
    }

    try {
      // 2. Attempt formatting (If the timezone is invalid, execution jumps to the catch block)
      const startDate = new Date(startDateStr)
      const endDate = new Date(endDateStr)

      // If the date is not a valid number
      if (isNaN(startDate) || isNaN(endDate)) throw new Error('Invalid date format')

      const currentDate = new Date()
      const getUTCDateStamp = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())

      // Hide/Remove past events
      if (getUTCDateStamp(endDate) + 86400000 <= getUTCDateStamp(currentDate)) {
        if (event.parentElement) event.parentElement.remove()
        return
      }

      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneId,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })

      const dateParts = Object.fromEntries(
        dateFormatter.formatToParts(startDate).map((part) => [part.type, part.value])
      )
      if (dayElement) dayElement.textContent = dateParts.day
      if (monthYearElement) monthYearElement.textContent = `${dateParts.month} ${dateParts.year}`

      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneId,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      })

      const extractTime = (d) =>
        Object.fromEntries(timeFormatter.formatToParts(d).map((part) => [part.type, part.value]))
      const startTime = extractTime(startDate)

      if (timeElement) {
        let period = (startTime.dayPeriod || '').toLowerCase()
        if (period === 'am') period = 'a.m.'
        if (period === 'pm') period = 'p.m.'

        timeElement.textContent = `${startTime.hour}:${startTime.minute} ${period} ${startTime.timeZoneName}`
      }

      const city = event.dataset.city || ''
      if (city !== '') citiesArr.push(city)
      eventsList.appendChild(event) // Move the item to the visible list
    } catch (error) {
      // 3. CATCH BLOCK: Prevents the site from crashing!
      console.warn('Invalid event found in the database. Skipping...', error)
      if (event.parentElement) event.parentElement.remove()
    }
  })

  // Remove leftover elements from the screen
  if (eventTemplate) eventTemplate.remove()
  if (eventsSource) eventsSource.remove()

  const uniqueCities = [...new Set(citiesArr)].sort()
  populateSelectCities(select, uniqueCities)

  let currentPage = 1

  function updateDisplay() {
    const selectedCity = (select && select.value ? select.value : '').trim()
    const searchText = (search && search.value ? search.value : '').trim().toLowerCase()
    const itemsPerPage = 4 // Number of items per page
    const allEvents = Array.from(eventsList.querySelectorAll('[data-events="event-element"]'))
    const visibleEvents = []

    const tokens = searchText
      ? searchText
          .split('/')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    allEvents.forEach((event) => {
      const eventCity = (event.dataset.city || '').trim().toLowerCase()
      const eventName = (event.dataset.name || '').trim().toLowerCase()
      const eventVenue = (event.dataset.venue || '').trim().toLowerCase()

      const cityMatch = selectedCity === '' || (event.dataset.city || '').trim() === selectedCity

      const textMatch =
        tokens.length === 0 ||
        tokens.some((t) => eventName.includes(t) || eventCity.includes(t) || eventVenue.includes(t))

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
      if (nextBtn) nextBtn.style.display = 'none'
      if (prevBtn) prevBtn.style.display = 'none'
      if (emptyState) emptyState.style.display = 'block'
    } else {
      if (emptyState) emptyState.style.display = 'none'
      if (nextBtn) nextBtn.style.display = 'block'
      if (prevBtn) prevBtn.style.display = 'block'

      if (prevBtn) prevBtn.disabled = currentPage === 1
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages

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

  // EVENT LISTENERS WITH CHECKS
  if (select)
    select.addEventListener('change', () => {
      currentPage = 1
      updateDisplay()
    })
  if (search)
    search.addEventListener('input', () => {
      currentPage = 1
      updateDisplay()
    })
  if (nextBtn)
    nextBtn.addEventListener('click', () => {
      currentPage++
      updateDisplay()
    })
  if (prevBtn)
    prevBtn.addEventListener('click', () => {
      currentPage--
      updateDisplay()
    })

  // WALK/RUN BUTTON
  if (!window.__walkRunButtonBound) {
    window.__walkRunButtonBound = true
    document.addEventListener('click', (e) => {
      const buttonEl = e.target.closest('.button')
      if (!buttonEl) return

      const linkEl = buttonEl.querySelector('a.item-link[href^="#"]')
      if (!linkEl) return

      const href = linkEl.getAttribute('href') || ''
      if (href !== '#events') return

      e.preventDefault()

      const target = document.querySelector(href)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })

      if (search) {
        search.value = 'walk/run'
        currentPage = 1
        updateDisplay()
      }
    })
  }

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

*/

  /*
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
    if (city !== '') citiesArr.push(city)
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
    const itemsPerPage = 4
    const allEvents = Array.from(eventsList.querySelectorAll('[data-events="event-element"]'))
    const visibleEvents = []

    const tokens = searchText
      ? searchText
          .split('/')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    allEvents.forEach((event) => {
      const eventCity = (event.dataset.city || '').trim().toLowerCase()
      const eventName = (event.dataset.name || '').trim().toLowerCase()
      const eventVenue = (event.dataset.venue || '').trim().toLowerCase()

      const cityMatch = selectedCity === '' || (event.dataset.city || '').trim() === selectedCity

      const textMatch =
        tokens.length === 0 ||
        tokens.some((t) => eventName.includes(t) || eventCity.includes(t) || eventVenue.includes(t))

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

  if (!window.__walkRunButtonBound) {
    window.__walkRunButtonBound = true

    document.addEventListener('click', (e) => {
      const buttonEl = e.target.closest('.button')
      if (!buttonEl) return

      const linkEl = buttonEl.querySelector('a.item-link[href^="#"]')
      if (!linkEl) return

      const href = linkEl.getAttribute('href') || ''
      if (href !== '#events') return

      e.preventDefault()

      const target = document.querySelector(href)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })

      search.value = 'walk/run'
      currentPage = 1
      updateDisplay()
    })
  }

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
*/
}

export { events as default };
//# sourceMappingURL=events-cVTqxieq.js.map
