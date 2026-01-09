// path: /components/button-fixed.js
/**
 * @param {HTMLElement} component
 */
async function buttonFixed (component) {
  // Motion config
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = prefersReduced ? 1 : 800;
  const STEP = prefersReduced ? 0 : 200;
  const CLOSE_DUR = prefersReduced ? 1 : 260;
  const EASE = 'cubic-bezier(.22,1,.36,1)';
  const getDisplay = (el) => el?.dataset?.display || 'flex';

  // Cookie helpers (why: control de visibilidad cross-page)
  const SUPPORT_COOKIE = 'bf_support_hidden';
  const setCookie = (name, value, days) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  };
  const getCookie = (name) => {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null
  };
  const isSupportSuppressed = () => getCookie(SUPPORT_COOKIE) === '1';

  // Refs
  const mainButton = component.querySelector('.button_fixed');
  const items = Array.from(component.querySelectorAll('[data-button-fixed="item"]'));
  const switches = Array.from(component.querySelectorAll('.button_switch'));
  const [switchClosedEl, switchOpenEl] = [switches[0], switches[1] || switches[0]]; // enforce order

  const selCloseMail = '[data-close-mail]';
  const selClosePhone = '[data-close-phone]';
  const selCloseSupport = '[data-close-support-now]';

  const supportItem = items.find((i) => i.hasAttribute('data-button-support')) || null;

  // Block anchors "#"
  component.querySelectorAll('a[href="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    })
  );

  // Init
  items.forEach((el) => {
    el.style.display = 'none';
    el.style.opacity = 0;
  });
  switches.forEach((s) => s.classList.remove('is-active'));
  switchClosedEl?.classList.add('is-active');
  mainButton?.setAttribute('aria-expanded', 'false');

  // Si cookie ya existe, marca el support para saltarlo (why: no re-aparecer)
  if (supportItem && isSupportSuppressed()) {
    supportItem.dataset.skip = 'true';
  }

  let opened = false;
  const isVisible = (el) => getComputedStyle(el).display !== 'none';
  const anyVisible = () => items.some(isVisible);

  const setSwitchState = (isOpen) => {
    if (isOpen) {
      switchClosedEl?.classList.remove('is-active');
      switchOpenEl?.classList.add('is-active');
      mainButton?.setAttribute('aria-expanded', 'true');
    } else {
      switchOpenEl?.classList.remove('is-active');
      switchClosedEl?.classList.add('is-active');
      mainButton?.setAttribute('aria-expanded', 'false');
    }
  };

  const openAll = () => {
    if (opened) return
    opened = true;
    setSwitchState(true);
    const bottomToTop = [...items].reverse();
    // Filtra soporte si cookie está activa o marcado como skip
    const toShow = bottomToTop.filter((el) => !(el === supportItem && (isSupportSuppressed() || el.dataset.skip === 'true')));
    toShow.forEach((el, i) => {
      el.style.display = getDisplay(el);
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: DUR,
        delay: i * STEP,
        easing: EASE,
        fill: 'forwards',
      });
    });
  };

  const collapseItem = (el) => {
    if (!el || !isVisible(el)) return
    {
      // Why: evita reflow costoso
      el.style.willChange = 'transform,opacity';
      const anim = el.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(8px)' },
        ],
        { duration: CLOSE_DUR, easing: EASE, fill: 'forwards' }
      );
      anim.onfinish = () => {
        el.style.display = 'none';
        el.style.opacity = '';
        el.style.transform = '';
        el.style.willChange = '';
        if (!anyVisible()) {
          opened = false;
          setSwitchState(false);
        }
      };
      return
    }
  };

  const closeAll = () => {
    if (!anyVisible()) {
      opened = false;
      setSwitchState(false);
      return
    }
    opened = false;
    setSwitchState(false);
    items.forEach((el) => isVisible(el) && collapseItem(el));
  };

  // Events
  mainButton?.addEventListener(
    'click',
    (ev) => {
      if (ev.target.closest('[data-button-fixed="item"]')) return
      opened ? closeAll() : openAll();
    },
    true
  );

  component.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest(selCloseMail)) {
      e.preventDefault();
      collapseItem(items.find((i) => i.hasAttribute('data-button-mail')));
      return
    }
    if (t.closest(selClosePhone)) {
      e.preventDefault();
      collapseItem(items.find((i) => i.hasAttribute('data-button-phone')));
      return
    }
    if (t.closest(selCloseSupport)) {
      e.preventDefault();
      // Marca cookie 7 días y suprime futuras aperturas
      setCookie(SUPPORT_COOKIE, '1', 7);
      if (supportItem) supportItem.dataset.skip = 'true';
      collapseItem(supportItem);
      return
    }
  });

  const onDocClick = (e) => {
    if (e.target.closest('[data-component="button-fixed"]')) return
    closeAll();
  };
  document.addEventListener('click', onDocClick);

  const onKey = (e) => {
    if (e.key === 'Escape') closeAll();
  };
  document.addEventListener('keydown', onKey);

  // Why: prevenir fugas en SPA cuando el nodo se remueve
  component.addEventListener('DOMNodeRemoved', (e) => {
    if (e.target === component) {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    }
  });

  component.__buttonFixedDebug = {
    openAll,
    closeAll,
    collapseItem,
    _cookie: { get: getCookie, set: setCookie, key: SUPPORT_COOKIE }
  };
}

export { buttonFixed as default };
//# sourceMappingURL=button-fixed-SGIHk7MD.js.map
