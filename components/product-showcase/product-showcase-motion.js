// Reference: Analogue Foundation's three Experiences sections.
// Keep original image slots; sequence only the elements currently entering view.
export function initShowcaseMotion() {
  const container = document.querySelector('#shop');
  const sections = [...container.querySelectorAll('.product-showcase')];
  const lastStart = new WeakMap();
  const steps = [];
  let observer;
  let enabled = false;
  let idleTimer;

  function resetZoom() {
    clearTimeout(idleTimer);
    sections.forEach(section => section.classList.remove('is-scroll-resting'));
  }

  sections.forEach((section, index) => {
    section.style.setProperty('--panel-index', index + 1);
    const content = section.querySelector('.showcase-content');
    const images = [...section.querySelectorAll('.showcase-image > .asset')];
    const text = [...content.children];
    [...images, ...text].forEach(element => {
      element.dataset.showcaseStep = '';
      element.dataset.reveal = element.matches('img') ? 'showcase-image' : 'rise';
      steps.push(element);
    });
  });
  // Observe the unmasked wrapper: an image with a fully closed clip has no intersection.
  const observationTargets = new Map(steps.map(element => [element.matches('img') ? element.parentElement : element, element]));

  function finish() {
    resetZoom();
    observer?.disconnect();
    steps.forEach(element => {
      element.style.setProperty('--reveal-delay', '0ms');
      element.classList.add('is-revealed');
    });
    sections.forEach(section => {
      section.classList.add('showcase-entered');
      section.querySelector('.showcase-content').classList.add('is-revealed');
      section.style.removeProperty('--cover-shade');
    });
  }

  function setEnabled(value) {
    enabled = value && 'IntersectionObserver' in window;
    container.classList.toggle('showcase-stack', enabled);
    observer?.disconnect();
    if (!enabled) { finish(); return; }
    observer = new IntersectionObserver(entries => {
      // Position, rather than DOM order, also respects the mobile grid's reordering.
      const visible = entries.filter(entry => entry.isIntersecting && !observationTargets.get(entry.target).classList.contains('is-revealed'))
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      const now = performance.now();
      visible.forEach(({ target: observed }) => {
        const target = observationTargets.get(observed);
        const section = target.closest('.product-showcase');
        const start = Math.max(now, (lastStart.get(section) ?? now - 180) + 180);
        target.style.setProperty('--reveal-delay', `${Math.min(1080, Math.round(start - now))}ms`);
        lastStart.set(section, start);
        target.classList.add('is-revealed');
        section.classList.add('showcase-entered');
        section.querySelector('.showcase-content').classList.add('is-revealed');
        observer.unobserve(observed);
      });
    }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
    observationTargets.forEach((element, observed) => {
      if (!element.classList.contains('is-revealed')) observer.observe(observed);
    });
  }

  function update() {
    if (!enabled) return;
    resetZoom();
    const desktop = innerWidth >= 768;
    const rects = sections.map(section => section.getBoundingClientRect());
    sections.forEach((section, index) => {
      const next = rects[index + 1];
      const progress = desktop && next ? Math.max(0, Math.min(1, 1 - next.top / innerHeight)) : 0;
      section.style.setProperty('--cover-shade', (progress * .2).toFixed(3));
    });
    // After scrolling settles, gently zoom only the panel occupying the viewport centre.
    idleTimer = setTimeout(() => {
      if (!enabled || document.hidden) return;
      const centre = innerHeight / 2;
      const active = sections.findLast(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= centre && rect.bottom > centre;
      });
      active?.classList.add('is-scroll-resting');
    }, 180);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetZoom();
    else update();
  });

  container.addEventListener('focusin', event => {
    const step = event.target.closest('[data-showcase-step]');
    if (!step) return;
    step.style.setProperty('--reveal-delay', '0ms');
    step.classList.add('is-revealed');
    observer?.unobserve(step);
  });
  return { setEnabled, update, finish };
}
