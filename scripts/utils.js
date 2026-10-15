export const image = (name, alt = '', className = 'asset', eager = false) => `<img class="${className}" src="./assets/images/${name}.svg" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
export const arrow = (name = 'ArrowIcon') => image(name, '', 'arrow');
const moreContent = label => `<span class="more-line" aria-hidden="true"></span><span class="more-arrow more-arrow--before" aria-hidden="true">${arrow()}</span><span class="more-label">${label === 'THE MORE' ? 'READ MORE' : label}</span><span class="more-arrow more-arrow--after" aria-hidden="true">${arrow()}</span>`;
export const more = (label, target) => `<a class="more-link" href="${target}">${moreContent(label)}</a>`;
export const detailButton = (label, title, asset = '') => `<button class="more-link" type="button" data-detail="${title}" data-image="${asset}">${moreContent(label)}</button>`;
