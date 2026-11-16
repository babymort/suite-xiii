// LES OUTILS SE PARLENT : chaque passerelle (XPASS.R) dépose un paquet dans la boîte de l'outil cible puis ouvre cible.html ; la page d'arrivée lit-elle bien cette boîte ?
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext(); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 await ctx.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); });
 const p = await ctx.newPage(); await p.goto('http://localhost:8765/syno.html?desktop=1'); await p.waitForTimeout(2500);
 const K = await p.evaluate(() => Object.keys(XPASS.R).filter(k => k.includes('>'))); const T = [...new Set(K.map(k => k.split('>')[1]))];
 for (const t of T) { await p.goto('http://localhost:8765/' + t + '.html'); await p.waitForTimeout(2500);
  const app = await p.evaluate(() => window.XIII_APP || '?'); const ks = K.filter(k => k.endsWith('>' + t));
  console.log(t.padEnd(12), '→ page d\'arrivée : ' + p.url().replace('http://localhost:8765/', '').padEnd(28) + ' XIII_APP=' + app + (app !== t ? '   ⚠️ PAQUETS PERDUS : ' + ks.join(', ') : '   ok (' + ks.length + ')')); }
 await b.close(); })();
