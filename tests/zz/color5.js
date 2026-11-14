const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const app of ['index','plano','deviso','ludo']){const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message.slice(0,80)));
await pg.addInitScript(a=>{localStorage.setItem('xiii.tour2.'+a+'.hide','1');localStorage.setItem('xiii.ws',JSON.stringify({cur:'w1',list:[{id:'w1',name:'Le Phare',color:'#4db6ac'}]}));localStorage.setItem('xiii.color',JSON.stringify({mode:'projet'}))},app);
await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(5000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
const r=await F.evaluate(()=>new Promise(res=>{let n=0;const mo=new MutationObserver(ms=>n+=ms.length);mo.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['style'],characterData:true});setTimeout(()=>{mo.disconnect();res('mode='+document.documentElement.dataset.xcolor+' · couleur '+getComputedStyle(document.documentElement).getPropertyValue('--xiii-c')+' · réécritures au repos (3 s) '+n)},3000)}));
console.log(app.padEnd(7),r,errs.length?'ERR '+errs[0]:'');if(app==='index'){await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove())});await pg.screenshot({path:'/tmp/zz/col_index.png'});}await pg.close()}
await b.close()})();
