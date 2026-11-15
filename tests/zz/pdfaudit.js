// AUDIT DES PDF : charte complète (logo en-tête + pied, texte d'en-tête, pied perso, mention), exemple type, tous les exports jsPDF → rendu PNG + chevauchements
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const F = n => fs.readFileSync(path.join(__dirname, 'fake', n), 'utf8');
const ANY = F('any.js'), LIBS = [[/jspdf/i, F('jspdf-cv.js')], [/xlsx/i, F('xlsx.js')], [/html2canvas|qrcode|jsQR|lz-string/i, F('misc.js')], [/pptxgen|jszip|pdf-lib/i, ANY], [/leaflet.*\.js/i, ANY + ';window.L=__any();'], [/\.css(\?|$)/i, '']];
const OUT = '/tmp/zz/pdfa'; fs.mkdirSync(OUT, { recursive: true });
const [ty, ...tools] = process.argv.slice(2); const REP = {};
const clean = pg => pg.evaluate(() => { document.querySelectorAll('#xt-root,#xtp,#xb-menu,#xnw-ov,#xpv-ov').forEach(m => m.remove()); try { if (typeof closeModal === 'function') closeModal(); } catch (e) { }
  document.querySelectorAll('[id$="-ov"],.modal-ov,.modal-overlay,.overlay').forEach(o => { const cs = getComputedStyle(o); if (cs.position === 'fixed' && cs.display !== 'none') o.remove(); }); }).catch(() => { });
