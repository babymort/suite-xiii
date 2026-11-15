const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/conduco.html');await p.waitForTimeout(3000);
await p.evaluate(()=>{document.querySelectorAll('#xt-root,#xnw-ov').forEach(x=>x.remove());XA11Y3.open()});await p.waitForTimeout(200);
for(const s of ['[data-k=contrast][data-v=\'"max"\']','[data-k=tgt][data-v="2"]','[data-k=cur][data-v="2"]']) {await p.evaluate(s=>document.querySelector('#xa3-box '+s).click(),s);await p.waitForTimeout(100);}
await p.evaluate(()=>{const c=document.querySelector('[data-c=notr]');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))});
console.log('notr coché',await p.evaluate(()=>document.querySelector('[data-c=notr]').checked));await p.screenshot({path:'/tmp/zz/a3a.png'});
await p.evaluate(()=>XA11Y3.close());await p.waitForTimeout(200);await p.screenshot({path:'/tmp/zz/a3b.png'});
console.log(await p.evaluate(()=>[document.documentElement.className.match(/xa-[a-z0-9]+/g).join(' '),getComputedStyle(document.querySelector('#toolbar button')).minHeight,getComputedStyle(document.body).cursor.slice(0,30)]));
console.log(er);await b.close()})()
