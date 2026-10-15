// Motion reference: https://analoguefoundation.com/
// Keep the Figma layout intact; animate within each component's own space.
import { initShowcaseMotion } from '../components/product-showcase/product-showcase-motion.js';

export function initInteractions() {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const rail = document.querySelector('.product-rail');
  const entranceAnimations = new Set();
  let revealObserver;
  let frame = 0;
  let lastScroll = scrollY;
  let directionOrigin = scrollY;
  let lastDirection = 0;
  let motionEnabled = false;
  let disposed = false;
  const showcaseMotion = initShowcaseMotion();

  // Each link keeps one accessible name; its animated copy is decorative.
  const labelTargets = document.querySelectorAll('.main-nav a, .utility-nav button, .card-link > span');
  labelTargets.forEach(target => {
    const text = target.textContent.trim();
    const control = target.closest('a, button');
    if (!control.hasAttribute('aria-label')) control.setAttribute('aria-label', text);
    const label = document.createElement('span');
    label.className = 'motion-label';
    label.setAttribute('aria-hidden', 'true');
    ['main', 'copy'].forEach(layer => {
      const line = document.createElement('span');
      line.className = `motion-label-${layer}`;
      [...text].forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter === ' ' ? '\u00a0' : letter;
        span.style.setProperty('--letter-delay', `${Math.min(index, 14) * 16}ms`);
        line.append(span);
      });
      label.append(line);
    });
    target.replaceChildren(label);
  });

  const revealGroups = [
    ['.intro-statement, .intro-copy, .collection-copy h2, .collection-description, .collection-caption, .best-intro, .featured-sidebar-inner > p, .brands-heading, .brand-row, .portfolio-intro, .portfolio-grid article', 'rise'],
    ['.brand-intro > .asset, .collection-feature > .asset, .collection-detail > .asset, .collection-collage .asset, .featured-scene > .asset, .brands-body > .asset', 'image']
  ];
  revealGroups.forEach(([selector, type]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.dataset.reveal = type;
      element.style.setProperty('--reveal-delay', `${index % 3 * 65}ms`);
    });
  });
  const revealElements = [...document.querySelectorAll('[data-reveal]:not([data-showcase-step])')];
  document.addEventListener('focusin', event => {
    const element = event.target.closest('[data-reveal]');
    if (element) {
      element.classList.add('is-revealed');
      revealObserver?.unobserve(element);
    }
  });
  const parallaxElements = [...document.querySelectorAll('.showcase-image')].map((element, index) => ({
    element,
    section: element.closest('.product-showcase'),
    depth: [1, -.65, .55, -.85][index % 4]
  }));

  function revealAll() {
    revealObserver?.disconnect();
    revealElements.forEach(element => element.classList.add('is-revealed'));
  }

  function updateMotionPreference() {
    motionEnabled = !reduceMotion.matches;
    root.classList.toggle('motion-ready', motionEnabled);
    showcaseMotion.setEnabled(motionEnabled);
    if (!motionEnabled) {
      revealAll();
      entranceAnimations.forEach(animation => animation.cancel());
      entranceAnimations.clear();
      parallaxElements.forEach(({ element }) => element.style.removeProperty('--parallax-y'));
      header.classList.remove('header-hidden');
    } else if ('IntersectionObserver' in window) {
      revealObserver?.disconnect();
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });
      revealElements.filter(element => !element.classList.contains('is-revealed')).forEach(element => revealObserver.observe(element));
    } else revealAll();
    scheduleFrame();
  }

  function animateEntrance() {
    if (!motionEnabled || !Element.prototype.animate) return;
    const order = ['.hero-disc', '.hero-o', '.hero-ve', '.hero-r', '.hero-exper', '.hero-i', '.hero-ence', '.hero-live', '.hero-moves', '.hero-you'];
    order.forEach((selector, index) => {
      const element = document.querySelector(selector);
      const animation = element.animate([
        { opacity: 0, transform: `translate3d(0, ${element.classList.contains('accent') ? 28 : 48}px, 0)` },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], { duration: 1000, delay: 80 + index * 65, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      entranceAnimations.add(animation);
      animation.finished.then(() => entranceAnimations.delete(animation)).catch(() => {});
    });
  }

  function updateScroll() {
    frame = 0;
    if (disposed) return;
    const current = Math.max(0, scrollY);
    const direction = Math.sign(current - lastScroll);
    if (direction && direction !== lastDirection) directionOrigin = lastScroll;
    if (direction) lastDirection = direction;
    header.classList.toggle('is-scrolled', current > 24);
    if (current < 160 || !motionEnabled) header.classList.remove('header-hidden');
    else if (Math.abs(current - directionOrigin) > 14 && !header.matches(':focus-within')) header.classList.toggle('header-hidden', direction > 0);
    lastScroll = current;
    showcaseMotion.update();

    if (!motionEnabled) return;
    const desktop = innerWidth >= 768;
    const positions = new Map();
    parallaxElements.forEach(({ section }) => {
      if (!positions.has(section)) positions.set(section, section.getBoundingClientRect());
    });
    parallaxElements.forEach(({ element, section, depth }) => {
      const rect = positions.get(section);
      if (rect.bottom < -80 || rect.top > innerHeight + 80) return;
      const offset = desktop ? Math.max(-28, Math.min(28, (innerHeight / 2 - rect.top - rect.height / 2) * .045 * depth)) : 0;
      element.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
    });
  }

  function scheduleFrame() { if (!frame && !disposed) frame = requestAnimationFrame(updateScroll); }
  window.addEventListener('scroll', scheduleFrame, { passive: true });
  window.addEventListener('resize', scheduleFrame, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('header-hidden'));
  reduceMotion.addEventListener('change', updateMotionPreference);

  // Mouse dragging supplements native touch scrolling and keyboard access.
  const cursor = document.createElement('div');
  cursor.className = 'drag-cursor';
  cursor.textContent = 'DRAG';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);
  let drag = null;
  let suppressClick = false;
  let resetClickTimer;
  function hideCursor() { cursor.classList.remove('is-visible'); }
  rail.addEventListener('pointerenter', event => {
    if (!finePointer.matches || event.pointerType !== 'mouse') return;
    cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
    cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
    if (motionEnabled) cursor.classList.add('is-visible');
  });
  rail.addEventListener('pointerleave', hideCursor);
  rail.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !finePointer.matches) return;
    clearTimeout(resetClickTimer);
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, scroll: rail.scrollLeft, active: false };
  });
  rail.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
    cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
    cursor.classList.toggle('over-control', Boolean(event.target.closest('button, a')) && !drag?.active);
    if (!drag || event.pointerId !== drag.id) return;
    if (!event.buttons) { endDrag(event); return; }
    const distance = event.clientX - drag.x;
    if (!drag.active && Math.abs(distance) > 6) {
      drag.active = true;
      suppressClick = true;
      rail.classList.add('is-dragging');
      rail.setPointerCapture(event.pointerId);
    }
    if (drag.active) { event.preventDefault(); rail.scrollLeft = drag.scroll - distance; }
  });
  function endDrag(event) {
    if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id)) return;
    const id = drag.id;
    drag = null;
    rail.classList.remove('is-dragging');
    if (rail.hasPointerCapture(id)) rail.releasePointerCapture(id);
    // The pointerup's following click is suppressed; a later real click works normally.
    resetClickTimer = setTimeout(() => { suppressClick = false; }, 0);
  }
  rail.addEventListener('pointerup', endDrag);
  window.addEventListener('pointerup', endDrag);
  rail.addEventListener('pointercancel', endDrag);
  rail.addEventListener('lostpointercapture', endDrag);
  rail.addEventListener('dragstart', event => event.preventDefault());
  rail.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  }, true);
  rail.addEventListener('keydown', event => {
    if (event.target !== rail || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    rail.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * rail.clientWidth * .65, behavior: motionEnabled ? 'smooth' : 'instant' });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { endDrag({}); hideCursor(); } });
  window.addEventListener('blur', () => { endDrag({}); hideCursor(); });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) hideCursor(); });

  updateMotionPreference();
  // Font readiness is bounded so slow font delivery never delays content indefinitely.
  Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 1200))]).then(animateEntrance);
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    disposed = true;
    revealAll();
    showcaseMotion.finish();
    entranceAnimations.forEach(animation => animation.cancel());
    if (frame) cancelAnimationFrame(frame);
  }, { once: true });
}
