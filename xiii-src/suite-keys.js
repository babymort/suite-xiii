// =====================================================================
//  SUITE XIII — XKEYS : raccourcis harmonisés (saison 6, phase B)
//  Même touche = même action dans tous les outils. Communs à toute la suite :
//    Ctrl K rechercher · ? fiche des raccourcis · Ctrl S enregistrer · Ctrl Z / Ctrl Y annuler / rétablir
//    Ctrl O ouvrir (📂) · Ctrl E exporter (⬇️ Exporter ▾) · F mode focus · N nouvel élément · Ctrl D dupliquer
//    Suppr supprimer la sélection · 1…9 changer de vue · Échap fermer / désélectionner
//  Ce module ajoute Ctrl O et Ctrl E (boutons de la barre du haut) ; les autres sont gérés par chaque outil
//  ou par les modules communs (XFOCUS, XUX…). Un outil qui gère déjà la combinaison garde la main.
// =====================================================================
(function () {
    if (window.XKEYS) return;
    const $ = id => document.getElementById(id), vis = e => e && e.offsetWidth > 0 && getComputedStyle(e).display !== 'none';
    const ico = b => ((b.querySelector('.btn-icon') || b).textContent || '').trim();
    const typingOK = t => !(t && t.isContentEditable); // Ctrl O / Ctrl E restent actifs dans un champ (pas de conflit d'écriture), sauf texte riche
    const openBtn = () => { const f = $('xb-file'); return f ? [...f.querySelectorAll('button')].find(b => /📂/.test(ico(b)) && b.dataset.xtop !== 'h') : null; };
    const expBtn = () => $('xtop-exp') || $('xb-exp');
    // la liste commune, affichée en tête de la fiche « ? » et de la fiche imprimée
    const LIST = [['Ctrl K', 'Rechercher, ou lancer une action de n\'importe quel outil'], ['?', 'Cette fiche'], ['Ctrl S', 'Enregistrer'], ['Ctrl O', 'Ouvrir un fichier du projet (📂)'], ['Ctrl E', 'Exporter : PDF, images, tableaux… (⬇️ Exporter ▾)'], ['Ctrl Z / Ctrl Y', 'Annuler / rétablir'], ['N', 'Nouvel élément (plan, ligne, talent, lieu…), dans les outils qui en ont un'], ['Ctrl D', 'Dupliquer la sélection'], ['Suppr', 'Supprimer la sélection'], ['1 … 9', 'Changer de vue'], ['F', 'Mode focus : seulement la zone de travail'], ['I', 'Propriétés : afficher / masquer le panneau de droite (outils qui en ont un)'], ['Ctrl Maj P', 'Présentation client (masque les boutons d\'édition)'], ['Échap', 'Fermer une fenêtre, désélectionner, quitter le focus']];
    // N : les outils qui n'avaient pas de touche « nouvel élément » utilisent le bouton ➕ de leur secteur ① Créer
    const OWN_N = /^(casto|conduco|decoup|deviso|lumo|moodo|packingo|posto|repero|ressourco|scripto|sono|soustitro|transporto)$/;
    const addBtn = () => { const s = document.querySelector('#toolbar > .xsec[data-sec="cre"]'); return s ? [...s.querySelectorAll('button')].find(b => vis(b) && !b.disabled && /^[➕＋]/.test(ico(b))) : null; };
    const modal = () => [...document.querySelectorAll('[role=dialog],.modal,.modal-overlay,#xf-ov,#xt-pop')].some(e => e.offsetWidth > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden');
    document.addEventListener('keydown', e => {
        if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat || (e.key !== 'n' && e.key !== 'N') || OWN_N.test(XIII_APP)) return;
        const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) || modal()) return;
        const b = addBtn(); if (!b) return; e.preventDefault(); b.click();
    });
    document.addEventListener('keydown', e => {
        if (e.defaultPrevented || !(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || !typingOK(e.target)) return;
        const k = (e.key || '').toLowerCase(); let b = null;
        if (k === 'o') b = openBtn(); else if (k === 'e') b = expBtn();
        if (!b || !vis(b) || b.disabled) return;
        e.preventDefault(); b.click();
    });
    window.XKEYS = { LIST };
})();
