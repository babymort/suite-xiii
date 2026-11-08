const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900}});
const apps=(process.argv[2]||'scripto,plano').split(',');
for(const a of apps){const p=await c.newPage();await p.addInitScript(a=>{localStorage.setItem('xiii.tour2.'+a+'.hide','1');localStorage.setItem('xiii.tips.off','1')},a);const E=[];p.on('pageerror',e=>E.push(e.message));await p.goto('http://localhost:8765/'+a+'.html');await p.waitForTimeout(5500);
await p.keyboard.press('Escape');await p.evaluate(()=>{try{closeModal()}catch(e){};document.querySelectorAll('.modal-overlay').forEach(e=>e.remove());const x=document.getElementById('xoff');if(x)x.remove()});
const menu=async(sel,shot)=>{const el=await p.$(sel);if(!el)return sel+': absent';const bb=await el.boundingBox();if(!bb)return sel+': invisible';await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2,{button:'right'});await p.waitForTimeout(300);const t=await p.evaluate(()=>{const m=document.getElementById('xb-menu');return m?[...m.querySelectorAll('button b')].map(x=>x.textContent).join(' | '):'pas de menu'});if(shot)await p.screenshot({path:shot});await p.evaluate(()=>{const m=document.getElementById('xb-menu');if(m)m.remove()});return sel+' → '+t};
console.log('== '+a);for(const s of ['#xtop-exp','#xgt-btn','#xtop-new','#xb-home','#xfocus-btn'])console.log(' ',await menu(s,s==='#xgt-btn'&&a==='plano'?'/tmp/zz/ctx_gate.png':s==='#xtop-exp'&&a==='plano'?'/tmp/zz/ctx_exp.png':null));
// 💾
const sv=await p.evaluate(()=>{const f=document.getElementById('xb-file');const b=f&&[...f.querySelectorAll('button')].find(x=>/💾/.test(x.textContent)&&x.offsetWidth);if(b)b.id=b.id||'xt-save';return b?'#'+b.id:null});if(sv)console.log(' ',await menu(sv));
// bouton d'outil : masquer puis réafficher
const tb=await p.evaluate(()=>{const b=[...document.querySelectorAll('#toolbar .xsec[data-sec=aff] button')].find(x=>x.offsetWidth&&x.id!=='xfocus-btn');if(b){b.dataset.t=1;return (b.title||b.textContent).slice(0,40)}});
if(tb){const el=await p.$('#toolbar button[data-t]');const bb=await el.boundingBox();await p.mouse.click(bb.x+5,bb.y+5,{button:'right'});await p.waitForTimeout(250);await p.evaluate(()=>[...document.querySelectorAll('#xb-menu [data-i]')].find(x=>/Masquer/.test(x.textContent)).click());await p.waitForTimeout(500);
const hid=await p.evaluate(()=>document.querySelector('#toolbar button[data-t]').offsetWidth===0);
// zone vide de la barre d'outils
const r=await p.evaluate(()=>{const t=document.getElementById('toolbar').getBoundingClientRect();return {x:t.right-6,y:t.top+t.height/2}});await p.mouse.click(r.x,r.y,{button:'right'});await p.waitForTimeout(250);const bar=await p.evaluate(()=>{const m=document.getElementById('xb-menu');return m?[...m.querySelectorAll('button b')].map(x=>x.textContent).join(' | '):'pas de menu'});
await p.evaluate(()=>[...document.querySelectorAll('#xb-menu [data-i]')].find(x=>/Réafficher/.test(x.textContent)).click());await p.waitForTimeout(500);const back=await p.evaluate(()=>document.querySelector('#toolbar button[data-t]').offsetWidth>0);
console.log('  masquer « '+tb+' » :',hid,'| barre →',bar,'| réaffiché :',back);}
console.log('  erreurs :',E.slice(0,2));await p.close()}await b.close()})();
