// actions IA : CALL SHEETO (déroulé), MATOS (matériel), DEVISO (lignes) — IA simulée
const { chromium } = require('playwright'); const OUT = process.argv[2];
const R = {
  callsheeto: { items: [{ heure: '8h00', type: 'event', desc: 'Prêt à tourner' }, { heure: '08:30', type: 'seq', seq: '12', ie: 'int', desc: 'Cuisine — dispute', roles: 'Léa, Marc', pages: '1 2/8' }, { heure: '12:30', type: 'event', desc: 'repas' }, { heure: '14:00', type: 'seq', seq: '14', ie: 'Ext', desc: 'Rue — départ' }] },
  matos: { items: [{ nom: 'Sony FX6', qte: 2, groupe: 'IMAGE' }, { nom: 'Micro HF Sennheiser EW 500', qte: 3, groupe: 'son' }, { nom: 'Gaffer noir', qte: 4 }, { nom: 'SkyPanel S60', qte: 2, groupe: 'XX' }] },
  deviso: { items: [{ type: 'materiel', nom: 'Sony FX6', cat: 'cam', qte: 2, jours: 3 }, { type: 'equipe', nom: 'Chef op', poste: 'chefop', qte: 1, jours: 3 }, { type: 'equipe', poste: 'inconnu', nom: 'Régisseur' }, { type: 'frais', nom: 'Repas équipe', qte: 12, prix: 18 }] }
};
(async () => {
  const b = await chromium.launch(); const out = {}, errs = [];
  for (const app of Object.keys(R)) {
    const pg = await b.newPage({ viewport: { width: 1500, height: 950 } }); pg.on('pageerror', e => errs.push(app + ': ' + e.message));
    await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } });
    await pg.goto('http://localhost:8765/' + app + '.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2200);
    await pg.evaluate(r => { document.querySelectorAll('#xt-root').forEach(m => m.remove()); XAI.configured = () => true; XAI.canSee = () => true; XAI.label = () => 'simulé'; XAI.ask = async p => { window.__p = p; return JSON.stringify(r); }; XAIC.mount(); }, R[app]);
    const before = await pg.evaluate(app => app === 'callsheeto' ? D().schedule.length : app === 'matos' ? PM.cur().items.length : (V().eq.length + V().crew.length + V().fees.length), app);
    await pg.evaluate(() => XAIC.open()); await pg.waitForTimeout(400);
    await pg.fill('#xaic textarea', 'journée du 12, deux séquences'); await pg.click('#xaic [data-act]'); await pg.waitForTimeout(700);
    const nprop = await pg.evaluate(() => document.querySelectorAll('#xaic-prop input[type=checkbox]').length);
    await pg.screenshot({ path: OUT + '/ai7_' + app + '.png' });
    await pg.click('#xaic-prop [data-ok]'); await pg.waitForTimeout(500);
    out[app] = await pg.evaluate(([app, before]) => { const last = [...document.querySelectorAll('#xaic .m.a')].pop(); const o = { before, msg: last && last.textContent.slice(0, 160), ctx: { postes: /chefop = /.test(window.__p), grp: /CONSOMMABLES/.test(window.__p) } };
      if (app === 'callsheeto') o.after = D().schedule.slice(-4).map(x => [x.time, x.ev ? 'EV' : x.ie, x.seq, x.desc].join('|'));
      if (app === 'matos') o.after = PM.cur().items.slice(-4).map(x => [x.name, x.qty, x.grp].join('|'));
      if (app === 'deviso') { const v = V(); o.after = { eq: v.eq.slice(-1).map(e => [e.name, e.qty, e.days, e.cat]), crew: v.crew.slice(-2).map(c => [c.role, c.poste, c.days]), fees: v.fees.slice(-1).map(f => [f.name, f.qty, f.price]) }; }
      return o; }, [app, before]);
    out[app].nprop = nprop; await pg.close();
  }
  console.log(JSON.stringify(out, null, 1), '\nERR', errs.join(' | ')); await b.close();
})();
