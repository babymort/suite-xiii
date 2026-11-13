const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const pg=await ctx.newPage();
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{window.__e=[];addEventListener('storage',e=>window.__e.push(e.key))});await pg.evaluate(()=>{window.__e=[];addEventListener('storage',e=>window.__e.push(e.key))});
const p2=await ctx.newPage();await p2.goto('http://localhost:8765/404.html');await p2.evaluate(()=>localStorage.setItem('devisoXIII.project','{"real":[]}'));await pg.waitForTimeout(2000);
console.log('iframe accueil :',await F.evaluate(()=>window.__e.join(',')),'| page espace :',await pg.evaluate(()=>window.__e.join(',')));
await b.close()})();
