const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1600,height:950}});const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='warning'||m.type()==='error')er.push(m.text().slice(0,150))});
await p.addInitScript(()=>{localStorage.setItem('xiii.cadro.scopes',JSON.stringify({on:['vec'],show:true}));localStorage.setItem('xiii.cadro.expo',JSON.stringify({al:false}));localStorage.setItem('xiii.cadro.grade',JSON.stringify({on:true,sat:0.3,gainM:1.2}))});
await p.goto('http://localhost:8765/cadro.html?desktop=1#live');await p.waitForTimeout(3000);
await p.evaluate(()=>document.querySelector('#xcl [data-go2]').click());await p.waitForTimeout(1500);
console.log('gl',await p.evaluate(()=>{const c=document.querySelector('#xcl .xcg-cv');return c?[c.width,c.height,!!c.getContext('webgl2')]:null}));
await p.screenshot({path:'/tmp/zz/gr1.png'});
// LUT
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.evaluate(()=>document.querySelector('#xcl .xcg [data-a=lut]').click())]);await fc.setFiles('/tmp/zz/lut/inv.cube');await p.waitForTimeout(1200);
await p.evaluate(()=>{const s=document.querySelector('#xcl .xcg input[data-k=sat]');s.value=1;s.dispatchEvent(new Event('input'))});await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/zz/gr2.png'});
// pipette balance sur barre grise puis mémoire
const r=await p.evaluate(()=>{const v=document.querySelector('#xcl video').getBoundingClientRect();return [v.left,v.top,v.width,v.height]});
await p.evaluate(()=>document.querySelector('#xcl .xcg [data-a=wb]').click());await p.mouse.click(r[0]+r[2]*.07,r[1]+r[3]*.3);
console.log('wb',await p.evaluate(()=>XCGRADE.cfg().wb));
await p.evaluate(()=>document.querySelector('#xcl .xcg [data-a=mem]').click());await p.waitForTimeout(1500);
console.log('mémoires',await p.evaluate(()=>document.querySelectorAll('#xcl .xcg .mem [data-m]').length));
console.log(er.slice(0,5));await b.close()})()
