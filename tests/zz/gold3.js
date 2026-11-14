const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.ws',JSON.stringify({cur:'w1',list:[{id:'w1',name:'Le Phare',color:'#4db6ac'}]}));localStorage.setItem('xiii.color',JSON.stringify({mode:'projet'}))});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(6000);
const F=pg.frames().find(f=>/index\.html/.test(f.url())&&f!==pg.mainFrame())||pg.mainFrame();
console.log(await F.evaluate(()=>{const o=[];document.querySelectorAll('*').forEach(e=>{const cs=getComputedStyle(e);const s=[cs.color,cs.borderBottomColor,cs.backgroundColor,cs.boxShadow].join(' ');if(/255, 183, 77|240, 179, 120/.test(s))o.push((e.id||String(e.className).slice(0,25)||e.tagName)+' «'+(e.textContent||'').trim().slice(0,18)+'» style='+(e.getAttribute('style')||'').slice(0,60))});return o.slice(0,12).join('\n')}));
await b.close()})();
