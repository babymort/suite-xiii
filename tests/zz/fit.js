const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for (const [w,z] of [[960,100],[1440,150]]){const p=await b.newPage({viewport:{width:w,height:900}});
await p.addInitScript(z=>localStorage.setItem('xiii.a11y',JSON.stringify({size:z})),z);
await p.goto('http://localhost:8765/'+process.argv[2]+'.html?desktop=1');await p.waitForTimeout(4500);
console.log(w,z,await p.evaluate(()=>{const r=document.getElementById('toolbar');return [r.className, r.scrollWidth, r.clientWidth, [...r.children].map(c=>c.id||c.className.split(' ')[0]).join(','), [...r.querySelectorAll('input,select')].map(i=>Math.round(i.getBoundingClientRect().right)).join(','), innerWidth]}));
await p.screenshot({path:'/tmp/zz/fit_'+w+'.png',clip:{x:0,y:0,width:w,height:260}});await p.close();}
await b.close()})()
