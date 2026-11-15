const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1400,height:900}});const p=await c.newPage();
await p.goto('http://localhost:8765/plano.html?desktop=1');await p.waitForTimeout(2500);
await p.evaluate(()=>{localStorage.setItem('xiii.drive',JSON.stringify({url:'https://script.google.com/macros/s/TEST/exec',code:'ABC'}));localStorage.setItem('xiii.projets',JSON.stringify({list:[{id:'f1',title:'Concert Khaled'}],active:'f1'}))});
await Promise.all([p.waitForNavigation({timeout:8000}).catch(()=>{}),p.evaluate(()=>XGUIDE.start())]);await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>[XWS.id,XWS.list().length,!!localStorage.getItem('xiii.drive'),!!document.getElementById('xg-ov')]));
await b.close()})()
