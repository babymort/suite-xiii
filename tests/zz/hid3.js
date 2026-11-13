const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(3000);
await pg.evaluate(()=>{localStorage.setItem('xiii.settings.index',JSON.stringify({hidden:'repero.html'}))});
await pg.reload();await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
console.log('REPERO masqué →',await F.evaluate(()=>{const c=document.querySelector('a.card[href="repero.html"]');return c?getComputedStyle(c).display:'absente'}),'| CADRO (non masqué) →',await F.evaluate(()=>getComputedStyle(document.querySelector('a.card[href="cadro.html"]')).display));
await b.close()})();
