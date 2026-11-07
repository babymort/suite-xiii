// SUITE XIII — module commun. Source : xiii-src/suite-ident.js
// =====================================================================
//  SUITE XIII — XIDENT : « Votre nom » rangé dans une pastille (saison 6, ergonomie)
//  Le champ du nom (auteur des documents : scripte, chargé·e de production…) prenait ~150 px dans la barre du haut,
//  se faisait recouvrir par les boutons quand la barre se resserrait, et faisait doublon avec le profil de l'équipe.
//  → une pastille compacte (initiales + prénom) ; un clic ouvre le champ, l'📇 annuaire et la 🎬 fiche projet.
//  Le champ d'origine est déplacé tel quel (mêmes événements, même enregistrement) : rien ne change pour les outils.
// =====================================================================
(function () {
    if (window.XIDENT) return;
    const ini = n => { const p = String(n || '').trim().split(/\s+/).filter(Boolean); return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() : ''; };
    const short = n => { const p = String(n || '').trim().split(/\s+/).filter(Boolean); if (!p.length) return ''; const f = p[0][0].toUpperCase() + p[0].slice(1).toLowerCase(); return p.length > 1 ? f + ' ' + p[p.length - 1][0].toUpperCase() + '.' : f; };
    function css() { if (document.getElementById('xid-css')) return; const s = document.createElement('style'); s.id = 'xid-css';
        s.textContent = '#xid-chip{display:inline-flex!important;align-items:center;gap:7px;height:30px;max-width:150px;padding:0 10px 0 4px!important;border-radius:999px;cursor:pointer;font:600 12.5px system-ui,"Segoe UI",sans-serif;white-space:nowrap;flex:0 0 auto!important}' +
            '#xid-chip i{font-style:normal;flex:0 0 auto;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:10.5px;font-weight:800;letter-spacing:.02em;background:rgba(240,179,120,.25);color:var(--text-main,#eee)}' +
            '#xid-chip span{overflow:hidden;text-overflow:ellipsis}#xid-chip.empty span{opacity:.7;font-weight:500}#xid-chip.empty i{background:rgba(127,127,127,.25)}' +
            '#xid-pop{position:fixed;z-index:100050;width:290px;padding:12px;border-radius:10px;background:var(--bg-panel,#2d2d2d);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);box-shadow:0 12px 32px rgba(0,0,0,.4);font:13px system-ui,"Segoe UI",sans-serif}' +
            '#xid-pop label{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-dim,#999);margin:0 0 6px}#xid-pop .xid-f input{width:100%!important;box-sizing:border-box;min-width:0!important;height:32px;font-size:14px}' +
            '#xid-pop .xid-f{display:block!important}#xid-pop p{margin:8px 0 10px;font-size:11.5px;line-height:1.4;color:var(--text-dim,#999)}#xid-pop .xid-a{display:flex;gap:6px}#xid-pop .xid-a>*{flex:1;display:flex!important;align-items:center;justify-content:center;gap:6px;height:30px;border-radius:8px;border:1px solid var(--border-color,#555);background:var(--bg-panel-alt,#252525);cursor:pointer;font-size:12.5px;color:inherit}' +
            '#xid-pop .xid-a>*:hover{border-color:rgba(240,179,120,.7)}#xid-pop .xid-a .tb-label{margin:0!important;padding:0!important}' +
            'body.light-theme #xid-pop{box-shadow:0 12px 32px rgba(0,0,0,.16)}';
        document.head.appendChild(s); }
    let wrap, inp, chip, pop, extras = [], home;
    function label() { if (!chip) return; const v = (inp.value || '').trim(), ph = (inp.placeholder || 'Votre nom').replace(/\.{3}|…/g, '');
        chip.classList.toggle('empty', !v); chip.querySelector('i').textContent = v ? ini(v) : '👤'; chip.querySelector('span').textContent = v ? short(v) : ph;
        const role = extras.map(e => e.title || '').find(t => t && !/Fiche projet|Annuaire/.test(t));
        chip.title = (v ? v : 'Nom non renseigné') + (role ? ' — ' + role : '') + ' · clic : modifier, annuaire, fiche projet'; }
    function close() { if (!pop) return; home.after(inp); pop.remove(); pop = null; label(); }
    function open() {
        if (pop) { close(); return; }
        pop = document.createElement('div'); pop.id = 'xid-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Votre nom');
        const role = extras.map(e => e.title || '').find(t => t && !/Fiche projet|Annuaire/.test(t));
        pop.innerHTML = '<label>' + (role ? 'Nom · ' + role.replace(/[<>&]/g, '') : 'Votre nom') + '</label><div class="xid-f"></div><p>Repris de votre profil d’équipe quand il est renseigné. Il signe vos documents (PDF, rapports) et vos avis.</p><div class="xid-a"></div>';
        pop.querySelector('.xid-f').appendChild(inp);
        extras.forEach(e => { const t = e.title || ''; if (!/Fiche projet|Annuaire/.test(t)) return; const b = document.createElement('button'); b.type = 'button'; b.innerHTML = (/Annuaire/.test(t) ? '📇 Annuaire' : '🎬 Fiche projet'); b.title = t; b.onclick = () => { close(); e.click(); }; pop.querySelector('.xid-a').appendChild(b); });
        if (!pop.querySelector('.xid-a').children.length) pop.querySelector('.xid-a').remove();
        document.body.appendChild(pop); const r = chip.getBoundingClientRect(); pop.style.top = Math.round(r.bottom + 6) + 'px'; pop.style.left = Math.round(Math.max(8, Math.min(innerWidth - 298, r.right - 290))) + 'px';
        setTimeout(() => { try { inp.focus(); inp.select(); } catch (e) { } }, 30);
        inp.addEventListener('keydown', onEnter);
    }
    function onEnter(e) { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); inp.dispatchEvent(new Event('change', { bubbles: true })); inp.removeEventListener('keydown', onEnter); close(); try { chip.focus(); } catch (x) { } } }
    function mount() {
        inp = document.getElementById('author-name'); if (!inp || document.getElementById('xid-chip')) return !!inp;
        wrap = inp.closest('.xn-auth') || inp.parentElement; if (!wrap) return false; css();
        extras = [...wrap.children].filter(x => x !== inp && x.tagName === 'SPAN');
        chip = document.createElement('button'); chip.type = 'button'; chip.id = 'xid-chip'; chip.innerHTML = '<i></i><span></span>'; chip.onclick = e => { e.stopPropagation(); open(); };
        home = document.createElement('span'); home.id = 'xid-home'; home.hidden = true;
        inp.before(home); home.after(chip); extras.forEach(x => { x.dataset.xid = 1; x.style.setProperty('display', 'none', 'important'); }); inp.style.setProperty('display', 'none'); inp.dataset.xidHidden = 1;
        // le champ s'affiche dans la fenêtre, caché dans la barre
        const showFix = () => { inp.style.setProperty('display', pop ? 'block' : 'none'); };
        const _o = open; open = function () { _o(); showFix(); }; const _c = close; close = function () { _c(); showFix(); };
        document.addEventListener('mousedown', e => { if (pop && !pop.contains(e.target) && e.target !== chip && !chip.contains(e.target)) close(); }, true);
        inp.addEventListener('input', label); setInterval(label, 1500); label(); return true;
    }
    let n = 0; const go = () => { if (!mount() && ++n < 20) setTimeout(go, 500); };
    try { if (typeof XBOOT !== 'undefined' && XBOOT.ready) XBOOT.ready(() => setTimeout(go, 50), 2940); else throw 0; } catch (e) { addEventListener('load', () => setTimeout(go, 600)); }
    window.XIDENT = { open: () => open(), close: () => close() };
})();
