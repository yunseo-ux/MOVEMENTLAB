import { image } from '../../scripts/utils.js';
export function header() { return `<header class="site-header" data-node-id="517:2191">
  <a href="#" class="site-logo" aria-label="Movement Lab 홈">${image('Logo', 'MOVEMENT LAB', '', true)}</a>
  <nav class="main-nav" aria-label="주 메뉴"><a href="#shop">Shop</a><a href="#collections">Collections</a><a href="#brands">Brand</a></nav>
  <div class="utility-nav"><button type="button" data-search>Search</button><button type="button" data-detail="Sign in">Sign in</button><button type="button" data-detail="Cart (0)">Cart (0)</button></div>
</header>`; }
