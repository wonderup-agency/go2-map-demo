// path: src/tabs/initTabs.js
import { gsap } from 'gsap'

/**
 * Tabs: desktop animates wrapper height; mobile uses height:auto.
 * Wrapper height always considers the tallest [data-tabs="visual-item"].
 * Mobile fix: disable hit-test on visual column to avoid blocking taps.
 * Header-only activation for better UX and to prevent accidental toggles.
 */
export default function initTabs(component) {
  console.log('test')
  const roots = toElements(component)
  if (!roots.length) return

  ensureMobileStyleInjected()

  const cleanups = []
  for (const root of roots) {
    const wrappers = root.querySelectorAll('[data-tabs="wrapper"]')
    if (!wrappers.length) continue

    wrappers.forEach((wrapper) => {
      const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]')
      const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]')
      if (!contentItems.length || contentItems.length !== visualItems.length) return

      // Accept data-attr container or legacy class.
      const inner = wrapper.querySelector(
        wrapper.dataset.tabsHeightTarget || '[data-tabs="content-inner"], .tab-content__inner'
      )
      if (!inner) return

      const tabsCollapsible = wrapper.dataset.tabsCollapsible !== 'false'
      const mql = window.matchMedia?.('(min-width: 768px)') || null
      const isDesktop = () => !!mql?.matches

      contentItems.forEach((el, i) => {
        el.dataset.tabIndex = String(i)
      })
      visualItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))

      let activeContent = null
      let activeVisual = null
      let isAnimating = false
      let maxVisualHeight = 0

      hardReset(wrapper)

      // --- measuring helpers ---
      const measureNaturalHeight = (el) => {
        if (!el) return 0
        const restore = snapshotInlineStyle(el)
        el.style.position = 'absolute'
        el.style.left = '-99999px'
        el.style.top = '0'
        el.style.display = 'block'
        el.style.height = 'auto'
        el.style.maxHeight = 'none'
        el.style.opacity = '1'
        el.style.visibility = 'hidden'
        el.style.transform = 'none'
        const h = Math.ceil(Math.max(el.scrollHeight, el.getBoundingClientRect().height))
        restore()
        return h
      }

      const computeMaxVisualHeight = () => {
        let maxH = 0
        visualItems.forEach((vi) => {
          const h = measureNaturalHeight(vi)
          if (h > maxH) maxH = h
        })
        return maxH
      }

      const applyMinHeight = () => {
        // Siempre garantizamos como mínimo la altura del visual más alto
        wrapper.style.minHeight = maxVisualHeight > 0 ? `${maxVisualHeight}px` : ''
      }

      const recomputeHeightsAll = () => {
        maxVisualHeight = computeMaxVisualHeight()
        applyMinHeight()
        if (isDesktop()) {
          gsap.set(wrapper, { height: Math.max(inner.offsetHeight, maxVisualHeight) })
        }
      }
      // -------------------------

      // Primer cálculo antes de aplicar modo para que usemos el max visual.
      recomputeHeightsAll()
      applyMode()

      const recomputeHeight = () => {
        // Recalcula el alto del wrapper (sin volver a medir cada visual siempre)
        if (isDesktop()) gsap.set(wrapper, { height: Math.max(inner.offsetHeight, maxVisualHeight) })
      }
      const debouncedRecompute = debounce(recomputeHeight, 100)
      const debouncedRecomputeAll = debounce(recomputeHeightsAll, 120)

      window.addEventListener('resize', debouncedRecomputeAll)
      mql?.addEventListener?.('change', () => {
        recomputeHeightsAll()
        applyMode()
      })

      // Recalcular en cargas de imágenes (contenido y visuales)
      const imgs = wrapper.querySelectorAll('img')
      const imgListeners = []
      imgs.forEach((img) => {
        const onload = () => debouncedRecomputeAll()
        img.addEventListener('load', onload)
        imgListeners.push({ img, onload })
      })
      document.fonts?.ready?.then(debouncedRecomputeAll).catch(() => {})

      function applyMode() {
        if (isDesktop()) {
          wrapper.classList.remove('tabs--mobile-pe-none')
          resetVisualHitTestInline(wrapper)
          gsap.set(wrapper, { height: Math.max(inner.offsetHeight, maxVisualHeight) })
        } else {
          wrapper.classList.add('tabs--mobile-pe-none')
          setVisualHitTestInline(wrapper, false) // prevent visuals from stealing taps
          liftContentAboveVisual(wrapper, inner)
          wrapper.style.height = 'auto'
          applyMinHeight()
        }
      }

      function getDetailsEls(scope) {
        return Array.from(scope.querySelectorAll('[data-tabs="item-details"]'))
      }
      function closeDetails(scope, tlOr = gsap) {
        getDetailsEls(scope).forEach((el) =>
          tlOr.to ? tlOr.to(el, { height: 0, duration: 0.25 }) : gsap.set(el, { height: 0 })
        )
      }
      function openDetailsForMeasure(scope) {
        const restores = []
        getDetailsEls(scope).forEach((el) => {
          restores.push(snapshotInlineStyle(el))
          gsap.set(el, { height: 'auto' })
        })
        return () => restores.forEach((r) => r())
      }
      function hideAllVisualsExcept(keep) {
        visualItems.forEach((el) => {
          if (el !== keep) {
            el.classList.remove('active')
            gsap.set(el, { autoAlpha: 0, xPercent: 3 })
          }
        })
      }
      function deactivateAllContentsExcept(keep) {
        contentItems.forEach((el) => {
          if (el !== keep) {
            el.classList.remove('active')
            closeDetails(el)
          }
        })
      }

      function openTab(index) {
        const incomingContent = contentItems[index]
        const incomingVisual = visualItems[index]
        if (!incomingContent || !incomingVisual || isAnimating) return
        isAnimating = true

        hideAllVisualsExcept(incomingVisual)
        deactivateAllContentsExcept(incomingContent)

        incomingContent.classList.add('active')
        incomingVisual.classList.add('active')

        if (isDesktop()) {
          const restore = openDetailsForMeasure(incomingContent)
          const targetH = Math.max(inner.offsetHeight, maxVisualHeight)
          restore()
          getDetailsEls(incomingContent).forEach((el) => gsap.set(el, { height: 0 }))
          if (targetH > 0) gsap.to(wrapper, { height: targetH, duration: 0.4, ease: 'power3.out' })
        }

        const tl = gsap.timeline({
          defaults: { duration: 0.45, ease: 'power3' },
          onComplete: () => {
            activeContent = incomingContent
            activeVisual = incomingVisual
            isAnimating = false
            if (isDesktop()) gsap.delayedCall(0, recomputeHeight)
          },
        })
        if (activeVisual && activeVisual !== incomingVisual) tl.to(activeVisual, { autoAlpha: 0, xPercent: 3 }, 0)
        tl.fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, 0.05).fromTo(
          getDetailsEls(incomingContent),
          { height: 0 },
          { height: 'auto' },
          0
        )
      }

      function collapseActive() {
        if (!activeContent || isAnimating) return
        isAnimating = true
        const tl = gsap.timeline({
          defaults: { duration: 0.3, ease: 'power2.out' },
          onComplete: () => {
            activeContent.classList.remove('active')
            activeVisual?.classList.remove('active')
            activeContent = null
            activeVisual = null
            isAnimating = false
            if (isDesktop()) gsap.delayedCall(0, recomputeHeight)
          },
        })
        closeDetails(activeContent, tl)
        if (activeVisual) tl.to(activeVisual, { autoAlpha: 0, xPercent: 3 }, 0)
        if (isDesktop())
          tl.add(
            () =>
              gsap.to(wrapper, {
                height: Math.max(inner.offsetHeight, maxVisualHeight),
                duration: 0.3,
                ease: 'power2.out',
              }),
            0
          )
      }

      // Header-only activation (fallback a todo el item si no existe main)
      function onHeaderClick(ev) {
        const header = ev.currentTarget
        const item = header.closest?.('[data-tabs="content-item"]')
        if (!item || !wrapper.contains(item)) return
        const i = Number(item.dataset.tabIndex)
        if (Number.isNaN(i)) return

        if (item === activeContent) {
          if (tabsCollapsible) collapseActive()
          return
        }
        openTab(i)
      }

      let headers = wrapper.querySelectorAll('[data-tabs="content-item"] .tab-content__item-main')
      if (!headers.length) headers = wrapper.querySelectorAll('[data-tabs="content-item"]')
      headers.forEach((h) => {
        h.style.cursor = 'pointer'
        h.setAttribute('role', 'button')
        h.setAttribute('tabindex', '0')
        h.addEventListener('click', onHeaderClick)
        h.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onHeaderClick(e)
          }
        })
      })

      // Init
      const startCollapsed = wrapper.dataset.tabsCollapsibleInit === 'collapsed'
      if (!startCollapsed) openTab(0)
      requestAnimationFrame(() => {
        applyMode()
        if (isDesktop()) recomputeHeight()
      })

      cleanups.push(() => {
        headers.forEach((h) => h.removeEventListener('click', onHeaderClick))
        window.removeEventListener('resize', debouncedRecomputeAll)
        mql?.removeEventListener?.('change', () => {})
        imgListeners.forEach(({ img, onload }) => img.removeEventListener('load', onload))
      })
    })
  }

  return () => cleanups.forEach((c) => c())
}

