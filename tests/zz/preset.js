const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);await pg.evaluate(()=>{localStorage.removeItem('xiii.dash.me');localStorage.removeItem('xiii.drive')});await pg.reload();await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove());XWMAN.open()});await pg.waitForTimeout(400);
await F.click('#xwm [data-pre]');await pg.waitForTimeout(300);
console.log('menu :',await F.evaluate(()=>[...document.querySelectorAll('#xwm-pm [data-ps]')].map(b=>b.querySelector('b').textContent).join(', ')));
await pg.screenshot({path:'/tmp/zz/pre_menu.png',clip:{x:600,y:60,width:900,height:420}});
for(const id of ['prod','regie','tech','post']){await F.evaluate(()=>{if(!document.getElementById('xwm-pm'))document.querySelector('#xwm [data-pre]').click()});await pg.waitForTimeout(150);await F.click('#xwm-pm [data-ps='+id+']');await pg.waitForTimeout(450);
 console.log(id,':',await F.evaluate(()=>[...document.querySelectorAll('#xwm .xwm-w:not([data-gone])')].map(w=>w.dataset.k+'('+w.querySelector('.z').textContent+')').join(' ')));}
await F.evaluate(()=>{document.querySelector('#xwm [data-pre]').click()});await pg.waitForTimeout(150);await F.click('#xwm-pm [data-ps=back]');await pg.waitForTimeout(400);
console.log('retour :',await F.evaluate(()=>document.querySelectorAll('#xwm .xwm-w:not([data-gone])').length+' blocs'));
await F.evaluate(()=>{document.querySelector('#xwm [data-pre]').click()});await pg.waitForTimeout(150);await F.click('#xwm-pm [data-ps=regie]');await pg.waitForTimeout(400);
await F.click('#xwm [data-ok]');await pg.waitForTimeout(1500);
console.log('accueil :',await F.evaluate(()=>[...document.querySelectorAll('#xd-dash .xd-g>.xd-c')].map(c=>c.dataset.card+(c.dataset.xwmf?':'+c.dataset.xwmf:'')).join(' ')));
await b.close()})();
