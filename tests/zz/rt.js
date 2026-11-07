// Aller-retour bureau ⇄ téléphone (lien #mx=, comme le QR code) : le téléphone reçoit le projet, le renvoie, le bureau fusionne sans rien perdre
// node rt.js <outil> …   serveur :8766
const { chromium, devices } = require('playwright');
const NOISE = /Failed to load resource|net::ERR|favicon|ResizeObserver|status of 4\d\d|AbortError|NetworkError|Failed to fetch|Load failed|CORS|serviceWorker/i;
const TYPE = { scripto: 'fiction', casto: 'fiction', decoup: 'fiction', storyboardo: 'fiction', moodo: 'fiction', repero: 'fiction', ressourco: 'fiction', posto: 'fiction', backupo: 'fiction', cadro: 'fiction' };
(async () => { const b = await chromium.launch(); const R = {};
  const snap = async (pg, t) => pg.evaluate(t => { const k = (window.XMODELS && XMODELS.keys && XMODELS.keys[t]) || (t + 'XIII.project'); const v = localStorage.getItem(k) || ''; let n = 0; const walk = o => { if (Array.isArray(o)) o.forEach(x => { if (x && typeof x === 'object') n++; walk(x); }); else if (o && typeof o === 'object') Object.values(o).forEach(walk); }; try { walk(JSON.parse(v)); } catch (e) { } let it = null, x0 = null; try { const o = JSON.parse(v); if (o.tabs) { it = o.tabs.reduce((a, t) => a + (t.items || []).length, 0); x0 = o.tabs[0].items[0] && o.tabs[0].items[0].x; } else if (o.spots) { it = o.spots.length; x0 = (o.spots[0].notes || '').slice(-20); } else if (o.cues) { it = o.cues.length; x0 = o.cues[0] && o.cues[0].t; } else if (o.versions) { it = o.versions.length; x0 = o.versions.map(v => v.name).join('|').slice(0, 80); } } catch (e) { } return { k, bytes: v.length, objs: n, it, x0 }; }, t).catch(e => ({ err: e.message }));
  for (const t of process.argv.slice(2)) { const E = [], st = []; const res = { E, st };
    const dctx = await b.newContext({ viewport: { width: 1440, height: 900 } }), mctx = await b.newContext({ ...devices['iPhone 13'] });
    for (const c of [dctx, mctx]) { await c.route(/^(?!http:\/\/localhost)/, r => r.abort()); await c.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } window.open = u => { window.__op = (window.__op || []).concat([String(u)]); return { document: { write() { }, close() { } }, close() { }, focus() { } }; }; try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__clip = String(t); }, readText: async () => window.__clip || '' }, configurable: true }); } catch (e) { } }); }
    const watch = (pg, w) => { pg.on('pageerror', e => E.push([w, 'JS', e.message.slice(0, 160)])); pg.on('console', m => { if (m.type() === 'error' && !NOISE.test(m.text())) E.push([w, 'console', m.text().slice(0, 160)]); }); pg.on('dialog', d => { st.push(w + ' dialogue: ' + d.message().slice(0, 80)); d.accept().catch(() => { }); }); };
    try {
      // 1. bureau : exemple type, puis 📱 → « Ouvrir sur ce poste » donne le lien de la version mobile
      const d = await dctx.newPage(); watch(d, 'bureau'); await d.goto('http://localhost:8766/' + t + '.html?desktop=1'); await d.waitForTimeout(2300);
      await d.evaluate(async ([t, ty]) => { try { await XMODELS.apply(t, ty, false); } catch (e) { } }, [t, TYPE[t] || 'tv']); if (t === 'soustitro') await d.evaluate(() => { try { if (typeof P !== 'undefined' && !(P.cues || []).length) { P.cues = [{ id: 'c1', s: 1, e: 3, t: 'Bonjour' }, { id: 'c2', s: 3.5, e: 6, t: 'Au revoir' }]; saveProject && saveProject(false); } } catch (e) { } const k = 'soustitroXIII.project'; let p = {}; try { p = JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { } if (!(p.cues || []).length) { p.cues = [{ id: 'c1', s: 1, e: 3, t: 'Bonjour' }, { id: 'c2', s: 3.5, e: 6, t: 'Au revoir' }]; localStorage.setItem(k, JSON.stringify(p)); } });
      await d.reload(); await d.waitForTimeout(2800);
      res.d0 = await snap(d, t);
      const go = await d.evaluate(async () => { document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()); const w = ms => new Promise(r => setTimeout(r, ms));
        const vis = [...document.querySelectorAll('button')].filter(x => x.offsetParent || x.closest('#xb-hold'));
        const b = document.getElementById('xm-btn') || vis.find(x => /📱/.test(x.textContent) && /(mobile|téléphone|telephone)/i.test(x.title + x.textContent)) || [...document.querySelectorAll('button')].find(x => /📱/.test(x.textContent) && /(mobile|téléphone)/i.test(x.title));
        if (!b) return 'pas de bouton 📱'; b.click(); await w(600);
        const g = document.getElementById('xm-go') || [...document.querySelectorAll('#xm-d-ov button,.modal button,[class*=modal] button')].find(x => /envoyer|qr|téléphone/i.test(x.textContent) && !/annuler/i.test(x.textContent)); if (g && !document.getElementById('xm-copy')) { g.click(); await w(1200); }
        const c = document.getElementById('xm-copy'); if (!c) return 'pas de « copier le lien » (' + ((document.getElementById('xm-d-ov') || {}).innerText || '').slice(0, 60).replace(/\n/g, ' ') + ')'; c.click(); await w(500); return window.__clip || 'lien non copié'; });
      st.push('lien bureau→mobile ' + (go.length > 60 ? go.slice(0, 40) + '… (' + go.length + ' car.)' : go)); if (!/#mx=/.test(go)) { R[t] = res; await dctx.close(); await mctx.close(); continue; }
      // 2. téléphone : ouverture du lien (équivalent du QR code)
      const m = await mctx.newPage(); watch(m, 'mobile'); await m.goto(go.replace(/^https?:\/\/[^/]+/, 'http://localhost:8766')); await m.waitForTimeout(3200);
      res.m1 = await m.evaluate(() => ({ txt: document.body.innerText.length, keys: Object.keys(localStorage).filter(k => !/^xiii\.(tips|tour)/.test(k)).slice(0, 6), hash: location.hash.slice(0, 10) }));
      // 3. téléphone : 📤 Renvoyer au bureau → lien
      await m.evaluate(t => { try { // modification faite sur le téléphone (les retours ne contiennent que les changements)
        } catch (e) { console.error('modif ' + e.message); } }, t);
      if (['soustitro', 'repero', 'plano'].includes(t)) { const mu = m.url(); await m.goto('http://localhost:8766/robots.txt').catch(() => { }); const ok = await m.evaluate(t => { const k = 'xiii.m.' + t; const o = JSON.parse(localStorage.getItem(k) || 'null'); if (!o) return 'pas de clé';
          if (t === 'soustitro') { const c = o.cols && o.cols.cues; if (!c || !c[0]) return 'vide'; c[0].t += ' (corrigé)'; }
          if (t === 'repero') { const c = o.spots && o.spots[0]; if (!c) return 'vide'; c.notes = (c.notes || '') + ' — vu sur place'; o.rx = o.rx || {}; o.rx[c.id] = Object.assign(o.rx[c.id] || {}, { notes: 1 }); }
          if (t === 'plano') { const c = o.P && o.P.tabs[0] && o.P.tabs[0].items[0]; if (!c) return 'vide'; c.x = (+c.x || 0) + 7; }
          localStorage.setItem(k, JSON.stringify(o)); return k; }, t); st.push('modif mobile ' + ok); await m.goto(mu); await m.waitForTimeout(2500); }
      const back = await m.evaluate(async () => { if (typeof XM === 'undefined') return 'pas de XM'; let L = ''; const ol = XM.link; XM.link = async function () { const u = await ol.apply(this, arguments); L = u; return u; };
        const find = rx => [...document.querySelectorAll('button,a,[role=button],.m-item,[data-act]')].find(x => x.offsetParent && rx.test(x.textContent));
        let r = find(/renvoyer au bureau/i); if (!r) { const mn = find(/^\s*(⋯|…|···|•••)\s*$/) || document.querySelector('[aria-label*=enu],#m-more,.m-more'); if (mn) { mn.click(); await new Promise(z => setTimeout(z, 400)); } r = find(/renvoyer au bureau/i); }
        if (!r && typeof sendReturn === 'function') r = { click: () => sendReturn() };
        if (!r) return 'pas de « Renvoyer au bureau »'; r.click(); await new Promise(z => setTimeout(z, 900));
        await new Promise(z => setTimeout(z, 900)); const c = document.getElementById('xm-copy'); if (c) { c.click(); await new Promise(z => setTimeout(z, 600)); }
        return window.__clip || L || ('pas de lien de retour : ' + document.body.innerText.slice(-160).replace(/\n/g, ' ')); });
      st.push('lien mobile→bureau ' + (/#mx=/.test(back) ? back.slice(0, 40) + '…' : back)); await m.screenshot({ path: '/tmp/zz/rt_' + t + '.png' }).catch(() => { });
      if (/#mx=/.test(back)) { // 4. bureau : ouverture du lien de retour, fusion
        const d2 = await dctx.newPage(); watch(d2, 'bureau-retour'); await d2.goto(back.replace(/^https?:\/\/[^/]+/, 'http://localhost:8766') .replace(/-m\.html/, '.html').replace(/\.html(#|\?)/, '.html?desktop=1$1')); await d2.waitForTimeout(3500);
        await d2.waitForSelector('#m-ov [data-i]', { timeout: 9000 }).catch(() => { });
        const clk = await d2.evaluate(() => { const B = [...document.querySelectorAll(document.querySelector('#m-ov [data-i]') ? '#m-ov button' : 'button')].filter(x => x.offsetParent && /(fusionner|ajouter|appliquer|intégrer|importer|valider|récupérer|mettre à jour|ok$)/i.test(x.textContent) && !/annuler/i.test(x.textContent)); const b = B.find(x => /fusionner|ajouter ses|intégrer|appliquer|mettre/i.test(x.textContent)) || B[0]; if (b) { b.click(); return b.textContent.trim().slice(0, 40); } return ''; }); st.push('fusion: ' + (clk || 'aucune fenêtre')); if (!clk || !/fusionner|ajouter ses/i.test(clk)) { st.push('url ' + d2.url().slice(0, 60)); await d2.screenshot({ path: '/tmp/zz/rt_' + t + '_d2.png' }).catch(() => { }); } await d2.waitForTimeout(1800);
        res.d1 = await snap(d2, t); }
    } catch (e) { E.push(['robot', 'robot', e.message.slice(0, 160)]); }
    R[t] = res; await dctx.close(); await mctx.close(); }
  console.log(JSON.stringify(R, null, 1)); await b.close(); })();