async function run(b, tool) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('http://localhost')) return r.continue(); const m = LIBS.find(x => x[0].test(u)); if (m) return r.fulfill({ status: 200, contentType: /\.css/.test(u) ? 'text/css' : 'application/javascript', body: m[1] }); return r.abort(); });
  await ctx.addInitScript(t => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.errlog', 'off'); localStorage.setItem('xiii.pdf.preview', '0'); localStorage.setItem('xiii.tour2.' + t + '.hide', '1'); } catch (e) { } window.print = () => { window.__printed = (window.__printed || 0) + 1; }; }, tool);
  const pg = await ctx.newPage(); const E = []; pg.on('pageerror', e => E.push(e.message.slice(0, 160))); pg.on('dialog', d => d.accept().catch(() => { }));
  pg.on('download', d => d.cancel().catch(() => { }));
  await pg.goto('http://localhost:8765/' + tool + '.html?desktop=1'); await pg.waitForTimeout(2500); await clean(pg);
  const ok = await pg.evaluate(async ([t, ty]) => { try { if (!window.XMODELS || !XMODELS.adapters[t]) return 'pas d’exemple'; await XMODELS.apply(t, ty, false); return 'ok'; } catch (e) { return 'ERR ' + e.message; } }, [tool, ty]).catch(e => 'ERR ' + e.message);
  // charte complète
  await pg.evaluate(() => { const cv = document.createElement('canvas'); cv.width = 300; cv.height = 120; const x = cv.getContext('2d'); x.fillStyle = '#1d4ed8'; x.fillRect(0, 0, 300, 120); x.fillStyle = '#fff'; x.font = 'bold 56px Arial'; x.fillText('LOGO', 70, 82);
    const c = Object.assign(JSON.parse(localStorage.getItem('xiii.charte') || '{}'), { on: true, color: '#c2410c', logo: cv.toDataURL('image/png'), lw: 300, lh: 120, useLogo: true, logoPos: 'both', logoSize: 'm', head: 'band', headText: 'title-sub', title: 'Concert Khaled', sub: 'Yes We Do', mention: 'CONFIDENTIEL', foot: true, footLine: true, footLeft: 'custom', footCustom: 'Yes We Do Productions — 01 23 45 67 89', num: 'page', date: true, version: 'V2', off: {} });
    localStorage.setItem('xiii.charte', JSON.stringify(c)); });
  await pg.goto('http://localhost:8765/' + tool + '.html?desktop=1'); await pg.waitForTimeout(3000); await clean(pg);
  // exports : boutons du groupe fichier + menu Exporter
  const L = await pg.evaluate(() => { const ico = b => ((b.querySelector('.btn-icon') || {}).textContent || b.textContent || '').trim();
    const hold = [...document.querySelectorAll('#xb-hold button')], z = [...document.querySelectorAll('#xb-file button')].filter(b => !/^(xgt-btn|xb-exp|xf-btn|xsh-btn|xpb-btn)$/.test(b.id) && !/💾|📂|⬇️/.test(ico(b)) && !b.dataset.xgtHid);
    const all = hold.concat(z).filter((b, i, a) => a.indexOf(b) === i); all.forEach((b, i) => b.dataset.zp = 'e' + i);
    const sel = document.getElementById('export-format'); return { btns: all.map(b => [b.dataset.zp, (b.title || b.textContent).trim().slice(0, 40)]), opts: sel ? [...sel.options].map(o => o.value) : [] }; });
  const handle = async () => { await pg.waitForTimeout(800); const c = await pg.evaluate(() => { const ovs = [...document.querySelectorAll('body > *')].filter(o => { const cs = getComputedStyle(o); return cs.position === 'fixed' && cs.display !== 'none' && o.offsetHeight > 120 && !/^(xb-master|xaic|xt-tab|xs-gear|xzz|toast)/.test(o.id) && o.querySelector('button'); }); const o = ovs.pop(); if (!o) return '';
      const b = [...o.querySelectorAll('button')].find(x => /(Télécharger|Exporter|Générer|Créer|PDF|Imprimer|Valider|OK$)/i.test(x.textContent) && !/annuler|fermer|vider|supprimer|excel|csv|word|powerpoint/i.test(x.textContent) && x.offsetParent); if (b) { b.click(); return b.textContent.trim(); } return ''; }).catch(() => ''); if (c) await pg.waitForTimeout(1500); await clean(pg); };
  for (const [id] of L.btns) { await pg.evaluate(i => { const b = document.querySelector('[data-zp="' + i + '"]'); if (b) b.click(); }, id).catch(() => { }); await handle(); }
  for (const v of L.opts) { await pg.evaluate(v => { const s = document.getElementById('export-format'); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); const r = [...s.parentElement.querySelectorAll('button')].find(b => /🖼️|Créer|PDF/.test(b.textContent + b.title)); if (r) r.click(); }, v).catch(() => { }); await handle(); }
  // menu ⬇️ Exporter : chaque entrée PDF
  const menu = await pg.evaluate(async () => { const b = document.getElementById('xtop-exp') || document.getElementById('xb-exp'); if (!b) return []; b.click(); await new Promise(r => setTimeout(r, 300)); const m = document.querySelector('#xb-menu,#xtop-menu,.xexp-menu'); if (!m) return []; const it = [...m.querySelectorAll('button,a,[role=menuitem]')].filter(x => /pdf|imprim|fiche|feuille|plan|rapport|export/i.test(x.textContent) && !/excel|csv|xlsx|json|word|pptx|powerpoint|png|svg/i.test(x.textContent)); it.forEach((x, i) => x.dataset.zm = i); return it.map(x => x.textContent.trim().slice(0, 40)); }).catch(() => []);
  await clean(pg);
  for (let i = 0; i < menu.length; i++) { await pg.evaluate(async i => { const b = document.getElementById('xtop-exp') || document.getElementById('xb-exp'); b.click(); await new Promise(r => setTimeout(r, 300)); const x = document.querySelector('[data-zm="' + i + '"]'); if (x) x.click(); }, i).catch(() => { }); await handle(); }
  const n = await pg.evaluate(() => (window.__pdfDocs || []).length);
  const R = { ok, btns: L.btns.map(x => x[1]), menu, docs: [], E, missing: await pg.evaluate(() => Object.keys(window.__pdfMissing || {})) };
  const seen = new Set();
  for (let i = 0; i < n; i++) {
    const pages = await pg.evaluate(i => window.__pdfRender(i), i).catch(e => { R.E.push('render ' + e.message); return []; });
    const name = await pg.evaluate(i => window.__pdfDocs[i].n, i); const sig = name + pages.length + (pages[0] ? pages[0].boxes.length : 0); if (seen.has(sig)) continue; seen.add(sig);
    const doc = { name, pages: pages.length, issues: [] };
    pages.forEach((p, k) => { const f = path.join(OUT, tool + '_' + i + '_p' + (k + 1) + '.png'); if (k < 4) fs.writeFileSync(f, Buffer.from(p.png.split(',')[1], 'base64'));
      const B = p.boxes, area = b => b.w * b.h, inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      const big = b => b.k === 'img' && area(b) > .35 * p.W * p.H;
      for (let a = 0; a < B.length; a++) for (let c = a + 1; c < B.length; c++) { const A = B[a], C = B[c]; if (!(A.stamp || C.stamp) && (big(A) || big(C))) continue; if (A.a < .5 || C.a < .5) continue; const I = inter(A, C); if (I <= 0) continue; const sm = Math.min(area(A), area(C)); if (I / sm < (A.stamp || C.stamp ? .02 : .25)) continue;
        doc.issues.push('p' + (k + 1) + ' ' + (A.stamp || C.stamp ? '[HABILLAGE] ' : '') + (A.k === 'img' ? 'image' : '« ' + A.t + ' »') + ' × ' + (C.k === 'img' ? 'image' : '« ' + C.t + ' »') + ' (' + Math.round(I / sm * 100) + '%)'); }
      const T = B.filter(b => b.k === 'text' && b.a >= .5); for (let a = 0; a < T.length; a++) for (let c = 0; c < T.length; c++) { if (a === c) continue; const A = T[a], C = T[c]; const vo = Math.min(A.y + A.h, C.y + C.h) - Math.max(A.y, C.y); if (vo < .5 * Math.min(A.h, C.h)) continue; const g = C.x - (A.x + A.w); if (g > -.05 && g < .5 && Math.abs(A.h - C.h) > .3) doc.issues.push('p' + (k + 1) + ' collés « ' + A.t + ' » | « ' + C.t + ' »'); }
      B.forEach(b => { if (b.k === 'text' && b.a >= .5 && (b.x < -.5 || b.x + b.w > p.W + .5 || b.y < -.5 || b.y + b.h > p.H + .5)) doc.issues.push('p' + (k + 1) + ' hors page « ' + b.t + ' »'); });
      if (!B.some(b => b.stamp && b.k === 'img')) doc.issues.push('p' + (k + 1) + ' aucun logo placé'); });
    doc.issues = [...new Set(doc.issues)]; R.docs.push(doc);
  }
  REP[tool] = R; await ctx.close();
}
(async () => { const b = await chromium.launch(); const Q = tools.slice(); await Promise.all([0, 1, 2].map(async () => { while (Q.length) { const t = Q.shift(); try { await run(b, t); } catch (e) { REP[t] = { err: e.message.slice(0, 200) }; } } }));
  fs.writeFileSync(path.join(OUT, 'rep-' + ty + '.json'), JSON.stringify(REP, null, 1)); await b.close();
  for (const t in REP) { const r = REP[t]; console.log('■ ' + t + ' ' + (r.err || r.ok) + ' · boutons ' + (r.btns || []).length + ' menu ' + (r.menu || []).length + ' · ' + (r.docs || []).length + ' PDF' + (r.E && r.E.length ? ' · ERR ' + r.E.slice(0, 3).join(' | ') : '') + (r.missing && r.missing.length ? ' · manque ' + r.missing.join(',') : '')); (r.docs || []).forEach(d => console.log('   ' + d.name + ' (' + d.pages + ' p) ' + (d.issues.length ? '\n      ' + d.issues.slice(0, 12).join('\n      ') + (d.issues.length > 12 ? '\n      … +' + (d.issues.length - 12) : '') : '✓'))); }
})();
