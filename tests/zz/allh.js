const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const app of process.argv.slice(2)){const ctx=await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true});const pg=await ctx.newPage();
await ctx.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1');localStorage.setItem('xiii.guide.'+a,'1')}catch(e){}
 window.__n=0;addEventListener('DOMContentLoaded',()=>new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='childList'&&m.target.closest&&m.target.closest('#top-bar')&&[...m.addedNodes].some(x=>x.nodeType===1&&x.tagName==='BUTTON'))window.__n++})).observe(document.documentElement,{subtree:true,childList:true}))},app);
try{await pg.goto('http://localhost:8765/'+app+'.html');}catch(e){console.log(app,'goto fail');continue}
await pg.waitForTimeout(5500);
await pg.evaluate(()=>{const m=document.getElementById('modal');if(m&&/Guide/.test(m.textContent))m.style.display='none'});
await pg.evaluate(()=>window.__n=0);await pg.waitForTimeout(4000);const idle=await pg.evaluate(()=>window.__n);
const res=[];
async function human(loc){const bx=await loc.boundingBox();if(!bx)return'nobox';const x=bx.x+bx.width/2,y=bx.y+bx.height/2;await pg.mouse.move(x,y,{steps:8});await pg.waitForTimeout(500);const top=await pg.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?e:null},[x,y]).catch(()=>null);await pg.mouse.down();await pg.waitForTimeout(150);await pg.mouse.up();await pg.waitForTimeout(600);return 'ok'}
const menuOpen=()=>pg.evaluate(()=>{const m=document.querySelector('#xb-menu');return !!(m&&m.offsetWidth)});
const close=async()=>{await pg.keyboard.press('Escape');await pg.evaluate(()=>{const m=document.querySelector('#xb-menu');if(m)m.remove()});await pg.waitForTimeout(250)};
for(const [s,k] of [['#xtop-exp','⬇️'],['#xtop-new','🗒️']]){const l=pg.locator(s).first();if(!await l.count()||!await l.isVisible()){res.push(k+'∅');continue}await human(l);const o=await menuOpen();res.push(k+(o?'✓':'✗'));
 if(o&&k==='⬇️'){const items=pg.locator('#xb-menu [data-i]');const n=await items.count();let ev=[];const h=()=>ev.push('dl'),h2=()=>ev.push('fc'),h3=()=>ev.push('pop');pg.on('download',h);pg.on('filechooser',h2);pg.on('popup',h3);
  const last=items.nth(n-1);await human(last);await pg.waitForTimeout(1500);const gone=!(await menuOpen());res.push('item'+(gone?'✓':'✗')+(ev.join('')?'('+ev.join(',')+')':''));pg.off('download',h);pg.off('filechooser',h2);pg.off('popup',h3);}
 await close();}
{const l=pg.locator('#xb-file > button:has-text("Ouvrir")').first();if(await l.count()&&await l.isVisible()){let fc=false;const h=()=>fc=true;pg.on('filechooser',h);await human(l);await pg.waitForTimeout(400);res.push('📂'+(fc?'✓':'✗'));pg.off('filechooser',h);await close();}else res.push('📂∅');}
console.log(app.padEnd(12),'boucle:'+idle,res.join(' '));await ctx.close();}
await b.close();})();
