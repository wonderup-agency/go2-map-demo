// path: src/tabs/initTabs.js
import { gsap } from 'gsap'

/**
 * Tabs: desktop animates height; mobile uses height:auto.
 * Mobile: disable hit-test on visual column. 
 * Inline debug overlay: enable with ?tabsdebug=1|true|yes (desktop & mobile).
 */
export default function initTabs(component) {
  const roots = toElements(component)
  if (!roots.length) return

  const DEBUG = getDebugFlag()
  const debug = createDebugOverlay(DEBUG)
  ensureMobileStyleInjected()

  const cleanups = []
  for (const root of roots) {
    const wrappers = root.querySelectorAll('[data-tabs="wrapper"]')
    if (!wrappers.length) continue

    wrappers.forEach((wrapper, wIdx) => {
      const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]')
      const visualItems  = wrapper.querySelectorAll('[data-tabs="visual-item"]')
      if (!contentItems.length || contentItems.length !== visualItems.length) {
        debug.log(`[tabs] skip wrapper[${wIdx}] invalid structure`)
        return
      }

      const innerSel = wrapper.dataset.tabsHeightTarget || '.tab-content__inner'
      const inner = wrapper.querySelector(innerSel)
      if (!inner) {
        debug.log(`[tabs] skip wrapper[${wIdx}] inner not found: ${innerSel}`)
        return
      }

      const tabsCollapsible = wrapper.dataset.tabsCollapsible !== 'false'
      const mql = window.matchMedia?.('(min-width: 768px)') || null
      const isDesktop = () => !!mql?.matches
      const isMobile  = () =>
        (navigator.maxTouchPoints > 0 || 'ontouchstart' in window || window.matchMedia?.('(pointer:coarse)').matches)
        && !isDesktop()

      contentItems.forEach((el, i) => { el.dataset.tabIndex = String(i) })
      visualItems.forEach((el, i) => (el.dataset.tabIndex = String(i)))

      let activeContent = null
      let activeVisual  = null
      let isAnimating   = false

      hardReset(wrapper)
      applyMode()

      const recomputeHeight = () => { if (isDesktop()) gsap.set(wrapper, { height: inner.offsetHeight }) }
      const debouncedRecompute = debounce(recomputeHeight, 100)
      window.addEventListener('resize', debouncedRecompute)
      mql?.addEventListener?.('change', applyMode)

      const imgs = wrapper.querySelectorAll('img')
      const imgListeners = []
      imgs.forEach((img) => {
        const onload = () => debouncedRecompute()
        img.addEventListener('load', onload)
        imgListeners.push({ img, onload })
      })
      document.fonts?.ready?.then(debouncedRecompute).catch(() => {})

      function applyMode() {
        if (isDesktop()) {
          wrapper.classList.remove('tabs--mobile-pe-none')
          resetVisualHitTestInline(wrapper)
          wrapper.style.overflow = 'hidden'
          gsap.set(wrapper, { height: inner.offsetHeight })
          debug.note('mode: desktop')
        } else {
          wrapper.classList.add('tabs--mobile-pe-none')
          setVisualHitTestInline(wrapper, false) // keep taps on content only
          liftContentAboveVisual(wrapper, inner)
          wrapper.style.height = 'auto'
          wrapper.style.overflow = 'visible'
          debug.note('mode: mobile')
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
        getDetailsEls(scope).forEach((el) => { restores.push(snapshotInlineStyle(el)); gsap.set(el, { height: 'auto' }) })
        return () => restores.forEach((r) => r())
      }
      function hideAllVisualsExcept(keep) {
        visualItems.forEach((el) => { if (el !== keep) { el.classList.remove('active'); gsap.set(el, { autoAlpha: 0, xPercent: 3 }) } })
      }
      function deactivateAllContentsExcept(keep) {
        contentItems.forEach((el) => { if (el !== keep) { el.classList.remove('active'); closeDetails(el) } })
      }

      function openTab(index) {
        const incomingContent = contentItems[index]
        const incomingVisual  = visualItems[index]
        if (!incomingContent || !incomingVisual || isAnimating) return
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
          if (targetH > 0) gsap.to(wrapper, { height: targetH, duration: 0.4, ease: 'power3.out' })
        }

        const tl = gsap.timeline({
          defaults: { duration: 0.45, ease: 'power3' },
          onComplete: () => {
            activeContent = incomingContent
            activeVisual  = incomingVisual
            isAnimating   = false
            if (isDesktop()) gsap.delayedCall(0, recomputeHeight)
            debug.log(`open tab ${index}`)
          },
        })
        if (activeVisual && activeVisual !== incomingVisual) tl.to(activeVisual, { autoAlpha: 0, xPercent: 3 }, 0)
        tl.fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, 0.05)
          .fromTo(getDetailsEls(incomingContent), { height: 0 }, { height: 'auto' }, 0)
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
            activeVisual  = null
            isAnimating   = false
            if (isDesktop()) gsap.delayedCall(0, recomputeHeight)
            debug.log('collapse')
          },
        })
        closeDetails(activeContent, tl)
        if (activeVisual) tl.to(activeVisual, { autoAlpha: 0, xPercent: 3 }, 0)
        if (isDesktop()) tl.add(() => gsap.to(wrapper, { height: inner.offsetHeight, duration: 0.3, ease: 'power2.out' }), 0)
      }

      // Click only on headers (fallback to whole item)
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
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHeaderClick(e) }
        })
      })

      // Debug: see taps without DevTools
      if (DEBUG) {
        wrapper.addEventListener('click', (e) => { debug.tap(e.target) }, { capture: true })
        debug.attach(wrapper, {
          openFirst: () => openTab(0),
          collapse:  () => collapseActive(),
          togglePE:  () => toggleVisualPE(wrapper),
        })
      }

      const startCollapsed = wrapper.dataset.tabsCollapsibleInit === 'collapsed'
      if (!startCollapsed) openTab(0)
      requestAnimationFrame(() => { applyMode(); if (isDesktop()) recomputeHeight() })

      cleanups.push(() => {
        headers.forEach((h) => {
          h.removeEventListener('click', onHeaderClick)
        })
        window.removeEventListener('resize', debouncedRecompute)
        mql?.removeEventListener?.('change', applyMode)
        imgListeners.forEach(({ img, onload }) => img.removeEventListener('load', onload))
      })
    })
  }

  return () => cleanups.forEach((c) => c())
}

