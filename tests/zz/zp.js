// ZÉRO PLANTAGE — parcours automatique : ouverture, exemples types, projet vide / très chargé, exports, passerelles, version mobile
// node zp.js <sortie.json> <outil> [outil…]   (serveur sur :8765)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const F = n => fs.readFileSync(path.join(__dirname, 'fake', n), 'utf8');
const ANY = F('any.js'), LIBS = [
  [/jspdf/i, F('jspdf.js')], [/xlsx/i, F('xlsx.js')], [/html2canvas|qrcode|jsQR|lz-string/i, F('misc.js')],
  [/pptxgen/i, fs.readFileSync('/opt/npm-tools/node_modules/pptxgenjs/dist/pptxgen.bundle.js', 'utf8')],
  [/jszip/i, fs.readFileSync('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js', 'utf8')],
  [/pdf-lib/i, fs.readFileSync('/opt/npm-tools/node_modules/pdf-lib/dist/pdf-lib.min.js', 'utf8')],
  [/leaflet.*\.js/i, ANY + ';window.L=__any();'], [/\.css(\?|$)/i, '']];
const TYPES = process.env.TYPES ? process.env.TYPES.split(',').filter(x => x !== 'charge') : ['live', 'tv', 'fiction', 'doc', 'pub', 'corporate', 'event', 'artistique']; const WITH_CHARGE = !process.env.TYPES || /charge/.test(process.env.TYPES);
const [out, ...tools] = process.argv.slice(2); const R = {};
const NOISE = /Failed to load resource|net::ERR|ERR_FAILED|favicon|Content Security|ResizeObserver|the server responded|Download the React|status of 4\d\d|AbortError|NetworkError|Failed to fetch|Load failed|blocked by CORS|serviceWorker|ServiceWorker|getUserMedia|Permission|NotAllowedError/i;
async function ctxNew(b, mobile) {
  const ctx = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true } : { viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('http://localhost')) return r.continue(); const m = LIBS.find(x => x[0].test(u)); if (m) return r.fulfill({ status: 200, contentType: /\.css/.test(u) ? 'text/css' : 'application/javascript', body: m[1] }); return r.abort(); });
  await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.errlog', 'off'); } catch (e) { }
    window.print = () => { window.__printed = (window.__printed || 0) + 1; }; window.__saved = [];
    const ow = window.open; window.open = function (u) { const w = ow.apply(window, arguments); return w || { document: { write() { }, close() { }, open() { } }, close() { }, focus() { }, print() { }, addEventListener() { }, location: {} }; };
    try { Object.keys(localStorage).forEach(k => { if (/^xiii\.tour2?\./.test(k)) { } }); } catch (e) { } });
  return ctx;
}
function watch(pg, E, where) {
  pg.on('pageerror', e => E.push([where(), 'JS', String(e.message).slice(0, 220), (e.stack || '').split('\n').slice(1, 3).join(' ').replace(/http:\/\/localhost:8765\//g, '').slice(0, 220)]));
  pg.on('console', m => { if (m.type() === 'error' && !NOISE.test(m.text())) E.push([where(), 'console', m.text().slice(0, 220)]); });
  pg.on('dialog', d => { (/supprimer|vider|effacer|écraser|remplacer tout|réinitialiser/i.test(d.message()) ? d.dismiss() : d.accept()).catch(() => { }); });
  pg.on('download', d => { pg.__dl = (pg.__dl || 0) + 1; d.cancel().catch(() => { }); });
  pg.on('popup', p => { p.on('pageerror', e => E.push([where(), 'JS fenêtre', String(e.message).slice(0, 220)])); setTimeout(() => p.close().catch(() => { }), 2500); });
}
const clean = async pg => pg.evaluate(() => { document.querySelectorAll('#xt-root,#xtp,#xb-menu').forEach(m => m.remove()); try { if (typeof closeModal === 'function') closeModal(); } catch (e) { }
  document.querySelectorAll('[id$="-ov"],.modal-ov,.modal-overlay,.overlay,[role=dialog]').forEach(o => { const cs = getComputedStyle(o); if (cs.position === 'fixed' && cs.display !== 'none' && !/xaic/.test(o.id) && !(o.matches('[role=dialog]') && !/-ov$|overlay/.test(o.id + ' ' + o.className) && (o.dataset.xa2o || (o.parentElement && o.parentElement.dataset.xa2o) || o.id === 'export-loader'))) { const x = o.querySelector('[data-x],.close,.modal-close,[aria-label=Fermer],[title=Fermer]'); if (x) try { x.click(); } catch (e) { } if (o.isConnected && getComputedStyle(o).display !== 'none') o.remove(); } }); }).catch(() => { });
async function openTool(pg, file, E, tag) {
  try { await pg.goto('http://localhost:8765/' + file + (file.includes('-m') ? '' : '?desktop=1'), { waitUntil: 'load', timeout: 25000 }); } catch (e) { E.push([tag, 'ouverture', e.message.slice(0, 120)]); return false; }
  await pg.waitForTimeout(2600); await clean(pg); return true;
}
// exports : menu 🖨️ Exporter, boutons « out » isolés, format + rendu
async function exportsRun(pg, E, tag) {
  const L = await pg.evaluate(() => {
    const ico = b => ((b.querySelector('.btn-icon') || {}).textContent || b.textContent || '').trim();
    const hold = [...document.querySelectorAll('#xb-hold button')], z = [...document.querySelectorAll('#xb-file button')].filter(b => !/^(xgt-btn|xb-exp|xf-btn|xsh-btn|xpb-btn)$/.test(b.id) && !/💾|📂|⬇️/.test(ico(b)) && !b.dataset.xgtHid);
    const all = hold.concat(z).filter((b, i, a) => a.indexOf(b) === i); all.forEach((b, i) => b.dataset.zp = 'e' + i);
    const sel = document.getElementById('export-format'), opts = sel ? [...sel.options].map(o => o.value) : [];
    return { btns: all.map(b => [b.dataset.zp, (b.title || b.textContent).trim().slice(0, 40)]), opts };
  }).catch(() => ({ btns: [], opts: [] }));
  const did = [];
  const handle = async lab => { await pg.waitForTimeout(700);
    // fenêtre ouverte par l'export : on clique l'action principale (télécharger, générer…) une fois
    const clicked = await pg.evaluate(() => { const ovs = [...document.querySelectorAll('body > *')].filter(o => { const cs = getComputedStyle(o); return cs.position === 'fixed' && cs.display !== 'none' && o.offsetHeight > 120 && !/^(xb-master|xaic|xt-tab|xs-gear|xzz|toast)/.test(o.id) && o.querySelector('button'); });
      const o = ovs.pop(); if (!o) return '';
      const b = [...o.querySelectorAll('button')].find(x => /(Télécharger|Exporter|Générer|Créer|PDF|Excel|PowerPoint|Word|Imprimer|Enregistrer le|Valider|OK$)/i.test(x.textContent) && !/annuler|fermer|vider|supprimer/i.test(x.textContent) && x.offsetParent);
      if (b) { b.click(); return b.textContent.trim().slice(0, 30); } return '-'; }).catch(() => '');
    if (clicked && clicked !== '-') await pg.waitForTimeout(900);
    did.push(lab + (clicked ? ' › ' + clicked : '')); await clean(pg); };
  for (const [id, lab] of L.btns) { try { await pg.evaluate(i => { const b = document.querySelector('[data-zp="' + i + '"]'); if (b) b.click(); }, id); await handle(lab); } catch (e) { E.push([tag, 'export', lab + ' : ' + e.message.slice(0, 80)]); } }
  if (L.opts.length) for (const v of L.opts) { try { await pg.evaluate(v => { const s = document.getElementById('export-format'); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true }));
      const r = [...s.parentElement.querySelectorAll('button')].find(b => /🖼️|Créer/.test(b.textContent + b.title)); if (r) r.click(); }, v); await handle('format ' + v); } catch (e) { E.push([tag, 'export', v + ' : ' + e.message.slice(0, 80)]); } }
  const st = await pg.evaluate(() => ({ pdf: (window.__saved || []).length, print: window.__printed || 0 })).catch(() => ({})); st.dl = pg.__dl || 0; pg.__dl = 0; did.push('= fichiers ' + JSON.stringify(st));
  return did;
}
async function gates(pg, E, tag, file) {
  const rows = await pg.evaluate(async () => { const g = document.getElementById('xgt-btn'); if (!g) return []; g.click(); await new Promise(r => setTimeout(r, 300)); const L = [...document.querySelectorAll('#xgt-ov [data-a]')].filter(x => x.dataset.dir !== 'in' && !x.dataset.all).map(x => x.dataset.a); document.querySelectorAll('#xgt-ov').forEach(o => o.remove()); return [...new Set(L)]; }).catch(() => []);
  const done = [];
  for (const to of rows) {
    try { await pg.evaluate(async to => { document.getElementById('xgt-btn').click(); await new Promise(r => setTimeout(r, 250)); const row = [...document.querySelectorAll('#xgt-ov [data-a]')].find(x => x.dataset.a === to && x.dataset.dir !== 'in'); if (row) { row.click(); await new Promise(r => setTimeout(r, 120)); const go = document.querySelector('#xgt-ov [data-go]') || [...document.querySelectorAll('#xgt-ov button')].find(b => /Envoyer|Ouvrir|→/.test(b.textContent) && b !== row); if (go) go.click(); } }, to);
      await pg.waitForTimeout(900);
      if (!pg.url().includes(file)) { done.push(to + ' (ouvre ' + pg.url().split('/').pop().slice(0, 30) + ')'); await pg.waitForTimeout(1500); await openTool(pg, file, E, tag); continue; }
      const h = await pg.evaluate(() => { const ovs = [...document.querySelectorAll('body > *')].filter(o => getComputedStyle(o).position === 'fixed' && o.offsetHeight > 120 && o.querySelector('button') && !/^(xb-master|xaic|xt-tab|xs-gear)/.test(o.id)); const o = ovs.pop(); if (!o) return ''; const b = [...o.querySelectorAll('button')].find(x => /(Envoyer|Transmettre|Créer|Valider|OK)/i.test(x.textContent) && !/annuler|fermer/i.test(x.textContent)); if (b) { b.click(); return b.textContent.trim().slice(0, 24); } return '-'; }).catch(() => '');
      await pg.waitForTimeout(600); done.push(to + (h ? ' › ' + h : '')); await clean(pg);
    } catch (e) { if (/context was destroyed|navigat/i.test(e.message)) { done.push(to + ' (ouvre un autre outil)'); await pg.waitForTimeout(1500); await openTool(pg, file, E, tag); } else E.push([tag, 'passerelle', to + ' : ' + e.message.slice(0, 80)]); }
  }
  return done;
}
function heavy(data) { // projet très chargé : chaque liste d'objets (3 premiers niveaux) ×8, sans multiplier les listes imbriquées entre elles
  const walk = (o, d) => { if (!o || typeof o !== 'object' || d > 4) return; for (const k of Object.keys(o)) { const v = o[k];
    if (Array.isArray(v) && v.length && v.length < 60 && v.every(x => x && typeof x === 'object' && !Array.isArray(x)) && d <= 2) { const base = v.slice(); for (let i = 1; i < 8; i++) base.forEach(x => { const c = JSON.parse(JSON.stringify(x)); if (c.id != null) c.id = c.id + '_k' + i; if (c.name) c.name = c.name + ' ' + i; v.push(c); }); }
    else if (v && typeof v === 'object') walk(v, d + 1); } };
  walk(data, 0); return data;
}
(async () => {
  const b = await chromium.launch();
  const job = async tool => {
    const file = tool + '.html', E = [], S = {}; let cur = 'ouverture'; const tag = () => cur; R[tool] = { E, S };
    // 1. projet vide
    let ctx = await ctxNew(b), pg = await ctx.newPage(); watch(pg, E, () => cur);
    await pg.addInitScript(t => { localStorage.setItem('xiii.tour2.' + t + '.hide', '1'); }, tool);
    cur = 'vide'; let hasXM = false;
    if (await openTool(pg, file, E, 'vide')) { hasXM = await pg.evaluate(t => !!(window.XMODELS && XMODELS.adapters[t]), tool).catch(e => { E.push(['vide', 'robot', 'XMA ' + e.message.slice(0, 100)]); return false; }); if (!hasXM) E.push(['vide', 'info', 'pas d’exemples types']); S.vide = { exports: await exportsRun(pg, E, 'vide') }; cur = 'vide/passerelles'; S.vide.gates = await gates(pg, E, 'vide', file); }
    await ctx.close();
    if (hasXM) for (const ty of TYPES.concat(WITH_CHARGE ? ['charge'] : [])) {
      ctx = await ctxNew(b); pg = await ctx.newPage(); cur = ty; watch(pg, E, () => cur);
      await pg.addInitScript(t => { localStorage.setItem('xiii.tour2.' + t + '.hide', '1'); }, tool);
      if (!await openTool(pg, file, E, ty)) { await ctx.close(); continue; }
      const ok = await pg.evaluate(async ([t, ty, H]) => { try { const d = await XMODELS.apply(t, ty === 'charge' ? 'tv' : ty, false); if (ty === 'charge') { const heavy = new Function('return ' + H)(); const k = XMODELS.keys[t]; localStorage.setItem(k, JSON.stringify(heavy(JSON.parse(localStorage.getItem(k))))); } return 'ok'; } catch (e) { return 'ERR ' + e.message; } }, [tool, ty, heavy.toString()]).catch(e => 'ERR ' + e.message);
      if (ok !== 'ok') E.push([ty, 'exemple', ok.slice(0, 160)]);
      cur = ty + '/ouverture'; await openTool(pg, file, E, ty);
      cur = ty + '/exports'; S[ty] = { exports: await exportsRun(pg, E, ty) };
      if (ty === 'tv' || ty === 'charge') { cur = ty + '/passerelles'; S[ty].gates = await gates(pg, E, ty, file); }
      if (ty === 'tv' && fs.existsSync(path.join('/home/claude/suite-xiii', tool + '-m.html'))) { // version téléphone avec le même projet
        const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 844 }); cur = 'mobile'; watch(m, E, () => cur); await openTool(m, tool + '-m.html', E, 'mobile'); await m.waitForTimeout(800); await m.close(); }
      await ctx.close();
    }
    if (!hasXM && fs.existsSync(path.join('/home/claude/suite-xiii', tool + '-m.html'))) { ctx = await ctxNew(b, true); pg = await ctx.newPage(); cur = 'mobile'; watch(pg, E, () => cur); await openTool(pg, tool + '-m.html', E, 'mobile'); await ctx.close(); }
    fs.writeFileSync(out, JSON.stringify(R));
  };
  const Q = tools.slice(); await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const t = Q.shift(); try { await job(t); } catch (e) { (R[t] = R[t] || { E: [] }).E.push(['?', 'robot', e.message.slice(0, 160)]); } } }));
  fs.writeFileSync(out, JSON.stringify(R)); await b.close();
})();
