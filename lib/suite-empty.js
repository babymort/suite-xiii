// SUITE XIII — module commun. Source : xiii-src/suite-empty.js
// =====================================================================
//  SUITE XIII — XEMPTY : écrans vides utiles (saison 6, phase B)
//  Quand un outil est vide, son écran d'accueil propose toujours les mêmes trois choix, dans le même ordre :
//    📐 Partir d'un exemple · 📥 Importer · ➕ Commencer de zéro
//  Chaque choix lance le bouton que l'outil avait déjà (dans l'écran d'accueil, sinon dans les barres) ;
//  un choix que l'outil ne sait pas faire n'est pas affiché. Les boutons d'origine repris par les trois choix sont masqués,
//  les autres restent. L'écran disparaît comme avant, dès que l'outil a du contenu (c'est l'outil qui le gère).
// =====================================================================
(function () {
    if (window.XEMPTY) return;
    const APPX = XIII_APP, $ = id => document.getElementById(id);
    // écran d'accueil de chaque outil (SYNO n'en avait pas : il est créé quand le schéma est vide)
    const CARD = { casto: '.empty', deviso: '.welcome', graphico: '.gx-empty', lumo: '.empty', matos: '.ct-empty', moodo: '.welcome', packingo: '.welcome', posto: '.empty', repero: '.side-empty', scripto: '.welcome', sono: '.empty', transporto: '.empty', syno: '#xem-syno' };
    const FIRST = () => typeof window.XIII_FIRST === 'function'; // outils qui chargeaient un exemple d'office (CONDUCO, DECOUP, PLANO) : vierges + choix à la première ouverture
    if (!CARD[APPX] && !/^(conduco|decoup|plano)$/.test(APPX)) return;
    const vis = b => b && b.offsetWidth > 0 && !b.disabled && getComputedStyle(b).display !== 'none';
    const txt = b => ((b.title || '') + ' ' + (b.textContent || '')).replace(/\s+/g, ' ').trim();
    const lab = b => b.label || (((b.querySelector && b.querySelector('.btn-label')) || b).textContent || '').replace(/\s+/g, ' ').trim() || (b.title || '').split(/ : | — | \(/)[0];
    const RX = {
        ex: /exemple|modèle|\bkit\b|plateau tv|type\b/i,
        imp: /import|depuis|coller|📥|📋|charger une liste|cvs|csv/i,
        zero: /^[➕＋]|première|premier|créer|vide|nouvel|nouveau|ajouter|\+ ligne/i
    };
    const NOT = /sources? d.inspiration|guide|comment ça marche|aide|tout voir|tout analyser|actualiser/i;
    function pick(card, k, used) {
        const inCard = [...card.querySelectorAll('button')].filter(b => vis(b) && !b.closest('.xem-trio') && used.indexOf(b) < 0 && !NOT.test(txt(b)) && RX[k].test(txt(b)));
        // l'import avant le « zéro » (« ➕ Importer… » est un import) et l'exemple avant l'import (« 📥 Charger l'exemple » est un exemple)
        const sc = b => k === 'zero' ? (/^\s*[➕＋]/.test(b.textContent) ? 0 : 1) + (/import|depuis|exemple/i.test(txt(b)) ? 2 : 0) : 0;
        if (inCard.length) return inCard.sort((a, b) => sc(a) - sc(b))[0];
        const tb = $('toolbar'), top = $('xb-file');
        if (k === 'ex') { const n = window.XTOP && XTOP.newItems ? XTOP.newItems().find(x => /exemple/i.test(x[1])) : null; if (n) return { click: n[2], label: n[1].split(/ : | — /)[0] };
            const z = $('xzz-ex') || $('xmd-btn'); if (z) return { click: () => z.click(), label: 'Exemples types' };
            return (tb && [...tb.querySelectorAll('button')].find(b => vis(b) && /exemple/i.test(txt(b)))) || null; }
        if (k === 'imp') { const t1 = tb && [...tb.querySelectorAll('button')].find(b => vis(b) && /📥/.test(b.textContent) && /import|depuis/i.test(txt(b))); if (t1) return t1; const o = top && [...top.querySelectorAll('button')].find(b => vis(b) && /📂/.test(b.textContent)); return o ? { click: () => o.click(), label: 'Ouvrir un fichier du projet' } : null; }
        const cre = tb && tb.querySelector(':scope > .xsec[data-sec="cre"]'); return (cre && [...cre.querySelectorAll('button')].find(b => vis(b) && /^[➕＋]/.test((b.textContent || '').trim()))) || null;
    }
    const sub = b => { let l = lab(b).replace(/^[^\wÀ-ÿ]+/, ''); if (l.length < 12 && b.title) l = b.title.split(/ : | — | \(/)[0]; return l; };
    const TILE = { ex: ['📐', 'Partir d’un exemple', 'Un projet type complet, à adapter'], imp: ['📥', 'Importer', 'Une liste, un fichier ou un autre outil'], zero: ['➕', 'Commencer de zéro', 'Une page vierge'] };
    function decorate(card) {
        if (card.querySelector(':scope > .xem-trio') || !card.offsetWidth) return;
        const used = [], act = {};
        ['ex', 'imp', 'zero'].forEach(k => { const b = pick(card, k, used); if (b) { act[k] = b; used.push(b); } });
        const keys = Object.keys(act); if (keys.length < 2) return;
        const t = document.createElement('div'); t.className = 'xem-trio'; t.setAttribute('role', 'group'); t.setAttribute('aria-label', 'Pour commencer');
        t.innerHTML = '<div class="xem-h">Pour commencer</div>' + ['ex', 'imp', 'zero'].filter(k => act[k]).map(k => '<button type="button" data-k="' + k + '" title="' + lab(act[k]).replace(/"/g, '') + '"><span class="i">' + TILE[k][0] + '</span><b>' + TILE[k][1] + '</b><small>' + (sub(act[k]) || TILE[k][2]).replace(/[<>&]/g, '') + '</small></button>').join('');
        t.querySelectorAll('button').forEach(x => x.onclick = () => act[x.dataset.k].click());
        // place : après le titre et le texte d'introduction de l'écran, avant les boutons d'origine
        const firstBtn = [...card.querySelectorAll('button')].find(b => !b.closest('.xem-trio') && card.contains(b)); let at = firstBtn; while (at && at.parentElement !== card) at = at.parentElement;
        if (at) card.insertBefore(t, at); else card.appendChild(t);
        // boutons d'origine repris dans l'écran : masqués (ceux des barres restent)
        used.forEach(b => { if (b.nodeType === 1 && card.contains(b)) { b.dataset.xem = 1; b.style.setProperty('display', 'none', 'important'); } });
        [...card.querySelectorAll('div,p,span')].forEach(r => { if (r !== t && !t.contains(r) && r.querySelector('button[data-xem]') && ![...r.querySelectorAll('button')].some(vis) && !r.textContent.replace(/\s/g, '').length) r.style.display = 'none'; });
    }
    // SYNO : pas d'écran d'accueil, on en pose un quand le schéma est vide
    function synoCard() {
        const ws = $('workspace-container'); if (!ws) return; const empty = !document.querySelector('.node:not(#ip-box)'); let c = $('xem-syno');
        if (!empty) { if (c) c.remove(); return; }
        if (!c) { c = document.createElement('div'); c.id = 'xem-syno'; c.innerHTML = '<h3>🔀 Synoptique vide</h3><p>Placez vos équipements et reliez-les par des câbles : le synoptique, la liste du matériel et le patch se font en même temps.</p>'; ws.appendChild(c); }
    }
    const save = () => { try { if (typeof autosave === 'function') autosave(); else if (typeof commit === 'function') commit(); else if (typeof saveProject === 'function') saveProject(false); } catch (e) { } };
    function firstCard() {
        let c = $('xem-first');
        // arrivée par une passerelle, un lien ou un import : l'outil a déjà du contenu, pas de choix à proposer
        if (FIRST()) { let cur = ''; try { cur = JSON.stringify(P.tabs); } catch (e) { } if (firstCard.base == null) firstCard.base = cur; if (/xfrom=|xlink=|#x?import/.test(location.hash) || cur !== firstCard.base) window.XIII_FIRST = null; }
        if (!FIRST()) { if (c) c.remove(); return; }
        const tour = $('xt-pop'), busy = tour && tour.offsetWidth > 0; // la visite guidée d'abord : jamais deux fenêtres l'une sur l'autre
        if (c) { c.style.display = busy ? 'none' : ''; return; } if (busy) return;
        const name = (document.title || '').split(/ [—-] /)[0].replace(/\s*XIII.*$/i, '').trim() || APPX.toUpperCase();
        const top = $('xb-file'), open = top && [...top.querySelectorAll('button')].find(b => vis(b) && /📂/.test(b.textContent));
        c = document.createElement('div'); c.id = 'xem-first'; c.className = 'xem-card'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-label', 'Pour commencer');
        c.innerHTML = '<h3>' + name.replace(/[<>&]/g, '') + ' — nouveau projet</h3><p>Choisissez comment commencer.</p><div class="xem-trio"><div class="xem-h">Pour commencer</div>' +
            '<button type="button" data-k="ex"><span class="i">📐</span><b>Partir d’un exemple</b><small>Un projet type complet, à adapter</small></button>' +
            (open ? '<button type="button" data-k="imp"><span class="i">📥</span><b>Charger un fichier</b><small>Ouvrir un fichier du projet</small></button>' : '') +
            '<button type="button" data-k="zero"><span class="i">➕</span><b>Commencer de zéro</b><small>Une page vierge</small></button></div>';
        const done = () => { window.XIII_FIRST = null; c.remove(); };
        c.querySelector('[data-k=ex]').onclick = () => { const f = window.XIII_FIRST; done(); try { f(); } catch (e) { } };
        if (open) c.querySelector('[data-k=imp]').onclick = () => { done(); save(); open.click(); };
        c.querySelector('[data-k=zero]').onclick = () => { done(); save(); };
        document.body.appendChild(c); setTimeout(() => { const b = c.querySelector('[data-k=ex]'); try { b.focus({ preventScroll: true }); } catch (e) { } }, 50);
    }
    function css() {
        if ($('xem-css')) return; const s = document.createElement('style'); s.id = 'xem-css';
        s.textContent = '.xem-trio{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;width:100%;max-width:640px;margin:14px auto 12px;text-align:center}.xem-h{grid-column:1/-1;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim,#999);margin-bottom:-2px}' +
            '.xem-trio button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 10px 12px;border-radius:12px;border:1px solid var(--border-color,#444);background:var(--bg-panel-alt,rgba(255,255,255,.03));color:var(--text-main,#eee);transition:border-color .15s,background .15s}' +
            '.xem-trio button:hover,.xem-trio button:focus-visible{border-color:rgb(240,179,120);background:rgba(240,179,120,.10)}.xem-trio .i{font-size:24px;line-height:1}.xem-trio b{font-size:13.5px}.xem-trio small{font-size:11.5px;color:var(--text-dim,#999);line-height:1.3;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
            '#xem-first,#xem-syno{position:fixed;left:50%;top:52%;transform:translate(-50%,-50%);z-index:5;width:min(600px,90%);padding:20px 22px;border-radius:14px;background:var(--bg-panel,#2d2d2d);border:1px solid var(--border-color,#444);box-shadow:0 12px 34px rgba(0,0,0,.35);text-align:center;color:var(--text-main,#eee)}#xem-first h3,#xem-syno h3{margin:0 0 6px;font-size:16px}#xem-first p,#xem-syno p{margin:0;font-size:13px;color:var(--text-dim,#aaa);line-height:1.45}' +
            'body.xfocus #xem-syno{display:none}#xem-first{z-index:60}@media print{.xem-trio,#xem-syno,#xem-first{display:none!important}}';
        document.head.appendChild(s);
    }
    function tick() { try { css(); if (APPX === 'syno') synoCard(); firstCard(); if (CARD[APPX]) document.querySelectorAll(CARD[APPX]).forEach(decorate); } catch (e) { } }
    const go = () => { tick(); setInterval(tick, 900); };
    try { if (typeof XBOOT !== 'undefined' && XBOOT.ready) XBOOT.ready(() => setTimeout(go, 600), 2998); else throw 0; } catch (e) { addEventListener('load', () => setTimeout(go, 1400)); }
    window.XEMPTY = { tick };
})();
