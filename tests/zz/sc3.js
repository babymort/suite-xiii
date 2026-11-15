const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:950}});
await p.addInitScript(()=>localStorage.setItem('xiii.cadro.scopes',JSON.stringify({on:[],show:false})));
await p.goto('http://localhost:8765/cadro.html?desktop=1#live');await p.waitForTimeout(3000);
await p.evaluate(()=>document.querySelector('#xcl [data-go2]').click());await p.waitForTimeout(1500);
const t=Date.now();await p.evaluate(()=>1);console.log('sans scopes',Date.now()-t);
await p.evaluate(()=>{XCSCOPES.toggle()});await p.waitForTimeout(1500);const t2=Date.now();await p.evaluate(()=>1);console.log('volet vide',Date.now()-t2);
await b.close()})()
