// SUITE XIII — module commun. Source : xiii-src/suite-sectors.js
// =====================================================================
//  SUITE XIII — XSECT : la seconde barre rangée par secteurs, dans le même ordre partout (saison 6, phase B2)
//  ① Créer · ② Afficher · ③ Modifier · ④ Outils métier · ⑤ Assistants │ à droite : l'état (compteurs, « Enregistré à… »)
//  Les éléments sont déplacés tels quels (mêmes boutons, mêmes événements) ; les groupes nommés par l'outil
//  (vues #view-group, annuler #xu-group…) restent entiers. Un secteur vide n'apparaît pas.
//  Activé outil par outil, après validation (liste ON ci-dessous) ; RULES permet de corriger un classement.
// =====================================================================
(function () {
    if (window.XSECT) return;
    const APPX = XIII_APP;
    const ON = ['moodo', 'storyboardo', 'scripto']; // outils validés (ou en essai)
    const RULES = { // corrections par outil : début de l'info-bulle (ou #id) → secteur
        moodo: [['Présentation plein écran', 'aff']],
        storyboardo: [['Personnages et poses', 'cre'], ['Mobilier et décor', 'cre'], ['Flèche de mouvement', 'cre'], ['Bulle de dialogue', 'cre'], ['Fond du plan', 'cre']]
    };
    const SECT = [['cre', 'Créer'], ['aff', 'Afficher'], ['mod', 'Modifier'], ['met', 'Outils métier'], ['ass', 'Assistants']];
    const $ = id => document.getElementById(id);
    const tip = e => ((e.title || e.getAttribute('aria-label') || '') + ' ' + (((e.querySelector && e.querySelector('.btn-label')) || {}).textContent || '')).trim();
    const ico = e => (((e.querySelector && e.querySelector('.btn-icon')) || e).textContent || '').trim();
    const TOOLS = 'SYNO|PLANO|DECOUP|CALL SHEETO|CONDUCO|PLANNO|SCRIPTO|DEVISO|CASTO|MATOS|REPERO|LUMO|SONO|STORYBOARDO|CADRO|MOODO|PACKINGO|POSTO|DOSSIER';
    function classify(e) {
        const r = (RULES[APPX] || []).find(([m]) => m[0] === '#' ? e.id === m.slice(1) : (e.title || '').indexOf(m) === 0); if (r) return r[1];
        const t = (e.title || '').trim(), s = tip(e), ic = ico(e);
        if (e.matches('#save-state,.xs-saved,[id$=stats],.ws-stats') || (e.tagName === 'INPUT' && /projet/i.test(s + (e.placeholder || '')))) return 'etat';
        if (/^(Annuler|Rétablir|Historique)/.test(t) || /^[↶↷🕘]/u.test(ic)) return 'mod';
        if (/bibliothèque/i.test(t) && /^(Afficher|Masquer)/.test(t)) return 'aff';
        if (new RegExp('\\bIA\\b|L’IA|l\'IA|🤖|✨|Préremplir|Vérifi|Contrôl|diagnostic|cohérence|depuis (' + TOOLS + ')|Reprendre|Récupérer|Ouvrir .{0,40}dans (' + TOOLS + ')', 'i').test(s) || /^[🤖✨🩺]/u.test(ic)) return 'ass';
        if (e.dataset && e.dataset.view || /\(\d\)$/.test(t) || /^(Vue|Zoom|Afficher|Masquer|Aperçu|Plein écran|Présentation|Filtr|Mode |Précédent|Suivant|Calque|Grille|Légende)/.test(t) || /^[◀▶]$/.test(ic) || /aujourd/i.test(s) || (e.tagName === 'SELECT' && /statut|filtr|tous|vue|zoom/i.test(s + (e.options[e.selectedIndex] || {}).text))) return 'aff';
        if (/^(Ajouter|Nouveau|Nouvelle|Créer|Insérer|Enregistrer le|Importer|Placer|Dessiner)/.test(t) || /^[➕＋]/u.test(ic) || /Catalogue matériel commun/.test(t)) return 'cre';
        if (/^(Dupliquer|Supprimer|Effacer|Vider|Aligner|Trier|Renommer|Modifier|Édition|Sélection|Sélectionner|Gomme|Crayon|Pinceau|Verrouill|Grouper|Déplacer|Rotation)/i.test(t) || /aimant|magnét|sélection/i.test(t)) return 'mod';
        if (e.tagName === 'INPUT' && /recherch|filtr/i.test(s + (e.placeholder || ''))) return 'aff';
        return 'met';
    }
    let busy = false;
    function arrange() {
        const tb = $('toolbar'); if (!tb || busy || ON.indexOf(APPX) < 0) return; busy = true;
        try {
            let box = {}; SECT.concat([['etat', 'État']]).forEach(([k, n]) => { let s = tb.querySelector(':scope > .xsec[data-sec="' + k + '"]'); if (!s) { s = document.createElement('span'); s.className = 'btn-group xsec'; s.dataset.sec = k; s.title = n; s.setAttribute('role', 'group'); s.setAttribute('aria-label', n); } box[k] = s; });
            // unités à ranger : groupes nommés entiers, boutons / listes / champs un par un ailleurs
            const units = [];
            const walk = el => [...el.children].forEach(c => {
                if (c.classList.contains('xsec') || c.classList.contains('divider') || c.classList.contains('xsec-dv')) return;
                if (c.id && c.querySelector('button,select,input') && !/^(xtop-moved)$/.test(c.id) && c.tagName !== 'BUTTON') { units.push(c); return; } // groupe nommé (vues, annuler…)
                if (/^(BUTTON|SELECT|INPUT)$/.test(c.tagName) || c.matches('#save-state,.xs-saved,[id$=stats],.ws-stats')) { units.push(c); return; }
                if (c.matches('.tb-label') && c.nextElementSibling && /^(INPUT|SELECT)$/.test(c.nextElementSibling.tagName)) { c.dataset.xsecWith = 1; return; } // libellé : suit son champ
                if (c.children.length) walk(c); else if (c.textContent.trim()) units.push(c);
            });
            walk(tb);
            units.forEach(u => {
                const isGrp = !/^(BUTTON|SELECT|INPUT)$/.test(u.tagName) && u.querySelector('button,select,input');
                const k = u.dataset.xsec || (u.dataset.xsec = u.matches('#save-state') ? 'etat' : classify(isGrp ? (u.querySelector('button[title]') || u.querySelector('button,select,input')) : u));
                const lab = u.previousElementSibling && u.previousElementSibling.dataset && u.previousElementSibling.dataset.xsecWith ? u.previousElementSibling : null;
                if (lab) box[k].appendChild(lab); box[k].appendChild(u);
            });
            // reconstruction : secteurs dans l'ordre, traits entre eux, état à droite
            [...tb.children].forEach(c => { if (!c.classList.contains('xsec') && (c.classList.contains('divider') || !c.querySelector('button,select,input') && !c.textContent.trim())) c.remove(); });
            [...tb.querySelectorAll('.xsec-dv')].forEach(d => d.remove());
            let first = true;
            SECT.forEach(([k]) => { const s = box[k]; if (!s.children.length) { s.remove(); return; } if (!first) { const d = document.createElement('div'); d.className = 'divider xsec-dv'; tb.appendChild(d); } tb.appendChild(s); first = false; });
            if (box.etat.children.length) { box.etat.style.marginLeft = 'auto'; tb.appendChild(box.etat); } else box.etat.remove();
            [...tb.children].forEach(c => { if (!c.classList.contains('xsec') && !c.classList.contains('xsec-dv') && !c.querySelector('button,select,input')) c.remove(); });
        } catch (e) { try { console.warn('XSECT', e); } catch (x) { } }
        busy = false; try { dispatchEvent(new Event('resize')); } catch (e) { }
    }
    function css() { const s = document.createElement('style'); s.id = 'xsect-css'; s.textContent = '#toolbar>.xsec{display:inline-flex;align-items:center;gap:6px;flex:0 0 auto}#toolbar>.xsec>.btn-group,#toolbar>.xsec>span[id]{display:inline-flex;gap:inherit;margin:0;padding:0;border:0;background:none}'; document.head.appendChild(s); }
    let T = 0; const again = () => { clearTimeout(T); T = setTimeout(arrange, 150); };
    function start() { if (ON.indexOf(APPX) < 0) return; css(); arrange(); const tb = $('toolbar'); if (tb) new MutationObserver(ms => { if (!busy && ms.some(m => [...m.addedNodes].some(n => n.nodeType === 1 && !n.classList.contains('xsec') && !n.classList.contains('xsec-dv') && n.parentElement === tb))) again(); }).observe(tb, { childList: true }); }
    try { if (typeof XBOOT !== 'undefined' && XBOOT.ready) XBOOT.ready(() => setTimeout(start, 140), 2995); else throw 0; } catch (e) { addEventListener('load', () => setTimeout(start, 900)); }
    window.XSECT = { arrange, classify, ON };
})();
