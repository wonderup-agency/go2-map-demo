import { h as hideFail, s as serializeInputs, v as validator, c as clearStepsErrors, a as appendStepsErrors, b as setButtonLoading, d as hideForm, e as showSuccess, f as showFail, r as resetButton } from './index-BhpeIdZM.js';
import './main-B-bfJOMd.js';

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
function joinUs (component) {
  const formInstances = component.forEach ? component : [component];

  formInstances.forEach((formInstance) => {
    const webhookAddress = formInstance.dataset.webhook || 'https://hook.us2.make.com/k96lr6zofh8eoy6mvchfk3qvjj5ru7zu';

    const successEl = formInstance.querySelector('.w-form-done');
    const failEl = formInstance.querySelector('.w-form-fail');
    const formEl = formInstance.querySelector('form');

    formInstance.addEventListener('click', async (e) => {
      const target = e.target;
      const submitBtn = target.closest('[data-form="submit-btn"]');
      const buttonText = target.closest('.button_text');

      // SUBMIT BUTTON HANDLER
      if (submitBtn || (buttonText && submitBtn)) {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Hide fail element on button press (validations will rerun)
        hideFail(failEl);

        const submitInputsData = await serializeInputs(formEl);

        // Log serialized data for debugging
        console.log('Submit button - Serialized submit data:', submitInputsData);

        const errors = [];

        // Submit step validations
        if (validator.isEmpty(submitInputsData['first-name'] || '')) {
          errors.push({
            fieldName: 'first-name',
            error: 'Enter your first name.',
            appendAt: '.multi-form14_field-wrapper',
          });
        }
        if (validator.isEmpty(submitInputsData['last-name'] || '')) {
          errors.push({
            fieldName: 'last-name',
            error: 'Enter your last name.',
            appendAt: '.multi-form14_field-wrapper',
          });
        }
        if (!validator.isEmail(submitInputsData['email'] || '')) {
          errors.push({
            fieldName: 'email',
            error: 'Enter a valid email address (example: name@email.com)',
            appendAt: '.multi-form14_field-wrapper',
          });
        }
        const phone = submitInputsData['phone'] || '';
        if (!validator.isMobilePhone(phone, 'any')) {
          errors.push({
            fieldName: 'phone',
            error: 'Enter a valid phone number (digits only, include area code)',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        // Clear any existing errors
        clearStepsErrors();

        // If there are errors, append them and stop
        if (errors.length > 0) {
          appendStepsErrors(errors);
          return
        }

        // Set loading state
        const submitBtnTextEl = submitBtn.querySelector('.button_text') || submitBtn.firstChild;
        const submitBtnInitialText = submitBtnTextEl?.textContent || 'Submit';
        setButtonLoading(submitBtn);

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

export { joinUs as default };
//# sourceMappingURL=join-us-BziqqWAf.js.map
