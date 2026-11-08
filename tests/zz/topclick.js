const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:900}});
const app=process.argv[2]||'conduco';
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(4000);
const ids=await pg.evaluate(()=>[...document.querySelectorAll('#xb-file > button')].filter(b=>b.offsetWidth).map(b=>b.id+'|'+(b.textContent||'').trim().slice(0,14)));
console.log(app,ids.join(' · '));
for(const s of ids){const id=s.split('|')[0];if(!id)continue;
 const el=pg.locator('#'+id);const bx=await el.boundingBox();
 const top=await pg.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?(e.id||e.className||e.tagName)+'/'+(e.closest('button')||{}).id:'none'},[bx.x+bx.width/2,bx.y+bx.height/2]);
 let fc=false;pg.once('filechooser',()=>fc=true);
 await pg.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);await pg.waitForTimeout(500);
 const st=await pg.evaluate(()=>{const m=document.querySelector('#xb-menu');const ov=[...document.body.children].filter(e=>getComputedStyle(e).position==='fixed'&&e.offsetWidth>300&&getComputedStyle(e).display!=='none').map(e=>e.id||e.className).slice(0,4);return (m&&m.offsetWidth?'MENU ':'')+ov.join(',')});
 console.log(' ',id,'hit:',top,'→',fc?'FILECHOOSER':'',st);
 await pg.keyboard.press('Escape');await pg.waitForTimeout(200);}
await b.close();})();
