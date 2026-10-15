import { image, arrow, more } from '../../scripts/utils.js';
const brands = [
  { name: 'JACKSON CHAMELEON', description: '낯섦과 익숙함, 서로 다른 가치가 조화를 이루는 새로운 가구를 만듭니다.', asset: 'ImgImage25', alt: '잭슨카멜레온의 가구와 오브제가 전시된 쇼룸', node: '517:2134' },
  { name: 'MUNITO', description: '디자인의 다양성을 향한 끊임없는 시도를 통해 당신의 일상에 새로운 영감과 미감을 선사합니다.', asset: 'brand-munito', alt: '무니토의 브라운 가죽 소파와 테이블', node: '535:1585' },
  { name: 'MARSET', description: '신생 디자이너와의 협업으로 따뜻한 분위기를 창출하며 지속 가능한 가치를 추구합니다.', asset: 'brand-marset', alt: '벽면을 은은하게 비추는 마르셋 플로어 조명', node: '535:1661' },
  { name: 'OBLIQUE TABLE', description: '엄선된 소재와 편안한 조화를 바탕으로, 시간이 지나도 변하지 않는 테이블의 가치를 추구합니다.', asset: 'brand-oblique-table', alt: '오블리크테이블의 원형 테이블과 다이닝 체어', node: '535:1771' },
  { name: 'MBIS', description: '동양적 절제와 미적 감수성에 뿌리를 둔 현대 조명 브랜드입니다.', asset: 'brand-mbis', alt: '창가의 엠비스 테이블 조명과 차 도구', node: '535:1847' },
  { name: 'MAGICVAULT', description: '삶의 아름다움과 풍요로움을 지향하는 라이프스타일 브랜드입니다.', asset: 'brand-magicvault', alt: '매직볼트의 선반과 벽 거울', node: '535:1923' }
];

export function brandsSection() {
  return `<section class="brands" id="brands" aria-labelledby="brands-title" data-node-id="517:2134">
    <div class="brands-heading"><h2 class="display" id="brands-title" aria-label="Curated Brands. Distinctive Values. Timeless Selection."><span class="brand-title-line" aria-hidden="true"><em>Curated</em> Bra<span class="brand-letter">n</span>ds</span><br class="desktop-break"><span class="brand-title-line" aria-hidden="true">Distinc<span class="brand-letter">t</span>ive Val<span class="brand-letter">u</span>es</span><br class="desktop-break"><span class="brand-title-line" aria-hidden="true">Ti<span class="brand-letter">m</span>eless <em>Sele<span class="brand-letter">c</span>tion</em></span></h2><p>확실한 가치와 고유한 개성을 지닌 브랜드를 무브먼트랩의<br class="mobile-break"> 시선으로 선별해 소개합니다.<br>각 브랜드가 가진 철학과 디자인,<br class="mobile-break"> 소재와 완성도까지 세심하게 살펴 일상 속 공간에 자연스럽게<br class="mobile-break"> 스며들 수 있는 선택을 제안합니다. 시간이 지나도 변하지 않는<br class="mobile-break"> 가치와 쉽게 만날 수 없는 희소성을 지닌 브랜드들을<br class="mobile-break"> 무브먼트랩에서 만나보세요.</p></div>
    <div class="brands-body">
      <div class="asset brand-visual" id="brand-preview" role="group" aria-label="JACKSON CHAMELEON 브랜드 이미지">
        ${brands.map((brand, index) => image(brand.asset, brand.alt, `brand-visual-image ${index === 0 ? 'is-active' : ''}`)).join('')}
      </div>
      <div class="brands-controls"><div class="brand-list" role="group" aria-label="이미지를 확인할 브랜드 선택">
        ${brands.map((brand, index) => `<button class="brand-row ${index === 0 ? 'is-active' : ''}" type="button" aria-pressed="${index === 0}" aria-controls="brand-preview" data-brand="${brand.name}" data-state-node="${brand.node}"><span class="brand-index">(0${index + 1})</span><span class="brand-name display">${brand.name}</span><span class="brand-arrow">${arrow()}</span><span class="brand-description">${brand.description}</span></button>`).join('')}
      </div>${more('BRAND MORE', '#portfolio')}</div>
    </div><p class="sr-only" id="brand-status" aria-live="polite"></p>
  </section>`;
}

export function initBrands() {
  const buttons = [...document.querySelectorAll('[data-brand]')];
  const images = [...document.querySelectorAll('.brand-visual-image')];
  const preview = document.querySelector('#brand-preview');
  const status = document.querySelector('#brand-status');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let selected = 0;
  let request = 0;
  const decoded = images.map((img, index) => {
    img.setAttribute('aria-hidden', String(index !== 0));
    img.loading = 'eager';
    return img.decode().then(() => true).catch(() => false);
  });

  async function select(index, announce = false) {
    const token = ++request;
    preview.setAttribute('aria-busy', 'false');
    if (index === selected) return;
    preview.setAttribute('aria-busy', 'true');
    const ready = images[index].complete && images[index].naturalWidth > 0 || await decoded[index];
    if (token !== request) return;
    preview.setAttribute('aria-busy', 'false');
    if (!ready) { status.textContent = '브랜드 이미지를 불러오지 못했습니다.'; return; }
    selected = index;
    buttons.forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-pressed', String(i === index));
      images[i].classList.toggle('is-active', i === index);
      images[i].setAttribute('aria-hidden', String(i !== index));
    });
    preview.setAttribute('aria-label', `${brands[index].name} 브랜드 이미지`);
    if (announce) status.textContent = `${brands[index].name} 이미지가 표시되었습니다.`;
  }

  buttons.forEach((button, index) => {
    button.addEventListener('pointerenter', event => {
      if (finePointer.matches && event.pointerType === 'mouse') select(index);
    });
    button.addEventListener('focus', () => select(index, true));
    button.addEventListener('click', () => select(index, true));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus({ preventScroll: true });
    });
  });
}

