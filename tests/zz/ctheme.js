const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.deviso.hide','1')});
await pg.goto('http://localhost:8765/deviso.html');await pg.waitForTimeout(4500);
await pg.evaluate(()=>{const m=document.getElementById('modal');if(m&&/Guide/.test(m.textContent))m.style.display='none'});
await pg.evaluate(()=>XCTHEME.open());await pg.waitForTimeout(400);
for(const i of [0,4]){await pg.evaluate(i=>document.querySelector('#xct [data-s="'+i+'"]').click(),i);await pg.waitForTimeout(500);await pg.screenshot({path:'/tmp/zz/ct_'+i+'.png'});
 console.log('départ',i,await pg.evaluate(()=>{const cs=getComputedStyle(document.body);return cs.getPropertyValue('--bg-main')+' '+cs.getPropertyValue('--text-main')+' fond='+cs.backgroundColor}));}
await pg.evaluate(()=>{document.querySelector('#xct [data-s="3"]').click()});await pg.waitForTimeout(200);await pg.evaluate(()=>document.querySelector('#xct [data-ok]').click());await pg.waitForTimeout(300);
await pg.goto('http://localhost:8765/conduco.html');await pg.waitForTimeout(4000);
console.log('autre outil :',await pg.evaluate(()=>document.documentElement.classList.contains('xct')+' '+getComputedStyle(document.body).getPropertyValue('--bg-main')+' accent '+localStorage.getItem('xiii.color')));
await pg.screenshot({path:'/tmp/zz/ct_conduco.png'});
await b.close()})();
