const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [mode,c] of [['xiii',''],['perso','#4fc3f7'],['perso','#81c784']]){const pg=await b.newPage({viewport:{width:1440,height:900}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(([m,c])=>{localStorage.setItem('xiii.tour2.conduco.hide','1');localStorage.setItem('xiii.color',JSON.stringify({mode:m,c}))},[mode,c]);
const t0=Date.now();await pg.goto('http://localhost:8765/conduco.html');await pg.waitForTimeout(4500);
const r=await pg.evaluate(()=>{const tab=document.querySelector('#tabs-container .tab.active');const lt=document.getElementById('xlib-tab');return 'onglet actif '+getComputedStyle(tab).backgroundColor+' · languette '+getComputedStyle(lt).borderTopColor+' · data-xcolor='+document.documentElement.dataset.xcolor+' · styles réécrits '+[...document.querySelectorAll('style')].filter(s=>s.__xo!=null).length});
console.log(mode,c,'→',r);await pg.click('#xs-gear');await pg.waitForTimeout(700);await pg.screenshot({path:'/tmp/zz/col_'+(c||'xiii').replace('#','')+'.png'});await pg.close()}
await b.close()})();
