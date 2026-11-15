const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(4000);
let f=p.frames().find(f=>/index\.html/.test(f.url()));
await f.evaluate(()=>{localStorage.setItem('xiii.projets',JSON.stringify({list:[{id:'f1',title:'Concert Khaled',production:'Yes We Do'}],active:'f1'}))});
await p.reload();await p.waitForTimeout(5000);f=p.frames().find(f=>/index\.html/.test(f.url()));
await f.evaluate(()=>{document.querySelectorAll('#xt-root,#xnw-ov').forEach(x=>x.remove());XPIDENT.open()});await p.waitForTimeout(800);
await f.evaluate(()=>document.querySelector('#xpj-id [data-more]').click());await p.waitForTimeout(200);
console.log('autre:',await f.evaluate(()=>[!document.querySelector('#xpj-id [data-mp]').hidden,document.querySelectorAll('#xpj-id [data-mp] [data-e]').length,document.querySelectorAll('#xpj-id svg.xgl-ic').length]));
await f.evaluate(()=>document.querySelector('#xpj-id [data-mp] [data-e="🎻"]').click());await p.waitForTimeout(200);
await f.evaluate(()=>{const o=document.getElementById('xpj-ov');if(o)o.remove()});
for(let i=0;i<3;i++){await f.evaluate(()=>{const u=document.getElementById('ui-proj');u.textContent='Concert Khaled'});await p.waitForTimeout(400);}
console.log('nom:',await f.evaluate(()=>document.getElementById('ui-proj').textContent));
await p.screenshot({path:'/tmp/zz/pid6.png',clip:{x:200,y:60,width:1000,height:250}});
console.log(er);await b.close()})()
