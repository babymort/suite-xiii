const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1600,height:1000}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{localStorage.setItem('devisoXIII.summary',JSON.stringify({ht:48200,crew:26400,eq:15300,fees:3900,version:'B'}));
 localStorage.setItem('xiii.projets',JSON.stringify({active:'p1',list:[{id:'p1',title:'Le Phare',debut:'2026-12-02',genre:'fiction',team:[{prenom:'A',role:'Chef opérateur',dept:'image'},{prenom:'B',role:'1er assistant caméra',dept:'image'},{prenom:'C',role:'Chef électro',dept:'elec'},{prenom:'D',role:'Ingé son',dept:'son'},{prenom:'E',role:'Perchman',dept:'son'},{prenom:'F',role:'Réalisatrice',dept:'real'},{prenom:'G',role:'Régisseur',dept:'regie'},{prenom:'H',role:'Électro',dept:'elec'},{prenom:'I',role:'Électro',dept:'elec'}]}]}));
 const day=(n,d,c)=>({id:'d'+n,name:'J'+n,date:d,crew:Array(c).fill({}),schedule:Array(n+2).fill({})});
 localStorage.setItem('callsheetoXIII.project',JSON.stringify({days:[day(1,'2026-12-02',14),day(2,'2026-12-03',22),day(3,'2026-12-04',9),day(4,'2026-12-05',18)]}));
 localStorage.setItem('xiii.dash.me',JSON.stringify({order:['postes','effectif','charge'],off:[]}));});
await pg.reload();await pg.waitForTimeout(7000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov').forEach(m=>m.remove())});
for(const k of ['postes','effectif','charge']){console.log(k,await F.evaluate(k=>{const c=document.querySelector('#xd-dash .xd-c[data-card='+k+']');return c?(c.dataset.xwmf||'-')+' | '+[...c.querySelectorAll('.hg a')].map(a=>a.querySelector('.hl').textContent+'='+a.querySelector('.hn').textContent).join(', '):'absent'},k));
 const el=await F.$('#xd-dash .xd-c[data-card='+k+']');if(el){await pg.waitForTimeout(200);await el.screenshot({path:'/tmp/zz/h_'+k+'.png'});}}
await b.close()})();
