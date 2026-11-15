const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);const f=p.frames().find(f=>/index\.html/.test(f.url()));
console.log(await f.evaluate(()=>document.querySelector('.title-row').outerHTML.replace(/<svg[\s\S]*?<\/svg>/g,'<svg/>').slice(0,1500)));
await f.evaluate(()=>XPROJET.open());await p.waitForTimeout(800);console.log(await f.evaluate(()=>[...document.querySelectorAll('.xpj-body>section')].map(s=>s.id).join(',')+'|'+typeof XPROJET));
await b.close()})()
