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

function dlog(...args) {
  console.log('[FU Donation]', ...args);
}

function parseAmount(value) {
  if (value == null) return null
  const str = String(value);
  const num = Number(str.replace(/[^\d]/g, ''));
  return Number.isFinite(num) && num > 0 ? num : null
}

function isCollection(x) {
  return x instanceof NodeList || x instanceof HTMLCollection || Array.isArray(x)
}

function resolveToElements(input) {
  if (!input) return []

  if (input?.el || input?.element) {
    const el = input.el ?? input.element;
    return resolveToElements(el)
  }

  if (isCollection(input)) return Array.from(input)

  return [input]
}

function initOne(form) {
  if (!(form instanceof HTMLElement)) {
    dlog('SKIP: not an HTMLElement', form);
    return
  }

  const alreadyBound = form.dataset?.fuBound === 'true' || form.getAttribute('data-fu-bound') === 'true';
  if (alreadyBound) {
    dlog('SKIP: already bound', form);
    return
  }

  if (form.dataset) form.dataset.fuBound = 'true';
  else form.setAttribute('data-fu-bound', 'true');

  const campaignId = form.dataset?.campaignId ?? form.getAttribute('data-campaign-id') ?? 'FUNFTWMRGBN';

  dlog('INIT form', { form, campaignId });

  const amountRadios = form.querySelectorAll('input[name="donation-amount"][type="radio"]');
  if (amountRadios.length > 0 && !Array.from(amountRadios).some((r) => r.checked)) {
    amountRadios[0].checked = true;
    dlog('auto-checked first amount radio', amountRadios[0].value);
  }

  const otherButton = form.querySelector("[data-donation-form='other']");
  dlog('otherButton', otherButton ? 'FOUND' : 'MISSING');

  form.addEventListener('submit', (e) => {
    dlog('SUBMIT fired', form);
    e.preventDefault();

    const formData = new FormData(form);
    const recurring = formData.get('recurring') ?? 'once';

    const rawAmount = formData.get('donation-amount') ?? formData.get('amount') ?? formData.get('donation_amount');

    const parsed = parseAmount(rawAmount);
    const amount = parsed ?? 25;

    dlog('submit payload', { campaignId, recurring, rawAmount, parsed, amount });

    if (typeof FundraiseUp?.openCheckout !== 'function') {
      dlog('ABORT: FundraiseUp.openCheckout not available', { FundraiseUp });
      return
    }

    FundraiseUp.openCheckout(campaignId, {
      donation: { recurring, amount },
    });
  });

  if (otherButton) {
    otherButton.addEventListener('click', (e) => {
      dlog('OTHER click fired', form);
      e.preventDefault();

      const formData = new FormData(form);
      const recurring = formData.get('recurring') ?? 'once';

      dlog('other payload', { campaignId, recurring });

      if (typeof FundraiseUp?.openCheckout !== 'function') {
        dlog('ABORT: FundraiseUp.openCheckout not available', { FundraiseUp });
        return
      }

      FundraiseUp.openCheckout(campaignId, {
        donation: { recurring },
      });
    });
  }
}

/**
 * @param {HTMLElement|NodeList|HTMLCollection|Array|{el?:HTMLElement|NodeList, element?:HTMLElement|NodeList}} input
 */
function donation (input) {
  dlog('init called with:', input);

  const elements = resolveToElements(input);
  dlog('resolved elements count:', elements.length, elements);

  elements.forEach(initOne);
}

export { donation as default };
//# sourceMappingURL=donation-rIufMaSB.js.map
