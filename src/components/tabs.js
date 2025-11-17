import { gsap } from 'gsap'

/**
 * @param {HTMLElement | NodeList | HTMLElement[] | string} component
 * @returns {() => void | undefined}
 */
export default function initTabs(component) {
  const roots = toElements(component)
  if (!roots.length) {
    console.warn('[tabs] No elements received for init', component)
    return
  }

  const registry = [] // { wrapperId, state, cleanup }
  const instanceId = `tabs#${Math.random().toString(36).slice(2, 8)}`

  roots.forEach((root, rootIdx) => {
    const wrappers = root.querySelectorAll('[data-tabs="wrapper"]')
    if (!wrappers.length) {
      console.warn(`[tabs:${instanceId}] No wrappers in root[${rootIdx}]`, root)
      return
    }

    wrappers.forEach((wrapper, wIdx) => {
      const wrapperId = `${instanceId}/${wIdx}`
      const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]')
      const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]')

      if (contentItems.length !== visualItems.length || contentItems.length === 0) {
        console.error(`[tabs:${wrapperId}] Invalid structure`, {
          contentCount: contentItems.length,
          visualCount: visualItems.length,
        })
        return
      }

      const autoplay = wrapper.dataset.tabsAutoplay === 'true'
      const autoplayDuration = Number.parseInt(wrapper.dataset.tabsAutoplayDuration, 10) || 5000

      // Why: stable indexing and easier debugging
      contentItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))
      visualItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))

      let activeContent = null
      let activeVisual = null
      let isAnimating = false
      let progressBarTween = null

      console.debug(`[tabs:${wrapperId}] init`, {
        contentCount: contentItems.length,
        visualCount: visualItems.length,
        autoplay,
        autoplayDuration,
      })

      function startProgressBar(index) {
        if (!autoplay) return
        progressBarTween?.kill()
        const bar = contentItems[index]?.querySelector('[data-tabs="item-progress"]')
        if (!bar) return

        gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })
        progressBarTween = gsap.to(bar, {
          scaleX: 1,
          duration: autoplayDuration / 1000,
          ease: 'power1.inOut',
          onStart: () => console.debug(`[tabs:${wrapperId}] progress start`, { index }),
          onComplete: () => {
            console.debug(`[tabs:${wrapperId}] progress complete`, { index })
            if (!isAnimating) switchTab((index + 1) % contentItems.length)
          },
        })
      }

      function switchTab(index) {
        const incomingContent = contentItems[index]
        const incomingVisual = visualItems[index]
        if (!incomingContent || !incomingVisual) {
          console.warn(`[tabs:${wrapperId}] switchTab missing index`, { index })
          return
        }
        if (isAnimating || incomingContent === activeContent) {
          console.debug(`[tabs:${wrapperId}] switchTab ignored`, {
            isAnimating,
            same: incomingContent === activeContent,
            index,
          })
          return
        }

        isAnimating = true
        progressBarTween?.kill()

        const outgoingContent = activeContent
        const outgoingVisual = activeVisual
        const outgoingBar = outgoingContent?.querySelector('[data-tabs="item-progress"]')
        const incomingBar = incomingContent.querySelector('[data-tabs="item-progress"]')

        incomingContent.classList.add('active')
        incomingVisual.classList.add('active')
        outgoingContent?.classList.remove('active')
        outgoingVisual?.classList.remove('active')

        console.debug(`[tabs:${wrapperId}] switching`, {
          from: outgoingContent ? Number(outgoingContent.dataset.tabIndex) : null,
          to: Number(incomingContent.dataset.tabIndex),
        })

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

        tl.fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, 0.3)
          .fromTo(incomingContent.querySelector('[data-tabs="item-details"]'), { height: 0 }, { height: 'auto' }, 0)
          .set(incomingBar, { scaleX: 0, transformOrigin: 'left center' }, 0)
      }

      // Delegated click: supports dynamic content and prevents binding only first block
      const onClick = (ev) => {
        const item = ev.target && /** @type {HTMLElement} */ (ev.target).closest?.('[data-tabs="content-item"]')
        if (!item || !wrapper.contains(item)) return
        const i = Number(item.dataset.tabIndex)
        if (Number.isNaN(i)) return
        if (item !== activeContent) switchTab(i)
      }

      // Hover pause/resume
      const hoverIn = () => progressBarTween?.pause()
      const hoverOut = () => progressBarTween?.resume()

      wrapper.addEventListener('click', onClick)
      if (autoplay) {
        wrapper.addEventListener('mouseenter', hoverIn)
        wrapper.addEventListener('mouseleave', hoverOut)
      }

      // Initial state
      switchTab(0)

      // Register for debugging and cleanup
      const state = {
        get index() {
          return activeContent ? Number(activeContent.dataset.tabIndex) : -1
        },
        get count() {
          return contentItems.length
        },
      }

      registry.push({
        wrapperId,
        state,
        cleanup: () => {
          wrapper.removeEventListener('click', onClick)
          if (autoplay) {
            wrapper.removeEventListener('mouseenter', hoverIn)
            wrapper.removeEventListener('mouseleave', hoverOut)
          }
          progressBarTween?.kill()
        },
      })
    })
  })

  attachDebugger(instanceId, registry)

  return () => {
    registry.forEach((r) => r.cleanup())
  }
}

