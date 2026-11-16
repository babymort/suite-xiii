// RACCOURCIS SANS CONFLIT : raccourcis annoncés (info-bulles « (X) ») + raccourcis communs de la suite, par outil
const { chromium } = require('playwright'); const fs = require('fs');
const apps = Object.keys(JSON.parse(fs.readFileSync('/home/claude/xiii-src/versions.json'))).filter(a => fs.existsSync('/home/claude/suite-xiii/' + a + '.html'));
const BROWSER = /^Ctrl\+(T|W|N|Maj\+N|Maj\+T|Tab|Maj\+Tab|PageUp|PageDown)$/;
(async () => { const b = await chromium.launch(); const Q = apps.slice(), out = [];
 await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const a = Q.shift(); const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, a);
  const p = await ctx.newPage();
  try { await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(3000);
   const r = await p.evaluate(() => {
    const norm = k => k.replace(/\s*\+\s*|\s+/g, '+').replace(/Shift/g, 'Maj').replace(/⌘/g, 'Ctrl').replace(/^(.)$/, m => m.toUpperCase());
    const M = {}; const add = (k, lab, src) => { k = norm(k); (M[k] = M[k] || []).push([lab.trim().slice(0, 40), src]); };
    document.querySelectorAll('[title]').forEach(el => { if (el.closest('#xux-ov,#xst')) return; const t = el.getAttribute('title') || ''; const m = t.match(/\(((?:Ctrl|⌘|Maj|Shift|Alt|Suppr|Échap|Espace|Entrée|F\d+|[A-Z0-9?+←→↑↓])(?:[ +][^)]{0,18})?)\)\s*$/); if (!m) return; const lab = t.replace(m[0], '').split(/ : | — /)[0]; add(m[1], lab, 'outil'); });
    const G = (window.XKEYS && XKEYS.LIST) || []; G.forEach(x => String(x[0]).split(/\s*\/\s*/).forEach(k => add(k, x[1], 'suite')));
    return M; });
   const conf = [], brow = [];
   for (const [k, L] of Object.entries(r)) { const labs = [...new Set(L.map(x => x[0].toLowerCase().replace(/[^a-zà-ÿ0-9 ]/g, '').trim()))]; if (labs.length > 1) conf.push(k + ' → ' + [...new Set(L.map(x => x[0] + (x[1] === 'suite' ? ' [suite]' : '')))].join(' / ')); if (BROWSER.test(k)) brow.push(k + ' (' + L[0][0] + ')'); }
   out.push([a, Object.keys(r).length, conf, brow]);
  } catch (e) { out.push([a, 0, ['ERR ' + e.message.slice(0, 60)], []]); } await ctx.close(); } }));
 out.sort((x, y) => x[0].localeCompare(y[0])); let n = 0;
 out.forEach(([a, k, c, br]) => { n += c.length; if (c.length || br.length) console.log(a.padEnd(12), k + ' touches', c.length ? '\n   CONFLIT ' + c.join('\n   CONFLIT ') : '', br.length ? '\n   NAVIGATEUR ' + br.join(', ') : ''); });
 console.log('outils', out.length, '· conflits', n); await b.close(); })();
