/**
 * @param {HTMLElement} component
 */
export default async function (component) {
  // Motion config
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const DUR = prefersReduced ? 1 : 800
  const STEP = prefersReduced ? 0 : 200
  const CLOSE_DUR = prefersReduced ? 1 : 260
  const EASE = 'cubic-bezier(.22,1,.36,1)'
  const FAST_COLLAPSE = true
  const getDisplay = (el) => el?.dataset?.display || 'flex'

  // Refs
  const mainButton = component.querySelector('.button_fixed')
  const items = Array.from(component.querySelectorAll('[data-button-fixed="item"]'))
  const switches = Array.from(component.querySelectorAll('.button_switch'))
  const [switchClosedEl, switchOpenEl] = [switches[0], switches[1] || switches[0]] // enforce order

  const selCloseMail = '[data-close-mail]'
  const selClosePhone = '[data-close-phone]'
  const selCloseSupport = '[data-close-support-now]'

  // Block anchors "#"
  component.querySelectorAll('a[href="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
  )

  // Init
  items.forEach((el) => {
    el.style.display = 'none'
    el.style.opacity = 0
  })
  switches.forEach((s) => s.classList.remove('is-active'))
  switchClosedEl?.classList.add('is-active')
  mainButton?.setAttribute('aria-expanded', 'false')

  let opened = false
  const isVisible = (el) => getComputedStyle(el).display !== 'none'
  const anyVisible = () => items.some(isVisible)

  const setSwitchState = (isOpen) => {
    // Ensures first switch is the "closed" icon, second is the "open" icon.
    if (isOpen) {
      switchClosedEl?.classList.remove('is-active')
      switchOpenEl?.classList.add('is-active')
      mainButton?.setAttribute('aria-expanded', 'true')
    } else {
      switchOpenEl?.classList.remove('is-active')
      switchClosedEl?.classList.add('is-active')
      mainButton?.setAttribute('aria-expanded', 'false')
    }
  }

  const openAll = () => {
    if (opened) return
    opened = true
    setSwitchState(true)
    const bottomToTop = [...items].reverse()
    bottomToTop.forEach((el, i) => {
      el.style.display = getDisplay(el)
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: DUR,
        delay: i * STEP,
        easing: EASE,
        fill: 'forwards',
      })
    })
  }

  const collapseItem = (el) => {
    if (!el || !isVisible(el)) return
    if (FAST_COLLAPSE) {
      // Why: avoids layout thrash; smoother in mobile.
      el.style.willChange = 'transform,opacity'
      const anim = el.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(8px)' },
        ],
        { duration: CLOSE_DUR, easing: EASE, fill: 'forwards' }
      )
      anim.onfinish = () => {
        el.style.display = 'none'
        el.style.opacity = ''
        el.style.transform = ''
        el.style.willChange = ''
        if (!anyVisible()) {
          opened = false
          setSwitchState(false)
        }
      }
      return
    }
    const h = el.offsetHeight || el.scrollHeight || 0
    el.style.willChange = 'height,opacity'
    el.style.height = `${h}px`
    el.style.overflow = 'hidden'
    el.style.opacity = 1
    requestAnimationFrame(() => {
      const anim = el.animate(
        [
          { height: `${h}px`, opacity: 1 },
          { height: '0px', opacity: 0 },
        ],
        { duration: CLOSE_DUR, easing: EASE, fill: 'forwards' }
      )
      anim.onfinish = () => {
        el.style.display = 'none'
        el.style.height = ''
        el.style.overflow = ''
        el.style.opacity = ''
        el.style.willChange = ''
        if (!anyVisible()) {
          opened = false
          setSwitchState(false)
        }
      }
    })
  }

  const closeAll = () => {
    if (!anyVisible()) {
      opened = false
      setSwitchState(false)
      return
    }
    opened = false
    setSwitchState(false) // reflect state immediately
    items.forEach((el) => isVisible(el) && collapseItem(el))
  }

  // Events
  mainButton?.addEventListener(
    'click',
    (ev) => {
      if (ev.target.closest('[data-button-fixed="item"]')) return
      opened ? closeAll() : openAll()
    },
    true
  )

  component.addEventListener('click', (e) => {
    const t = e.target
    if (t.closest(selCloseMail)) {
      e.preventDefault()
      collapseItem(items.find((i) => i.hasAttribute('data-button-mail')))
      return
    }
    if (t.closest(selClosePhone)) {
      e.preventDefault()
      collapseItem(items.find((i) => i.hasAttribute('data-button-phone')))
      return
    }
    if (t.closest(selCloseSupport)) {
      e.preventDefault()
      collapseItem(items.find((i) => i.hasAttribute('data-button-support')))
      return
    }
  })

  const onDocClick = (e) => {
    if (e.target.closest('[data-component="button-fixed"]')) return
    closeAll()
  }
  document.addEventListener('click', onDocClick)

  const onKey = (e) => {
    if (e.key === 'Escape') closeAll()
  }
  document.addEventListener('keydown', onKey)

  // Why: prevent leaks in SPA when node is removed.
  component.addEventListener('DOMNodeRemoved', (e) => {
    if (e.target === component) {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  })

  component.__buttonFixedDebug = { openAll, closeAll, collapseItem }
}
