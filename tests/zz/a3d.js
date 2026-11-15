const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/conduco.html');await p.waitForTimeout(3000);
await p.evaluate(()=>{localStorage.setItem('xiii.a11y',JSON.stringify({contrast:'max',tgt:2}));XA11Y3.apply();XA11Y3.open()});await p.waitForTimeout(300);
console.log(await p.evaluate(()=>{const s=document.querySelector('#xa3-box .seg');const c=getComputedStyle(s);return [s.offsetHeight,c.display,c.minHeight,c.height,c.flexDirection,c.gridTemplateRows, s.parentElement.offsetHeight, getComputedStyle(s.parentElement).display]}));
console.log(await p.evaluate(()=>{const s=document.querySelector('#xa3-box .seg');const out=[];for(const sh of document.styleSheets){try{for(const r of sh.cssRules){if(r.selectorText&&s.matches(r.selectorText)&&/height|grid|flex/.test(r.style.cssText))out.push(r.selectorText.slice(0,120)+' {'+r.style.cssText.slice(0,120))}}catch(e){}}return out}));
await b.close()})()
