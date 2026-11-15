const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.addInitScript(()=>{localStorage.setItem('xiii.a11y',JSON.stringify({size:150}));localStorage.setItem('xiii.tips.off','true')});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);const f=p.frames().find(f=>/index\.html/.test(f.url()));
await f.evaluate(()=>{document.querySelectorAll('#xt-root,#xnw-ov').forEach(x=>x.remove());[...document.querySelectorAll('button')].find(b=>/Démarrer/.test(b.textContent)).click()});await p.waitForTimeout(800);
await p.screenshot({path:'/tmp/zz/zp_a.png'});
const q=await b.newPage({viewport:{width:1440,height:900}});await q.addInitScript(()=>{localStorage.setItem('xiii.a11y',JSON.stringify({size:150}))});await q.goto('http://localhost:8765/plano.html?desktop=1');await q.waitForTimeout(3500);
await q.evaluate(()=>{document.querySelectorAll('#xt-root,#xnw-ov').forEach(x=>x.remove());XANIM.open()});await q.waitForTimeout(500);await q.screenshot({path:'/tmp/zz/zp_b.png'});
await b.close()})()
