const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/plano.html');await p.waitForTimeout(3500);
await p.evaluate(()=>{['xnw-ov'].forEach(i=>{const x=document.getElementById(i);if(x)x.remove()})});
await p.evaluate(()=>XKMAP.open());await p.waitForTimeout(200);
await p.click('#xkm-l .r:has-text("Mode focus") [data-a=ch]');await p.keyboard.press('g');await p.waitForTimeout(150);
console.log('kbd:',await p.evaluate(()=>document.querySelector('#xkm-l .r:nth-child(11) kbd').textContent));
await p.click('#xkm-l .r:has-text("Annuler") [data-a=ch]');await p.keyboard.press('g');await p.waitForTimeout(100);
console.log('conflit:',await p.evaluate(()=>document.querySelector('#xkm-box .msg').textContent));
await p.click('[data-a=ok]');await p.mouse.click(700,500);
const st=()=>p.evaluate(()=>document.documentElement.className+' '+document.body.className).then(s=>/focus/.test(s));
console.log('avant',await st());await p.keyboard.press('f');await p.waitForTimeout(300);console.log('F (libérée)',await st());
await p.keyboard.press('g');await p.waitForTimeout(300);console.log('G',await st());
await p.goto('http://localhost:8765/conduco.html');await p.waitForTimeout(2000);console.log('autre outil map:',await p.evaluate(()=>JSON.stringify(XKMAP.map())));
console.log('err',er);await b.close()})()
