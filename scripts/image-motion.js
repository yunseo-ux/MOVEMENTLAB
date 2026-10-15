// Analogue Foundation reference: framed parallax and a slow image scale.
export function initImageMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const selectors = [
    '.brand-intro > img.asset', '.collection-feature > img.asset',
    '.collection-detail > img.asset', '.collection-collage img.asset',
    '.featured-product > img.asset', '.product-card > img.asset',
    '.brands-body > img.asset', '.portfolio-grid img.asset'
  ];
  const frames = [...document.querySelectorAll(selectors.join(','))].filter(image => !image.closest('.featured-products')).map(image => {
    const frame = document.createElement('div');
    // Preserve existing grid sizing and aspect-ratio selectors on the outer slot.
    frame.className = `${image.className} image-motion-frame`;
    const plane = document.createElement('div');
    plane.className = 'image-motion-plane';
    image.className = 'image-motion-image';
    image.before(frame);
    frame.append(plane);
    plane.append(image);
    return frame;
  });
  const visible = new Set();
  let animationFrame = 0;
  let idleTimer;
  let enabled = false;
  let disposed = false;

  function resetIdle() {
    clearTimeout(idleTimer);
    frames.forEach(frame => frame.classList.remove('is-image-idle'));
  }

  function update() {
    animationFrame = 0;
    if (!enabled || disposed) return;
    resetIdle();
    const desktop = innerWidth >= 768;
    const measurements = [...visible].map(frame => ({ frame, rect: frame.getBoundingClientRect() }));
    measurements.forEach(({ frame, rect }) => {
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / ((innerHeight + rect.height) / 2)));
      const offset = desktop ? progress * Math.min(18, rect.height * .018) : 0;
      frame.style.setProperty('--image-offset', `${offset.toFixed(2)}px`);
    });
    idleTimer = setTimeout(() => {
      if (!enabled || document.hidden || disposed) return;
      visible.forEach(frame => frame.classList.add('is-image-idle'));
    }, 180);
  }

  function requestUpdate() {
    if (!animationFrame && !disposed && enabled) animationFrame = requestAnimationFrame(update);
  }

  function setPreference() {
    enabled = !reduced.matches;
    document.documentElement.classList.toggle('image-motion-enabled', enabled);
    resetIdle();
    if (!enabled) frames.forEach(frame => frame.style.removeProperty('--image-offset'));
    else requestUpdate();
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) visible.add(target);
      else { visible.delete(target); target.classList.remove('is-image-idle'); }
    });
    requestUpdate();
  }, { rootMargin: '80px' }) : null;
  frames.forEach(frame => observer ? observer.observe(frame) : visible.add(frame));
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  document.querySelector('.product-rail')?.addEventListener('scroll', requestUpdate, { passive: true });
  reduced.addEventListener('change', setPreference);
  document.addEventListener('visibilitychange', () => document.hidden ? resetIdle() : requestUpdate());
  window.addEventListener('pagehide', event => {
    resetIdle();
    if (event.persisted) return;
    disposed = true;
    observer?.disconnect();
    cancelAnimationFrame(animationFrame);
  });
  window.addEventListener('pageshow', requestUpdate);
  setPreference();
}
