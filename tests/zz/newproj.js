const {chromium}=require('playwright');
const fr=p=>p.frames().find(f=>/index\.html/.test(f.url())&&f.parentFrame()===p.mainFrame()&&f.name()!==''||/index\.html/.test(f.url()));
async function home(p){for(let i=0;i<30;i++){const fs=p.frames().filter(f=>/index\.html/.test(f.url()));for(const f of fs){try{if(await f.evaluate(()=>typeof XGUIDE!=='undefined'&&!!document.getElementById('xg-ov')))return f}catch(e){}}await p.waitForTimeout(300)}return null}
async function run(how,keep){const b=await chromium.launch();const c=await b.newContext({viewport:{width:1400,height:900}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(3500);
await p.evaluate(()=>{localStorage.setItem('xiii.drive',JSON.stringify({url:'https://script.google.com/macros/s/TEST/exec',code:'ABC'}));localStorage.setItem('xiii.projets',JSON.stringify({list:[{id:'f1',title:'Concert Khaled'}],active:'f1'}))});
const f0=p.frames().find(f=>/index\.html/.test(f.url())&&f!==p.mainFrame());
if(how==='guide')await f0.evaluate(()=>XGUIDE.start());
if(how==='select')await f0.evaluate(()=>{XPROJET.open();const s=document.getElementById('xpj-sw');s.value='__ws';s.dispatchEvent(new Event('change'))});
if(how==='espace')await p.evaluate(()=>newProject());
const f=await home(p);const r={how,guide:!!f};
if(f){r.ws=await f.evaluate(()=>XWS.id);r.box=await f.evaluate(()=>{const l=document.querySelector('.xg-keep');return l?l.innerText.replace(/\s+/g,' '):null});
await f.click('.xg-types button');await f.fill('[data-f=title]','Clip test');if(keep)await f.check('[data-keep]');
if(how==='guide'){await p.waitForTimeout(2000);await p.screenshot({path:'/tmp/zz/newproj.png'})}
for(let i=0;i<5;i++){await f.click('#xg-next');await p.waitForTimeout(300)}await p.waitForTimeout(800);
r.drive=await p.evaluate(ws=>{const d=JSON.parse(localStorage.getItem('xws.'+ws+'.xiii.drive')||'null');return d&&d.url?'relié':'aucun'},r.ws);
r.mainDrive=await p.evaluate(()=>!!localStorage.getItem('xiii.drive'));r.nbws=await p.evaluate(()=>JSON.parse(localStorage.getItem('xiii.ws')||'{"list":[]}').list.length)}
r.errs=errs;console.log(JSON.stringify(r));await b.close()}
(async()=>{await run('guide',true);await run('select',false);await run('espace',true)})()
