// path: src/tabs/initTabs.js
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
      normalizeWrapperSlots(wrapper)

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
      const autoplayQuery = wrapper.dataset.tabsAutoplayQuery || '(min-width: 1024px)'
      const mql = window.matchMedia ? window.matchMedia(autoplayQuery) : null
      const canAutoplay = () => autoplay && (!!mql ? mql.matches : true) // Why: disable below tablet by default

      contentItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))
      visualItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))

      let activeContent = null
      let activeVisual = null
      let isAnimating = false
      let progressBarTween = null
      let hoverBound = false

      console.debug(`[tabs:${wrapperId}] init`, {
        contentCount: contentItems.length,
        visualCount: visualItems.length,
        autoplay,
        autoplayDuration,
        autoplayQuery,
      })

      hardReset(wrapper)

      function bindHover() {
        if (hoverBound || !canAutoplay()) return
        wrapper.addEventListener('mouseenter', hoverIn)
        wrapper.addEventListener('mouseleave', hoverOut)
        hoverBound = true
      }
      function unbindHover() {
        if (!hoverBound) return
        wrapper.removeEventListener('mouseenter', hoverIn)
        wrapper.removeEventListener('mouseleave', hoverOut)
        hoverBound = false
      }

      function startProgressBar(index) {
        if (!canAutoplay()) return
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

      function stopProgressBar() {
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

        console.debug(`[tabs:${wrapperId}] switching`, {
          from: outgoingContent ? Number(outgoingContent.dataset.tabIndex) : null,
          to: Number(incomingContent.dataset.tabIndex),
        })
        logActivePair(wrapperId, incomingContent, incomingVisual)

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

      const onClick = (ev) => {
        const item = ev.target && /** @type {HTMLElement} */ (ev.target).closest?.('[data-tabs="content-item"]')
        if (!item || !wrapper.contains(item)) return
        const i = Number(item.dataset.tabIndex)
        if (Number.isNaN(i)) return
        if (item !== activeContent) switchTab(i)
      }

      const hoverIn = () => progressBarTween?.pause()
      const hoverOut = () => progressBarTween?.resume()

      function onAutoplayChange() {
        if (canAutoplay()) {
          bindHover()
          if (activeContent) startProgressBar(Number(activeContent.dataset.tabIndex))
        } else {
          unbindHover()
          stopProgressBar()
        }
      }

      wrapper.addEventListener('click', onClick)
      bindHover()
      mql?.addEventListener?.('change', onAutoplayChange)
      onAutoplayChange()

      switchTab(0)

      const state = {
        get index() {
          return activeContent ? Number(activeContent.dataset.tabIndex) : -1
        },
        get count() {
          return contentItems.length
        },
        getActiveContent() {
          return activeContent
        },
        getActiveVisual() {
          return activeVisual
        },
      }

      registry.push({
        wrapperId,
        state,
        cleanup: () => {
          wrapper.removeEventListener('click', onClick)
          unbindHover()
          mql?.removeEventListener?.('change', onAutoplayChange)
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

function normalizeWrapperSlots(wrapper) {
  // Why: keep styling/animations by using canonical containers
  const firstVisualItem = wrapper.querySelector('[data-tabs="visual-item"]')
  const firstContentItem = wrapper.querySelector('[data-tabs="content-item"]')
  const visualParent = firstVisualItem?.parentElement || null
  const contentParent = firstContentItem?.parentElement || null

  const moveChildren = (slotEl, selector, targetParent) => {
    if (!slotEl) return
    const dest = targetParent || slotEl.parentElement
    if (!dest) return
    const nodes = Array.from(slotEl.querySelectorAll(selector))
    nodes.forEach((node) => {
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

/**
 * Ensures no pre-existing .active or inline styles keep items visible.
 * @param {HTMLElement} wrapper
 */
function hardReset(wrapper) {
  const visuals = wrapper.querySelectorAll('[data-tabs="visual-item"]')
  const contents = wrapper.querySelectorAll('[data-tabs="content-item"]')
  visuals.forEach((el) => el.classList.remove('active'))
  contents.forEach((el) => el.classList.remove('active'))
  gsap.set(visuals, { autoAlpha: 0, xPercent: 3 })
  gsap.set(wrapper.querySelectorAll('[data-tabs="item-details"]'), { height: 0 })
}

/** Debug identity helpers */
function infoForContent(el) {
  const index = Number(el?.dataset?.tabIndex ?? -1)
  const id = el?.id || null
  const heading = el?.querySelector('h3')?.textContent?.trim() || null
  return { index, id, heading }
}
function infoForVisual(el) {
  const index = Number(el?.dataset?.tabIndex ?? -1)
  const id = el?.id || null
  const img = el?.querySelector('img')?.getAttribute('src') || null
  return { index, id, img }
}
function logActivePair(wrapperId, contentEl, visualEl) {
  const contentInfo = infoForContent(contentEl)
  const visualInfo = infoForVisual(visualEl)
  console.groupCollapsed(`[tabs:${wrapperId}/0] active`)
  console.table({ content: contentInfo, visual: visualInfo })
  console.groupEnd()
}

function attachDebugger(instanceId, registry) {
  const api = window.debugTabs || (window.debugTabs = {})
  api.list = () => registry.map((r) => ({ wrapperId: r.wrapperId, index: r.state.index, count: r.state.count }))
  api.next = (wrapperId) => jump(wrapperId, +1)
  api.prev = (wrapperId) => jump(wrapperId, -1)
  api.go = (wrapperId, i) => {
    const entry = registry.find((r) => r.wrapperId === wrapperId)
    if (!entry) return console.warn('[tabs] Invalid wrapperId', wrapperId)
    const wrapperEl = findWrapperById(wrapperId)
    if (!wrapperEl) return console.warn('[tabs] Wrapper element not found', wrapperId)
    const idx = Number(i)
    if (Number.isNaN(idx)) return console.warn('[tabs] Invalid index', i)
    const items = wrapperEl.querySelectorAll('[data-tabs="content-item"]')
    items[idx]?.dispatchEvent(new Event('click', { bubbles: true }))
  }
  api.active = (wrapperId) => {
    const entry = registry.find((r) => r.wrapperId === wrapperId)
    if (!entry) return null
    return {
      wrapperId,
      index: entry.state.index,
      content: infoForContent(entry.state.getActiveContent?.()),
      visual: infoForVisual(entry.state.getActiveVisual?.()),
    }
  }
  api.log = (wrapperId) => {
    const snap = api.active(wrapperId)
    if (!snap) return console.warn('[tabs] Invalid wrapperId', wrapperId)
    console.group(`[tabs:${wrapperId}] active snapshot`)
    console.table({ content: snap.content, visual: snap.visual })
    console.groupEnd()
    return snap
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
    const ordinal = Number(wrapperId.split('/')[1] || 0)
    const all = document.querySelectorAll('[data-tabs="wrapper"]')
    return all[ordinal] || null
  }
}
