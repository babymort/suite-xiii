const {chromium}=require('playwright');const fs=require('fs');
const pages=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});let tot=0;const out=[];
for(const f of pages){const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
try{await p.goto('http://localhost:8765/'+f+(f==='index.html'?'?desktop=1':'?desktop=1'),{timeout:20000});await p.waitForTimeout(2600);
const r=await p.evaluate(()=>{const RX=/[\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}️?/gu,PRES=/\p{Emoji_Presentation}|️|[\u{1F1E6}-\u{1F1FF}]/u;const C={};const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){const pe=n.parentElement;if(!pe||pe.closest('script,style,.xgl-e,textarea,.xgl-keep,option'))continue;const r=pe.getClientRects();if(!r.length)continue;const cs=getComputedStyle(pe);if(cs.visibility==='hidden')continue;
for(const m of n.nodeValue.matchAll(RX)){if(!PRES.test(m[0]))continue;const k=m[0].replace(/️/,'');C[k]=(C[k]||0)+1}}
const opt=[...document.querySelectorAll('option')].filter(o=>/\p{Emoji_Presentation}/u.test(o.textContent)).length;return {C,opt,xemo:document.querySelectorAll('.xemo').length}});
const n=Object.values(r.C).reduce((a,b)=>a+b,0);tot+=n;out.push([f,n,r.xemo,r.opt,Object.entries(r.C).map(x=>x[0]+(x[1]>1?'×'+x[1]:'')).join(' '),errs.length]);}catch(e){out.push([f,'ERR '+e.message.slice(0,60)])}
await p.close()}
out.forEach(o=>console.log(o.join(' | ')));console.log('TOTAL visibles en couleur :',tot);await b.close()})()
