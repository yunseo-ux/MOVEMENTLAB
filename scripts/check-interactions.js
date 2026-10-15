// Optional interaction smoke check. Open the dev server and Chrome debugging port 9222.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const targets = await (await fetch('http://localhost:9222/json/list')).json();
const target = targets.find(item => item.type === 'page' && item.url.startsWith('http://localhost:3000'));
if (!target) throw Error('Open http://localhost:3000 with Chrome debugging port 9222 first.');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let id = 0;
const pending = new Map();
const errors = [];
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  if (!message.id) return;
  const task = pending.get(message.id);
  if (!task) return;
  pending.delete(message.id);
  message.error ? task.reject(message.error) : task.resolve(message.result);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => { pending.delete(key); reject(Error(`Timed out: ${method}`)); }, 12000);
  const key = ++id;
  pending.set(key, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } });
  socket.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
  return result.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function screenshot(name) {
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(name, Buffer.from(shot.data, 'base64'));
}
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.bringToFront');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.reload', { ignoreCache: true });
  for (let count = 0; count < 40; count++) {
    if (await evaluate("Boolean(document.querySelector('.drag-cursor'))")) break;
    await pause(100);
  }
  await evaluate("document.documentElement.style.scrollBehavior='auto';scrollTo(0,0)");
  await pause(1600);
  assert.equal(await evaluate("document.documentElement.classList.contains('motion-ready')"), true);
  assert.equal(await evaluate("document.querySelectorAll('.motion-label').length > 10"), true);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.hero-disc')).opacity"), '1');
  await screenshot('preview-motion-desktop.png');
  const link = await evaluate("(()=>{const r=document.querySelector('.main-nav a').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()");
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: link.x, y: link.y });
  await pause(650);
  assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.main-nav a .motion-label-main > span')).transform"), 'matrix(1, 0, 0, 1, 0, 0)');

  await evaluate("document.querySelector('#nua-table').scrollIntoView({behavior:'instant',block:'center'})");
  await pause(1500);
  // Establish real downward intent after a programmatic jump into sticky panels.
  await evaluate('scrollBy(0,80)');
  await pause(200);
  const reveal = await evaluate("({visible:document.querySelector('#nua-table .showcase-content').classList.contains('is-revealed'),headerHidden:document.querySelector('.site-header').classList.contains('header-hidden'),parallax:document.querySelector('#nua-table .showcase-image').style.getPropertyValue('--parallax-y')})");
  assert.equal(reveal.visible, true);
  assert.equal(reveal.headerHidden, true);
  assert.ok(reveal.parallax);
  await evaluate('scrollBy(0,-100)');
  await pause(500);
  assert.equal(await evaluate("document.querySelector('.site-header').classList.contains('header-hidden')"), false);
  await screenshot('preview-motion-showcase.png');

  await evaluate("document.querySelector('.product-rail').scrollIntoView({behavior:'instant',block:'center'});document.querySelector('.product-rail').scrollLeft=0");
  await pause(500);
  const rail = await evaluate("(()=>{const e=document.querySelector('.product-rail'),r=e.getBoundingClientRect();return {x:Math.min(r.right-80,1050),y:r.top+Math.min(100,r.height/2),before:e.scrollLeft}})()");
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rail.x, y: rail.y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rail.x, y: rail.y, button: 'left', clickCount: 1 });
  for (let step = 1; step <= 8; step++) await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rail.x - step * 50, y: rail.y, button: 'left', buttons: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rail.x - 400, y: rail.y, button: 'left', clickCount: 1 });
  await pause(350);
  const drag = await evaluate("({scroll:document.querySelector('.product-rail').scrollLeft,dialog:document.querySelector('#detail-dialog').open,dragging:document.querySelector('.product-rail').classList.contains('is-dragging')})");
  assert.ok(drag.scroll > rail.before + 100, 'Dragging should advance the product rail');
  assert.equal(drag.dialog, false);
  assert.equal(drag.dragging, false);
  await evaluate("document.querySelector('.product-rail .card-link').click()");
  assert.equal(await evaluate("document.querySelector('#detail-dialog').open"), true);
  await evaluate("document.querySelector('#detail-dialog').close();document.querySelector('#detail-body').replaceChildren()");

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await pause(100);
  const reduced = await evaluate("({ready:document.documentElement.classList.contains('motion-ready'),hidden:document.querySelectorAll('[data-reveal]:not(.is-revealed)').length,parallax:[...document.querySelectorAll('.showcase-image')].every(e=>getComputedStyle(e).transform==='none'),smooth:getComputedStyle(document.documentElement).scrollBehavior})");
  assert.equal(reduced.ready, false);
  assert.equal(reduced.hidden, 0);
  assert.equal(reduced.parallax, true);
  // Remove the inline scroll behavior used by this check to inspect the stylesheet preference.
  await evaluate("document.documentElement.style.removeProperty('scroll-behavior')");
  assert.equal(await evaluate('getComputedStyle(document.documentElement).scrollBehavior'), 'auto');

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await evaluate("scrollTo({top:0,behavior:'instant'})");
  await pause(150);
  const mobile = await evaluate("({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,cursor:getComputedStyle(document.querySelector('.drag-cursor')).display})");
  assert.ok(mobile.scrollWidth <= mobile.width);
  assert.equal(mobile.cursor, 'none');
  await screenshot('preview-motion-mobile.png');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ reveal, drag, reduced, mobile, errors }, null, 2));
  console.log('PASS: entrances, scroll reveal, parallax, header direction, dragging, click, mobile, reduced motion.');
} finally {
  await send('Emulation.setEmulatedMedia', { features: [] });
  await send('Emulation.clearDeviceMetricsOverride');
  socket.close();
}
