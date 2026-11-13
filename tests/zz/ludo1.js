const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{try{localStorage.setItem('xiii.tour2.ludo.hide','1');localStorage.setItem('xiii.ux.density','compact')}catch(e){}});
await pg.goto('http://localhost:8765/ludo.html');await pg.waitForTimeout(5000);
await pg.click('#xlib-tab');await pg.waitForTimeout(800);
await pg.screenshot({path:'/tmp/zz/ludo1.png',clip:{x:0,y:90,width:520,height:810}});
console.log(await pg.evaluate(()=>{const p=document.getElementById('library-panel');const it=p.querySelector('[class*=game],li,.lib-item');return p.offsetWidth+'px | '+(it?it.outerHTML.slice(0,600):'?')}));
await b.close()})();
