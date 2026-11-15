const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/espace.html');await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>[typeof S, typeof S!=='undefined'&&S.list&&S.list.length, String(window.open).slice(0,60), typeof moveTab, typeof draw]));
console.log(await p.evaluate(()=>[...document.querySelectorAll('[data-id]')].slice(0,4).map(e=>e.outerHTML.slice(0,300)).join('\n')));
await b.close()})()
