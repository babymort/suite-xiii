const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const app of process.argv.slice(2)){const pg=await b.newPage({viewport:{width:1440,height:900}});pg.on('pageerror',e=>console.log(' ERR',e.message.slice(0,120)));
await pg.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1')}catch(e){}},app);
await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(4000);
await pg.evaluate(()=>{const m=document.getElementById('modal');if(m&&/Guide/.test(m.textContent))m.style.display='none'});await pg.waitForTimeout(300);
const anims=()=>pg.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&a.effect&&a.effect.target).map(a=>{const t=a.effect.target;return (t.id||t.className||t.tagName).toString().slice(0,18)}).slice(0,4).join(','));
const R=[];
await pg.click('#xtop-exp');await pg.waitForTimeout(40);R.push('menu ⬇️: '+(await anims()||'—'));await pg.keyboard.press('Escape');await pg.evaluate(()=>{const m=document.querySelector('#xb-menu');if(m)m.remove()});await pg.waitForTimeout(300);
await pg.click('#xs-gear');await pg.waitForTimeout(40);R.push('réglages: '+(await anims()||'—'));await pg.keyboard.press('Escape');await pg.waitForTimeout(400);
await pg.click('#xf-btn');await pg.waitForTimeout(40);R.push('recherche: '+(await anims()||'—'));await pg.keyboard.press('Escape');await pg.waitForTimeout(400);
const add=pg.locator('#tabs-container + button');if(await add.count()){await add.click({force:true});await pg.waitForTimeout(40);R.push('nouvel onglet: '+(await anims()||'—'));await pg.waitForTimeout(500);await pg.evaluate(()=>{const ok=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/^(OK|Valider|Créer|Ajouter)$/i.test(b.textContent.trim()));if(ok)ok.click()});await pg.waitForTimeout(500);
 const t=pg.locator('#tabs-container .tab .tab-title').first();if(await t.count()){await t.click();await pg.waitForTimeout(40);R.push('changement d\'onglet: '+(await anims()||'—'));}}
console.log(app.padEnd(10),R.join(' | '));await pg.close()}await b.close()})();
