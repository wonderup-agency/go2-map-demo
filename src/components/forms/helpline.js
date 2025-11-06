import {
  serializeInputs,
  setupOtherFieldForSelect,
  setupOtherFieldForCheckbox,
  clearStepsErrors,
  appendStepsErrors,
  setButtonLoading,
  resetButton,
  hideFail,
  showFail,
  showSuccess,
  hideForm,
} from '../../utils/functions'

import validator from 'validator'

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
export default function (component) {
  const webhookAddress = component.dataset.webhook || 'https://hook.us2.make.com/x3fm8t3nor5poc4ij7purslvicjo9sxr'
  const steps = Array.from(component.querySelectorAll('[data-form="step"]'))
  const ticketIdField = component.querySelector('[data-helpline-form="ticket-id-field"]')

  const successEl = component.querySelector('.w-form-done')
  const failEl = component.querySelector('.w-form-fail')
  const formEl = component.querySelector('form')

  if (ticketIdField) {
    ticketIdField.disabled = true
    ticketIdField.type = 'hidden'
  }

  // hide all steps except the first one
  steps.forEach((step, i) => {
    if (i !== 0) step.classList.add('hide')
  })

  component.addEventListener('click', (e) => {
      const target = e.target
      const nextBtn = target.closest('[data-form="next-btn"]')
      const submitBtn = target.closest('[data-form="submit-btn"]')
      const buttonText = target.closest('.button_text')
  
      // NEXT BUTTON HANDLER
      if (nextBtn || (buttonText && nextBtn)) {
        // Hide fail element on button press (validations will rerun)
        hideFail(failEl)
  
        const currentStepEl = nextBtn.closest('[data-form="step"]')
        if (!currentStepEl) return // Avoid errors if no step found
  
        const currentStepIndex = Array.from(formEl?.children || []).indexOf(currentStepEl)
        if (currentStepIndex === -1) return // Invalid index, abort
  
        // Log for debugging
        console.log('Next button pressed - Step index:', currentStepIndex)
  
        const stepInputsData = serializeInputs(currentStepEl)
  
        // Log serialized data for debugging
        console.log('Next button - Serialized step data:', stepInputsData)
  
        const errors = []
  
        // Step-specific validations
        switch (currentStepIndex) {
          case 0:
            // First step validations
            if (validator.isEmpty(stepInputsData['HelpLine-Name'] || '')) {
              errors.push('Enter your full name.')
            }
            if (!validator.isEmail(stepInputsData['HelpLine-Email'] || '')) {
              errors.push('Enter a valid email address (example: name@email.com)')
            }
            if (!validator.isMobilePhone(stepInputsData['HelpLine-Phone'] || '')) {
              errors.push('Enter a valid phone number (digits only, include area code)')
            }
            break
  
          // Add more cases as needed for other steps
  
          default:
            break
        }
  
        // Clear any existing errors
        clearStepsErrors(currentStepEl)
  
        // If there are errors, append them and stop
        if (errors.length > 0) {
          appendStepsErrors(currentStepEl, errors)
          return
        }
  
        // Set loading state
        const nextBtnTextEl = nextBtn.querySelector('.button_text') || nextBtn.firstChild
        const nextBtnInitialText = nextBtnTextEl?.textContent || 'Next'
        setButtonLoading(nextBtn)
  
        fetch(webhookAddress, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stepInputsData),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
          })
          .then((data) => {
            if (ticketIdField) {
              ticketIdField.value = data?.ticket || data || ''
            }
  
            // Hide current step and show next if exists
            currentStepEl.classList.add('hide')
            const nextIndex = currentStepIndex + 1
            if (nextIndex < steps.length) {
              steps[nextIndex].classList.remove('hide')
            } else {
              console.log('no more steps')
            }
          })
          .catch((error) => {
            console.error('Fetch error:', error)
            showFail(failEl)
          })
          .finally(() => {
            resetButton(nextBtn, nextBtnInitialText)
          })
      }
  
      // SUBMIT BUTTON HANDLER
      if (submitBtn || (buttonText && submitBtn)) {
        e.preventDefault()
        e.stopImmediatePropagation()
  
        // Hide fail element on button press (validations will rerun)
        hideFail(failEl)
  
        const currentStepEl = submitBtn.closest('[data-form="step"]')
        if (!currentStepEl) return // Avoid errors if no step found
  
        const currentStepIndex = Array.from(formEl?.children || []).indexOf(currentStepEl)
        if (currentStepIndex === -1) return // Invalid index, abort
  
        // Log for debugging
        console.log('Submit button pressed - Step index:', currentStepIndex)
  
        const submitInputsData = serializeInputs(currentStepEl)
  
        // Log serialized data for debugging
        console.log('Submit button - Serialized submit data:', submitInputsData)
  
        const errors = []
  
        // Submit step validations
        // if (!validator.isPostalCode(String(submitInputsData?.['Phone-Buddy-Zip-Code'] || ''), 'any')) {
        //   errors.push('Enter a valid ZIP or postal code.')
        // }
  
        // if ('Other-cancer-type' in submitInputsData && validator.isEmpty(submitInputsData['Other-cancer-type'] || '')) {
        //   errors.push('Tell us what type of cancer you have.')
        // }
  
        // if ('Other-treatment' in submitInputsData && validator.isEmpty(submitInputsData['Other-treatment'] || '')) {
        //   errors.push('Specify the treatment you received.')
        // }
  
        // if (
        //   'Other-way-of-hearing-about-GO2' in submitInputsData &&
        //   validator.isEmpty(submitInputsData['Other-way-of-hearing-about-GO2'] || '')
        // ) {
        //   errors.push('Describe how you heard about GO2.')
        // }
  
        // Clear any existing errors
        clearStepsErrors(currentStepEl)
  
        // If there are errors, append them and stop
        if (errors.length > 0) {
          appendStepsErrors(currentStepEl, errors)
          return
        }
  
        // Set loading state
        const submitBtnTextEl = submitBtn.querySelector('.button_text') || submitBtn.firstChild
        const submitBtnInitialText = submitBtnTextEl?.textContent || 'Submit'
        setButtonLoading(submitBtn)
  
        submitInputsData['ticket-id'] = ticketIdField.value
  
        fetch(webhookAddress, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitInputsData),
        })
          .then((response) => {
            if (!response.ok) throw new Error('Submission failed')
            return response.json()
          })
          .then((data) => {
            hideForm(formEl)
            showSuccess(successEl)
          })
          .catch((error) => {
            console.error('Submit fetch error:', error)
            showFail(failEl)
          })
          .finally(() => {
            resetButton(submitBtn, submitBtnInitialText)
          })
      }
    })




  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
  // ###
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
