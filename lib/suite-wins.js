// SUITE XIII — module commun. Source : xiii-src/suite-wins.js
// SUITE XIII — saison 6, phase ZZ « Toutes les fenêtres sont cliquables » :
//  • tant qu'une grande fenêtre est ouverte, le badge de sauvegarde (🛟, en bas à gauche) s'efface : il ne recouvre plus ses boutons ;
//  • Échap ferme la fenêtre du dessus quand l'outil ne l'a pas déjà fait (via son bouton ✕ / Fermer).
(() => {
    if (window.XWINS) return;
    let BASE = new Set();
    const BIG = () => innerWidth * innerHeight * 0.25;
    function wins() {
        const out = [];
        for (const e of document.body.children) {
            if (e.id === 'xau-chip' || e.id === 'xoff' || e.id === 'xtp' || e.id === 'xt-root' || BASE.has(e)) continue;
            const nm = ((e.id || '') + ' ' + (typeof e.className === 'string' ? e.className : '')).trim();
            if (!/(^|[-_\s])(ov|overlay|modal|dialog|pop|popup|sheet|box|win|book)([-_\s]|$)|modal|overlay|dialog/i.test(nm) && e.getAttribute('role') !== 'dialog' && !e.querySelector(':scope>[role=dialog]')) continue;
            const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .05) continue;
            const r = e.getBoundingClientRect(); if (r.width * r.height < BIG()) continue;
            out.push({ e, z: +c.zIndex || 0 });
        }
        return out.sort((a, b) => a.z - b.z).map(x => x.e); // le dernier = celui du dessus
    }
    const CLOSE = /^\s*(✕|×|✖|x|fermer|close|terminé|ok)\s*$/i;
    function closer(w) {
        // seulement un bouton de l'en-tête de la fenêtre (jamais un ✕ de ligne, qui supprimerait quelque chose)
        let box = w; const kids = [...w.children].filter(k => k.getClientRects().length); if (kids.length === 1) box = kids[0];
        const top = box.getBoundingClientRect().top;
        const L = [...w.querySelectorAll('button,a,span,div,i,b')].filter(b => b.getClientRects().length && b.children.length < 3 && b.getBoundingClientRect().top < top + 64);
        const A = [...w.querySelectorAll('button')].filter(b => b.getClientRects().length && /^\s*(fermer|annuler)\s*$/i.test(b.textContent));
        return L.find(b => CLOSE.test(b.textContent) && b.textContent.length < 12) || L.find(b => /(^|[-_\s])(close|x|fermer)([-_\s]|$)/i.test(b.className + ' ' + (b.id || '')) || /^(fermer|close)/i.test((b.title || '') + (b.getAttribute('aria-label') || ''))) || A[0];
    }
    let tk = 0;
    // la bulle d'astuce 💡 ne recouvre jamais une fenêtre ou un menu ouvert : elle s'efface
    function tipOff() {
        const t = document.getElementById('xtp'); if (!t || !t.getClientRects().length) return; const a = t.getBoundingClientRect();
        for (const e of document.body.children) {
            if (e === t || /^(xau-chip|xoff|xt-root|xred-tip|xws-line)$/.test(e.id)) continue; const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .05) continue;
            const r = e.getBoundingClientRect(); if (r.width * r.height < 20000 || r.width >= innerWidth - 2 && r.height >= innerHeight - 2 && !e.querySelector('button')) continue;
            if (r.left < a.right && r.right > a.left && r.top < a.bottom && r.bottom > a.top && (+c.zIndex || 0) > 0) { t.style.display = 'none'; return; }
        }
    }
    // menus et bulles (Exporter, Partager, nom…) : toujours entièrement à l'écran, quelle que soit la taille du texte
    function clamp(e) {
        if (!e || e.nodeType !== 1 || !e.isConnected) return; const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none') return;
        const r = e.getBoundingClientRect(); if (!r.width || r.width >= innerWidth - 16 || r.height >= innerHeight - 16) return;
        if (r.right > innerWidth - 6) e.style.left = Math.max(6, innerWidth - r.width - 6) + 'px';
        if (r.left < 0) e.style.left = '6px';
        if (r.bottom > innerHeight - 6) e.style.top = Math.max(6, innerHeight - r.height - 6) + 'px';
    }
    function mark() { tk = 0; document.body.classList.toggle('xwin-on', wins().length > 0); try { tipOff(); } catch (e) { } }
    function init() {
        const s = document.createElement('style'); s.textContent = 'body.xwin-on #xau-chip,body.xwin-on #xoff{display:none!important}body:has(.xinsp.show) #xoff{display:none!important}' +
            // 👥 Équipe et ☁️ Drive : un seul bouton à la fois (sans Drive relié, « Relier le Drive » est dans le menu Équipe)
            'body:has(#xb-solo:not([style*="display: none"]):not(.xs-hidden)) #xdr-btn{display:none!important}'; document.head.appendChild(s);
        new MutationObserver(() => { if (!tk) tk = setTimeout(mark, 120); }).observe(document.body, { childList: true, subtree: false, attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
        new MutationObserver(R => { if (!tk) tk = setTimeout(mark, 120); for (const r of R) for (const n of r.addedNodes) if (n.nodeType === 1 && n.id !== 'xtp') requestAnimationFrame(() => clamp(n)); }).observe(document.body, { childList: true });
        setInterval(mark, 1500);
        // ce qui est déjà à l'écran au chargement fait partie de l'outil, pas une fenêtre
        setTimeout(() => { BASE = new Set([...document.body.children].filter(e => e.getClientRects().length && !/modal|overlay|-ov$/i.test((e.id || '') + ' ' + e.className))); }, 0);
        // Échap : l'outil passe d'abord ; si la fenêtre du dessus est toujours là, on clique son ✕
        addEventListener('keydown', e => {
            if (e.key !== 'Escape' || e.defaultPrevented) return;
            const mn = document.getElementById('xb-menu'); if (mn) { mn.remove(); return; }
            const W = wins(), top = W[W.length - 1]; if (!top) return;
            setTimeout(() => { if (!top.isConnected || getComputedStyle(top).display === 'none' || !top.getClientRects().length) return; const b = closer(top); if (b) b.click(); mark(); }, 30);
        });
    }
    window.XWINS = { wins, mark };
    if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
