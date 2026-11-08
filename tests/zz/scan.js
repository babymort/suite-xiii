// scanne toute la barre du haut, point par point, en état "utilisateur réel" (visite vue, projet chargé)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const apps=process.argv.slice(2);
for(const app of apps){const pg=await b.newPage({viewport:{width:1500,height:900}});
await pg.addInitScript(a=>{try{for(const k of ['conduco','syno','deviso','plano','decoup','scripto','casto',a])localStorage.setItem('xiii.tour2.'+k+'.hide','1');localStorage.setItem('xiii.first.'+a,'1')}catch(e){}},app);
await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(5000);
const r=await pg.evaluate(()=>{const out={};document.querySelectorAll('#top-bar button,#toolbar button').forEach(btn=>{if(!btn.offsetWidth)return;const R=btn.getBoundingClientRect();for(const [fx,fy] of [[.5,.5],[.2,.5],[.8,.5],[.5,.2],[.5,.8]]){const e=document.elementFromPoint(R.x+R.width*fx,R.y+R.height*fy);if(e&&!btn.contains(e)){let p=e,c=[];while(p&&p!==document.body&&c.length<3){c.push(p.id||p.tagName+'.'+String(p.className).slice(0,20));p=p.parentElement}const k=(btn.id||(btn.textContent||'').trim().slice(0,12))+' ← '+c.join('<');out[k]=1;break}}});return Object.keys(out)});
console.log(app, r.length? '\n  '+r.join('\n  '):'OK');await pg.close();}
await b.close();})();
