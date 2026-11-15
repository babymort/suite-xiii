const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});const er=[];p.on('pageerror',e=>er.push(e.message));let ans=['Mon bureau','Régie équipe'];p.on('dialog',d=>d.type()==='prompt'?d.accept(ans.shift()):d.accept());
await p.goto('http://localhost:8765/plano.html');await p.waitForTimeout(3000);
const st=()=>p.evaluate(()=>[document.documentElement.classList.contains('xshoot'),localStorage.getItem('xiii.ux.density'),JSON.parse(localStorage.getItem('xiii.anim.cfg')||'{}').st,localStorage.getItem('xiii.prof.cur')]);
console.log('départ',await st());
await p.evaluate(()=>{XPROF.open();document.querySelector('[data-save]').click()});await p.waitForTimeout(300);
await p.evaluate(()=>document.querySelector('[data-share]').click());await p.waitForTimeout(800);
console.log('listes',await p.evaluate(()=>[Object.keys(JSON.parse(localStorage.getItem('xiii.prof.list'))),Object.keys(XPCFG.get().profiles||{})]));
await p.screenshot({path:'/tmp/zz/prof.png'});
await Promise.all([p.waitForNavigation(),p.evaluate(()=>document.querySelector('[data-b=plateau]').click())]);await p.waitForTimeout(3000);
console.log('plateau',await st());
await Promise.all([p.waitForNavigation(),p.evaluate(()=>{XPROF.open();document.querySelector('[data-u="Mon bureau"]').click()})]);await p.waitForTimeout(3000);
console.log('retour',await st());
console.log(er);await b.close()})()
