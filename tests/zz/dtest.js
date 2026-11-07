// → DOSSIER : le document arrive (IndexedDB de DOSSIER), et le renvoyer remplace l'ancienne version (pas de doublon)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const F = n => fs.readFileSync(path.join(__dirname, 'fake', n), 'utf8');
const LIBS = [[/jspdf/i, F('jspdf.js')], [/xlsx/i, F('xlsx.js')], [/html2canvas|qrcode|jsQR|lz-string/i, F('misc.js')]];
(async () => { const b = await chromium.launch(); const R = {};
  for (const src of process.argv.slice(2)) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const E = [];
    await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('http://localhost')) return r.continue(); const m = LIBS.find(x => x[0].test(u)); if (m) return r.fulfill({ status: 200, contentType: 'application/javascript', body: m[1] }); return r.abort(); });
    await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } window.open = u => { window.__op = (window.__op || []).concat([String(u)]); return { document: { write() { }, close() { } }, close() { }, focus() { } }; }; });
    const count = async pg => pg.evaluate(() => new Promise(res => { const q = indexedDB.open('dossierXIII'); q.onsuccess = () => { const db = q.result, S = [...db.objectStoreNames]; if (!S.length) { db.close(); return res({}); } const t = db.transaction(S, 'readonly'), o = {}; let n = S.length; S.forEach(s => { const c = t.objectStore(s).count(); c.onsuccess = () => { o[s] = c.result; if (!--n) { db.close(); res(o); } }; }); }; q.onerror = () => res({ err: 1 }); }));
    const pg = await ctx.newPage(); pg.on('pageerror', e => E.push(e.message.slice(0, 120))); pg.on('dialog', d => d.accept());
    await pg.goto('http://localhost:8766/' + src + '.html?desktop=1'); await pg.waitForTimeout(2600);
    await pg.evaluate(async s => { try { await XMODELS.apply(s, 'tv', false); } catch (e) { } }, src); await pg.reload(); await pg.waitForTimeout(2600);
    { const d = await ctx.newPage(); await d.goto('http://localhost:8766/dossier.html?desktop=1'); await d.waitForTimeout(2800); await d.evaluate(() => { const c = [...document.querySelectorAll('button,div,[role=button]')].find(x => /^\s*📺\s*Dossier de production TV/.test(x.textContent) && x.children.length < 6); if (c) c.click(); }); await d.waitForTimeout(1500); R['_init_' + src] = await count(d); await d.close(); }
    const rounds = [];
    for (let i = 0; i < 2; i++) {
      await pg.evaluate(() => { window.__op = []; document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()); XGATE.go('dossier'); }); await pg.waitForTimeout(900);
      await pg.evaluate(() => { const b = document.getElementById('xs-send'); if (b) b.click(); }); await pg.waitForTimeout(2500);
      const op = await pg.evaluate(() => window.__op || []); const st = await pg.evaluate(() => (document.getElementById('xs-st') || {}).textContent || '');
      const d = await ctx.newPage(); d.on('pageerror', e => E.push('DOSSIER ' + e.message.slice(0, 120))); d.on('dialog', x => x.accept());
      await d.goto('http://localhost:8766/' + (op[0] || 'dossier.html') + (op[0] && op[0].includes('?') ? '' : '')); await d.waitForTimeout(3500); if (i === 0) { await d.screenshot({ path: '/tmp/zz/dossier_in_' + src + '.png' }); R['_btn_' + src] = await d.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.textContent.trim().slice(0, 25)).slice(-25)); }
      const clk = await d.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(b => b.offsetParent && /(ranger|classer|valider|ajouter|ok$|importer|accepter)/i.test(b.textContent) && b.closest('[class*=modal],[id$=-ov],[role=dialog]')); if (B[0]) { B[0].click(); return B[0].textContent.trim().slice(0, 30); } return ''; }); await d.waitForTimeout(1500);
      rounds.push({ op: op.slice(0, 1), st: st.slice(0, 80), clk, idb: await count(d) }); await d.close(); }
    R[src] = { rounds, E }; await ctx.close(); }
  console.log(JSON.stringify(R, null, 1)); await b.close(); })();
