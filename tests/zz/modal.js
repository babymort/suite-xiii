const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();for(const app of process.argv.slice(2)){const pg=await b.newPage({viewport:{width:1500,height:900}});
await pg.addInitScript(a=>{try{localStorage.setItem('xiii.tour2.'+a+'.hide','1')}catch(e){}},app);
await pg.goto('http://localhost:8765/'+app+'.html');await pg.waitForTimeout(5000);
console.log(app,await pg.evaluate(()=>[...document.querySelectorAll('#modal,.modal')].filter(m=>{const r=m.getBoundingClientRect();return r.width>500}).map(m=>{const cs=getComputedStyle(m);return m.id+' disp='+cs.display+' op='+cs.opacity+' vis='+cs.visibility+' pe='+cs.pointerEvents+' cls='+m.className+' txt='+m.textContent.replace(/\s+/g,' ').trim().slice(0,70)}).join('\n  ')));
await pg.screenshot({path:'/tmp/zz/m_'+app+'.png'});await pg.close()}await b.close()})();
