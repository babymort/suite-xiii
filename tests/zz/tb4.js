const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.syno.hide','1');const rp=CSSStyleDeclaration.prototype.removeProperty,sp=CSSStyleDeclaration.prototype.setProperty;
 CSSStyleDeclaration.prototype.removeProperty=function(p){if(window.__c&&this===window.__c.style)window.__L.push('remove '+p+' @ '+new Error().stack.split('\n').slice(2,4).map(s=>s.trim().slice(0,90)).join(' < '));return rp.apply(this,arguments)};
 CSSStyleDeclaration.prototype.setProperty=function(p,v){if(window.__c&&this===window.__c.style)window.__L.push('set '+p+'='+v+' @ '+new Error().stack.split('\n').slice(2,4).map(s=>s.trim().slice(0,90)).join(' < '));return sp.apply(this,arguments)};});
await pg.goto('http://localhost:8765/syno.html');await pg.waitForTimeout(5000);
console.log(await pg.evaluate(()=>new Promise(r=>{window.__L=[];window.__c=document.querySelector('[data-xtopdv="c"]');const mo=new MutationObserver(()=>window.__L.push('mutation style='+window.__c.getAttribute('style')));mo.observe(window.__c,{attributes:true});setTimeout(()=>r(window.__L.slice(0,8).join('\n')),4500)})));
await b.close()})();
