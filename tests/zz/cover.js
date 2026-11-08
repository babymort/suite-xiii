const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:900}});
const app=process.argv[2]||'conduco';
await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(4500);
await pg.click('#xtop-exp');await pg.waitForTimeout(600);
console.log(await pg.evaluate(()=>{const m=document.querySelector('#xb-menu');const mr=m.getBoundingClientRect();const out=['menu '+JSON.stringify([mr.x|0,mr.y|0,mr.width|0,mr.height|0])+' z='+getComputedStyle(m).zIndex+' parent='+m.parentElement.id];
[...m.querySelectorAll('[data-i]')].forEach(it=>{const r=it.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(!e.closest('#xb-menu')){let p=e,ch=[];while(p&&p!==document.body){const cs=getComputedStyle(p);ch.push((p.id||p.tagName+'.'+p.className)+'[z'+cs.zIndex+' '+cs.position+']');p=p.parentElement}out.push(it.textContent.slice(0,20)+' COUVERT PAR '+ch.join(' < '))}});return out.join('\n')}));
await b.close();})();
