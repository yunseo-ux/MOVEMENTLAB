// Optional browser check. Requires Chrome's local debugging port 9222.
import { writeFile } from 'node:fs/promises';
const targets=await(await fetch('http://localhost:9222/json/list')).json();
const target=targets.find(t=>t.type==='page'&&t.url.startsWith('http://localhost:3000'));
if(!target)throw Error('Open http://localhost:3000 in Chrome with --remote-debugging-port=9222 first.');
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
let id=0;const pending=new Map();const errors=[];
socket.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.text);if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(msg.error):p.resolve(msg.result);}};
function send(method,params={}){return new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});socket.send(JSON.stringify({id:key,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
try{
  await send('Runtime.enable');await send('Page.enable');await send('Page.reload',{ignoreCache:true});await new Promise(resolve=>setTimeout(resolve,1000));
  await evaluate(`document.querySelector('#detail-dialog').close();document.querySelector('#detail-body').replaceChildren();`);
  for(const width of [1920,768,430,390,375,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1080,deviceScaleFactor:1,mobile:width<768});
    await evaluate(`(async()=>{for(const im of document.images)im.loading='eager';await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));await document.fonts.ready;await new Promise(requestAnimationFrame);})()`);
    const report=await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,images:[...document.images].filter(im=>im.getBoundingClientRect().width>0).map(im=>({src:im.getAttribute('src'),ok:im.complete&&im.naturalWidth>0,w:im.getBoundingClientRect().width,h:im.getBoundingClientRect().height,ratio:im.naturalWidth/im.naturalHeight,renderedRatio:im.getBoundingClientRect().width/im.getBoundingClientRect().height})),sections:[...document.querySelectorAll('main>section,main>div>section')].map(s=>({name:s.className,y:Math.round(s.getBoundingClientRect().top+scrollY)}))})`);
    report.invalidImages=report.images.filter(im=>!im.ok||im.w<=0||im.h<=0||Math.abs(im.ratio/im.renderedRatio-1)>.025);
    delete report.images;
    console.log(JSON.stringify(report));
    const clientWidth=await evaluate('document.documentElement.clientWidth');
    if(report.scrollWidth>clientWidth||report.invalidImages.length){console.log(await evaluate(`([...document.querySelectorAll('.hero *,.collection *')].filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+.5).map(e=>({class:e.className,right:e.getBoundingClientRect().right})))`));throw Error('Layout or asset geometry failed at '+width);}
    if(width===1920||width===390){const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:report.height,scale:1}});await writeFile(width===1920?'preview-desktop.png':'preview-mobile.png',Buffer.from(shot.data,'base64'));}
  }
  console.log('Search:',await evaluate(`(async()=>{document.querySelector('[data-search]').click();const input=document.querySelector('#product-search');input.value='Petalo';input.dispatchEvent(new Event('input'));const count=document.querySelectorAll('.search-results button').length;document.querySelector('.search-results button').click();const title=document.querySelector('#detail-title').textContent;document.querySelector('#detail-dialog').close();return {count,title};})()`));
  console.log('Brand:',await evaluate(`(()=>{document.querySelectorAll('[data-brand]')[2].click();return [...document.querySelectorAll('[data-brand]')].filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.dataset.brand);})()`));
  console.log('Runtime errors:',JSON.stringify(errors));
  if(errors.length)throw Error('Browser runtime errors');
}finally{socket.close();}



