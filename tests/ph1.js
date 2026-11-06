const { chromium } = require('playwright'); const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1500, height: 950 } });
  await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8765/plano.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2000);
  const r0 = await pg.evaluate(() => {
    document.querySelectorAll('#xt-root,.xtour,#xtour').forEach(m => { try { m.remove(); } catch (e) { } });
    const c = document.createElement('canvas'); c.width = 800; c.height = 500; const g = c.getContext('2d'); g.fillStyle = '#ddd'; g.fillRect(0, 0, 800, 500); g.fillStyle = '#964'; g.fillRect(250, 300, 300, 90); g.fillStyle = '#9cf'; g.fillRect(560, 80, 160, 140);
    items().push({ id: uid(), kind: 'bg', name: 'salon.jpg', src: c.toDataURL('image/png'), x: 0, y: 0, w: 800, h: 500, rot: 0, opacity: 0.5, locked: false });
    window.__asked = null;
    XAI.configured = () => true; XAI.canSee = () => true; XAI.label = () => 'Claude (simulé)';
    XAI.ask = async (p, o) => { window.__asked = { len: p.length, img: !!(o && o.image && o.image.base64), cat: /m-canape-3 = Canapé 3 places/.test(p) };
      return '```json\n' + JSON.stringify({ piece: { nom: 'Salon', W: 520, D: 410, H: 265, confiance: 0.62, remarque: 'Profondeur estimée (mur avant hors champ).' },
        ouvertures: [{ type: 'fenetre', mur: 'fond', pos: 0.78, largeur: 140 }, { type: 'porte', mur: 'gauche', pos: 0.7, largeur: 83, label: 'Couloir' }, { type: 'zz', mur: 'xx', pos: 3 }],
        mobilier: [{ ref: 'm-canape-3', label: 'Canapé gris', x: 260, y: 120, rot: 0, w: 220, d: 92 }, { ref: 'm-basse', x: 260, y: 230, rot: 0 }, { ref: 'm-lampadaire', x: 440, y: 90 }, { ref: 'inconnu', x: 1, y: 1 }, { ref: 'cam-cine', x: 2, y: 2 }],
        lumieres: [{ type: 'fenetre', label: 'Jour', x: 405, y: -150, kelvin: 5600 }, { type: 'lampe', label: 'Lampadaire', x: 440, y: 90, kelvin: 2700 }],
        camera: { x: 250, y: 400, vx: 260, vy: 0, focale: 24 }, conseils: ['Fenêtre plein sud : prévoir de la diffusion', 'Recul limité côté photographe'] }) + '\n```'; };
    const n0 = P.tabs.length; return { n0, btn: !!document.getElementById('xph3d-btn') };
  });
  await pg.click('#xph3d-btn'); await pg.waitForTimeout(300);
  await pg.fill('#xph-hint', 'canapé de 2,20 m'); await pg.click('#xph-go'); await pg.waitForTimeout(800);
  await pg.screenshot({ path: OUT + '/ph1_prop.png' });
  const r1 = await pg.evaluate(() => ({ asked: window.__asked, rows: document.querySelectorAll('#xph3d input[data-k]').length, svg: !!document.querySelector('#xph-pv svg') }));
  await pg.fill('#xph-w', '624'); await pg.waitForTimeout(100); // +20 %
  await pg.uncheck('#xph-3d'); await pg.click('#xph-ok'); await pg.waitForTimeout(600);
  const r2 = await pg.evaluate(() => { const t = P.tabs[P.active], it = t.items; const sofa = it.find(i => i.ref === 'm-canape-3'), cam = it.find(i => i.ref === 'cam-cine'), wall = it.find(i => i.kind === 'wall');
    return { tabs: P.tabs.length, name: t.name, n: it.length, refs: it.map(i => i.ref || i.kind).join(','), sofa: sofa && [sofa.x, sofa.y, sofa.w, sofa.h, sofa.label], wall: wall.pts, cam: cam && [cam.x, cam.y, cam.rot, cam.fov && cam.fov.angle], wallH: P.settings.v3d && P.settings.v3d.wallH }; });
  await pg.screenshot({ path: OUT + '/ph1_plan.png' });
  console.log(JSON.stringify({ r0, r1, r2 }), '\nERR', errs.join(' | ')); await b.close();
})();
