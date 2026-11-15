const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const z of [100,125,150]){const p=await b.newPage({viewport:{width:1366,height:768}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(z=>{localStorage.setItem('xiii.tips.off','true');localStorage.setItem('xiii.tour2.plano.hide','1');localStorage.setItem('xiii.a11y',JSON.stringify({size:z}))},z);await p.goto('http://localhost:8765/plano.html?desktop=1');await p.waitForTimeout(3000);
const fit=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return sel+' absent';const r=e.getBoundingClientRect();const ok=r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;return sel+(ok?' ✓':' DÉBORDE ')+' bas '+Math.round(r.bottom)+'/'+Math.round(innerHeight)},sel);
const R=[];
await p.evaluate(()=>XPROJET.open());await p.waitForTimeout(700);R.push(await fit('.xpj-box'));await p.evaluate(()=>document.querySelectorAll('#xpj-ov').forEach(e=>e.remove()));
await p.evaluate(()=>document.getElementById('xs-gear').click());await p.waitForTimeout(700);R.push(await fit('#xs-panel'));await p.keyboard.press('Escape');await p.waitForTimeout(200);
await p.evaluate(()=>document.getElementById('xf-btn').click());await p.waitForTimeout(500);R.push(await fit('.xf-box'));await p.keyboard.press('Escape');
await p.evaluate(()=>document.getElementById('xgt-btn').click());await p.waitForTimeout(500);R.push(await fit('#xgt-ov > *'));await p.keyboard.press('Escape');
await p.evaluate(()=>{ if(window.XKMAP&&XKMAP.open)XKMAP.open(); else if(window.XTOOLCFG)XTOOLCFG.open(); });await p.waitForTimeout(500);
console.log(z+'%',R.join(' · '),errs.length?'ERR '+errs[0]:'');if(z===150)await p.screenshot({path:'zfit150.png'});await p.close()}await b.close()})()
