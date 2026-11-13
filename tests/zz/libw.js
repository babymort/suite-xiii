const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const app of ['conduco','plano','syno','ludo','deviso']){const pg=await b.newPage({viewport:{width:1280,height:800}});await pg.addInitScript(a=>{localStorage.setItem('xiii.tour2.'+a+'.hide','1')},app);
await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(4000);
const r=await pg.evaluate(()=>{const p=document.getElementById('library-panel');if(!p)return 'pas de volet';const cs=getComputedStyle(p);return 'transition='+cs.transitionProperty+' '+cs.transitionDuration+' | caché='+document.body.classList.contains('lib-hidden')+' w='+p.offsetWidth+' overflow='+cs.overflow});
const open=await pg.evaluate(()=>{const p=document.getElementById('library-panel');if(!p)return'';if(document.body.classList.contains('lib-hidden'))document.getElementById('xlib-tab').click();return new Promise(r=>setTimeout(()=>r(' ouvert w='+p.offsetWidth+' enfants='+[...p.children].map(c=>c.id||c.className.split(' ')[0]).join(',')),700))});
console.log(app.padEnd(8),r,open);await pg.close()}await b.close()})();
