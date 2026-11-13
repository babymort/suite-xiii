const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1600,height:1000}});
pg.on('pageerror',e=>console.log('ERR',e.message));
for(const mode of ['fiche','planno']){
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(mode=>{localStorage.clear();const t=new Date(),d=n=>{const x=new Date(t);x.setDate(t.getDate()+n);return x.toISOString().slice(0,10)};
 localStorage.setItem('xiii.projets',JSON.stringify({active:'p1',list:[{id:'p1',title:'Le Phare',debut:d(10),fin:d(24),diffusion:d(80),genre:'fiction'}]}));
 if(mode==='planno')localStorage.setItem('plannoXIII.project',JSON.stringify({tasks:[{name:'Écriture',phase:'Développement',start:d(-40),end:d(-15)},{name:'Repérages',phase:'Prépa',start:d(-14),end:d(9)},{name:'Tournage',phase:'Tournage',start:d(10),end:d(24)},{name:'Montage',phase:'Post-production',start:d(26),end:d(60)},{name:'Mixage',phase:'Post-production',start:d(55),end:d(70)},{name:'Validation client',ms:1,start:d(62),end:d(62),phase:'Post-production'},{name:'PAD',ms:1,start:d(75),end:d(75),phase:'Livraison'}]}));
 localStorage.setItem('xiii.dash.me',JSON.stringify({order:['frise'],off:[],lay:{frise:{x:0,y:0,w:3,h:2}}}));},mode);
await pg.reload();await pg.waitForTimeout(7000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root,[id^=xtour],.xtour').forEach(m=>m.remove())});
console.log(mode,await F.evaluate(()=>{const c=document.querySelector('#xd-dash .xd-c[data-card=frise]');return c?c.querySelectorAll('.xfr-ph').length+' phases, '+c.querySelectorAll('.xfr-ms').length+' jalons, maintenant='+!!c.querySelector('.xfr-now')+' | '+(c.querySelector('.xd-m')||{}).textContent:'absent'}));
await pg.waitForTimeout(1200);const el=await F.$('#xd-dash .xd-c[data-card=frise]');if(el)await el.screenshot({path:'/tmp/zz/frise_'+mode+'.png'});}
await b.close()})();
