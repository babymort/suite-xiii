const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1600,height:1000}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
await pg.evaluate(()=>{localStorage.removeItem('xiii.dash.me');
 localStorage.setItem('devisoXIII.summary',JSON.stringify({ht:12000,version:'B'}));localStorage.setItem('devisoXIII.project',JSON.stringify({real:[{ht:5200}]}));
 localStorage.setItem('backupoXIII.project',JSON.stringify({log:[{status:'verifiee',bytes:6e11},{status:'verifiee',bytes:4e11},{status:'copie',bytes:2e11},{status:'recue',bytes:0}]}));
 localStorage.setItem('dossierXIII.summary',JSON.stringify({name:'Doc',inc:18,ready:6,missing:2,docs:22,pages:48,filled:11,ch:[{t:'Présentation',n:4,ok:4,rd:3},{t:'Équipe',n:6,ok:3,rd:2},{t:'Technique',n:5,ok:3,rd:1},{t:'Annexes',n:3,ok:1,rd:0}]}));
 localStorage.setItem('xiii.projets',JSON.stringify({active:'p1',list:[{id:'p1',title:'Le Phare',debut:'2026-12-02',fin:'2026-12-12',lieu:'Brest',genre:'fiction'}]}));
 const me={order:['dossier','budget','rush','check','need','dead','proj','day'],off:[]};localStorage.setItem('xiii.dash.me',JSON.stringify(me));});
await pg.reload();await pg.waitForTimeout(6500);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
await F.evaluate(()=>{document.querySelectorAll('.modal-overlay,#xnw-ov').forEach(m=>m.remove())});
const W=['dossier','budget','rush','check','need','dead','proj'];
for(const k of W){const fs=await F.evaluate(k=>{XWMAN.open();return new Promise(r=>setTimeout(()=>{const w=document.querySelector('#xwm .xwm-w[data-k='+k+']');if(!w){document.querySelector('#xwm [data-cancel]').click();r(null);return}w.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:1}));w.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,pointerId:1}));setTimeout(()=>{const x=[...document.querySelectorAll('#xwm .xwm-sd [data-f=f] button')].map(b=>b.dataset.v);document.getElementById('xwm').remove();r(x)},200)},400))},k);
 console.log(k.padEnd(8),'formats:',fs?fs.join(','):'(absent)');
 if(!fs)continue;
 for(const f of fs){await F.evaluate(([k,f])=>{const u=XDASH.me();u.sty=Object.assign({},u.sty,{[k]:{f}});XDASH.setMe(u);XDASH.render();},[k,f]);await pg.waitForTimeout(1300);
  const el=await F.$('#xd-dash .xd-c[data-card='+k+']');if(el)await el.screenshot({path:'/tmp/zz/f_'+k+'_'+f+'.png'});
  const ok=await F.evaluate(([k,f])=>{const c=document.querySelector('#xd-dash .xd-c[data-card='+k+']');return c?(c.dataset.xwmf||'texte')+(c.querySelector('.xwm-fmt')?'':' (pas de bloc)'):'?'},[k,f]);process.stdout.write('   '+f+'→'+ok);}
 console.log();}
await b.close()})();
