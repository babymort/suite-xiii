const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:800}});
await p.setContent('<div id=a style="position:fixed;left:100px;top:100px;width:200px;height:50px;background:red"></div><div id=c style="width:100%;height:20px"></div>');
console.log(b.version());
console.log(await p.evaluate(()=>{document.documentElement.style.zoom=1.5;const a=document.getElementById('a'),r=a.getBoundingClientRect();return {gx:r.left,gw:r.width,ow:a.offsetWidth,ol:a.offsetLeft,iw:innerWidth,cw:document.documentElement.clientWidth,c:document.getElementById('c').getBoundingClientRect().width,cow:document.getElementById('c').offsetWidth}}));
await p.mouse.move(200,150);console.log(await p.evaluate(()=>new Promise(r=>{addEventListener('mousemove',e=>r([e.clientX,e.clientY,document.elementFromPoint(e.clientX,e.clientY).id]),{once:true})})).catch(e=>e.message));
await b.close()})()
