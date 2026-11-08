const {chromium}=require('playwright');const fs=require('fs');
const apps=process.argv[2]?process.argv[2].split(','):fs.readdirSync('/home/claude/suite-xiii').filter(f=>f.endsWith('.html')&&fs.readFileSync('/home/claude/suite-xiii/'+f,'utf8').includes('id="toolbar"')).map(f=>f.slice(0,-5)).filter(a=>!/-m$|^(catalogue|importo)$/.test(a));
(async()=>{const b=await chromium.launch();for(const a of apps){const p=await b.newPage({viewport:{width:1440,height:900}});await p.addInitScript(()=>{try{localStorage.setItem('xiii.tour.done','1');localStorage.setItem('xiii.tips.off','1')}catch(e){}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
try{await p.goto('http://localhost:8765/'+a+'.html');await p.waitForTimeout(3500);
await p.evaluate(()=>{const s=document.querySelector('#xt-bar .sk');if(s)s.click();document.activeElement&&document.activeElement.blur&&document.activeElement.blur()});await p.waitForTimeout(400);
const bt=await p.evaluate(()=>{const b=document.getElementById('xfocus-btn');return b?(b.closest('.xsec')||{}).dataset?.sec+' vis='+(b.offsetWidth>0):'NOBTN'});
const before=await p.evaluate(()=>document.getElementById('toolbar').getBoundingClientRect().bottom);
await p.mouse.click(5,890).catch(()=>{});await p.keyboard.press('f');await p.waitForTimeout(500);
const r=await p.evaluate(()=>{const on=document.body.classList.contains('xfocus');const tb=document.getElementById('top-bar');
// zone de travail : plus haut élément visible large
let minTop=9999,what='';for(const e of document.body.querySelectorAll('body *')){if(e.id==='xfocus-out'||e.closest('#xfocus-out'))continue;const r=e.getBoundingClientRect();if(r.width>innerWidth*0.3&&r.height>40&&getComputedStyle(e).display!=='none'&&r.bottom>0&&r.top<minTop&&r.top>=0){minTop=r.top;what=(e.id||e.className||e.tagName)+''}}
const at=document.elementFromPoint(720,30);return {on,tbHidden:!tb||tb.offsetHeight===0,minTop:Math.round(minTop),what:what.slice(0,30),at30:at&&((at.id||at.className||at.tagName)+'').slice(0,25),ov:document.documentElement.scrollWidth>innerWidth+2}});
await p.screenshot({path:'/tmp/zz/foc_'+a+'.png'});
await p.keyboard.press('f');await p.waitForTimeout(400);const back=await p.evaluate(()=>!document.body.classList.contains('xfocus')&&document.getElementById('toolbar').getBoundingClientRect().bottom);
console.log(a.padEnd(12),bt,'| focus',r.on,'barres cachées',r.tbHidden,'| haut zone',r.minTop,r.what,'| y30:',r.at30,r.ov?'DEBORDE':'','| retour',back===before?'ok':'?'+back+'/'+before,errs.length?'ERR '+errs[0].slice(0,60):'');}catch(e){console.log(a,'ERR',e.message.slice(0,90))}await p.close();}await b.close();})();
