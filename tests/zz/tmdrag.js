const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{try{localStorage.setItem('xiii.tour2.conduco.hide','1')}catch(e){}});
await pg.goto('http://localhost:8765/conduco.html');await pg.waitForTimeout(4000);
await pg.evaluate(()=>{addTab();addTab();P.tabs.forEach((t,i)=>t.name='C'+(i+1));renderTabs();});
await pg.evaluate(()=>XTABMAN.open());await pg.waitForTimeout(500);
const t=pg.locator('#xtm .xtm-t:not(.xtm-new)');await t.nth(0).dragTo(t.nth(2));await pg.waitForTimeout(500);
console.log('modèle:',await pg.evaluate(()=>P.tabs.map(t=>t.name).join(',')+' actif='+P.tabs[P.active].name),'| barre:',await pg.evaluate(()=>[...document.querySelectorAll('#tabs-container .tab-title')].map(x=>x.textContent.trim()).join(',')),'| tuiles:',await pg.evaluate(()=>[...document.querySelectorAll('#xtm .xtm-nm')].map(x=>x.textContent).join(',')));
await b.close()})();
