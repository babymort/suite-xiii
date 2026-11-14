const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.conduco.hide','1')});
await pg.goto('http://localhost:8765/conduco.html');await pg.waitForTimeout(5000);
const secs=()=>pg.evaluate(()=>[...document.querySelectorAll('#toolbar > .xsec')].filter(s=>s.offsetWidth).map(s=>s.dataset.sec+'('+[...s.querySelectorAll('button')].filter(b=>b.offsetWidth).length+')').join(' '));
console.log('avant :',await secs());
// clic droit sur la barre → menu → Personnaliser
const pt=await pg.evaluate(()=>{const tb=document.getElementById('toolbar'),r=tb.getBoundingClientRect();for(let x=r.right-5;x>r.left;x-=10){const e=document.elementFromPoint(x,r.top+r.height/2);if(e&&!e.closest('button,select,input')&&tb.contains(e))return [x,r.top+r.height/2]}return null});console.log('point vide',pt);await pg.mouse.click(pt[0],pt[1],{button:'right'});await pg.waitForTimeout(400);console.log('menu :',await pg.evaluate(()=>[...document.querySelectorAll('#xb-menu [data-i]')].map(x=>x.textContent.trim().slice(0,30)).join(' / ')));
const ok=await pg.evaluate(()=>{const it=[...document.querySelectorAll('#xb-menu [data-i]')].find(x=>/Personnaliser les barres/.test(x.textContent));if(it){it.click();return true}return false});await pg.waitForTimeout(400);
console.log('menu → fenêtre :',ok,await pg.evaluate(()=>!!document.getElementById('xbc')));
// ordre : Outils métier en premier
await pg.evaluate(()=>{const d=document.querySelector('#xbc .ord [data-k=met] [data-mv="-1"]');for(let i=0;i<4;i++)document.querySelector('#xbc .ord [data-k=met] [data-mv="-1"]').click()});await pg.waitForTimeout(300);
// favori : premier bouton de Modifier ; masquer : premier bouton d'Afficher
const r=await pg.evaluate(()=>{const rows=[...document.querySelectorAll('#xbc .sec')];const pick=(n,a)=>{const s=rows.find(x=>x.querySelector('b').textContent===n);const r=s&&s.querySelector('.row');if(r){r.querySelector('[data-a='+a+']').click();return r.querySelector('.lb').textContent}return '-'};return 'favori: '+pick('Créer','fav')});await pg.waitForTimeout(300);
const r2=await pg.evaluate(()=>{const s=[...document.querySelectorAll('#xbc .sec')].find(x=>x.querySelector('b').textContent==='Afficher');const r=s&&s.querySelector('.row');if(!r)return '-';r.querySelector('[data-a=vis]').click();return 'masqué: '+r.querySelector('.lb').textContent});await pg.waitForTimeout(300);
console.log(r,'|',r2);await pg.screenshot({path:'/tmp/zz/barcfg.png'});
await pg.evaluate(()=>document.querySelector('#xbc [data-ok]').click());await pg.waitForTimeout(400);
console.log('après :',await secs());
await pg.reload();await pg.waitForTimeout(5000);console.log('après rechargement :',await secs());
await b.close()})();
