const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove());document.getElementById('xs-gear').click()});await pg.waitForTimeout(800);
console.log(await F.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>!x.children.length&&/REPERO XIII/.test(x.textContent));return e?e.parentElement.outerHTML.slice(0,400):'rien'}));
await b.close()})();
