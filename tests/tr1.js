// 🌐 traduction d'un PDF de la suite (faux jsPDF, IA simulée)
const { chromium } = require('playwright'); const fs = require('fs'); const OUT = process.argv[2];
const FAKE = fs.readFileSync(__dirname + '/fake/jspdf.js', 'utf8');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } }); const pg = await ctx.newPage(); const errs = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (/jspdf/.test(u)) return r.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE }); if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  pg.on('pageerror', e => errs.push(e.message)); await pg.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); if (window.top !== window) return; localStorage.removeItem('xiii.pdf.preview'); localStorage.removeItem('xiii.trad.en'); });
  await pg.goto('http://localhost:8765/callsheeto.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2500);
  await pg.evaluate(() => { document.querySelectorAll('#xt-root,#modal-ov').forEach(m => m.remove()); window.__asks = 0;
    XAI.configured = () => true; XAI.ask = async p => { window.__asks++; window.__lastP = p.slice(p.lastIndexOf('\n\n') + 2); const L = JSON.parse(p.slice(p.lastIndexOf('\n\n') + 2)); return JSON.stringify({ t: L.map(s => s.replace(/Feuille de service/g, 'Call sheet').replace(/Convocation générale/g, 'General call').replace(/Prêt à tourner/g, 'Ready to shoot').replace(/Repas/g, 'Lunch').replace(/Une longue consigne de sécurité à respecter sur le plateau/, 'A long safety instruction to follow on set')) }); };
    // bouton d'export de test : un PDF typique (titre, libellés, texte coupé, nom propre, heure)
    const bt = document.createElement('button'); bt.id = 'tst-pdf'; bt.textContent = 'PDF'; document.body.appendChild(bt);
    bt.onclick = () => { const doc = new window.jspdf.jsPDF(); doc.text('Feuille de service', 10, 10); doc.text(['Convocation générale', '08:00'], 10, 20); doc.text('Prêt à tourner', 10, 30); doc.text('Paul Martin', 10, 40);
      doc.text(doc.splitTextToSize('Une longue consigne de sécurité à respecter sur le plateau', 50), 10, 50); doc.text('Repas', 10, 60); doc.save('feuille.pdf'); }; });
  await pg.evaluate(() => document.getElementById('tst-pdf').click()); await pg.waitForTimeout(500);
  const pv = await pg.evaluate(() => ({ preview: !!document.getElementById('xpv-ov'), sel: !!document.getElementById('xtr-sel') }));
  await pg.screenshot({ path: OUT + '/tr1_pv.png' });
  await pg.selectOption('#xtr-sel', 'en'); await pg.waitForTimeout(1500);
  const pv2 = await pg.evaluate(() => ({ preview: !!document.getElementById('xpv-ov'), asks: window.__asks, saved: (window.__saved || []).length, state: XTRAD._state() }));
  // téléchargement depuis l'aperçu traduit
  await pg.evaluate(() => { const d = document.querySelector('#xpv-ov #xpv-dl'); if (d) d.click(); }); await pg.waitForTimeout(300);
  const r = await pg.evaluate(() => ({ saved: window.__saved.map(s => s.texts) }));
  // 2e export : traductions mémorisées → pas de nouvel appel
  await pg.evaluate(() => document.getElementById('tst-pdf').click()); await pg.waitForTimeout(400); await pg.selectOption('#xtr-sel', 'en'); await pg.waitForTimeout(1200);
  const asks2 = await pg.evaluate(() => [window.__asks, localStorage.getItem('xiii.trad.en'), window.__lastP]);
  console.log(JSON.stringify({ pv, pv2, r, asks2 }, null, 1), 'ERR', errs.join('|')); await b.close();
})();
