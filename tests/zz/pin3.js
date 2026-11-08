const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(3000);
await pg.evaluate(()=>{localStorage.setItem('xiii.pins',JSON.stringify(['plano','syno','dossier']))});await pg.reload();await pg.waitForTimeout(7000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov').forEach(m=>m.remove())});
console.log(await F.evaluate(()=>{const p=document.getElementById('xpin');if(!p)return 'no xpin';p.scrollIntoView();return [...p.querySelectorAll('.card')].map(c=>{const r=c.getBoundingClientRect(),n=c.querySelector('.xh6-nm');return c.className+' w='+(r.width|0)+' x='+(r.x|0)+' y='+(r.y|0)+' nomX='+(n?n.getBoundingClientRect().x|0:'-')}).join('\n')}));
await pg.waitForTimeout(500);await pg.screenshot({path:'/tmp/zz/pin3.png'});await b.close()})();
