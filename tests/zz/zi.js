const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for (const z of [100,150,90]){const p=await b.newPage({viewport:{width:1440,height:900}});
await p.addInitScript(z=>{localStorage.setItem('xiii.a11y',JSON.stringify({size:z}));localStorage.setItem('xiii.tips.off','true')},z);
await p.goto('http://localhost:8765/plano.html?desktop=1');await p.waitForTimeout(4000);await p.evaluate(()=>document.querySelectorAll('#xt-root,#xnw-ov').forEach(x=>x.remove()));
const btn=await p.evaluate(()=>{const b=document.getElementById('xtop-exp')||document.getElementById('xb-exp');const r=b.getBoundingClientRect();return [r.left,r.bottom]});
// vrai clic souris à l'écran (coordonnées écran = page × zoom)
const k=z/100;await p.mouse.click((btn[0]+5)*k,(btn[1]-5)*k);await p.waitForTimeout(500);
const m=await p.evaluate(()=>{const m=document.querySelector('#xb-menu,#xtop-menu,.xexp-menu,[role=menu]');if(!m)return null;const r=m.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom),innerWidth,innerHeight]});
await p.screenshot({path:'/tmp/zz/zi_'+z+'.png'});
await p.keyboard.press('Escape');
await p.mouse.click(150*k,420*k,{button:'right'});await p.waitForTimeout(400);
const c=await p.evaluate(()=>{const m=[...document.querySelectorAll('body > *')].filter(e=>getComputedStyle(e).position==='fixed'&&/ctx|menu/i.test(e.id+e.className)&&e.offsetWidth);return m.map(e=>{const r=e.getBoundingClientRect();return e.id+':'+Math.round(r.left)+','+Math.round(r.top)})});
console.log(z,'bouton',btn.map(Math.round),'menu',m,'ctx',c);await p.screenshot({path:'/tmp/zz/zc_'+z+'.png'});await p.close();}
await b.close()})()
