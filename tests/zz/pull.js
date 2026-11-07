// côté cible : existe-t-il un bouton « Importer / Reprendre / Depuis <source> » ?
const { chromium } = require('playwright'); const L = process.argv.slice(2).map(x => x.split('>'));
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort()); const out = {};
  const by = {}; L.forEach(([f, t]) => (by[t] = by[t] || []).push(f));
  for (const t of Object.keys(by)) { const pg = await ctx.newPage(); await pg.goto('http://localhost:8765/' + (t === 'planno' ? 'calendrier.html?v=prod&desktop=1' : t + '.html?desktop=1')); await pg.waitForTimeout(2500);
    const r = await pg.evaluate(F => { const T = XLINKS.T; const res = {}; F.forEach(f => { const nm = T[f] ? T[f][1] : f.toUpperCase(); const rx = new RegExp(nm.replace(/ /g, '\\s?'), 'i');
      const B = [...document.querySelectorAll('button,[role=button],a')].filter(b => { const s = (b.title || '') + ' ' + (b.textContent || ''); return rx.test(s) && /(depuis|import|reprendre|charger|récupérer|lire|reçu|recevoir)/i.test(s); });
      res[f] = B.slice(0, 3).map(b => (b.id || '') + ' « ' + ((b.title || b.textContent).trim().replace(/\s+/g, ' ').slice(0, 70)) + ' »'); }); return res; }, by[t]);
    out[t] = r; await pg.close(); }
  console.log(JSON.stringify(out, null, 1)); await b.close(); })();
