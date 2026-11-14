const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.syno.hide','1')});
await pg.goto('http://localhost:8765/syno.html');await pg.waitForTimeout(4500);await pg.click('#xs-gear');await pg.waitForTimeout(500);
console.log(await pg.evaluate(()=>{const x=document.getElementById('xcolor-sw');let p=x,c=[];while(p&&p.id!=='xs-panel'&&c.length<6){c.push((p.id||p.tagName+'.'+p.className)+(getComputedStyle(p).display==='none'?' [caché]':''));p=p.parentElement}return c.join(' < ')+' | dense visible='+!!(document.getElementById('xdense-sw')||{}).offsetWidth}));
await b.close()})();
