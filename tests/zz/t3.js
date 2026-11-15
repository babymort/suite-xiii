const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/espace.html');await p.evaluate(()=>{localStorage.setItem('xiii.tools.cfg',JSON.stringify({plano:{i:'🗺️',n:'PLAN SOL',boot:true}}))});await p.reload();await p.waitForTimeout(4500);
console.log(await p.evaluate(()=>[...document.querySelectorAll('#tabs .t img')].map(i=>i.getAttribute('src')+' '+i.style.display+' parent='+i.parentElement.id+'/'+i.parentElement.className).join('\n')+'\nX:'+typeof XTOOLCFG));
await b.close()})()
