// =====================================================================
//  SUITE XIII — XPIDENT : identité du projet (saison 6, phase P)
//  Fenêtre « 🪪 Identité du projet » (page Réglages, ⚙️ › Affichage, ou clic sur la bannière de l'accueil) :
//   · emoji et couleur du projet (registre des projets : pastille de l'espace de travail, onglets, couleur « Projet ») ;
//   · logo (celui de la fiche projet, repris dans les en-têtes et pieds des PDF par la charte graphique) ;
//   · bannière (image recadrée en 4:1, propre au projet) affichée en tête de l'accueil avec l'emoji, le nom et le logo ;
//   · « Appliquer aux exports » : la couleur du projet devient la couleur principale de la charte graphique.
//  Repris aussi : emoji devant le nom du projet dans l'espace de travail et dans la barre des outils.
// =====================================================================
(function () {
    if (window.XPIDENT) return;
    const APP = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
    const KB = 'xiii.pid.banner'; // propre au projet (rangé par projet par XWS)
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const W = () => (typeof XWS !== 'undefined' && XWS.meta && XWS.meta()) || null;
    const EMO = ['🎬', '📺', '🎥', '🎤', '🎭', '🎪', '🎸', '🎻', '🏟️', '⛪', '🏛️', '🌊', '🏔️', '🚀', '⭐', '🔥', '💡', '🎯', '🦁', '🌿'];
    const PAL = ['#f0b429', '#4fc3f7', '#81c784', '#e57373', '#ba68c8', '#ff8a3d', '#4db6ac', '#f06292', '#9575cd', '#d4e157'];
    // ---------- fiche projet (logo) ----------
    const fiches = () => { try { return JSON.parse(localStorage.getItem('xiii.projets') || 'null'); } catch (e) { return null; } };
    const fiche = () => { const s = fiches(); return s && s.list ? s.list.find(f => f && f.id === s.active) || null : null; };
    function setLogo(v) { const s = fiches(); if (!s || !s.list) return false; const f = s.list.find(x => x && x.id === s.active); if (!f) return false; f.logo = v; try { localStorage.setItem('xiii.projets', JSON.stringify(s)); } catch (e) { alert('Stockage plein : logo trop lourd ?'); return false; } return true; }
    const banner = () => { try { return localStorage.getItem(KB) || ''; } catch (e) { return ''; } };
    // image → dataURL réduite (logo carré max 400 px en PNG ; bannière 1600×400 recadrée en JPEG)
    function shrink(file, ban) { return new Promise(res => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const cv = document.createElement('canvas'), x = cv.getContext('2d');
        if (ban) { cv.width = 1600; cv.height = 400; const k = Math.max(1600 / im.width, 400 / im.height), w = im.width * k, h = im.height * k; x.drawImage(im, (1600 - w) / 2, (400 - h) / 2, w, h); res(cv.toDataURL('image/jpeg', .82)); }
        else { const k = Math.min(1, 400 / Math.max(im.width, im.height)); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); x.drawImage(im, 0, 0, cv.width, cv.height); res(cv.toDataURL('image/png')); } }; im.onerror = () => res(''); im.src = r.result; }; r.readAsDataURL(file); }); }
    const pick = ban => new Promise(res => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = async () => res(i.files[0] ? await shrink(i.files[0], ban) : ''); i.click(); });
    // ---------- reprise : accueil (bannière), outils (emoji devant le nom du projet), espace (pastille) ----------
    const css = document.createElement('style'); css.id = 'xpident-css';
    css.textContent = '#xpid-ban{position:relative;margin:0 0 18px;border-radius:18px;overflow:hidden;min-height:96px;display:flex;align-items:flex-end;gap:14px;padding:16px 20px;box-sizing:border-box;cursor:pointer;background:linear-gradient(120deg,var(--xpid-c,#f0b429),rgba(0,0,0,.6));background-size:cover;background-position:center;border:1px solid rgba(255,255,255,.08)}#xpid-ban::before{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.65),rgba(0,0,0,.05) 70%)}#xpid-ban>*{position:relative}' +
        '#xpid-ban .e{font-size:38px;line-height:1}#xpid-ban b{font:600 24px/1.1 system-ui,sans-serif;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.5)}#xpid-ban small{display:block;font-size:12px;color:rgba(255,255,255,.75);margin-top:3px}#xpid-ban img{margin-left:auto;max-height:56px;max-width:160px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))}#xpid-ban .ed{position:absolute;top:10px;right:12px;font-size:11.5px;color:#fff;opacity:0;transition:opacity .2s;background:rgba(0,0,0,.45);padding:4px 9px;border-radius:8px}#xpid-ban:hover .ed{opacity:1}' +
        '#xpid-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}#xpid-box{width:min(560px,94vw);max-height:90vh;overflow-y:auto;background:var(--bg-panel,#1c1c20);color:var(--text-main,#eee);border:1px solid var(--border-color,#333);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);font:13.5px system-ui,sans-serif}' +
        '#xpid-box h3{margin:0;padding:16px 18px 6px;font:600 16px system-ui,sans-serif}#xpid-box .f{padding:10px 18px;border-top:1px solid var(--border-color,#2a2a2e)}#xpid-box .f>b{display:block;margin-bottom:7px}#xpid-box .row{display:flex;flex-wrap:wrap;gap:5px;align-items:center}#xpid-box .em{width:34px;height:34px;font-size:19px;border-radius:9px;border:1px solid var(--border-color,#444);background:transparent;cursor:pointer;padding:0}#xpid-box .em.on,#xpid-box .sw.on{outline:2px solid #f0b378;outline-offset:1px}' +
        '#xpid-box .sw{width:26px;height:26px;border-radius:50%;border:0;cursor:pointer}#xpid-box button.b{padding:6px 11px;border-radius:8px;border:1px solid var(--border-color,#444);background:transparent;color:inherit;cursor:pointer;font:500 12.5px system-ui,sans-serif}#xpid-box button.b:hover{background:rgba(255,255,255,.06)}#xpid-box .lg{max-height:46px;max-width:140px;object-fit:contain;background:rgba(255,255,255,.06);border-radius:6px;padding:3px}#xpid-box .bn{width:100%;aspect-ratio:4/1;border-radius:10px;background:center/cover;background-color:rgba(255,255,255,.05);margin-bottom:7px}#xpid-box .ft{display:flex;gap:8px;padding:12px 18px;border-top:1px solid var(--border-color,#333)}#xpid-box .ok{color:#81c784;font-size:12px}' +
        '.xpid-e{margin-right:4px}';
    (document.head || document.documentElement).appendChild(css);
    function home() {
        const main = document.querySelector('main'); if (!main) return; const w = W(); if (!w) return; let b = document.getElementById('xpid-ban');
        const f = fiche() || {}, bn = banner(), lg = typeof f.logo === 'string' && /^data:image\//.test(f.logo) ? f.logo : '';
        const sig = [w.name, w.emoji, w.color, bn.length, lg.length].join('|'); const at = document.getElementById('xd-dash'); if (b && b.dataset.sig === sig && (at ? b.nextElementSibling === at : b.parentNode === main)) return;
        if (!b) { b = document.createElement('div'); b.id = 'xpid-ban'; b.title = 'Identité du projet — cliquer pour modifier'; b.onclick = open; }
        b.dataset.sig = sig; b.style.setProperty('--xpid-c', w.color || '#f0b429'); b.style.backgroundImage = bn ? 'url(' + bn + ')' : '';
        b.innerHTML = (w.emoji ? '<span class="e">' + esc(w.emoji) + '</span>' : '') + '<div><b>' + esc(w.name || 'Projet XIII') + '</b><small>' + esc([f.production, f.client].filter(Boolean).join(' · ') || 'Projet en cours') + '</small></div>' + (lg ? '<img src="' + lg + '" alt="">' : '') + '<span class="ed">🪪 Identité du projet</span>';
        if (at) { if (b.nextElementSibling !== at) at.before(b); } else if (main.firstElementChild !== b) main.prepend(b);
    }
    function emojiTag(el, e) { if (!el) return; let s = el.querySelector(':scope > .xpid-e'); if (!e) { if (s) s.remove(); return; } if (!s) { s = document.createElement('span'); s.className = 'xpid-e'; el.prepend(s); } if (s.textContent !== e) s.textContent = e; }
    function tool() { const w = W(); const n = document.getElementById('xpj-name'); if (n && n.style.display !== 'none') emojiTag(n, w && w.emoji); }
    function esp() { if (typeof S === 'undefined') return; const pj = document.getElementById('proj'); if (!pj) return; let r = null; try { r = JSON.parse(localStorage.getItem('xiii.ws')); } catch (e) { } const w = r && r.list && r.list.find(x => x.id === (S.ws || r.cur)); const sp = pj.querySelector('span'); if (!sp) return; emojiTag(pj, w && w.emoji); }
    function apply() { try { if (APP === 'espace') esp(); else { if (APP === 'index') home(); tool(); } } catch (e) { } }
    // ---------- fenêtre ----------
    function open() {
        close(); const w = W(); if (!w) { alert('Aucun projet XIII en cours.'); return; } const f = fiche(); const lg = f && typeof f.logo === 'string' && /^data:image\//.test(f.logo) ? f.logo : '', bn = banner();
        const o = document.createElement('div'); o.id = 'xpid-ov'; o.setAttribute('role', 'dialog');
        o.innerHTML = '<div id="xpid-box"><h3>🪪 Identité du projet « ' + esc(w.name) + ' »</h3>' +
            '<div class="f"><b>Emoji</b><div class="row">' + ['', ...EMO].map(e => '<button class="em' + ((w.emoji || '') === e ? ' on' : '') + '" data-e="' + e + '" title="' + (e ? e : 'Aucun') + '">' + (e || '∅') + '</button>').join('') + '<input data-ec maxlength="4" placeholder="autre" style="width:56px;padding:6px;border-radius:8px;border:1px solid var(--border-color,#444);background:transparent;color:inherit;text-align:center"></div></div>' +
            '<div class="f"><b>Couleur</b><div class="row">' + PAL.map(c => '<button class="sw' + ((w.color || '').toLowerCase() === c ? ' on' : '') + '" data-c="' + c + '" style="background:' + c + '"></button>').join('') + '<input type="color" data-cc value="' + (/^#[0-9a-f]{6}$/i.test(w.color || '') ? w.color : '#f0b429') + '" style="width:36px;height:28px;border:0;background:none;cursor:pointer"><span style="flex:1"></span><button class="b" data-ch>🎨 Appliquer aux exports</button><span class="ok" data-chok></span></div></div>' +
            '<div class="f"><b>Logo</b><div class="row">' + (lg ? '<img class="lg" src="' + lg + '">' : '<span style="opacity:.6">Aucun logo</span>') + '<span style="flex:1"></span><button class="b" data-lg>📁 Choisir…</button>' + (lg ? '<button class="b" data-lgx>🗑</button>' : '') + '</div>' + (f ? '' : '<div style="opacity:.6;font-size:12px;margin-top:5px">Créez d\'abord la fiche projet (Projet XIII) pour y ranger le logo.</div>') + '</div>' +
            '<div class="f"><b>Bannière de l\'accueil</b><div class="bn" style="background-image:' + (bn ? 'url(' + bn + ')' : 'linear-gradient(120deg,' + (w.color || '#f0b429') + ',rgba(0,0,0,.6))') + '"></div><div class="row"><span style="opacity:.6;font-size:12px">Image recadrée en 4:1 (1600 × 400).</span><span style="flex:1"></span><button class="b" data-bn>📁 Choisir…</button>' + (bn ? '<button class="b" data-bnx>🗑</button>' : '') + '</div></div>' +
            '<div class="ft"><span style="flex:1"></span><button class="b" data-ok style="font-weight:700">✓ Terminé</button></div></div>';
        document.body.appendChild(o);
        const set = x => { XWS.set(XWS.id, x); apply(); };
        o.addEventListener('click', async e => { const t = e.target; if (t === o || t.closest('[data-ok]')) return close();
            const em = t.closest('[data-e]'); if (em) { set({ emoji: em.dataset.e || undefined }); return open(); }
            const sw = t.closest('[data-c]'); if (sw) { set({ color: sw.dataset.c }); return open(); }
            if (t.closest('[data-ch]')) { if (typeof XCHARTE !== 'undefined') { await XCHARTE.save(Object.assign(XCHARTE.raw(), { color: W().color })); o.querySelector('[data-chok]').textContent = '✓ couleur des PDF mise à jour'; } return; }
            if (t.closest('[data-lg]')) { const v = await pick(false); if (v && setLogo(v)) { apply(); open(); } return; }
            if (t.closest('[data-lgx]')) { if (setLogo('')) { apply(); open(); } return; }
            if (t.closest('[data-bn]')) { const v = await pick(true); if (v) { try { localStorage.setItem(KB, v); } catch (x) { alert('Stockage plein : image trop lourde ?'); } apply(); open(); } return; }
            if (t.closest('[data-bnx]')) { try { localStorage.removeItem(KB); } catch (x) { } apply(); open(); } });
        o.querySelector('[data-cc]').onchange = e => { set({ color: e.target.value }); open(); };
        o.querySelector('[data-ec]').onchange = e => { const v = e.target.value.trim(); if (v) { set({ emoji: v }); open(); } };
    }
    function close() { const o = document.getElementById('xpid-ov'); if (o) o.remove(); }
    addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('xpid-ov')) { e.stopImmediatePropagation(); close(); } }, true);
    addEventListener('xiii-ws', apply); addEventListener('storage', e => { if (/xiii\.(ws|projets)|pid\.banner/.test(e.key || '')) apply(); });
    function row() { if (!document.getElementById('xs-panel') || document.getElementById('xpid-row')) return; const a = document.getElementById('xan-row') || document.getElementById('xtc-row') || document.getElementById('xbc-row'); if (!a) return;
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xpid-row'; d.innerHTML = '<label>Identité du projet<small>Emoji, couleur, logo, bannière.</small></label><div class="xs-c"><button type="button" class="xs-btn">🪪 Modifier…</button></div>';
        d.querySelector('button').onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open, 120); }; a.after(d); }
    const start = () => { apply(); let t = 0; new MutationObserver(() => { if (document.getElementById('xs-panel')) row(); clearTimeout(t); t = setTimeout(apply, 120); }).observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start); else start();
    window.XPIDENT = { open, close, apply };
})();
