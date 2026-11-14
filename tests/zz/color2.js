const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.syno.hide','1')});
await pg.goto('http://localhost:8765/syno.html');await pg.waitForTimeout(4500);
await pg.click('#xs-gear');await pg.waitForTimeout(500);await pg.evaluate(()=>{document.getElementById('xcolor-sw').closest('details').open=true});await pg.waitForTimeout(300);

console.log('réglage présent :',await pg.evaluate(()=>!!document.getElementById('xcolor-sw')));
await pg.click('#xcolor-sw [data-v=perso]');await pg.waitForTimeout(300);
await pg.click('#xcolor-sw [data-xcp="#ba68c8"]');await pg.waitForTimeout(400);
console.log('après choix violet :',await pg.evaluate(()=>document.documentElement.dataset.xcolor+' '+localStorage.getItem('xiii.color')+' languette '+getComputedStyle(document.getElementById('xlib-tab')).borderTopColor));
const el=await pg.$('#xcolor-sw');await el.scrollIntoViewIfNeeded();await el.screenshot({path:'/tmp/zz/col_row.png'});
await pg.click('#xcolor-sw [data-v=xiii]');await pg.waitForTimeout(300);
console.log('retour XIII :',await pg.evaluate(()=>getComputedStyle(document.getElementById('xlib-tab')).borderTopColor));
await b.close()})();
