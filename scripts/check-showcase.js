// Targeted browser check: three product panels, reveal ordering, overlap and accessibility.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const targets = await (await fetch('http://localhost:9222/json/list')).json();
const target = targets.find(item => item.url.startsWith('http://localhost:3000'));
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => { socket.onopen = resolve; });
let id = 0;
const pending = new Map();
const errors = [];
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  const task = pending.get(message.id);
  if (!task) return;
  pending.delete(message.id);
  message.error ? task.reject(message.error) : task.resolve(message.result);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const key = ++id;
  const timeout = setTimeout(() => { pending.delete(key); reject(Error(`Timed out: ${method}`)); }, 12000);
  pending.set(key, { resolve: result => { clearTimeout(timeout); resolve(result); }, reject: error => { clearTimeout(timeout); reject(error); } });
  socket.send(JSON.stringify({ id: key, method, params }));
});
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
  return result.result.value;
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.bringToFront');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await evaluate("history.scrollRestoration='manual';scrollTo({top:0,behavior:'instant'})");
  await send('Page.reload', { ignoreCache: true });
  for (let index = 0; index < 30; index++) {
    if (await evaluate("Boolean(document.querySelector('#shop.showcase-stack'))")) break;
    await wait(100);
  }
  await evaluate(`window.sequenceLog=[];
    window.panelY=index=>document.querySelector('#shop').getBoundingClientRect().top+scrollY+[...document.querySelectorAll('.product-showcase')].slice(0,index).reduce((height,section)=>height+section.getBoundingClientRect().height,0);
    new MutationObserver(records=>{for(const record of records){if(record.target.matches('[data-showcase-step].is-revealed'))sequenceLog.push({panel:record.target.closest('section').id,delay:parseFloat(record.target.style.getPropertyValue('--reveal-delay'))||0})}}).observe(document.querySelector('#shop'),{subtree:true,attributes:true,attributeFilter:['class']});`);
  const ids = ['vp-globe', 'nua-table', 'bahn'];
  const reports = [];
  for (let index = 0; index < ids.length; index++) {
    await evaluate(`scrollTo({top:panelY(${index}),behavior:'instant'})`);
    await wait(2700);
    const report = await evaluate(`(()=>{const section=document.getElementById('${ids[index]}');return {
      id:section.id,position:getComputedStyle(section).position,
      visible:section.querySelectorAll('[data-showcase-step].is-revealed').length,
      total:section.querySelectorAll('[data-showcase-step]').length,
      assets:[...section.querySelectorAll('.showcase-image img')].map(image=>({ok:image.complete&&image.naturalWidth>0,ratio:image.naturalWidth/image.naturalHeight,rendered:image.getBoundingClientRect().width/image.getBoundingClientRect().height,opacity:getComputedStyle(image).opacity,clip:getComputedStyle(image).clipPath})),
      delays:sequenceLog.filter(item=>item.panel===section.id).map(item=>item.delay)
    }})()`);
    assert.equal(report.position, 'sticky');
    assert.equal(report.visible, report.total);
    assert.ok(report.assets.every(asset => asset.ok && asset.opacity === '1' && Math.abs(asset.ratio / asset.rendered - 1) < .025));
    assert.ok(report.delays.some(delay => delay >= 180));
    reports.push(report);
    if (index < ids.length - 1) {
      await evaluate(`scrollTo({top:panelY(${index + 1})-innerHeight/2,behavior:'instant'})`);
      await wait(300);
      const overlap = await evaluate(`(()=>{const previous=document.getElementById('${ids[index]}'),next=document.getElementById('${ids[index + 1]}'),rect=next.getBoundingClientRect();return {shade:+previous.style.getPropertyValue('--cover-shade'),topPanel:document.elementFromPoint(innerWidth/2,rect.top+20)?.closest('.product-showcase')?.id}})()`);
      assert.ok(overlap.shade > 0);
      assert.equal(overlap.topPanel, ids[index + 1]);
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      await writeFile(`preview-showcase-transition-${index}.png`, Buffer.from(shot.data, 'base64'));
    }
  }
  await evaluate("scrollTo({top:panelY(0),behavior:'instant'})");
  await wait(150);
  assert.equal(await evaluate("document.querySelectorAll('#vp-globe [data-showcase-step].is-revealed').length"), 7);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await wait(100);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#vp-globe')).position"), 'relative');
  assert.equal(await evaluate("document.querySelectorAll('#shop [data-showcase-step]:not(.is-revealed)').length"), 0);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await wait(100);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#vp-globe')).position"), 'relative');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'));
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ reports, reverseScroll: true, reducedMotion: true, mobile: true, errors }, null, 2));
} finally {
  await send('Emulation.setEmulatedMedia', { features: [] });
  await send('Emulation.clearDeviceMetricsOverride');
  socket.close();
}
