const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);const f=p.frames().find(f=>/index\.html/.test(f.url()));
await f.evaluate(()=>XPROJET.open());await p.waitForTimeout(800);
console.log(await f.evaluate(()=>[...document.querySelectorAll('.xpj-body>section')].map(s=>s.id+':'+((s.querySelector('h2,h3,h4')||{}).textContent||'').slice(0,30)).join(' , ')+'\nNAV:'+[...document.querySelectorAll('.xpj-nav a')].map(a=>a.getAttribute('href')+'='+a.textContent.trim()).join(',')+'\n'+(document.querySelector('.xpj-body>section')||{outerHTML:''}).outerHTML.slice(0,600)));
await b.close()})()
