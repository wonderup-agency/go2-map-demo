// path: src/tabs/initTabs.js
import { gsap } from 'gsap'

/**
 * Tabs without autoplay. Desktop animates height; Mobile uses height:auto.
 * Accordion: clicking the same tab toggles close (default enabled).
 * Mobile fixes: ensure visuals don't block taps; add pointer/touch handlers.
 */
export default function initTabs(component) {
  const roots = toElements(component)
  if (!roots.length) return
  const cleanups = []

  roots.forEach((root) => {
    const wrappers = root.querySelectorAll('[data-tabs="wrapper"]')
    if (!wrappers.length) return

    wrappers.forEach((wrapper) => {
      normalizeWrapperSlots(wrapper)

      const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]')
      const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]')
      if (!contentItems.length || contentItems.length !== visualItems.length) return

      const innerSel = wrapper.dataset.tabsHeightTarget || '.tab-content__inner'
      const inner = wrapper.querySelector(innerSel)
      if (!inner) return

      const tabsCollapsible = wrapper.dataset.tabsCollapsible !== 'false' // default: true
      const mql = window.matchMedia?.('(min-width: 768px)') || null
      const isDesktop = () => !!mql?.matches

      contentItems.forEach((el, i) => {
        el.dataset.tabIndex = String(i)
        // Make headers focusable/clickable
        el.tabIndex = 0
      })
      visualItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))

      let activeContent = null
      let activeVisual = null
      let isAnimating = false

      hardReset(wrapper)
      applyMode() // set height/overflow + hit-testing per breakpoint

      const recomputeHeight = () => {
        if (!isDesktop()) return // mobile: height auto
        gsap.set(wrapper, { height: inner.offsetHeight })
      }
      const debouncedRecompute = debounce(recomputeHeight, 100)
      window.addEventListener('resize', debouncedRecompute)
      mql?.addEventListener?.('change', applyMode)

      // Recompute when images load (common on CMS)
      const imgs = wrapper.querySelectorAll('img')
      const imgListeners = []
      imgs.forEach((img) => {
        const onload = () => debouncedRecompute()
        img.addEventListener('load', onload)
        imgListeners.push({ img, onload })
      })
      if (document.fonts?.ready) {
        document.fonts.ready.then(debouncedRecompute).catch(() => {})
      }

      function applyMode() {
        if (isDesktop()) {
          wrapper.style.minHeight = ''
          wrapper.style.overflow = 'hidden'
          gsap.set(wrapper, { height: inner.offsetHeight })
          // Desktop: visuals can keep pointer events
          setVisualHitTest(true)
        } else {
          // Mobile: let layout flow; prevent overlays stealing taps
          wrapper.style.height = 'auto'
          wrapper.style.overflow = 'visible'
          setVisualHitTest(false)
          liftContentAboveVisual()
        }
      }

      function setVisualHitTest(enabled) {
        const pe = enabled ? '' : 'none'
        const z = enabled ? '' : '0'
        visualItems.forEach((v) => {
          v.style.pointerEvents = pe
          v.style.zIndex = z
        })
        // Also neutralize the visual column container if present
        const visualCols = wrapper.querySelectorAll('.is-visual, .tab-visual__wrap, .tab-layout__col.is-visual')
        visualCols.forEach((c) => {
          c.style.pointerEvents = pe
          c.style.zIndex = z
        })
      }

      function liftContentAboveVisual() {
        // Ensure the content column sits above any positioned visuals
        const contentWrap =
          wrapper.querySelector('.tab-content__wrap') || inner.closest('.tab-content__wrap') || inner.parentElement
        if (contentWrap) {
          contentWrap.style.position = 'relative'
          contentWrap.style.zIndex = '1'
        }
      }

      function getDetailsEls(scope) {
        return Array.from(scope.querySelectorAll('[data-tabs="item-details"]'))
      }
      function closeDetails(scope, tlOr = gsap) {
        getDetailsEls(scope).forEach((el) =>
          tlOr.to ? tlOr.to(el, { height: 0, duration: 0.3 }) : gsap.set(el, { height: 0 })
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
        if (!incomingContent || !incomingVisual) return
        if (isAnimating) return
        isAnimating = true

        hideAllVisualsExcept(incomingVisual)
        deactivateAllContentsExcept(incomingContent)

        incomingContent.classList.add('active')
        incomingVisual.classList.add('active')

        if (isDesktop()) {
          const restore = openDetailsForMeasure(incomingContent)
          const targetH = inner.offsetHeight
          restore()
          getDetailsEls(incomingContent).forEach((el) => gsap.set(el, { height: 0 }))
          if (targetH > 0) gsap.to(wrapper, { height: targetH, duration: 0.45, ease: 'power3.out' })
        }

        const tl = gsap.timeline({
          defaults: { duration: 0.5, ease: 'power3' },
          onComplete: () => {
            activeContent = incomingContent
            activeVisual = incomingVisual
            isAnimating = false
            if (isDesktop()) gsap.delayedCall(0, recomputeHeight)
          },
        })

        if (activeVisual && activeVisual !== incomingVisual) tl.to(activeVisual, { autoAlpha: 0, xPercent: 3 }, 0)
        tl.fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, 0.1).fromTo(
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
          defaults: { duration: 0.35, ease: 'power2.out' },
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

        if (isDesktop()) {
          tl.add(() => gsap.to(wrapper, { height: inner.offsetHeight, duration: 0.35, ease: 'power2.out' }), 0)
        }
      }

      function findItemFromEvent(ev) {
        const path = ev.composedPath ? ev.composedPath() : []
        for (const n of path) {
          if (n && n.nodeType === 1 && n.matches?.('[data-tabs="content-item"]')) return n
        }
        return ev.target?.closest?.('[data-tabs="content-item"]')
      }

      // Unified activation handler (click/pointerup/touchend), avoids mobile no-click
      let lastActTs = 0
      function onActivate(ev) {
        const now = performance.now()
        if (now - lastActTs < 150) return // guard duplicate (touchend → click)
        lastActTs = now

        const item = findItemFromEvent(ev)
        if (!item || !wrapper.contains(item)) return
        const i = Number(item.dataset.tabIndex)
        if (Number.isNaN(i)) return

        if (item === activeContent) {
          if (tabsCollapsible) collapseActive()
          return
        }
        openTab(i)
      }

      wrapper.addEventListener('click', onActivate, { passive: true })
      wrapper.addEventListener('pointerup', onActivate, { passive: true })
      wrapper.addEventListener('touchend', onActivate, { passive: true })

      // Init: open first unless collapsed init requested
      const startCollapsed = wrapper.dataset.tabsCollapsibleInit === 'collapsed'
      if (!startCollapsed) openTab(0)
      requestAnimationFrame(() => {
        applyMode()
        if (isDesktop()) recomputeHeight()
      })

      cleanups.push(() => {
        wrapper.removeEventListener('click', onActivate)
        wrapper.removeEventListener('pointerup', onActivate)
        wrapper.removeEventListener('touchend', onActivate)
        window.removeEventListener('resize', debouncedRecompute)
        mql?.removeEventListener?.('change', applyMode)
        imgListeners.forEach(({ img, onload }) => img.removeEventListener('load', onload))
      })
    })
  })

  return () => cleanups.forEach((c) => c())
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
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
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
  const moveChildren = (slotEl, selector, targetParent) => {
    if (!slotEl) return
    const dest = targetParent || slotEl.parentElement
    if (!dest) return
    Array.from(slotEl.querySelectorAll(selector)).forEach((node) => {
      if (node.parentElement !== dest) dest.appendChild(node)
    })
    if (!slotEl.querySelector('[data-tabs="visual-item"], [data-tabs="content-item"]')) slotEl.remove()
  }
  wrapper
    .querySelectorAll('[data-tabs="visual-slot"]')
    .forEach((s) => moveChildren(s, '[data-tabs="visual-item"]', visualParent))
  wrapper
    .querySelectorAll('[data-tabs="links-slot"]')
    .forEach((s) => moveChildren(s, '[data-tabs="content-item"]', contentParent))
}
function hardReset(wrapper) {
  const visuals = wrapper.querySelectorAll('[data-tabs="visual-item"]')
  const contents = wrapper.querySelectorAll('[data-tabs="content-item"]')
  visuals.forEach((el) => el.classList.remove('active'))
  contents.forEach((el) => el.classList.remove('active'))
  gsap.set(visuals, { autoAlpha: 0, xPercent: 3 })
  gsap.set(wrapper.querySelectorAll('[data-tabs="item-details"]'), { height: 0 })
}
