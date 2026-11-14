const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();pg.on('console',m=>{if(/SPY/.test(m.text()))console.log(m.text())});
await pg.addInitScript(()=>{localStorage.setItem('xiii.tour2.plano.hide','1');localStorage.setItem('xiii.color',JSON.stringify({mode:'projet'}));localStorage.setItem('xiii.ws',JSON.stringify({cur:'w1',list:[{id:'w1',name:'Le Phare',color:'#4db6ac'}]}));
 const ri=Storage.prototype.removeItem,cl=Storage.prototype.clear,si=Storage.prototype.setItem;Storage.prototype.removeItem=function(k){if(k==='xiii.color')console.log('SPY remove '+new Error().stack.split('\n').slice(2,4).join(' | '));return ri.apply(this,arguments)};
 Storage.prototype.clear=function(){console.log('SPY clear '+new Error().stack.split('\n')[2]);return cl.apply(this,arguments)};
 setTimeout(()=>console.log('SPY à 50ms: '+localStorage.getItem('xiii.color')),50);});
await pg.goto('http://localhost:8765/plano.html');await pg.waitForTimeout(3000);
console.log('fin:',await pg.evaluate(()=>localStorage.getItem('xiii.color')));
await b.close()})();
