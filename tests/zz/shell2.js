const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true});const pg=await ctx.newPage();
const app=process.argv[2]||'conduco';
await ctx.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1')}catch(e){}},app);
await pg.goto('http://localhost:8765/espace.html');await pg.waitForTimeout(2500);
await pg.evaluate(a=>open(a+'.html'),app);await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>f.url().includes(app+'.html'));
const off=await pg.evaluate(()=>{const f=[...document.querySelectorAll('iframe')].find(x=>x.offsetWidth>300);const r=f.getBoundingClientRect();return [r.x,r.y]});
for(const s of ['#xtop-exp','#xtop-new','#xb-file > button:has-text("Ouvrir")','#xb-file > button:has-text("Enregistrer")','#xf-btn','#xgt-btn','#xsh-btn']){
 const bx=await F.locator(s).first().boundingBox();const x=bx.x+bx.width/2,y=bx.y+bx.height/2;
 const inF=await F.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?((e.closest('button')||e).id||(e.closest('button')||e).tagName):'none'},[x-off[0],y-off[1]]);
 let ev=[];const h1=()=>ev.push('FC'),h2=d=>ev.push('DL');pg.on('filechooser',h1);pg.on('download',h2);
 await pg.mouse.click(x,y);await pg.waitForTimeout(800);
 const st=await F.evaluate(()=>{const m=document.querySelector('#xb-menu');return (m&&m.offsetWidth?'MENU ':'')+[...document.body.children].filter(e=>getComputedStyle(e).position==='fixed'&&e.offsetWidth>300&&getComputedStyle(e).display!=='none').map(e=>e.id).join(',')});
 console.log(s,'cible:',inF,'→',ev.join(','),st);pg.off('filechooser',h1);pg.off('download',h2);await pg.keyboard.press('Escape');await F.evaluate(()=>{const m=document.querySelector('#xb-menu');if(m)m.remove()});await pg.waitForTimeout(300);}
await b.close();})();
