// ZÉRO PLANTAGE (1) : données abîmées — chaque clé du stockage remplacée par une valeur invalide, l'outil doit encore s'ouvrir
const { chromium } = require('playwright');
const apps = process.argv.slice(2);
const BAD = ['{', 'null', '[]', '"x"', '42', '{"a":'];
(async () => { const b = await chromium.launch(); const Q = apps.slice(), out = [];
 await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const a = Q.shift(); const res = { keys: 0, bad: [] };
  for (const v of BAD) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
   await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
   const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 90))); p.on('dialog', d => d.dismiss().catch(() => { }));
   try { await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(2500);
    // première visite : l'outil crée ses clés ; on les abîme toutes
    const n = await p.evaluate(v => { const K = Object.keys(localStorage).filter(k => !/tips\.off|tour2/.test(k)); K.forEach(k => localStorage.setItem(k, v)); localStorage.setItem('xiii.tips.off', 'true'); return K.length; }, v);
    res.keys = Math.max(res.keys, n); errs.length = 0;
    await p.reload(); await p.waitForTimeout(3000);
    const ok = await p.evaluate(() => { const c = document.getElementById('xboot'); const curtain = c && getComputedStyle(c).display !== 'none' && getComputedStyle(c).opacity > 0.5; const bar = document.querySelector('#top-bar,header,#xh-top,.xh,#bar,#xh-nav,main'); return { curtain: !!curtain, bar: !!bar && bar.getClientRects().length > 0, body: document.body.innerText.length }; });
    if (errs.length || ok.curtain || !ok.bar) res.bad.push('valeur ' + v + ' → ' + (ok.curtain ? 'rideau bloqué · ' : '') + (!ok.bar ? 'pas de barre · ' : '') + [...new Set(errs)].slice(0, 3).join(' | '));
   } catch (e) { res.bad.push('valeur ' + v + ' → ' + e.message.slice(0, 80)); }
   await ctx.close(); }
  out.push([a, res]); } }));
 out.sort((x, y) => x[0].localeCompare(y[0])); let nb = 0;
 for (const [a, r] of out) { if (r.bad.length) { nb++; console.log(a.padEnd(12), r.keys + ' clés\n   ' + r.bad.join('\n   ')); } }
 console.log('outils testés :', out.length, '· en défaut :', nb); await b.close(); })();
