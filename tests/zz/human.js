const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true});const pg=await ctx.newPage();
const app=process.argv[2]||'conduco';
await ctx.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1')}catch(e){}
 window.__mut=[];addEventListener('DOMContentLoaded',()=>{new MutationObserver(ms=>ms.forEach(m=>{const t=m.target;if(t.closest&&t.closest('#top-bar')){const n=[...m.addedNodes,...m.removedNodes].filter(x=>x.nodeType===1).map(x=>x.id||x.tagName).join('+');window.__mut.push((performance.now()|0)+' '+m.type+' '+(t.id||t.tagName)+(m.attributeName?'@'+m.attributeName:'')+' '+n)}})).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']})});},app);
await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(6000);
await pg.evaluate(()=>window.__mut=[]);
for(const s of ['#xtop-exp','#xb-file > button:has-text("Ouvrir")','#xtop-new']){
 const bx=await pg.locator(s).first().boundingBox();const x=bx.x+bx.width/2,y=bx.y+bx.height/2;
 await pg.mouse.move(x-200,y+300);await pg.waitForTimeout(300);
 await pg.evaluate(()=>window.__mut=[]);
 await pg.mouse.move(x,y,{steps:12});await pg.waitForTimeout(700);
 let ev=[];const h1=()=>ev.push('FC');pg.on('filechooser',h1);
 const bx2=await pg.locator(s).first().boundingBox();
 await pg.mouse.down();await pg.waitForTimeout(160);await pg.mouse.up();await pg.waitForTimeout(700);
 const st=await pg.evaluate(()=>{const m=document.querySelector('#xb-menu');return m&&m.offsetWidth?'MENU':''});
 const mut=await pg.evaluate(()=>window.__mut.slice(0,12));
 console.log(s,'pos avant/après survol',bx.x|0,'→',bx2.x|0,'|',ev.join(','),st||'(rien)');console.log('   mutations:',mut.length?'\n    '+mut.join('\n    '):'aucune');
 pg.off('filechooser',h1);await pg.keyboard.press('Escape');await pg.evaluate(()=>{const m=document.querySelector('#xb-menu');if(m)m.remove()});}
await b.close();})();
