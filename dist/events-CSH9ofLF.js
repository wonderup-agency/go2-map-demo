/**
 *
 * @param {HTMLElement} component
 */
async function events (component) {
  const eventsSource = component.querySelector('[data-events="source"]');
  const events = Array.from(eventsSource ? eventsSource.querySelectorAll('[data-events="event-element"]') : []);
  const eventsList = component.querySelector('[data-events="list"]');
  const eventTemplate = component.querySelector('[data-events="event-template"]');

  // Arrays to hold unique options
  const citiesArr = [];
  const typesArr = [];

  // Selectors for dropdowns and controls
  const select = component.querySelector('[data-events="select-cities"]');
  const selectType = component.querySelector('[data-events="select-type"]');
  const search = component.querySelector('[data-events="search"] input');
  const nextBtn = component.querySelector('[data-events="next"]');
  const prevBtn = component.querySelector('[data-events="prev"]');
  const emptyState = component.querySelector('[data-events="empty"]');
  const form = component.querySelector('form');

  // Prevent form submission if users press Enter in the search field
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // If the list container doesn't exist on the screen, stop execution
  if (!eventsList) return

  // --- NEW: Helper function to format time and clean timezone abbreviations ---
  const formatTimeForZone = (date, zoneId) => {
    try {
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zoneId,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      });
      const parts = Object.fromEntries(timeFormatter.formatToParts(date).map((p) => [p.type, p.value]));

      let period = (parts.dayPeriod || '').toLowerCase();
      if (period === 'am') period = 'a.m.';
      if (period === 'pm') period = 'p.m.';

      // Converts PDT/PST -> PT, EDT/EST -> ET, etc.
      let tzClean = (parts.timeZoneName || '').replace(/([A-Z])(D|S)(T)/i, '$1$3');

      return `${parts.hour}:${parts.minute} ${period} ${tzClean}`
    } catch (e) {
      console.warn('Invalid timezone ID provided:', zoneId);
      return ''
    }
  };

  // LOOP PROCESSING EVENTS WITH A FAIL-SAFE "TRY...CATCH" BLOCK
  events.forEach((event) => {
    const dayElement = event.querySelector('[data-events="DD"]');
    const monthYearElement = event.querySelector('[data-events="MMM-YYYY"]');
    const timeElement = event.querySelector('[data-custom="start-end-date"]');

    // Target element for the concatenated location string
    const locationElement = event.querySelector('[data-custom="location"]');

    const { startDate: startDateStr, endDate: endDateStr, timezone: timezoneId } = event.dataset;

    // 1. Check if the required date data actually exists in the CMS
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

      // Read event type early so we can use it for time formatting
      const eventType = (event.dataset.type || '').trim();

      // --- TIME FORMATTING LOGIC (Virtual vs Other) ---
      if (timeElement) {
        // Check if the event is strictly Virtual
        const isVirtual = eventType.toLowerCase() === 'virtual';

        if (isVirtual) {
          // Display dual timezones (PT / ET) for virtual events
          const ptTime = formatTimeForZone(startDate, 'America/Los_Angeles');
          const etTime = formatTimeForZone(startDate, 'America/New_York');
          timeElement.textContent = `${ptTime} / ${etTime}`;
        } else {
          // Display standard local timezone for In-person and Hybrid
          timeElement.textContent = formatTimeForZone(startDate, timezoneId);
        }
      }

      // --- LOCATION CONCATENATION LOGIC ---
      if (locationElement) {
        // Read all values from the card and trim accidental spaces
        const address1 = (event.dataset.address1 || '').trim();
        const address2 = (event.dataset.address2 || '').trim();
        const cityValue = (event.dataset.city || '').trim();
        const provinceValue = (event.dataset.province || '').trim();

        // Put them in an array and remove any empty values using .filter(Boolean)
        const locationParts = [address1, address2, cityValue, provinceValue].filter(Boolean);

        // Join them with a comma and space, and write to the element
        locationElement.textContent = locationParts.join(', ');
      }
      // ------------------------------------

      // Collect data for dynamic dropdowns
      const city = event.dataset.city || '';
      if (city !== '') citiesArr.push(city);

      if (eventType !== '') typesArr.push(eventType);

      eventsList.appendChild(event); // Move the item to the visible list
    } catch (error) {
      // 3. CATCH BLOCK: Prevents the site from crashing!
      console.warn('Invalid event found in the database. Skipping...', error);
      if (event.parentElement) event.parentElement.remove();
    }
  });

  // Remove leftover templates from the screen
  if (eventTemplate) eventTemplate.remove();
  if (eventsSource) eventsSource.remove();

  // Populate dynamic dropdowns
  const uniqueCities = [...new Set(citiesArr)].sort();
  populateSelectOptions(select, uniqueCities, 'All locations');

  const uniqueTypes = [...new Set(typesArr)].sort();
  populateSelectOptions(selectType, uniqueTypes, 'All types');

  let currentPage = 1;

  function updateDisplay() {
    // Read current filter values
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

    // Filter logic
    allEvents.forEach((event) => {
      const eventCity = (event.dataset.city || '').trim().toLowerCase();
      (event.dataset.type || '').trim().toLowerCase();
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

    // Pagination logic
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

  // EVENT LISTENERS FOR FILTERS AND PAGINATION
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

  // WALK/RUN BUTTON SPECIFIC LOGIC
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

  // Initial display call
  updateDisplay();
}

/**
 * Populates a select element with unique items and a default "All" option
 */
function populateSelectOptions(selectElement, uniqueItems, defaultText) {
  if (selectElement) {
    // Clear the dropdown in case Webflow inserted empty option tags
    selectElement.innerHTML = '';

    // Create the default option
    const defaultOption = document.createElement('option');
    // Leave value empty to pass the "selected === ''" filter check
    defaultOption.value = '';
    defaultOption.textContent = defaultText || 'All';
    selectElement.appendChild(defaultOption);

    // Add the remaining options from the database
    uniqueItems.forEach((item) => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      selectElement.appendChild(option);
    });
  }
}

export { events as default };
//# sourceMappingURL=events-CSH9ofLF.js.map
