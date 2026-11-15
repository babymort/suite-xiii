const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/plano.html');await p.waitForTimeout(3000);
await p.evaluate(()=>{const x=document.getElementById('xnw-ov');if(x)x.remove();XANIM.open()});await p.waitForTimeout(200);
await p.click('#xan-box button:has-text("Rapide")');await p.click('#xan-box button:has-text("Zoom")');await p.click('#xan-box [data-k=snd][data-v=true]');
console.log(await p.evaluate(()=>{const a=document.body.animate([{opacity:0},{opacity:1}],300);return [JSON.stringify(XANIM.cfg()),a.playbackRate,!!document.getElementById('xan-row')]}));
await p.screenshot({path:'/tmp/zz/anim.png'});
await p.click('#xan-box button:has-text("Aucune animation")');console.log('off:',await p.evaluate(()=>document.documentElement.classList.contains('xanim-off')));
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);
console.log(er);await b.close()})()
