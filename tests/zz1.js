// Phase ZZ : rangement des boutons (Nouveau ▾, envois dans Vers Suite XIII, outils en bout de barre, Partager de CALL SHEETO)
const { chromium } = require('playwright'); const OUT = process.argv[2];
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } }); const errs = [];
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort()); const R = {};
  const open = async a => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(a + ': ' + e.message)); pg.on('dialog', d => d.dismiss());
    await pg.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, a);
    await pg.goto('http://localhost:8765/' + a + '.html?desktop=1'); await pg.waitForTimeout(6000); await pg.evaluate(() => document.querySelectorAll('#xt-root').forEach(m => m.remove())); return pg; };
  // STORYBOARDO : Nouveau ▾ + Cadre 3D rangé
  let pg = await open('storyboardo');
  R.sb = await pg.evaluate(() => { const n = document.getElementById('xzz-new'); n.click(); const items = [...document.querySelectorAll('#xb-menu [data-i] b')].map(x => x.textContent); const tg = document.getElementById('xzz-tg');
    return { nv: !!n, items, hid: [...document.querySelectorAll('[data-xzz=nv]')].length, m3dIn: !!(tg && tg.querySelector('#xm3d-btn')), x: Math.round(document.getElementById('xm3d-btn').getBoundingClientRect().left) }; });
  await pg.screenshot({ path: OUT + '/zz_sb.png', clip: { x: 0, y: 0, width: 1500, height: 330 } });
  R.sbEx = await pg.evaluate(async () => { document.querySelectorAll('#xb-menu [data-i]')[1].click(); await new Promise(r => setTimeout(r, 400)); return !!document.querySelector('#xmd-ov,.xmd-ov,[id^=xmd]') || document.body.innerText.slice(0, 0); });
  await pg.close();
  // LUMO : 💶 rangé dans Vers Suite XIII, qui garde DEVISO
  pg = await open('lumo');
  R.lumo = await pg.evaluate(async () => { const d = document.getElementById('xd-btn'); window.__dv = 0; const F = window.openSendToDeviso; window.openSendToDeviso = () => { window.__dv++; };
    document.getElementById('xgt-btn').click(); await new Promise(r => setTimeout(r, 400)); const row = [...document.querySelectorAll('#xgt-ov [data-a]')].find(x => x.dataset.a === 'deviso');
    if (row) { row.click(); await new Promise(r => setTimeout(r, 100)); const g = document.querySelector('#xgt-ov [data-go],#xgt-ov .go-btn'); if (g) g.click(); }
    return { hidden: d && d.style.display === 'none', row: !!row, called: window.__dv, peers: XLINKS.peers('lumo').includes('deviso') }; });
  await pg.screenshot({ path: OUT + '/zz_lumo.png', clip: { x: 0, y: 0, width: 1500, height: 700 } });
  await pg.close();
  // CONDUCO : 💶 et CALL SHEETO rangés
  pg = await open('conduco');
  R.conduco = await pg.evaluate(() => ({ xd: (document.getElementById('xd-btn') || {}).style?.display, xc: (document.getElementById('xc-btn') || {}).style?.display, nv: !!document.getElementById('xzz-new') }));
  await pg.close();
  // CALL SHEETO : Partager réunit feuille vivante (Drive), diffuser, lien instantané
  pg = await open('callsheeto');
  console.log(JSON.stringify(R)); R.cs = await pg.evaluate(() => { const x = document.getElementById('xcl-btn'); const s = document.getElementById('xsh-btn'); if (!s) return { nosh: [...document.querySelectorAll('#top-bar button')].map(b => b.id + ':' + b.title.slice(0, 30)) }; s.click(); return { xcl: x && x.style.display, items: [...document.querySelectorAll('#xb-menu b')].map(b => b.textContent), ai: !!document.querySelector('#xzz-tg #xcsai-btn') }; });
  await pg.screenshot({ path: OUT + '/zz_cs.png', clip: { x: 0, y: 0, width: 1500, height: 500 } });
  R.csLive = await pg.evaluate(async () => { document.querySelector('#xb-menu [data-a=drv]').click(); await new Promise(r => setTimeout(r, 300)); return !!document.getElementById('xcl-ov'); });
  await pg.close();
  console.log(JSON.stringify(R, null, 1), 'ERR', errs.join(' | ')); await b.close(); })();
