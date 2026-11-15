const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:950}});
await p.goto('http://localhost:8765/cadro.html?desktop=1#live');await p.waitForTimeout(3000);
await p.evaluate(()=>document.querySelector('#xcl [data-go2]').click());await p.waitForTimeout(1500);
const t=Date.now();console.log(await Promise.race([p.evaluate(()=>{const v=document.querySelector('#xcl video');const c=document.createElement('canvas');c.width=320;c.height=180;const x=c.getContext('2d');let t=performance.now();x.drawImage(v,0,0,320,180);const d=x.getImageData(0,0,320,180);return [performance.now()-t, document.querySelectorAll('#xcl figure').length]}),new Promise(r=>setTimeout(()=>r('timeout'),10000))]),Date.now()-t);
await b.close()})()
