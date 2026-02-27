const SHARE_CONFIG = {
  facebook: {
    buildUrl: (pageUrl) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
  },
  linkedin: {
    buildUrl: (pageUrl) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
  },
  x: {
    buildUrl: (pageUrl, text) =>
      `https://x.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(text)}`,
  },
  blue: {
    buildUrl: (pageUrl, text) =>
      `https://bsky.app/intent/compose?text=${encodeURIComponent(text + ' ' + pageUrl)}`,
  },
  instagram: {
    profileUrl: 'https://www.instagram.com/go2forlungcancer/',
  },
  youtube: {
    profileUrl: 'https://www.youtube.com/@go2forlungcancer',
  },
};

const SHARE_TEXT = 'Check out this article from GO2 for Lung Cancer';

function socialShare(component) {
  const links = component.querySelectorAll('[social-share]');
  const pageUrl = window.location.href;

  links.forEach((link) => {
    const network = link.getAttribute('social-share');
    const config = SHARE_CONFIG[network];
    if (!config) return

    // Profile-only networks (Instagram, YouTube)
    if (config.profileUrl) {
      link.href = config.profileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      return
    }

    // Share networks
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const shareUrl = config.buildUrl(pageUrl, SHARE_TEXT);
      window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    });
  });
}

export { socialShare as default };
//# sourceMappingURL=social-share-CmU6gx2B.js.map
