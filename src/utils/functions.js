/**
 * Serialize inputs under a root element into an object suitable for POSTing.
 * Handles types: checkbox, radio, text, date, email, hidden, number, range, tel, select
 *
 * Usage:
 *   import { serializeInputs } from './utils/functions.js'
 *   const payload = serializeInputs(document.getElementById('root'))
 *
 * @param {HTMLElement} root
 * @returns {Object}
 */
export function serializeInputs(root) {
  if (!root || typeof root.querySelectorAll !== 'function') {
    throw new TypeError('serializeInputs expects a DOM element as the root')
  }

  // include select and textarea elements in the query
  const inputs = Array.from(root.querySelectorAll('input, select, textarea'))
  const groups = inputs.reduce((acc, input) => {
    const name = input.name
    if (!name)
      return acc // skip inputs without a name
    ;(acc[name] || (acc[name] = [])).push(input)
    return acc
  }, {})

  const safeNumber = (v) => {
    if (v === '') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : v
  }

  const result = {}

  for (const name in groups) {
    const nodes = groups[name]
    const first = nodes[0]
    const tag = (first.tagName || '').toLowerCase()
    const type = (first.type || '').toLowerCase()

    // handle select elements
    if (tag === 'select') {
      if (nodes.length === 1) {
        const s = nodes[0]
        if (s.multiple) {
          result[name] = Array.from(s.selectedOptions).map((o) => o.value)
        } else {
          result[name] = s.value
        }
      } else {
        // multiple select elements sharing the same name -> array of values/arrays
        result[name] = nodes.map((n) => {
          if ((n.tagName || '').toLowerCase() === 'select') {
            return n.multiple
              ? Array.from(n.selectedOptions).map((o) => o.value)
              : n.value
          }
          return n.value
        })
      }
      continue
    }

    if (type === 'checkbox') {
      if (nodes.length > 1) {
        // multiple checkboxes with same name -> array of checked values
        result[name] = nodes.filter((n) => n.checked).map((n) => n.value)
      } else {
        // single checkbox -> boolean if no explicit value, otherwise value or null when unchecked
        const n = nodes[0]
        const hasExplicitValue = n.hasAttribute('value')
        if (!hasExplicitValue) {
          result[name] = !!n.checked
        } else {
          result[name] = n.checked ? n.value : null
        }
      }
      continue
    }

    if (type === 'radio') {
      const checked = nodes.find((n) => n.checked)
      result[name] = checked ? checked.value : null
      continue
    }

    if (type === 'number' || type === 'range') {
      if (nodes.length === 1) {
        result[name] = safeNumber(nodes[0].value)
      } else {
        result[name] = nodes.map((n) => safeNumber(n.value))
      }
      continue
    }

    // text, textarea, date, email, hidden, tel and any other fallback types
    if (nodes.length === 1) {
      result[name] = nodes[0].value
    } else {
      result[name] = nodes.map((n) => n.value)
    }
  }

  return result
}
