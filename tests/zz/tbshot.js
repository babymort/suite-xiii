const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.syno.hide','1')});
await pg.goto('http://localhost:8765/syno.html');await pg.waitForTimeout(5000);await pg.screenshot({path:'/tmp/zz/tb_syno.png',clip:{x:700,y:0,width:740,height:50}});await b.close()})();
