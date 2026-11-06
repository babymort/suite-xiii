// plusieurs photos + REPERO + peaufinage
const { chromium } = require('playwright'); const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1500, height: 950 } });
  await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  // préparer des photos REPERO dans le même navigateur
  await pg.goto('http://localhost:8765/repero.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1500);
  await pg.evaluate(async () => {
    const mk = c => { const k = document.createElement('canvas'); k.width = 400; k.height = 300; const g = k.getContext('2d'); g.fillStyle = c; g.fillRect(0, 0, 400, 300); return k.toDataURL('image/jpeg', 0.8); };
    const db = await new Promise(r => { const q = indexedDB.open('reperoXIII', 1); q.onupgradeneeded = () => { ['scans', 'photos'].forEach(n => { if (!q.result.objectStoreNames.contains(n)) q.result.createObjectStore(n); }); }; q.onsuccess = () => r(q.result); });
    const put = (k, v) => new Promise(r => { const t = db.transaction('photos', 'readwrite'); t.objectStore('photos').put(v, k); t.oncomplete = r; });
    await put('pa', { id: 'pa', data: mk('#a86') }); await put('pb', { id: 'pb', data: mk('#68a') });
    localStorage.setItem('reperoXIII.project', JSON.stringify({ spots: [{ id: 's1', name: 'Appartement Belleville', city: 'Paris', photos: [{ id: 'pa', cap: 'vers la fenêtre' }, { id: 'pb', cap: 'depuis la fenêtre' }] }] }));
  });
  await pg.goto('http://localhost:8765/plano.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2000);
  await pg.evaluate(() => {
    document.querySelectorAll('#xt-root').forEach(m => m.remove());
    window.__calls = [];
    XAI.configured = () => true; XAI.canSee = () => true; XAI.label = () => 'Claude (simulé)';
    XAI.ask = async (p, o) => { window.__calls.push({ n: (o.images || [o.image]).length, refine: /PLAN DÉJÀ ÉTABLI/.test(p), caps: /photo 2 = /.test(p) });
      const first = window.__calls.length === 1;
      return JSON.stringify({ piece: { nom: 'Salon Belleville', W: first ? 500 : 540, D: 420, H: 270, confiance: first ? 0.6 : 0.8 },
        ouvertures: [{ type: 'fenetre', mur: 'fond', pos: 0.5, largeur: 140 }].concat(first ? [] : [{ type: 'porte', mur: 'avant', pos: 0.2, largeur: 83, label: 'Entrée (vue sur la photo 2)' }]),
        mobilier: [{ ref: 'm-canape-3', x: 250, y: 120 }].concat(first ? [] : [{ ref: 'm-biblio', x: 520, y: 250, rot: 270 }]),
        cameras: [{ photo: 1, x: 250, y: 400, vx: 250, vy: 0, focale: 24 }, { photo: 2, x: 250, y: 40, vx: 250, vy: 420, focale: 24 }], conseils: [] }); };
  });
  await pg.click('#xph3d-btn'); await pg.waitForTimeout(300);
  await pg.click('#xph-rp'); await pg.waitForTimeout(600);
  await pg.click('[data-all="s1"]'); await pg.waitForTimeout(300);
  const g1 = await pg.evaluate(() => ({ n: XPH3D.photos().length, caps: XPH3D.photos().map(p => p.cap), btn: document.getElementById('xph-go').textContent }));
  await pg.click('#xph-go'); await pg.waitForTimeout(800);
  await pg.screenshot({ path: OUT + '/ph2_prop.png' });
  await pg.uncheck('#xph-3d'); await pg.click('#xph-ok'); await pg.waitForTimeout(500);
  // un élément ajouté à la main, puis on peaufine avec une 3e photo
  const r1 = await pg.evaluate(() => { const lib = libById('m-plante'); const it = itemFromLib(lib, 100, 100); items().push(it); commit(); return { tabs: P.tabs.length, n: items().length, cams: items().filter(i => i.ref === 'cam-cine').length, ph3d: !!tab().ph3d }; });
  await pg.click('#xph3d-btn'); await pg.waitForTimeout(300);
  const hasRef = await pg.evaluate(() => !!document.getElementById('xph-ref'));
  await pg.evaluate(async () => { const k = document.createElement('canvas'); k.width = 300; k.height = 200; await (async () => {})(); XPH3D.photos().push({ url: k.toDataURL('image/png'), name: 'x', cap: 'coin bibliothèque' }); });
  await pg.click('#xph-rp'); await pg.waitForTimeout(400); await pg.click('#xph-rp'); // refermer
  await pg.evaluate(() => { document.getElementById('xph-go').disabled = false; });
  await pg.click('#xph-go'); await pg.waitForTimeout(800);
  const okTxt = await pg.evaluate(() => document.getElementById('xph-ok').textContent);
  await pg.uncheck('#xph-3d'); await pg.click('#xph-ok'); await pg.waitForTimeout(500);
  const r2 = await pg.evaluate(() => ({ tabs: P.tabs.length, refs: items().map(i => i.ref || i.kind).join(','), plante: items().some(i => i.ref === 'm-plante'), wall: items().find(i => i.kind === 'wall').pts[1], calls: window.__calls }));
  console.log(JSON.stringify({ g1, r1, hasRef, okTxt, r2 }), '\nERR', errs.join(' | ')); await b.close();
})();
