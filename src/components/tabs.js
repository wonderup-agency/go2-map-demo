// path: src/tabs/initTabs.js
import { gsap } from 'gsap'

/**
 * Tabs with autoplay/progress; wrapper height tracks .tab-content__inner.
 * Set a custom selector via data-tabs-height-target on the wrapper if needed.
 *
 * @param {HTMLElement | NodeList | HTMLElement[] | string} component
 * @returns {() => void | undefined}
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

      // Let JS drive the height transition.
      wrapper.style.minHeight = ''
      wrapper.style.overflow = 'hidden'

      // Height recompute using the live inner container (no offscreen probing).
      const recomputeActiveHeight = () => {
        // Snap to current inner height to avoid jank on resize.
        gsap.set(wrapper, { height: inner.offsetHeight })
      }
      const debouncedRecompute = debounce(recomputeActiveHeight, 100)

      window.addEventListener('resize', debouncedRecompute)

      // Recompute when images load anywhere inside the wrapper.
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

        // Activate incoming (needed so inner reflects the correct layout).
        incomingContent.classList.add('active')
        incomingVisual.classList.add('active')

        // Open incoming details to auto temporarily to measure final inner height.
        const detailsIn = incomingContent.querySelector('[data-tabs="item-details"]')
        const restoreDetails = detailsIn ? snapshotInlineStyle(detailsIn) : null
        if (detailsIn) gsap.set(detailsIn, { height: 'auto' })

        // Read the target wrapper height from the live inner container.
        const targetH = inner.offsetHeight

        // Restore details back to 0 before animating the expand.
        if (detailsIn) {
          restoreDetails?.()
          gsap.set(detailsIn, { height: 0 })
        }

        // Animate wrapper height towards the measured target.
        if (targetH > 0) {
          gsap.to(wrapper, { height: targetH, duration: 0.5, ease: 'power3.out' })
        }

        const outgoingContent = activeContent
        const outgoingVisual = activeVisual
        const outgoingBar = outgoingContent?.querySelector('[data-tabs="item-progress"]')
        const incomingBar = incomingContent.querySelector('[data-tabs="item-progress"]')

        const tl = gsap.timeline({
          defaults: { duration: 0.65, ease: 'power3' },
          onComplete: () => {
            activeContent = incomingContent
            activeVisual = incomingVisual
            isAnimating = false
            startProgressBar(index)
            // Final snap in case images/text reflowed during tween.
            gsap.delayedCall(0, recomputeActiveHeight)
          },
        })

        if (outgoingContent) {
          tl.set(outgoingBar, { transformOrigin: 'right center' }, 0)
            .to(outgoingBar, { scaleX: 0, duration: 0.3 }, 0)
            .to(outgoingVisual, { autoAlpha: 0, xPercent: 3 }, 0)
            .to(outgoingContent.querySelector('[data-tabs="item-details"]'), { height: 0 }, 0)
        }

        tl.fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, 0.2)
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

      // First activation and initial wrapper height.
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
      })
    })
  })

  return () => cleanups.forEach((c) => c())
}

/** Utils */
function snapshotInlineStyle(el) {
  const prev = el.getAttribute('style')
  return () => {
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