/** ---------------- Debug overlay ---------------- */
function getDebugFlag(){
  try {
    const sp = new URLSearchParams(location.search)
    const v = (sp.get('tabsdebug') || '').toLowerCase()
    return v === '1' || v === 'true' || v === 'yes'
  } catch { return false }
}

function createDebugOverlay(enabled){
  if (!enabled) return { log(){}, note(){}, tap(){}, attach(){} }

  // Capture console to UI
  const orig = {
    log: console.log, warn: console.warn, error: console.error
  }

  const box = document.createElement('div')
  box.id = 'tabs-debug-overlay'
  box.style.cssText = [
    'position:fixed','left:8px','right:8px','bottom:8px',
    'max-height:45vh','overflow:auto',
    'background:rgba(10,10,10,.9)','color:#fff',
    'font:12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    'padding:8px','border-radius:10px','z-index:999999'
  ].join(';')

  const title = document.createElement('div')
  title.innerHTML = `<b>TABS DEBUG</b> <span id="tabsdbg-note" style="opacity:.75"></span>`
  const controls = document.createElement('div')
  controls.style.cssText = 'margin:6px 0; display:flex; flex-wrap:wrap; gap:6px'
  const logwrap = document.createElement('div')
  box.append(title, controls, logwrap)
  document.body.appendChild(box)

  const noteEl = title.querySelector('#tabsdbg-note')

  function line(kind, msg){
    const d = document.createElement('div')
    d.style.margin = '2px 0'
    d.textContent = `${kind} ${msg}`
    logwrap.appendChild(d)
    logwrap.scrollTop = logwrap.scrollHeight
  }
  console.log = (...a)=>{ line('•', a.map(safeStr).join(' ')); orig.log.apply(console, a) }
  console.warn = (...a)=>{ line('⚠︎', a.map(safeStr).join(' ')); orig.warn.apply(console, a) }
  console.error= (...a)=>{ line('✖', a.map(safeStr).join(' ')); orig.error.apply(console, a) }
  window.addEventListener('error', (e)=> line('✖', e.message || 'Error'))

  function addBtn(label, cb){
    const b = document.createElement('button')
    b.textContent = label
    b.style.cssText = 'padding:4px 8px;border:0;border-radius:8px;background:#2b7cff;color:#fff'
    b.onclick = cb
    controls.appendChild(b)
  }

  function selFor(el){
    if (!el) return '(null)'
    if (el.id) return `#${el.id}`
    const dt = el.getAttribute?.('data-tabs')
    if (dt) return `[data-tabs="${dt}"]`
    const cls = (el.className || '').toString().trim().split(/\s+/).slice(0,2).join('.')
    return cls ? '.'+cls : el.tagName?.toLowerCase()
  }

  return {
    log(msg){ console.log(String(msg)) },
    note(msg){ noteEl.textContent = '— ' + msg },
    tap(target){ console.log('tap →', selFor(target)) },
    attach(wrapper, actions){
      controls.innerHTML = ''
      addBtn('Open first', actions.openFirst)
      addBtn('Collapse', actions.collapse)
      addBtn('Toggle Visual PE', actions.togglePE)
      addBtn('Clear', ()=>{ logwrap.innerHTML='' })
      console.log('[tabs] debug overlay attached')
    }
  }
}
function safeStr(v){ try { return typeof v==='string'?v:JSON.stringify(v) } catch { return String(v) } }

