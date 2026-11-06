// CALL SHEETO : feuille préremplie par l'IA (IA simulée), plan de travail DECOUP lu
const { chromium } = require('playwright'); const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } }); const pg = await ctx.newPage(); const errs = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  pg.on('pageerror', e => errs.push(e.message)); await pg.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.callsheeto.hide', '1'); });
  await pg.goto('http://localhost:8765/callsheeto.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1800);
  const r0 = await pg.evaluate(() => { document.querySelectorAll('#xt-root').forEach(m => m.remove()); try { closeModal(); } catch (e) { } const mo = document.getElementById('modal-ov'); if (mo) mo.remove(); const d = D();
    localStorage.setItem('decoupXIII.project', JSON.stringify({ breakdown: { scenes: [{ id: 'a', num: '12', ie: 'INT', decor: 'CUISINE', effet: 'Nuit', eighths: 10, chars: ['LÉA'], el: { acc: ['tasse'] } }, { id: 'b', num: '14', ie: 'EXT', decor: 'RUE', effet: 'Jour', eighths: 6, chars: ['MARC'], el: {} }], plan: { days: [{ date: d.date, ids: ['a', 'b'] }] } } }));
    d.crew.push({ id: 'c1', dept: 'image', role: 'Chef opérateur', name: 'Paul Secret', phone: '0611' }); if (!d.locations.length) d.locations.push({ id: 'l1', type: 'decor', name: 'Appartement', address: '1 rue Cachée', access: '' }); else d.locations[0].access = ''; const ln = d.locations[0].name;
    window.__ln = ln; XAI.configured = () => true;
    XAI.ask = async p => { window.__p = p; return JSON.stringify({ horaires: { general: '7h30', pat: '08:45', repas: '13:30', fin: '25:00' }, deroule: [{ heure: '08:45', type: 'seq', seq: '12', ie: 'INT', desc: 'Cuisine — Léa', roles: 'Léa' }, { heure: '13:30', type: 'event', desc: 'repas' }],
      risques: ['nuit', 'zz', 'elec'], securite: 'Câbles balisés dans la cage d’escalier.', pratique: 'Parking rue voisine, cantine sur place.', mot: 'Merci à tous !', acces: [{ lieu: ln, texte: 'Code 1234B, 3e étage sans ascenseur' }, { lieu: 'Inconnu', texte: 'x' }], alertes: ['Séquence de nuit prévue en journée : vérifier'] }); };
    return { btn: !!document.getElementById('xcsai-btn'), before: { t: JSON.stringify(d.times), n: d.schedule.length, r: d.safety.risks.slice() } }; });
  await pg.evaluate(() => document.getElementById('xcsai-btn').click()); await pg.waitForTimeout(300); await pg.evaluate(() => document.getElementById('xcsai-go').click()); await pg.waitForTimeout(500);
  await pg.screenshot({ path: OUT + '/cs1.png' });
  const r1 = await pg.evaluate(() => ({ seqs: /Séq\. 12 INT · CUISINE · Nuit · 10\/8 · rôles : LÉA · acc: tasse/.test(window.__p), noLeak: !/Paul Secret|0611|rue Cachée/.test(window.__p), boxes: document.querySelectorAll('#xcsai [data-g]').length }));
  await pg.evaluate(() => document.getElementById('xcsai-ok').click()); await pg.waitForTimeout(400);
  const r2 = await pg.evaluate(() => { const d = D(); return { times: d.times, sched: d.schedule.slice(-2).map(x => x.time + '|' + (x.ev ? 'EV ' + x.desc : x.seq + ' ' + x.ie)), risks: d.safety.risks, sec: d.safety.notes, prat: d.practical, notes: d.notes, acc: d.locations[0].access }; });
  console.log(JSON.stringify({ r0, r1, r2 }, null, 1), 'ERR', errs.join('|')); await b.close();
})();
