const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:950}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('xiii.cadro.scopes',JSON.stringify({show:false}));localStorage.setItem('xiii.cadro.expo',JSON.stringify({zeb:true,zt:70,pk:true,al:true}))});
await p.goto('http://localhost:8765/cadro.html?desktop=1#live');await p.waitForTimeout(3000);
await p.evaluate(()=>document.querySelector('#xcl [data-go2]').click());await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{const v=document.querySelector('#xcl video').getBoundingClientRect();return [v.left,v.top,v.width,v.height]});
await p.mouse.move(r[0]+r[2]*0.07,r[1]+r[3]*0.3);await p.mouse.click(r[0]+r[2]*0.36,r[1]+r[3]*0.3);await p.waitForTimeout(600);
await p.screenshot({path:'/tmp/zz/ex1.png'});
console.log('alertes',await p.evaluate(()=>document.querySelector('.xce-al').textContent),'tip',await p.evaluate(()=>[...document.querySelectorAll('.xce-tip')].map(t=>t.textContent)));
await p.keyboard.press('c');await p.keyboard.press('p');await p.keyboard.press('z');await p.waitForTimeout(800);await p.screenshot({path:'/tmp/zz/ex2.png'});
const t=Date.now();await p.evaluate(()=>1);console.log('réactivité ms',Date.now()-t);
console.log(er);await b.close()})()
