const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.ludo.hide','1');localStorage.setItem('xiii.ux.density','compact')});
await pg.goto('http://localhost:8765/ludo.html');await pg.waitForTimeout(5000);await pg.click('#xlib-tab');await pg.waitForTimeout(600);
console.log(await pg.evaluate(()=>{const i=document.querySelector('.lib-item'),t=i.querySelector('.lib-txt'),cs=getComputedStyle(i);return 'item h='+i.offsetHeight+' display='+cs.display+' height='+cs.height+' maxh='+cs.maxHeight+' overflow='+cs.overflow+' | txt h='+t.offsetHeight+' | parent '+getComputedStyle(i.parentElement).display+' '+getComputedStyle(i.parentElement).gridAutoRows+' '+getComputedStyle(i.parentElement).flexDirection}));
await b.close()})();
