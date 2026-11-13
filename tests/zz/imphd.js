const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:900}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove());XWMAN.open()});await pg.waitForTimeout(400);
await F.selectOption('#xwm [data-tgt]','regie');await pg.waitForTimeout(300);await F.evaluate(()=>document.querySelector('#xwm .xwm-w').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0})));await pg.waitForTimeout(300);
await pg.screenshot({path:'/tmp/zz/imp_hd.png',clip:{x:0,y:60,width:1500,height:560}});await b.close()})();
