import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

/**
 * @param {HTMLElement} component
 */
export default function (component) {
  if (!component || !(component instanceof HTMLElement)) return

  const toggleTooltip = component.dataset.toggle || 'false'
  if (toggleTooltip != 'true') {
    console.log('glossary-tooltip: disabled on this page')
    return
  }

  const mainRoot = document.querySelector('.main-wrapper')
  if (!mainRoot) {
    console.log('glossary-tooltip: no .main-wrapper found')
    return
  }

  const dynItems = component.querySelectorAll('.w-dyn-item')
  if (!dynItems.length) return

  // BUILD GLOSSARY MAP
  const glossaryMap = {}
  dynItems.forEach((item) => {
    const name = (item.dataset.name || '').toLowerCase().trim()
    const defEl = item.querySelector('p')
    if (!name || !defEl) return
    const url = `/glossaries/${item.dataset.url || ''}`.trim()

    glossaryMap[name] = {
      definition: defEl.textContent,
      url,
    }
  })

  const terms = Object.keys(glossaryMap)
    .map((t) => t.trim())
    .sort((a, b) => b.length - a.length)

  if (!terms.length) {
    console.log('glossary-tooltip: no glossary terms found')
    return
  }

  // escape regex characters
  const patterns = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  const masterRegex = new RegExp(`\\b(?:${patterns.join('|')})\\b`, 'gi')
  const testRegex = new RegExp(`\\b(?:${patterns.join('|')})\\b`, 'i')

  // GLOBAL ONE-TIME WRAP TRACKER
  const wrappedGlobal = new Set()
  const wrappedList = []

  // ATTRIBUTE ESCAPER
  function escapeAttr(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  // COLLECT ONLY TEXT NODES WITHIN .main-wrapper p
  const containerSelector = '.main-wrapper p'
  const containers = mainRoot.querySelectorAll(containerSelector)

  const textNodes = []

  containers.forEach((container) => {
    // skip paragraphs inside <a> or <button>, or if .no-tooltip class is present.
    if (container.closest('a,button,.no-tooltip')) return

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)

    while (walker.nextNode()) {
      const tn = walker.currentNode

      if (!tn.nodeValue || !tn.nodeValue.trim()) continue
      if (tn.parentElement.closest('a,button,[data-tooltip]')) continue

      textNodes.push(tn)
    }
  })

  // PROCESS TEXT NODES IN ORDER
  textNodes.forEach((node) => {
    const original = node.nodeValue

    if (!testRegex.test(original)) return

    const replacer = (match) => {
      const key = match.toLowerCase()

      if (wrappedGlobal.has(key)) {
        return match // do NOT wrap again
      }

      if (!glossaryMap[key]) return match // safety

      wrappedGlobal.add(key)
      wrappedList.push(key)

      const definition = escapeAttr(glossaryMap[key].definition)
      const url = escapeAttr(glossaryMap[key].url)

      return `<span data-tooltip="" data-definition="${definition}" data-url="${url}">${match}</span>`
    }

    // perform replacement
    masterRegex.lastIndex = 0
    const updated = original.replace(masterRegex, replacer)

    if (updated !== original) {
      const range = document.createRange()
      range.selectNodeContents(node)
      const frag = range.createContextualFragment(updated)
      node.parentNode.replaceChild(frag, node)
    }
  })

  if (wrappedList.length) {
    console.log(`glossary-tooltip: wrapped terms → ${Array.from(new Set(wrappedList)).join(', ')}`)
  } else {
    console.log('glossary-tooltip: no new terms wrapped')
  }

  // INIT TIPPY FOR ALL TOOLTIP NODES
  const tooltipNodes = mainRoot.querySelectorAll('[data-tooltip]')
  const glossaryLink = `<a class="tooltip_link" href="/glossary">View full glossary <svg width=" 100%" height=" 100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z" fill="currentColor"/>
</svg></a>`

  tooltipNodes.forEach((el) => {
    if (el._tippy) return // prevent duplicate init

    tippy(el, {
      content: `<span style="font-weight:400">${el.dataset.definition}<span/>${glossaryLink}`,
      allowHTML: true,
      interactive: true,
      placement: 'auto',
      theme: 'glossary',
      delay: [0, 0],
      // trigger:"click"
    })
  })
}
