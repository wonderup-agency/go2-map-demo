import { g as setupOtherFieldForSelect, h as hideFail, s as serializeInputs, v as validator, c as clearStepsErrors, a as appendStepsErrors, b as setButtonLoading, d as hideForm, e as showSuccess, f as showFail, r as resetButton } from './index-D1F00rS5.js';
import './main-pt5vz5wJ.js';

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
function mindOverMatter (component) {
  const formInstances = component.forEach ? component : [component];

  formInstances.forEach((formInstance) => {
    const webhookAddress = formInstance.dataset.webhook || 'https://hook.us2.make.com/ax5pllsfmf5zl2lwfprq5og2locrkmyi';

    const successEl = formInstance.querySelector('.w-form-done');
    const failEl = formInstance.querySelector('.w-form-fail');
    const formEl = formInstance.querySelector('form');

    setupOtherFieldForSelect({
      context: formInstance,
      selectId: 'connection-to-lung-cancer',
      otherValue: 'other-connection',
      fieldName: 'other-connection-to-cancer',
      labelName: 'Specify other connection',
      placeholder: 'Specify your connection to lung cancer'});
    setupOtherFieldForSelect({
      context: formInstance,
      selectId: 'hear-about-mom',
      otherValue: 'other-way',
      fieldName: 'hear-about-mom-other',
      labelName: 'How did you hear about GO2',
      placeholder: 'Specify how did you hear about GO2'});

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
        if (validator.isEmpty(submitInputsData['full-name'] || '')) {
          errors.push({
            fieldName: 'full-name',
            error: 'Enter your full name.',
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
        if (!validator.isPostalCode(String(submitInputsData?.['zip-code'] || ''), 'any')) {
          errors.push({
            fieldName: 'zip-code',
            error: 'Enter a valid ZIP or postal code',
            appendAt: '.multi-form14_field-wrapper',
          });
        }
        if (
          'other-connection-to-cancer' in submitInputsData &&
          validator.isEmpty(submitInputsData['other-connection-to-cancer'] || '')
        ) {
          errors.push({
            fieldName: 'other-connection-to-cancer',
            error: 'Tell us your connection to lung cancer',
            appendAt: '.multi-form14_field-wrapper',
          });
        }
        if (
          'hear-about-mom-other' in submitInputsData &&
          validator.isEmpty(submitInputsData['hear-about-mom-other'] || '')
        ) {
          errors.push({
            fieldName: 'hear-about-mom-other',
            error: 'Tell us how you heard about GO2',
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

export { mindOverMatter as default };
//# sourceMappingURL=mind-over-matter-B092R60D.js.map
