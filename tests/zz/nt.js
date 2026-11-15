const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/notes.html');await p.waitForTimeout(1500);await p.screenshot({path:'/tmp/zz/nt.png'});
const q=await b.newPage();await q.goto('http://localhost:8765/plano.html?desktop=1');await q.waitForTimeout(2500);console.log(await q.evaluate(()=>document.title+' '+(document.body.innerText.match(/v73|v80/)||[''])[0]));
console.log(er);await b.close()})()
