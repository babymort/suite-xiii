const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);const f=p.frames().find(f=>/index\.html/.test(f.url()));await f.evaluate(()=>document.querySelectorAll('#xt-root,#xnw-ov').forEach(x=>x.remove()));
await p.screenshot({path:'/tmp/zz/sb.png',clip:{x:180,y:70,width:700,height:120}});await b.close()})()
