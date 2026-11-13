const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const app of process.argv.slice(2)){const pg=await b.newPage({viewport:{width:1500,height:900}});
await pg.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1')}catch(e){}},app);
try{await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(3500);}catch(e){console.log(app,'fail');continue}
console.log(app,await pg.evaluate(()=>{const c=document.getElementById('tabs-container');if(!c)return 'NO CONTAINER';const k=[...c.children];return k.length+' enfants | P.tabs='+(typeof P!=='undefined'&&P&&Array.isArray(P.tabs)?P.tabs.length:'-')+' | '+(k[0]?k[0].outerHTML.replace(/\s+/g,' ').slice(0,260):'')}));await pg.close()}
await b.close()})();
