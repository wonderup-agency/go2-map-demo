import { h as hideFail, s as serializeInputs, v as validator, c as clearStepsErrors, a as appendStepsErrors, b as setButtonLoading, d as hideForm, e as showSuccess, f as showFail, r as resetButton } from './index-Bwtx51RF.js';
import './main-DqPHEQxV.js';

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
function including (component) {
  const formInstances = component.forEach ? component : [component];

  formInstances.forEach((formInstance) => {
    const webhookAddress = formInstance.dataset.webhook || 'https://hook.us2.make.com/vt23go8uc23q8emcv6jc3nqriswhtnyr';

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
        if (validator.isEmpty(submitInputsData['Including-GO2-Name'] || '')) {
          errors.push({
            fieldName: 'Including-GO2-Name',
            error: 'Enter your full name.',
            appendAt: '.multi-form14_field-wrapper',
          });
        }
        if (!validator.isEmail(submitInputsData['Including-GO2-Email'] || '')) {
          errors.push({
            fieldName: 'Including-GO2-Email',
            error: 'Enter a valid email address (example: name@email.com)',
            appendAt: '.multi-form14_field-wrapper',
          });
        }
        const phone = submitInputsData['Including-GO2-Phone'] || '';
        if (!validator.isMobilePhone(phone, 'any')) {
          errors.push({
            fieldName: 'Including-GO2-Phone',
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

export { including as default };
//# sourceMappingURL=including-DBOCVIa2.js.map
