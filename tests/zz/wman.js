const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(3000);
await pg.evaluate(()=>{localStorage.removeItem('xiii.dash.me');sessionStorage.setItem('xiii.noshell','1')});await pg.reload();await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov').forEach(m=>m.remove())});
const off=F===pg.mainFrame()?[0,0]:await pg.evaluate(()=>{const f=[...document.querySelectorAll('iframe')].find(x=>x.offsetWidth>300);const r=f.getBoundingClientRect();return [r.x,r.y]});
const P=async s=>{const bx=await F.locator(s).first().boundingBox();return bx};
await F.locator('#xd-plus').scrollIntoViewIfNeeded();let bx=await P('#xd-plus');await pg.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);await pg.waitForTimeout(700);
console.log('ouvert:',await F.evaluate(()=>!!document.getElementById('xwm')),'blocs:',await F.evaluate(()=>document.querySelectorAll('#xwm .xwm-w').length));
await pg.screenshot({path:'/tmp/zz/wm1.png'});
// déplacer le 1er bloc de 2 colonnes à droite / 1 ligne en bas (humain)
const w=await P('#xwm .xwm-w');const cs=await P('#xwm .xwm-cell');
const k=await F.evaluate(()=>document.querySelector('#xwm .xwm-w').dataset.k);
await pg.mouse.move(w.x+30,w.y+20);await pg.mouse.down();for(let i=1;i<=10;i++){await pg.mouse.move(w.x+30+i*(cs.width+12)*0.3,w.y+20+i*(cs.height+12)*0.4);await pg.waitForTimeout(16)}
await pg.screenshot({path:'/tmp/zz/wm2.png'});await pg.mouse.up();await pg.waitForTimeout(400);
// redimensionner
const w2=await P('#xwm .xwm-w[data-k="'+k+'"] .xwm-h');await pg.mouse.move(w2.x+8,w2.y+8);await pg.mouse.down();for(let i=1;i<=8;i++){await pg.mouse.move(w2.x+8+i*cs.width*0.15,w2.y+8+i*cs.height*0.15);await pg.waitForTimeout(16)}await pg.mouse.up();await pg.waitForTimeout(400);
// glisser un widget de la liste (HTML5 DnD)
const nk=await F.evaluate(()=>{const it=document.querySelector('#xwm .xwm-it:not(.on)');return it&&it.dataset.k});
if(nk){await F.locator('#xwm .xwm-it[data-k="'+nk+'"]').dragTo(F.locator('#xwm .xwm-bd'),{targetPosition:{x:20,y:(await P('#xwm .xwm-bd')).height-40}});await pg.waitForTimeout(400);}
console.log('L:',await F.evaluate(()=>JSON.stringify([...document.querySelectorAll('#xwm .xwm-w')].map(w=>w.dataset.k+':'+w.querySelector('.z').textContent))));
await pg.screenshot({path:'/tmp/zz/wm3.png'});
// style accent + couleur
await F.click('#xwm .xwm-sd [data-f=s] [data-v=solid]');await F.click('#xwm .xwm-sd [data-f=c] [data-v="#4fc3f7"]');
await F.click('#xwm [data-ok]');await pg.waitForTimeout(1500);
console.log('me:',await F.evaluate(()=>localStorage.getItem('xiii.dash.me').slice(0,300)));
console.log('dash:',await F.evaluate(()=>{const g=document.querySelector('#xd-dash .xd-g');return g.className+' | '+[...g.children].slice(0,5).map(c=>c.dataset.card+' '+c.style.gridColumn+'/'+c.style.gridRow+' '+(c.dataset.xwms||'')).join(' ; ')}));
await F.locator('#xd-dash').scrollIntoViewIfNeeded();await pg.waitForTimeout(300);await pg.screenshot({path:'/tmp/zz/wm4.png'});
await b.close()})();
