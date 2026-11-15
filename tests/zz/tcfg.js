const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1400,height:850}});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);
const f=p.frames().find(f=>/index\.html/.test(f.url()));
console.log('def:',await f.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('xiii.tools.def')||'{}')).length));
await f.evaluate(()=>{const x=document.getElementById('xnw-ov');if(x)x.remove();XTOOLCFG.open()});await p.waitForTimeout(300);
const r=f.locator('#xtc-l .r[data-k=plano]');await r.locator('[data-f=n]').fill('PLAN SOL');await r.locator('[data-f=i]').fill('🗺️');await r.locator('[data-f=boot]').check();
await f.locator('#xtc-l .r[data-k=conduco] [data-f=c]').evaluate(e=>{e.value='#ff0000';e.dispatchEvent(new Event('input',{bubbles:true}))});
await f.click('[data-ok]');await p.waitForTimeout(400);
console.log('tuile:',await f.evaluate(()=>{const a=document.querySelector('a.card[href="plano.html"]');return a.querySelector('.card-name').textContent+' '+a.querySelector('.card-icon').textContent+' / conduco '+document.querySelector('a.card[href="conduco.html"]').style.getPropertyValue('--dc')}));
await p.screenshot({path:'/tmp/zz/tcfg.png'});
const p2=await c.newPage();await p2.goto('http://localhost:8765/espace.html');await p2.waitForTimeout(4500);
console.log('onglets:',await p2.evaluate(()=>[...document.querySelectorAll('#tabs .t')].map(t=>t.textContent.trim().slice(0,20)).join(' | ')));
await p2.screenshot({path:'/tmp/zz/tcfg2.png',clip:{x:0,y:0,width:1400,height:60}});
const p3=await c.newPage();await p3.goto('http://localhost:8765/plano.html');await p3.waitForTimeout(2500);console.log('titre:',await p3.title());
console.log(er);await b.close()})()
