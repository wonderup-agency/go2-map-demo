import { s as serializeInputs } from './functions-kZSwE9ie.js'

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
function helpline(component) {
  const webhookAddress = component.dataset.webhook || 'https://hook.us2.make.com/x3fm8t3nor5poc4ij7purslvicjo9sxr'
  const steps = component.querySelectorAll('[data-form="step"]')
  const ticketIdField = component.querySelector('[data-helpline-form="ticket-id-field"]')
  const nextButton = component.querySelector('[data-form="next-btn"]')
  const nextButtonInitialText = nextButton.firstChild.textContent

  const submitButton = component.querySelector('[data-form="submit-btn"]')
  const submitButtonInitialText = submitButton.firstChild.textContent

  const successEl = component.querySelector('.w-form-done')
  const failEl = component.querySelector('.w-form-fail')
  const formEl = component.querySelector('form')

  if (ticketIdField) {
    ticketIdField.disabled = true
    ticketIdField.type = 'hidden'
  }

  nextButton.addEventListener(
    'click',
    (e) => {
      // Skip processing for synthetic (dispatched) events – let Formly handle them
      if (!e.isTrusted) return

      if (e.currentTarget.classList.contains('disabled')) {
        e.preventDefault()
        e.stopImmediatePropagation()
        return
      }

      // Prevent Formly from advancing immediately
      e.preventDefault()
      e.stopImmediatePropagation()

      const firstStepData = serializeInputs(steps[0])

      // Disable button during async fetch
      nextButton.disabled = true
      nextButton.classList.add('disabled')
      nextButton.firstChild.textContent = 'Please wait...'

      fetch(webhookAddress, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firstStepData),
      })
        .then((response) => {
          if (!response.ok) throw new Error('Submission failed')
          return response.json()
        })
        .then((data) => {
          if (ticketIdField) {
            ticketIdField.value = data || ''
          }
          // Dispatch synthetic click to trigger Formly's step advancement
          const syntheticClick = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          })
          nextButton.dispatchEvent(syntheticClick)
          failEl.style.display = 'none'
          failEl.setAttribute('aria-hidden', 'true')
        })
        .catch((error) => {
          if (failEl) {
            failEl.style.display = 'block'
            failEl.setAttribute('aria-hidden', 'false')
            failEl.setAttribute('tabindex', '-1')
            setTimeout(() => failEl.focus(), 50)
          }
        })
        .finally(() => {
          nextButton.disabled = false
          nextButton.classList.remove('disabled')
          nextButton.firstChild.textContent = nextButtonInitialText
        })
    },
    true // Capture phase to intercept before Formly
  )

  submitButton.addEventListener(
    'click',
    (e) => {
      e.preventDefault()
      e.stopImmediatePropagation()

      if (ticketIdField?.value) {
        const secondStepData = serializeInputs(steps[1])
        secondStepData['ticket-id'] = ticketIdField.value

        submitButton.disabled = true
        submitButton.classList.add('disabled')
        submitButton.firstChild.textContent = 'Please wait...'

        fetch(webhookAddress, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(secondStepData),
        })
          .then((response) => {
            if (!response.ok) throw new Error('Submission failed')
            return response.json()
          })
          .then((data) => {
            if (formEl) {
              formEl.style.display = 'none'
              formEl.setAttribute('aria-hidden', 'true')
            }
            if (failEl) {
              failEl.style.display = 'none'
              failEl.setAttribute('aria-hidden', 'true')
            }

            if (successEl) {
              successEl.style.display = 'block'
              successEl.setAttribute('aria-hidden', 'false')
              successEl.setAttribute('tabindex', '-1')
              setTimeout(() => successEl.focus(), 50)
            }
          })
          .catch((error) => {
            if (formEl) {
              formEl.setAttribute('aria-hidden', 'true')
            }
            if (successEl) {
              successEl.style.display = 'none'
              successEl.setAttribute('aria-hidden', 'true')
            }

            if (failEl) {
              failEl.style.display = 'block'
              failEl.setAttribute('aria-hidden', 'false')
              failEl.setAttribute('tabindex', '-1')
              setTimeout(() => failEl.focus(), 50)
            }
          })
          .finally(() => {
            submitButton.disabled = false
            submitButton.classList.remove('disabled')
            submitButton.firstChild.textContent = submitButtonInitialText
          })
      } else {
        alert('There was an error updating your information...')
      }
    },
    true
  )
}

export { helpline as default }
//# sourceMappingURL=helpline-BWmxgbmX.js.map
