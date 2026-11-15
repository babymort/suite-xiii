const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1400,height:850}});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);
const f=p.frames().find(f=>/index\.html/.test(f.url()));
await f.evaluate(()=>{['xnw-ov'].forEach(i=>{const x=document.getElementById(i);if(x)x.remove()});document.querySelectorAll('[class*=tuto],[id*=tuto]').forEach(x=>x.remove());XPIDENT.open()});await p.waitForTimeout(200);
await f.click('#xpid-box [data-e="🎸"]');await f.click('#xpid-box [data-c="#e57373"]');
const fc=f.locator('#xpid-box [data-bn]');const [ch]=await Promise.all([p.waitForEvent('filechooser'),fc.click()]);await ch.setFiles('/tmp/zz/tcfg.png');await p.waitForTimeout(800);
await f.click('#xpid-box [data-ch]');await p.waitForTimeout(300);console.log('charte:',await f.evaluate(()=>XCHARTE.raw().color));
await f.click('#xpid-box [data-ok]');await p.waitForTimeout(600);
console.log('ban:',await f.evaluate(()=>{const b=document.getElementById('xpid-ban');return b?b.textContent.slice(0,40)+' next='+(b.nextElementSibling&&b.nextElementSibling.id)+' bg='+!!b.style.backgroundImage:'none'}));
console.log('pill:',await p.evaluate(()=>document.getElementById('proj').textContent));
await p.screenshot({path:'/tmp/zz/pid.png'});
const p3=await c.newPage();await p3.goto('http://localhost:8765/plano.html');await p3.waitForTimeout(3000);console.log('outil:',await p3.evaluate(()=>{const n=document.getElementById('xpj-name');return n?n.style.display+'|'+n.textContent:'-'}));
console.log(er);await b.close()})()
