// LES OUTILS SE PARLENT — chaque passerelle de bout en bout, par le vrai chemin utilisateur (📤 Vers Suite XIII)
// Suite pré-remplie d'un exemple type, envoi depuis l'outil source, intégration dans l'outil cible (2 fois),
// puis comparaison des données de la cible : reçu ? rien perdu ? pas de doublon au 2e envoi ? enregistré (relecture) ?
// node gw.js <sortie.json> [lien…]   (liens « source>cible » ; tous si absent)   serveur :8765
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const F = n => fs.readFileSync(path.join(__dirname, 'fake', n), 'utf8');
const LIBS = [[/jspdf/i, F('jspdf.js')], [/xlsx/i, F('xlsx.js')], [/html2canvas|qrcode|jsQR|lz-string/i, F('misc.js')], [/jszip/i, fs.readFileSync('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js', 'utf8')], [/pdf-lib/i, fs.readFileSync('/opt/npm-tools/node_modules/pdf-lib/dist/pdf-lib.min.js', 'utf8')], [/leaflet.*\.js/i, F('any.js') + ';window.L=__any();'], [/\.css(\?|$)/i, '']];
const [out, ...only] = process.argv.slice(2); const R = {};
const TYPE = { decoup: 'fiction', scripto: 'fiction', storyboardo: 'fiction', casto: 'fiction', moodo: 'fiction', repero: 'fiction', posto: 'fiction', ressourco: 'fiction', backupo: 'fiction', cadro: 'fiction', encodo: 'fiction' };
const NOISE = /Failed to load resource|net::ERR|favicon|ResizeObserver|status of 4\d\d|AbortError|NetworkError|Failed to fetch|Load failed|CORS|serviceWorker|ServiceWorker/i;
const url = t => 'http://localhost:8765/' + (t === 'catalogue' ? 'matos.html?v=cat&desktop=1' : t === 'planno' ? 'calendrier.html?v=prod&desktop=1' : t + '.html?desktop=1');
// photographie des données d'un outil : toutes les clés du navigateur qui le concernent (+ IndexedDB de DOSSIER)
const SNAP = async (pg, t) => pg.evaluate(async t => {
  const K = (window.XMODELS && XMODELS.keys) || {}, rx = new RegExp('^(' + t + '|xiii\\.' + t + ')|' + t + 'XIII|^' + t + '_', 'i');
  const keys = Object.keys(localStorage).filter(k => k === K[t] || rx.test(k) || (t === 'matos' && /^(xiii\.projets|xiii\.parc|matosXIII)/.test(k)) || (t === 'syno' && /^synoptique/.test(k)) || (t === 'jour' && /^xiii\.jour/.test(k)));
  const items = new Map(); let objs = 0;
  const walk = (o, p, d) => { if (!o || typeof o !== 'object' || d > 9) return; if (Array.isArray(o)) { o.forEach((x, i) => { if (x && typeof x === 'object' && !Array.isArray(x)) { objs++; const id = x.id || x.uid || x.name || x.nom || x.title || x.label || x.desc || x.n || ''; if (id) items.set(p + '|' + String(id).slice(0, 60), (items.get(p + '|' + String(id).slice(0, 60)) || 0) + 1); } walk(x, p, d + 1); }); } else Object.keys(o).forEach(k => walk(o[k], p + '.' + k, d + 1)); };
  let bytes = 0; keys.forEach(k => { const v = localStorage.getItem(k) || ''; bytes += v.length; try { walk(JSON.parse(v), k, 0); } catch (e) { } });
  let idb = 0; if (t === 'dossier' && indexedDB.databases) { try { const dbs = await indexedDB.databases(); idb = dbs.length; } catch (e) { } }
  return { keys, bytes, objs, items: [...items.entries()], idb };
}, t).catch(e => ({ err: e.message, keys: [], bytes: 0, objs: 0, items: [] }));
const cmp = (a, b) => { const A = new Map(a.items), B = new Map(b.items); const lost = [...A.keys()].filter(k => !B.has(k)), dup = [...B.entries()].filter(([k, n]) => n > (A.get(k) || 0) && A.has(k)).map(([k, n]) => k + ' ×' + n), added = [...B.keys()].filter(k => !A.has(k)); return { lost, dup, added: added.length, dObjs: b.objs - a.objs, dBytes: b.bytes - a.bytes }; };
async function ctxNew(b) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('http://localhost')) return r.continue(); const m = LIBS.find(x => x[0].test(u)); if (m) return r.fulfill({ status: 200, contentType: /\.css/.test(u) ? 'text/css' : 'application/javascript', body: m[1] }); return r.abort(); });
  await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.errlog', 'off'); Object.keys(localStorage); } catch (e) { } window.print = () => { }; window.__alerts = [];
    const oa = window.alert; window.alert = m => { window.__alerts.push(String(m).slice(0, 200)); }; window.open = function (u) { window.__opened = (window.__opened || []).concat([String(u)]); return { document: { write() { }, close() { } }, close() { }, focus() { }, location: {} }; }; });
  return ctx;
}
const hideTours = async pg => pg.evaluate(() => { document.querySelectorAll('#xt-root,#xtp,#xnw-ov').forEach(m => m.remove()); try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } try { for (const k of Object.keys(localStorage)) { } } catch (e) { } }).catch(() => { });
async function settle(pg, ms) { try { await pg.waitForLoadState('load', { timeout: 15000 }); } catch (e) { } await pg.waitForTimeout(ms || 2600); await hideTours(pg); }
// clique l'action principale de la fenêtre la plus récente (préférer Ajouter / Fusionner / Intégrer à Remplacer)
const PRIMARY = async (pg, rx, pref) => pg.evaluate(([rx, pref]) => { const R = new RegExp(rx, 'i');
  const ovs = [...document.querySelectorAll('body *')].filter(o => { const cs = getComputedStyle(o); return (cs.position === 'fixed' || cs.position === 'absolute') && cs.display !== 'none' && cs.visibility !== 'hidden' && o.offsetHeight > 60 && o.querySelector('button') && !/^(xb-master|xaic|xt-tab|xs-gear|xzz-quota|xb-menu|xoff|xau|xbug|xs-|xps-ban|toast|xiii-beta|xtp|xt-)/.test(o.id) && !/toast/.test(o.className) && !o.closest('#top-bar,#toolbar'); });
  const o = ovs.filter(x => !ovs.some(y => y !== x && x.contains(y))).pop(); if (!o) return '';
  const B = [...o.querySelectorAll('button,a.btn')].filter(x => x.offsetParent && !x.disabled && !/annuler|fermer|ignorer|plus tard|non merci|retour|✕|×|supprimer|vider|effacer/i.test(x.textContent));
  const pick = (pref && B.find(x => new RegExp(pref, 'i').test(x.textContent + ' ' + (x.title || '')))) || B.find(x => /mettre à jour|actualiser/i.test(x.textContent)) || B.find(x => /ajouter|fusionner|compléter|intégrer|importer/i.test(x.textContent) && !/remplacer|écraser/i.test(x.textContent)) || B.find(x => R.test(x.textContent));
  if (!pick) return '?' + (o.id || o.className || '').toString().slice(0, 20) + ' [' + B.map(x => x.textContent.trim().slice(0, 18)).join(' | ').slice(0, 160) + ']'; pick.click(); return pick.textContent.trim().replace(/\s+/g, ' ').slice(0, 40); }, [rx, pref || '']).catch(() => '');
