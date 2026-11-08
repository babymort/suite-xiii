const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.goto('http://localhost:8765/'+(process.argv[2]||'index')+'.html');await pg.waitForTimeout(4000);
await pg.evaluate(()=>{const g=document.getElementById('xs-gear');g&&g.click()});await pg.waitForTimeout(800);
console.log(await pg.evaluate(()=>{const e=document.querySelector('[data-xred]');if(!e)return 'none';let r=e;while(r.parentElement&&r.parentElement.children.length<3)r=r.parentElement;return r.outerHTML.slice(0,900)}));await b.close()})();
