const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{localStorage.setItem('devisoXIII.summary',JSON.stringify({ht:20000,crew:11000,eq:6000,fees:2000}));localStorage.setItem('xiii.dash.me',JSON.stringify({order:['postes','budget'],off:[],sty:{budget:{f:'ring'}}}));});
await pg.reload();await pg.waitForTimeout(7000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
const w=()=>F.evaluate(()=>[...document.querySelectorAll('#xd-dash [data-card=postes] .hv')].map(e=>Math.round(parseFloat(getComputedStyle(e).width))).join(','));
console.log('largeurs stables :',await w());
// un redessin avec les mêmes valeurs : les barres ne doivent pas repartir de 0
await F.evaluate(()=>XDASH.render());await pg.waitForTimeout(60);console.log('juste après un redessin identique :',await w());
// une vraie modification venue d'un autre onglet
await F.evaluate(()=>localStorage.setItem('xiii.drive.stat','{"t":1}'));await pg.waitForTimeout(700);
await pg.evaluate(()=>localStorage.setItem('xiii.drive.stat','{"t":2}'));
const n=await F.evaluate(()=>new Promise(r=>{let n=0;const g=document.getElementById('xd-dash');new MutationObserver(ms=>{if(ms.some(m=>m.target===g))n++}).observe(g,{childList:true});setTimeout(()=>r(n),1500)}));
console.log('redessins après une écriture xiii.drive.stat :',n);
await b.close()})();
