const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1400,height:900}});const p=await c.newPage();
await p.goto('http://localhost:8765/plano.html?desktop=1');await p.waitForTimeout(2500);
await p.evaluate(()=>localStorage.setItem('xiii.drive',JSON.stringify({url:'https://script.google.com/macros/s/TEST/exec',code:'ABC',me:{name:'Matthieu'}})));
console.log('main',await p.evaluate(()=>[XWS.id,localStorage.getItem('xiii.drive')&&'oui']));
// nouveau projet par l'espace
const e=await c.newPage();await e.goto('http://localhost:8765/espace.html');await e.waitForTimeout(3000);
console.log(await e.evaluate(()=>typeof newProject));
await e.evaluate(()=>{window.prompt=()=>'Projet B';try{newProject()}catch(x){console.log(x)}});await e.waitForTimeout(3000);
const raw=await e.evaluate(()=>Object.keys(localStorage).filter(k=>/drive/.test(k)).map(k=>k+'='+localStorage.getItem(k).slice(0,60)));console.log(raw);
const f=e.frames().filter(x=>/\.html/.test(x.url())).map(x=>x.url());console.log(f);
for(const fr of e.frames()){try{console.log(fr.url().split('/').pop(),await fr.evaluate(()=>[window.XWS&&XWS.id,localStorage.getItem('xiii.drive')?'drive OUI':'drive non']))}catch(x){}}
await b.close()})()
