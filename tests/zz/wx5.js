const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1600,height:1000}});const pg=await ctx.newPage();
pg.on('pageerror',e=>console.log('ERR',e.message));
// réponse météo simulée (le réseau du banc de test est fermé)
await ctx.route('https://api.open-meteo.com/**',r=>{const t=new Date(),D=[...Array(5)].map((_,i)=>{const x=new Date(t);x.setDate(t.getDate()+i);return x.toISOString().slice(0,10)});
 r.fulfill({contentType:'application/json',body:JSON.stringify({daily:{time:D,weathercode:[0,2,61,3,95],temperature_2m_max:[14,12,9,11,8],temperature_2m_min:[6,5,4,3,2],precipitation_probability_max:[5,20,80,35,90],wind_speed_10m_max:[12,18,30,22,45],sunrise:D.map(d=>d+'T07:58'),sunset:D.map(d=>d+'T17:12')}})})});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{const t=new Date(),d=n=>{const x=new Date(t);x.setDate(t.getDate()+n);return x.toISOString().slice(0,10)};
 localStorage.setItem('callsheetoXIII.project',JSON.stringify({days:[{id:'a',name:'J1',date:d(2),times:{general:'07:30',wrap:'19:00'},locations:[{name:'Phare du Créac\'h',lat:48.46,lon:-5.13}]},{id:'b',name:'J2',date:d(3),times:{general:'08:00'},locations:[]}]}));
 localStorage.setItem('reperoXIII.project',JSON.stringify({spots:[{name:'Port de Brest',lat:48.38,lon:-4.49}]}));
 localStorage.setItem('xiii.dash.me',JSON.stringify({order:['wx5','countdown'],off:[],lay:{wx5:{x:0,y:0,w:2,h:2},countdown:{x:2,y:0,w:2,h:1}}}));});
await pg.reload();await pg.waitForTimeout(7000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov,#xt-root').forEach(m=>m.remove())});
const st=()=>F.evaluate(()=>{const w=document.querySelector('#xd-dash .xd-c[data-card=wx5]'),c=document.querySelector('#xd-dash .xd-c[data-card=countdown]');return 'météo: '+(w?w.querySelectorAll('.xw5-d>div').length+' jours, '+w.querySelectorAll('.xw5-d>div.sh').length+' tournage, onglets '+w.querySelectorAll('[data-wx5]').length:'absent')+' | décompte: '+(c?(c.querySelector('.xcd-n')||{}).textContent:'absent')});
console.log(await st());await pg.waitForTimeout(2100);console.log(await st());
await F.click('#xd-dash [data-wx5="1"]');await pg.waitForTimeout(800);console.log('onglet 2:',await F.evaluate(()=>document.querySelector('#xd-dash .xw5-t .on').textContent));
for(const k of ['wx5','countdown']){const el=await F.$('#xd-dash .xd-c[data-card='+k+']');if(el)await el.screenshot({path:'/tmp/zz/w5_'+k+'.png'});}
await b.close()})();