/** ---------------- Style helpers ---------------- */
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

/** ---------------- Hit-test helpers ---------------- */
function setVisualHitTestInline(wrapper, enabled) {
  const pe = enabled ? '' : 'none'
  const z  = enabled ? '' : '0'
  wrapper.querySelectorAll('[data-tabs="visual-item"], .tab-visual__wrap, .is-visual')
    .forEach((el) => { el.style.pointerEvents = pe; el.style.zIndex = z })
}
function resetVisualHitTestInline(wrapper) {
  wrapper.querySelectorAll('[data-tabs="visual-item"], .tab-visual__wrap, .is-visual')
    .forEach((el) => { el.style.pointerEvents = ''; el.style.zIndex = '' })
}
function liftContentAboveVisual(wrapper, inner) {
  const contentWrap =
    wrapper.querySelector('.tab-content__wrap') ||
    inner.closest?.('.tab-content__wrap') ||
    inner.parentElement
  if (contentWrap) {
    contentWrap.style.position = 'relative'
    contentWrap.style.zIndex = '2'
  }
}
function toggleVisualPE(wrapper){
  const probe = wrapper.querySelector('[data-tabs="visual-item"], .tab-visual__wrap, .is-visual')
  const on = probe ? getComputedStyle(probe).pointerEvents !== 'none' : true
  if (on) setVisualHitTestInline(wrapper, false); else resetVisualHitTestInline(wrapper)
  console.log(`visual pointer-events → ${on ? 'none' : 'auto'}`)
}

/** ---------------- Utils ---------------- */
function snapshotInlineStyle(el){ const prev = el?.getAttribute?.('style'); return () => { if (!el) return; if (prev==null) el.removeAttribute('style'); else el.setAttribute('style', prev) } }
function debounce(fn, wait){ let t=null; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait) } }
function toElements(input){
  if (!input) return []
  if (typeof input==='string') return Array.from(document.querySelectorAll(input))
  if (input instanceof HTMLElement) return [input]
  if (window.NodeList && input instanceof NodeList) return Array.from(input)
  if (Array.isArray(input)) return /** @type {HTMLElement[]} */ (input)
  return []
}
function normalizeWrapperSlots(wrapper){
  const firstVisualItem=wrapper.querySelector('[data-tabs="visual-item"]')
  const firstContentItem=wrapper.querySelector('[data-tabs="content-item"]')
  const visualParent=firstVisualItem?.parentElement||null
  const contentParent=firstContentItem?.parentElement||null
  const move=(slot, sel, parent)=>{ if (!slot) return; const dest=parent||slot.parentElement; if (!dest) return; Array.from(slot.querySelectorAll(sel)).forEach((n)=>{ if (n.parentElement!==dest) dest.appendChild(n) }); if (!slot.querySelector('[data-tabs="visual-item"], [data-tabs="content-item"]')) slot.remove() }
  wrapper.querySelectorAll('[data-tabs="visual-slot"]').forEach((s)=>move(s,'[data-tabs="visual-item"]',visualParent))
  wrapper.querySelectorAll('[data-tabs="links-slot"]').forEach((s)=>move(s,'[data-tabs="content-item"]',contentParent))
}
function hardReset(wrapper){
  const visuals=wrapper.querySelectorAll('[data-tabs="visual-item"]')
  const contents=wrapper.querySelectorAll('[data-tabs="content-item"]')
  visuals.forEach((el)=>el.classList.remove('active'))
  contents.forEach((el)=>el.classList.remove('active'))
  gsap.set(visuals,{autoAlpha:0,xPercent:3})
  gsap.set(wrapper.querySelectorAll('[data-tabs="item-details"]'),{height:0})
}
