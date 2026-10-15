// In Common With reference: editorial image with an independently sticky product sidebar.
export function initFeaturedProducts() {
  const innerPanels = [...document.querySelectorAll('.featured-sidebar-inner')];
  document.querySelectorAll('.featured-sidebar .product-card > img.asset').forEach(image => {
    const frame = document.createElement('button');
    frame.className = 'asset featured-card-frame';
    frame.type = 'button';
    const shop = image.closest('.product-card').querySelector('[data-detail]');
    frame.dataset.detail = shop.dataset.detail;
    frame.dataset.image = shop.dataset.image;
    frame.setAttribute('aria-label', `${shop.dataset.detail} 상품 미리보기`);
    image.before(frame);
    frame.append(image);
    image.className = 'featured-card-image';
  });
  // Short viewports must still allow the bottom of the product card to be reached.
  function measure(panel) {
    panel.style.setProperty('--featured-sidebar-height', `${panel.offsetHeight}px`);
  }
  innerPanels.forEach(measure);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(entries => entries.forEach(({ target }) => measure(target)));
    innerPanels.forEach(panel => observer.observe(panel));
    window.addEventListener('pagehide', event => { if (!event.persisted) observer.disconnect(); });
  }
  document.fonts.ready.then(() => innerPanels.forEach(measure));
}
