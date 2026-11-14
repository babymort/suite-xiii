const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
console.log(await F.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>/255, 183, 77/.test(getComputedStyle(e).color)).slice(0,6).map(e=>(e.id||e.className||e.tagName).toString().slice(0,30)+' «'+e.textContent.trim().slice(0,25)+'»').join(' | ')));
await b.close()})();
