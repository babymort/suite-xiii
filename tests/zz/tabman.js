const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const app of process.argv.slice(2)){const pg=await b.newPage({viewport:{width:1440,height:900}});pg.on('pageerror',e=>console.log(' ERR',e.message.slice(0,140)));
await pg.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1')}catch(e){}},app);
await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(4000);
await pg.evaluate(()=>{const m=document.getElementById('modal');if(m&&/Guide/.test(m.textContent))m.style.display='none'});
// ajoute 2 onglets via le ＋
const addSel='#tabs-container + button';for(let i=0;i<2;i++){const a=pg.locator(addSel);if(await a.count()){await a.click({force:true});await pg.waitForTimeout(400);
 await pg.evaluate(()=>{const ok=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/^(OK|Valider|Créer|Ajouter)$/i.test(b.textContent.trim()));if(ok)ok.click()});await pg.waitForTimeout(300);}}
const n0=await pg.evaluate(()=>document.querySelectorAll('#tabs-container > .tab').length);
const tb=await pg.locator('#tabs-container .tab').first().boundingBox();await pg.mouse.click(tb.x+10,tb.y+tb.height/2,{button:'right'});await pg.waitForTimeout(500);
const info=await pg.evaluate(()=>{const o=document.getElementById('xtm');if(!o)return 'PAS OUVERT';return [...o.querySelectorAll('.xtm-t')].map(t=>(t.querySelector('.xtm-nm')||t).textContent.trim().slice(0,22)+'['+[...t.querySelectorAll('.xtm-ac button')].map(b=>b.dataset.k).join(',')+(t.draggable?',drag':'')+']').join(' | ')});
console.log(app,'onglets:',n0,'→',info);
if(app===process.argv[2])await pg.screenshot({path:'/tmp/zz/tm_'+app+'.png'});
// ouvrir le premier (non actif) en cliquant sa tuile
const r=await pg.evaluate(()=>{const t=[...document.querySelectorAll('#xtm .xtm-t:not(.on):not(.xtm-new)')][0];if(!t)return 'aucune';const nm=t.querySelector('.xtm-nm').textContent;t.click();return nm});
await pg.waitForTimeout(500);console.log('  ouvre',r,'→ actif:',await pg.evaluate(()=>{const a=document.querySelector('#tabs-container .tab.active .tab-title');return a&&a.textContent.trim().slice(0,22)}),'| fenêtre fermée:',await pg.evaluate(()=>!document.getElementById('xtm')));
await pg.close()}
await b.close()})();
