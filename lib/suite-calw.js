// SUITE XIII — module commun. Source : xiii-src/suite-calw.js
// =====================================================================
//  SUITE XIII — XCALW : widget « Calendrier du mois » de l'accueil (saison 6, phase D)
//  Toutes les dates de tous les outils (XCALEV : tournages, PLANNO, repérages, matériel, facturation, post-prod…) sur le mois.
//  Jour courant entouré, une pastille de couleur par source, mois précédent / suivant, clic sur un jour = ses événements,
//  clic sur un événement = l'outil concerné. Légende des sources présentes ce mois-ci.
// =====================================================================
(function () {
    if (window.XCALW) return;
    const pad = n => String(n).padStart(2, '0'), iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const APPOF = { dispo: 'calendrier', check: 'index', planno: 'planno', callsheeto: 'callsheeto', conduco: 'conduco', repero: 'repero', matos: 'matos', deviso: 'deviso', posto: 'posto', ressourco: 'ressourco', dossier: 'dossier', backupo: 'backupo', casto: 'casto' };
    let off = 0, pick = null;
    try { const v = JSON.parse(sessionStorage.getItem('xiii.calw') || '{}'); off = v.off || 0; pick = v.pick || null; } catch (e) { }
    const keep = () => { try { sessionStorage.setItem('xiii.calw', JSON.stringify({ off, pick })); } catch (e) { } };
    const css = document.createElement('style'); css.id = 'xcalw-css';
    css.textContent =
        '.xcw{display:flex;flex-direction:column;gap:8px}.xcw-h{display:flex;align-items:center;gap:6px}.xcw-h b{flex:1;font-size:14px;text-transform:capitalize}' +
        '.xcw-h button{width:26px;height:26px;border-radius:7px;border:1px solid var(--border-color,#4a4a50);background:transparent;color:inherit;cursor:pointer;font:inherit;line-height:1;transition:border-color .15s}.xcw-h button:hover{border-color:#f0b378}.xcw-h .t{width:auto;padding:0 8px;font-size:11.5px}' +
        '.xcw-g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;text-align:center}.xcw-g .dw{font-size:10.5px;opacity:.5;font-weight:700;padding-bottom:2px}' +
        '.xcw-g button{position:relative;aspect-ratio:1/0.82;min-height:26px;border:0;border-radius:8px;background:transparent;color:inherit;font:600 12px system-ui,sans-serif;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0;transition:background .15s}' +
        '.xcw-g button:hover{background:rgba(255,255,255,.06)}.xcw-g button.o{opacity:.32}.xcw-g button.we{color:rgba(255,255,255,.62)}.xcw-g button.has{background:rgba(255,255,255,.035)}' +
        '.xcw-g button.td span.n{width:22px;height:22px;line-height:22px;border-radius:50%;box-shadow:0 0 0 2px #f0b378;color:#f6c79a}.xcw-g button.sel{background:rgba(240,179,120,.16)}' +
        '.xcw-g .dt{display:flex;gap:2px;height:5px}.xcw-g .dt i{width:5px;height:5px;border-radius:50%}.xcw-g button.wn::after{content:"";position:absolute;top:3px;right:4px;width:5px;height:5px;border-radius:50%;background:#e57373}' +
        '.xcw-l{display:flex;flex-direction:column;gap:4px;max-height:150px;overflow:auto;scrollbar-width:thin;animation:xcwIn .2s ease-out}@keyframes xcwIn{from{opacity:0;transform:translateY(-4px)}}' +
        '.xcw-l a{display:flex;align-items:baseline;gap:8px;padding:5px 8px;border-radius:8px;background:rgba(255,255,255,.035);color:inherit;text-decoration:none;font-size:12.5px;border-left:3px solid var(--c)}.xcw-l a:hover{background:rgba(255,255,255,.07)}.xcw-l small{opacity:.6;margin-left:auto;white-space:nowrap}.xcw-l .e{opacity:.6;font-size:12px}' +
        '.xcw-k{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11px;opacity:.75}.xcw-k span{display:inline-flex;align-items:center;gap:4px}.xcw-k i{width:7px;height:7px;border-radius:50%}' +
        '@media (prefers-reduced-motion:reduce){.xcw-l{animation:none}}';
    (document.head || document.documentElement).appendChild(css);
    function html() {
        if (typeof XCALEV === 'undefined') return '<p class="xd-e">Calendrier indisponible.</p>';
        const SRC = XCALEV.SRC, now = new Date(), m0 = new Date(now.getFullYear(), now.getMonth() + off, 1), y = m0.getFullYear(), mo = m0.getMonth(), td = iso(now);
        let E = []; try { E = XCALEV.events() || []; } catch (e) { }
        const first = new Date(y, mo, 1), start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7)); // lundi
        const cells = [], by = {};
        E.forEach(e => { let d = new Date(e.d0 + 'T12:00'); const end = new Date(e.d1 + 'T12:00'); for (let n = 0; d <= end && n < 62; n++, d.setDate(d.getDate() + 1)) (by[iso(d)] = by[iso(d)] || []).push(e); });
        const used = new Set();
        const lastD = new Date(y, mo + 1, 0), N = Math.round((lastD - start) / 864e5) >= 35 ? 42 : 35;
        for (let i = 0; i < N; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = iso(d), L = by[k] || [], cs = [...new Set(L.map(e => e.src))].slice(0, 4);
            if (d.getMonth() === mo) cs.forEach(s => used.add(s));
            cells.push('<button type="button" data-cald="' + k + '" class="' + [d.getMonth() !== mo && 'o', k === td && 'td', k === pick && 'sel', L.length && 'has', (d.getDay() === 0 || d.getDay() === 6) && 'we', L.some(e => e.warn) && 'wn'].filter(Boolean).join(' ') + '" title="' + esc(d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + (L.length ? ' · ' + L.length + ' événement' + (L.length > 1 ? 's' : '') : '')) + '"><span class="n">' + d.getDate() + '</span><span class="dt">' + cs.map(s => '<i style="background:' + (SRC[s] ? SRC[s][2] : '#999') + '"></i>').join('') + '</span></button>'); }
        let list = '';
        if (pick) { const L = (by[pick] || []).slice(0, 12); list = '<div class="xcw-l">' + (L.length ? L.map(e => '<a href="' + (APPOF[e.src] || 'calendrier') + '.html" style="--c:' + (SRC[e.src] ? SRC[e.src][2] : '#999') + '"><span>' + esc(e.title) + '</span><small>' + esc((e.time ? e.time + ' · ' : '') + (SRC[e.src] ? SRC[e.src][1] : '')) + '</small></a>').join('') : '<span class="e">Rien de prévu le ' + esc(new Date(pick + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })) + '.</span>') + '</div>'; }
        const key = [...used].map(s => '<span><i style="background:' + SRC[s][2] + '"></i>' + esc(SRC[s][1]) + '</span>').join('');
        return '<div class="xcw"><div class="xcw-h"><button type="button" data-calnav="-1" title="Mois précédent">‹</button><b>' + esc(m0.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })) + '</b>' + (off ? '<button type="button" class="t" data-calnav="0">Aujourd\'hui</button>' : '') + '<button type="button" data-calnav="1" title="Mois suivant">›</button></div>' +
            '<div class="xcw-g">' + ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => '<span class="dw">' + x + '</span>').join('') + cells.join('') + '</div>' + list + (key ? '<div class="xcw-k">' + key + '</div>' : '') +
            '<a class="xd-l" href="calendrier.html">Ouvrir CALENDRIER →</a></div>';
    }
    function redraw() { document.querySelectorAll('.xd-c[data-card="cal"] .xcw').forEach(w => { const t = document.createElement('div'); t.innerHTML = html(); w.replaceWith(t.firstChild); }); }
    document.addEventListener('click', e => {
        const n = e.target.closest && e.target.closest('[data-calnav]'), d = e.target.closest && e.target.closest('[data-cald]'); if (!n && !d) return; if (!e.target.closest('.xcw')) return;
        e.preventDefault(); if (n) { const v = +n.dataset.calnav; off = v === 0 ? 0 : off + v; if (v === 0) pick = null; } else pick = pick === d.dataset.cald ? null : d.dataset.cald; keep(); redraw();
    });
    window.XCALW = { html, redraw };
    try { if (typeof XDASH !== 'undefined') setTimeout(() => XDASH.render(), 50); } catch (e) { }
})();