/** Minimal CSS for mobile hit-test */
function ensureMobileStyleInjected() {
  if (document.getElementById('tabs-mobile-style')) return
  const css = `
  @media (max-width: 767.98px){
    [data-tabs="wrapper"].tabs--mobile-pe-none .tab-content__wrap{position:relative; z-index:2}
    [data-tabs="wrapper"].tabs--mobile-pe-none [data-tabs="visual-item"],
    [data-tabs="wrapper"].tabs--mobile-pe-none .tab-visual__wrap,
    [data-tabs="wrapper"].tabs--mobile-pe-none .is-visual{
      pointer-events:none !important; z-index:0 !important;
    }
  }`
  const style = document.createElement('style')
  style.id = 'tabs-mobile-style'
  style.textContent = css
  document.head.appendChild(style)
}

/** Hit-test helpers */
function setVisualHitTestInline(wrapper, enabled) {
  const pe = enabled ? '' : 'none'
  const z = enabled ? '' : '0'
  wrapper.querySelectorAll('[data-tabs="visual-item"], .tab-visual__wrap, .is-visual').forEach((el) => {
    el.style.pointerEvents = pe
    el.style.zIndex = z
  })
}
function resetVisualHitTestInline(wrapper) {
  wrapper.querySelectorAll('[data-tabs="visual-item"], .tab-visual__wrap, .is-visual').forEach((el) => {
    el.style.pointerEvents = ''
    el.style.zIndex = ''
  })
}
function liftContentAboveVisual(wrapper, inner) {
  const contentWrap =
    wrapper.querySelector('.tab-content__wrap') || inner.closest?.('.tab-content__wrap') || inner.parentElement
  if (contentWrap) {
    contentWrap.style.position = 'relative'
    contentWrap.style.zIndex = '2'
  }
}

