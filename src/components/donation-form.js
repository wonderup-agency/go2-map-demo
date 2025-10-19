/**
 *
 * @param {HTMLElement} form
 */
export default function (form) {
  const campaignId = form.dataset.campaignId ?? 'FUNFTWMRGBN'

  // Autoselect the first radio button for donation-amount if available
  const amountRadios = form.querySelectorAll(
    'input[name="donation-amount"][type="radio"]'
  )
  if (amountRadios.length > 0) {
    amountRadios[0].checked = true
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    const recurring = formData.get('recurring') ?? 'once'
    let amount = formData.get('donation-amount')

    // Clean and parse amount; default to 25 if invalid or missing
    amount = Number(amount?.replace(/\D/g, '')) || 25

    console.log(campaignId, recurring, amount)
    FundraiseUp.openCheckout(campaignId, {
      donation: {
        recurring,
        amount,
      },
    })
  })
}
