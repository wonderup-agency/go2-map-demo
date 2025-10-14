/**
 *
 * @param {HTMLElement} component
 */
export default async function (component) {
  const events = component.querySelectorAll('[data-events="event-element"]')

  events.forEach((event, i) => {
    const dayEl = event.querySelector('[data-events="DD"]')
    const monthYearEl = event.querySelector('[data-events="MMM-YYYY"]')
    const timeEl = event.querySelector('[data-custom="start-end-date"]')

    const startDateString = event.dataset.startDate
    const endDateString = event.dataset.endDate
    const timezoneString = event.dataset.timezone

    if (startDateString == '' || endDateString == '') {
      event.parentElement.remove()
      return
    }

    const startDate = new Date(startDateString)
    const endDate = new Date(endDateString)

    // Check if endDate is one day older than the current date in UTC
    const now = new Date() // Current date/time in UTC
    const utcEndDate = new Date(endDate.toISOString())
    const utcCurrentDate = new Date(now.toISOString())

    // Truncate to day for comparison (ignoring time)
    const endDateDay = new Date(
      utcEndDate.getUTCFullYear(),
      utcEndDate.getUTCMonth(),
      utcEndDate.getUTCDate()
    )
    const currentDateDay = new Date(
      utcCurrentDate.getUTCFullYear(),
      utcCurrentDate.getUTCMonth(),
      utcCurrentDate.getUTCDate()
    )

    // Check if endDate is exactly one day after current date
    const oneDayInMs = 24 * 60 * 60 * 1000 // One day in milliseconds
    if (endDateDay.getTime() + oneDayInMs <= currentDateDay.getTime()) {
      event.parentElement.remove();
      return
    }

    // Format day, month, year
    const dateOptions = {
      timeZone: timezoneString,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
    const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions)
    const startParts = dateFormatter.formatToParts(startDate)

    const day = startParts.find((part) => part.type === 'day').value
    const month = startParts.find((part) => part.type === 'month').value
    const year = startParts.find((part) => part.type === 'year').value

    dayEl.textContent = day
    monthYearEl.textContent = `${month} ${year}`

    // Format time (HH:MM AM/PM)
    const timeOptions = {
      timeZone: timezoneString,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }
    const timeFormatter = new Intl.DateTimeFormat('en-US', timeOptions)

    // Format start and end times
    const startTimeParts = timeFormatter.formatToParts(startDate)
    const endTimeParts = timeFormatter.formatToParts(endDate)

    // Extract hour, minute, and period (AM/PM)
    const startHour = startTimeParts.find((part) => part.type === 'hour').value
    const startMinute = startTimeParts.find(
      (part) => part.type === 'minute'
    ).value
    const startPeriod = startTimeParts.find(
      (part) => part.type === 'dayPeriod'
    ).value
    const endHour = endTimeParts.find((part) => part.type === 'hour').value
    const endMinute = endTimeParts.find((part) => part.type === 'minute').value
    const endPeriod = endTimeParts.find(
      (part) => part.type === 'dayPeriod'
    ).value

    // Combine into "HH:MMAM - HH:MMPM" format
    const timeRange = `${startHour}:${startMinute}${startPeriod} - ${endHour}:${endMinute}${endPeriod}`
    timeEl.textContent = timeRange
  })
}
