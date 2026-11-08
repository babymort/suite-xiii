const {chromium}=require('playwright');const apps='casto deviso graphico lumo matos moodo packingo posto repero scripto sono transporto soustitro encodo syno storyboardo runo ressourco'.split(' ');
(async()=>{const b=await chromium.launch();const Q=apps.slice();await Promise.all([0,1,2].map(async()=>{while(Q.length){const a=Q.shift();const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();await p.addInitScript(a=>{localStorage.setItem('xiii.tour2.'+a+'.hide','1');localStorage.setItem('xiii.tips.off','1')},a);await p.goto('http://localhost:8765/'+a+'.html');await p.waitForTimeout(5000);await p.keyboard.press('Escape');await p.evaluate(()=>{try{closeModal()}catch(e){}});
const r=await p.evaluate(()=>{const tb=document.getElementById('toolbar').getBoundingClientRect().bottom;const B=[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return b.offsetWidth&&r.top>tb+20&&!b.closest('#top-bar,#toolbar,[role=dialog],#xs-gear,#xt-tab,#xoff,#xau-ban')});if(!B.length)return 'aucun bouton';
// ancêtre commun des 3 premiers
let anc=B[0];const S=B.slice(0,Math.min(3,B.length));while(anc&&!S.every(x=>anc.contains(x)))anc=anc.parentElement;
const d=e=>e?(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className=='string'&&e.className?'.'+e.className.trim().split(/\s+/).join('.'):'')):'-';
const card=anc.closest('[class*=empty],[id*=empty],[class*=welcome],[class*=hero],[class*=start]')||anc;
const h=card.querySelector('h1,h2,h3,h4,b,strong');return d(anc)+' | carte '+d(card)+' | titre '+(h?h.textContent.trim().slice(0,40):'-')+' | parent '+d(card.parentElement)});
console.log(a.padEnd(12),r);await c.close()}}));await b.close()})();
