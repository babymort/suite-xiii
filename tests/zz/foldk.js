const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
console.log(await F.evaluate(()=>{const a=document.documentElement.classList.contains('xnf');let seen='';addEventListener('keydown',e=>{seen='window vu, defaultPrevented='+e.defaultPrevented},false);const ev=new KeyboardEvent('keydown',{key:'[',bubbles:true,cancelable:true});document.body.dispatchEvent(ev);return 'avant '+a+' après '+document.documentElement.classList.contains('xnf')+' | '+seen}));
await b.close()})();
