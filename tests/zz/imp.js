const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1600,height:1000}});const pg=await ctx.newPage();
pg.on('pageerror',e=>console.log('ERR',e.message));await ctx.route(/script\.google|googleapis|workers\.dev/,r=>r.abort());
const FR=()=>pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
const clean=async F=>F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove())});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{localStorage.removeItem('xiii.dash.me');localStorage.removeItem('xiii.drive');});await pg.reload();await pg.waitForTimeout(6000);
let F=FR();await clean(F);
// 1) Master : disposition « Toute l'équipe »
await F.evaluate(()=>XWMAN.open());await pg.waitForTimeout(400);
console.log('Master, sélecteur présent :',await F.evaluate(()=>!!document.querySelector('#xwm [data-tgt]')));
await F.selectOption('#xwm [data-tgt]','*');await pg.waitForTimeout(300);
await F.evaluate(()=>{document.querySelector('#xwm .xwm-it[data-k=cal]').click()});await pg.waitForTimeout(300);
await F.click('#xwm .xwm-sd [data-f=w] [data-v="2"]').catch(()=>{});await pg.waitForTimeout(150);
await F.click('#xwm .xwm-sd [data-f=lk]');await pg.waitForTimeout(150);
const pos=await F.evaluate(()=>{const z=document.querySelector('#xwm .xwm-w[data-k=cal] .z').textContent;return z});console.log('cal dans la grille équipe :',pos);
await F.click('#xwm [data-ok]');await pg.waitForTimeout(800);
console.log('enregistré :',await F.evaluate(()=>{const I=XDASH.conf().imp||{};return JSON.stringify(I['*']&&{n:Object.keys(I['*'].lay).length,cal:I['*'].lay.cal,lock:I['*'].lock})}));
// 2) Membre secteur Image
await F.evaluate(()=>{localStorage.setItem('xiii.drive',JSON.stringify({url:'https://script.google.com/x',tok:'t1',secteur:'image',me:{name:'Léa'}}));localStorage.removeItem('xiii.dash.me');});
await pg.reload();await pg.waitForTimeout(7000);F=FR();await clean(F);
console.log('membre, accueil :',await F.evaluate(()=>{const c=document.querySelector('#xd-dash .xd-c[data-card=cal]');return c?'calendrier affiché, place '+c.style.gridColumn+' / '+c.style.gridRow:'calendrier ABSENT'}));
await F.evaluate(()=>XWMAN.open());await pg.waitForTimeout(400);
console.log('membre, sélecteur Master :',await F.evaluate(()=>!!document.querySelector('#xwm [data-tgt]')),'| bandeau :',await F.evaluate(()=>document.querySelector('#xwm .xwm-hint').textContent));
// tenter de déplacer et supprimer le verrouillé
const w=await F.locator('#xwm .xwm-w[data-k=cal]').boundingBox();await pg.mouse.move(w.x+20,w.y+20);await pg.mouse.down();await pg.mouse.move(w.x+300,w.y+200,{steps:8});await pg.mouse.up();await pg.waitForTimeout(300);
await pg.keyboard.press('Delete');await pg.waitForTimeout(200);
console.log('après essai déplacer/suppr :',await F.evaluate(()=>{const e=document.querySelector('#xwm .xwm-w[data-k=cal]');return e?e.querySelector('.z').textContent+' '+e.style.left+','+e.style.top:'SUPPRIMÉ'}),'| réglages :',await F.evaluate(()=>(document.querySelector('#xwm .xwm-lkm')||{}).textContent||'(pas de message)'));
// le membre ajoute un widget perso et enregistre
await F.evaluate(()=>{const it=document.querySelector('#xwm .xwm-it:not(.on)');it.click()});await F.click('#xwm [data-ok]');await pg.waitForTimeout(1200);
await pg.reload();await pg.waitForTimeout(7000);F=FR();await clean(F);
console.log('membre après sa disposition perso :',await F.evaluate(()=>{const c=document.querySelector('#xd-dash .xd-c[data-card=cal]');return c?'calendrier toujours là '+c.style.gridColumn+' / '+c.style.gridRow:'calendrier ABSENT'}));
await b.close()})();
