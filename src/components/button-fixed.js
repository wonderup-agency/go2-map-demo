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
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`
  }
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

  const selCloseSupport = '[data-close-support-now]'

  const supportItem = items.find((i) => i.hasAttribute('data-button-support')) || null
  const phoneItem = items.find((i) => i.hasAttribute('data-button-phone')) || null
  const mailItem = items.find((i) => i.hasAttribute('data-button-mail')) || null
  const menuItems = [phoneItem, mailItem].filter(Boolean)

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
  const setClosedIcon = () => {
    showOnlyIcon('empathy')
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

  // Init: hide menu items (phone, mail)
  menuItems.forEach((el) => {
    el.style.display = 'none'
    el.style.opacity = 0
  })

  // Init: show support item if not suppressed by cookie
  if (supportItem) {
    if (isSupportSuppressed()) {
      supportItem.style.display = 'none'
      supportItem.style.opacity = 0
    } else {
      supportItem.style.display = getDisplay(supportItem)
      supportItem.style.opacity = 1
    }
  }

  // Init icon (closed state)
  setClosedIcon()

  let menuOpened = false
  const isVisible = (el) => el && getComputedStyle(el).display !== 'none'
  const anyMenuVisible = () => menuItems.some(isVisible)

  // Open menu (phone + mail)
  const openMenu = () => {
    if (menuOpened) return
    menuOpened = true
    setOpenIcon()
    const toShow = [...menuItems].reverse()
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

  // Collapse a single item with animation
  const collapseItem = (el, onFinish) => {
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
        onFinish?.()
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
        onFinish?.()
      }
    })
  }

  // Close menu (phone + mail)
  const closeMenu = () => {
    if (!anyMenuVisible()) {
      menuOpened = false
      setClosedIcon()
      return
    }
    menuOpened = false
    let pending = menuItems.filter(isVisible).length
    menuItems.forEach((el) => {
      if (isVisible(el)) {
        collapseItem(el, () => {
          pending--
          if (pending <= 0) setClosedIcon()
        })
      }
    })
  }

  // Events
  mainButton?.addEventListener(
    'click',
    (ev) => {
      if (ev.target.closest('[data-button-fixed="item"]')) return
      menuOpened ? closeMenu() : openMenu()
    },
    true
  )

  // Close support button (with cookie)
  component.addEventListener('click', (e) => {
    const t = e.target
    if (t.closest(selCloseSupport)) {
      e.preventDefault()
      setCookie(SUPPORT_COOKIE, '1', 7)
      collapseItem(supportItem)
      return
    }
  })

  const onDocClick = (e) => {
    if (e.target.closest('[data-component="button-fixed"]')) return
    closeMenu()
  }
  document.addEventListener('click', onDocClick)

  const onKey = (e) => {
    if (e.key === 'Escape') closeMenu()
  }
  document.addEventListener('keydown', onKey)

  // Cleanup for SPA
  component.addEventListener('DOMNodeRemoved', (e) => {
    if (e.target === component) {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  })

  component.__buttonFixedDebug = {
    openMenu,
    closeMenu,
    collapseItem,
    _icon: { showOnlyIcon, setClosedIcon, setOpenIcon },
    _cookie: { get: getCookie, set: setCookie, key: SUPPORT_COOKIE },
  }
}
