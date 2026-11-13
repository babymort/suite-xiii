const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const pg=await ctx.newPage();
pg.on('console',m=>{if(/LIVE/.test(m.text()))console.log(m.text())});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{console.log('LIVE présent', typeof XLIVE);const r=XDASH.render;addEventListener('storage',e=>console.log('LIVE ev',e.key,e.storageArea===localStorage, !!document.querySelector('#xwm,#xd-pop,#xd-gal')));const o=XLIVE.refresh;});
const p2=await ctx.newPage();await p2.goto('http://localhost:8765/404.html');await p2.evaluate(()=>localStorage.setItem('devisoXIII.project','{"real":[{"ht":1}]}'));await pg.waitForTimeout(2000);
await b.close()})();
