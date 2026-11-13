const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:950}});const pg=await ctx.newPage();
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{localStorage.setItem('devisoXIII.summary',JSON.stringify({ht:10000,crew:6000,eq:3000,fees:1000}));localStorage.setItem('devisoXIII.project',JSON.stringify({real:[{ht:2000}]}));localStorage.setItem('xiii.dash.me',JSON.stringify({order:['budget','postes','check'],off:[]}));});
await pg.reload();await pg.waitForTimeout(7000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove());window.__r=0;const r0=XDASH.render;});
// compter les rendus au repos (boucle ?)
await F.evaluate(()=>{window.__n=0;new MutationObserver(()=>window.__n++).observe(document.getElementById('xd-dash'),{childList:true})});await pg.waitForTimeout(5000);
console.log('redessins au repos (5 s) :',await F.evaluate(()=>window.__n));
const txt=()=>F.evaluate(()=>{const c=document.querySelector('#xd-dash .xd-c[data-card=budget]');return c?c.textContent.replace(/\s+/g,' ').slice(0,70):'absent'});
console.log('avant :',await txt());
// un autre onglet (DEVISO) enregistre une dépense
const p2=await ctx.newPage();await p2.goto('http://localhost:8765/404.html');await p2.evaluate(()=>localStorage.setItem('devisoXIII.project',JSON.stringify({real:[{ht:2000},{ht:4500}]})));
await pg.waitForTimeout(900);
console.log('après (autre onglet) :',await txt(),'| surbrillance :',await F.evaluate(()=>!!document.querySelector('#xd-dash .xd-c[data-card=budget].xlive')));
// écriture dans la page elle-même (comme une donnée arrivée du Drive)
await F.evaluate(()=>localStorage.setItem('devisoXIII.summary',JSON.stringify({ht:20000,crew:12000,eq:6000,fees:2000})));await pg.waitForTimeout(900);
console.log('après (même page) :',await txt());
await F.evaluate(()=>{window.__n=0});await pg.waitForTimeout(4000);console.log('redessins au repos ensuite :',await F.evaluate(()=>window.__n));
await b.close()})();
