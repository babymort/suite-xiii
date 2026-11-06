// Vérifications visuelles et numériques des Open Peeps dans STORYBOARDO (pantin au repos = dessin d'origine ; poses appliquées)
const { chromium } = require('playwright');
const OUT = process.argv[2], MODE = process.argv[3] || 'rest';
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1800, height: 1100 } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2000);
  await pg.evaluate(async () => { await XPEEPS.load(); });
  if (MODE === 'rest') {
    // diff pixel : pantin assemblé (pièces découpées) vs composition d'origine, pour chaque pose
    const res = await pg.evaluate(async () => {
      const D = XPEEPS.data(), out = [];
      const toImg = s => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); });
      for (const id of Object.keys(D.P)) {
        const P = D.P[id], el = { kind: 'puppet', type: 'peep', pPose: id, pHead: 'Short 1', pFace: 'Calm', pose: {} };
        const J = XPEEPS.joints(el), K = 400 / 2840, q = P.j, off = D.off[P.c];
        // même cadrage : repère moteur (origine au sol sous le bassin)
        const x0 = (Math.min(P.bb[0], off[0] - 90) - q.p[0]) * K, x1 = (Math.max(P.bb[2], off[0] + 520) - q.p[0]) * K, y0 = (Math.min(P.bb[1], off[1] - 70) - P.g) * K, y1 = 5;
        const vb = (x0 - 5) + ' ' + (y0 - 5) + ' ' + (x1 - x0 + 10) + ' ' + (y1 - y0 + 10), Wp = 500, Hp = Math.round(500 * (y1 - y0 + 10) / (x1 - x0 + 10));
        const a = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" width="' + Wp + '" height="' + Hp + '">' + puppetSvg(el) + '</svg>';
        const bsv = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" width="' + Wp + '" height="' + Hp + '"><g transform="scale(' + K + ') translate(' + (-q.p[0]) + ' ' + (-P.g) + ')">' + XPEEPS.still(el, 0, 0, 0).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') + '</g></svg>';
        const [ia, ib] = await Promise.all([toImg(a), toImg(bsv)]);
        const c = document.createElement('canvas'); c.width = Wp; c.height = Hp; const x = c.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, Wp, Hp); x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, Wp, Hp).data;
        x.fillStyle = '#fff'; x.fillRect(0, 0, Wp, Hp); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, Wp, Hp).data;
        let n = 0, ink = 0; for (let i = 0; i < da.length; i += 4) { if (db[i] < 128) ink++; if (Math.abs(da[i] - db[i]) > 90) n++; }
        out.push([id, n, ink, (100 * n / Math.max(1, ink)).toFixed(2)]);
      }
      return out;
    });
    res.sort((a, b) => b[3] - a[3]); console.log(res.slice(0, 12).map(r => r.join(' ')).join('\n')); console.log('…', res.length, 'poses');
  } else {
    // planche de poses : pour quelques poses libres, appliquer les poses du moteur
    const html = await pg.evaluate((mode) => {
      const ids = mode === 'zoom' ? ['standing/walking-1', 'standing/shirt-3'] : mode === 'poses' ? ['standing/walking-1', 'standing/shirt-3', 'standing/pointing_finger-1', 'standing/robot_dance-1', 'standing/blazer-3', 'standing/polka_dots'] : ['standing/easing-1', 'standing/resting-1', 'standing/crossed_arms-1', 'standing/shirt-1', 'sitting/wheelchair', 'bust/Hoodie'];
      const ps = mode === 'zoom' ? ['course', 'bras_leves', 'assis'] : ['debout', 'marche', 'course', 'bras_leves', 'assis', 'salut', 'pointe', 'tombe'];
      let h = '<div style="display:grid;grid-template-columns:repeat(' + (ps.length + 1) + ',1fr);gap:0;background:#fff">';
      ids.forEach((id, r) => {
        ['__rest'].concat(ps).forEach(pz => {
          const el = { kind: 'puppet', type: 'peep', pPose: id, pHead: ['Afro', 'Long', 'Short 3', 'hat-hip', 'Bun', 'Medium 1'][r], pFace: 'Smile', pose: {}, handR: '', handL: '' };
          if (pz !== '__rest') { const P0 = allPoses().find(x => x[0] === pz)[2]; el.pose = Object.assign({}, POSE0, P0); el.poseOf = id; if (pz !== 'debout') { const J = XPEEPS.joints(Object.assign({}, el, { pose: {} })); el.pose = Object.assign({}, J.R0, P0); } }
          h += '<div style="border:1px solid #eee;height:' + (mode === 'zoom' ? 540 : 175) + 'px"><svg viewBox="-260 -470 520 490" width="100%" height="100%">' + puppetSvg(el) + '</svg><div style="font:10px sans-serif;margin-top:-14px;text-align:center">' + (pz === '__rest' ? id.split('/')[1] : pz) + '</div></div>';
        });
      });
      return h + '</div>';
    }, MODE);
    await pg.evaluate(h => { const d = document.createElement('div'); d.id = 'tst'; d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff;overflow:hidden'; d.innerHTML = h; document.body.appendChild(d); }, html);
    await pg.waitForTimeout(500); await pg.screenshot({ path: OUT + '/poses_' + MODE + '.png' });
  }
  console.log(errs.slice(0, 10).join('\n')); await b.close();
})();
