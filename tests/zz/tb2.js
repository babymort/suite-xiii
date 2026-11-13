const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.syno.hide','1')});
await pg.goto('http://localhost:8765/syno.html');await pg.waitForTimeout(5000);
console.log(await pg.evaluate(()=>new Promise(r=>{const L=[];const tb=document.getElementById('top-bar');const mo=new MutationObserver(ms=>ms.forEach(m=>{if(m.attributeName==='class'&&m.target===tb)L.push('CLASSE '+m.oldValue+' → '+tb.className);else if(m.target.classList&&m.target.classList.contains('divider'))L.push('TRAIT '+m.attributeName+' '+(m.target.previousElementSibling||{}).id+' / '+(m.target.nextElementSibling||{}).id+' parent '+m.target.parentElement.id)}));mo.observe(tb,{attributes:true,subtree:true,attributeOldValue:true,attributeFilter:['class','style']});
 const cl=tb.classList,S=new Set();['add','remove','toggle'].forEach(f=>{const o=cl[f].bind(cl);cl[f]=(...a)=>{S.add(f+'('+a.join(',')+') @ '+new Error().stack.split('\n')[2].trim().slice(0,100));return o(...a)}});
 setTimeout(()=>{mo.disconnect();r([...new Set(L)].slice(0,8).join('\n')+'\n--\n'+[...S].slice(0,5).join('\n'))},4500)})));
await b.close()})();
