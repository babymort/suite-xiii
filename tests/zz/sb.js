const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);const f=p.frames().find(f=>/index\.html/.test(f.url()));
console.log(await f.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length<4&&/^🔎?\s*Rechercher/.test(x.textContent.trim())&&x.offsetWidth>150&&x.offsetWidth<600);let o=e;return o.outerHTML.slice(0,500)+'\nparent:'+o.parentElement.id+'.'+o.parentElement.className+'\nW='+o.offsetWidth}));
await b.close()})()
