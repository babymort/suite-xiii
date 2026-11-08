const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true});const pg=await ctx.newPage();
const app=process.argv[2]||'conduco';const url=process.argv[3]||('http://localhost:8765/'+app+'.html');
pg.on('pageerror',e=>console.log('ERR',e.message));pg.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('CONS',m.text().slice(0,160))});
await pg.goto(url);await pg.waitForTimeout(4500);
const F=pg.frames().find(f=>f.url().includes(app))||pg.mainFrame();
async function clickBtn(sel,label){const el=F.locator(sel).first();if(!await el.count()){console.log(label,'absent');return}
 const bx=await el.boundingBox();if(!bx){console.log(label,'invisible');return}
 let ev=[];const h1=()=>ev.push('FILECHOOSER'),h2=d=>ev.push('DL '+d.suggestedFilename()),h3=()=>ev.push('POPUP');
 pg.on('filechooser',h1);pg.on('download',h2);pg.on('popup',h3);
 await pg.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);await pg.waitForTimeout(900);
 const menu=await F.evaluate(()=>{const m=document.querySelector('#xb-menu');return m&&m.offsetWidth?[...m.querySelectorAll('[data-i]')].map(x=>x.textContent.trim().slice(0,40)):null});
 console.log(label,ev.join(',')||'-',menu?('MENU['+menu.length+']'):'');
 pg.off('filechooser',h1);pg.off('download',h2);pg.off('popup',h3);return menu;}
await clickBtn('#xb-file > button:has-text("Ouvrir")','📂');await pg.keyboard.press('Escape');
await clickBtn('#xb-file > button:has-text("Enregistrer")','💾');await pg.keyboard.press('Escape');await pg.waitForTimeout(300);
for(const id of ['xtop-exp','xtop-new']){const m=await clickBtn('#'+id,id);await pg.keyboard.press('Escape');await pg.waitForTimeout(300);
 if(m)for(let i=0;i<m.length;i++){await clickBtn('#'+id,' ');
  const it=F.locator('#xb-menu [data-i]').nth(i);const bx=await it.boundingBox();let ev=[];const h1=()=>ev.push('FC'),h2=d=>ev.push('DL '+d.suggestedFilename()),h3=()=>ev.push('POPUP');pg.on('filechooser',h1);pg.on('download',h2);pg.on('popup',h3);
  const hit=bx?await F.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&e.closest('#xb-menu')?'ok':(e?(e.id||e.tagName):'none')},[bx.x+bx.width/2,bx.y+bx.height/2]):'nobox';
  if(bx)await pg.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);await pg.waitForTimeout(2500);
  const ov=await F.evaluate(()=>[...document.body.children].filter(e=>getComputedStyle(e).position==='fixed'&&e.offsetWidth>300&&getComputedStyle(e).display!=='none'&&!/xoff|xau|xem-first|xt-root/.test(e.id)).map(e=>e.id||e.className).join(','));
  console.log('   •',m[i],'hit',hit,'→',ev.join(',')||'-',ov);pg.off('filechooser',h1);pg.off('download',h2);pg.off('popup',h3);
  await pg.keyboard.press('Escape');await pg.waitForTimeout(300);}}
await b.close();})();
