const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{try{localStorage.setItem('xiii.tour2.syno.hide','1')}catch(e){}
 const ss=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(p,v,pr){if(window.__w&&/color/.test(p)){const st=new Error().stack.split('\n').slice(2,5).map(s=>s.trim()).join(' <- ');window.__w.push(p+'='+v+' @ '+st.slice(0,300))}return ss.apply(this,arguments)};
 const d=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,'cssText');});
await pg.goto('http://localhost:8765/syno.html');await pg.waitForTimeout(3500);
const out=await pg.evaluate(async()=>{const el=document.querySelector('#tabs-container .tab.active .tab-title');const L=[];const mo=new MutationObserver(ms=>ms.forEach(m=>L.push((m.target===el?'title':m.target.className||m.target.tagName)+' '+m.type+' '+(m.attributeName||'')+' old='+String(m.oldValue).slice(0,80)+' now='+(m.target.getAttribute?String(m.target.getAttribute(m.attributeName||'class')).slice(0,80):''))));mo.observe(el.closest('.tab'),{attributes:true,attributeOldValue:true,subtree:true,childList:true});window.__w=[];await new Promise(r=>setTimeout(r,2000));mo.disconnect();return L.slice(0,10).join('\n')+'\n--- setProperty:\n'+window.__w.slice(0,6).join('\n')});
console.log(out);
console.log(await pg.evaluate(()=>{const el=document.querySelector('#tabs-container .tab.active .tab-title');return [el.className, el.closest('.tab').className, document.documentElement.className].join(' || ')}));
await b.close()})();
