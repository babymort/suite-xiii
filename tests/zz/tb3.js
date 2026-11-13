const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.syno.hide','1')});
await pg.goto('http://localhost:8765/syno.html');await pg.waitForTimeout(5000);
console.log(await pg.evaluate(()=>new Promise(r=>{const L=[];const tb=document.getElementById('top-bar');const mo=new MutationObserver(ms=>ms.forEach(m=>{const t=m.target.nodeType===1?m.target:m.target.parentElement;if(t.tagName==='I'||t.closest('i')){const i=t.closest('i')||t;L.push(m.type+' dans <i> de '+(i.closest('[id]')||{}).id+' : '+(i.textContent||'').slice(0,20)+' | '+i.innerHTML.slice(0,60))}}));mo.observe(tb,{subtree:true,childList:true,characterData:true});
 const d=[...tb.querySelectorAll('.divider')].map(x=>(x.dataset.xtopdv||'?')+':'+(x.dataset.xdvh?'masqué':'visible')+' prev='+((x.previousElementSibling||{}).id||(x.previousElementSibling||{}).tagName)+' next='+((x.nextElementSibling||{}).id||(x.nextElementSibling||{}).tagName));
 setTimeout(()=>{mo.disconnect();const d2=[...tb.querySelectorAll('.divider')].map(x=>(x.dataset.xtopdv||'?')+':'+(x.dataset.xdvh?'masqué':'visible'));r([...new Set(L)].slice(0,6).join('\n')+'\n-- traits avant: '+d.join(' ; ')+'\n-- après 2,5 s: '+d2.join(' ; '))},2500)})));
await b.close()})();
