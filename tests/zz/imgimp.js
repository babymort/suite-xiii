// Imports d'images dans chaque outil, en ligne puis hors ligne : chaque champ fichier qui accepte une image reçoit une photo
const { chromium } = require('playwright'); const fs = require('fs');
const APPS = process.argv.slice(2);
(async () => { const b = await chromium.launch();
 for (const off of [false, true]) for (const app of APPS) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); } catch (e) { } }, app);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 90))); p.on('dialog', d => { errs.push('ALERTE: ' + d.message().slice(0, 60)); d.dismiss().catch(() => { }); });
  const res = [];
  try { await p.goto('http://localhost:8765/' + app + '.html?desktop=1'); await p.waitForTimeout(2600); if (off) await ctx.setOffline(true);
   const ins = await p.evaluate(() => [...document.querySelectorAll('input[type=file]')].map((e, i) => { e.dataset.xi = i; return { i, id: e.id, acc: e.accept || '', near: ((e.closest('label,button,div') || {}).textContent || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 30) }; }).filter(x => /image|\*/.test(x.acc) || x.acc === ''));
   for (const x of ins) { if (x.acc === '' && !/image|photo|fond|logo/i.test(x.near)) continue; const e0 = errs.length;
    const before = await p.evaluate(() => document.querySelectorAll('img').length + ':' + document.documentElement.outerHTML.length);
    try { await p.setInputFiles('[data-xi="' + x.i + '"]', '/tmp/zz/test_photo.jpg'); } catch (e) { res.push([x.id || x.near, 'pas rempli']); continue; }
    await p.waitForTimeout(1800); const after = await p.evaluate(() => document.querySelectorAll('img').length + ':' + document.documentElement.outerHTML.length).catch(() => 'nav');
    res.push([(x.id || x.near || '?').slice(0, 28), after === before ? 'rien' : 'ok', errs.slice(e0).join(' / ')]); await p.keyboard.press('Escape'); }
  } catch (e) { res.push(['FATAL', e.message.slice(0, 80)]); }
  console.log((off ? 'HORS LIGNE ' : 'en ligne   ') + app.padEnd(12), res.length ? res.map(r => r.filter(Boolean).join(':')).join(' | ') : '(aucun champ image au chargement)'); await ctx.close(); }
 await b.close(); })();
