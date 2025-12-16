// path: src/tabs/initTabs.js
import { gsap } from 'gsap'

/**
 * Tabs without autoplay; wrapper height tracks .tab-content__inner.
 * Accordion behavior: clicking the same tab toggles close (enabled by default).
 * Set data-tabs-collapsible="false" to always keep one open.
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

      contentItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))
      visualItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))

      let activeContent = null
      let activeVisual = null
      let isAnimating = false

      hardReset(wrapper)

      wrapper.style.minHeight = ''
      wrapper.style.overflow = 'hidden'

      const recomputeHeight = () => gsap.set(wrapper, { height: inner.offsetHeight })
      const debouncedRecompute = debounce(recomputeHeight, 100)
      window.addEventListener('resize', debouncedRecompute)

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

      function getDetailsEls(scope) {
        return Array.from(scope.querySelectorAll('[data-tabs="item-details"]'))
      }

      function closeDetails(scope, tlOrGsap = gsap) {
        getDetailsEls(scope).forEach((el) =>
          tlOrGsap.to ? tlOrGsap.to(el, { height: 0, duration: 0.3 }) : gsap.set(el, { height: 0 })
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

        const restore = openDetailsForMeasure(incomingContent)
        const targetH = inner.offsetHeight
        restore()
        getDetailsEls(incomingContent).forEach((el) => gsap.set(el, { height: 0 }))

        if (targetH > 0) {
          gsap.to(wrapper, { height: targetH, duration: 0.5, ease: 'power3.out' })
        }

        const tl = gsap.timeline({
          defaults: { duration: 0.55, ease: 'power3' },
          onComplete: () => {
            activeContent = incomingContent
            activeVisual = incomingVisual
            isAnimating = false
            gsap.delayedCall(0, recomputeHeight)
          },
        })

        if (activeVisual && activeVisual !== incomingVisual) {
          tl.to(activeVisual, { autoAlpha: 0, xPercent: 3 }, 0)
        }
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
          defaults: { duration: 0.4, ease: 'power2.out' },
          onComplete: () => {
            activeContent.classList.remove('active')
            activeVisual?.classList.remove('active')
            activeContent = null
            activeVisual = null
            isAnimating = false
            gsap.delayedCall(0, recomputeHeight)
          },
        })

        closeDetails(activeContent, tl)
        if (activeVisual) tl.to(activeVisual, { autoAlpha: 0, xPercent: 3 }, 0)

        // Height to the collapsed inner state (headers only).
        tl.add(() => gsap.to(wrapper, { height: inner.offsetHeight, duration: 0.4, ease: 'power2.out' }), 0)
      }

      function onClick(ev) {
        const item = ev.target && /** @type {HTMLElement} */ (ev.target).closest?.('[data-tabs="content-item"]')
        if (!item || !wrapper.contains(item)) return
        const i = Number(item.dataset.tabIndex)
        if (Number.isNaN(i)) return

        if (item === activeContent) {
          if (tabsCollapsible) collapseActive()
          // If not collapsible, ignore because it is already open.
          return
        }
        openTab(i)
      }

      wrapper.addEventListener('click', onClick)

      // Initial: open first tab OR start collapsed if data-tabs-collapsible-init="collapsed"
      const startCollapsed = wrapper.dataset.tabsCollapsibleInit === 'collapsed'
      if (!startCollapsed) openTab(0)
      requestAnimationFrame(recomputeHeight)

      cleanups.push(() => {
        wrapper.removeEventListener('click', onClick)
        window.removeEventListener('resize', debouncedRecompute)
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

  wrapper.querySelectorAll('[data-tabs="visual-slot"]').forEach((slot) => {
    moveChildren(slot, '[data-tabs="visual-item"]', visualParent)
  })
  wrapper.querySelectorAll('[data-tabs="links-slot"]').forEach((slot) => {
    moveChildren(slot, '[data-tabs="content-item"]', contentParent)
  })
}

function hardReset(wrapper) {
  const visuals = wrapper.querySelectorAll('[data-tabs="visual-item"]')
  const contents = wrapper.querySelectorAll('[data-tabs="content-item"]')
  visuals.forEach((el) => el.classList.remove('active'))
  contents.forEach((el) => el.classList.remove('active'))
  gsap.set(visuals, { autoAlpha: 0, xPercent: 3 })
  gsap.set(wrapper.querySelectorAll('[data-tabs="item-details"]'), { height: 0 })
}
