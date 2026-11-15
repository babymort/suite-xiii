const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);
for(const f of p.frames()){const r=await f.evaluate(()=>{const tb=document.getElementById('top-bar');if(!tb)return null;return tb.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g,'<svg/>').slice(0,6000)}).catch(()=>null);if(r)console.log(r)}
await b.close()})()
