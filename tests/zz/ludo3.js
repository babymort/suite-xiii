const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.ludo.hide','1');localStorage.setItem('xiii.ux.density','compact')});
await pg.goto('http://localhost:8765/ludo.html');await pg.waitForTimeout(5000);
const pos=()=>pg.evaluate(()=>[...document.querySelectorAll('#tabs-container .tab')].slice(0,12).map(t=>Math.round(t.getBoundingClientRect().left)).join(','));
const p0=await pos();await pg.click('#tabs-container .tab[data-g]:nth-child(8)');await pg.waitForTimeout(500);const p1=await pos();console.log(p0);console.log(p1);
console.log('barre des jeux stable :',p0===p1, '| largeurs :',await pg.evaluate(()=>[...new Set([...document.querySelectorAll('#tabs-container .tab')].map(t=>t.offsetWidth))].join(',')));
await pg.click('#xlib-tab');await pg.waitForTimeout(700);
console.log('onglets verticaux :',await pg.evaluate(()=>[...document.querySelectorAll('.cat-tab')].map(t=>t.textContent+' '+t.offsetWidth+'×'+t.offsetHeight).join(' | ')));
// bandeau de sauvegarde factice (même identifiant)
console.log('bandeau :',await pg.evaluate(()=>{let c=document.getElementById('xau-chip');if(!c){c=document.createElement('div');c.id='xau-chip';c.textContent='🛟 Sauvegarde automatique en pause : Réautoriser le dossier';document.body.appendChild(c)}const p=document.getElementById('library-panel').getBoundingClientRect();return 'gauche du bandeau '+Math.round(c.getBoundingClientRect().left)+'px, bord droit du volet '+Math.round(p.right)+'px'}));
await pg.screenshot({path:'/tmp/zz/ludo3.png',clip:{x:0,y:0,width:900,height:900}});
await b.close()})();
