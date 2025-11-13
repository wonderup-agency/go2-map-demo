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
export async function serializeInputs(root) {
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

  // helper to read a File as base64 (returns object with metadata + base64 content)
  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result
        const commaIdx = typeof dataUrl === 'string' ? dataUrl.indexOf(',') : -1
        const base64 = commaIdx === -1 ? dataUrl : dataUrl.slice(commaIdx + 1)
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          content: base64,
        })
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })

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
            return n.multiple ? Array.from(n.selectedOptions).map((o) => o.value) : n.value
          }
          return n.value
        })
      }
      continue
    }

    // handle file inputs (single and multiple)
    if (type === 'file') {
      if (nodes.length === 1) {
        const inputEl = nodes[0]
        const fileList = inputEl.files ? Array.from(inputEl.files) : []
        if (inputEl.multiple) {
          // array of file objects (may be empty array)
          result[name] = await Promise.all(fileList.map((f) => readFileAsBase64(f)))
        } else {
          // single file object or null if none selected
          result[name] = fileList.length ? await readFileAsBase64(fileList[0]) : null
        }
      } else {
        // multiple input[file] elements sharing the same name -> array of file objects / arrays
        result[name] = await Promise.all(
          nodes.map(async (n) => {
            const fileList = n.files ? Array.from(n.files) : []
            if (n.multiple) {
              return await Promise.all(fileList.map((f) => readFileAsBase64(f)))
            }
            return fileList.length ? await readFileAsBase64(fileList[0]) : null
          })
        )
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
 * @param {HTMLElement} options.context - Root element to use as context for queries
 * @param {string} options.selectId - ID of the <select> element to watch
 * @param {string|number} options.otherValue - Option value that should trigger the "other" field
 * @param {string} options.fieldName - name/id for the generated input
 * @param {string} options.labelName - label text for the generated input
 * @param {string} options.placeholder - placeholder text for the generated input
 */
export function setupOtherFieldForSelect({ context, selectId, otherValue, fieldName, labelName, placeholder }) {
  if (!context || !(context instanceof HTMLElement)) {
    console.error('A valid HTML element must be provided as context')
    return
  }

  const select = context.querySelector(`#${selectId}`)
  if (!select) {
    console.error(`Select element with ID "${selectId}" not found within the provided context.`)
    return
  }

  const handler = () => {
    const value = select.value
    const existing = context.querySelector(`#${fieldName}`)

    if (value === otherValue.toString()) {
      if (!existing) {
        const newField = createTextField(fieldName, labelName, placeholder)
        const wrapper = select.closest('.multi-form14_field-wrapper')
        if (wrapper) {
          wrapper.after(newField)
        } else {
          console.error(`Wrapper ".multi-form14_field-wrapper" not found for select "${selectId}".`)
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
 * @param {HTMLElement} options.context - Root element to use as context for queries
 * @param {string} options.checkboxGroup - name attribute of the checkbox group to query
 * @param {string|number} options.otherValue - checkbox value that should trigger the "other" field
 * @param {string} options.fieldName - name/id for the generated input
 * @param {string} options.labelName - label text for the generated input
 * @param {string} options.placeholder - placeholder text for the generated input
 * @param {string} [options.wrapperClass='multi-step_checkbox-wrapper'] - CSS class of the checkbox wrapper
 */
export function setupOtherFieldForCheckbox({
  context,
  checkboxGroup,
  otherValue,
  fieldName,
  labelName,
  placeholder,
  wrapperClass = 'multi-form14_field-wrapper', // Default value maintains backward compatibility
}) {
  if (!context || !(context instanceof HTMLElement)) {
    console.error('A valid HTML element must be provided as context')
    return
  }

  const checkbox = context.querySelector(`input[name="${checkboxGroup}"][value="${otherValue}"]`)
  if (!checkbox) {
    console.error(
      `Checkbox with name "${checkboxGroup}" and value "${otherValue}" not found within the provided context.`
    )
    return
  }

  const handler = () => {
    // const existing = context.querySelector(`#${fieldName}`)
    const existing = context.querySelector(`#${fieldName}`)

    if (checkbox.checked) {
      if (!existing) {
        const newField = createTextField(fieldName, labelName, placeholder)
        const specificWrapper = checkbox.closest(`.${wrapperClass}`)
        if (specificWrapper) {
          specificWrapper.after(newField)
        } else {
          console.error(`Wrapper ".${wrapperClass}" not found for checkbox with value "${otherValue}".`)
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

export function dependentFieldsForSelect({ context, selectId, dependentValue }) {
  if (!context || !(context instanceof Element)) {
    console.error('Invalid context provided. It must be a DOM element.')
    return
  }

  const selectElement = context.querySelector(`#${selectId}`)
  if (!selectElement || !(selectElement instanceof HTMLSelectElement)) {
    console.error(`Select element with ID "${selectId}" not found within the provided context.`)
    return
  }

  const updateDependents = () => {
    const currentValue = selectElement.value
    const shouldShow = currentValue === dependentValue

    const dependentElements = context.querySelectorAll(`[data-depends-on="${dependentValue}"]`)

    dependentElements.forEach((element) => {
      if (shouldShow) {
        element.classList.remove('hide')
        element.setAttribute('data-active', 'true')
      } else {
        element.classList.add('hide')
        element.setAttribute('data-active', 'false')
      }
    })
  }

  // Apply initial state
  updateDependents()

  // Add event listener for changes
  selectElement.addEventListener('change', updateDependents)
}

/**
 * Remove any validation error container inside the provided step element.
 *
 * @param {HTMLElement} currentStepEl - Root element of the current step where errors may be shown.
 * @returns {void}
 */
export function clearStepsErrors(currentStepEl) {
  document.querySelectorAll('.validation-error').forEach((el) => el.remove())
}

/**
 * Append validation error messages at specified locations.
 *
 * @param {Array<{fieldName: string, error: string, appendAt?: string}>} errors - Array of error objects
 * @param {HTMLElement} [scope] - Optional root element to scope queries and appended errors to (defaults to document)
 * @returns {void}
 */
export function appendStepsErrors(errors, scope) {
  const root = scope instanceof HTMLElement ? scope : document

  // Input validation
  if (!Array.isArray(errors)) {
    console.warn('appendStepsErrors: errors parameter must be an array')
    return
  }

  // Remove all existing error messages first (scoped)
  root.querySelectorAll('.validation-error').forEach((el) => el.remove())

  // helper to safely build [name="..."] selector
  const escapeName = (name) =>
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(name) : name

  // Process each error
  errors.forEach(({ fieldName, error, appendAt }) => {
    // Skip if error object is malformed
    if (!fieldName || !error) {
      console.warn('appendStepsErrors: invalid error object', { fieldName, error })
      return
    }

    // Find the input element first (scoped)
    const inputElement = root.querySelector(`[name="${escapeName(fieldName)}"]`)
    if (!inputElement) {
      console.warn(`appendStepsErrors: no input found with name "${fieldName}" in provided scope`)
      return
    }

    // Create error message element
    const errorDiv = document.createElement('div')
    errorDiv.className = 'validation-error'
    errorDiv.style.color = 'red'
    errorDiv.textContent = error

    // Determine where to append the error
    if (appendAt) {
      // Find closest container matching the selector from the input element
      const targetContainer = inputElement.closest(appendAt)
      if (!targetContainer || !root.contains(targetContainer)) {
        console.warn(
          `appendStepsErrors: no matching container found for selector "${appendAt}" near input "${fieldName}" within provided scope`
        )
        return
      }
      targetContainer.appendChild(errorDiv)
    } else {
      // Default behavior: append after the input or its wrapper (ensure it stays inside scope)
      const wrapper = inputElement.closest('.multi-form14_field-wrapper')
      const targetElement = wrapper && root.contains(wrapper) ? wrapper : inputElement
      targetElement.insertAdjacentElement('afterend', errorDiv)
    }
  })
}

/**
 * Disable a button element and replace its visible text with a loading message.
 * The function sets the button as disabled and adds a 'disabled' CSS class.
 *
 * @param {HTMLElement} btn - The button element to modify.
 * @param {string} [loadingText='Please wait...'] - Text to display while loading.
 * @returns {void}
 */
export function setButtonLoading(btn, loadingText = 'Please wait...') {
  if (!btn) return
  btn.disabled = true
  btn.classList.add('disabled')
  const textEl = btn.querySelector('.button_text') || btn.firstChild
  if (textEl && textEl.textContent) {
    textEl.textContent = loadingText
  }
}

/**
 * Restore a button's enabled state and reset its visible text.
 * Removes the 'disabled' CSS class and ensures the button is enabled.
 *
 * @param {HTMLElement} btn - The button element to restore.
 * @param {string} originalText - Text to restore on the button.
 * @returns {void}
 */
export function resetButton(btn, originalText) {
  if (!btn) return
  btn.disabled = false
  btn.classList.remove('disabled')
  const textEl = btn.querySelector('.button_text') || btn.firstChild
  if (textEl && textEl.textContent) {
    textEl.textContent = originalText
  }
}

/**
 * Hide and mark a "failure" UI element as hidden for accessibility.
 *
 * @param {HTMLElement|null} failEl - Element that displays failure messages.
 * @returns {void}
 */
export function hideFail(failEl) {
  if (failEl) {
    failEl.style.display = 'none'
    failEl.setAttribute('aria-hidden', 'true')
  }
}

/**
 * Show a "failure" UI element, set accessibility attributes, and focus it.
 *
 * @param {HTMLElement|null} failEl - Element that displays failure messages.
 * @returns {void}
 */
export function showFail(failEl) {
  if (failEl) {
    failEl.style.display = 'block'
    failEl.setAttribute('aria-hidden', 'false')
    failEl.setAttribute('tabindex', '-1')
    setTimeout(() => failEl.focus(), 50)
  }
}

/**
 * Show a "success" UI element, set accessibility attributes, and focus it.
 *
 * @param {HTMLElement|null} successEl - Element that displays success messages.
 * @returns {void}
 */
export function showSuccess(successEl) {
  if (successEl) {
    successEl.style.display = 'block'
    successEl.setAttribute('aria-hidden', 'false')
    successEl.setAttribute('tabindex', '-1')
    setTimeout(() => successEl.focus(), 50)
  }
}

/**
 * Hide the provided form element visually and update accessibility attributes.
 *
 * @param {HTMLElement|null} formEl - The form element to hide.
 * @returns {void}
 */
export function hideForm(formEl) {
  if (formEl) {
    formEl.classList.add('hide')
    formEl.setAttribute('aria-hidden', 'true')
  }
}
