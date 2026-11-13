const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove())});
for(const t of ['org','dash','prep','tour','livr']){}
console.log('tuiles visibles :',await F.evaluate(()=>['catalogue','importo','planno','matos'].map(a=>{const c=document.querySelector('a.card[href="'+a+'.html"]:not(#xpin a)');return a+'='+(c?getComputedStyle(c).display:'absent')}).join(' ')));
// réglage « outils masqués » : masquer REPERO
console.log('masquage REPERO :',await F.evaluate(()=>{const S=JSON.parse(localStorage.getItem('hubXIII.prefs')||'{}');return Object.keys(S).join(',')}));
await b.close()})();
