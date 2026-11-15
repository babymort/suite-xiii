const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:950}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('xiii.cadro.scopes',JSON.stringify({show:false}));localStorage.setItem('xiii.cadro.expo',JSON.stringify({al:false}));localStorage.setItem('xiii.cadro.view',JSON.stringify({grid:'thirdsc',title:true,action:true,ratio:'2.39',mask:60}))});
await p.goto('http://localhost:8765/cadro.html?desktop=1#live');await p.waitForTimeout(3000);
await p.evaluate(()=>document.querySelector('#xcl [data-go2]').click());await p.waitForTimeout(1500);
await p.keyboard.press('m');await p.waitForTimeout(1200);
await p.screenshot({path:'/tmp/zz/vw1.png'});
await p.keyboard.press('g');await p.waitForTimeout(300);const f1=await p.evaluate(()=>document.querySelector('#xcl video').paused);
await p.keyboard.press('1');await p.waitForTimeout(400);
const z=await p.evaluate(()=>{const v=document.querySelector('#xcl video');return [v.style.transform,v.videoWidth,v.offsetWidth,devicePixelRatio,document.querySelector('.xcv-badges').textContent]});
await p.screenshot({path:'/tmp/zz/vw2.png'});
console.log('gel',f1,'zoom',z);console.log(er);await b.close()})()
