const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.addInitScript(()=>{localStorage.setItem('xiii.a11y',JSON.stringify({size:150}))});
await p.goto('http://localhost:8765/plano.html?desktop=1');await p.waitForTimeout(3500);
await p.evaluate(()=>{const c=document.querySelector('canvas');window.__o=null;c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();window.__o=[e.offsetX,e.clientX-r.left,e.offsetY,e.clientY-r.top,c.width,r.width]})});
const r=await p.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return [r.left,r.top]});
await p.mouse.move((r[0]+100)*1.5,(r[1]+80)*1.5);await p.waitForTimeout(200);console.log(await p.evaluate(()=>window.__o));
console.log(await p.evaluate(()=>[...new Set([...document.querySelectorAll('script')].map(s=>s.textContent).join('').match(/\.offset[XY]\b/g)||[])].length));
await b.close()})()
