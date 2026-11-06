// Planches PDF : couverture, catalogues, puis une vue éclatée par personnage prêt (debout + assis)
const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1500);
  const pages = await pg.evaluate(async () => {
    await XPEEPS.load(); const D = XPEEPS.data(), out = [], W = 2400, H = 1600;
    const esc2 = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const T = (x, y, s, t, o) => '<text x="' + x + '" y="' + y + '" font-family="Helvetica,Arial,sans-serif" font-size="' + s + '"' + (o || '') + '>' + esc2(t) + '</text>';
    const page = (title, sub, body) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><rect width="' + W + '" height="' + H + '" fill="#fff"/>' + T(40, 64, 40, title, ' font-weight="700" fill="#1d1d27"') + (sub ? T(40, 102, 22, sub, ' fill="#555"') : '') + body + T(40, H - 22, 17, 'Illustrations Open Peeps — Pablo Stanley (openpeeps.com), licence CC0 · découpe et articulations : STORYBOARDO XIII', ' fill="#777"') + '</svg>';
    const still = (o, x, y, w, h) => { const s = XPEEPS.still(o, 0, 0, 20); const vb = /viewBox="([^"]+)"/.exec(s)[1]; return '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" viewBox="' + vb + '">' + s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') + '</svg>'; };
    const lk = P => { const L = P.lk || []; return (L.includes('legs') || !P.j.rp) ? '🔒 tête seule' : (L.includes('r') || L.includes('l')) ? 'jambes + tête' : 'tout articulé'; };
    // couverture
    const full = D.T.filter(t => D.P[t[1]].c !== 'bust');
    let cov = T(40, 170, 30, 'Open Peeps découpés en pantins pour STORYBOARDO XIII', ' font-weight="700" fill="#1d1d27"') +
      T(40, 220, 22, D.T.length + ' personnages prêts (' + full.length + ' en pied, ' + (D.T.length - full.length) + ' bustes) · ' + Object.keys(D.P).length + ' poses et tenues · ' + Object.keys(D.H).length + ' coiffures · ' + Object.keys(D.F).length + ' expressions · ' + Object.keys(D.B).length + ' barbes · ' + Object.keys(D.A).length + ' accessoires · ' + D.M.length + ' mains', ' fill="#333"') +
      T(40, 262, 22, 'Chaque pose debout est découpée en 12 pièces (buste, bras, avant-bras, mains, cuisses, jambes, tête) articulées aux épaules, coudes, poignets, hanches, genoux et au cou.', ' fill="#333"') +
      T(40, 298, 22, 'Les poses assises et les bustes restent dessinés tels quels : seule la tête s’articule (inclinaison, regard arrière, 30 expressions).', ' fill="#333"');
    full.slice(0, 16).forEach((t, i) => { cov += still({ pPose: t[1], pHead: t[2], pFace: t[3], pBeard: t[4], pAcc: t[5] }, 40 + i * 145, 380, 140, 520); });
    full.slice(16, 32).forEach((t, i) => { cov += still({ pPose: t[1], pHead: t[2], pFace: t[3], pBeard: t[4], pAcc: t[5] }, 40 + i * 145, 940, 140, 520); });
    out.push(page('Open Peeps × STORYBOARDO XIII — vues éclatées', 'Planches de référence · novembre 2026', cov));
    // catalogue des poses
    let pz = ''; const ids = Object.keys(D.P).filter(k => D.P[k].c !== 'bust');
    ids.forEach((id, i) => { const x = 40 + (i % 12) * 193, y = 140 + Math.floor(i / 12) * 480; pz += still({ pPose: id, pHead: 'Short 1', pFace: 'Calm' }, x, y, 185, 410) + T(x + 92, y + 430, 15, D.P[id].n, ' text-anchor="middle" font-weight="700" fill="#1d1d27"') + T(x + 92, y + 450, 13, lk(D.P[id]), ' text-anchor="middle" fill="#777"'); });
    out.push(page('1. Poses et tenues (' + ids.length + ')', 'Debout : buste, bras et jambes articulés (sauf bras croisés) · Assis : dessin fixe, tête articulée', pz));
    let bz = ''; const bs = Object.keys(D.P).filter(k => D.P[k].c === 'bust');
    bs.forEach((id, i) => { const x = 40 + (i % 10) * 232, y = 140 + Math.floor(i / 10) * 470; bz += still({ pPose: id, pHead: 'Short 1', pFace: 'Calm' }, x, y, 220, 400) + T(x + 110, y + 425, 16, D.P[id].n, ' text-anchor="middle" font-weight="700" fill="#1d1d27"'); });
    out.push(page('2. Bustes pour les plans rapprochés (' + bs.length + ')', 'Tête articulée, 30 expressions', bz));
    // coiffures
    const head = (o, x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ') translate(90 70)">' + XPEEPS.still(Object.assign({ pPose: 'bust/Tee 1' }, o), 0, 0, 0).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/^.*?(<g transform="translate\(225 -459\)">)/, '$1') + '</g>';
    const hOnly = (o, x, y, s) => { const s0 = XPEEPS.still(Object.assign({ pPose: 'bust/Tee 1' }, o), 0, 0, 0), k = s0.indexOf('<g transform="translate(225 -459)">'); return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ') translate(90 70)">' + s0.slice(k).replace(/<\/svg>$/, '').replace('translate(225 -459)', 'translate(0 0)') + '</g>'; };
    let hz = ''; Object.keys(D.H).forEach((k, i) => { const x = 50 + (i % 10) * 232, y = 140 + Math.floor(i / 10) * 285; hz += hOnly({ pHead: k, pFace: 'Smile' }, x, y, 0.3) + T(x + 105, y + 262, 16, D.H[k].n, ' text-anchor="middle" font-weight="700" fill="#1d1d27"'); });
    out.push(page('3. Coiffures (' + Object.keys(D.H).length + ')', 'Toutes compatibles avec toutes les poses, expressions, barbes et accessoires', hz));
    let ez = ''; Object.keys(D.F).forEach((k, i) => { const x = 50 + (i % 10) * 232, y = 140 + Math.floor(i / 10) * 300; ez += hOnly({ pHead: 'Short 1', pFace: k }, x, y, 0.3) + T(x + 105, y + 262, 16, D.F[k].n, ' text-anchor="middle" font-weight="700" fill="#1d1d27"'); });
    let bzz = ''; Object.keys(D.B).forEach((k, i) => { const x = 50 + (i % 12) * 193, y = 1060 + Math.floor(i / 12) * 230; bzz += hOnly({ pHead: 'No Hair 1', pFace: 'Calm', pBeard: k }, x, y, 0.27) + T(x + 92, y + 222, 14, D.B[k].n, ' text-anchor="middle" font-weight="700" fill="#1d1d27"'); });
    out.push(page('4. Expressions (' + Object.keys(D.F).length + ') et barbes (' + Object.keys(D.B).length + ')', 'Touche E dans STORYBOARDO : expression suivante', ez + bzz));
    let az = ''; Object.keys(D.A).forEach((k, i) => { const x = 50 + i * 290, y = 160; az += hOnly({ pHead: 'Short 2', pFace: 'Calm', pAcc: k }, x, y, 0.42) + T(x + 140, y + 370, 18, D.A[k].n, ' text-anchor="middle" font-weight="700" fill="#1d1d27"'); });
    out.push(page('5. Accessoires (' + Object.keys(D.A).length + ')', '', az));
    // une vue éclatée par personnage en pied
    D.T.forEach((t, i) => { if (D.P[t[1]].c === 'bust') return; out.push(XPEEPS.sheetSvg({ kind: 'puppet', type: 'peep', name: t[0], pPose: t[1], pHead: t[2], pFace: t[3], pBeard: t[4], pAcc: t[5], pose: {} })); });
    return out;
  });
  console.log('pages', pages.length);
  const html = '<!doctype html><html><head><meta charset="utf-8"><style>@page{size:2400px 1600px;margin:0}html,body{margin:0}div.p{width:2400px;height:1600px;page-break-after:always;overflow:hidden}</style></head><body>' + pages.map(s => '<div class="p">' + s + '</div>').join('') + '</body></html>';
  const p2 = await b.newPage(); await p2.setContent(html, { waitUntil: 'load' }); await p2.waitForTimeout(1000);
  await p2.pdf({ path: OUT + '/STORYBOARDO_Open_Peeps_vues_eclatees.pdf', width: '2400px', height: '1600px', printBackground: true });
  await p2.setViewportSize({ width: 2400, height: 1600 });
  for (const k of [0, 1, 3, 4, 6, 12]) { const el = (await p2.$$('div.p'))[k]; await el.screenshot({ path: OUT + '/pdfpage' + k + '.png' }); }
  await b.close();
})();
