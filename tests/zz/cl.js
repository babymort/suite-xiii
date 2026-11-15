const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});const c=await b.newContext({viewport:{width:1440,height:900}});await c.grantPermissions(['camera'],{origin:'http://localhost:8765'});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/cadro.html?desktop=1#live');await p.waitForTimeout(3500);
console.log('ouvert',await p.evaluate(()=>[!!document.getElementById('xcl'),!!document.getElementById('xcl-btn'),[...document.querySelectorAll('#xcl [data-dev] option')].map(o=>o.textContent)]));
await p.evaluate(()=>document.querySelector('#xcl [data-go2]').click());await p.waitForTimeout(2500);
console.log('mire',await p.evaluate(()=>document.querySelector('#xcl [data-st]').textContent));
await p.screenshot({path:'/tmp/zz/cl1.png'});
await p.evaluate(()=>{const s=document.querySelector('#xcl [data-dev]');s.value=s.options[1].value;s.dispatchEvent(new Event('change'))});
await p.evaluate(()=>{const s=document.querySelector('#xcl [data-res]');s.value='1280x720';s.dispatchEvent(new Event('change'))});await p.waitForTimeout(2500);
console.log('caméra',await p.evaluate(()=>JSON.stringify(XCLIVE.stream().getVideoTracks()[0].getSettings().width)+localStorage.getItem('xiii.cadro.live')+document.querySelector('#xcl [data-st]').textContent+' | '+document.querySelector('#xcl [data-err]').textContent));
await p.screenshot({path:'/tmp/zz/cl2.png'});
await p.keyboard.press('Escape');await p.waitForTimeout(200);console.log('fermé',await p.evaluate(()=>!document.getElementById('xcl')));
console.log(er);await b.close()})()
