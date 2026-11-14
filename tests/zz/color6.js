const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.plano.hide','1');localStorage.setItem('xiii.ws',JSON.stringify({cur:'w1',list:[{id:'w1',name:'Le Phare',color:'#4db6ac'}]}));localStorage.setItem('xiii.color',JSON.stringify({mode:'projet'}))});
await pg.goto('http://localhost:8765/plano.html');await pg.waitForTimeout(4000);
console.log(await pg.evaluate(()=>localStorage.getItem('xiii.color')+' | '+localStorage.getItem('xiii.ws')+' | '+JSON.stringify(XCOLOR.chosen())));
await b.close()})();