/** Utils */
function snapshotInlineStyle(el) {
  const prev = el?.getAttribute?.('style')
  return () => {
    if (!el) return
    if (prev == null) el.removeAttribute('style')
    else el.setAttribute('style', prev)
  }
}
function debounce(fn, wait) {
  let t = null
  return (...a) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...a), wait)
  }
}
function toElements(input) {
  if (!input) return []
  if (typeof input === 'string') return Array.from(document.querySelectorAll(input))
  if (input instanceof HTMLElement) return [input]
  if (window.NodeList && input instanceof NodeList) return Array.from(input)
  if (Array.isArray(input)) return /** @type {HTMLElement[]} */ (input)
  return []
}
function normalizeWrapperSlots(wrapper) {
  const firstVisualItem = wrapper.querySelector('[data-tabs="visual-item"]')
  const firstContentItem = wrapper.querySelector('[data-tabs="content-item"]')
  const visualParent = firstVisualItem?.parentElement || null
  const contentParent = firstContentItem?.parentElement || null
  const move = (slot, sel, parent) => {
    if (!slot) return
    const dest = parent || slot.parentElement
    if (!dest) return
    Array.from(slot.querySelectorAll(sel)).forEach((n) => {
      if (n.parentElement !== dest) dest.appendChild(n)
    })
    if (!slot.querySelector('[data-tabs="visual-item"], [data-tabs="content-item"]')) slot.remove()
  }
  wrapper
    .querySelectorAll('[data-tabs="visual-slot"]')
    .forEach((s) => move(s, '[data-tabs="visual-item"]', visualParent))
  wrapper
    .querySelectorAll('[data-tabs="links-slot"]')
    .forEach((s) => move(s, '[data-tabs="content-item"]', contentParent))
}
function hardReset(wrapper) {
  const visuals = wrapper.querySelectorAll('[data-tabs="visual-item"]')
  const contents = wrapper.querySelectorAll('[data-tabs="content-item"]')
  visuals.forEach((el) => el.classList.remove('active'))
  contents.forEach((el) => el.classList.remove('active'))
  gsap.set(visuals, { autoAlpha: 0, xPercent: 3 })
  gsap.set(wrapper.querySelectorAll('[data-tabs="item-details"]'), { height: 0 })
}
