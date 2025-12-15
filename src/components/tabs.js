// path: src/tabs/initTabs.js
import { gsap } from 'gsap'

/**
 * Tabs with autoplay/progress and dynamic height driven by .tab-content__inner
 * Use data-tabs-height-target on the wrapper to override the selector.
 * Comments explain "why".
 *
 * @param {HTMLElement | NodeList | HTMLElement[] | string} component
 * @returns {() => void | undefined}
 */
export default function initTabs(component) {
  return onReady(() => mount(component))
}

function mount(component) {
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

      // Autoplay setup
      const autoplay = wrapper.dataset.tabsAutoplay === 'true'
      const autoplayDuration = Number.parseInt(wrapper.dataset.tabsAutoplayDuration || '5000', 10)
      const autoplayQuery = wrapper.dataset.tabsAutoplayQuery || '(min-width: 1024px)'
      const mql = window.matchMedia ? window.matchMedia(autoplayQuery) : null
      const canAutoplay = () => autoplay && (mql ? mql.matches : true)

      contentItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))
      visualItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))

      let activeContent = null
      let activeVisual = null
      let isAnimating = false
      let progressBarTween = null
      let hoverBound = false

      hardReset(wrapper)

      // JS controls height. Hidden overflow prevents bleed during tween.
      wrapper.style.minHeight = ''
      wrapper.style.overflow = 'hidden'

      // --- Height measurement helpers (driven by .tab-content__inner) ---
      const measureInnerHeight = (incomingContent) => {
        if (!incomingContent) return inner.offsetHeight

        // Open the incoming details to let inner grow to its natural size.
        const details = incomingContent.querySelector('[data-tabs="item-details"]')
        const restoreDetails = details ? snapshotInlineStyle(details) : null
        if (details) gsap.set(details, { height: 'auto' })

        // Use scrollHeight to capture full content, including margins-collapse edge cases.
        const h = Math.max(inner.scrollHeight, inner.getBoundingClientRect().height)

        // Restore details before we animate (so we can tween from 0 → auto).
        if (details) {
          restoreDetails?.()
          gsap.set(details, { height: 0 })
        }
        return Math.ceil(h)
      }

      const recomputeActiveHeight = () => {
        const idx = activeContent ? Number(activeContent.dataset.tabIndex) : 0
        const h = measureInnerHeight(contentItems[idx])
        if (h > 0) gsap.set(wrapper, { height: h })
      }
      const debouncedRecompute = debounce(recomputeActiveHeight, 80)

      // Resize + images + fonts
      window.addEventListener('resize', debouncedRecompute)

      const imgs = wrapper.querySelectorAll('img')
      const imgListeners = []
      imgs.forEach((img) => {
        // Use decode when available to avoid zero-size during lazy stages.
        const onload = () => debouncedRecompute()
        img.addEventListener('load', onload)
        img
          .decode?.()
          .then(debouncedRecompute)
          .catch(() => {})
        imgListeners.push({ img, onload })
      })
      if (document.fonts?.ready) {
        document.fonts.ready.then(debouncedRecompute).catch(() => {})
      }

      // Observe DOM mutations inside inner (accordions, async content, CMS)
      const mo = new MutationObserver(() => debouncedRecompute())
      mo.observe(inner, { childList: true, subtree: true, attributes: true, characterData: true })

      // --- Progress bar / autoplay ---
      const startProgressBar = (index) => {
        if (!canAutoplay()) return
        progressBarTween?.kill()
        const bar = contentItems[index]?.querySelector('[data-tabs="item-progress"]')
        if (!bar) return
        gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })
        progressBarTween = gsap.to(bar, {
          scaleX: 1,
          duration: autoplayDuration / 1000,
          ease: 'power1.inOut',
          onComplete: () => {
            if (!isAnimating) switchTab((index + 1) % contentItems.length)
          },
        })
      }

      const stopProgressBar = () => {
        progressBarTween?.kill()
        progressBarTween = null
        contentItems.forEach((item) => {
          const bar = item.querySelector('[data-tabs="item-progress"]')
          if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })
        })
      }

      function switchTab(index) {
        const incomingContent = contentItems[index]
        const incomingVisual = visualItems[index]
        if (!incomingContent || !incomingVisual) return
        if (isAnimating || incomingContent === activeContent) return

        isAnimating = true
        progressBarTween?.kill()

        // Deactivate others first.
        visualItems.forEach((el) => {
          if (el !== incomingVisual) {
            el.classList.remove('active')
            gsap.set(el, { autoAlpha: 0, xPercent: 3 })
          }
        })
        contentItems.forEach((el) => {
          if (el !== incomingContent) el.classList.remove('active')
        })

        // Activate incoming so inner reflects the correct layout state.
        incomingContent.classList.add('active')
        incomingVisual.classList.add('active')

        // Measure target height from the live inner container.
        const targetH = measureInnerHeight(incomingContent)
        if (targetH > 0) {
          gsap.to(wrapper, { height: targetH, duration: 0.5, ease: 'power3.out' })
        }

        const outgoingContent = activeContent
        const outgoingVisual = activeVisual
        const outgoingBar = outgoingContent?.querySelector('[data-tabs="item-progress"]')
        const incomingBar = incomingContent.querySelector('[data-tabs="item-progress"]')

        const tl = gsap.timeline({
          defaults: { duration: 0.6, ease: 'power3' },
          onComplete: () => {
            activeContent = incomingContent
            activeVisual = incomingVisual
            isAnimating = false
            startProgressBar(index)
            // One more snap after the tween to account for async image decode.
            gsap.delayedCall(0, recomputeActiveHeight)
          },
        })

        if (outgoingContent) {
          tl.set(outgoingBar, { transformOrigin: 'right center' }, 0)
            .to(outgoingBar, { scaleX: 0, duration: 0.25 }, 0)
            .to(outgoingVisual, { autoAlpha: 0, xPercent: 3 }, 0)
            .to(outgoingContent.querySelector('[data-tabs="item-details"]'), { height: 0 }, 0)
        }

        tl.fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, 0.15)
          .fromTo(incomingContent.querySelector('[data-tabs="item-details"]'), { height: 0 }, { height: 'auto' }, 0)
          .set(incomingBar, { scaleX: 0, transformOrigin: 'left center' }, 0)
      }

      const onClick = (ev) => {
        const item = ev.target && /** @type {HTMLElement} */ (ev.target).closest?.('[data-tabs="content-item"]')
        if (!item || !wrapper.contains(item)) return
        const i = Number(item.dataset.tabIndex)
        if (!Number.isNaN(i) && item !== activeContent) switchTab(i)
      }

      const hoverIn = () => progressBarTween?.pause()
      const hoverOut = () => progressBarTween?.resume()

      const onAutoplayChange = () => {
        if (canAutoplay()) {
          if (!hoverBound) {
            wrapper.addEventListener('mouseenter', hoverIn)
            wrapper.addEventListener('mouseleave', hoverOut)
            hoverBound = true
          }
          if (activeContent) startProgressBar(Number(activeContent.dataset.tabIndex))
        } else {
          if (hoverBound) {
            wrapper.removeEventListener('mouseenter', hoverIn)
            wrapper.removeEventListener('mouseleave', hoverOut)
            hoverBound = false
          }
          stopProgressBar()
        }
      }

      wrapper.addEventListener('click', onClick)
      mql?.addEventListener?.('change', onAutoplayChange)
      onAutoplayChange()

      // First activation and initial wrapper height after layout.
      switchTab(0)
      requestAnimationFrame(recomputeActiveHeight)

      cleanups.push(() => {
        wrapper.removeEventListener('click', onClick)
        if (hoverBound) {
          wrapper.removeEventListener('mouseenter', hoverIn)
          wrapper.removeEventListener('mouseleave', hoverOut)
        }
        mql?.removeEventListener?.('change', onAutoplayChange)
        progressBarTween?.kill()
        window.removeEventListener('resize', debouncedRecompute)
        imgListeners.forEach(({ img, onload }) => img.removeEventListener('load', onload))
        mo.disconnect()
      })
    })
  })

  return () => cleanups.forEach((c) => c())
}

/** ——— Utilities ——— */
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true })
  } else {
    fn()
  }
}

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
  // Keep DOM in canonical containers so animations/styles remain consistent.
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
