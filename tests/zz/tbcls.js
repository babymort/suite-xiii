const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.conduco.hide','1');
 const d=Object.getOwnPropertyDescriptor(Element.prototype,'className');const tl=DOMTokenList.prototype;['add','remove','toggle'].forEach(f=>{const o=tl[f];tl[f]=function(...a){if(window.__w&&this.__owner){}return o.apply(this,a)}});
 const ot=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(c,f){try{if(window.__w){const el=this.__el;}}catch(e){}return ot.apply(this,arguments)};});
await pg.goto('http://localhost:8765/conduco.html');await pg.waitForTimeout(5000);
console.log(await pg.evaluate(()=>new Promise(r=>{const tb=document.getElementById('top-bar');const L=[];
 const mo=new MutationObserver(ms=>ms.forEach(m=>L.push(m.oldValue+' → '+m.target.className)));mo.observe(tb,{attributes:true,attributeFilter:['class'],attributeOldValue:true});
 // pile d'appel : on intercepte classList du top-bar
 const cl=tb.classList,S=new Set();['add','remove','toggle'].forEach(f=>{const o=cl[f].bind(cl);cl[f]=(...a)=>{S.add(f+'('+a.join(',')+') @ '+new Error().stack.split('\n')[2].trim().slice(0,110));return o(...a)}});
 setTimeout(()=>{mo.disconnect();r(L.slice(0,4).join('\n')+'\n--\n'+[...S].slice(0,6).join('\n'))},2000)})));
await b.close()})();
