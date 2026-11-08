// SUITE XIII — code commun partagé par tous les outils (phase C, saison 6). Source : xiii-src/core/core-04.js
// =====================================================================
//  SUITE XIII — XBAR : barre commune des outils
//  Les boutons ajoutés par la suite sont rangés au même endroit et dans le même ordre dans tous les outils :
//    🗂️ Versions · │ · 👥 groupe Équipe : 🤝 Déléguer · 💬 Avis · 📌 Mots · ☁️ Drive (+ pastille)
//  Le groupe Équipe n'apparaît que si le Drive du projet est relié (ou s'il y a déjà des avis, des mots ou
//  une délégation en cours). Sinon, un seul bouton discret « 👥 Équipe » propose de relier un Drive ou de
//  déléguer par lien : une personne qui travaille seule n'est pas encombrée.
// =====================================================================
const XBAR = (() => {
    let APP = '';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const $ = id => document.getElementById(id);
    const has = k => { const v = J(k, null); return v && typeof v === 'object' && Object.keys(v).length > 0; };
    const linked = () => { const c = J('xiii.drive', null); return !!(c && c.url); };
    const teamOn = () => localStorage.getItem('xiii.bar.team') === '1' || linked() || has('xiii.notes.' + APP) || has('xiii.memo.' + APP) || !!J('xiii.deleg.active.' + APP, null) || (J('xiii.deleg.sent', []) || []).some(x => x && x.app === APP);
    const TEAM = ['xtb-btn', 'xdl-btn', 'xnt-btn', 'xmm-btn', 'xdr-btn', 'xdr-chip'];
    function build() {
        let first = $('xdl-btn') || $('xnt-btn');
        // outil sans délégation par lien (CADRO, DOSSIER, CALENDRIER, CONTRÔLE, ENCODO, LUDO) : le bouton 👥 Équipe existe quand même,
        // au même endroit que partout (barre du haut), après 4 s pour laisser les autres modules poser leurs boutons
        if (!first && !$('xb-team')) { const tb = $('top-bar'); if (!tb || performance.now() < 4000) return false;
            const at = $('xb-file') || [...tb.children].pop(); if (!at) return false;
            at.insertAdjacentHTML('afterend', '<span class="btn-group" id="xb-bar" data-solo="1"><span id="xb-anchor"></span></span>'); first = $('xb-anchor');
            first.insertAdjacentHTML('beforebegin', '<button id="xb-solo" title="Travailler en équipe : relier le Drive du projet"><span class="btn-icon">👥</span><span class="btn-label">Équipe</span></button><span id="xb-team" class="xb-g"></span>');
            $('xb-solo').onclick = menu; }
        if (!first) return false;
        let g = $('xb-team');
        if (!g) {
            // un groupe à nous, à droite du groupe d'origine (ou du dernier groupe visible si celui-ci est masqué dans cette vue)
            let grp = first.parentNode; const vis = el => el && getComputedStyle(el).display !== 'none';
            if (!vis(grp)) { const sibs = [...grp.parentNode.children].filter(x => x !== grp && x.matches('.btn-group,.tb-group,span,div') && vis(x) && x.querySelector('button')); if (sibs.length) grp = sibs[sibs.length - 1]; }
            grp.insertAdjacentHTML('afterend', '<span class="btn-group" id="xb-bar"><span id="xb-anchor"></span></span>');
            first = $('xb-anchor');
            first.insertAdjacentHTML('beforebegin', '<button id="xb-solo" title="Travailler en équipe : relier le Drive du projet, ou déléguer cet outil par un lien"><span class="btn-icon">👥</span><span class="btn-label">Équipe</span></button><span id="xb-team" class="xb-g"></span>');
            g = $('xb-team'); $('xb-solo').onclick = menu;
        }
        const want = TEAM.filter(id => $(id)), cur = [...g.children].map(x => x.id).join(); if (cur !== want.join()) want.forEach(id => g.appendChild($(id)));
        ['xsh-btn', 'xhs-btn'].forEach(id => { const v = $(id); if (v && v.parentNode === g.parentNode && v.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING) return; if (v) g.parentNode.insertBefore(v, g); }); // 🔗 Partager, 🗂️ Versions juste avant le groupe
        apply(); return true;
    }
    // 👑 badge Master discret (Drive relié avec le code d'équipe : c'est ce poste qui pilote le projet)
    function master() {
        const c = J('xiii.drive', null), on = !!(c && c.url && c.code); let b = $('xb-master');
        if (!on) { if (b) b.remove(); return; }
        if (!b) { b = document.createElement('span'); b.id = 'xb-master'; document.body.appendChild(b); } b.textContent = c.sm ? '👑 Sous-Master' : '👑 Master'; // même place dans tous les outils : coin bas gauche, hors des barres
        b.title = (c.sm ? 'Sous-Master (droits du Master' + (c.chef ? ', invité par ' + c.chef : '') + ') du projet' : 'Vous êtes le Master du projet') + (c.proj ? ' « ' + c.proj + ' »' : '') + ' : ☁️ Drive, équipe, notifications';
    }
    function apply() { try { master(); } catch (e) { }
        const on = teamOn(), g = $('xb-team'), s = $('xb-solo'); if (!g || !s) return;
        const show = on && g.children.length > 0; // groupe vide (outil sans délégation) : on garde 👥 Équipe
        g.style.display = show ? '' : 'none'; s.style.display = show ? 'none' : '';
        document.querySelectorAll('#xdr-ban').forEach(x => x.style.display = on ? '' : 'none');
    }
    function menu(e) {
        e.stopPropagation(); let m = $('xb-menu'); if (m) { m.remove(); return; }
        const r = $('xb-solo').getBoundingClientRect();
        m = document.createElement('div'); m.id = 'xb-menu';
        m.style.cssText = 'position:fixed;z-index:10300;top:' + (r.bottom + 6) + 'px;left:' + Math.max(8, Math.min(innerWidth - 300, r.left - 120)) + 'px';
        m.innerHTML = '<b>👥 Travailler en équipe</b><p>Ces fonctions restent masquées tant que vous travaillez seul.</p>' +
            '<button data-a="drive"><span>☁️</span><span><b>Relier le Drive du projet</b><small>Toute l\'équipe travaille dans votre Google Drive : synchronisation, droits, journal, mots, avis.</small></span></button>' +
            '<button data-a="deleg"><span>🤝</span><span><b>Déléguer par un lien</b><small>Sans Drive : un membre remplit cet outil et vous le renvoie.</small></span></button>' +
            '<button data-a="show"><span>👁</span><span><b>Afficher les boutons d\'équipe</b><small>Déléguer, Avis, Mots, Drive — sur ce poste.</small></span></button>';
        if (!$('xdl-btn')) m.querySelector('[data-a=deleg]').remove(); if (!TEAM.some(id => $(id))) { m.querySelector('[data-a=show]').remove(); m.querySelector('p').textContent = 'Reliez le Drive du projet pour que toute l\'équipe partage la suite (les autres outils du projet suivent).'; }
        document.body.appendChild(m);
        m.querySelector('[data-a=drive]').onclick = () => { location.href = 'drive.html'; };
        m.querySelector('[data-a=deleg]').onclick = () => { m.remove(); const b = $('xdl-btn'); if (b) b.click(); };
        m.querySelector('[data-a=show]').onclick = () => { m.remove(); try { localStorage.setItem('xiii.bar.team', '1'); } catch (er) { } apply(); };
        setTimeout(() => document.addEventListener('click', function off(ev) { if (!ev.target.closest('#xb-menu')) { m.remove(); document.removeEventListener('click', off); } }), 0);
    }
    // 🏠 Accueil toujours cliquable, même quand une fenêtre de démarrage couvre l'outil
    function homeFix() {
        const go = () => { const h = [...document.querySelectorAll('button,a')].find(e => /🏠/.test(e.textContent) && /accueil/i.test(e.textContent + (e.title || '')) && e.closest('#top-bar,#toolbar,header,.top-bar,.topbar,nav,.hrow'));
            if (!h) return; h.id = h.id || 'xb-home'; h.style.position = 'relative'; h.style.zIndex = '2147483000';
            let p = h.parentElement; while (p && p !== document.body) { const cs = getComputedStyle(p); if (cs.zIndex !== 'auto' && cs.position !== 'static') { p.style.zIndex = '2147482999'; } p = p.parentElement; } };
        XBOOT.ready(go, 300);
    }
    // ---------- barre unifiée : [outil] │ [💾 📂 ⬇️ 🖨️ Exporter ▾ 📚] │ [🔗 🗂️ 👥] ----------
    const SUITE = /^(xsh-btn|xhs-btn|xb-solo|xdl-btn|xnt-btn|xmm-btn|xdr-btn|xdr-chip|xb-exp)$/;
    const ico = b => ((b.querySelector('.btn-icon') || {}).textContent || b.textContent || '').trim().slice(0, 3);
    const tip = b => (b.title || b.textContent || '').trim();
    function kind(b) {
        const i = ico(b), t = tip(b);
        if (/💾/.test(i)) return 'save'; if (/📂/.test(i) && /ouvrir/i.test(t)) return 'open'; if (/⬇️/.test(i)) return 'export';
        if (/📚/.test(i) || /vers DOSSIER|à DOSSIER/i.test(t) && /📚/.test(i)) return 'dossier';
        if (/^(Importer|Charger|Reprendre|Ajouter)/i.test(t)) return 'tool';
        if (/🖨️|🖼️|📕|🗎/.test(i) || /^(Exporter|Imprimer|Générer|Créer le (rendu|document)|Créer un rendu|Rapport|Tableau|Feuille .*imprim|Fiche .*imprim|Plan de feu imprim|Book|Patch|Rooming|Déroulé|Retours en tableau|Liste du matériel|Liste des sous-titres|Sous-titres|Texte seul|Calendrier|PDF|Dossier de repérage|Marqueurs)/i.test(t) || /\((CSV|\.ics|PDF|Excel)/i.test(t)) return 'out';
        return 'tool';
    }
    let laid = false;
    function layout() {
        if (laid) return; const top = $('top-bar'); if (!top) return; const R = [...top.children].filter(x => x.tagName === 'DIV' && !/tabs-container|brand/.test(x.className)).pop(); if (!R) return;
        const btns = [...R.querySelectorAll('button')].filter(b => !SUITE.test(b.id) && !b.closest('#xb-bar,#xb-team'));
        if (!btns.some(b => kind(b) === 'save')) return; laid = true;
        const Z = id => { const z = document.createElement('span'); z.className = 'btn-group'; z.id = id; return z; }, dv = () => { const d = document.createElement('div'); d.className = 'divider xb-dv'; return d; };
        const zt = Z('xb-tool'), zf = Z('xb-file'), hold = document.createElement('span'); hold.id = 'xb-hold'; hold.style.display = 'none';
        const by = { tool: [], save: [], open: [], export: [], out: [], dossier: [] }; btns.forEach(b => by[kind(b)].push(b));
        // un groupe qui contient un menu déroulant (format d'export de PLANO / SYNO) reste entier
        const sel = R.querySelector('select#export-format'), keep = sel ? by.out.filter(b => /🖼️/.test(ico(b))) : [];
        by.out = by.out.filter(b => keep.indexOf(b) < 0);
        by.tool.forEach(b => zt.appendChild(b));
        by.save.concat(by.open, by.export).forEach(b => zf.appendChild(b));
        if (sel) zf.appendChild(sel); keep.forEach(b => zf.appendChild(b));
        if (by.out.length === 1) zf.appendChild(by.out[0]);
        else if (by.out.length > 1) {
            by.out.forEach(b => hold.appendChild(b));
            zf.insertAdjacentHTML('beforeend', '<button id="xb-exp" title="Exporter, imprimer : PDF, tableaux, fichiers…"><span class="btn-icon">🖨️</span><span class="btn-label">Exporter ▾</span></button>');
            zf.lastElementChild.onclick = e => expMenu(e, by.out);
        }
        by.dossier.forEach(b => zf.appendChild(b));
        // on vide l'ancien rangement (groupes et séparateurs devenus inutiles)
        [...R.children].forEach(x => { if (x.id === 'xb-bar' || x.id === 'save-state' || x.classList.contains('xn-auth')) return; if (x.classList.contains('divider') || (!x.querySelector('button,select,input') && !x.textContent.trim())) x.remove(); });
        [...R.querySelectorAll('.btn-group,.xn-common')].forEach(g => { if (g.id !== 'xb-bar' && g.id !== 'xb-team' && !g.querySelector('button,select,input')) g.remove(); });
        const bar = $('xb-bar'), first = R.firstChild;
        if (zt.children.length) { R.insertBefore(zt, first); R.insertBefore(dv(), first); }
        let anchor = bar; while (anchor && anchor.parentNode !== R) anchor = anchor.parentNode;
        if (anchor) { R.insertBefore(zf, anchor); R.insertBefore(dv(), anchor); } else { R.appendChild(dv()); R.appendChild(zf); }
        R.querySelectorAll('.divider:not(.xb-dv)').forEach(d => d.remove());
        R.appendChild(hold);
        // les groupes propres à l'outil restés en place (ex. un sélecteur) passent dans la zone outil, à gauche
        [...R.children].forEach(x => { if (x !== zt && x !== zf && x !== hold && !x.classList.contains('xb-dv') && x.id !== 'xb-bar' && x !== anchor && x.id !== 'save-state' && R.contains(x) && x.compareDocumentPosition(zf) & Node.DOCUMENT_POSITION_FOLLOWING && x.compareDocumentPosition(zt) & Node.DOCUMENT_POSITION_PRECEDING) { } });
    }
    function expMenu(e, L) {
        e.stopPropagation(); let m = $('xb-menu'); if (m) { m.remove(); return; }
        const r = $('xb-exp').getBoundingClientRect(); m = document.createElement('div'); m.id = 'xb-menu';
        m.style.cssText = 'position:fixed;z-index:2147483001;top:' + (r.bottom + 6) + 'px;left:' + Math.max(8, Math.min(innerWidth - 300, r.left - 100)) + 'px';
        const vis = L.filter(b => b.style.display !== 'none' && !b.hidden && !b.disabled);
        m.innerHTML = '<b>🖨️ Exporter</b><p>Documents et fichiers de cet outil.</p>' + vis.map((b, i) => { const t = tip(b).replace(/[<>&]/g, ''), h = t.split(/ : | — |\. | \(/)[0].slice(0, 60), rest = t.slice(h.length).replace(/^[\s:—.(]+/, '').slice(0, 90); return '<button data-i="' + i + '"><span>' + ico(b) + '</span><span><b>' + h + '</b>' + (rest ? '<small>' + rest + '</small>' : '') + '</span></button>'; }).join('');
        document.body.appendChild(m);
        m.querySelectorAll('[data-i]').forEach(x => x.onclick = () => { m.remove(); vis[+x.dataset.i].click(); });
        setTimeout(() => document.addEventListener('click', function off(ev) { if (!ev.target.closest('#xb-menu')) { m.remove(); document.removeEventListener('click', off); } }), 0);
    }
    // ---------- en-tête : logo XIII + logo de l'outil (logos/OUTIL.png, sinon son icône) ----------
    const ICO = { importo: '📥', calendrier: '🗓️', controle: '✅', matos: '📦', catalogue: '🗃️', backupo: '💽', callsheeto: '📋', casto: '🎭', conduco: '🎬', decoup: '✂️', deviso: '💶', dossier: '📚', graphico: '🎛️', lumo: '💡', moodo: '🎨', packingo: '🧳', planno: '📅', plano: '📐', posto: '🎞️', repero: '📍', ressourco: '📑', runo: '🔴', scripto: '📝', sono: '🎚️', soustitro: '💬', storyboardo: '🖼️', syno: '🔀', transporto: '🚐', cadro: '🎯', ludo: '🎲' };
    function brand() {
        if (!ICO[APP]) return;
        const go = () => {
            const top = $('top-bar'); if (!top || $('xb-brand')) return;
            const h = $('xb-home') || top.querySelector('.xn-homeg,.xn-home'); const anchor = h && h.closest('#top-bar > *') || top.firstElementChild; if (!anchor) return;
            const s = document.createElement('span'); s.id = 'xb-brand'; s.title = 'SUITE XIII — ' + APP.toUpperCase();
            s.innerHTML = '<img src="xiii-logo.png" alt="XIII" class="xb-x"><span class="xb-ti" aria-hidden="true">' + ICO[APP] + '</span>';
            anchor.after(s);
            const im = new Image(); im.onload = () => { const t = s.querySelector('.xb-ti'); t.innerHTML = '<img src="logos/' + APP + '.png" alt="">'; }; im.src = 'logos/' + APP + '.png';
        };
        XBOOT.ready(go, 500);
    }
    function css() {
        const s = document.createElement('style'); s.id = 'xb-css';
        s.textContent = '#xb-master{position:fixed;left:10px;bottom:8px;z-index:9980;pointer-events:auto;cursor:default;display:inline-flex;align-items:center;backdrop-filter:blur(4px);font:600 10.5px/1 "Segoe UI",system-ui,sans-serif;letter-spacing:.04em;padding:3px 7px;border-radius:99px;border:1px solid rgba(240,179,120,.45);color:rgba(240,179,120,.95);background:rgba(240,179,120,.08);white-space:nowrap;opacity:.8}body:has(#xb-master) #xau-chip{bottom:40px!important}' +
            '#xb-brand{display:inline-flex;align-items:center;gap:6px;margin:0 2px 0 6px;flex:0 0 auto}#xb-brand .xb-x{height:24px;width:auto;filter:drop-shadow(0 1px 1px rgba(0,0,0,.4))}#xb-brand .xb-ti{font-size:20px;line-height:1;display:inline-flex}#xb-brand .xb-ti img{height:26px;width:auto;border-radius:5px}body.light-theme #xb-brand .xb-x{filter:none}@media(max-width:700px){#xb-brand .xb-x{display:none}}' +
            '.xb-g{display:inline-flex;gap:inherit;align-items:center;padding-left:6px;margin-left:2px;border-left:1px solid var(--border-color,rgba(128,128,128,.35))}' +
            '#xb-menu{width:300px;max-height:75vh;overflow:auto;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid var(--border-color,#555);border-radius:12px;padding:10px;box-shadow:0 14px 40px rgba(0,0,0,.55);font:13px/1.4 "Segoe UI",system-ui,sans-serif}#xb-menu p{margin:2px 0 8px;color:var(--text-dim,#999);font-size:12px}' +
            '#xb-menu button{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;font:inherit;color:inherit;background:none;border:1px solid transparent;border-radius:8px;padding:7px 8px;cursor:pointer;height:auto!important}#xb-menu button:hover{background:rgba(128,128,128,.15);border-color:var(--border-color,#555)}#xb-menu button>span:first-child{font-size:18px}#xb-menu small{display:block;color:var(--text-dim,#999);font-size:11.5px}';
        document.head.appendChild(s);
    }
    function init(app) {
        if (!document.getElementById('xprint-css')) { const pc = document.createElement('style'); pc.id = 'xprint-css'; // 🖨️ exports propres : aucun élément de l'interface SUITE XIII sur les PDF / impressions
            pc.textContent = '@media print{#xa-skip,[id^="xt-"],#xtp,#xb-master,#xau-chip,#xau-ov,#xs-gear,#xs-ov,#xnw-ov,#xdr-ban,#xdr-ov,#xg-ban,#xg-ov,#xdl-ban,#xdl-ov,#xmm-ban,#xmm-ov,#xoff,#xpj-toast,#xpj-ov,#xpj-ask,#xle-pen,#xle-pop,#xcat-ov,#xcl-ov,#xcp-ov,#xcr-ov,#xf-ov,#xgt-ov,#xhs-ov,#xim-ov,#xpb-ov,#xpv-ov,#xsh-ov,#xai-ov,#ar-ov,#cps-pad,#vis-ov,#xpres,.xtoast,#toast,.toast,#dev-credit{display:none!important}body::after,body::before{content:none!important;display:none!important}}';
            document.head.appendChild(pc); }
        if (/[?&]embed=1/.test(location.search) && window.top !== window) { document.documentElement.classList.add('xembed'); const st = document.createElement('style'); st.textContent = 'html.xembed #xb-brand,html.xembed #xb-home,html.xembed #xs-gear,html.xembed #xb-master,html.xembed #xtp,html.xembed #xoff,html.xembed #xau-chip,html.xembed #xnw-ov,html.xembed .xn-homeg,html.xembed .xn-home,html.xembed #xt-zone,html.xembed #xt-tab{display:none!important}'; document.head.appendChild(st); try { localStorage.setItem('xiii.tour2.' + app + '.hide', localStorage.getItem('xiii.tour2.' + app + '.hide') || '1'); } catch (e) { } }
        if (app === 'planno' && window.top === window && !/[?&](embed|out|view|share|pub)=/.test(location.search) && !/#xlink=/.test(location.hash)) { location.replace('calendrier.html?v=prod' + location.hash); return; } // PLANNO vit dans CALENDRIER › 📊 Production
        if (app === 'catalogue' && window.top === window && !/[?&](embed|out|view|share|pub)=/.test(location.search) && !/#xlink=/.test(location.hash)) { location.replace('matos.html?v=cat' + location.hash); return; } // CATALOGUE vit dans MATOS › 🗃️ Catalogue
        APP = app; homeFix(); brand(); setTimeout(() => { try { master(); } catch (e) { } }, 1200); if (!document.getElementById('xb-css')) css();
        const lay = () => { try { layout(); } catch (e) { console.warn('XBAR', e); } };
        if (typeof XDELEG === 'undefined' || !XDELEG.KEYS[app]) { XBOOT.ready(lay, 1800); const iv0 = setInterval(() => { if (build() || performance.now() > 15000) clearInterval(iv0); }, 700); setInterval(apply, 4000); return; } // 👥 Équipe seul (pas de délégation)
        XBOOT.ready(() => { try { if (build()) lay(); } catch (e) { } }, 1800); // rangé avant l'affichage de la page
        const iv = setInterval(() => { if (build()) lay(); if (performance.now() > 15000) clearInterval(iv); }, 700);
        addEventListener('storage', e => { if (/^xiii\.(drive|notes|memo|deleg|bar)/.test(e.key || '')) apply(); });
        setInterval(apply, 4000);
    }
    return { init, apply };
})();

XBAR.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XTEAMB : 🤝 Déléguer · 💬 Avis · 📌 Mots réunis dans un seul bouton « 👥 Équipe » à 3 onglets
//  Les fenêtres d'origine sont conservées ; une barre d'onglets commune passe de l'une à l'autre.
// =====================================================================
const XTEAMB = (() => {
    const T = [['deleg', '🤝', 'Déléguer', 'xdl-btn', '#xdl-ov .xdl-box'], ['notes', '💬', 'Avis', 'xnt-btn', '#xdl-ov .xdl-box'], ['memo', '📌', 'Mots', 'xmm-btn', '#xmm-ov .xmm-box']];
    const $ = id => document.getElementById(id);
    let cur = null, mo = null;
    const n = id => +(($(id) || {}).dataset || {}).n || 0;
    function badge() { const b = $('xtb-btn'); if (!b) return; const t = n('xnt-btn') + n('xmm-btn'); b.dataset.n = t || ''; b.title = '👥 Équipe : déléguer, avis, mots' + (t ? ' — ' + t + ' à traiter' : ''); }
    function strip() {
        if (!cur) return; const t = T.find(x => x[0] === cur), box = document.querySelector(t[4]); if (!box) { if (!document.querySelector('#xdl-ov,#xmm-ov')) { cur = null; } return; }
        if (box.querySelector('.xtb-tabs')) return;
        const d = document.createElement('div'); d.className = 'xtb-tabs';
        d.innerHTML = T.filter(x => $(x[3])).map(x => '<button data-t="' + x[0] + '" class="' + (x[0] === cur ? 'on' : '') + '">' + x[1] + ' ' + x[2] + ((x[0] === 'notes' && n('xnt-btn')) || (x[0] === 'memo' && n('xmm-btn')) ? ' <i>' + n(x[3]) + '</i>' : '') + '</button>').join('');
        box.prepend(d); d.querySelectorAll('[data-t]').forEach(b => b.onclick = () => go(b.dataset.t));
    }
    function go(t) {
        const x = T.find(y => y[0] === t), b = x && $(x[3]); if (!b) return;
        document.querySelectorAll('#xdl-ov,#xmm-ov').forEach(o => o.remove());
        cur = t; try { localStorage.setItem('xiii.teamtab', t); } catch (e) { } b.click(); setTimeout(strip, 30);
    }
    function open() { let t = null; try { t = localStorage.getItem('xiii.teamtab'); } catch (e) { } if (n('xnt-btn')) t = 'notes'; else if (n('xmm-btn')) t = 'memo'; go(T.some(x => x[0] === t && $(x[3])) ? t : T.find(x => $(x[3]))[0]); }
    function place() {
        const first = T.map(x => $(x[3])).find(Boolean); if (!first) return false;
        if (!$('xtb-btn')) { first.insertAdjacentHTML('beforebegin', '<button id="xtb-btn" title="👥 Équipe : déléguer, avis, mots"><span class="btn-icon">👥</span><span class="btn-label">Équipe</span></button>'); $('xtb-btn').onclick = open; }
        T.forEach(x => { const b = $(x[3]); if (b) b.style.display = 'none'; }); badge(); return true;
    }
    function init() {
        const s = document.createElement('style'); s.textContent = '#xtb-btn{position:relative}#xtb-btn[data-n]:not([data-n=""])::after{content:attr(data-n);position:absolute;top:-5px;right:-5px;background:#fbc02d;color:#222;border-radius:9px;font:700 10px/15px sans-serif;min-width:15px;padding:0 3px;text-align:center}' +
            '.xtb-tabs{display:flex;gap:4px;margin:-4px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--border-color,#444)}.xtb-tabs button{flex:1;font:inherit;font-size:13px;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:7px 8px;cursor:pointer}.xtb-tabs button.on{border-color:rgb(var(--accent,240,179,120));background:rgba(var(--accent,240,179,120),.2);font-weight:700}.xtb-tabs i{font-style:normal;background:#fbc02d;color:#222;border-radius:8px;padding:0 5px;font-size:11px;margin-left:3px}';
        document.head.appendChild(s);
        let k = 0; const iv = setInterval(() => { if (place() || ++k > 40) { if (k <= 40) { clearInterval(iv); setInterval(() => { place(); badge(); }, 2000); } else clearInterval(iv); } }, 600);
        mo = new MutationObserver(() => { if (cur) strip(); }); mo.observe(document.body, { childList: true, subtree: true });
    }
    return { init, open, go };
})();

XTEAMB.init();

// =====================================================================
//  SUITE XIII — XDATA : données vivantes (tarifs, grilles, cartes…)
//  Source : table publique Supabase « data_feeds », mise à jour côté serveur sans republier le site.
//  Lecture au plus une fois par jour et par flux, cache local, repli hors ligne sur le dernier état
//  puis sur site/data/<nom>.json livré avec le site.
//  XDATA.get('nom') → Promise<{ data, updated, checked, source, stale }>
//  XDATA.badge('nom') → « à jour du 27 oct. » à afficher près des valeurs
// =====================================================================
const XDATA = (() => {
    const SB = 'https://abvvsoccbdftticlmpgi.supabase.co', KEY = 'sb_publishable_wB5kIn6lQtO-YWdUlt3gfg_IBIgBMuL', DAY = 864e5;
    const K = n => 'xiii.data.' + n, mem = {}, inflight = {};
    const J = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const wrap = (o, stale) => o ? { data: o.data, updated: o.updated, checked: o.checked, source: o.source || '', stale: !!stale } : null;
    async function remote(n) {
        const r = await fetch(SB + '/rest/v1/data_feeds?select=data,source,updated_at,checked_at&name=eq.' + encodeURIComponent(n), { headers: { apikey: KEY } });
        if (!r.ok) throw new Error('http ' + r.status); const a = await r.json(); if (!a.length) return null;
        return { data: a[0].data, source: a[0].source, updated: a[0].updated_at, checked: a[0].checked_at, at: Date.now() };
    }
    async function bundled(n) { try { const r = await fetch('data/' + n + '.json', { cache: 'no-cache' }); if (r.ok) return { data: await r.json(), source: 'fichier livré', updated: null, at: 0 }; } catch (e) { } return null; }
    async function get(n, force) {
        if (!/^[a-z0-9_-]{2,40}$/.test(n)) throw new Error('nom de flux');
        const c = mem[n] || J(K(n));
        if (c && !force && Date.now() - (c.at || 0) < DAY) return wrap(mem[n] = c);
        if (inflight[n]) return inflight[n];
        return inflight[n] = (async () => {
            try { const r = navigator.onLine === false ? null : await remote(n); if (r) { mem[n] = r; W(K(n), r); return wrap(r); } }
            catch (e) { }
            if (c) return wrap(c, true);
            const b = await bundled(n); return b ? wrap(b, true) : null;
        })().finally(() => { delete inflight[n]; });
    }
    const badge = n => { const c = mem[n] || J(K(n)); if (!c || !c.updated) return ''; return 'à jour du ' + new Date(c.updated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); };
    return { get, badge };
})();

// =====================================================================
//  SUITE XIII — XACC : compte utilisateur, essai gratuit d'un mois, abonnement Pro
//  Session Supabase partagée avec compte.html (même origine, même clé localStorage).
//  Droit calculé côté serveur (rpc my_access) : 'pro' | 'trial' | 'readonly'.
//  Essai terminé sans abonnement → outils en lecture seule (XRO) : consultation, exports et impressions restent possibles.
//  Membres d'une équipe (invités par un Master via Drive XIII) : couverts par le compte du Master.
// =====================================================================
const XACC = (() => {
    const SB = 'https://abvvsoccbdftticlmpgi.supabase.co', KEY = 'sb_publishable_wB5kIn6lQtO-YWdUlt3gfg_IBIgBMuL';
    const SK = 'sb-abvvsoccbdftticlmpgi-auth-token', CK = 'xiii.acc';
    const FREE = /^(index|compte|legal|direct|prompteur|documents|vitrine|kiosque|equipe|jour|calendrier|drive|tally|remote|catalogue|importo|controle|ludo)$/; // pages jamais verrouillées
    const ENFORCE = false; // ⚠️ monétisation désactivée : passer à true à l'ouverture des ventes
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    let APP = '', ST = J(CK, null);
    const member = () => { const c = J('xiii.drive', null); return !!(c && c.url && c.tok && !c.code); };
    const session = () => { const s = J(SK, null); return s && s.access_token ? s : null; };
    async function token() {
        const s = session(); if (!s) return null;
        if ((s.expires_at || 0) * 1000 - Date.now() > 60000) return s.access_token;
        try {
            const r = await fetch(SB + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
            if (r.status === 400 || r.status === 401) { localStorage.removeItem(SK); return null; }
            const n = await r.json(); if (!n.access_token) return null;
            W(SK, Object.assign({}, s, n, { expires_at: n.expires_at || Math.floor(Date.now() / 1000) + (n.expires_in || 3600) })); return n.access_token;
        } catch (e) { return undefined; } // hors ligne
    }
    async function refresh(force) {
        if (!force && ST && Date.now() - (ST.at || 0) < 3 * 3600e3) return ST;
        const t = await token();
        if (t === null) { ST = { plan: 'none', at: Date.now() }; W(CK, ST); return ST; }
        if (t === undefined) return ST; // hors ligne : on garde le dernier état connu
        try {
            const r = await fetch(SB + '/rest/v1/rpc/my_access', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: '{}' });
            if (r.ok) { const a = await r.json(); if (a && a.plan) { ST = Object.assign(a, { at: Date.now() }); W(CK, ST); } }
        } catch (e) { }
        return ST;
    }
    const plan = () => member() ? 'team' : session() ? (ST && ST.plan) || 'trial' : 'none';
    // hors ligne prolongé : 14 jours de tolérance sur le dernier état « pro / essai »
    const solo = () => plan() === 'pro' && ST && ST.scope === 'solo';
    const other = () => solo() && ST.tool !== APP && !FREE.test(APP); // offre Solo : un seul outil ouvert en écriture
    const locked = () => { if (!ENFORCE) return false; if (FREE.test(APP) || member()) return false; const p = plan(); if (p === 'none' || p === 'readonly') return true; return other(); };
    const NAME = a => String(a || '').toUpperCase();
    const days = () => ST && ST.trial_ends_at ? Math.max(0, Math.ceil((new Date(ST.trial_ends_at) - Date.now()) / 864e5)) : 0;
    let said = 0;
    function nudge() {
        if (Date.now() - said < 5000) return; said = Date.now(); const none = plan() === 'none';
        if (other()) { let el = document.getElementById('xacc-nudge'); if (el) el.remove(); el = document.createElement('div'); el.id = 'xacc-nudge'; el.innerHTML = '<b>🔒 ' + NAME(APP) + ' n\'est pas dans votre offre Solo</b><span>Votre offre Solo couvre ' + NAME(ST.tool) + '. Passez à l\'offre Complète pour ouvrir tous les outils.</span><a href="compte.html?from=' + encodeURIComponent(APP) + '">Voir les offres</a><button aria-label="Fermer">✕</button>'; document.body.appendChild(el); el.querySelector('button').onclick = () => el.remove(); setTimeout(() => el.remove(), 9000); return; }
        let el = document.getElementById('xacc-nudge'); if (el) el.remove(); el = document.createElement('div'); el.id = 'xacc-nudge';
        el.innerHTML = '<b>' + (none ? '🔑 Créez votre compte SUITE XIII' : '🔒 Votre essai gratuit est terminé') + '</b><span>' + (none ? '1 mois d\'essai gratuit, sans carte bancaire. En attendant, l\'outil est en lecture seule.' : 'Vos projets restent consultables et exportables. Choisissez une offre (dès 5 € HT/mois) pour continuer à créer et modifier.') + '</span><a href="compte.html?from=' + encodeURIComponent(APP) + '">' + (none ? 'Créer mon compte' : 'Voir les offres') + '</a><button aria-label="Fermer">✕</button>';
        document.body.appendChild(el); el.querySelector('button').onclick = () => el.remove(); setTimeout(() => el.remove(), 9000);
    }
    function chip() {
        if (!ENFORCE) return;
        if (window.top !== window || /^(direct|prompteur|tally|remote|kiosque|vitrine)$/.test(APP)) return;
        let c = document.getElementById('xacc-chip'); if (!c) { c = document.createElement('a'); c.id = 'xacc-chip'; c.href = 'compte.html?from=' + encodeURIComponent(APP); document.body.appendChild(c); }
        const p = plan(), d = days();
        c.className = 'p-' + p + ((p === 'trial' && d <= 5) || other() ? ' soon' : '');
        c.textContent = p === 'pro' ? (ST.scope === 'life' ? '★ À vie' : ST.scope === 'solo' ? (other() ? '🔒 Solo · ' + NAME(ST.tool) : '★ Solo') : '★ Complet') : p === 'team' ? '👥 Équipe' : p === 'trial' ? '⏳ Essai · ' + d + ' j' : p === 'readonly' ? '🔒 Choisir une offre' : '🔑 Créer un compte';
        c.title = p === 'trial' ? 'Essai gratuit : ' + d + ' jour(s) restant(s)' : 'Mon compte SUITE XIII';
    }
    function init(app) {
        APP = app;
        const s = document.createElement('style');
        s.textContent = '#xacc-chip{position:fixed;left:10px;bottom:10px;z-index:9984;font:600 11px/1 "Segoe UI",system-ui,sans-serif;padding:6px 10px;border-radius:99px;text-decoration:none;border:1px solid rgba(240,180,41,.45);background:rgba(20,18,16,.82);color:#f0b429;backdrop-filter:blur(6px);box-shadow:0 2px 10px rgba(0,0,0,.25);transition:transform .15s}#xacc-chip:hover{transform:translateY(-1px)}#xacc-chip.p-pro{color:#9be7a0;border-color:rgba(155,231,160,.45)}#xacc-chip.p-team{color:#8fd3ff;border-color:rgba(143,211,255,.45)}#xacc-chip.p-readonly,#xacc-chip.p-none,#xacc-chip.soon{background:#f0b429;color:#1b1406;border-color:#f0b429}@media print{#xacc-chip,#xacc-nudge{display:none!important}}' +
            '#xacc-nudge{position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:2147483000;display:grid;grid-template-columns:1fr auto auto;gap:4px 12px;align-items:center;max-width:min(560px,calc(100vw - 32px));padding:14px 16px;border-radius:12px;background:#1d1a17;color:#f3ede6;border:1px solid #f0b429;box-shadow:0 12px 40px rgba(0,0,0,.45);font:14px/1.4 "Segoe UI",system-ui,sans-serif;animation:xaccIn .25s ease-out}#xacc-nudge b{grid-column:1}#xacc-nudge span{grid-column:1;color:#bfb5a9;font-size:13px}#xacc-nudge a{grid-row:1/3;grid-column:2;background:#f0b429;color:#1b1406;font-weight:700;text-decoration:none;padding:9px 14px;border-radius:8px;white-space:nowrap}#xacc-nudge button{grid-row:1/3;grid-column:3;background:none;border:0;color:#8b8177;font-size:16px;cursor:pointer}@keyframes xaccIn{from{opacity:0;transform:translate(-50%,8px)}}';
        document.head.appendChild(s);
        let nud = 0; const upd = () => { chip(); if (typeof XRO !== 'undefined' && XRO.paint) XRO.paint(); if (locked() && !nud) { nud = 1; setTimeout(nudge, 1200); } };
        XBOOT.ready(() => { upd(); refresh(false).then(upd); }, 950);
        addEventListener('storage', e => { if (e.key === SK || e.key === CK) { ST = J(CK, null); refresh(e.key === SK).then(upd); } });
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(false).then(upd); });
    }
    return { init, locked, nudge, plan, days, refresh, SB, KEY, SK };
})();

XACC.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XRO : 👁️ membre en lecture seule
//  Rien n'est modifiable : boutons d'édition grisés, champs verrouillés, clics et glisser-déposer dans l'espace
//  de travail bloqués. Restent utilisables : 🏠, vues / onglets / zoom, recherche, exports et impressions,
//  partage, ⚙️ (thème), 👥 Équipe (lecture), ☁️ Drive. Accueil : seuls les outils partagés sont affichés.
//  DOSSIER : remplacé par 📂 Documents (ce que le Master a publié, PDF lisibles).
// =====================================================================
const XRO = (() => {
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const cfg = () => J('xiii.drive', null), dro = () => { const c = cfg(); return !!(c && c.url && c.tok && !c.code && c.perm === 'read'); }, lic = () => !dro() && typeof XACC !== 'undefined' && XACC.locked(), ro = () => dro() || lic();
    const OKID = /^(xb-exp|xf-btn|xs-gear|xtb-btn|xdr-btn|xdr-chip|xsh-btn|xpb-btn|lib-toggle-btn|xb-home|xgt-btn-ro)$/;
    const OKTXT = /(zoom|vue|afficher|masquer la|imprimer|export|pdf|png|csv|excel|rechercher|plein écran|centrer|cadrer|ajuster|accueil|aperçu|lecture|suivant|précédent|agrandir|réduire|légende|calque)/i, BADTXT = /(import|ajout|supprim|nouveau|nouvel|effacer|vider|créer|dupliquer|renommer|enregistrer|ouvrir un|charger|modifier|coller|remplacer|réinitialiser|générer|envoyer|déléguer)/i;
    const own = el => { let p = el; while (p && p.parentElement && p.parentElement !== document.body) p = p.parentElement; return p && p.id && /^x/.test(p.id) && !/^xb-bar$/.test(p.id) ? p : null; }; // fenêtres de la suite (paramètres, menus…)
    function okBtn(b) {
        if (!b) return false; if (OKID.test(b.id || '')) return true; if (b.closest('#xb-hold')) return true;
        const t = ((b.title || '') + ' ' + (b.getAttribute('aria-label') || '') + ' ' + (b.textContent || '')).replace(/\s+/g, ' ');
        const oc = b.getAttribute('onclick') || '';
        if (/accueil/i.test(t) || b.dataset.view || /setView|switchTab|zoom|print|export|toggleTheme|fitView|centerView|toggleFullscreen|toggleLibrary/i.test(oc)) return true;
        return OKTXT.test(t) && !BADTXT.test(t);
    }
    const allowed = el => { if (!el || !el.closest) return true; if (own(el) || el.closest('#xd-dash')) return true; const b = el.closest('button,a,[role=button],.tab,.tab-title,.tab-content,select'); if (b && b.matches('a[href]') && !b.closest('#workspace,#canvas,svg')) return true; if (b && b.matches('.tab,.tab-title,.tab-content') ) return true; if (b && b.matches('button,[role=button]')) return okBtn(b); return false; };
    let said = 0; const say = () => { if (Date.now() - said < 4000) return; said = Date.now(); try { if (lic()) { XACC.nudge(); return; } (typeof toast === 'function' ? toast : XProj.toast)('👁️ Lecture seule : le Master ne vous a donné accès qu\'en consultation'); } catch (e) { } };
    function block(e) { if (!ro() || allowed(e.target)) return; if (e.type === 'pointerdown' && e.button === 1) return; e.preventDefault(); e.stopImmediatePropagation(); if (e.type === 'click' || e.type === 'pointerdown') say(); }
    function paint() {
        if (!ro()) { document.body.classList.remove('xro', 'xlic'); return; } document.body.classList.add('xro'); document.body.classList.toggle('xlic', lic());
        document.querySelectorAll('button,[role=button]').forEach(b => { if (own(b) || b.closest('#xd-dash')) return; b.classList.toggle('xro-off', !okBtn(b)); });
        document.querySelectorAll('input,select,textarea,[contenteditable=true]').forEach(i => { if (own(i) || i.dataset.xroKeep || i.closest('#xd-dash')) return; if (i.matches('[type=range]') && /zoom/i.test(i.id + i.title)) return; i.classList.add('xro-off'); if (i.isContentEditable) i.setAttribute('contenteditable', 'false'); else if (!i.disabled) { i.disabled = true; i.dataset.xroDis = '1'; } });
    }
    // DOSSIER pour un membre : seulement les documents de l'équipe, sauf si le Master lui a ouvert DOSSIER (outil coché + modification)
    function docsOnly() { const c = cfg(); if (!c || !c.url || !c.tok || c.code) return false; return dro() || !(Array.isArray(c.apps) && c.apps.indexOf('dossier') >= 0); }
    function index() { // accueil : seulement les outils partagés
        const c = cfg(); if (!c || !c.tok || c.code || !c.apps || !c.apps.length) return;
        const app = a => ((a.getAttribute('href') || '').split(/[?#]/)[0].split('/').pop() || '').replace(/\.html$/, '');
        document.querySelectorAll('a.card').forEach(a => { const k = app(a); if (k && c.apps.indexOf(k) < 0 && !/^(jour|calendrier|drive|documents|equipe)$/.test(k)) { a.style.display = 'none'; a.dataset.pcfg = '1'; } });
        document.querySelectorAll('section.phase').forEach(ph => { if (!ph.querySelector('a.card')) return; ph.style.display = [...ph.querySelectorAll('a.card')].some(a => a.style.display !== 'none') ? '' : 'none'; });
    }
    function init(app) {
        if (app === 'index') { const c = cfg(); if (c && c.tok && !c.code && String(c.secteur || '').split(',').indexOf('client') > -1 && !/[?&]home/.test(location.search)) { location.replace('vitrine.html'); return; } if (c && c.tok && !c.code && String(c.secteur || '').split(',').indexOf('kiosque') > -1 && window.top === window) { location.replace('kiosque.html' + (c.kh || '')); return; } } // 🎬 client : sa page d'accueil est la vitrine
        if (app === 'dossier' && window.top === window && docsOnly() && !/[?&]edit/.test(location.search)) { location.replace('documents.html?in=dossier'); return; } // membres : DOSSIER = 📂 documents de l'équipe
        const s = document.createElement('style');
        s.textContent = 'body.xro .xro-off{opacity:.38!important;filter:grayscale(1)!important;cursor:not-allowed!important}body.xro button.xro-off,body.xro .xro-off *{pointer-events:none}' +
            'html.xembed body.xro::after{display:none!important}body.xro #xau-chip{display:none!important}body.xro.xlic::after{content:"🔒 Lecture seule · essai terminé"!important}body.xro::after{content:"👁️ Lecture seule";position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:9985;font:600 11px "Segoe UI",sans-serif;padding:4px 10px;border-radius:99px;background:rgba(79,195,247,.15);color:#4fc3f7;border:1px solid rgba(79,195,247,.5);pointer-events:none}';
        document.head.appendChild(s);
        ['pointerdown', 'mousedown', 'click', 'dblclick', 'contextmenu', 'dragstart', 'drop', 'touchstart'].forEach(t => addEventListener(t, block, { capture: true, passive: false }));
        const go = () => { if (app === 'index') index(); paint(); let t = null; new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { paint(); if (app === 'index') index(); }, 250); }).observe(document.body, { childList: true, subtree: true }); };
        XBOOT.ready(go, 900);
    }
    return { init, ro, docsOnly, paint: () => { try { paint(); } catch (e) { } } };
})();

XRO.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XLIB : volet bibliothèque des outils
//  Replié par défaut à la première ouverture (ensuite l'outil retient le choix), bouton réduit à une flèche
//  sans texte, et rien ne dépasse quand il est replié (onglets, icône).
// =====================================================================
const XLIB = (() => {
    let APP = '';
    const $ = id => document.getElementById(id);
    const KEY = () => 'xiii.lib.' + APP;
    const synoShown = () => { const p = $('library-panel'); return p && p.style.width !== '0px'; };
    const hidden = () => APP === 'syno' ? !synoShown() : document.body.classList.contains('lib-hidden');
    function btn() {
        const b = $('lib-toggle-btn'); if (!b) return;
        b.removeAttribute('title'); b.setAttribute('aria-label', hidden() ? 'Afficher la bibliothèque' : 'Masquer la bibliothèque');
        if (!b.dataset.xlib) { b.dataset.xlib = '1'; new MutationObserver(() => { if (b.hasAttribute('title')) b.removeAttribute('title'); }).observe(b, { attributes: true, attributeFilter: ['title'] }); b.addEventListener('click', () => setTimeout(() => { try { localStorage.setItem(KEY(), hidden() ? 'closed' : 'open'); } catch (e) { } btn(); }, 50)); }
    }
    function init(app) {
        APP = app; if (typeof toggleLibrary !== 'function') return;
        const s = document.createElement('style');
        s.textContent = '#lib-toggle-btn .btn-label{display:none!important}#lib-toggle-btn{min-width:0!important;padding-left:9px!important;padding-right:9px!important}' +
            '#library-panel[style*="width: 0px"]{overflow:hidden!important;visibility:hidden!important;padding:0!important;border:0!important;min-width:0!important}' +
            'body.lib-hidden #library-panel,body.lib-hidden #library,body.lib-hidden #lib-panel,body.lib-hidden .library-panel,body.lib-hidden #sidebar.lib{overflow:hidden!important;visibility:hidden!important}';
        document.head.appendChild(s);
        const go = () => {
            let st = null; try { st = localStorage.getItem(KEY()); } catch (e) { }
            if (!st && !hidden()) { try { toggleLibrary(); } catch (e) { } } // première ouverture : replié
            else if (st === 'closed' && !hidden()) { try { toggleLibrary(); } catch (e) { } }
            else if (APP === 'syno' && st === 'open' && hidden()) { try { toggleLibrary(); } catch (e) { } }
            if (!st) try { localStorage.setItem(KEY(), 'closed'); } catch (e) { }
            btn();
        };
        XBOOT.ready(go, 1200);
    }
    return { init };
})();

XLIB.init(XIII_APP);

