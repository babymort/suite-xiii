// =====================================================================
//  SUITE XIII — XWX5 : widgets « Météo des lieux » (5 jours) et « Compte à rebours » de l'accueil (saison 6, phase D)
//  Météo : lieux géolocalisés de CALL SHEETO (prochaine journée) et de REPERO ; un onglet par lieu ; 5 jours (icône, max / min,
//  pluie, vent), les jours de tournage marqués 🎬, lever / coucher et heure dorée du jour choisi. Source : open-meteo.com (sans clé),
//  mise en cache 1 h dans la session.
//  Compte à rebours : jusqu'à la convocation du prochain jour de tournage (CALL SHEETO, sinon début de la fiche projet), à la seconde.
// =====================================================================
(function () {
    if (window.XWX5) return;
    const J = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pad = n => String(n).padStart(2, '0'), iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), today = () => iso(new Date());
    const ICO = c => c === 0 ? '☀️' : c <= 2 ? '🌤️' : c === 3 ? '☁️' : c <= 48 ? '🌫️' : c <= 57 ? '🌦️' : c <= 67 ? '🌧️' : c <= 77 ? '🌨️' : c <= 82 ? '🌦️' : '⛈️';
    const css = document.createElement('style'); css.id = 'xwx5-css';
    css.textContent =
        '.xw5{display:flex;flex-direction:column;gap:8px}.xw5-t{display:flex;gap:4px;flex-wrap:wrap}.xw5-t button{height:24px;padding:0 9px;border-radius:999px;border:1px solid var(--border-color,#4a4a50);background:transparent;color:inherit;font:600 11.5px system-ui,sans-serif;cursor:pointer;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:border-color .15s,background .15s}.xw5-t button.on{background:rgba(240,179,120,.18);border-color:#f0b378;color:#f6c79a}' +
        '.xw5-d{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}.xw5-d>div{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 2px;border-radius:10px;background:rgba(255,255,255,.035);font-size:11.5px;animation:xw5In .35s cubic-bezier(.2,.7,.2,1) backwards}' +
        '.xw5-d>div.sh{box-shadow:inset 0 0 0 1.5px var(--xc-1,#f0b378);background:rgba(240,179,120,.1)}.xw5-d .dn{font-weight:700;opacity:.75;text-transform:capitalize}.xw5-d .ic{font-size:22px;line-height:1.2}.xw5-d .tx b{font-size:14px}.xw5-d .tx span{opacity:.55}.xw5-d .rn{opacity:.7}.xw5-d .rn.hi{color:var(--xc-3,#64b5f6);opacity:1;font-weight:700}.xw5-d .sh-m{position:absolute;top:2px;right:4px;font-size:10px}' +
        '@keyframes xw5In{from{opacity:0;transform:translateY(6px)}}.xw5-s{font-size:11.5px;opacity:.75}' +
        '.xcd{display:flex;flex-direction:column;gap:6px}.xcd-n{display:flex;gap:6px;align-items:flex-end}.xcd-n div{display:flex;flex-direction:column;align-items:center;min-width:46px;padding:6px 4px;border-radius:10px;background:rgba(255,255,255,.045)}' +
        '.xcd-n b{font:800 26px/1 system-ui,"Segoe UI",sans-serif;font-variant-numeric:tabular-nums;color:var(--xwmc,var(--xc-1,#f6c79a))}.xcd-n small{font-size:10px;opacity:.6;text-transform:uppercase;letter-spacing:.05em;margin-top:3px}.xcd-t{font-size:12.5px}.xcd-t b{font-weight:700}.xcd-live{font:800 20px system-ui,sans-serif;color:#81c784}' +
        '@media (prefers-reduced-motion:reduce){.xw5-d>div{animation:none}}';
    (document.head || document.documentElement).appendChild(css);
    // ---------- lieux et jours de tournage ----------
    function places() {
        const out = [], seen = new Set(), put = (n, lat, lon, src) => { lat = +lat; lon = +lon; if (!isFinite(lat) || !isFinite(lon) || (!lat && !lon)) return; const k = lat.toFixed(2) + ',' + lon.toFixed(2); if (seen.has(k)) return; seen.add(k); out.push({ n: n || 'Lieu', lat, lon, src }); };
        const cs = J('callsheetoXIII.project'), t = today(); const D = ((cs && cs.days) || []).filter(d => d && d.date >= t).sort((a, b) => a.date < b.date ? -1 : 1);
        D.slice(0, 3).forEach(d => (d.locations || []).forEach(l => put(l.name, l.lat, l.lon, 'callsheeto')));
        const rp = J('reperoXIII.project'); ((rp && rp.spots) || []).forEach(s => put(s.name, s.lat, s.lon, 'repero'));
        return out.slice(0, 5);
    }
    const shootDays = () => { const cs = J('callsheetoXIII.project'); return new Set(((cs && cs.days) || []).map(d => d && d.date).filter(Boolean)); };
    let wxSel = 0; try { wxSel = +sessionStorage.getItem('xiii.wx5') || 0; } catch (e) { }
    function wxHtml() {
        const P = places(); if (!P.length) return '<p class="xd-e">Ajoutez des lieux géolocalisés dans REPERO ou dans la feuille de service (CALL SHEETO) pour voir la météo des 5 prochains jours.</p><a class="xd-l" href="repero.html">Ouvrir REPERO →</a>';
        if (wxSel >= P.length) wxSel = 0; const p = P[wxSel];
        return '<div class="xw5">' + (P.length > 1 ? '<div class="xw5-t">' + P.map((x, i) => '<button type="button" data-wx5="' + i + '" class="' + (i === wxSel ? 'on' : '') + '" title="' + esc(x.n) + '">' + (x.src === 'callsheeto' ? '🎬 ' : '📍 ') + esc(x.n) + '</button>').join('') + '</div>' : '<div class="xw5-s">📍 ' + esc(p.n) + '</div>') +
            '<div class="xw5-box" data-lat="' + p.lat + '" data-lon="' + p.lon + '"><p class="xd-e">Chargement de la météo…</p></div><a class="xd-l" href="repero.html">Lieux dans REPERO →</a></div>';
    }
    async function fill(box) {
        const lat = box.dataset.lat, lon = box.dataset.lon, key = 'xw5|' + lat + '|' + lon; let r = null;
        try { const c = JSON.parse(sessionStorage.getItem(key)); if (c && Date.now() - c.at < 36e5) r = c.r; } catch (e) { }
        if (!r) { try { r = await (await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=auto&forecast_days=5')).json(); sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), r })); } catch (e) { box.innerHTML = '<p class="xd-e">Météo indisponible (hors ligne ?).</p>'; return; } }
        const y = r && r.daily; if (!y || !y.time) { box.innerHTML = '<p class="xd-e">Prévision indisponible pour ce lieu.</p>'; return; }
        const SH = shootDays(), hm = x => (x || '').slice(11, 16);
        box.innerHTML = '<div class="xw5-d">' + y.time.map((d, i) => { const sh = SH.has(d), rn = y.precipitation_probability_max[i]; return '<div class="' + (sh ? 'sh' : '') + '" style="animation-delay:' + i * 70 + 'ms" title="' + esc(new Date(d + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + (sh ? ' · jour de tournage' : '') + ' · vent ' + Math.round(y.wind_speed_10m_max[i]) + ' km/h · lever ' + hm(y.sunrise[i]) + ' · coucher ' + hm(y.sunset[i])) + '">' + (sh ? '<span class="sh-m">🎬</span>' : '') +
            '<span class="dn">' + (i === 0 ? 'Auj.' : new Date(d + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')) + '</span><span class="ic">' + ICO(y.weathercode[i]) + '</span><span class="tx"><b>' + Math.round(y.temperature_2m_max[i]) + '°</b> <span>' + Math.round(y.temperature_2m_min[i]) + '°</span></span><span class="rn' + (rn >= 50 ? ' hi' : '') + '">💧 ' + (rn ?? '—') + ' %</span><span class="rn">💨 ' + Math.round(y.wind_speed_10m_max[i]) + '</span></div>'; }).join('') + '</div>' +
            (() => { const i = y.time.findIndex(d => SH.has(d)), k = i < 0 ? 0 : i, ss = y.sunset[k] ? new Date(y.sunset[k]) : null; return '<div class="xw5-s">' + (i < 0 ? 'Aujourd\'hui' : '🎬 ' + new Date(y.time[k] + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })) + ' · 🌅 ' + hm(y.sunrise[k]) + ' · 🌇 ' + hm(y.sunset[k]) + (ss ? ' · ✨ heure dorée dès ' + new Date(ss - 3600e3).toTimeString().slice(0, 5) : '') + '</div>'; })();
    }
    // ---------- compte à rebours ----------
    function target() {
        const cs = J('callsheetoXIII.project'), now = new Date(), t = today();
        const D = ((cs && cs.days) || []).filter(d => d && d.date && d.date >= t).sort((a, b) => a.date < b.date ? -1 : 1);
        for (const d of D) { const hh = ((d.times && d.times.general) || '08:00').match(/(\d{1,2})[:h](\d{2})/), at = new Date(d.date + 'T' + (hh ? pad(hh[1]) + ':' + hh[2] : '08:00') + ':00'); const end = d.times && d.times.wrap ? new Date(d.date + 'T' + d.times.wrap.replace('h', ':').padStart(5, '0') + ':00') : new Date(d.date + 'T23:59:00');
            if (end > now) return { at, end, name: d.name || 'Tournage', loc: ((d.locations || [])[0] || {}).name || '', all: (cs.days || []).length, idx: (cs.days || []).slice().sort((a, b) => a.date < b.date ? -1 : 1).indexOf(d) + 1, conv: hh ? pad(hh[1]) + ':' + hh[2] : '' }; }
        const pr = J('xiii.projets'), f = pr && (pr.list || []).find(x => x && x.id === pr.active);
        if (f && f.debut && /^\d{4}-\d{2}-\d{2}/.test(f.debut)) { const at = new Date(f.debut.slice(0, 10) + 'T08:00:00'); if (at > now) return { at, end: at, name: 'Début du tournage', loc: f.lieu || '', conv: '' }; }
        return null;
    }
    function cdHtml() {
        const T = target(); if (!T) return '<p class="xd-e">Aucun jour de tournage à venir (CALL SHEETO ou fiche projet).</p><a class="xd-l" href="callsheeto.html">Ouvrir CALL SHEETO →</a>';
        return '<div class="xcd" data-at="' + T.at.getTime() + '" data-end="' + T.end.getTime() + '"><div class="xcd-n"></div><div class="xcd-t">' + (T.idx ? '<b>' + esc(T.name) + '</b> (jour ' + T.idx + '/' + T.all + ')' : '<b>' + esc(T.name) + '</b>') + ' · ' + esc(T.at.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })) + (T.conv ? ' · convocation ' + esc(T.conv) : '') + (T.loc ? '<br>📍 ' + esc(T.loc) : '') + '</div><a class="xd-l" href="callsheeto.html">Feuille de service →</a></div>';
    }
    function tick() {
        document.querySelectorAll('.xd-c[data-card="countdown"] .xcd').forEach(w => {
            const n = w.querySelector('.xcd-n'), at = +w.dataset.at, end = +w.dataset.end, now = Date.now();
            if (now >= at && now < end) { if (!n.querySelector('.xcd-live')) n.innerHTML = '<span class="xcd-live">🎬 Tournage en cours</span>'; return; }
            let s = Math.max(0, Math.floor((at - now) / 1000)); const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
            const V = [[d, d > 1 ? 'jours' : 'jour'], [pad(h), 'h'], [pad(m), 'min'], [pad(s), 's']];
            if (n.children.length !== 4) n.innerHTML = V.map(v => '<div><b>' + v[0] + '</b><small>' + v[1] + '</small></div>').join('');
            else V.forEach((v, i) => { const b = n.children[i].firstChild, l = n.children[i].lastChild; if (b.textContent !== String(v[0])) b.textContent = v[0]; if (l.textContent !== v[1]) l.textContent = v[1]; });
        });
    }
    setInterval(tick, 1000);
    function hydrate() { document.querySelectorAll('.xd-c[data-card="wx5"] .xw5-box:not([data-done])').forEach(b => { b.dataset.done = 1; fill(b); }); tick(); }
    new MutationObserver(ms => { if (ms.some(m => [...m.addedNodes].some(n => n.nodeType === 1 && (n.matches('.xd-c,.xd-g,#xd-dash,.xw5') || (n.querySelector && n.querySelector('.xw5-box,.xcd')))))) hydrate(); }).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-wx5]'); if (!b) return; e.preventDefault(); wxSel = +b.dataset.wx5; try { sessionStorage.setItem('xiii.wx5', wxSel); } catch (x) { } const w = b.closest('.xw5'); if (w) { const t = document.createElement('div'); t.innerHTML = wxHtml(); w.replaceWith(t.firstChild); hydrate(); } });
    window.XWX5 = { wxHtml, cdHtml, hydrate };
    try { if (typeof XDASH !== 'undefined') setTimeout(() => { XDASH.render(); hydrate(); }, 70); } catch (e) { }
})();
