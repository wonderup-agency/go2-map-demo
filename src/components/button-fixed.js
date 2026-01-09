// path: /components/button-fixed.js
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

  // Cookie helpers
  const SUPPORT_COOKIE = 'bf_support_hidden'
  const setCookie = (name, value, days) => {
    const d = new Date()
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
    // SameSite=Lax evita envío en third-party context; ajusta si hace falta
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`
  }
  // Sin RegExp → evita errores de parseo en bundlers
  const getCookie = (name) => {
    const raw = document.cookie || ''
    if (!raw) return null
    const pairs = raw.split('; ')
    for (const pair of pairs) {
      const [k, ...rest] = pair.split('=')
      if (k === name) return decodeURIComponent(rest.join('='))
    }
    return null
  }
  const isSupportSuppressed = () => getCookie(SUPPORT_COOKIE) === '1'

  // Refs
  const mainButton = component.querySelector('.button_fixed')
  const items = Array.from(component.querySelectorAll('[data-button-fixed="item"]'))

  const selCloseMail = '[data-close-mail]'
  const selClosePhone = '[data-close-phone]'
  const selCloseSupport = '[data-close-support-now]'

  const supportItem = items.find((i) => i.hasAttribute('data-button-support')) || null

  // Icon refs (data-button-fixed="icon-*")
  const iconHeadset = component.querySelector('[data-button-fixed="icon-headset"]')
  const iconEmpathy = component.querySelector('[data-button-fixed="icon-empathy"]')
  const iconClose = component.querySelector('[data-button-fixed="icon-close"]')
  const iconList = [iconHeadset, iconEmpathy, iconClose].filter(Boolean)

  // Icon helpers
  const hideIcon = (el) => {
    if (!el) return
    el.classList.remove('is-active')
    el.style.display = 'none'
    el.setAttribute('aria-hidden', 'true')
  }
  const showIcon = (el) => {
    if (!el) return
    el.classList.add('is-active')
    el.style.display = ''
    el.setAttribute('aria-hidden', 'false')
  }
  const showOnlyIcon = (name) => {
    iconList.forEach(hideIcon)
    if (name === 'close') return showIcon(iconClose)
    if (name === 'empathy') return showIcon(iconEmpathy)
    return showIcon(iconHeadset)
  }
  const setClosedIconByCookie = () => {
    showOnlyIcon(isSupportSuppressed() ? 'empathy' : 'headset')
    mainButton?.setAttribute('aria-expanded', 'false')
  }
  const setOpenIcon = () => {
    showOnlyIcon('close')
    mainButton?.setAttribute('aria-expanded', 'true')
  }

  // Block anchors "#"
  component.querySelectorAll('a[href="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
  )

  // Init items
  items.forEach((el) => {
    el.style.display = 'none'
    el.style.opacity = 0
  })

  // Si cookie activa, no mostrar soporte
  if (supportItem && isSupportSuppressed()) supportItem.dataset.skip = 'true'

  // Init icon (cerrado)
  setClosedIconByCookie()

  let opened = false
  const isVisible = (el) => getComputedStyle(el).display !== 'none'
  const anyVisible = () => items.some(isVisible)

  const openAll = () => {
    if (opened) return
    opened = true
    setOpenIcon()
    const bottomToTop = [...items].reverse()
    // Filtra soporte si cookie/skip
    const toShow = bottomToTop.filter(
      (el) => !(el === supportItem && (isSupportSuppressed() || el.dataset.skip === 'true'))
    )
    toShow.forEach((el, i) => {
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
          setClosedIconByCookie()
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
          setClosedIconByCookie()
        }
      }
    })
  }

  const closeAll = () => {
    if (!anyVisible()) {
      opened = false
      setClosedIconByCookie()
      return
    }
    opened = false
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
      // Activa cookie 7 días y suprime soporte
      setCookie(SUPPORT_COOKIE, '1', 7)
      if (supportItem) supportItem.dataset.skip = 'true'
      collapseItem(supportItem)
      // Si ya está cerrado, actualiza icono de cerrado a empathy
      if (!opened && !anyVisible()) setClosedIconByCookie()
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

  // Limpieza en SPA
  component.addEventListener('DOMNodeRemoved', (e) => {
    if (e.target === component) {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  })

  component.__buttonFixedDebug = {
    openAll,
    closeAll,
    collapseItem,
    _icon: { showOnlyIcon, setClosedIconByCookie, setOpenIcon },
    _cookie: { get: getCookie, set: setCookie, key: SUPPORT_COOKIE },
  }
}
