// ZÉRO PLANTAGE (2) : 200 gestes au hasard par outil (clics, saisies, raccourcis), erreurs JavaScript relevées avec le geste en cause
const { chromium } = require('playwright');
const [N, ...apps] = [+(process.env.N || 200), ...process.argv.slice(2)];
let seed = +(process.env.SEED || 13); const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const KEYS = ['Escape', 'Enter', 'Tab', 'Delete', 'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Control+z', 'Control+y', 'Control+Shift+z', 'Control+d', 'Control+a', 'Control+c', 'Control+v', 'Control+s', 'n', 'i', 'Space', 'PageDown', 'Home', 'End', '+', '-'];
(async () => { const b = await chromium.launch(); const Q = apps.slice(), out = [];
 await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const a = Q.shift(); const R = { err: {}, nav: 0 }; out.push([a, R]);
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: false });
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); if (r.request().isNavigationRequest() && r.request().frame() === r.request().frame().page().mainFrame() && !u.includes('/' + a + '.html')) { R.nav++; return r.abort(); } return r.continue(); });
  await ctx.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); } catch (e) { } window.print = () => { }; window.open = () => null; }, a);
  const p = await ctx.newPage(); let last = 'chargement';
  p.on('pageerror', e => { const k = e.message.slice(0, 90); if (/ResizeObserver/.test(k)) return; R.err[k] = R.err[k] || (last + ' ⟶ ' + ((e.stack || '').split('\n')[1] || '').trim().replace(/http:\/\/localhost:8765\//, '').slice(0, 70)); });
  p.on('dialog', d => d.dismiss().catch(() => { })); p.on('filechooser', () => { });
  try { await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(2500);
   for (let i = 0; i < N && !R.hang; i++) { const r = rnd(); let wd; try { wd = setTimeout(() => { R.hang = last; Promise.race([p.evaluate(() => "js ok · " + document.activeElement.tagName + " · fenêtres " + [...document.body.children].filter(e => getComputedStyle(e).position === "fixed" && e.getClientRects().length).map(e => e.id || e.className).join(",").slice(0, 200)), new Promise(r => setTimeout(() => r("JS BLOQUÉ (page ne répond plus)"), 5000))]).then(v => { console.log("DIAG " + a + " : " + v); p.close().catch(() => { }); }); }, 20000);
    if (r < 0.62) { const t = await p.evaluate(k => { document.querySelectorAll('#xt-root').forEach(x => x.remove());
       const L = [...document.querySelectorAll('button,[role=button],input,select,textarea,summary,canvas,svg,[onclick],[draggable=true],li,td,.card,.item')].filter(x => { const q = x.getBoundingClientRect(); if (q.width < 4 || q.height < 4 || q.bottom < 0 || q.top > innerHeight || q.right < 0 || q.left > innerWidth) return false; if (x.closest('#xb-home,a[href]:not([href^="#"]),[data-a=reset],[data-reset]')) return false; return !/supprimer tout|réinitialiser|effacer tout|vider|déconnex/i.test((x.title || x.textContent || '').slice(0, 60)); });
       if (!L.length) return null; const x = L[Math.floor(k * L.length)], q = x.getBoundingClientRect(); return { x: q.left + q.width * (0.2 + 0.6 * ((k * 7) % 1)), y: q.top + q.height * (0.2 + 0.6 * ((k * 13) % 1)), d: x.tagName.toLowerCase() + (x.id ? '#' + x.id : '') + ' « ' + ((x.title || x.textContent || x.placeholder || '').trim().replace(/\s+/g, ' ').slice(0, 26)) + ' »', inp: /^(INPUT|TEXTAREA)$/.test(x.tagName) && !/checkbox|radio|file|range|color/.test(x.type) }; }, rnd());
      if (!t) continue; last = 'clic ' + t.d; const z = await p.evaluate(() => typeof XZOOM !== 'undefined' && XZOOM.z ? XZOOM.z() : 1);
      if (rnd() < 0.12) await p.mouse.click(t.x * z, t.y * z, { button: 'right' }); else if (rnd() < 0.1) await p.mouse.dblclick(t.x * z, t.y * z); else await p.mouse.click(t.x * z, t.y * z);
      if (t.inp) { last = 'saisie dans ' + t.d; await p.keyboard.type(['Plateau 2', '12', '', '-5', '<b>x</b>', '😀 é', '99999999'][Math.floor(rnd() * 7)]); } }
    else if (r < 0.9) { const k = KEYS[Math.floor(rnd() * KEYS.length)]; last = 'touche ' + k; await p.keyboard.press(k); }
    else { const x = 100 + rnd() * 1200, y = 120 + rnd() * 700; last = 'glisser ' + Math.round(x) + ',' + Math.round(y); await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 80, y + 40, { steps: 4 }); await p.mouse.up(); }
    await p.waitForTimeout(60); clearTimeout(wd); if (R.hang) break; if (!p.url().includes('/' + a + '.html')) { R.left = (R.left || 0) + 1; R.lw = R.lw || last; await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(2000); } } catch (e) { clearTimeout(wd); if (R.hang) break; R.reload = (R.reload || 0) + 1; R.why = R.why || last; await p.waitForTimeout(1500); if (!p.url().includes('/' + a + '.html')) { await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(2000); } } }
   await p.waitForTimeout(800);
   R.url = p.url(); R.alive = await p.evaluate(() => !!document.body && document.body.innerText.length > 20);
  } catch (e) { R.err['ROBOT ' + e.message.slice(0, 70)] = last; }
  console.log('· ' + a + ' : ' + Object.keys(R.err).length + ' erreur(s)' + (R.hang ? ' · FIGÉ après : ' + R.hang : '')); await ctx.close().catch(() => { }); } }));
 out.sort((x, y) => x[0].localeCompare(y[0])); let nb = 0;
 for (const [a, R] of out) { const E = Object.entries(R.err); if (E.length || R.alive === false || R.hang) { nb++; console.log(a.padEnd(12), (R.hang ? 'FIGÉ (geste : ' + R.hang + ') · ' : '') + (R.alive === false ? 'PAGE VIDE (' + R.url + ') · ' : '') + (R.left ? 'a quitté la page ' + R.left + '× (1re fois : ' + R.lw + ') · ' : '') + (R.reload ? 'rechargée ' + R.reload + '× (1re fois : ' + R.why + ') · ' : '') + E.length + ' erreur(s)\n   ' + E.map(([m, w]) => m + '\n      ← ' + w).join('\n   ')); } }
 console.log('outils :', out.length, '· gestes par outil :', N, '· outils avec erreur :', nb); await b.close(); })();
