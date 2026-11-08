const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});
await pg.addInitScript(()=>{try{localStorage.setItem('xiii.pins',JSON.stringify(['plano','syno','dossier']))}catch(e){}});
await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(8000);
console.log(await pg.evaluate(()=>{const p=document.getElementById('xpin');if(!p)return 'no xpin '+Object.keys(localStorage).filter(k=>/pin/.test(k));return [...p.querySelectorAll('.card')].map(c=>c.className+' | '+getComputedStyle(c).gridColumn+' | '+c.getBoundingClientRect().width).join('\n')}));
const e=await pg.$('#xpin');if(e)await e.screenshot({path:'/tmp/zz/pin2.png'});await b.close()})();
