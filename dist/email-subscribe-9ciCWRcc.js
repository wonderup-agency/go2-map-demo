import { h as hideFail, v as validator, b as setButtonLoading, d as hideForm, e as showSuccess, f as showFail, r as resetButton } from './index-1Nr8OLwu.js';
import './main-CLc-8hT6.js';

/**
 * Handles form submission for email-only subscribe forms (footer, banner, etc.).
 * Reads [data-webhook] for the endpoint and [data-tag] for the Mailchimp tag.
 * @param {HTMLElement} component - The form component wrapper element.
 */
function emailSubscribe (component) {
  const formInstances = component.forEach ? component : [component];

  formInstances.forEach((formInstance) => {
    const webhookAddress = formInstance.dataset.webhook || 'https://hook.us2.make.com/k96lr6zofh8eoy6mvchfk3qvjj5ru7zu';
    const tag = formInstance.dataset.tag;

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

        const emailInput = formEl.querySelector('input[name="email"]');
        const email = emailInput ? emailInput.value : '';

        // Clear any existing error
        formInstance.querySelectorAll('.validation-error').forEach((el) => el.remove());

        if (!validator.isEmail(email)) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'validation-error';
          errorDiv.textContent = 'Enter a valid email address';
          Object.assign(errorDiv.style, {
            position: 'absolute',
            top: '100%',
            left: '0',
            color: 'red',
            fontSize: '0.875rem',
          });
          formInstance.style.position = 'relative';
          formInstance.appendChild(errorDiv);
          return
        }

        // Set loading state
        const submitBtnTextEl = submitBtn.querySelector('.button_text') || submitBtn.firstChild;
        const submitBtnInitialText = submitBtnTextEl?.textContent || 'Submit';
        setButtonLoading(submitBtn);

        fetch(webhookAddress, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, tag }),
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

export { emailSubscribe as default };
//# sourceMappingURL=email-subscribe-9ciCWRcc.js.map
