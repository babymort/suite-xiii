const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove());document.querySelector('#xh-nav [data-t=xh-team]').click()});await pg.waitForTimeout(700);
console.log(await F.evaluate(()=>{const s=document.getElementById('xh-team');return s.querySelector('h2').textContent+' | '+[...s.querySelectorAll('.xh-panel button b,.xh-panel button strong')].map(x=>x.textContent).join(' · ')+' | nav: '+document.querySelector('#xh-nav [data-t=xh-team]').textContent}));
await pg.screenshot({path:'/tmp/zz/pxiii.png',clip:{x:200,y:60,width:1240,height:420}});
await b.close()})();
