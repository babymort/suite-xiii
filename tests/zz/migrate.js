// AUCUNE PERTE DE DONNÉES ENTRE DEUX SAISONS : même navigateur, même adresse — saison 5 publiée → beta saison 6
// node migrate.js fill|check app…   (serveur :8765 sur la version voulue)
const { chromium } = require('playwright'); const fs = require('fs');
const [mode, ...apps] = process.argv.slice(2); const DIR = '/tmp/zz/prof5';
const SNAP = () => (async () => { const L = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), v = localStorage.getItem(k) || ''; let h = 0; for (let j = 0; j < v.length; j += 3) h = (h * 31 + v.charCodeAt(j)) | 0; L[k] = [v.length, h]; }
  const D = {}; try { for (const d of await indexedDB.databases()) { const db = await new Promise(r => { const q = indexedDB.open(d.name); q.onsuccess = () => r(q.result); q.onerror = () => r(null); }); if (!db) continue; const o = {}; for (const s of db.objectStoreNames) { o[s] = await new Promise(r => { try { const q = db.transaction(s).objectStore(s).count(); q.onsuccess = () => r(q.result); q.onerror = () => r(-1); } catch (e) { r(-2); } }); } D[d.name] = o; db.close(); } } catch (e) { } return { L, D }; })();
(async () => { const ctx = await chromium.launchPersistentContext(DIR, { viewport: { width: 1440, height: 900 } });
 await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 const errs = {}; const p = await ctx.newPage(); p.on('dialog', d => d.accept().catch(() => { }));
 if (mode === 'fill') {
  await p.goto('http://localhost:8765/index.html?desktop=1'); await p.waitForTimeout(2500);
  await p.evaluate(() => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.projets', JSON.stringify({ list: [{ id: 'f1', title: 'Concert Khaled', ptype: 'concert', production: 'Yes We Do', debut: '2026-12-20', fin: '2026-12-22', lieu: 'Olympia' }], active: 'f1' })); });
  for (const a of apps) { p.removeAllListeners('pageerror'); p.on('pageerror', e => (errs[a] = errs[a] || []).push(e.message.slice(0, 80)));
   try { await p.goto('http://localhost:8765/' + a + '.html?desktop=1', { timeout: 30000 }); await p.waitForTimeout(2500);
    const r = await p.evaluate(async a => { try { if (typeof XMODELS === 'undefined' || !XMODELS.adapters || !XMODELS.adapters[a]) return 'sans exemple'; await XMODELS.apply(a, 'fiction', false); return 'exemple chargé'; } catch (e) { return 'ERR ' + e.message; } }, a);
    await p.waitForTimeout(2500); await p.keyboard.press('Control+s').catch(() => { }); await p.waitForTimeout(800); console.log('saison 5 ·', a, r); } catch (e) { console.log(a, 'ÉCHEC', e.message.slice(0, 60)); } }
  await p.goto('http://localhost:8765/index.html?desktop=1'); await p.waitForTimeout(1500);
  fs.writeFileSync('/tmp/zz/snap5.json', JSON.stringify(await p.evaluate(SNAP)));
 } else {
  await p.goto('http://localhost:8765/index.html?desktop=1'); await p.waitForTimeout(4000);
  const ui = {};
  for (const a of apps) { p.removeAllListeners('pageerror'); p.on('pageerror', e => (errs[a] = errs[a] || []).push(e.message.slice(0, 80)));
   try { await p.goto('http://localhost:8765/' + a + '.html?desktop=1', { timeout: 30000 }); await p.waitForTimeout(3500); ui[a] = await p.evaluate(() => /NUIT BLANCHE|court métrage|Léa|Concert Khaled/i.test(document.body.innerText)); } catch (e) { ui[a] = 'ÉCHEC'; } }
  await p.goto('http://localhost:8765/index.html?desktop=1'); await p.waitForTimeout(1500);
  const A = JSON.parse(fs.readFileSync('/tmp/zz/snap5.json')), B = await p.evaluate(SNAP);
  const gone = Object.keys(A.L).filter(k => !(k in B.L)), shrink = Object.keys(A.L).filter(k => k in B.L && B.L[k][0] < A.L[k][0] * 0.9 && A.L[k][0] > 200), changed = Object.keys(A.L).filter(k => k in B.L && B.L[k][1] !== A.L[k][1]);
  const dbl = []; for (const d in A.D) for (const s in A.D[d]) { const n0 = A.D[d][s], n1 = ((B.D[d] || {})[s]); if (n1 === undefined || n1 < n0) dbl.push(d + '/' + s + ' ' + n0 + '→' + n1); }
  console.log('clés saison 5 :', Object.keys(A.L).length, '· disparues :', gone.length, gone.slice(0, 10).join(', '));
  console.log('clés rétrécies (>10 %) :', shrink.length, shrink.slice(0, 10).map(k => k + ' ' + A.L[k][0] + '→' + B.L[k][0]).join(', '));
  console.log('clés modifiées (migrations) :', changed.length, changed.slice(0, 12).join(', '));
  console.log('bases IndexedDB :', Object.keys(A.D).length, '· enregistrements perdus :', dbl.length ? dbl.join(', ') : 'aucun');
  console.log('projet visible dans l\'outil :', Object.entries(ui).map(([a, v]) => a + (v === true ? '✓' : v === false ? '✗' : '?')).join(' '));
 }
 console.log('erreurs :', JSON.stringify(errs).slice(0, 400)); await ctx.close(); })();
