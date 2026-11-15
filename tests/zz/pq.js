const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);const f=p.frames().find(f=>/index\.html/.test(f.url()));
console.log(await f.evaluate(()=>[...document.querySelector('main').children].slice(0,8).map(e=>e.tagName+'#'+e.id+'.'+e.className+' h='+e.offsetHeight+' pos='+getComputedStyle(e).position).join('\n')));await b.close()})()
