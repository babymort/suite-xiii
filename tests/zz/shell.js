const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true});const pg=await ctx.newPage();
const app=process.argv[2]||'conduco';
await ctx.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1')}catch(e){}},app);
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/espace.html');await pg.waitForTimeout(2500);
await pg.evaluate(a=>open(a+'.html'),app);await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>f.url().includes(app+'.html'));if(!F){console.log('no frame');process.exit()}
F.on&&0;
// charge un exemple si possible
await F.evaluate(()=>{try{const z=document.getElementById('xzz-ex');}catch(e){}});
async function hitTest(sel){const el=F.locator(sel).first();if(!await el.count())return'absent';const bx=await el.boundingBox();if(!bx)return'nobox';
 return await pg.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?(e.tagName==='IFRAME'?'IFRAME':(e.id||e.tagName+'.'+e.className)):'none'},[bx.x+bx.width/2,bx.y+bx.height/2])+' / in-frame:'+await F.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?(e.closest('button')||e).id||e.tagName:'none'},[bx.x-0+bx.width/2-(await 0),bx.y+bx.height/2]);}
for(const s of ['#xtop-exp','#xtop-new','#xb-file > button:has-text("Ouvrir")','#xb-file > button:has-text("Enregistrer")','#xf-btn','#xgt-btn','#xsh-btn'])console.log(s,await hitTest(s));
const fb=await pg.evaluate(()=>{const f=[...document.querySelectorAll('iframe')].find(x=>x.offsetWidth>300);const r=f.getBoundingClientRect();return [r.x,r.y]});console.log('frame at',fb);
await b.close();})();
