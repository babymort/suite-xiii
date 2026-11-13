const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{try{localStorage.setItem('xiii.tour2.ludo.hide','1')}catch(e){}});
await pg.goto('http://localhost:8765/ludo.html');await pg.waitForTimeout(5000);
await pg.screenshot({path:'/tmp/zz/ludo0.png'});
console.log(await pg.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>!x.children.length&&/Salle de pause/.test(x.textContent));let p=e,c=[];while(p&&c.length<5){c.push((p.id?'#'+p.id:p.tagName+'.'+String(p.className).slice(0,30))+' '+Math.round(p.getBoundingClientRect().width)+'px');p=p.parentElement}return c.join(' < ')}));
await b.close()})();
