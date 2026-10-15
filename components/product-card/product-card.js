import { image, arrow } from '../../scripts/utils.js';
export const catalog = [
  ['Mass Sofa','ImgImage12'],['BOULDER SOFA','ImgImage13'],['Piloti Sofa Table','ImgImage14'],['Lauro M','ImgImage15'],['Cone Floor Lamp','ImgImage16'],['Note Dining Chair','ImgImage17'],['Petalo Chair','ImgImage22'],['Pebble Sofa - Fabric','ImgImage24']
];
export function productCard(name,asset,compact=false){return `<article class="product-card ${compact?'product-card--compact':''}">${image(asset,name)}<h3>${name}</h3>${compact?'<p class="product-card-brand">잭슨카멜레온 (JacksonChameleon)</p>':''}<button class="card-link" type="button" data-detail="${name}" data-image="${asset}">${arrow(compact?'ArrowIcon2':'ArrowIcon1')}<span>${compact?'Shop':'More'}</span></button></article>`;}
export function bestProducts(){return `<section class="best-products" id="best-products" aria-label="베스트 컬렉션" data-node-id="517:2076"><p class="best-intro">무브먼트랩의 베스트 컬렉션은 시간이 지나도 변하지 않는 가치와 세련된 디자인,<br>그리고 일상 공간에 오래도록 존재감을 더하는 특별한 제품들을 엄선해 선보입니다.</p><div class="product-rail" tabindex="0" aria-label="베스트 상품 목록. 가로로 스크롤할 수 있습니다.">${catalog.slice(0,6).map(p=>productCard(...p)).join('')}</div></section>`;}
