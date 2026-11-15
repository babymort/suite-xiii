const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1400,height:850}});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(5000);
const f=p.frames().find(f=>/index\.html/.test(f.url()));
await f.evaluate(()=>{const s={list:[{id:'f1',title:'Concert Khaled',production:'Yes We Do'}],active:'f1'};localStorage.setItem('xiii.projets',JSON.stringify(s))});
await p.reload();await p.waitForTimeout(5000);const g=p.frames().find(f=>/index\.html/.test(f.url()));
await g.evaluate(()=>{document.querySelectorAll('#xt-root,#xnw-ov,[class*=tuto],[id*=tuto],[id^=xg-]').forEach(x=>x.remove());XPIDENT.open()});await p.waitForTimeout(800);
console.log('section:',await g.evaluate(()=>!!document.getElementById('xpj-id')&&!!document.querySelector('.xpj-nav a[href="#xpj-id"]')));
await g.evaluate(()=>document.querySelector('#xpj-id [data-e="🎸"]').click());await p.waitForTimeout(300);
const [ch]=await Promise.all([p.waitForEvent('filechooser'),g.evaluate(()=>document.querySelector('#xpj-id [data-bn]').click())]);await ch.setFiles('/tmp/zz/regl.png');await p.waitForTimeout(800);
await p.screenshot({path:'/tmp/zz/pid3.png'});
await g.evaluate(()=>XPROJET.close&&XPROJET.close());await g.evaluate(()=>{const o=document.getElementById('xpj-ov');if(o)o.remove()});await p.waitForTimeout(500);
const pos=[];for(let i=0;i<10;i++){pos.push(await g.evaluate(()=>{const t=document.querySelector('main>.title-row');return t.classList.contains('xpid-hero')+':'+[...document.querySelector('main').children].indexOf(t)+':'+!!document.getElementById('xpid-ban')}));await p.waitForTimeout(150)}console.log(pos.join(' '));
await p.screenshot({path:'/tmp/zz/pid4.png',clip:{x:0,y:60,width:1400,height:330}});
await g.evaluate(()=>{XPIDENT.open()});await p.waitForTimeout(800);await g.evaluate(()=>{const c=document.querySelector('#xpj-id [data-boff]');c.checked=false;c.dispatchEvent(new Event('change'))});await g.evaluate(()=>{const o=document.getElementById('xpj-ov');if(o)o.remove()});await p.waitForTimeout(300);
console.log('off:',await g.evaluate(()=>document.querySelector('main>.title-row').classList.contains('xpid-hero')));
console.log(er);await b.close()})()