async function send(ctx, from, to, E, tag) {
  const pg = await ctx.newPage(); pg.on('pageerror', e => E.push([tag, from, 'JS', e.message.slice(0, 200)])); pg.on('console', m => { if (m.type() === 'error' && !NOISE.test(m.text())) E.push([tag, from, 'console', m.text().slice(0, 200)]); });
  pg.on('dialog', d => { E.push([tag, from, 'dialogue', d.message().slice(0, 160)]); (/supprimer|vider|remplacer|écraser|effacer/i.test(d.message()) ? d.dismiss() : d.accept()).catch(() => { }); });
  await pg.goto(url(from)); await settle(pg);
  const steps = []; let navigated = false; pg.on('framenavigated', f => { if (f === pg.mainFrame()) navigated = true; });
  const r = await pg.evaluate(to => { try { if (typeof XGATE === 'undefined') return 'pas de XGATE'; XGATE.go(to); return 'go'; } catch (e) { return 'ERR ' + e.message; } }, to).catch(e => 'nav');
  steps.push(r); await pg.waitForTimeout(1200);
  for (let i = 0; i < 3 && !navigated; i++) { const tn = await pg.evaluate(t => (XLINKS.T[t] || ['', t])[1].replace(/ /g, '\\s?'), to).catch(() => to); const c = await PRIMARY(pg, 'envoyer|transmettre|créer|valider|exporter|générer|→|ok$|reporter|préparer', tn); if (!c || c[0] === '?') { if (c) steps.push(c); break; } steps.push('clic ' + c); await pg.waitForTimeout(1300); if ((await pg.evaluate(() => (window.__opened || []).length).catch(() => 0))) break; }
  const al = await pg.evaluate(() => window.__alerts || []).catch(() => []); if (al.length) steps.push('alerte: ' + al.join(' / ').slice(0, 160));
  const op = await pg.evaluate(() => window.__opened || []).catch(() => []); if (op.length) steps.push('ouvre ' + op.join(' ').slice(0, 80));
  let landed = navigated ? pg.url() : ''; await pg.waitForTimeout(600); try { landed = navigated ? pg.url() : ''; } catch (e) { }
  return { pg, steps, landed, opened: op };
}
async function receive(ctx, to, E, tag, carried) {
  let pg = carried && carried.landed && carried.landed.includes(to === 'planno' ? 'calendrier' : to) ? carried.pg : null;
  if (!pg) { if (carried && carried.pg) await carried.pg.close().catch(() => { }); pg = await ctx.newPage(); const u = carried && carried.opened && carried.opened.find(x => x.includes(to)); await pg.goto(u ? 'http://localhost:8765/' + u.replace(/^\.?\//, '') : url(to)); }
  else if (carried.pg !== pg) await carried.pg.close().catch(() => { });
  pg.on('pageerror', e => E.push([tag, to, 'JS', e.message.slice(0, 200)])); pg.on('dialog', d => { E.push([tag, to, 'dialogue', d.message().slice(0, 160)]); (/supprimer|vider|remplacer|écraser|effacer/i.test(d.message()) ? d.dismiss() : d.accept()).catch(() => { }); });
  await settle(pg, 3400); const steps = []; const fr = await pg.evaluate(() => (document.getElementById('xzz-from') || {}).textContent || '').catch(() => ''); if (fr) steps.push('arrivée: ' + fr.slice(0, 110));
  for (let i = 0; i < 3; i++) { const ban = await pg.evaluate(() => { const b = document.getElementById('xps-ok'); if (b) { b.click(); return 'bandeau Intégrer'; } return ''; }).catch(() => '');
    const c = ban || await PRIMARY(pg, 'intégrer|importer|ajouter|fusionner|valider|créer|ok$|appliquer|accepter|ranger|classer|chiffrer|générer|placer|reporter|enregistrer|remplir|dans j|journée'); if (!c || c[0] === '?') { if (c) steps.push(c); break; } steps.push(c); await pg.waitForTimeout(1300); }
  await pg.evaluate(() => { try { if (typeof saveProject === 'function') saveProject(true); } catch (e) { } }).catch(() => { }); await pg.waitForTimeout(800);
  return { pg, steps };
}
(async () => {
  const b = await chromium.launch();
  const probe = await (await ctxNew(b)).newPage(); await probe.goto(url('casto')); await settle(probe, 2000);
  const ALL = await probe.evaluate(() => XLINKS.L.map(x => x[0] + '>' + x[1])); const KEYS = await probe.evaluate(() => Object.keys(XMODELS.keys)); await probe.context().close();
  const links = only.length ? only : ALL;
  // états pré-remplis : chaque outil applique l'exemple type DANS sa propre page (les adaptateurs tournent dans leur outil)
  const PRE = {}; for (const ty of [...new Set(links.map(k => TYPE[k.split('>')[0]] || 'tv'))]) { const c = await ctxNew(b); let n = 0;
    for (const t of KEYS) { const p = await c.newPage(); try { await p.goto(url(t)); await settle(p, 1800); const ok = await p.evaluate(async ([t, ty]) => { try { await XMODELS.apply(t, ty, false); return 1; } catch (e) { return 0; } }, [t, ty]); n += ok; } catch (e) { } await p.close(); }
    const p = await c.newPage(); await p.goto('http://localhost:8765/404.html'); PRE[ty] = { n, ls: await p.evaluate(() => { const o = {}; Object.keys(localStorage).forEach(k => { if (!/^xiii\.(tour|tips|boot|errl)/.test(k)) o[k] = localStorage.getItem(k); }); return o; }) }; await c.close(); }
  const job = async k => {
    const [from, to] = k.split('>'), E = [], ty = TYPE[from] || 'tv', res = { type: ty, E };
    const ctx = await ctxNew(b);
    try {
      // 1. toute la suite pré-remplie avec le même exemple type (la cible a donc déjà des données : rien ne doit se perdre)
      res.prefill = PRE[ty].n; const p0 = await ctx.newPage(); await p0.goto('http://localhost:8765/404.html'); await p0.evaluate(D => { Object.keys(D).forEach(k => { try { localStorage.setItem(k, D[k]); } catch (e) { } }); }, PRE[ty].ls); await p0.close();
      // 2. état de départ de la cible (ouverte une fois pour qu'elle range ses données)
      let pt = await ctx.newPage(); await pt.goto(url(to)); await settle(pt, 2200); const S0 = await SNAP(pt, to); await pt.close();
      // 3. premier envoi + intégration
      const s1 = await send(ctx, from, to, E, '1'); res.send1 = s1.steps; res.land1 = s1.landed.replace('http://localhost:8765/', '');
      const r1 = await receive(ctx, to, E, '1', s1); res.recv1 = r1.steps; const S1 = await SNAP(r1.pg, to); await r1.pg.close();
      // 4. deuxième envoi identique : aucune donnée ne doit être doublée
      const s2 = await send(ctx, from, to, E, '2'); res.send2 = s2.steps;
      const r2 = await receive(ctx, to, E, '2', s2); res.recv2 = r2.steps; await r2.pg.close();
      // 5. relecture après réouverture (bien enregistré)
      pt = await ctx.newPage(); await pt.goto(url(to)); await settle(pt, 2200); const S3 = await SNAP(pt, to); await pt.close();
      res.c1 = cmp(S0, S1); res.c2 = cmp(S1, S3); res.keys = S1.keys.slice(0, 4); res.sz = [S0.objs, S1.objs, S3.objs];
    } catch (e) { E.push(['robot', '', 'robot', e.message.slice(0, 200)]); }
    await ctx.close(); R[k] = res; fs.writeFileSync(out, JSON.stringify(R));
  };
  const Q = links.slice(); await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const k = Q.shift(); try { await job(k); } catch (e) { R[k] = { E: [['robot', '', 'robot', e.message.slice(0, 160)]] }; } } }));
  fs.writeFileSync(out, JSON.stringify(R)); await b.close();
})();
