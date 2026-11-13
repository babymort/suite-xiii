const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const app of process.argv.slice(2)){const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1')}catch(e){}},app);
try{await pg.goto('http://localhost:8765/'+app+'.html');}catch(e){continue}await pg.waitForTimeout(3500);
const has=await pg.evaluate(()=>!!document.querySelector('#tabs-container .tab-title, #tabs-container .tab'));if(!has){await pg.close();continue}
const r=async(lbl)=>{const v=await pg.evaluate(async()=>{const el=document.querySelector('#tabs-container .tab.active .tab-title')||document.querySelector('#tabs-container .tab');const S=new Set();let mut=0;const mo=new MutationObserver(m=>mut+=m.length);mo.observe(el,{attributes:true,childList:true,subtree:true,characterData:true});for(let i=0;i<40;i++){const cs=getComputedStyle(el);S.add(cs.color+'/'+cs.backgroundColor+'/'+cs.opacity);await new Promise(r=>setTimeout(r,50))}mo.disconnect();return [...S].length+' états, '+mut+' mutations '+(S.size>1?[...S].slice(0,3).join(' | '):'')});return lbl+':'+v};
const a=await r('repos');const t=await pg.locator('#tabs-container .tab').first().boundingBox();await pg.mouse.move(t.x+t.width/2,t.y+t.height/2);const h=await r('survol');
console.log(app.padEnd(12),a,'||',h);await pg.close()}await b.close()})();