/** Helpers */
function toElements(input) {
  if (!input) return []
  if (typeof input === 'string') return Array.from(document.querySelectorAll(input))
  if (input instanceof HTMLElement) return [input]
  if (window.NodeList && input instanceof NodeList) return Array.from(input)
  if (Array.isArray(input)) return /** @type {HTMLElement[]} */ (input)
  return []
}

function attachDebugger(instanceId, registry) {
  // Why: quick visibility of multiple-tab pages
  const api = window.debugTabs || (window.debugTabs = {})
  api.list = () => registry.map((r) => ({ wrapperId: r.wrapperId, index: r.state.index, count: r.state.count }))
  api.next = (wrapperId) => jump(wrapperId, +1)
  api.prev = (wrapperId) => jump(wrapperId, -1)
  api.go = (wrapperId, i) => {
    const entry = registry.find((r) => r.wrapperId === wrapperId)
    if (!entry) return console.warn('[tabs] Invalid wrapperId', wrapperId)
    const root =
      document.querySelector(`[data-tabs="wrapper"]`)?.closest(`[data-tabs="wrapper"]`)?.ownerDocument || document
    const wrappers = root.querySelectorAll('[data-tabs="wrapper"]') // naive resolver for demo
    const idx = Number(i)
    if (Number.isNaN(idx)) return console.warn('[tabs] Invalid index', i)
    const wrapperEl = findWrapperById(wrapperId)
    if (!wrapperEl) return console.warn('[tabs] Wrapper element not found', wrapperId)
    const items = wrapperEl.querySelectorAll('[data-tabs="content-item"]')
    items[idx]?.dispatchEvent(new Event('click', { bubbles: true }))
  }

  function jump(wrapperId, delta) {
    const entry = registry.find((r) => r.wrapperId === wrapperId)
    if (!entry) return console.warn('[tabs] Invalid wrapperId', wrapperId)
    const wrapperEl = findWrapperById(wrapperId)
    if (!wrapperEl) return console.warn('[tabs] Wrapper element not found', wrapperId)
    const items = wrapperEl.querySelectorAll('[data-tabs="content-item"]')
    const next = (entry.state.index + delta + items.length) % items.length
    items[next]?.dispatchEvent(new Event('click', { bubbles: true }))
  }

  function findWrapperById(wrapperId) {
    // Why: best-effort lookup using ordinal part `${instanceId}/${wIdx}`
    const ordinal = Number(wrapperId.split('/')[1] || 0)
    const all = document.querySelectorAll('[data-tabs="wrapper"]')
    return all[ordinal] || null
  }

  console.info(`[tabs:${instanceId}] debugger attached. Use: debugTabs.list()`)
}
