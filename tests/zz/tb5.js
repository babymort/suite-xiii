const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.syno.hide','1')});
await pg.goto('http://localhost:8765/syno.html');await pg.waitForTimeout(5000);
for(let k=0;k<2;k++){console.log(await pg.evaluate(()=>{const tb=document.getElementById('top-bar');const L=[...tb.querySelectorAll('button,select,input,.divider,#tabs-container')].filter(e=>e.id==='tabs-container'||!e.closest('#tabs-container'));
 return L.map(e=>{const dv=e.classList.contains('divider');return (dv?'|'+(e.dataset.xtopdv||'?')+(e.dataset.xdvh?'(m)':'')+' w'+e.offsetWidth+' pw'+(e.parentElement.offsetWidth):(e.id||e.tagName).slice(0,8)+' w'+e.offsetWidth)}).filter(x=>!/ w0$/.test(x)||x[0]==='|').join('  ')}));await pg.waitForTimeout(2000);}
await b.close()})();
