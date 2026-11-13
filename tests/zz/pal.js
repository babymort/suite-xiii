const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{localStorage.setItem('devisoXIII.summary',JSON.stringify({ht:20000,crew:11000,eq:6000,fees:2000}));localStorage.setItem('devisoXIII.project',JSON.stringify({real:[{ht:9000}]}));
 const t=new Date(),d=n=>{const x=new Date(t);x.setDate(t.getDate()+n);return x.toISOString().slice(0,10)};localStorage.setItem('xiii.projets',JSON.stringify({active:'p1',list:[{id:'p1',title:'Le Phare',debut:d(10),fin:d(24),diffusion:d(80)}]}));
 localStorage.setItem('xiii.dash.me',JSON.stringify({order:['budget','postes','frise'],off:[],lay:{budget:{x:0,y:0,w:1,h:1},postes:{x:1,y:0,w:1,h:1},frise:{x:2,y:0,w:2,h:1}},sty:{budget:{f:'ring'}}}));});
await pg.reload();await pg.waitForTimeout(6500);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove())});
for(const th of ['dark','sobre','light','sobrec']){await F.evaluate(t=>{XTHEME.set(t)},th);await pg.waitForTimeout(1500);
 console.log(th,await F.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--xc-1')+' rail '+getComputedStyle(document.documentElement).getPropertyValue('--xc-track')));
 const g=await F.$('#xd-dash .xd-g');await g.screenshot({path:'/tmp/zz/pal_'+th+'.png'});}
await b.close()})();
