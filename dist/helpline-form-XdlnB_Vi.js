/**
 * Serialize inputs under a root element into an object suitable for POSTing.
 * Handles types: checkbox, radio, text, date, email, hidden, number, range, tel, select
 *
 * Usage:
 *   import { serializeInputs } from './utils/functions.js'
 *   const payload = serializeInputs(document.getElementById('root'))
 *
 * @param {HTMLElement} root
 * @returns {Object}
 */
function serializeInputs(root) {
  if (!root || typeof root.querySelectorAll !== 'function') {
    throw new TypeError('serializeInputs expects a DOM element as the root')
  }

  // include select and textarea elements in the query
  const inputs = Array.from(root.querySelectorAll('input, select, textarea'));
  const groups = inputs.reduce((acc, input) => {
    const name = input.name;
    if (!name)
      return acc // skip inputs without a name
    ;(acc[name] || (acc[name] = [])).push(input);
    return acc
  }, {});

  const safeNumber = (v) => {
    if (v === '') return null
    const n = Number(v);
    return Number.isFinite(n) ? n : v
  };

  const result = {};

  for (const name in groups) {
    const nodes = groups[name];
    const first = nodes[0];
    const tag = (first.tagName || '').toLowerCase();
    const type = (first.type || '').toLowerCase();

    // handle select elements
    if (tag === 'select') {
      if (nodes.length === 1) {
        const s = nodes[0];
        if (s.multiple) {
          result[name] = Array.from(s.selectedOptions).map((o) => o.value);
        } else {
          result[name] = s.value;
        }
      } else {
        // multiple select elements sharing the same name -> array of values/arrays
        result[name] = nodes.map((n) => {
          if ((n.tagName || '').toLowerCase() === 'select') {
            return n.multiple
              ? Array.from(n.selectedOptions).map((o) => o.value)
              : n.value
          }
          return n.value
        });
      }
      continue
    }

    if (type === 'checkbox') {
      if (nodes.length > 1) {
        // multiple checkboxes with same name -> array of checked values
        result[name] = nodes.filter((n) => n.checked).map((n) => n.value);
      } else {
        // single checkbox -> boolean if no explicit value, otherwise value or null when unchecked
        const n = nodes[0];
        const hasExplicitValue = n.hasAttribute('value');
        if (!hasExplicitValue) {
          result[name] = !!n.checked;
        } else {
          result[name] = n.checked ? n.value : null;
        }
      }
      continue
    }

    if (type === 'radio') {
      const checked = nodes.find((n) => n.checked);
      result[name] = checked ? checked.value : null;
      continue
    }

    if (type === 'number' || type === 'range') {
      if (nodes.length === 1) {
        result[name] = safeNumber(nodes[0].value);
      } else {
        result[name] = nodes.map((n) => safeNumber(n.value));
      }
      continue
    }

    // text, textarea, date, email, hidden, tel and any other fallback types
    if (nodes.length === 1) {
      result[name] = nodes[0].value;
    } else {
      result[name] = nodes.map((n) => n.value);
    }
  }

  return result
}

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
function helplineForm (component) {
  const webhookAddress =
    component.dataset.webhook ||
    'https://hook.us2.make.com/x3fm8t3nor5poc4ij7purslvicjo9sxr';
  const steps = component.querySelectorAll('[data-form="step"]');
  const ticketIdField = component.querySelector(
    '[data-helpline-form="ticket-id-field"]'
  );
  const nextButton = component.querySelector('[data-form="next-btn"]');
  const nextButtonInitialText = nextButton.firstChild.textContent;

  const submitButton = component.querySelector('[data-form="submit-btn"]');
  const submitButtonInitialText = submitButton.firstChild.textContent;

  const successEl = component.querySelector('.w-form-done');
  const failEl = component.querySelector('.w-form-fail');
  const formEl = component.querySelector('form');

  if (ticketIdField) {
    ticketIdField.disabled = true;
    ticketIdField.type = 'hidden';
  }

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
        secondStepData['ticket-id'] = ticketIdField.value;

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

export { helplineForm as default };
//# sourceMappingURL=helpline-form-XdlnB_Vi.js.map
