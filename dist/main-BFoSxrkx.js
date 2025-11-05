function t(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, 'default') ? t.default : t
}
var e,
  o = {}
var n = t(
  (function () {
    if (e) return o
    e = 1
    const t = [
      { selector: "[data-component='events']", importFn: () => import('./events-CvFcLBCU.js') },
      { selector: "[data-component='centers']", importFn: () => import('./centers-B54xnsHV.js') },
      { selector: "[data-component='donation-form']", importFn: () => import('./donation-DUtuuBMF.js') },
      { selector: "[data-component='helpline-form']", importFn: () => import('./helpline-3ro4sOhk.js') },
      { selector: "[data-component='phone-buddy-form']", importFn: () => import('./phone-buddy-BucrYkw9.js') },
      {
        selector: "[data-component='volunteer-phone-buddy-form']",
        importFn: () => import('./volunteer-phone-buddy-Bl_dWnl9.js'),
      },
    ]
    async function n({ selector: t, importFn: e }) {
      try {
        let o = document.querySelectorAll(t)
        if (0 === o.length) return
        const n = await e()
        e.name
        'function' == typeof n.default && ((o = o.length > 1 ? o : o[0]), n.default(o))
      } catch (t) {}
    }
    return (
      (async () => {
        try {
          const t = await import('./global-M7LxuyN4.js')
          'function' == typeof t.default && t.default()
        } catch (t) {}
        await Promise.all(t.map(n))
      })(),
      o
    )
  })()
)
export { t as g, n as m }
//# sourceMappingURL=main-BFoSxrkx.js.map
