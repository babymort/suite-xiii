const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1600,height:1000}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{const H={budget:[],need:[]};const d0=new Date();d0.setDate(d0.getDate()-20);for(let i=0;i<20;i++){const d=new Date(d0);d.setDate(d0.getDate()+i);const s=d.toISOString().slice(0,10);H.budget.push([s,Math.round(5+i*1.9+Math.sin(i)*3)]);H.need.push([s,Math.max(1,12-Math.round(i/3))]);}
 localStorage.setItem('xiii.dash.hist',JSON.stringify(H));localStorage.setItem('devisoXIII.summary',JSON.stringify({ht:12000,version:'B'}));localStorage.setItem('devisoXIII.project',JSON.stringify({real:[{ht:5200}]}));localStorage.setItem('backupoXIII.project',JSON.stringify({log:[{status:'verifiee',bytes:6e11},{status:'copie',bytes:2e11}]}));localStorage.setItem('xiii.projets',JSON.stringify({active:'p1',list:[{id:'p1',title:'Le Phare',debut:'2026-12-02',genre:'fiction'}]}));
 localStorage.setItem('xiii.dash.me',JSON.stringify({order:['budget','need','rush','dossier'],off:[],sty:{budget:{f:'curve'},need:{f:'curve'},rush:{f:'curve'}}}));});
await pg.reload();await pg.waitForTimeout(7000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov').forEach(m=>m.remove())});
for(const k of ['budget','need','rush']){const el=await F.$('#xd-dash .xd-c[data-card='+k+']');console.log(k,await F.evaluate(k=>{const c=document.querySelector('#xd-dash .xd-c[data-card='+k+']');return c?(c.dataset.xwmf||'-'):'absent'},k));if(el)await el.screenshot({path:'/tmp/zz/cv_'+k+'.png'});}
console.log('hist today rush:',await F.evaluate(()=>JSON.stringify((JSON.parse(localStorage.getItem('xiii.dash.hist'))||{}).rush)));
await b.close()})();
