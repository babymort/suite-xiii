const {chromium}=require('playwright');const fs=require('fs');
const apps=fs.readdirSync('/home/claude/suite-xiii').filter(f=>f.endsWith('.html')&&!/-m\.html$|^(index|espace|catalogue|importo|404|offline)/.test(f)).map(f=>f.slice(0,-5));
(async()=>{const b=await chromium.launch();for(const a of apps){const p=await b.newPage({viewport:{width:1440,height:900}});await p.addInitScript(()=>{try{localStorage.setItem('xiii.tour.done','1')}catch(e){}});
try{await p.goto('http://localhost:8765/'+a+'.html');await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const d=e=>{const r=e.getBoundingClientRect();return (e.id?'#'+e.id:'')+(e.className&&typeof e.className=='string'?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'')+'['+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+']'};
const top=document.getElementById('xb-home');let t=top;while(t&&t.parentElement&&t.parentElement.getBoundingClientRect().height<70)t=t.parentElement;
const tb=document.getElementById('toolbar');
// big visible blocks: walk depth 3 from body
const out=[];const walk=(e,dep)=>{for(const c of e.children){if(/SCRIPT|STYLE|LINK/.test(c.tagName))continue;const r=c.getBoundingClientRect();const cs=getComputedStyle(c);if(r.width<5||r.height<5||cs.visibility=='hidden')continue;
 if(r.width<innerWidth*0.45&&r.height>innerHeight*0.4)out.push('SIDE '+d(c));else if(r.height<60&&r.width>innerWidth*0.6&&r.top>innerHeight-80)out.push('BOT '+d(c));else if(dep<3&&r.width>innerWidth*0.45)walk(c,dep+1);}};walk(document.body,0);
return {top:t&&d(t),tb:tb&&d(tb),out}});console.log(a.padEnd(12),'TOP',r.top,'| TB',r.tb,'|',r.out.join(' '));}catch(e){console.log(a,'ERR',e.message.slice(0,80))}await p.close();}await b.close();})();
