const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});const er=[];p.on('pageerror',e=>er.push(e.message));p.on('dialog',d=>d.accept('Prod XIII'));
await p.goto('http://localhost:8765/plano.html');await p.waitForTimeout(3000);
await p.evaluate(()=>{document.querySelectorAll('#xt-root,#xnw-ov').forEach(x=>x.remove());XPROJET.open('c')});await p.waitForTimeout(800);
await p.evaluate(()=>document.querySelector('[data-modsave]').click());await p.waitForTimeout(400);
console.log(await p.evaluate(()=>[localStorage.getItem('xiii.charte.models')?Object.keys(JSON.parse(localStorage.getItem('xiii.charte.models'))):null,[...document.querySelectorAll('[data-mod]')].map(b=>b.textContent)]));
await p.evaluate(()=>document.getElementById('xpj-c').scrollIntoView());await p.waitForTimeout(300);await p.screenshot({path:'/tmp/zz/mod.png'});
console.log(er);await b.close()})()
