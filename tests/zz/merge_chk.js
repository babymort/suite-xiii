const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [drv,app] of [[0,'plano'],[1,'plano'],[0,'cadro'],[1,'deviso']]){const ctx=await b.newContext({viewport:{width:1500,height:900}});await ctx.route('**/*',r=>r.request().url().startsWith('http://localhost')?r.continue():r.abort());
 await ctx.addInitScript(([d,a])=>{localStorage.setItem('xiii.tips.off','true');localStorage.setItem('xiii.tour2.'+a+'.hide','1');if(d)localStorage.setItem('xiii.drive',JSON.stringify({url:'https://script.google.com/macros/s/X/exec',code:'ABC'}));},[drv,app]);
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8765/'+app+'.html?desktop=1');await p.waitForTimeout(3000);
 const vis=id=>p.evaluate(id=>{const e=document.getElementById(id);return !!(e&&e.getClientRects().length)},id);
 const r={drive:drv,app,equipe:await vis('xb-solo'),driveBtn:await vis('xdr-btn'),teamGrp:await vis('xb-team'),versSuite:await vis('xgt-btn'),partager:await vis('xsh-btn')||await vis('xpb-btn')};
 if(await vis('xsh-btn')){await p.evaluate(()=>document.querySelectorAll('#xt-root').forEach(e=>e.remove()));await p.click('#xsh-btn');await p.waitForTimeout(300);r.menuPartager=await p.evaluate(()=>[...document.querySelectorAll('#xb-menu button b')].map(b=>b.textContent.slice(0,22)));const g=await p.$('#xb-menu [data-a=gate]');if(g){await g.click();await p.waitForTimeout(500);r.envoyer=await p.evaluate(()=>!!document.getElementById('xgt-ov')&&document.getElementById('xgt-ov').getClientRects().length>0)}}
 await p.keyboard.press('Escape');
 if(r.equipe){await p.evaluate(()=>document.querySelectorAll('#xt-root,#xgt-ov').forEach(e=>e.remove()));await p.click('#xb-solo');await p.waitForTimeout(300);r.menuEquipe=await p.evaluate(()=>[...document.querySelectorAll('#xb-menu button b')].map(b=>b.textContent.slice(0,26)))}
 r.errs=errs;console.log(JSON.stringify(r));await ctx.close()}
await b.close()})()
