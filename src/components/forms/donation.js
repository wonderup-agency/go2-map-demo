import { comma } from 'postcss/lib/list'

const FU_DEBUG = true
function dlog(...args) {
  if (!FU_DEBUG) return
  console.log('[FU Donation]', ...args)
}

function parseAmount(value) {
  if (value == null) return null
  const str = String(value)
  const num = Number(str.replace(/[^\d]/g, ''))
  return Number.isFinite(num) && num > 0 ? num : null
}

function isCollection(x) {
  return x instanceof NodeList || x instanceof HTMLCollection || Array.isArray(x)
}

function resolveToElements(input) {
  if (!input) return []

  if (input?.el || input?.element) {
    const el = input.el ?? input.element
    return resolveToElements(el)
  }

  if (isCollection(input)) return Array.from(input)

  return [input]
}

function initOne(form) {
  if (!(form instanceof HTMLElement)) {
    dlog('SKIP: not an HTMLElement', form)
    return
  }

  const alreadyBound = form.dataset?.fuBound === 'true' || form.getAttribute('data-fu-bound') === 'true'
  if (alreadyBound) {
    dlog('SKIP: already bound', form)
    return
  }

  if (form.dataset) form.dataset.fuBound = 'true'
  else form.setAttribute('data-fu-bound', 'true')

  const campaignId = form.dataset?.campaignId ?? form.getAttribute('data-campaign-id') ?? 'FUNFTWMRGBN'

  dlog('INIT form', { form, campaignId })

  const amountRadios = form.querySelectorAll('input[name="donation-amount"][type="radio"]')
  if (amountRadios.length > 0 && !Array.from(amountRadios).some((r) => r.checked)) {
    amountRadios[0].checked = true
    dlog('auto-checked first amount radio', amountRadios[0].value)
  }

  amountRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      isOtherSelected = false
    })
  })

  const otherButton = form.querySelector("[data-donation-form='other']")
  dlog('otherButton', otherButton ? 'FOUND' : 'MISSING')

  form.addEventListener('submit', (e) => {
    dlog('SUBMIT fired', form)
    e.preventDefault()

    const formData = new FormData(form)

    // Restore radio names before reading form data
    form.querySelectorAll('[data-original-name]').forEach((radio) => {
      radio.name = radio.dataset.originalName
      delete radio.dataset.originalName
    })

    const recurring = formData.get('recurring') ?? 'once'

    const rawAmount = formData.get('donation-amount') ?? formData.get('amount') ?? formData.get('donation_amount')

    const parsed = parseAmount(rawAmount)
    const amount = parsed ?? 25

    dlog('submit payload', { campaignId, recurring, rawAmount, parsed, amount })

    if (typeof FundraiseUp?.openCheckout !== 'function') {
      dlog('ABORT: FundraiseUp.openCheckout not available', { FundraiseUp })
      return
    }

    const donationPayload = { recurring }

    // ONLY send amount if not "Other"
    if (!isOtherSelected && amount) {
      donationPayload.amount = amount
    }

    FundraiseUp.openCheckout(campaignId, {
      donation: donationPayload,
    })
  })

  let isOtherSelected = false

  if (otherButton) {
    otherButton.addEventListener('click', (e) => {
      e.preventDefault()

      isOtherSelected = true

      // uncheck predefined radios
      const amountRadios = form.querySelectorAll('input[name="donation-amount"][type="radio"]')

      amountRadios.forEach((radio) => {
        radio.checked = false
      })

      // clear custom input if exists
      const customInput =
        form.querySelector('input[name="amount"]') || form.querySelector('input[name="donation_amount"]')

      if (customInput) customInput.value = ''

      dlog('Other selected → waiting for Donate click')
    })
  }
}

/**
 * @param {HTMLElement|NodeList|HTMLCollection|Array|{el?:HTMLElement|NodeList, element?:HTMLElement|NodeList}} input
 */
export default function (input) {
  dlog('init called with:', input)

  const elements = resolveToElements(input)
  dlog('resolved elements count:', elements.length, elements)

  elements.forEach(initOne)
}
