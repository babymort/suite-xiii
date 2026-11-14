const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto('http://localhost:8765/drive.html');await pg.waitForTimeout(3000);
await pg.screenshot({path:'/tmp/zz/drive.png'});console.log(await pg.evaluate(()=>document.documentElement.classList.contains('xmg')+' nav='+document.querySelectorAll('[data-xmg-nav] button').length));console.log(await pg.evaluate(()=>[...document.querySelectorAll('#main > *')].map(e=>(e.id||e.tagName+'.'+e.className)+' «'+(e.querySelector('h2,h3')||e).textContent.trim().slice(0,40)+'»').join('\n')));
await b.close()})();
