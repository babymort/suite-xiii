const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.color',JSON.stringify({mode:'perso',c:'#ba68c8'}));localStorage.setItem('xiii.tour2.deviso.hide','1')});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove())});
await pg.screenshot({path:'/tmp/zz/col_v1.png'});
await pg.evaluate(()=>open('deviso.html'));await pg.waitForTimeout(6000);await pg.screenshot({path:'/tmp/zz/col_v2.png'});
await b.close()})();
