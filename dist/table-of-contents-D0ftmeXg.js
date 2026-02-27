function tableOfContents (component) {
  const heading = component.querySelector('.content28_sidebar-heading');
  const content = component.querySelector('.content28_link-content');
  const icon = component.querySelector('.content28_accordion-icon');

  const breakpoint = 991;
  let isBound = false;

  function isTabletOrBelow() {
    return window.innerWidth <= breakpoint
  }

  function openAccordion() {
    content.classList.add('is-open');
    content.style.maxHeight = content.scrollHeight + 'px';
    icon.style.transform = 'rotate(0deg)';
    heading.classList.add('is-open');
  }

  function closeAccordion() {
    content.style.maxHeight = content.scrollHeight + 'px';

    requestAnimationFrame(() => {
      content.style.maxHeight = '0px';
      content.classList.remove('is-open');
    });

    icon.style.transform = 'rotate(180deg)';
    heading.classList.remove('is-open');
  }

  function toggleAccordion(e) {
    e.stopPropagation();

    if (content.classList.contains('is-open')) {
      closeAccordion();
    } else {
      openAccordion();
    }
  }

  function handleOutsideClick(e) {
    if (content.classList.contains('is-open') && !content.contains(e.target) && !heading.contains(e.target)) {
      closeAccordion();
    }
  }

  function bindEvents() {
    if (!isBound) {
      heading.addEventListener('click', toggleAccordion);
      document.addEventListener('click', handleOutsideClick);
      isBound = true;
    }
  }

  function unbindEvents() {
    if (isBound) {
      heading.removeEventListener('click', toggleAccordion);
      document.removeEventListener('click', handleOutsideClick);
      isBound = false;

      // Reset everything for desktop
      content.style.maxHeight = '';
      icon.style.transform = '';
      content.classList.remove('is-open');
      heading.classList.remove('is-open');
    }
  }

  function handleResize() {
    if (isTabletOrBelow()) {
      bindEvents();
    } else {
      unbindEvents();
    }
  }

  // Initial check
  handleResize();

  // Watch resize
  window.addEventListener('resize', handleResize);
}

export { tableOfContents as default };
//# sourceMappingURL=table-of-contents-D0ftmeXg.js.map
