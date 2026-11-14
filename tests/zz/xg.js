const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove());XGUIDE.start()});await pg.waitForTimeout(800);
console.log(await F.evaluate(()=>{const o=document.getElementById('xg-ov');const b=o.querySelector('.xg-box');const r=b.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);let p=e,c=[];while(p&&c.length<4){c.push(p.id||p.className||p.tagName);p=p.parentElement}
 const cs=getComputedStyle(o),bs=getComputedStyle(b);return 'ov z='+cs.zIndex+' pe='+cs.pointerEvents+' class='+o.className+' dock='+o.dataset.xdock+' | box pe='+bs.pointerEvents+' class='+b.className+' | au centre: '+c.join(' < ')}));
await b.close()})();
