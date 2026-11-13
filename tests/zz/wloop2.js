const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:950}});const pg=await ctx.newPage();
await pg.goto('http://localhost:8765/espace.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{localStorage.setItem('devisoXIII.summary',JSON.stringify({ht:20000,crew:11000,eq:6000,fees:2000}));localStorage.setItem('xiii.dash.me',JSON.stringify({order:['postes','budget','proj','check','fav'],off:[]}));});
await pg.reload();await pg.waitForTimeout(5000);
for(const a of ['conduco','plano','scripto'])await pg.evaluate(a=>open(a+'.html'),a);await pg.waitForTimeout(6000);
// revenir sur l'accueil
await pg.evaluate(()=>{const t=[...document.querySelectorAll('#tabs .t')][0];t&&t.click()});await pg.waitForTimeout(2000);
const F=pg.frames().find(f=>/index\.html/.test(f.url()));
console.log(await F.evaluate(()=>new Promise(r=>{const K={};let n=0;const g=document.getElementById('xd-dash');new MutationObserver(ms=>{if(ms.some(m=>m.target===g))n++}).observe(g,{childList:true});
 addEventListener('storage',e=>{K[e.key]=(K[e.key]||0)+1});setTimeout(()=>r('redessins en 8 s : '+n+'\nclés reçues : '+Object.entries(K).sort((a,b)=>b[1]-a[1]).slice(0,10).map(x=>x[0]+'×'+x[1]).join(', ')),8000)})));
await b.close()})();
