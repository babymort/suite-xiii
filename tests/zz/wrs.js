const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(3000);
await pg.evaluate(()=>localStorage.removeItem('xiii.dash.me'));await pg.reload();await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov').forEach(m=>m.remove());XWMAN.open()});await pg.waitForTimeout(600);
const k='pilot';const h=await F.locator('#xwm .xwm-w[data-k="'+k+'"] .xwm-h').boundingBox();const c=await F.locator('#xwm .xwm-cell').first().boundingBox();
console.log('handle',h,'cell',c.width,c.height, 'hit', await F.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e.className},[h.x+8,h.y+8]));
await pg.mouse.move(h.x+8,h.y+8);await pg.mouse.down();for(let i=1;i<=10;i++){await pg.mouse.move(h.x+8+i*c.width*0.1,h.y+8+i*c.height*0.12);await pg.waitForTimeout(16)}
console.log('pendant',await F.evaluate(()=>{const p=document.querySelector('#xwm .xwm-pv');return p.style.display+' '+p.className+' '+p.style.width+'x'+p.style.height}));
await pg.mouse.up();await pg.waitForTimeout(400);
console.log(await F.evaluate(k=>document.querySelector('#xwm .xwm-w[data-k="'+k+'"] .z').textContent,k));await b.close()})();
