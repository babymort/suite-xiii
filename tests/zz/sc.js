const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:950}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.addInitScript(()=>localStorage.setItem('xiii.cadro.scopes',JSON.stringify({on:['wave','parade','vec','hist']})));
await p.goto('http://localhost:8765/cadro.html?desktop=1#live');await p.waitForTimeout(3000);
await p.evaluate(()=>document.querySelector('#xcl [data-go2]').click());await p.waitForTimeout(2500);
await p.screenshot({path:'/tmp/zz/sc1.png'});
// mesure : barres 75 % ; vérif que les points tombent dans les cibles
console.log(await p.evaluate(()=>{const m=XCSCOPES.measure;return [m.cbcr(192,0,0).map(v=>v.toFixed(3)), m.lv(16), m.lv(235)]}));
console.log(er);await b.close()})()
