/**
 * @param {HTMLElement} component
 */
async function breadcrumbs (component) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const root = component instanceof HTMLElement ? component : document;
  const SELECTOR = "[data-component='breadcrums'],[data-component='breadcrumbs']";

  let nodes = root.querySelectorAll(SELECTOR);
  if (!nodes.length && root !== document) {
    const globalNodes = document.querySelectorAll(SELECTOR);
    if (!globalNodes.length) return
    nodes = globalNodes;
  }

  nodes.forEach((container) => {
    const rootLabel = container.dataset.rootLabel || 'Home';
    const rootUrl = container.dataset.rootUrl || '/';

    const linkClass =
      container.dataset.linkClass ||
      container.querySelector('.breadcrumb-link')?.className ||
      'breadcrumb-link w-inline-block';

    const sepClass = container.dataset.sepClass || container.querySelector('.g-paragraph')?.className || 'g-paragraph';

    const depthRaw = (container.dataset.depth || '').trim().toLowerCase();
    const isAll = depthRaw === 'all' || depthRaw === '';
    const depthNum = Number.parseInt(depthRaw, 10);
    const hasNumericDepth = Number.isFinite(depthNum) && depthNum >= 1;

    const leadingAttr = (container.dataset.leadingSeparator || 'true').toLowerCase().trim();
    const leadingSeparator = leadingAttr === 'true' || leadingAttr === '1' || leadingAttr === '';

    container.innerHTML = '';

    const rawPath = window.location.pathname.split('?')[0].split('#')[0];
    const segments = rawPath
      .replace(/\/+$/, '')
      .replace(/^\/+/, '')
      .split('/')
      .filter(Boolean)
      .map((s) => s.replace(/index\.html?$/i, ''))
      .filter(Boolean);

    let includeHome, startIndex;
    if (!segments.length) {
      const showHome = isAll || (hasNumericDepth && depthNum >= 1);
      if (showHome) {
        const items = [{ label: rootLabel, href: rootUrl }];
        renderItems(container, items, linkClass, sepClass, leadingSeparator);
      }
      return
    }

    if (isAll) {
      includeHome = true;
      startIndex = 0;
    } else if (hasNumericDepth) {
      const capped = Math.min(depthNum, segments.length + 1);
      if (capped === segments.length + 1) {
        includeHome = true;
        startIndex = 0;
      } else {
        includeHome = false;
        startIndex = Math.max(0, segments.length - capped);
      }
    } else {
      includeHome = true;
      startIndex = 0;
    }

    const items = [];
    if (includeHome) items.push({ label: rootLabel, href: rootUrl });

    const visibleSegs = segments.slice(startIndex);
    visibleSegs.forEach((seg, i) => {
      const uptoIndex = startIndex + i;
      const isLastSeg = uptoIndex === segments.length - 1;
      const href = isLastSeg ? null : `/${segments.slice(0, uptoIndex + 1).join('/')}`;
      items.push({ label: toTitle(seg), href });
    });

    renderItems(container, items, linkClass, sepClass, leadingSeparator);
  });

  function renderItems(container, items, linkClass, sepClass, leadingSeparator) {
    if (!items.length) return
    if (leadingSeparator) appendSeparator(container, sepClass);
    items.forEach((item, j) => {
      if (j > 0) appendSeparator(container, sepClass);
      const isFirst = j === 0;
      const isLast = j === items.length - 1;
      const classes = `${linkClass}${isFirst ? ' is-first' : ''}${isLast ? ' is-active' : ''}`;
      appendLink(container, item.label, item.href, classes);
    });
  }

  function toTitle(slug) {
    const clean = decodeURIComponent(slug)
      .replace(/\.html?$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    return clean
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  function appendSeparator(container, sepClass) {
    const p = document.createElement('p');
    p.className = sepClass;
    p.innerHTML = '/<br>';
    container.appendChild(p);
  }

  function appendLink(container, text, href, classes) {
    const a = document.createElement('a');
    a.className = classes;
    a.classList.add('w-inline-block');
    if (href) a.href = href;
    const div = document.createElement('div');
    div.textContent = text;
    a.appendChild(div);
    container.appendChild(a);
  }
}

export { breadcrumbs as default };
//# sourceMappingURL=breadcrumbs-2oOJD08a.js.map
