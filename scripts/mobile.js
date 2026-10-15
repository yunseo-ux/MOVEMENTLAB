// Mobile exports preserve the crops used in Figma without changing desktop assets.
export function initMobileAssets() {
  const source = index => `./assets/mobile/ImgImage${index || ''}.svg`;
  const mapping = {
    ImgImage31:0, ImgImage26:1, ImgImage28:2, ImgImage27:3, ImgImage29:4, ImgImage30:5,
    ImgImage:6, ImgImage1:7, ImgImage2:9, ImgImage3:8,
    ImgImage4:11, ImgImage5:12, ImgImage6:13, ImgImage7:10,
    ImgImage8:16, ImgImage9:17, ImgImage10:14, ImgImage11:15,
    ImgImage12:18, ImgImage13:19, ImgImage14:20, ImgImage15:21, ImgImage16:22, ImgImage17:23,
    ImgImage21:24, ImgImage23:25, ImgImage22:26, ImgImage24:27,
    ImgImage18:34, ImgImage19:35, ImgImage20:36
  };
  const entries = [...document.querySelectorAll('main img')].flatMap(img => {
    const name = img.getAttribute('src').split('/').pop().replace('.svg','');
    return Object.hasOwn(mapping,name) ? [{img, desktop:img.getAttribute('src'), mobile:source(mapping[name])}] : [];
  });
  document.querySelectorAll('.brand-row').forEach((row,index) => {
    const img = document.createElement('img');
    img.className = 'brand-thumbnail';
    img.src = source(28 + index);
    img.alt = '';
    img.loading = 'lazy';
    row.prepend(img);
  });
  const media = matchMedia('(max-width:767px)');
  const update = () => entries.forEach(({img,desktop,mobile}) => {img.src = media.matches ? mobile : desktop;});
  update();
  media.addEventListener('change',update);
}
