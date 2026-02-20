// path: /components/button-fixed.js
/**
 * @param {HTMLElement} component
 */
export default async function (component) {
  console.log('button fixed test')
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
  let menuItems = [phoneItem, mailItem].filter(Boolean)

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
  let supportTransformed = false
  const supportLink = supportItem?.querySelector('.item-link')
  const supportIconInner = supportItem?.querySelector('.icon_inner')
  const supportIconOriginal = supportIconInner?.innerHTML || ''
  const formSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none"><path d="M19 22H5C3.34315 22 2 20.6569 2 19V3C2 2.44772 2.44772 2 3 2H17C17.5523 2 18 2.44772 18 3V15H22V19C22 20.6569 20.6569 22 19 22ZM18 17V19C18 19.5523 18.4477 20 19 20C19.5523 20 20 19.5523 20 19V17H18ZM16 20V4H4V19C4 19.5523 4.44772 20 5 20H16ZM6 7H14V9H6V7ZM6 11H14V13H6V11ZM6 15H11V17H6V15Z" fill="currentColor"></path></svg>'

  const transformToForm = () => {
    if (!supportItem || supportTransformed) return
    supportTransformed = true
    const textEl = supportItem.querySelector('.g-paragraph')
    if (textEl) textEl.innerHTML = 'Complete this form<br>'
    if (supportIconInner) supportIconInner.innerHTML = formSvg
    const closeBtn = supportItem.querySelector(selCloseSupport)
    if (closeBtn) closeBtn.style.display = 'none'
  }

  const revertToSupport = () => {
    if (!supportItem || !supportTransformed) return
    supportTransformed = false
    const textEl = supportItem.querySelector('.g-paragraph')
    if (textEl) textEl.innerHTML = 'Get support now<br>'
    if (supportIconInner) supportIconInner.innerHTML = supportIconOriginal
    const closeBtn = supportItem.querySelector(selCloseSupport)
    if (closeBtn) closeBtn.style.display = ''
    menuItems = [phoneItem, mailItem].filter(Boolean)
    if (!isSupportSuppressed()) {
      supportItem.getAnimations().forEach((a) => a.cancel())
      supportItem.style.display = getDisplay(supportItem)
      supportItem.style.opacity = 1
    }
  }

  const isVisible = (el) => el && getComputedStyle(el).display !== 'none'
  const anyMenuVisible = () => menuItems.some(isVisible)

  // Open menu (phone + mail)
  const openMenu = () => {
    if (menuOpened) return
    menuOpened = true
    setOpenIcon()
    const toShow = [...menuItems].reverse()
    toShow.forEach((el, i) => {
      el.getAnimations().forEach((a) => a.cancel())
      el.style.transform = ''
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

  // Close menu (phone + mail + form)
  const closeMenu = () => {
    if (!anyMenuVisible()) {
      menuOpened = false
      setClosedIcon()
      revertToSupport()
      return
    }
    menuOpened = false
    let pending = menuItems.filter(isVisible).length
    menuItems.forEach((el) => {
      if (isVisible(el)) {
        collapseItem(el, () => {
          pending--
          if (pending <= 0) {
            setClosedIcon()
            revertToSupport()
          }
        })
      }
    })
  }

  // Events
  mainButton?.addEventListener(
    'click',
    (ev) => {
      if (ev.target.closest('[data-button-fixed="item"]')) return
      if (menuOpened) {
        closeMenu()
      } else {
        transformToForm()
        menuItems = [mailItem, phoneItem, supportItem].filter(Boolean)
        // Prep support for animation if already visible
        if (supportItem && isVisible(supportItem)) {
          supportItem.style.opacity = 0
        }
        openMenu()
      }
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

  // "Get support now" click → transform to "Form" + open menu
  // Capture phase so it fires before Finsweet modal handler
  if (supportLink) {
    supportLink.addEventListener(
      'click',
      (e) => {
        if (!supportTransformed) {
          e.preventDefault()
          e.stopImmediatePropagation()
          transformToForm()
          menuItems = [mailItem, phoneItem, supportItem].filter(Boolean)
          if (supportItem) supportItem.style.opacity = 0
          if (!menuOpened) openMenu()
        }
      },
      true
    )
  }

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
