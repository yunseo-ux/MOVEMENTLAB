import { image, more } from '../../scripts/utils.js';

export function hero() {
  return `<section class="hero" aria-labelledby="hero-heading" data-node-id="517:2159">
    <div class="headline-stage">
      <h1 id="hero-heading" class="hero-heading display" aria-label="Discover. Experience. Live with what moves you.">
        <span class="hero-fragment hero-disc" aria-hidden="true">DISC</span>
        <span class="hero-fragment hero-ve" aria-hidden="true">VE</span>
        <span class="hero-fragment hero-exper" aria-hidden="true">EXPER</span>
        <span class="hero-fragment hero-ence" aria-hidden="true">ENCE</span>
        <span class="hero-fragment hero-live" aria-hidden="true">LIVE WITH WHAT</span>
        <span class="hero-fragment hero-moves" aria-hidden="true">MOVES</span>
        <span class="hero-fragment accent hero-o" aria-hidden="true">O</span>
        <span class="hero-fragment accent hero-r" aria-hidden="true">R</span>
        <span class="hero-fragment accent hero-i" aria-hidden="true">I</span>
        <span class="hero-fragment accent hero-you" aria-hidden="true">YOU</span>
      </h1>
      <p class="hero-signature">MOVEMENT LAB</p>
    </div>
    <div class="brand-intro">
      ${image('ImgImage31', '가구의 도면과 소재 샘플을 검토하는 무브먼트랩의 디자인 작업', 'asset', true)}
      <h2 class="intro-statement display"><span class="intro-first">WE SHAPE EVERYDAY</span> SPACES<span class="desktop-break"><br></span> WITH QUIET<br class="mobile-break"> DESIGN,<br class="desktop-break"> TACTILE<br class="mobile-break"> COMFORT, AND A<br>LASTING SENSE OF<br class="mobile-break"> BALANCE.</h2>
      <div class="intro-copy">
        <p>무브먼트랩은 공간과 삶의 움직임을 관찰하며, 편안함과 감각적인<br class="desktop-break"> 디자인이 자연스럽게 공존하는 라이프스타일을 제안합니다.<br>절제된 형태와 섬세한 소재, 오래 머물고 싶은 편안함을 바탕으로<br class="desktop-break"> 일상 속 공간에 새로운 분위기와 가치를 더합니다.</p>
        ${more('THE MORE', '#brands')}
      </div>
    </div>
  </section>`;
}

