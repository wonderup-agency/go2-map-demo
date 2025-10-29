/**
 * Serialize inputs under a root element into an object suitable for POSTing.
 * Handles types: checkbox, radio, text, textarea, date, email, hidden, number, range, tel, select
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

/**
 * Watch a <select> element and insert/remove an "other" text field when a specific option is selected.
 *
 * @param {Object} options
 * @param {string} options.selectId - ID of the <select> element to watch.
 * @param {string|number} options.otherValue - Option value that should trigger the "other" field.
 * @param {string} options.fieldName - name/id for the generated input.
 * @param {string} options.labelName - label text for the generated input.
 * @param {string} options.placeholder - placeholder text for the generated input.
 */
export function setupOtherFieldForSelect({
  selectId,
  otherValue,
  fieldName,
  labelName,
  placeholder,
}) {
  const select = document.getElementById(selectId)
  if (!select) {
    console.error(`Select element with ID "${selectId}" not found.`)
    return
  }

  const handler = () => {
    const value = select.value
    const existing = document.getElementById(fieldName)

    if (value === otherValue.toString()) {
      if (!existing) {
        const newField = createTextField(fieldName, labelName, placeholder)
        const wrapper = select.closest('.multi-form14_field-wrapper')
        if (wrapper) {
          wrapper.after(newField)
        } else {
          console.error(
            `Wrapper ".multi-form14_field-wrapper" not found for select "${selectId}".`
          )
        }
      }
    } else {
      if (existing) {
        const otherWrapper = existing.closest('.multi-form14_field-wrapper')
        if (otherWrapper) {
          otherWrapper.remove()
        }
      }
    }
  }

  select.addEventListener('change', handler)
  handler() // Run initially to handle pre-selected value
}

/**
 * Watch a checkbox (by name and value) and insert/remove an "other" text field when checked.
 *
 * @param {Object} options
 * @param {string} options.checkboxGroup - name attribute of the checkbox group to query.
 * @param {string|number} options.otherValue - checkbox value that should trigger the "other" field.
 * @param {string} options.fieldName - name/id for the generated input.
 * @param {string} options.labelName - label text for the generated input.
 * @param {string} options.placeholder - placeholder text for the generated input.
 */
export function setupOtherFieldForCheckbox({
  checkboxGroup,
  otherValue,
  fieldName,
  labelName,
  placeholder,
}) {
  const checkbox = document.querySelector(
    `input[name="${checkboxGroup}"][value="${otherValue}"]`
  )
  if (!checkbox) {
    console.error(
      `Checkbox with name "${checkboxGroup}" and value "${otherValue}" not found.`
    )
    return
  }

  const handler = () => {
    const existing = document.getElementById(fieldName)

    if (checkbox.checked) {
      if (!existing) {
        const newField = createTextField(fieldName, labelName, placeholder)
        const specificWrapper = checkbox.closest('.multi-step_checkbox-wrapper')
        if (specificWrapper) {
          specificWrapper.after(newField)
        } else {
          console.error(
            `Wrapper ".multi-step_checkbox-wrapper" not found for checkbox with value "${otherValue}".`
          )
        }
      }
    } else {
      if (existing) {
        const otherWrapper = existing.closest('.multi-form14_field-wrapper')
        if (otherWrapper) {
          otherWrapper.remove()
        }
      }
    }
  }

  checkbox.addEventListener('change', handler)
  handler() // Run initially to handle pre-checked state
}

/**
 * Create a DOM wrapper containing a label and text input used for "other" fields.
 *
 * @private
 * @param {string} fieldName - id and name for the generated input.
 * @param {string} labelName - text content for the label.
 * @param {string} placeholder - placeholder text for the input.
 * @returns {HTMLElement} wrapper element containing the label and input.
 */
function createTextField(fieldName, labelName, placeholder) {
  const div = document.createElement('div')
  div.className = 'multi-form14_field-wrapper'

  const label = document.createElement('label')
  label.htmlFor = fieldName
  label.className = 'form_field-label'
  label.textContent = labelName

  const input = document.createElement('input')
  input.className = 'form_input2 w-input'
  input.maxLength = 256
  input.name = fieldName
  input.dataset.name = fieldName
  input.placeholder = placeholder
  input.type = 'text'
  input.id = fieldName
  input.required = true

  div.appendChild(label)
  div.appendChild(input)

  return div
}
