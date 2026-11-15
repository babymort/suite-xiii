const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(4500);await p.keyboard.press('Escape');await p.waitForTimeout(500);
const f=p.frames().find(x=>/index\.html/.test(x.url())&&x!==p.mainFrame());try{await f.evaluate(()=>document.querySelectorAll('[role=dialog],.modal,#xnews-ov,.xnw-ov').forEach(x=>x.remove()))}catch(e){}
await p.screenshot({path:'/tmp/zz/emo_home.png'});
await p.goto('http://localhost:8765/callsheeto.html?desktop=1');await p.waitForTimeout(3500);await p.screenshot({path:'/tmp/zz/emo_cs.png'});await b.close()})()
