/**
 * @param {HTMLElement} component
 */
export default async function (component) {
  const perDay = document.getElementById('smoke-per-day') // packs per day
  const years = document.getElementById('years')
  const result = document.getElementById('result')

  if (!perDay || !years || !result) return

  function parseNumber(v) {
    return v.trim() === '' ? NaN : Number(v.replace(',', '.'))
  }

  function formatNumber(n) {
    const intPart = Math.floor(n)
    const decimal = n - intPart
    if (decimal === 0) return intPart.toString()
    return n.toFixed(1)
  }

  function update() {
    const packsPerDay = parseNumber(perDay.value)
    const y = parseNumber(years.value)

    if (!Number.isFinite(packsPerDay) || !Number.isFinite(y)) {
      result.textContent = 'No result yet'
      return
    }

    const packYears = packsPerDay * y

    result.textContent = `${formatNumber(packYears)} pack years`
  }

  perDay.addEventListener('input', update)
  years.addEventListener('input', update)

  result.textContent = 'No result yet'
}
