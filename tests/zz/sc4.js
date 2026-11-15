const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:950}});
await p.addInitScript(()=>localStorage.setItem('xiii.cadro.scopes',JSON.stringify({on:[],show:false})));
await p.goto('http://localhost:8765/cadro.html?desktop=1#live');await p.waitForTimeout(3000);
await p.evaluate(()=>document.querySelector('#xcl [data-go2]').click());await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const T=XCSCOPES._t,v=document.querySelector('#xcl video'),o={};let t=performance.now();const d=T.sample(v);o.s=performance.now()-t;const c=document.createElement('canvas');c.width=340;c.height=190;
t=performance.now();T.wave(c,d,false);o.w=performance.now()-t;t=performance.now();T.wave(c,d,false);o.w2=performance.now()-t;t=performance.now();T.wave(c,d,true);o.p=performance.now()-t;c.height=300;t=performance.now();T.vec(c,d);o.v=performance.now()-t;c.height=190;t=performance.now();T.hist(c,d);o.h=performance.now()-t;return o}));
await b.close()})()
