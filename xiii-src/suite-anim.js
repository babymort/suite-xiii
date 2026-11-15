// =====================================================================
//  SUITE XIII — XANIM : animations à son goût (saison 6, phase P)
//  Fenêtre « ✨ Animations » (⚙️ › Affichage ou page Réglages) :
//   · vitesse : lente, normale, rapide, très rapide, ou aucune animation ;
//   · intensité : discrète, normale, marquée (amplitude des mouvements d'entrée) ;
//   · style d'entrée des widgets de l'accueil : déroulé (actuel), fondu, glissé, zoom ;
//   · sons d'interface (désactivés par défaut) : petit clic doux sur les boutons, son d'ouverture des fenêtres.
//  La vitesse s'applique à toutes les animations de la suite (CSS et scripts) sans toucher aux outils.
//  Réglage personnel, valable pour tous les projets (clé xiii.anim.cfg). « Réduire les animations » du système = aucune.
// =====================================================================
(function () {
    if (window.XANIM) return;
    const K = 'xiii.anim.cfg', DEF = { sp: 1, it: 1, st: 'roll', snd: false };
    const get = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(K)) || {}); } catch (e) { return { ...DEF }; } };
    let C = get();
    const rate = () => C.sp || 1;
    // ---------- vitesse ----------
    const css = document.createElement('style'); css.id = 'xanim-css'; (document.head || document.documentElement).appendChild(css);
    function paint() {
        const off = C.sp === 0; document.documentElement.classList.toggle('xanim-off', off);
        css.textContent = (off ? 'html.xanim-off *,html.xanim-off *::before,html.xanim-off *::after{animation-duration:1ms!important;animation-delay:0s!important;transition-duration:1ms!important;transition-delay:0s!important}' : '') +
            '#xan-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}#xan-box{width:min(520px,94vw);background:var(--bg-panel,#1c1c20);color:var(--text-main,#eee);border:1px solid var(--border-color,#333);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);font:13.5px system-ui,sans-serif;padding:6px 0 0}' +
            '#xan-box h3{margin:0;padding:12px 18px 4px;font:600 16px system-ui,sans-serif}#xan-box .f{padding:10px 18px;border-top:1px solid var(--border-color,#2a2a2e)}#xan-box .f>b{display:block;font-weight:600;margin-bottom:7px}#xan-box .seg{display:flex;flex-wrap:wrap;gap:4px}' +
            '#xan-box .seg button,#xan-box .ft button{padding:6px 11px;border-radius:8px;border:1px solid var(--border-color,#444);background:transparent;color:inherit;cursor:pointer;font:500 12.5px system-ui,sans-serif}#xan-box .seg button.on{background:rgba(240,179,120,.18);border-color:#f0b378;color:#f6c79a}#xan-box .ft{display:flex;gap:8px;padding:12px 18px;border-top:1px solid var(--border-color,#333)}' +
            '#xan-prev{display:flex;gap:8px;margin-top:10px}#xan-prev i{flex:1;height:34px;border-radius:9px;background:rgba(240,179,120,.16);border:1px solid rgba(240,179,120,.35)}';
    }
    // animations lancées par script (Element.animate) : vitesse appliquée à la création
    const A0 = Element.prototype.animate;
    if (A0 && !A0.__xan) { const A1 = function () { const a = A0.apply(this, arguments); try { if (C.sp === 0) a.finish(); else if (rate() !== 1) a.playbackRate = rate(); } catch (e) { } return a; }; A1.__xan = 1; Element.prototype.animate = A1; }
    // animations et transitions CSS : vitesse appliquée au démarrage
    const onStart = e => { if (C.sp === 0 || rate() === 1) return; try { (e.target.getAnimations ? e.target.getAnimations() : []).forEach(a => { if (a.playbackRate !== rate()) a.playbackRate = rate(); }); } catch (x) { } };
    document.addEventListener('animationstart', onStart, true); document.addEventListener('transitionrun', onStart, true);
    // ---------- style d'entrée des widgets (lu par l'accueil) ----------
    function entry() {
        const k = C.it || 1, y = Math.round(12 * k), s = (1 - .06 * k).toFixed(3);
        if (C.st === 'fade') return [{ opacity: 0 }, { opacity: 1 }];
        if (C.st === 'slide') return [{ opacity: 0, transform: 'translateX(' + (-2 * y) + 'px)' }, { opacity: 1, transform: 'none' }];
        if (C.st === 'zoom') return [{ opacity: 0, transform: 'scale(' + s + ')' }, { opacity: 1, transform: 'none' }];
        return [{ opacity: 0, transform: 'translateY(-' + y + 'px)', clipPath: 'inset(0 0 100% 0 round 14px)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0% 0 round 14px)' }];
    }
    // ---------- sons d'interface ----------
    let AC = null;
    function tone(f, d, v) { if (!C.snd) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime; o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .7, t + d); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02); } catch (e) { } }
    const click = () => tone(1300, .045, .035), pop = () => { tone(660, .09, .04); setTimeout(() => tone(990, .08, .03), 55); };
    document.addEventListener('pointerdown', e => { if (C.snd && e.isTrusted && e.target.closest && e.target.closest('button,a,[role=button],.t')) click(); }, true);
    let lastPop = 0; new MutationObserver(ms => { if (!C.snd) return; for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && (n.getAttribute('role') === 'dialog' || /-ov$/.test(n.id || '')) && Date.now() - lastPop > 400) { lastPop = Date.now(); pop(); return; } }).observe(document.documentElement, { childList: true, subtree: true });
    // ---------- fenêtre ----------
    const OPT = [['sp', 'Vitesse', [[0.6, '🐢 Lente'], [1, 'Normale'], [1.6, 'Rapide'], [2.5, '⚡ Très rapide'], [0, 'Aucune animation']]], ['it', 'Intensité des mouvements', [[0.5, 'Discrète'], [1, 'Normale'], [1.8, 'Marquée']]], ['st', 'Entrée des widgets de l\'accueil', [['roll', 'Déroulé'], ['fade', 'Fondu'], ['slide', 'Glissé'], ['zoom', 'Zoom']]], ['snd', 'Sons d\'interface', [[false, '🔇 Désactivés'], [true, '🔈 Activés']]]];
    function save() { try { localStorage.setItem(K, JSON.stringify(C)); } catch (e) { } paint(); }
    function preview() { const p = document.getElementById('xan-prev'); if (!p) return; [...p.children].forEach((e, i) => { try { e.animate(entry(), { duration: 550, delay: i * 125, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }); } catch (x) { } }); }
    function open() {
        close(); const o = document.createElement('div'); o.id = 'xan-ov'; o.setAttribute('role', 'dialog');
        o.innerHTML = '<div id="xan-box"><h3>✨ Animations</h3>' + OPT.map(([k, l, V]) => '<div class="f"><b>' + l + '</b><div class="seg">' + V.map(([v, t]) => '<button data-k="' + k + '" data-v=\'' + JSON.stringify(v) + '\' class="' + (C[k] === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' + (k === 'st' ? '<div id="xan-prev"><i></i><i></i><i></i><i></i></div>' : '') + '</div>').join('') +
            '<div class="ft"><button data-rs>↺ Par défaut</button><span style="flex:1"></span><button data-ok style="font-weight:700">✓ Terminé</button></div></div>';
        document.body.appendChild(o); preview();
        o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-ok]')) return close(); if (e.target.closest('[data-rs]')) { C = { ...DEF }; save(); return open(); }
            const b = e.target.closest('[data-k]'); if (!b) return; C[b.dataset.k] = JSON.parse(b.dataset.v); save(); o.querySelectorAll('[data-k="' + b.dataset.k + '"]').forEach(x => x.classList.toggle('on', x === b)); if (b.dataset.k === 'snd' && C.snd) pop(); if (b.dataset.k !== 'snd') preview(); });
    }
    function close() { const o = document.getElementById('xan-ov'); if (o) o.remove(); }
    addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('xan-ov')) { e.stopImmediatePropagation(); close(); } }, true);
    addEventListener('storage', e => { if (e.key === K) { C = get(); paint(); } });
    function row() { if (!document.getElementById('xs-panel') || document.getElementById('xan-row')) return; const a = document.getElementById('xtc-row') || document.getElementById('xkm-row') || document.getElementById('xbc-row'); if (!a) return;
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xan-row'; d.innerHTML = '<label>Animations<small>Vitesse, intensité, entrée des widgets, sons.</small></label><div class="xs-c"><button type="button" class="xs-btn">✨ Personnaliser…</button></div>';
        d.querySelector('button').onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open, 120); }; a.after(d); }
    const go = () => new MutationObserver(() => { if (document.getElementById('xs-panel')) row(); }).observe(document.body, { childList: true, subtree: true });
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    paint();
    window.XANIM = { open, close, entry, rate, cfg: () => ({ ...C }) };
})();
