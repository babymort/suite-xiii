const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.syno.hide','1')});
await pg.goto('http://localhost:8765/syno.html');await pg.waitForTimeout(4500);await pg.click('#xs-gear');await pg.waitForTimeout(600);
console.log(await pg.evaluate(()=>['xdense-sw','xcolor-sw'].map(id=>{const x=document.getElementById(id);if(!x)return id+' absent';let p=x,c=[];while(p&&p.id!=='xs-panel'&&c.length<6){c.push((p.id||p.tagName+'.'+p.className.split(' ')[0])+(p.tagName==='DETAILS'?(p.open?'[ouvert]':'[fermé]'):''));p=p.parentElement}return c.join(' < ')+' w='+x.offsetWidth}).join('\n')));
await b.close()})();
