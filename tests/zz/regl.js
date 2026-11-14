const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/index.html#reglages');await p.waitForTimeout(3500);
const r=await p.evaluate(()=>{const o=document.getElementById('xrg-ov');return o?{nav:[...o.querySelectorAll('nav button')].map(b=>b.textContent),rows:o.querySelectorAll('.xrg-r').length,btn:!!document.querySelector('#xh-set .xrg-open')}:null});console.log(JSON.stringify(r));
await p.evaluate(()=>{const x=document.getElementById('xnw-ov');if(x)x.remove()});await p.screenshot({path:'/tmp/zz/regl.png'});
await p.waitForTimeout(1500);await p.evaluate(()=>{const x=document.getElementById('xnw-ov');if(x)x.remove()});await p.click('#xrg-ov nav button:nth-child(3)');await p.waitForTimeout(800);console.log('on:',await p.evaluate(()=>document.querySelector('#xrg-ov nav .on').textContent));
await p.click('#xrg-ov .xrg-r:has-text("Charte") button');await p.waitForTimeout(800);
console.log('top:',await p.evaluate(()=>{const e=document.elementFromPoint(700,425);return e&&!e.closest('#xrg-ov')?'panneau au-dessus':'page au-dessus'}));
await p.screenshot({path:'/tmp/zz/regl2.png'});
await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.waitForTimeout(300);
await p.goto('http://localhost:8765/team.html');await p.waitForTimeout(1500);console.log('team sw:',await p.evaluate(()=>[...document.querySelectorAll('.xmg-sw a')].map(a=>a.textContent).join(',')));
console.log('err',er);await b.close()})()
