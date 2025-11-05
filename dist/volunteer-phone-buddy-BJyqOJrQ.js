import { a as setupOtherFieldForSelect, b as setupOtherFieldForCheckbox, s as serializeInputs } from './functions-kZSwE9ie.js';

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
function volunteerPhoneBuddy (component) {
  const webhookAddress =
    component.dataset.webhook ||
    'https://hook.us2.make.com/vpc32gcapub110y6fye9o46a8nnlw7fq';
  const steps = component.querySelectorAll('[data-form="step"]');
  const ticketIdField = component.querySelector(
    '[data-volunteer-phone-buddy-form="ticket-id-field"]'
  );

  const nextButton = component.querySelector('[data-form="next-btn"]');
  const nextButtonInitialText = nextButton.firstChild.textContent;

  const submitButton = component.querySelector('[data-form="submit-btn"]');
  const submitButtonInitialText = submitButton.firstChild.textContent;

  const successEl = component.querySelector('.w-form-done');
  const failEl = component.querySelector('.w-form-fail');
  const formEl = component.querySelector('form');

  // if (ticketIdField) {
  //   ticketIdField.disabled = true
  //   ticketIdField.type = 'hidden'
  // }

  setupOtherFieldForSelect({
    selectId: 'Volunteer-Cancer-type',
    otherValue: 557,
    fieldName: 'Other-cancer-type',
    labelName: 'Specify other type of lung cancer',
    placeholder: 'Specify here',
  });

  setupOtherFieldForSelect({
    selectId: 'Volunteer-How-did-you-heard-about-us',
    otherValue: 98,
    fieldName: 'Volunteer-Other-way-of-hearing-about-GO2',
    labelName: 'Describe other way of hearing about GO2',
    placeholder: 'Specify here',
  });

  setupOtherFieldForCheckbox({
    checkboxGroup: 'Volunteer-Phone-Buddy-Treatment',
    otherValue: 8,
    fieldName: 'Volunteer-Other-treatment',
    labelName: 'Specify treatment',
    placeholder: 'Specify here',
  });

  nextButton.addEventListener(
    'click',
    (e) => {
      // Skip processing for synthetic (dispatched) events – let Formly handle them
      if (!e.isTrusted) return

      if (e.currentTarget.classList.contains('disabled')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return
      }

      // Prevent Formly from advancing immediately
      e.preventDefault();
      e.stopImmediatePropagation();

      const firstStepData = serializeInputs(steps[0]);

      // Disable button during async fetch
      nextButton.disabled = true;
      nextButton.classList.add('disabled');
      nextButton.firstChild.textContent = 'Please wait...';

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
            ticketIdField.value = data || '';
          }
          // Dispatch synthetic click to trigger Formly's step advancement
          const syntheticClick = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          nextButton.dispatchEvent(syntheticClick);
          failEl.style.display = 'none';
          failEl.setAttribute('aria-hidden', 'true');
        })
        .catch((error) => {
          if (failEl) {
            failEl.style.display = 'block';
            failEl.setAttribute('aria-hidden', 'false');
            failEl.setAttribute('tabindex', '-1');
            setTimeout(() => failEl.focus(), 50);
          }
        })
        .finally(() => {
          nextButton.disabled = false;
          nextButton.classList.remove('disabled');
          nextButton.firstChild.textContent = nextButtonInitialText;
        });
    },
    true // Capture phase to intercept before Formly
  );

  submitButton.addEventListener(
    'click',
    (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (ticketIdField?.value) {
        const secondStepData = serializeInputs(steps[1]);
        // const secondStepData = serializeInputs(formEl)
        secondStepData['ticket-id'] = ticketIdField.value;

        // Modify message to contain information about: Phone-Buddy-Treatment, Other-treatment, How-did-you-heard-about-us, and Other-way-of-hearing-about-GO2
        let message = secondStepData['Interest-in-becoming-a-Phone-Buddy'] || '';
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

        //REMAKE THIS SENDING HTML INSTEAD OF TEXT: https://grok.com/c/b93e7ca3-9ed5-4017-a34b-914c12900b49
        // Build the appended string
        let appended = '';
        fieldsToAppend.forEach((field) => {
          if (secondStepData.hasOwnProperty(field.key)) {
            const value = secondStepData[field.key];
            if (Array.isArray(value) && value.length > 0) {
              appended += `\n${field.label}: ${value.join(', ')}`;
            } else if (typeof value === 'string' && value.trim() !== '') {
              appended += `\n${field.label}: ${value}`;
            }
            // For other types (e.g., numbers), coerce to string and add if non-empty
            else if (value != null && value.toString().trim() !== '') {
              appended += `\n${field.label}: ${value}`;
            }
          }
        });
        // Update the message if there's anything to append
        if (appended) {
          message = message.trim()
            ? `${message.trim()}.\n${appended.trim()}`
            : appended.trim();
        }
        secondStepData['Interest-in-becoming-a-Phone-Buddy'] = message;

        submitButton.disabled = true;
        submitButton.classList.add('disabled');
        submitButton.firstChild.textContent = 'Please wait...';

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
              formEl.style.display = 'none';
              formEl.setAttribute('aria-hidden', 'true');
            }
            if (failEl) {
              failEl.style.display = 'none';
              failEl.setAttribute('aria-hidden', 'true');
            }

            if (successEl) {
              successEl.style.display = 'block';
              successEl.setAttribute('aria-hidden', 'false');
              successEl.setAttribute('tabindex', '-1');
              setTimeout(() => successEl.focus(), 50);
            }
          })
          .catch((error) => {
            if (formEl) {
              formEl.setAttribute('aria-hidden', 'true');
            }
            if (successEl) {
              successEl.style.display = 'none';
              successEl.setAttribute('aria-hidden', 'true');
            }

            if (failEl) {
              failEl.style.display = 'block';
              failEl.setAttribute('aria-hidden', 'false');
              failEl.setAttribute('tabindex', '-1');
              setTimeout(() => failEl.focus(), 50);
            }
          })
          .finally(() => {
            submitButton.disabled = false;
            submitButton.classList.remove('disabled');
            submitButton.firstChild.textContent = submitButtonInitialText;
          });
      } else {
        alert('There was an error updating your information...');
      }
    },
    true
  );
}

export { volunteerPhoneBuddy as default };
//# sourceMappingURL=volunteer-phone-buddy-BJyqOJrQ.js.map
