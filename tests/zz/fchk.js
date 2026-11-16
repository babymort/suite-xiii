const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); for (const a of process.argv.slice(2)) { const ctx = await b.newContext(); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 await ctx.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, a);
 const p = await ctx.newPage(); await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(2500);
 const r = await p.evaluate(() => { try { if (typeof XBook !== 'undefined') XBook.open({}); } catch (e) { } const i = document.getElementById('xb-cfile'); const d = {}; document.querySelectorAll('[id]').forEach(e => d[e.id] = (d[e.id] || 0) + 1); return { inp: !!i, dup: Object.entries(d).filter(x => x[1] > 1).map(x => x[0] + '×' + x[1]).slice(0, 8) }; });
 let fc = false; if (r.inp) { p.once('filechooser', () => fc = true); await p.evaluate(() => document.getElementById('xb-cfile').click()); await p.waitForTimeout(500); }
 console.log(a.padEnd(12), 'import contacts :', r.inp ? (fc ? 'ouvre le choix de fichier' : 'NE S\'OUVRE PAS') : '—', '· identifiants en double :', r.dup.join(' ') || 'aucun'); await ctx.close(); } await b.close(); })();
