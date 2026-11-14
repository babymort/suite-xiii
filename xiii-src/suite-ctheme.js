// =====================================================================
//  SUITE XIII — XCTHEME : créer son thème (saison 6, phase P)
//  ⚙️ › Affichage › « 🎨 Thème perso » : fond, panneaux, texte, accent (= couleur de la suite), arrondis, ombres, transparence.
//  Les autres teintes (panneaux secondaires, menus, champs, texte atténué, bordures) se déduisent automatiquement.
//  Aperçu en direct, thèmes de départ, thèmes enregistrés, export / import (.xiii-theme.json), partage à l'équipe (Master,
//  avec les réglages du projet). Appliqué par-dessus le thème choisi, dans tous les outils, l'accueil et l'espace de travail.
// =====================================================================
(function () {
    if (window.XCTHEME) return;
    const K = 'xiii.ctheme', R = document.documentElement, $ = id => document.getElementById(id);
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const STARTS = [
        { name: 'Minuit bleu', bg: '#0d1320', panel: '#16203a', text: '#e6ecf7', accent: '#4fc3f7', radius: 'm', shadow: 'm', glass: 0 },
        { name: 'Forêt', bg: '#0e1612', panel: '#17241d', text: '#e4efe7', accent: '#81c784', radius: 'l', shadow: 'm', glass: 0 },
        { name: 'Ardoise', bg: '#16181c', panel: '#202329', text: '#e8e9ec', accent: '#b0bec5', radius: 's', shadow: 's', glass: 0 },
        { name: 'Prune', bg: '#150f18', panel: '#221a27', text: '#f0e8f3', accent: '#ba68c8', radius: 'l', shadow: 'l', glass: .12 },
        { name: 'Papier', bg: '#f4f1ea', panel: '#ffffff', text: '#2a2620', accent: '#c56f1e', radius: 'm', shadow: 's', glass: 0 },
        { name: 'Studio', bg: '#0a0a0a', panel: '#141414', text: '#f2f2f2', accent: '#e57373', radius: 's', shadow: 'l', glass: 0 }];
    const hexRgb = h => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    const mix = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; };
    const rgba = (h, a) => 'rgba(' + hexRgb(h).join(',') + ',' + a + ')';
    const lum = h => { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
    const st = () => J(K, { on: false, cur: null, list: [] }) || { on: false, cur: null, list: [] };
    const css = document.createElement('style'); css.id = 'xctheme-css'; (document.head || R).appendChild(css);
    function build(t) {
        const light = lum(t.bg) > .55, g = Math.max(0, Math.min(.6, +t.glass || 0)), P = g ? rgba(t.panel, 1 - g).replace('rgba', 'rgba') : t.panel;
        const V = { '--bg-main': t.bg, '--bg-panel': P, '--bg-panel-alt': mix(t.panel, t.text, .05), '--bg-menu': mix(t.panel, t.bg, .35), '--bg-input': mix(t.bg, t.text, light ? .03 : .06), '--bg-topbar': mix(t.panel, t.bg, .5), '--bg-header': mix(t.panel, t.bg, .5),
            '--text-main': t.text, '--text-dim': rgba(t.text, .72), '--text-muted': rgba(t.text, .52), '--border-color': rgba(t.text, light ? .16 : .14),
            '--xh-bg': t.bg, '--xh-txt': t.text, '--xh-dim': rgba(t.text, .65), '--xh-glass': rgba(t.text, .045), '--xh-glass2': rgba(t.text, .07), '--xh-line': rgba(t.text, .09) };
        const vars = Object.keys(V).map(k => k + ':' + V[k] + '!important').join(';');
        const RAD = { s: 3, m: 0, l: 14 }[t.radius] || 0, SH = t.shadow || 'm';
        return 'html.xct body,html.xct body.light-theme,html.xct body.xh{' + vars + ';color-scheme:' + (light ? 'light' : 'dark') + '}html.xct body{background-color:' + t.bg + '!important;color:' + t.text + '}' +
            (g ? 'html.xct .modal-box,html.xct #xs-panel,html.xct #xb-menu,html.xct #library-panel,html.xct .xd-c{backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2)}' : '') +
            (RAD ? 'html.xct button,html.xct .btn,html.xct input:not([type=checkbox]):not([type=radio]),html.xct select,html.xct textarea,html.xct .modal-box,html.xct .card,html.xct .xd-c,html.xct #xb-menu,html.xct .tab,html.xct .lib-item{border-radius:' + RAD + 'px!important}' : '') +
            (SH === 's' ? 'html.xct .modal-box,html.xct .card,html.xct .xd-c,html.xct #xb-menu,html.xct #xs-panel,html.xct button{box-shadow:none!important}' : SH === 'l' ? 'html.xct .modal-box,html.xct #xb-menu,html.xct #xs-panel{box-shadow:0 30px 80px rgba(0,0,0,.6)!important}html.xct .card,html.xct .xd-c{box-shadow:0 10px 30px rgba(0,0,0,.35)!important}' : '');
    }
    function cur() { const s = st(); if (!s.on) return null; if (s.cur && s.cur.team) { const p = typeof XPCFG !== 'undefined' ? (XPCFG.get() || {}).ctheme : null; return p || null; } return s.cur; }
    let addedLight = false;
    function apply(t) { t = t || cur(); R.classList.toggle('xct', !!t); css.textContent = t ? build(t) : '';
        // thème perso clair : on active aussi le mode clair des outils (barres, menus pensés pour fond clair)
        const b = document.body; if (!b) return; const L = !!(t && lum(t.bg) > .55);
        if (L && !b.classList.contains('light-theme')) { b.classList.add('light-theme'); addedLight = true; } else if (!L && addedLight) { b.classList.remove('light-theme'); addedLight = false; } }
    function accent(c) { if (!c) return; try { localStorage.setItem('xiii.color', JSON.stringify({ mode: 'perso', c })); if (window.XCOLOR) XCOLOR.apply(); } catch (e) { } }
    // ---------- fenêtre ----------
    const box = document.createElement('style'); box.textContent =
        '#xct{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:flex-end;padding:16px;font:13px/1.45 system-ui,"Segoe UI",sans-serif}#xct .b{width:min(420px,100%);max-height:100%;display:flex;flex-direction:column;background:var(--bg-menu,#1d1d21);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.5);overflow:hidden}' +
        '#xct .h{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--border-color,#333)}#xct .h b{flex:1;font-size:16px}#xct button{font:inherit;color:inherit;cursor:pointer}#xct .x{width:32px;height:32px;border-radius:9px;border:1px solid var(--border-color,#555);background:transparent}' +
        '#xct .c{overflow:auto;padding:14px 18px;display:flex;flex-direction:column;gap:16px;scrollbar-width:thin}#xct h5{margin:0 0 8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.6}' +
        '#xct .st{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}#xct .st button{height:46px;border-radius:10px;border:1px solid var(--border-color,#4a4a50);display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 10px;font-size:12px;font-weight:650;position:relative;overflow:hidden}#xct .st button i{position:absolute;right:8px;top:8px;width:10px;height:10px;border-radius:50%}#xct .st button.on{outline:2px solid var(--text-main,#fff)}' +
        '#xct .fl{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px 10px}#xct .fl input[type=color]{width:46px;height:28px;border:1px solid var(--border-color,#555);border-radius:8px;background:transparent;padding:0 2px;cursor:pointer}' +
        '#xct .seg{display:flex;gap:4px}#xct .seg button{height:28px;padding:0 10px;border-radius:8px;border:1px solid var(--border-color,#4a4a50);background:transparent}#xct .seg button.on{background:rgba(240,179,120,.18);border-color:#f0b378}#xct input[type=range]{width:150px}' +
        '#xct .sv{display:flex;flex-wrap:wrap;gap:6px}#xct .sv span{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 4px 0 10px;border-radius:999px;border:1px solid var(--border-color,#4a4a50)}#xct .sv span button{border:0;background:transparent;opacity:.6}' +
        '#xct .f{display:flex;flex-wrap:wrap;gap:6px;justify-content:space-between;padding:12px 18px;border-top:1px solid var(--border-color,#333)}#xct .f button,#xct .row button{height:32px;padding:0 12px;border-radius:9px;border:1px solid var(--border-color,#555);background:transparent}#xct .f .ok{background:#f0b378;border-color:#f0b378;color:#1a1208;font-weight:700}#xct .row{display:flex;flex-wrap:wrap;gap:6px}';
    (document.head || R).appendChild(box);
    function open() {
        close(); const s0 = st(); let t = Object.assign({}, (s0.cur && !s0.cur.team && s0.cur) || STARTS[0]);
        const ov = document.createElement('div'); ov.id = 'xct'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Thème perso');
        ov.innerHTML = '<div class="b"><div class="h"><b>🎨 Thème perso</b><button class="x" title="Fermer (Échap)">✕</button></div><div class="c"></div><div class="f"><button data-off>Revenir au thème choisi</button><button class="ok" data-ok>✓ Appliquer</button></div></div>';
        document.body.appendChild(ov); const C = ov.querySelector('.c'), M = typeof XPCFG !== 'undefined' && XPCFG.isMaster && XPCFG.isMaster(), team = typeof XPCFG !== 'undefined' ? (XPCFG.get() || {}).ctheme : null;
        const live = () => { apply(t); accent(t.accent); };
        const draw = () => { const S = st();
            C.innerHTML = '<div><h5>Pour commencer</h5><div class="st">' + STARTS.map((x, i) => '<button type="button" data-s="' + i + '" style="background:' + x.panel + ';color:' + x.text + '" class="' + (t.name === x.name ? 'on' : '') + '">' + esc(x.name) + '<i style="background:' + x.accent + '"></i></button>').join('') + (team ? '<button type="button" data-team style="background:' + team.panel + ';color:' + team.text + '">👥 ' + esc(team.name || 'Équipe') + '<i style="background:' + team.accent + '"></i></button>' : '') + '</div></div>' +
                '<div><h5>Couleurs</h5><div class="fl"><span>Fond</span><input type="color" data-k="bg" value="' + t.bg + '"><span>Panneaux</span><input type="color" data-k="panel" value="' + t.panel + '"><span>Texte</span><input type="color" data-k="text" value="' + t.text + '"><span>Accent (couleur de la suite)</span><input type="color" data-k="accent" value="' + t.accent + '"></div></div>' +
                '<div><h5>Forme</h5><div class="fl"><span>Arrondis</span><div class="seg" data-f="radius">' + [['s', 'Nets'], ['m', 'D’origine'], ['l', 'Doux']].map(x => '<button type="button" data-v="' + x[0] + '" class="' + (t.radius === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div>' +
                '<span>Ombres</span><div class="seg" data-f="shadow">' + [['s', 'Aucune'], ['m', 'D’origine'], ['l', 'Marquées']].map(x => '<button type="button" data-v="' + x[0] + '" class="' + (t.shadow === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div>' +
                '<span>Transparence des panneaux</span><input type="range" min="0" max="0.5" step="0.05" data-k="glass" value="' + (t.glass || 0) + '"></div></div>' +
                '<div><h5>Mes thèmes</h5><div class="sv">' + (S.list.length ? S.list.map((x, i) => '<span>' + esc(x.name) + '<button type="button" data-load="' + i + '" title="Charger">↻</button><button type="button" data-del="' + i + '" title="Supprimer">✕</button></span>').join('') : '<small style="opacity:.6">Aucun pour l’instant.</small>') + '</div>' +
                '<div class="row" style="margin-top:8px"><button type="button" data-save>💾 Enregistrer sous…</button><button type="button" data-exp>⬇️ Exporter</button><button type="button" data-imp>⬆️ Importer</button>' + (M ? '<button type="button" data-share>👥 Partager à l’équipe</button>' : '') + '</div></div>';
            C.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { t = Object.assign({}, STARTS[+b.dataset.s]); live(); draw(); });
            const tb = C.querySelector('[data-team]'); if (tb) tb.onclick = () => { t = Object.assign({}, team); live(); draw(); };
            C.querySelectorAll('input[data-k]').forEach(i => i.oninput = () => { t[i.dataset.k] = i.type === 'range' ? +i.value : i.value; t.name = t.name && STARTS.some(x => x.name === t.name) ? 'Perso' : (t.name || 'Perso'); live(); });
            C.querySelectorAll('.seg button').forEach(b => b.onclick = () => { t[b.parentElement.dataset.f] = b.dataset.v; live(); draw(); });
            C.querySelectorAll('[data-load]').forEach(b => b.onclick = () => { t = Object.assign({}, st().list[+b.dataset.load]); live(); draw(); });
            C.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const S2 = st(); S2.list.splice(+b.dataset.del, 1); W(K, S2); draw(); });
            C.querySelector('[data-save]').onclick = () => { const n = prompt('Nom du thème :', t.name && t.name !== 'Perso' ? t.name : 'Mon thème'); if (!n) return; t.name = n.trim().slice(0, 40); const S2 = st(); S2.list = S2.list.filter(x => x.name !== t.name).concat([Object.assign({}, t)]); W(K, S2); draw(); };
            C.querySelector('[data-exp]').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ format: 'xiii-theme', version: 1, theme: t }, null, 2)], { type: 'application/json' })); a.download = (t.name || 'theme').replace(/[^\w\- ]+/g, '') + '.xiii-theme.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
            C.querySelector('[data-imp]').onclick = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = async () => { try { const d = JSON.parse(await i.files[0].text()), x = d && d.theme; if (!x || !x.bg || !x.text) throw 0; t = Object.assign({ radius: 'm', shadow: 'm', glass: 0 }, x); live(); draw(); } catch (e) { alert('Ce fichier n’est pas un thème SUITE XIII.'); } }; i.click(); };
            const sh = C.querySelector('[data-share]'); if (sh) sh.onclick = async () => { try { await XPCFG.save({ ctheme: Object.assign({}, t, { name: t.name || 'Thème de l’équipe' }) }); alert('👥 Thème proposé à toute l’équipe : chacun le retrouve dans « Pour commencer ».'); draw(); } catch (e) { } };
        };
        draw(); live();
        ov.querySelector('.x').onclick = () => { apply(); close(); }; // fermer sans appliquer : on revient à l'état enregistré
        ov.querySelector('[data-ok]').onclick = () => { const S = st(); S.on = true; S.cur = Object.assign({}, t); W(K, S); accent(t.accent); apply(); close(); };
        ov.querySelector('[data-off]').onclick = () => { const S = st(); S.on = false; W(K, S); try { localStorage.setItem('xiii.color', JSON.stringify({ mode: 'xiii' })); if (window.XCOLOR) XCOLOR.apply(); } catch (e) { } apply(); close(); };
        addEventListener('keydown', key, true);
    }
    const key = e => { if (e.key === 'Escape' && $('xct')) { e.preventDefault(); e.stopPropagation(); apply(); close(); } };
    function close() { const o = $('xct'); if (o) o.remove(); removeEventListener('keydown', key, true); }
    function row() { const pan = $('xs-panel'); if (!pan || $('xct-row')) return; const a = $('xcolor-sw'); if (!a) return;
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xct-row'; d.innerHTML = '<label>Thème perso<small>' + (st().on ? 'Actif : ' + esc((cur() || {}).name || 'perso') : 'Fond, panneaux, texte, accent, arrondis, ombres…') + '</small></label><div class="xs-c"><button type="button" class="xs-btn">🎨 Créer / modifier…</button></div>';
        d.querySelector('button').onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open, 120); }; a.before(d); }
    if (document.body) apply(); else addEventListener('DOMContentLoaded', () => apply());
    addEventListener('storage', e => { if (e.key === K || e.key === 'xiii.pcfg') apply(); });
    const go = () => new MutationObserver(() => { if ($('xs-panel')) row(); }).observe(document.body, { childList: true, subtree: true });
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    window.XCTHEME = { open, apply };
})();
