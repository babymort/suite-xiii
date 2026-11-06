// STORYBOARDO : Cadre 3D (mannequins + caméra), rendu trait / ombré, placé dans la case
const { chromium } = require('playwright'); const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } }); const pg = await ctx.newPage(); const errs = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  pg.on('pageerror', e => errs.push(e.message)); await pg.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.storyboardo.hide', '1'); });
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1800);
  const r0 = await pg.evaluate(() => { document.querySelectorAll('#xt-root').forEach(m => m.remove()); try { closeModal(); } catch (e) { } const mo = document.getElementById('modal-ov'); if (mo) mo.remove(); return { btn: !!document.getElementById('xm3d-btn'), xman: typeof XMAN }; });
  await pg.evaluate(() => document.getElementById('xm3d-btn').click()); await pg.waitForTimeout(400);
  // 2 mannequins, l'un assis, caméra 50 mm à hauteur d'yeux
  await pg.evaluate(() => { document.getElementById('xm3d-add').click(); const s = document.querySelectorAll('#xm3d [data-m="1"] [data-k="pose"]')[0]; s.value = 'sit'; s.onchange(); document.querySelector('#xm3d [data-f="50"]').click(); });
  await pg.waitForTimeout(300); await pg.screenshot({ path: OUT + '/m3d_trait.png' });
  const info = await pg.evaluate(() => document.getElementById('xm3d-info').textContent);
  await pg.evaluate(() => { const s = document.getElementById('xm3d-st'); s.value = 'ombre'; s.dispatchEvent(new Event('change')); const r = document.querySelector('#xm3d [data-c="ch"]'); r.value = 320; r.oninput(); const a = document.querySelector('#xm3d [data-c="az"]'); a.value = 35; a.oninput(); });
  await pg.waitForTimeout(300); await pg.screenshot({ path: OUT + '/m3d_ombre.png' });
  // gros plan au 85
  await pg.evaluate(() => { document.querySelector('#xm3d [data-f="85"]').click(); const d = document.querySelector('#xm3d [data-c="d"]'); d.value = 1.6; d.oninput(); const t = document.querySelector('#xm3d [data-c="th"]'); t.value = 160; t.oninput(); const h = document.querySelector('#xm3d [data-c="ch"]'); h.value = 165; h.oninput(); });
  await pg.waitForTimeout(300); const info2 = await pg.evaluate(() => document.getElementById('xm3d-info').textContent); await pg.screenshot({ path: OUT + '/m3d_gp.png' });
  await pg.evaluate(() => document.getElementById('xm3d-ok').click()); await pg.waitForTimeout(800);
  const r1 = await pg.evaluate(() => { const p = PN(); return { img: !!p.bg.img, data: (IMG.get(p.bg.img) || '').slice(0, 22), focale: p.focale, valeur: p.valeur, m3d: !!p.m3d && p.m3d.men.length, dlg: !!document.getElementById('xm3d') }; });
  await pg.screenshot({ path: OUT + '/m3d_case.png' });
  // réouverture : la scène revient
  await pg.evaluate(() => document.getElementById('xm3d-btn').click()); await pg.waitForTimeout(300);
  const r2 = await pg.evaluate(() => ({ men: document.querySelectorAll('#xm3d .mn').length, f: document.querySelector('#xm3d [data-c="f"]').value, st: document.getElementById('xm3d-st').value }));
  console.log(JSON.stringify({ r0, info, info2, r1, r2 }, null, 1), 'ERR', errs.join('|')); await b.close();
})();
