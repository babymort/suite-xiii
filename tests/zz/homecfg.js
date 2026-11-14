const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
let F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove())});
const navs=()=>F.evaluate(()=>[...document.querySelectorAll('#xh-nav button[data-t]')].filter(b=>b.style.display!=='none').map(b=>b.textContent.trim()).join(' · '));
console.log('avant :',await navs());
await F.evaluate(()=>XHOMECFG.open());await pg.waitForTimeout(300);
await F.evaluate(()=>{const r=n=>document.querySelector('#xhc .rub [data-n="'+n+'"]');r('Livrer').querySelector('[data-m="-1"]').click();});await pg.waitForTimeout(100);
await F.evaluate(()=>{document.querySelector('#xhc .rub [data-n="Livrer"] [data-m="-1"]').click();document.querySelector('#xhc .rub [data-n="Tourner"] [data-h]').click();});await pg.waitForTimeout(100);
await F.evaluate(()=>{document.querySelector('#xhc [data-f=size] [data-v=s]').click();document.querySelector('#xhc [data-f=bg] [data-v=dots]').click();const t=document.querySelector('#xhc [data-msg]');t.value='Tournage J-12 · DPAE avant vendredi';t.dispatchEvent(new Event('input'));const h=document.querySelector('#xhc [data-hello]');h.checked=true;h.dispatchEvent(new Event('change'));document.querySelector('#xhc [data-f=start] [data-v=dash]').click();});
await pg.waitForTimeout(300);await pg.screenshot({path:'/tmp/zz/hc_win.png'});await F.evaluate(()=>document.querySelector('#xhc [data-ok]').click());await pg.waitForTimeout(300);
console.log('après :',await navs(),'| message :',await F.evaluate(()=>(document.getElementById('xh-msg')||{}).textContent),'| fond',await F.evaluate(()=>document.documentElement.dataset.xhbg));
// ouvrir Organiser puis recharger : doit revenir sur Dashboard
await F.evaluate(()=>{const b=[...document.querySelectorAll('#xh-nav button')].find(x=>/Organiser/.test(x.textContent));b.click()});await pg.waitForTimeout(400);
await pg.reload();await pg.waitForTimeout(6500);F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove())});
console.log('rechargé :',await navs(),'| rubrique ouverte :',await F.evaluate(()=>(document.querySelector('#xh-nav button.on')||{}).textContent));
await pg.screenshot({path:'/tmp/zz/hc_dash.png'});
await F.evaluate(()=>{const b=[...document.querySelectorAll('#xh-nav button')].find(x=>/Concevoir/.test(x.textContent));b.click()});await pg.waitForTimeout(600);await pg.screenshot({path:'/tmp/zz/hc_tiles.png'});
await b.close()})();
