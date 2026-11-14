const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/plano.html');await p.waitForTimeout(3500);await p.evaluate(()=>{const x=document.getElementById('xnw-ov');if(x)x.remove()});
await p.mouse.click(700,500);console.log(await p.evaluate(()=>[!!document.getElementById('xfocus-btn'),document.activeElement.tagName]));
await p.keyboard.press('f');await p.waitForTimeout(300);console.log('F natif',await p.evaluate(()=>document.body.classList.contains('xfocus')));
await b.close()})()
