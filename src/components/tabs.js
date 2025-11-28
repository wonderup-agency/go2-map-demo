// path: src/tabs/initTabs.js
import { gsap } from 'gsap'

/**
 * Tabs with autoplay/progress and dynamic wrapper height per active tab.
 *
 * @param {HTMLElement | NodeList | HTMLElement[] | string} component
 * @returns {() => void | undefined}
 */
export default function initTabs(component) {
  console.log("initTabs")
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

      // Remove any CSS-fixed min-height to let JS control height.
      wrapper.style.minHeight = ''

      // Resize/update handlers for dynamic height
      const recomputeActiveHeight = () => {
        const idx = activeContent ? Number(activeContent.dataset.tabIndex) : 0
        const h = measurePairHeight(contentItems[idx], visualItems[idx])
        if (h > 0) {
          // Snap without animation on pure recompute to avoid jank on resize
          gsap.set(wrapper, { height: h })
        }
      }
      const debouncedRecompute = debounce(recomputeActiveHeight, 100)

      // Recompute on resize, image load, and fonts ready (text metrics can shift)
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

        // Measure target height BEFORE animating content/visual, so wrapper grows/shrinks smoothly.
        const targetH = measurePairHeight(incomingContent, incomingVisual)
        if (targetH > 0) {
          gsap.to(wrapper, { height: targetH, duration: 0.5, ease: 'power3.out' })
        }

        const outgoingContent = activeContent
        const outgoingVisual = activeVisual
        const outgoingBar = outgoingContent?.querySelector('[data-tabs="item-progress"]')
        const incomingBar = incomingContent.querySelector('[data-tabs="item-progress"]')

        visualItems.forEach((el) => {
          if (el !== incomingVisual) {
            el.classList.remove('active')
            gsap.set(el, { autoAlpha: 0, xPercent: 3 })
          }
        })
        contentItems.forEach((el) => {
          if (el !== incomingContent) el.classList.remove('active')
        })

        incomingContent.classList.add('active')
        incomingVisual.classList.add('active')

        const tl = gsap.timeline({
          defaults: { duration: 0.65, ease: 'power3' },
          onComplete: () => {
            activeContent = incomingContent
            activeVisual = incomingVisual
            isAnimating = false
            startProgressBar(index)
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

      // Activate first tab and set initial wrapper height.
      switchTab(0)
      // Ensure wrapper has the exact measured height after first paint.
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

/**
 * Measure natural height of a (content, visual) pair without disturbing layout.
 * Uses absolute off-screen positioning to let CSS compute full size.
 */
function measurePairHeight(contentEl, visualEl) {
  if (!contentEl || !visualEl) return 0

  const restoreContent = snapshotInlineStyle(contentEl)
  const restoreVisual = snapshotInlineStyle(visualEl)

  // Ensure both are measurable and fully visible for the probe.
  gsap.set(contentEl, { position: 'absolute', left: -99999, visibility: 'hidden', display: 'block' })
  gsap.set(visualEl, { position: 'absolute', left: -99999, visibility: 'hidden', display: 'block', autoAlpha: 1, xPercent: 0 })

  // Open details to capture full natural content height.
  const details = contentEl.querySelector('[data-tabs="item-details"]')
  const restoreDetails = details ? snapshotInlineStyle(details) : null
  if (details) gsap.set(details, { height: 'auto' })

  // Use bounding rect to include transforms/line-height nuances.
  const cRect = contentEl.getBoundingClientRect()
  const vRect = visualEl.getBoundingClientRect()
  const height = Math.max(cRect.height, vRect.height, contentEl.scrollHeight, visualEl.scrollHeight)

  restoreContent()
  restoreVisual()
  if (restoreDetails) restoreDetails()
  return Math.ceil(height)
}

function snapshotInlineStyle(el) {
  const prev = el.getAttribute('style')
  return () => {
    if (prev == null) el.removeAttribute('style')
    else el.setAttribute('style', prev)
  }
}

/** Small utils */
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
