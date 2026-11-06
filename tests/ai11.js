// contexte détaillé : fiche projet + résumé de l'outil, sans noms ni coordonnées
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(); const out = {}, errs = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  for (const app of ['callsheeto', 'deviso', 'matos', 'planno', 'storyboardo', 'plano']) {
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(app + ': ' + e.message));
    await pg.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.aichat.rich', 'true'); localStorage.removeItem('xiii.aichat.noctx');
      const s = { active: 'pT', list: [{ id: 'pT', title: 'Les Ondes', genre: 'Documentaire', production: 'XIII Prod', debut: '2026-11-20', fin: '2026-11-22', duree: '52 min', lieu: 'Marseille', adresse: '12 rue Secrète', contact: 'Jean Dupont 0601020304', realisation: 'Marie Martin' }] }; localStorage.setItem('xiii.projets', JSON.stringify(s)); });
    await pg.goto('http://localhost:8765/' + app + '.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2000);
    const r = await pg.evaluate(async app => {
      if (app === 'callsheeto') { D().crew.push({ id: 'c1', dept: 'image', role: 'Chef opérateur', name: 'Paul Secret', phone: '0611223344', email: 'paul@x.fr' }); D().schedule.push({ id: 's1', ev: false, time: '09:00', seq: '4', ie: 'INT', desc: 'Atelier', roles: '', pages: '' }); }
      if (app === 'matos') PM.add('Sony FX6', 2, 'IMAGE', 'test');
      XAI.configured = () => true; let p = ''; XAI.ask = async (q) => { p = q; return 'ok'; };
      XAIC.open(); const box = document.querySelector('#xaic [data-rich]'); const ta = document.querySelector('#xaic textarea'); ta.value = 'résume'; document.querySelector('#xaic form').requestSubmit(); await new Promise(z => setTimeout(z, 400));
      const c = p.split('Contexte :')[1] || ''; return { box: !!box, checked: box && box.checked, fiche: /Fiche projet — Genre : Documentaire.*Tournage : 20\/11\/2026 → 22\/11\/2026/.test(c), tool: c.split('\n').slice(2).join(' ').slice(0, 160), leak: /Secrète|Dupont|0601|Marie Martin|Paul Secret|0611|paul@/.test(p), sys: /IDCC 2642/.test(p) };
    }, app);
    out[app] = r; await pg.close();
  }
  console.log(JSON.stringify(out, null, 1), 'ERR', errs.join('|')); await b.close();
})();
