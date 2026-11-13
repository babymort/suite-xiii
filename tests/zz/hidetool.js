const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove());document.getElementById('xs-gear').click()});await pg.waitForTimeout(800);
const r=await F.evaluate(()=>{const lab=[...document.querySelectorAll('#xs-panel label, #xs-panel *')].find(e=>!e.children.length&&/^REPERO XIII$/.test(e.textContent.trim()));if(!lab)return 'case REPERO introuvable';const row=lab.closest('label')||lab.parentElement;const i=row.querySelector('input')||row.parentElement.querySelector('input');if(!i)return 'pas d\'interrupteur';i.click();return 'cliqué'});
await pg.waitForTimeout(800);
console.log(r,'→ tuile REPERO :',await F.evaluate(()=>{const c=document.querySelector('a.card[href="repero.html"]');return c?getComputedStyle(c).display:'absente'}));
await b.close()})();
