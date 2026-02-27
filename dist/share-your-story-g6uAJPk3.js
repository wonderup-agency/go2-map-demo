import { g as setupOtherFieldForSelect, j as dependentFieldsForSelect, h as hideFail, s as serializeInputs, v as validator, c as clearStepsErrors, a as appendStepsErrors, b as setButtonLoading, d as hideForm, e as showSuccess, f as showFail, r as resetButton } from './index-CXMJQAf7.js';
import './main-WAu8cVqd.js';

/**
 * Handles form submission for a multi-step form component.
 * @param {HTMLElement} component - The form component containing steps and inputs.
 */
function shareYourStory (component) {
  const formInstances = component.forEach ? component : [component];

  formInstances.forEach((formInstance) => {
    const webhookAddress = formInstance.dataset.webhook || 'https://hook.us2.make.com/8obr35mtbmpo6xdqasiq9ythue5h2s2g';

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
      selectId: 'cancer-type',
      otherValue: 'other-type',
      fieldName: 'other-cancer-type',
      labelName: 'Other cancer type',
      placeholder: 'Specify type of cancer'});
    dependentFieldsForSelect({
      context: formInstance,
      selectId: 'diagnosed',
      dependentValue: 'is-diagnosed',
    });

    const fileInput = document.getElementById('photo-files');
    const listDiv = document.getElementById('files-list');
    let selectedFiles = [];
    fileInput.addEventListener('click', () => {
      listDiv.innerHTML = '';
      selectedFiles = [];
    });
    fileInput.addEventListener('change', () => {
      const files = Array.from(fileInput.files);
      if (files.length === 0) return
      listDiv.innerHTML = '';
      selectedFiles = [];
      let completedFiles = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          completedFiles++;
          selectedFiles.push(file);
          if (completedFiles === files.length) {
            displayFileList();
          }
        });
        reader.addEventListener('error', () => {
          alert(`Error loading ${file.name}`);
        });
        reader.readAsDataURL(file); // Read to simulate loading to memory with progress
      });
    });
    function displayFileList() {
      listDiv.innerHTML = '';
      selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '(remove)';
        removeBtn.type = 'button';
        removeBtn.addEventListener('click', () => {
          selectedFiles.splice(index, 1);
          updateInputFiles();
          displayFileList();
        });
        fileItem.textContent = `${file.name} `;
        fileItem.appendChild(removeBtn);
        listDiv.appendChild(fileItem);
      });
    }
    function updateInputFiles() {
      const dt = new DataTransfer();
      selectedFiles.forEach((file) => dt.items.add(file));
      fileInput.files = dt.files;
    }

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
        if (validator.isEmpty(submitInputsData['city'] || '')) {
          errors.push({
            fieldName: 'city',
            error: 'Enter a valid city name',
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

        if (validator.isEmpty(submitInputsData['experience'] || '')) {
          errors.push({
            fieldName: 'experience',
            error: 'Please tell us your experience with lung cancer.',
            appendAt: '.multi-form14_field-wrapper',
          });
        }

        const diagnosisDateInput = formInstance.querySelector(`#diagnosis-date`);
        const diagnosisDateWrapper = diagnosisDateInput.closest('[data-depends-on]');
        const validateDiagnosisDate = diagnosisDateWrapper.getAttribute('data-active') === 'true';
        const diagnosisDate = submitInputsData['diagnosis-date'] ?? '';
        if (validateDiagnosisDate && validator.isEmpty(diagnosisDate)) {
          errors.push({
            fieldName: 'diagnosis-date',
            error: 'Enter the diangosis date',
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

        // remove conditional fields from final object
        if (document.querySelector('#diagnosed').value != 'is-diagnosed') {
          delete submitInputsData['cancer-type'];
          delete submitInputsData['cancer-stage'];
          delete submitInputsData['diagnosis-date'];
          delete submitInputsData['other-cancer-type'];
        }
        delete submitInputsData['photo-files-old'];

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

export { shareYourStory as default };
//# sourceMappingURL=share-your-story-g6uAJPk3.js.map
