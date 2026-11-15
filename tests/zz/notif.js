const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1400,height:850}});await c.grantPermissions(['notifications'],{origin:'http://localhost:8765'});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/plano.html');await p.waitForTimeout(3000);
console.log(await p.evaluate(()=>{const n=new Notification('ENCODO — conversion terminée',{body:'2 fichiers'});return [typeof n.close, n instanceof Notification, XNOTIF.ok('tache','ban'), XNOTIF.cat('Paul : @Marc tu es dispo ?')]}));
await p.evaluate(()=>{document.querySelectorAll('#xt-root,#xnw-ov').forEach(x=>x.remove());XNOTIF.open()});await p.waitForTimeout(300);
await p.evaluate(()=>{const d=new Date(),f=x=>String(x).padStart(2,'0');const a=new Date(d-3600e3),z=new Date(+d+3600e3);const s=(el,v)=>{el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}))};s(document.querySelector('[data-q=from]'),f(a.getHours())+':00');s(document.querySelector('[data-q=to]'),f(z.getHours())+':00');const q=document.querySelector('[data-q=on]');q.checked=true;q.dispatchEvent(new Event('change',{bubbles:true}))});
console.log('calme',await p.evaluate(()=>[XNOTIF.quiet(),XNOTIF.ok('chat','ban'),XNOTIF.ok('chat','badge'),XNOTIF.ok('alerte','snd',true)]));
console.log('supprimée',await p.evaluate(()=>{const n=new Notification('Paul : @Marc');return !(n instanceof Notification)}));
console.log('sw prefs',await p.evaluate(async()=>{const r=await (await caches.open('xnotifs')).match('prefs');return r?(await r.json()).quiet.on:null}));
await p.evaluate(()=>XNOTIF.open());await p.waitForTimeout(200);await p.screenshot({path:'/tmp/zz/notif.png'});
console.log(er);await b.close()})()
