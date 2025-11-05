var e, t
function n(e) {
  const t = e.dataset.campaignId ?? 'FUNFTWMRGBN',
    n = e.querySelectorAll('input[name="donation-amount"][type="radio"]')
  n.length > 0 && (n[0].checked = !0)
  const r = e.querySelector("[data-donation-form='other']")
  ;(e.addEventListener('submit', (n) => {
    n.preventDefault()
    const r = new FormData(e),
      o = r.get('recurring') ?? 'once'
    let a = r.get('donation-amount')
    ;((a = Number(a?.replace(/\D/g, '')) || 25), FundraiseUp.openCheckout(t, { donation: { recurring: o, amount: a } }))
  }),
    r.addEventListener('click', (n) => {
      n.preventDefault()
      const r = new FormData(e).get('recurring') ?? 'once'
      FundraiseUp.openCheckout(t, { donation: { recurring: r } })
    }))
}
!(function () {
  if (t) return e
  t = 1
  let n = {
    comma: (e) => n.split(e, [','], !0),
    space: (e) => n.split(e, [' ', '\n', '\t']),
    split(e, t, n) {
      let r = [],
        o = '',
        a = !1,
        i = 0,
        u = !1,
        c = '',
        d = !1
      for (let n of e)
        (d
          ? (d = !1)
          : '\\' === n
            ? (d = !0)
            : u
              ? n === c && (u = !1)
              : '"' === n || "'" === n
                ? ((u = !0), (c = n))
                : '(' === n
                  ? (i += 1)
                  : ')' === n
                    ? i > 0 && (i -= 1)
                    : 0 === i && t.includes(n) && (a = !0),
          a ? ('' !== o && r.push(o.trim()), (o = ''), (a = !1)) : (o += n))
      return ((n || '' !== o) && r.push(o.trim()), r)
    },
  }
  ;((e = n), (n.default = n))
})()
export { n as default }
//# sourceMappingURL=donation-DUtuuBMF.js.map
