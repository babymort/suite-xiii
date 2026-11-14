const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/team.html');await pg.waitForTimeout(3000);
console.log('mode outil :',await pg.evaluate(()=>document.documentElement.classList.contains('xmg')));
for(const t of ['mem','sec','link']){await pg.evaluate(t=>{const b=document.querySelector('#nav [data-t='+t+']');b&&b.click()},t);await pg.waitForTimeout(400);}
console.log('rubrique active :',await pg.evaluate(()=>(document.querySelector('#nav .on')||{}).textContent));
await pg.screenshot({path:'/tmp/zz/team.png'});await b.close()})();
