import { g as setupOtherFieldForSelect, i as setupOtherFieldForCheckbox, j as dependentFieldsForSelect, h as hideFail, s as serializeInputs, v as validator, c as clearStepsErrors, a as appendStepsErrors, b as setButtonLoading, f as showFail, r as resetButton, d as hideForm, e as showSuccess } from './index-CXMJQAf7.js';
import './main-WAu8cVqd.js';

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
function supportGroupInterest (component) {
  const formInstances = component.forEach ? component : [component];

  formInstances.forEach((formInstance) => {
    const webhookAddress = formInstance.dataset.webhook || 'https://hook.us2.make.com/eyhunqogl9rgad784tzw3qf0klx5vusm';
    const steps = Array.from(formInstance.querySelectorAll('[data-form="step"]'));
    const idField = formInstance.querySelector('#id');

    const successEl = formInstance.querySelector('.w-form-done');
    const failEl = formInstance.querySelector('.w-form-fail');
    const formEl = formInstance.querySelector('form');

    if (idField) {
      idField.disabled = true;
      idField.type = 'hidden';
    }

    setupOtherFieldForSelect({
      context: formInstance,
      selectId: 'connection-to-lung-cancer',
      otherValue: 'other-connection',
      fieldName: 'other-connection-to-lung-cancer',
      labelName: 'Specify other connection to lung cancer',
      placeholder: 'Specify here'});

    setupOtherFieldForCheckbox({
      context: formInstance,
      checkboxGroup: 'interests',
      otherValue: 'Other interests',
      fieldName: 'other-interests',
      labelName: 'Specify other interests',
      placeholder: 'Specify here',
      wrapperClass: 'multi-form14_field-wrapper',
    });

    dependentFieldsForSelect({
      context: formInstance,
      selectId: 'copy-of-building-community-guide',
      dependentValue: 'Wants a copy via Mail',
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
            if (validator.isEmpty(stepInputsData['first-name'] || '')) {
              errors.push({
                fieldName: 'first-name',
                error: 'Enter your first name',
                appendAt: '.multi-form14_field-wrapper',
              });
            }
            if (validator.isEmpty(stepInputsData['last-name'] || '')) {
              errors.push({
                fieldName: 'last-name',
                error: 'Enter your last name',
                appendAt: '.multi-form14_field-wrapper',
              });
            }
            if (!validator.isEmail(stepInputsData['email'] || '')) {
              errors.push({
                fieldName: 'email',
                error: 'Enter a valid email address (example: name@email.com)',
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
            if (idField) {
              idField.value = data.id;
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

        // const submitInputsData = serializeInputs(currentStepEl)
        const submitInputsData = await serializeInputs(formInstance);

        // Log serialized data for debugging
        console.log('Submit button - Serialized submit data:', submitInputsData);

        const errors = [];

        if (
          'other-connection-to-lung-cancer' in submitInputsData &&
          validator.isEmpty(submitInputsData['other-connection-to-lung-cancer'] || '')
        ) {
          errors.push({
            fieldName: 'other-connection-to-lung-cancer',
            error: 'Tell us your conection to long cancer',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        if ('other-interests' in submitInputsData && validator.isEmpty(submitInputsData['other-interests'] || '')) {
          errors.push({
            fieldName: 'other-interests',
            error: 'Tell us what are your interests',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        const streetAddressInput = currentStepEl.querySelector(`#street-address`);
        const streetAddressWrapper = streetAddressInput.closest('[data-depends-on]');
        const validateStreetAddress = streetAddressWrapper.getAttribute('data-active') === 'true';
        const streetAddress = submitInputsData['street-address'] ?? '';
        if (validateStreetAddress && validator.isEmpty(streetAddress)) {
          errors.push({
            fieldName: 'street-address',
            error: 'Enter a valid street address',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        const cityInput = currentStepEl.querySelector(`#city`);
        const cityWrapper = cityInput.closest('[data-depends-on]');
        const validateCity = cityWrapper.getAttribute('data-active') === 'true';
        const city = submitInputsData['city'] ?? '';
        if (validateCity && validator.isEmpty(city)) {
          errors.push({
            fieldName: 'city',
            error: 'Enter a valid city name',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        const zipCodeInput = currentStepEl.querySelector(`#zip-code`);
        const zipCodeWrapper = zipCodeInput.closest('[data-depends-on]');
        const validateZipCode = zipCodeWrapper.getAttribute('data-active') === 'true';
        const zipCode = submitInputsData['zip-code'] ?? '';
        if (validateZipCode && !validator.isPostalCode(String(zipCode), 'any')) {
          errors.push({
            fieldName: 'zip-code',
            error: 'Enter a valid ZIP or postal code',
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

        // remove conditional fields from final object
        if (document.querySelector('#copy-of-building-community-guide').value != 'Wants a copy via Mail') {
          delete submitInputsData['street-address'];
          delete submitInputsData.city;
          delete submitInputsData.state;
          delete submitInputsData['zip-code'];
        }

        // Set loading state
        const submitBtnTextEl = submitBtn.querySelector('.button_text') || submitBtn.firstChild;
        const submitBtnInitialText = submitBtnTextEl?.textContent || 'Submit';
        setButtonLoading(submitBtn);

        submitInputsData['id'] = idField.value;

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

export { supportGroupInterest as default };
//# sourceMappingURL=support-group-interest-DSfc6lwK.js.map
