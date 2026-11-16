// LES OUTILS SE PARLENT : pour chaque lien de la carte (XLINKS.L), depuis l'outil source vide puis avec l'exemple, ce que fait « 📤 Vers Suite XIII »
const { chromium } = require('playwright');
const only = process.argv.slice(2);
(async () => { const b = await chromium.launch();
 const ctx0 = await b.newContext(); await ctx0.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 const p0 = await ctx0.newPage(); await p0.goto('http://localhost:8765/syno.html?desktop=1'); await p0.waitForTimeout(2500);
 const L = await p0.evaluate(() => XLINKS.L.map(x => [x[0], x[1], x[2] || ''])); await ctx0.close();
 const src = [...new Set(L.map(x => x[0]))].filter(a => !only.length || only.includes(a)); const C = {}; let n = 0;
 for (const a of src) for (const [f, to, d] of L.filter(x => x[0] === a)) { n++;
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); let nav = '';
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); if (r.request().isNavigationRequest() && r.request().frame() === r.request().frame().page().mainFrame() && !u.includes('/' + a + '.html')) { nav = u.replace('http://localhost:8765/', ''); return r.abort(); } return r.continue(); });
  await ctx.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); window.open = u => { window.__open = String(u); return null; }; }, a);
  const p = await ctx.newPage(); const E = []; p.on('pageerror', e => E.push(e.message.slice(0, 70))); let dlg = ''; p.on('dialog', d => { dlg = d.message().slice(0, 90); d.dismiss().catch(() => { }); });
  let res;
  try { await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(2500);
   const before = await p.evaluate(() => [...document.body.children].filter(e => e.getClientRects().length && getComputedStyle(e).position === 'fixed').length);
   const ks0 = await p.evaluate(() => Object.keys(localStorage).length);
   await p.evaluate(to => { document.querySelectorAll('#xt-root').forEach(x => x.remove()); XGATE.go(to); }, to); await p.waitForTimeout(900);
   const r = await p.evaluate(([b0, k0]) => { const W = [...document.body.children].filter(e => e.getClientRects().length && getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().width > 200); const t = W.length ? (W[W.length - 1].innerText || '').replace(/\s+/g, ' ').slice(0, 70) : ''; return { win: W.length > b0 ? t : '', keys: Object.keys(localStorage).length - k0, open: window.__open || '' }; }, [before, ks0]);
   res = nav ? (/#xfrom=/.test(nav) ? 'ARRIVÉE SIMPLE (ouvre ' + to + ' sans rien envoyer)' : 'ouvre ' + nav.slice(0, 50)) : r.win ? 'fenêtre : « ' + r.win + ' »' : dlg ? 'message : « ' + dlg + ' »' : r.keys > 0 ? 'envoi direct (' + r.keys + ' donnée(s))' : r.open ? 'nouvel onglet ' + r.open.slice(0, 40) : 'RIEN NE SE PASSE';
  } catch (e) { res = 'ERREUR ROBOT ' + e.message.slice(0, 60); }
  if (E.length) res += ' · ERREUR JS ' + E[0];
  (C[res.split(' ')[0]] = C[res.split(' ')[0]] || []).push(f + '>' + to);
  console.log((f + ' → ' + to).padEnd(26), res);
  await ctx.close(); }
 console.log('\nliens testés :', n); for (const k in C) console.log(k.padEnd(10), C[k].length); await b.close(); })();
