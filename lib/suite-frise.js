// SUITE XIII — module commun. Source : xiii-src/suite-frise.js
// =====================================================================
//  SUITE XIII — XFRISE : widget « Frise du projet » de l'accueil (saison 6, phase D)
//  Prépa → tournage → post → livraison sur une seule ligne de temps, jalons ◆ et repère « aujourd'hui ».
//  Sources : les phases et jalons de PLANNO (tâches groupées par phase) ; à défaut, les dates de la fiche projet
//  (début, fin de tournage, diffusion) et les journées de CALL SHEETO.
// =====================================================================
(function () {
    if (window.XFRISE) return;
    const J = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pad = n => String(n).padStart(2, '0'), iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const isoOf = s => { if (!s) return ''; s = String(s); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); const m = /(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})/.exec(s); return m ? (m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + pad(m[2]) + '-' + pad(m[1]) : ''; };
    const add = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };
    const day = s => Math.round(new Date(s + 'T12:00').getTime() / 864e5), fr = s => new Date(s + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const PAL = { prepa: '#64b5f6', tour: '#f0b378', post: '#ba68c8', liv: '#81c784', autre: '#90a4ae' };
    const kindOf = n => { n = String(n || '').toLowerCase(); return /livr|diffus|sortie|rendu|remise|\bpad\b/.test(n) ? 'liv' : /pr[ée]pa|pr[ée]-?prod|repérage|casting|écriture|dév/.test(n) ? 'prepa' : /tourn|plateau|direct|captation/.test(n) ? 'tour' : /post|montage|étalo|mix|vfx|\bson\b/.test(n) ? 'post' : 'autre'; };
    const css = document.createElement('style'); css.id = 'xfrise-css';
    css.textContent =
        '.xfr{display:flex;flex-direction:column;gap:6px}.xfr-w{position:relative;height:118px;margin:4px 6px 0}' +
        '.xfr-tk{position:absolute;left:0;right:0;top:44px;height:2px;background:rgba(255,255,255,.1);border-radius:2px}' +
        '.xfr-ph{position:absolute;top:34px;height:22px;border-radius:7px;background:var(--c);opacity:.9;display:flex;align-items:center;padding:0 7px;font:700 11px system-ui,sans-serif;color:#15110c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transform-origin:left center;animation:xfrGrow .7s cubic-bezier(.2,.7,.2,1) backwards}' +
        '.xfr-ph.past{opacity:.55}@keyframes xfrGrow{from{transform:scaleX(0);opacity:0}}' +
        '.xfr-ms{position:absolute;top:28px;width:0;display:flex;flex-direction:column;align-items:center;animation:xfrFade .4s ease backwards}.xfr-ms i{width:11px;height:11px;transform:rotate(45deg);background:var(--c);border:2px solid var(--bg-panel,#1c1c1f);margin-top:-1px}' +
        '.xfr-ms span{position:absolute;white-space:nowrap;font-size:11px;line-height:1.25;text-align:center}.xfr-ms.u span{bottom:22px}.xfr-ms.d span{top:36px}.xfr-ms small{display:block;opacity:.6;font-size:10.5px}' +
        '.xfr-ms.l span{left:-4px;text-align:left}.xfr-ms.r span{right:-4px;text-align:right}.xfr-ms:not(.l):not(.r) span{transform:translateX(-50%);left:0}' +
        '.xfr-now{position:absolute;top:8px;bottom:22px;width:2px;background:#e57373;border-radius:2px;animation:xfrFade .5s ease .5s backwards}.xfr-now b{position:absolute;bottom:-20px;transform:translateX(-50%);left:1px;font:700 10.5px system-ui,sans-serif;color:#fff;background:#c75353;border-radius:999px;padding:1px 7px;white-space:nowrap}' +
        '@keyframes xfrFade{from{opacity:0}}.xfr-ax{display:flex;justify-content:space-between;font-size:10.5px;opacity:.5;margin:0 6px}' +
        '.xfr-k{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px}.xfr-k span{display:inline-flex;align-items:center;gap:5px}.xfr-k i{width:9px;height:9px;border-radius:3px;background:var(--c)}.xfr-k em{font-style:normal;opacity:.6}' +
        '@media (prefers-reduced-motion:reduce){.xfr-ph,.xfr-ms,.xfr-now{animation:none}}';
    (document.head || document.documentElement).appendChild(css);
    function data(f) {
        const PH = {}, MS = []; const td = iso(new Date());
        const pl = J('plannoXIII.project'); (pl && pl.tasks || []).forEach(t => { const a = isoOf(t.start), b = isoOf(t.end) || a; if (!a) return; if (t.ms) { MS.push({ d: b, t: t.name, c: PAL[kindOf(t.phase || t.name)] }); return; }
            const name = t.phase || 'Projet', k = kindOf(name), P = PH[name] = PH[name] || { name, k, a, b }; if (a < P.a) P.a = a; if (b > P.b) P.b = b; });
        let L = Object.values(PH);
        const deb = f && isoOf(f.debut), fin = (f && isoOf(f.fin)) || deb, dif = f && isoOf(f.diffusion);
        const cs = J('callsheetoXIII.project'), days = ((cs && cs.days) || []).map(d => isoOf(d.date)).filter(Boolean).sort();
        if (!L.length) { const t0 = deb || days[0], t1 = fin && fin >= (t0 || '') ? fin : days[days.length - 1] || t0; if (!t0) return null;
            L = [{ name: 'Prépa', k: 'prepa', a: add(t0, -21), b: add(t0, -1) }, { name: 'Tournage', k: 'tour', a: t0, b: t1 }, { name: 'Post-production', k: 'post', a: add(t1, 1), b: dif ? add(dif, -1) : add(t1, 35) }]; }
        if (dif) MS.push({ d: dif, t: '📺 Diffusion', c: PAL.liv });
        if (deb && !MS.some(m => m.d === deb)) MS.push({ d: deb, t: '🎬 1er jour', c: PAL.tour });
        L.sort((x, y) => x.a < y.a ? -1 : 1);
        return { L, MS: MS.sort((x, y) => x.d < y.d ? -1 : 1).slice(0, 8), td };
    }
    function html(f) {
        const D = data(f); if (!D) return '<p class="xd-e">Ajoutez les dates du projet (fiche projet) ou des phases dans PLANNO pour voir la frise.</p>';
        const all = D.L.flatMap(p => [p.a, p.b]).concat(D.MS.map(m => m.d)); let lo = all.reduce((a, b) => a < b ? a : b), hi = all.reduce((a, b) => a > b ? a : b);
        const span = Math.max(1, day(hi) - day(lo)); lo = add(lo, -Math.ceil(span * .02)); hi = add(hi, Math.ceil(span * .02)); const S = Math.max(1, day(hi) - day(lo));
        const X = s => Math.max(0, Math.min(100, (day(s) - day(lo)) / S * 100));
        const ph = D.L.map((p, i) => { const x0 = X(p.a), x1 = X(add(p.b, 1)); return '<div class="xfr-ph' + (p.b < D.td ? ' past' : '') + '" style="--c:' + PAL[p.k] + ';left:' + x0 + '%;width:' + Math.max(1.5, x1 - x0) + '%;animation-delay:' + i * 120 + 'ms" title="' + esc(p.name + ' · ' + fr(p.a) + ' → ' + fr(p.b)) + '">' + esc(p.name) + '</div>'; }).join('');
        const ms = D.MS.map((m, i) => { const x = X(m.d), side = x < 12 ? ' l' : x > 88 ? ' r' : ''; return '<div class="xfr-ms ' + (i % 2 ? 'd' : 'u') + side + '" style="--c:' + m.c + ';left:' + x + '%;animation-delay:' + (400 + i * 90) + 'ms" title="' + esc(m.t + ' · ' + fr(m.d)) + '"><i></i><span>' + esc(m.t) + '<small>' + esc(fr(m.d)) + '</small></span></div>'; }).join('');
        const now = D.td >= lo && D.td <= hi ? '<div class="xfr-now" style="left:' + X(D.td) + '%"><b>aujourd\'hui</b></div>' : '';
        const cur = D.L.find(p => p.a <= D.td && D.td <= p.b), nxt = D.L.find(p => p.a > D.td);
        const st = cur ? 'En cours : <b>' + esc(cur.name) + '</b> · jusqu\'au ' + esc(fr(cur.b)) : nxt ? 'Prochaine étape : <b>' + esc(nxt.name) + '</b> le ' + esc(fr(nxt.a)) + ' (J-' + (day(nxt.a) - day(D.td)) + ')' : D.td > hi ? 'Projet terminé' : '';
        return '<div class="xfr">' + (st ? '<div class="xd-m" style="margin:0">' + st + '</div>' : '') + '<div class="xfr-w"><div class="xfr-tk"></div>' + ph + ms + now + '</div><div class="xfr-ax"><span>' + esc(fr(lo)) + '</span><span>' + esc(fr(hi)) + '</span></div>' +
            '<div class="xfr-k">' + D.L.map(p => '<span style="--c:' + PAL[p.k] + '"><i></i>' + esc(p.name) + ' <em>' + esc(fr(p.a)) + ' → ' + esc(fr(p.b)) + '</em></span>').join('') + '</div><a class="xd-l" href="planno.html">Ouvrir PLANNO →</a></div>';
    }
    window.XFRISE = { html };
    try { if (typeof XDASH !== 'undefined') setTimeout(() => XDASH.render(), 60); } catch (e) { }
})();
