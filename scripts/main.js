import { header } from '../components/header/header.js';
import { hero } from '../components/hero/hero.js';
import { collection } from '../components/collection/collection.js';
import { showcases } from '../components/product-showcase/product-showcase.js';
import { bestProducts } from '../components/product-card/product-card.js';
import { featuredProducts } from '../components/featured-products/featured-products.js';
import { initFeaturedProducts } from '../components/featured-products/featured-products-motion.js';
import { brandsSection } from '../components/brands/brands.js';
import { portfolio } from '../components/portfolio/portfolio.js';
import { footer } from '../components/footer/footer.js';

import { initInteractions } from './interactions.js';
import { initImageMotion } from './image-motion.js';
import { initMobileAssets } from './mobile.js';

document.querySelector('#app').innerHTML = `${header()}<main id="main">${hero()}${collection()}${showcases()}${bestProducts()}${featuredProducts()}${brandsSection()}${portfolio()}</main>${footer()}`;
initMobileAssets();

initFeaturedProducts();
initInteractions();
initImageMotion();

// Keep this page as a visual preview with no navigation or button actions.
const app = document.querySelector('#app');
app.querySelectorAll('a').forEach(link => link.removeAttribute('href'));
app.querySelectorAll('button').forEach(button => {
  button.disabled = true;
  button.removeAttribute('data-detail');
  button.removeAttribute('data-image');
  button.removeAttribute('data-search');
  button.removeAttribute('aria-controls');
  button.removeAttribute('aria-pressed');
});
document.querySelector('#detail-dialog')?.remove();
