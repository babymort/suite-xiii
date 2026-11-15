// ZÉRO ERREUR DANS LE JOURNAL : chaque page, vide puis avec l'exemple type — erreurs JS, console.error, fichiers introuvables (404), avertissements
const { chromium } = require('playwright'); const fs = require('fs');
const pages = process.argv.length > 2 ? process.argv.slice(2) : fs.readdirSync('/home/claude/suite-xiii').filter(f => /\.html$/.test(f) && f !== '404.html');
(async () => { const b = await chromium.launch(); const Q = pages.slice(), out = {};
 await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const pg = Q.shift(); const app = pg.replace('.html', ''); const R = { err: [], warn: [], nf: [] }; out[pg] = R;
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort('blockedbyclient'));
  await ctx.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); } catch (e) { } }, app);
  const p = await ctx.newPage();
  p.on('pageerror', e => R.err.push('JS ' + e.message.slice(0, 100)));
  p.on('console', m => { const t = m.text(); if (/ERR_BLOCKED_BY_CLIENT|net::ERR_|blockedbyclient/.test(t)) return; if (m.type() === 'error') R.err.push((/Failed to load resource/.test(t) ? '' : 'console ') + t.slice(0, 110)); else if (m.type() === 'warning') R.warn.push(t.slice(0, 110)); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith('http://localhost')) R.nf.push(r.status() + ' ' + r.url().replace('http://localhost:8765/', '').slice(0, 60)); });
  try { await p.goto('http://localhost:8765/' + pg + (/-m\.html$|equipe|team/.test(pg) ? '' : '?desktop=1'), { timeout: 30000 }); await p.waitForTimeout(3000);
   const ex = await p.evaluate(async a => { try { if (typeof XMODELS !== 'undefined' && XMODELS.adapters && XMODELS.adapters[a]) { await XMODELS.apply(a, 'fiction', false); return 1; } } catch (e) { return 'ERR ' + e.message; } return 0; }, app);
   if (ex === 1) { await p.reload(); await p.waitForTimeout(3000); }
  } catch (e) { R.err.push('CHARGEMENT ' + e.message.slice(0, 60)); }
  await ctx.close(); } }));
 fs.writeFileSync('/tmp/zz/console.json', JSON.stringify(out));
 let ne = 0, nw = 0, nn = 0; const lines = [];
 for (const pg of Object.keys(out).sort()) { const R = out[pg]; const e = [...new Set(R.err.filter(x => !/^Failed to load resource/.test(x)))], n = [...new Set(R.nf)], w = [...new Set(R.warn)]; ne += e.length; nn += n.length; nw += w.length; if (e.length || n.length || w.length) lines.push(pg.padEnd(20) + (e.length ? ' ERR: ' + e.slice(0, 3).join(' | ') : '') + (n.length ? ' 404: ' + n.slice(0, 4).join(', ') : '') + (w.length ? ' AVERT: ' + w.slice(0, 2).join(' | ') : '')); }
 console.log(lines.join('\n')); console.log('TOTAL pages', Object.keys(out).length, '· erreurs', ne, '· introuvables', nn, '· avertissements', nw); await b.close(); })();
