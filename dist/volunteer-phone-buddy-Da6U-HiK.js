import { g as setupOtherFieldForSelect, i as setupOtherFieldForCheckbox, h as hideFail, s as serializeInputs, v as validator, c as clearStepsErrors, a as appendStepsErrors, b as setButtonLoading, f as showFail, r as resetButton, d as hideForm, e as showSuccess } from './index-CdprCw3t.js';
import './main-C_gHVAux.js';

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
function volunteerPhoneBuddy (component) {
  const formInstances = component.forEach ? component : [component];

  formInstances.forEach((formInstance) => {
    const webhookAddress = formInstance.dataset.webhook || 'https://hook.us2.make.com/vpc32gcapub110y6fye9o46a8nnlw7fq';
    const steps = Array.from(formInstance.querySelectorAll('[data-form="step"]'));
    const ticketIdField = formInstance.querySelector('[data-volunteer-phone-buddy-form="ticket-id-field"]');

    const successEl = formInstance.querySelector('.w-form-done');
    const failEl = formInstance.querySelector('.w-form-fail');
    const formEl = formInstance.querySelector('form');

    if (ticketIdField) {
      ticketIdField.disabled = true;
      ticketIdField.type = 'hidden';
    }

    setupOtherFieldForSelect({
      context: formInstance,
      selectId: 'Volunteer-Cancer-type',
      otherValue: 557,
      fieldName: 'Other-cancer-type',
      labelName: 'Specify other type of lung cancer',
      placeholder: 'Specify here'});

    setupOtherFieldForSelect({
      context: formInstance,
      selectId: 'Volunteer-How-did-you-heard-about-us',
      otherValue: 98,
      fieldName: 'Volunteer-Other-way-of-hearing-about-GO2',
      labelName: 'Describe other way of hearing about GO2',
      placeholder: 'Specify here'});

    setupOtherFieldForCheckbox({
      context: formInstance,
      checkboxGroup: 'Volunteer-Phone-Buddy-Treatment',
      otherValue: 8,
      fieldName: 'Volunteer-Other-treatment',
      labelName: 'Specify treatment',
      placeholder: 'Specify here',
      wrapperClass: 'multi-form14_field-wrapper',
    });

    // hide all steps except the first one
    steps.forEach((step, i) => {
      if (i !== 0) step.classList.add('hide');
    });

    formInstance.addEventListener('click', async (e) => {
      const target = e.target;
      const nextBtn = target.closest('[data-form="next-btn"]');
      const submitBtn = target.closest('[data-form="submit-btn"]');
      const buttonText = target.closest('.button_text');

      // NEXT BUTTON HANDLER
      if (nextBtn || (buttonText && nextBtn)) {
        // Hide fail element on button press (validations will rerun)
        hideFail(failEl);

        const currentStepEl = nextBtn.closest('[data-form="step"]');
        if (!currentStepEl) return // Avoid errors if no step found

        const currentStepIndex = Array.from(formEl?.children || []).indexOf(currentStepEl);
        if (currentStepIndex === -1) return // Invalid index, abort

        // Log for debugging
        console.log('Next button pressed - Step index:', currentStepIndex);

        const stepInputsData = await serializeInputs(currentStepEl);

        // Log serialized data for debugging
        console.log('Next button - Serialized step data:', stepInputsData);

        const errors = [];

        // Step-specific validations
        switch (currentStepIndex) {
          case 0:
            // First step validations
            if (validator.isEmpty(stepInputsData['Volunteer-Phone-Buddy-Name'] || '')) {
              errors.push({
                fieldName: 'Volunteer-Phone-Buddy-Name',
                error: 'Enter your full name',
                appendAt: '.multi-form14_field-wrapper',
              });
            }
            if (!validator.isEmail(stepInputsData['Volunteer-Phone-Buddy-Email'] || '')) {
              errors.push({
                fieldName: 'Volunteer-Phone-Buddy-Email',
                error: 'Enter a valid email address (example: name@email.com)',
                appendAt: '.multi-form14_field-wrapper',
              });
            }
            const phone = stepInputsData['Volunteer-Phone-Buddy-Phone'] || '';
            if (!validator.isMobilePhone(phone, 'any')) {
              errors.push({
                fieldName: 'Volunteer-Phone-Buddy-Phone',
                error: 'Enter a valid phone number (include area code)',
                appendAt: '.multi-form14_field-wrapper',
              });
            }
            break
        }

        // Clear any existing errors
        clearStepsErrors();

        // If there are errors, append them and stop
        if (errors.length > 0) {
          appendStepsErrors(errors, currentStepEl);
          return
        }

        // Set loading state
        const nextBtnTextEl = nextBtn.querySelector('.button_text') || nextBtn.firstChild;
        const nextBtnInitialText = nextBtnTextEl?.textContent || 'Next';
        setButtonLoading(nextBtn);

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
              ticketIdField.value = data?.ticket || data || '';
            }

            // Hide current step and show next if exists
            currentStepEl.classList.add('hide');
            const nextIndex = currentStepIndex + 1;
            if (nextIndex < steps.length) {
              steps[nextIndex].classList.remove('hide');
            } else {
              console.log('no more steps');
            }
          })
          .catch((error) => {
            console.error('Fetch error:', error);
            showFail(failEl);
          })
          .finally(() => {
            resetButton(nextBtn, nextBtnInitialText);
          });
      }

      // SUBMIT BUTTON HANDLER
      if (submitBtn || (buttonText && submitBtn)) {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Hide fail element on button press (validations will rerun)
        hideFail(failEl);

        const currentStepEl = submitBtn.closest('[data-form="step"]');
        if (!currentStepEl) return // Avoid errors if no step found

        const currentStepIndex = Array.from(formEl?.children || []).indexOf(currentStepEl);
        if (currentStepIndex === -1) return // Invalid index, abort

        // Log for debugging
        console.log('Submit button pressed - Step index:', currentStepIndex);

        const submitInputsData = await serializeInputs(currentStepEl);

        // Log serialized data for debugging
        console.log('Submit button - Serialized submit data:', submitInputsData);

        const errors = [];

        // Submit step validations
        if (!validator.isPostalCode(String(submitInputsData?.['Volunteer-Phone-Buddy-Zip-Code'] || ''), 'any')) {
          errors.push({
            fieldName: 'Volunteer-Phone-Buddy-Zip-Code',
            error: 'Enter a valid ZIP or postal code',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        if ('Other-cancer-type' in submitInputsData && validator.isEmpty(submitInputsData['Other-cancer-type'] || '')) {
          errors.push({
            fieldName: 'Other-cancer-type',
            error: 'Tell us what type of cancer you have',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        if (
          'Volunteer-Other-treatment' in submitInputsData &&
          validator.isEmpty(submitInputsData['Volunteer-Other-treatment'] || '')
        ) {
          errors.push({
            fieldName: 'Volunteer-Other-treatment',
            error: 'Specify the treatment you received',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        if (
          'Volunteer-Other-way-of-hearing-about-GO2' in submitInputsData &&
          validator.isEmpty(submitInputsData['Volunteer-Other-way-of-hearing-about-GO2'] || '')
        ) {
          errors.push({
            fieldName: 'Volunteer-Other-way-of-hearing-about-GO2',
            error: 'Describe how you heard about GO2',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        // Clear any existing errors
        clearStepsErrors();

        // If there are errors, append them and stop
        if (errors.length > 0) {
          appendStepsErrors(errors, currentStepEl);
          return
        }

        // Set loading state
        const submitBtnTextEl = submitBtn.querySelector('.button_text') || submitBtn.firstChild;
        const submitBtnInitialText = submitBtnTextEl?.textContent || 'Submit';
        setButtonLoading(submitBtn);

        submitInputsData['ticket-id'] = ticketIdField.value;

        // Modify message to contain information about: Phone-Buddy-Treatment, Other-treatment, How-did-you-heard-about-us, and Other-way-of-hearing-about-GO2
        let message = submitInputsData['Interest-in-becoming-a-Phone-Buddy'] || '';
        const fieldsToAppend = [
          { key: 'Volunteer-Phone-Buddy-Treatment', label: 'Treatment' },
          { key: 'Volunteer-Other-treatment', label: 'Other treatment' },
          {
            key: 'Volunteer-How-did-you-heard-about-us',
            label: 'How did you hear about GO2?',
          },
          {
            key: 'Volunteer-Other-way-of-hearing-about-GO2',
            label: 'Other way of hearing about GO2',
          },
        ];
        // REMAKE THIS SENDING HTML INSTEAD OF TEXT: Format appended fields as HTML for better rendering in the webhook receiver
        let appended = '';
        fieldsToAppend.forEach((field) => {
          if (submitInputsData.hasOwnProperty(field.key)) {
            const value = submitInputsData[field.key];
            let formattedValue = '';
            if (Array.isArray(value) && value.length > 0) {
              formattedValue = value.join(', ');
            } else if (typeof value === 'string' && value.trim() !== '') {
              formattedValue = value;
            } else if (value != null && value.toString().trim() !== '') {
              formattedValue = value.toString();
            }
            if (formattedValue) {
              appended += `<br><strong>${field.label}:</strong> ${formattedValue}`;
            }
          }
        });
        // Update the message if there's anything to append
        if (appended) {
          message = message.trim() ? `${message.trim()}.<br>${appended.trim()}` : appended.trim();
        }
        submitInputsData['Interest-in-becoming-a-Phone-Buddy'] = message;

        // Log final submit data for debugging
        console.log('Final submit data (with modified message):', submitInputsData);

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
            hideForm(formEl);
            showSuccess(successEl);
          })
          .catch((error) => {
            console.error('Submit fetch error:', error);
            showFail(failEl);
          })
          .finally(() => {
            resetButton(submitBtn, submitBtnInitialText);
          });
      }
    });
  });
}

export { volunteerPhoneBuddy as default };
//# sourceMappingURL=volunteer-phone-buddy-Da6U-HiK.js.map
