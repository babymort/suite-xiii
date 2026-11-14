// =====================================================================
//  SUITE XIII — XHOMECFG : l'accueil sur mesure (saison 6, phase P)
//  ⚙️ › « 🏠 Accueil sur mesure… » ouvre une fenêtre :
//   · Rubriques de la colonne (Concevoir, Organiser, Tourner, Livrer) : ordre (‹ ›) et masquage ; Dashboard et Réglages restent ;
//   · Taille des tuiles d'outils : compacte, normale, grande ;
//   · Fond : quadrillage (d'origine), points, uni, dégradé doux, image perso (réduite et gardée dans ce navigateur) ;
//   · Message d'accueil : « Bonjour + prénom » et/ou un texte libre, en tête du Dashboard ;
//   · À l'ouverture : toujours le Dashboard, ou la dernière rubrique ouverte.
//  Réglages personnels (clé xiii.home.cfg, communs à tous les projets).
// =====================================================================
(function () {
    if (window.XHOMECFG) return;
    const K = 'xiii.home.cfg', R = document.documentElement, $ = id => document.getElementById(id);
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const cfg = () => Object.assign({ order: [], hide: [], size: 'm', bg: 'grid', img: '', msg: '', hello: false, start: 'last' }, J(K, {}) || {});
    const save = c => { try { localStorage.setItem(K, JSON.stringify(c)); } catch (e) { alert('Image trop lourde pour ce navigateur : choisissez-en une plus légère.'); return false; } apply(); return true; };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const BGS = [['grid', 'Quadrillage'], ['dots', 'Points'], ['plain', 'Uni'], ['soft', 'Dégradé doux'], ['img', 'Image perso']];
    const SIZES = [['s', 'Compactes'], ['m', 'Normales'], ['l', 'Grandes']];
    const css = document.createElement('style'); css.id = 'xhomecfg-css';
    css.textContent =
        // tailles des tuiles
        'html.xhs-s body.xh main section.phase:not(#xpin) .grid{grid-template-columns:repeat(auto-fill,minmax(250px,1fr))!important;gap:12px!important}html.xhs-s body.xh main section.phase:not(#xpin) a.card{min-height:170px!important;padding:16px 16px 14px 20px!important}html.xhs-s body.xh main section.phase:not(#xpin) a.card .card-desc{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}html.xhs-s body.xh main section.phase:not(#xpin) a.card .chips{display:none!important}' +
        'html.xhs-l body.xh main section.phase:not(#xpin) .grid{grid-template-columns:repeat(auto-fill,minmax(440px,1fr))!important;gap:22px!important}html.xhs-l body.xh main section.phase:not(#xpin) a.card{min-height:300px!important}' +
        // fonds
        'html[data-xhbg=dots] body.xh{background:radial-gradient(1000px 700px at 0% 0%,rgba(240,170,41,.2),transparent 65%),radial-gradient(rgba(255,255,255,.07) 1px,transparent 1.4px) 0 0/22px 22px,var(--xh-bg)!important;background-attachment:fixed!important}' +
        'html[data-xhbg=plain] body.xh{background:var(--xh-bg)!important}' +
        'html[data-xhbg=soft] body.xh{background:radial-gradient(1200px 800px at 10% 0%,rgba(240,170,41,.2),transparent 70%),radial-gradient(1100px 800px at 100% 100%,rgba(186,104,200,.14),transparent 70%),linear-gradient(160deg,#100d0a,#0b0a09 60%,#0d0b10)!important;background-attachment:fixed!important}' +
        'html[data-xhbg=img] body.xh{background:linear-gradient(rgba(8,7,6,.62),rgba(8,7,6,.72)),var(--xh-img) center/cover no-repeat,var(--xh-bg)!important;background-attachment:fixed!important}' +
        // message d'accueil
        '#xh-msg{margin:0 0 14px;padding:14px 18px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);animation:xhmIn .4s cubic-bezier(.2,.7,.2,1)}#xh-msg b{display:block;font-size:20px;margin-bottom:2px}#xh-msg span{white-space:pre-wrap;opacity:.82}@keyframes xhmIn{from{opacity:0;transform:translateY(-6px)}}' +
        // fenêtre
        '#xhc{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font:13px/1.45 system-ui,"Segoe UI",sans-serif}#xhc .b{width:min(640px,100%);max-height:min(860px,100%);display:flex;flex-direction:column;background:var(--bg-menu,#1d1d21);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.5);overflow:hidden}' +
        '#xhc .h{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--border-color,#333)}#xhc .h b{flex:1;font-size:16px}#xhc button{font:inherit;color:inherit;cursor:pointer}#xhc .x{width:32px;height:32px;border-radius:9px;border:1px solid var(--border-color,#555);background:transparent}' +
        '#xhc .c{overflow:auto;padding:16px 18px;display:flex;flex-direction:column;gap:18px;scrollbar-width:thin}#xhc h5{margin:0 0 8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.6}#xhc .hint{font-size:12px;opacity:.6;margin:-4px 0 8px}' +
        '#xhc .rub{display:flex;flex-direction:column;gap:4px}#xhc .rub div{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:9px;background:rgba(255,255,255,.03)}#xhc .rub div.off{opacity:.45}#xhc .rub span{flex:1}#xhc .rub button{width:28px;height:26px;border-radius:7px;border:1px solid var(--border-color,#4a4a50);background:transparent}' +
        '#xhc .seg{display:flex;flex-wrap:wrap;gap:4px}#xhc .seg button{height:30px;padding:0 12px;border-radius:8px;border:1px solid var(--border-color,#4a4a50);background:transparent}#xhc .seg button.on{background:rgba(240,179,120,.18);border-color:#f0b378;color:#f6c79a}' +
        '#xhc textarea{width:100%;box-sizing:border-box;min-height:64px;border-radius:9px;border:1px solid var(--border-color,#4a4a50);background:rgba(255,255,255,.04);color:inherit;font:inherit;padding:8px 10px;resize:vertical}#xhc label.ck{display:flex;align-items:center;gap:8px;margin-top:6px}' +
        '#xhc .f{display:flex;justify-content:space-between;padding:12px 18px;border-top:1px solid var(--border-color,#333)}#xhc .f button{height:32px;padding:0 14px;border-radius:9px;border:1px solid var(--border-color,#555);background:transparent}#xhc .f .ok{background:#f0b378;border-color:#f0b378;color:#1a1208;font-weight:700}';
    (document.head || R).appendChild(css);
    // ---------- application ----------
    const phases = () => [...document.querySelectorAll('#xh-nav button[data-t^="p"]')].map(b => [b.dataset.t, (b.querySelector('span:last-child') || b).textContent.trim()]);
    function nav() {
        const n = $('xh-nav'); if (!n) return; const c = cfg(), B = [...n.querySelectorAll('button[data-t^="p"]')]; if (!B.length) return;
        const nm = b => (b.querySelector('span:last-child') || b).textContent.trim(), first = B[0].previousElementSibling;
        const S = B.slice().sort((a, b) => { const i = c.order.indexOf(nm(a)), j = c.order.indexOf(nm(b)); return (i < 0 ? 99 + B.indexOf(a) : i) - (j < 0 ? 99 + B.indexOf(b) : j); });
        let at = first; S.forEach(b => { if (at.nextElementSibling !== b) at.after(b); at = b; const off = c.hide.indexOf(nm(b)) > -1; b.style.display = off ? 'none' : ''; if (off && b.classList.contains('on')) { const d = n.querySelector('[data-t=dash]'); if (d) setTimeout(() => d.click(), 0); } });
    }
    function msg() {
        const c = cfg(), dash = $('xd-dash'); let m = $('xh-msg'); const name = (() => { try { const d = J('xiii.drive', {}); const v = (d && d.me && d.me.name) || ''; if (v) return v; const i = document.querySelector('#xid-chip span'); return i && !/votre nom/i.test(i.textContent) ? i.textContent : ''; } catch (e) { return ''; } })();
        const h = new Date().getHours(), hello = c.hello ? (h < 5 || h >= 18 ? 'Bonsoir' : 'Bonjour') + (name ? ' ' + name.split(/\s+/)[0] : '') + ' 👋' : '';
        if (!hello && !c.msg) { if (m) m.remove(); return; } if (!dash || !dash.parentNode) return;
        if (!m) { m = document.createElement('div'); m.id = 'xh-msg'; } const html = (hello ? '<b>' + esc(hello) + '</b>' : '') + (c.msg ? '<span>' + esc(c.msg) + '</span>' : '');
        if (m.innerHTML !== html) m.innerHTML = html; if (m.nextElementSibling !== dash) dash.before(m);
    }
    function apply() {
        const c = cfg(); ['s', 'm', 'l'].forEach(x => R.classList.toggle('xhs-' + x, c.size === x && x !== 'm'));
        if (c.bg && c.bg !== 'grid' && !(c.bg === 'img' && !c.img)) R.dataset.xhbg = c.bg; else delete R.dataset.xhbg;
        if (c.img) R.style.setProperty('--xh-img', 'url("' + c.img + '")'); else R.style.removeProperty('--xh-img');
        nav(); msg();
    }
    // ---------- fenêtre ----------
    function open() {
        close(); const ov = document.createElement('div'); ov.id = 'xhc'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Accueil sur mesure');
        ov.innerHTML = '<div class="b"><div class="h"><b>🏠 Accueil sur mesure</b><button class="x" title="Fermer (Échap)">✕</button></div><div class="c"></div><div class="f"><button data-reset>↺ Accueil d’origine</button><button class="ok" data-ok>✓ Terminé</button></div></div>';
        document.body.appendChild(ov); const C = ov.querySelector('.c');
        const draw = () => { const c = cfg(), P = phases().map(p => p[1]); const ord = P.slice().sort((a, b) => { const i = c.order.indexOf(a), j = c.order.indexOf(b); return (i < 0 ? 99 + P.indexOf(a) : i) - (j < 0 ? 99 + P.indexOf(b) : j); });
            const seg = (f, L, v) => '<div class="seg" data-f="' + f + '">' + L.map(x => '<button type="button" data-v="' + x[0] + '" class="' + (x[0] === v ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div>';
            C.innerHTML = '<div><h5>Rubriques de la colonne</h5><p class="hint">Ordre et affichage. Dashboard et Réglages restent toujours.</p><div class="rub">' + ord.map(n => '<div class="' + (c.hide.indexOf(n) > -1 ? 'off' : '') + '" data-n="' + esc(n) + '"><span>' + esc(n) + '</span><button type="button" data-m="-1" title="Monter">↑</button><button type="button" data-m="1" title="Descendre">↓</button><button type="button" data-h title="Afficher / masquer">' + (c.hide.indexOf(n) > -1 ? '🙈' : '👁') + '</button></div>').join('') + '</div></div>' +
                '<div><h5>Taille des tuiles d’outils</h5>' + seg('size', SIZES, c.size) + '</div>' +
                '<div><h5>Fond</h5>' + seg('bg', BGS, c.bg) + (c.bg === 'img' ? '<p class="hint" style="margin-top:8px">' + (c.img ? 'Image en place. ' : '') + '<button type="button" data-img style="height:28px;padding:0 10px;border-radius:8px;border:1px solid var(--border-color,#555);background:transparent">🖼️ ' + (c.img ? 'Changer' : 'Choisir') + ' l’image…</button></p>' : '') + '</div>' +
                '<div><h5>Message d’accueil</h5><textarea data-msg placeholder="Ex. : Tournage J-12 · pensez aux DPAE avant vendredi">' + esc(c.msg) + '</textarea><label class="ck"><input type="checkbox" data-hello' + (c.hello ? ' checked' : '') + '> « Bonjour + prénom » selon l’heure</label></div>' +
                '<div><h5>À l’ouverture de l’accueil</h5>' + seg('start', [['dash', 'Toujours le Dashboard'], ['last', 'La dernière rubrique ouverte']], c.start) + '</div>';
            const L = () => [...C.querySelectorAll('.rub [data-n]')].map(d => d.dataset.n);
            C.querySelectorAll('.rub [data-m]').forEach(b => b.onclick = () => { const o = L(), n = b.closest('[data-n]').dataset.n, i = o.indexOf(n), j = i + +b.dataset.m; if (j < 0 || j >= o.length) return; o.splice(j, 0, o.splice(i, 1)[0]); const c2 = cfg(); c2.order = o; save(c2); draw(); });
            C.querySelectorAll('.rub [data-h]').forEach(b => b.onclick = () => { const n = b.closest('[data-n]').dataset.n, c2 = cfg(), i = c2.hide.indexOf(n); if (i > -1) c2.hide.splice(i, 1); else c2.hide.push(n); save(c2); draw(); });
            C.querySelectorAll('.seg button').forEach(b => b.onclick = () => { const c2 = cfg(); c2[b.parentElement.dataset.f] = b.dataset.v; save(c2); draw(); if (b.parentElement.dataset.f === 'bg' && b.dataset.v === 'img' && !c2.img) pick(); });
            const ib = C.querySelector('[data-img]'); if (ib) ib.onclick = pick;
            C.querySelector('[data-msg]').oninput = e => { const c2 = cfg(); c2.msg = e.target.value.slice(0, 400); save(c2); };
            C.querySelector('[data-hello]').onchange = e => { const c2 = cfg(); c2.hello = e.target.checked; save(c2); };
        };
        const pick = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = () => { const f = i.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 1920 / im.width), cv = document.createElement('canvas'); cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); const c2 = cfg(); c2.img = cv.toDataURL('image/jpeg', .8); c2.bg = 'img'; if (save(c2)) draw(); }; im.src = r.result; }; r.readAsDataURL(f); }; i.click(); };
        draw();
        ov.querySelector('.x').onclick = ov.querySelector('[data-ok]').onclick = close; ov.addEventListener('pointerdown', e => { if (e.target === ov) close(); });
        ov.querySelector('[data-reset]').onclick = () => { if (!confirm('Revenir à l’accueil d’origine (rubriques, tuiles, fond, message) ?')) return; try { localStorage.removeItem(K); } catch (e) { } R.style.removeProperty('--xh-img'); apply(); [...document.querySelectorAll('#xh-nav button[data-t^="p"]')].forEach(b => { b.style.display = ''; }); draw(); };
        addEventListener('keydown', key, true);
    }
    const key = e => { if (e.key === 'Escape' && $('xhc')) { e.preventDefault(); e.stopPropagation(); close(); } };
    function close() { const o = $('xhc'); if (o) o.remove(); removeEventListener('keydown', key, true); }
    function row() { const pan = $('xs-panel'); if (!pan || $('xhc-row')) return; const a = $('xbc-row') || $('xcolor-sw'); if (!a) return;
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xhc-row'; d.innerHTML = '<label>Accueil sur mesure<small>Rubriques, taille des tuiles, fond, message d’accueil.</small></label><div class="xs-c"><button type="button" class="xs-btn">🏠 Personnaliser…</button></div>';
        d.querySelector('button').onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open, 120); }; a.after(d); }
    // ---------- démarrage ----------
    let started = false;
    const go = () => { apply();
        new MutationObserver(ms => { if ($('xs-panel')) row(); if (ms.some(m => [...m.addedNodes].some(n => n.id === 'xh-nav' || n.id === 'xd-dash' || (n.nodeType === 1 && n.querySelector && n.querySelector('#xd-dash'))))) { nav(); msg(); } }).observe(document.body, { childList: true, subtree: true });
        // à l'ouverture : toujours le Dashboard (si choisi)
        let n = 0; const st = () => { const d = document.querySelector('#xh-nav [data-t=dash]'); if (!d) { if (++n < 40) setTimeout(st, 150); return; } if (!started) { started = true; if (cfg().start === 'dash' && !d.classList.contains('on')) d.click(); } nav(); msg(); }; st(); };
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    addEventListener('storage', e => { if (e.key === K) apply(); });
    window.XHOMECFG = { open, apply };
})();
