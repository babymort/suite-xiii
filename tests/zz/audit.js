const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const app of process.argv.slice(2)){const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message.slice(0,90)));
await pg.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1')}catch(e){}
 window.__ls=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(e.hadRecentInput)return;window.__ls.push([Math.round(e.startTime),e.value,(e.sources||[]).map(s=>{const n=s.node;return n?(n.id?'#'+n.id:(n.className&&n.className.baseVal==null?String(n.className).split(' ')[0]:n.nodeName)):'?'}).join('+')])})).observe({type:'layout-shift',buffered:true})}catch(e){}},app);
try{await pg.goto('http://localhost:8765/'+app+'.html');}catch(e){console.log(app,'échec');continue}
await pg.waitForTimeout(5000);
const idle=await pg.evaluate(()=>new Promise(r=>{const C={};const mo=new MutationObserver(ms=>ms.forEach(m=>{const t=m.target.nodeType===1?m.target:m.target.parentElement;if(!t)return;let k=t.id?'#'+t.id:(t.closest('[id]')?'#'+t.closest('[id]').id+'>'+t.tagName:t.tagName);k+=' '+m.type+(m.attributeName?'@'+m.attributeName:'');C[k]=(C[k]||0)+1}));mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});setTimeout(()=>{mo.disconnect();r(Object.entries(C).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]+'×'+x[1]).join(', '))},3000)}));
const ls=await pg.evaluate(()=>{const L=window.__ls;const tot=L.reduce((a,x)=>a+x[1],0),late=L.filter(x=>x[0]>1500);return {tot:tot.toFixed(3),late:late.reduce((a,x)=>a+x[1],0).toFixed(3),src:late.sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[2]+'@'+x[0]+'ms').join(' ; ')}});
console.log(app.padEnd(12),'sauts total',ls.tot,'tardifs',ls.late,ls.src?'['+ls.src+']':'','| repos 3 s:',idle||'calme',errs.length?'| ERR '+errs.slice(0,2).join(' / '):'');await pg.close()}
await b.close()})();
