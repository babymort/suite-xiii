const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/catalogue.html');await pg.waitForTimeout(5000);
console.log('catalogue.html mène à :',pg.url().replace('http://localhost:8765/',''),'| vue active :',await pg.evaluate(()=>{const b=document.querySelector('#view-group .active,#view-group [aria-pressed=true],#view-group .on');return b?b.textContent.trim():'?'}));
await pg.goto('http://localhost:8765/importo.html');await pg.waitForTimeout(6000);
console.log('importo.html mène à :',pg.url().replace('http://localhost:8765/',''));
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
console.log('fiche projet ouverte avec import :',await F.evaluate(()=>!!document.getElementById('xpj-importo')));
await b.close()})();
