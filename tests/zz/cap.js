const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1600,height:950},acceptDownloads:true});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('xiii.tips.off','true');localStorage.setItem('xiii.cadro.scopes',JSON.stringify({show:false}))});
await p.goto('http://localhost:8765/cadro.html?desktop=1#live');await p.waitForTimeout(3000);
await p.evaluate(()=>document.querySelector('#xcl [data-go2]').click());await p.waitForTimeout(1500);
await p.keyboard.press('k');await p.waitForTimeout(800);
await p.fill('#xcc [data-f=seq]','12');await p.fill('#xcc [data-f=plan]','3');await p.fill('#xcc [data-f=note]','Raccord lumière fenêtre');
await p.screenshot({path:'/tmp/zz/cap1.png'});
const [d]=await Promise.all([p.waitForEvent('download'),p.click('#xcc [data-a=board]')]);await d.saveAs('/tmp/zz/cap_board.png');console.log('planche',d.suggestedFilename());
const [pop]=await Promise.all([p.waitForEvent('popup'),p.click('#xcc [data-a=sheet]')]);await pop.waitForLoadState();await pop.waitForTimeout(800);await pop.pdf({path:'/tmp/zz/cap_sheet.pdf',landscape:true}).catch(e=>console.log('pdf',e.message));
await p.click('#xcc [data-a=story]');await p.waitForTimeout(300);console.log('story',await p.evaluate(()=>document.querySelector('#xcc .st').textContent));
const s=await c.newPage();await s.goto('http://localhost:8765/storyboardo.html?desktop=1');await s.waitForTimeout(4000);
const n0=await s.evaluate(()=>P.panels.length);await s.evaluate(()=>document.querySelector('#xclsb [data-ok]').click());await s.waitForTimeout(1500);
console.log('plans',n0,'→',await s.evaluate(()=>[P.panels.length,PN().seq,PN().num,PN().notes.slice(0,40),!!PN().bg.img]));
await s.screenshot({path:'/tmp/zz/cap_sb.png'});
console.log(er);await b.close()})()
