import { image, more } from '../../scripts/utils.js';

export function collection() {
  return `<section class="collection" id="collections" aria-labelledby="collection-title">
    <div class="collection-feature">
      ${image('ImgImage26', '리앙 가죽 소파와 우드 가구가 어우러진 공간')}
      <div class="collection-copy">
        <p class="collection-brand">잭슨카멜레온 (JacksonChameleon)</p>
        <h2 class="display" id="collection-title">Curated<br>Combi<br>Leather Sofa<br>Collection</h2>
        <div class="collection-description">
          <p>리앙은 부드럽게 주름지는 매트한 가죽과 반광 스틸 다리가 은은한<br class="desktop-break"> 대비를 이루며, 시간이 지나도 현대적 감각을 잃지 않는 소파입니다.<br>사용자의 손길이 더해질수록 공간에 자연스럽게 스며드는 리앙은,<br class="desktop-break"> 부드러운 곡선미로 공간에 포근함을 더하고 고밀도 가죽의 질감으로<br class="desktop-break"> 조용하고 깊이 있는 고급스러움을 완성합니다.</p>
          ${more('THE MORE', '#shop')}
        </div>
      </div>
      <div class="collection-detail">${image('ImgImage28', '가죽 소파의 소재와 형태 디테일')}</div>
    </div>
    <div class="collection-caption">
      <h3 class="display" aria-label="A balance shaped by contrasting materials.">
        <span class="caption-line caption-line--first" aria-hidden="true">A bal<span class="letter-space">&nbsp;&nbsp;&nbsp;</span>nce shaped</span>
        <span class="caption-line caption-line--second" aria-hidden="true">by co<span class="letter-space">&nbsp;&nbsp;&nbsp;</span>trasting mate<span class="letter-space">&nbsp;&nbsp;&nbsp;</span>ials.</span>
        <span class="accent caption-a" aria-hidden="true">A</span>
        <span class="accent caption-n" aria-hidden="true">N</span>
        <span class="accent caption-r" aria-hidden="true">R</span>
      </h3>
      <p>각 소재가 지닌 고유한 특성을 살리면서, 세심한 디자인과 정교한 디테일이<br class="desktop-break"> 자연스럽게 어우러져 오래도록 편안한 휴식을 선사합니다.</p>
    </div>
    <div class="collection-collage">
      <div>${image('ImgImage30', '창가에 배치된 그린 소파')}</div>
      <div>${image('ImgImage27', '어두운 공간의 가죽 소파와 테이블')}</div>
      <div>${image('ImgImage29', '소파 옆 테이블과 가죽 소재')}</div>
    </div>
  </section>`;
}
