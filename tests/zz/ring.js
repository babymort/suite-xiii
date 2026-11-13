const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(3000);
await pg.evaluate(()=>localStorage.removeItem('xiii.dash.me'));await pg.reload();await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov').forEach(m=>m.remove())});
console.log('coins visibles:',await F.evaluate(()=>[...document.querySelectorAll('#xd-dash .xd-rs')].filter(e=>e.offsetWidth).length));
const res=[];
for(const f of ['ring','gauge','bar']){
 await F.evaluate(()=>XWMAN.open());await pg.waitForTimeout(500);
 await F.click('#xwm .xwm-w[data-k=check]');await pg.waitForTimeout(300);
 const has=await F.evaluate(()=>!!document.querySelector('#xwm .xwm-sd [data-f=f]'));
 await F.click('#xwm .xwm-sd [data-f=f] [data-v='+f+']');await F.click('#xwm [data-ok]');await pg.waitForTimeout(1600);
 res.push(f+': format proposé='+has+' rendu='+await F.evaluate(()=>{const c=document.querySelector('#xd-dash .xd-c[data-card=check]');const x=c&&c.querySelector('.xwm-fmt');return x?x.className+' | origine masquée='+!!c.querySelector('.xwm-hid'):'aucun'}));
 const el=await F.$('#xd-dash .xd-c[data-card=check]');if(el)await el.screenshot({path:'/tmp/zz/fmt_'+f+'.png'});}
console.log(res.join('\n'));await b.close()})();
