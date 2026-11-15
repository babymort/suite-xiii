const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:850}});
await p.goto('http://localhost:8765/'+(process.argv[2]||'index.html'));await p.waitForTimeout(3500);await p.evaluate(()=>{const x=document.getElementById('xnw-ov');if(x)x.remove()});
const r=await p.evaluate(()=>{const all=[...document.querySelectorAll('button,a')].filter(b=>/Démarrer/.test(b.textContent)&&b.offsetWidth);return all.map(b=>b.id+'|'+b.className)});console.log(r);
await p.click('text=Démarrer');await p.waitForTimeout(600);
console.log(await p.evaluate(()=>{const h=[...document.querySelectorAll('*')].find(e=>e.children.length==0&&/^en ligne$/i.test(e.textContent.trim())&&e.offsetWidth);if(!h)return 'none';let g=h.parentElement;while(g&&g.querySelectorAll('button').length<4)g=g.parentElement;return g.id+' '+g.className+'\n'+[...g.querySelectorAll('button')].map(b=>(b.id||'-')+' ['+b.className+'] '+b.textContent.trim()+' oc:'+(b.dataset.src||b.dataset.for||b.getAttribute('data-k')||'')).join('\n')}));
await b.close()})()
