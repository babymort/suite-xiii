const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);
const f=p.frames().find(f=>/index\.html/.test(f.url()));
console.log(await f.evaluate(()=>[...document.querySelectorAll('#top-bar a,#top-bar button')].filter(b=>b.offsetParent!==null||getComputedStyle(b).display!='none').filter(b=>getComputedStyle(b).display!='none').map(b=>(b.id||'-')+' "'+b.textContent.trim().slice(0,22)+'"').join(' | ')));
await f.evaluate(()=>document.getElementById('xdr-btn').click());await p.waitForTimeout(1500);
console.log('frames:',p.frames().map(x=>x.url().split('/').pop()).join(', '));await b.close()})()
