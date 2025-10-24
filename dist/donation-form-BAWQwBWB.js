var list_1;
var hasRequiredList;

function requireList () {
	if (hasRequiredList) return list_1;
	hasRequiredList = 1;

	let list = {
	  comma(string) {
	    return list.split(string, [','], true)
	  },

	  space(string) {
	    let spaces = [' ', '\n', '\t'];
	    return list.split(string, spaces)
	  },

	  split(string, separators, last) {
	    let array = [];
	    let current = '';
	    let split = false;

	    let func = 0;
	    let inQuote = false;
	    let prevQuote = '';
	    let escape = false;

	    for (let letter of string) {
	      if (escape) {
	        escape = false;
	      } else if (letter === '\\') {
	        escape = true;
	      } else if (inQuote) {
	        if (letter === prevQuote) {
	          inQuote = false;
	        }
	      } else if (letter === '"' || letter === "'") {
	        inQuote = true;
	        prevQuote = letter;
	      } else if (letter === '(') {
	        func += 1;
	      } else if (letter === ')') {
	        if (func > 0) func -= 1;
	      } else if (func === 0) {
	        if (separators.includes(letter)) split = true;
	      }

	      if (split) {
	        if (current !== '') array.push(current.trim());
	        current = '';
	        split = false;
	      } else {
	        current += letter;
	      }
	    }

	    if (last || current !== '') array.push(current.trim());
	    return array
	  }
	};

	list_1 = list;
	list.default = list;
	return list_1;
}

requireList();

/**
 *
 * @param {HTMLElement} form
 */
function donationForm (form) {
  const campaignId = form.dataset.campaignId ?? 'FUNFTWMRGBN';

  // Autoselect the first radio button for donation-amount if available
  const amountRadios = form.querySelectorAll(
    'input[name="donation-amount"][type="radio"]'
  );
  if (amountRadios.length > 0) {
    amountRadios[0].checked = true;
  }

  const otherButton = form.querySelector("[data-donation-form='other']");

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const recurring = formData.get('recurring') ?? 'once';
    let amount = formData.get('donation-amount');

    // Clean and parse amount; default to 25 if invalid or missing
    amount = Number(amount?.replace(/\D/g, '')) || 25;

    FundraiseUp.openCheckout(campaignId, {
      donation: {
        recurring,
        amount,
      },
    });
  });

  otherButton.addEventListener("click", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const recurring = formData.get('recurring') ?? 'once';
    FundraiseUp.openCheckout(campaignId, {
      donation: {
        recurring,
      },
    });
  });
}

export { donationForm as default };
//# sourceMappingURL=donation-form-BAWQwBWB.js.map
