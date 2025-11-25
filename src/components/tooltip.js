import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css' // Optional CSS for default styling

/**
 * @param {HTMLElement} component
 */
export default function (component) {
  if (!component || !(component instanceof HTMLElement)) return

  const dynItems = component.querySelectorAll('.w-dyn-item')
  if (!dynItems || dynItems.length === 0) return

  const glossaryMap = {}
  dynItems.forEach((item) => {
    const name = (item.dataset.name || '').toLowerCase().trim()
    const url = `/glossaries/${item.dataset.url || ''}`.trim()
    const defEl = item.querySelector('p')
    if (!name || !defEl) return

    glossaryMap[name] = {
      definition: defEl.textContent,
      url,
    }
  })

  // const containerSelector = '.main-wrapper h1, .main-wrapper h2, .main-wrapper h3, .main-wrapper h4, .main-wrapper h5, .main-wrapper h6, .main-wrapper p';
  const containerSelector = '.main-wrapper p'

  const terms = Object.keys(glossaryMap)
    .map((t) => t.trim())
    .sort((a, b) => b.length - a.length)

  if (terms.length === 0) return

  const patterns = terms.map((t) => {
    const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return `\\b${esc}\\b`
  })

  const masterRegex = new RegExp(patterns.join('|'), 'gi')

  // track which terms are already wrapped *per <section>*
  const sectionMap = new WeakMap()

  document.querySelectorAll(containerSelector).forEach((container) => {
    if (container.closest('a,button')) return

    // find section that this element belongs to
    const section = container.closest('section')
    if (!section) return

    // get or create per-section set
    let usedInSection = sectionMap.get(section)
    if (!usedInSection) {
      usedInSection = new Set()
      sectionMap.set(section, usedInSection)
    }

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    const textNodes = []

    while (walker.nextNode()) {
      const tn = walker.currentNode
      if (!tn.nodeValue || !tn.nodeValue.trim()) continue
      if (tn.parentElement && tn.parentElement.closest('a,button')) continue
      textNodes.push(tn)
    }

    if (textNodes.length === 0) return

    const replacer = (match) => {
      const key = match.toLowerCase()
      if (usedInSection.has(key)) return match
      usedInSection.add(key)

      const definition = escapeAttr(glossaryMap[key].definition)
      const url = escapeAttr(glossaryMap[key].url)

      return `<span data-tooltip="" data-definition="${definition}" data-url="${url}">${match}</span>`
    }

    textNodes.forEach((node) => {
      const original = node.nodeValue

      if (!masterRegex.test(original)) {
        masterRegex.lastIndex = 0
        return
      }

      masterRegex.lastIndex = 0
      const updated = original.replace(masterRegex, replacer)

      if (updated !== original) {
        const span = document.createElement('span')
        span.innerHTML = updated
        node.parentNode.replaceChild(span, node)
      }
    })
  })

  document.querySelectorAll('[data-tooltip]').forEach((el) => {
    tippy(el, {
      content: el.dataset.definition,
      allowHTML: false,
      interactive: true,
      placement: 'auto',
      theme: 'glossary',
      delay: [0, 0],
    })
  })
}

function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
