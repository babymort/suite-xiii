const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto('http://localhost:8765/index.html?noshell=1');await pg.waitForTimeout(5000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
console.log(await F.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length<12&&/^\s*Dashboard\s*$/.test(x.textContent));let p=e,c=[];while(p&&c.length<6){const r=p.getBoundingClientRect();c.push((p.id?'#'+p.id:p.tagName+'.'+String(p.className).slice(0,40))+' w='+Math.round(r.width)+' pos='+getComputedStyle(p).position);p=p.parentElement}return c.join('\n')}));
console.log(await F.evaluate(()=>{const n=document.querySelector('#xh6-nav,.xh6-side,aside');return n?n.outerHTML.slice(0,900):'none'}));
await b.close()})();
