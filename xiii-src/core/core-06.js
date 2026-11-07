// SUITE XIII — code commun partagé par tous les outils (phase C, saison 6). Source : xiii-src/core/core-06.js
// =====================================================================
//  SUITE XIII — XAUTO : 🛟 sauvegarde automatique hors navigateur
//  Toutes les N minutes (si quelque chose a changé), une copie complète de la suite (.xiii : projets, réglages,
//  annuaire, photos…) est écrite dans un dossier choisi de l'ordinateur — par exemple un dossier synchronisé
//  Google Drive, Dropbox, OneDrive ou iCloud pour avoir une copie dans le cloud. Les N dernières copies sont gardées.
//  Navigateurs sans accès aux dossiers (Firefox, Safari) : rappel et téléchargement en un clic.
//  Rappel si aucune sauvegarde (automatique ou manuelle) depuis 7 jours.
//  Réglages : localStorage « xiii.autosave » · dossier : IndexedDB « xiiiAuto »
// =====================================================================
const XAUTO = (() => {
    const K = 'xiii.autosave', LOCK = 'xiii.autosave.lock', PRE = 'XIII_auto_';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const S = () => Object.assign({ on: false, every: 30, keep: 10, last: 0, lastManual: 0, sig: '', snooze: 0, folder: '' }, J(K, {}));
    const W = o => { try { localStorage.setItem(K, JSON.stringify(Object.assign(S(), o))); } catch (e) { } };
    const say = m => { try { if (typeof toast === 'function') toast(m); } catch (e) { } };
    const FS = typeof window.showDirectoryPicker === 'function';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // ---------- dossier (handle conservé en IndexedDB) ----------
    const db = () => new Promise((res, rej) => { const r = indexedDB.open('xiiiAuto', 1); r.onupgradeneeded = () => r.result.createObjectStore('h'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    const hget = async () => { try { const d = await db(); return await new Promise(r => { const q = d.transaction('h').objectStore('h').get('dir'); q.onsuccess = () => r(q.result || null); q.onerror = () => r(null); }); } catch (e) { return null; } };
    const hput = async h => { const d = await db(); await new Promise(r => { const t = d.transaction('h', 'readwrite'); t.objectStore('h').put(h, 'dir'); t.oncomplete = r; t.onerror = r; }); };
    async function perm(h, ask) { if (!h) return 'none'; try { let p = await h.queryPermission({ mode: 'readwrite' }); if (p !== 'granted' && ask) p = await h.requestPermission({ mode: 'readwrite' }); return p; } catch (e) { return 'denied'; } }
    async function pick() { try { const h = await window.showDirectoryPicker({ id: 'xiii-autosave', mode: 'readwrite', startIn: 'documents' }); await hput(h); W({ on: true, folder: h.name }); say('🛟 Dossier de sauvegarde : ' + h.name); await run(true); return true; } catch (e) { if (e && e.name !== 'AbortError') say('⚠️ Dossier non accessible'); return false; } }
    // ---------- signature des données (pour ne sauvegarder que s'il y a du nouveau) ----------
    function sig() { let h = 0, n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k || k === K || k === LOCK || /^xiii\.(versions|autosave|tips|tour|bar|recent|mod\.)|\.prefs$|\.ui$/.test(k)) continue; const v = localStorage.getItem(k) || ''; n += v.length; for (let j = 0; j < v.length; j += 97) h = (h * 31 + v.charCodeAt(j)) | 0; h = (h * 31 + k.length) | 0; } return n + ':' + h; }
    const stamp = d => { const p = x => String(x).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' + p(d.getHours()) + 'h' + p(d.getMinutes()); };
    async function run(force) {
        const s = S(); if (!s.on && !force) return 'off'; if (typeof XBUNDLE === 'undefined') return 'nobundle';
        const sg = sig(); if (!force && sg === s.sig) return 'same';
        const lk = +localStorage.getItem(LOCK) || 0; if (!force && Date.now() - lk < 120000) return 'locked'; try { localStorage.setItem(LOCK, String(Date.now())); } catch (e) { }
        const h = await hget(); if (!h) return 'nofolder'; const p = await perm(h, !!force); if (p !== 'granted') { chip(); return 'perm'; }
        try {
            const blob = await XBUNDLE.pack(await XBUNDLE.build('Sauvegarde automatique')), name = PRE + stamp(new Date()) + '.xiii';
            const fh = await h.getFileHandle(name, { create: true }), w = await fh.createWritable(); await w.write(blob); await w.close();
            const L = []; for await (const [n, e] of h.entries()) if (e.kind === 'file' && n.startsWith(PRE) && n.endsWith('.xiii')) L.push(n);
            L.sort().reverse().slice(Math.max(1, +s.keep || 10)).forEach(n => h.removeEntry(n).catch(() => { }));
            W({ last: Date.now(), sig: sg, folder: h.name, lastName: name, lastSize: blob.size }); chip(); return 'ok';
        } catch (e) { console.warn('XAUTO', e); W({ err: String(e && e.message || e) }); chip(); return 'err'; } finally { try { localStorage.removeItem(LOCK); } catch (e) { } }
    }
    async function download() { if (typeof XBUNDLE === 'undefined') return; const blob = await XBUNDLE.pack(await XBUNDLE.build('Sauvegarde')); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'XIII_sauvegarde_' + stamp(new Date()) + '.xiii'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000); W({ lastManual: Date.now(), sig: sig() }); chip(); say('💾 Sauvegarde téléchargée'); }
    const ago = t => { if (!t) return 'jamais'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'à l\'instant' : m < 60 ? 'il y a ' + m + ' min' : m < 1440 ? 'il y a ' + Math.round(m / 60) + ' h' : 'il y a ' + Math.round(m / 1440) + ' j'; };
    const lastAny = () => { const s = S(); return Math.max(s.last || 0, s.lastManual || 0); };
    // ---------- interface ----------
    async function panel() {
        const s = S(), h = FS ? await hget() : null, p = h ? await perm(h, false) : 'none';
        let o = document.getElementById('xau-ov'); if (o) o.remove(); o = document.createElement('div'); o.id = 'xau-ov';
        o.innerHTML = '<div class="xau-box"><div class="xau-h"><b>🛟 Sauvegarde automatique</b><span class="xau-x">✕</span></div>' +
            '<p class="xau-d">Une copie complète de la suite (tous les projets, réglages, annuaire, photos) est écrite régulièrement <b>hors du navigateur</b> : si le navigateur est vidé ou l\'ordinateur change, rien n\'est perdu. Choisissez un dossier synchronisé (Google Drive, Dropbox, OneDrive, iCloud) pour avoir aussi une copie dans le cloud.</p>' +
            (FS ? '<div class="xau-row"><span>📁 Dossier</span><b>' + (h ? esc(h.name) : 'aucun') + '</b>' + (h && p !== 'granted' ? ' <span class="xau-w">accès à réautoriser</span>' : '') + '<button id="xau-pick">' + (h ? 'Changer' : 'Choisir un dossier') + '</button>' + (h && p !== 'granted' ? '<button id="xau-auth" class="ok">Réautoriser</button>' : '') + '</div>' +
                '<label class="xau-row"><input type="checkbox" id="xau-on"' + (s.on ? ' checked' : '') + (h ? '' : ' disabled') + '> Sauvegarder automatiquement toutes les <select id="xau-ev">' + [10, 15, 30, 60, 120].map(m => '<option' + (+s.every === m ? ' selected' : '') + '>' + m + '</option>').join('') + '</select> min (seulement s\'il y a du nouveau)</label>' +
                '<label class="xau-row">Garder les <select id="xau-kp">' + [5, 10, 20, 50].map(m => '<option' + (+s.keep === m ? ' selected' : '') + '>' + m + '</option>').join('') + '</select> dernières copies</label>'
                : '<p class="xau-w">Ce navigateur ne permet pas d\'écrire dans un dossier (Firefox, Safari). Utilisez Chrome ou Edge pour la sauvegarde automatique, ou téléchargez une sauvegarde régulièrement : un rappel s\'affiche après 7 jours.</p>') +
            '<div class="xau-st">Dernière sauvegarde automatique : <b>' + ago(s.last) + '</b>' + (s.lastName ? ' <small>(' + esc(s.lastName) + (s.lastSize ? ', ' + Math.round(s.lastSize / 1024).toLocaleString('fr-FR') + ' Ko' : '') + ')</small>' : '') + '<br>Dernière sauvegarde manuelle : <b>' + ago(s.lastManual) + '</b>' + (s.err ? '<br><span class="xau-w">Dernière erreur : ' + esc(s.err) + '</span>' : '') + '</div>' +
            '<div class="xau-f">' + (FS && h ? '<button id="xau-now">🛟 Sauvegarder maintenant</button>' : '') + '<button id="xau-dl">💾 Télécharger une sauvegarde (.xiii)</button></div><p class="xau-d">Pour restaurer : accueil › 📦 Projet complet › Importer le fichier .xiii.</p></div>';
        document.body.appendChild(o); const q = x => o.querySelector(x);
        q('.xau-x').onclick = () => o.remove(); o.addEventListener('mousedown', e => { if (e.target === o) o.remove(); });
        if (q('#xau-pick')) q('#xau-pick').onclick = async () => { if (await pick()) panel(); };
        if (q('#xau-auth')) q('#xau-auth').onclick = async () => { const hh = await hget(); if (await perm(hh, true) === 'granted') { await run(true); say('🛟 Accès rétabli'); } panel(); };
        if (q('#xau-on')) q('#xau-on').onchange = e => { W({ on: e.target.checked }); chip(); if (e.target.checked) run(true).then(() => panel()); };
        if (q('#xau-ev')) q('#xau-ev').onchange = e => { W({ every: +e.target.value }); timer(); };
        if (q('#xau-kp')) q('#xau-kp').onchange = e => W({ keep: +e.target.value });
        if (q('#xau-now')) q('#xau-now').onclick = async () => { const r = await run(true); say(r === 'ok' ? '🛟 Sauvegarde écrite dans « ' + S().folder + ' »' : r === 'perm' ? '⚠️ Accès au dossier refusé' : '⚠️ Sauvegarde impossible'); panel(); };
        q('#xau-dl').onclick = async () => { await download(); panel(); };
    }
    // pastille : rappel 7 jours, accès à réautoriser
    async function chip() {
        let c = document.getElementById('xau-chip'); const s = S(), old = Date.now() - lastAny() > 7 * 864e5 && Date.now() > (s.snooze || 0), h = s.on && FS ? await hget() : null, need = h && await perm(h, false) !== 'granted';
        const has = Object.keys(localStorage).some(k => /XIII\.project|^synoptique_projects$|^xiii\.catalogue$|^matosXIII/.test(k));
        if (!has || (!old && !need)) { if (c) c.remove(); return; }
        if (!c) { c = document.createElement('div'); c.id = 'xau-chip'; document.body.appendChild(c); }
        c.innerHTML = need ? '🛟 Sauvegarde automatique en pause : <button data-a="auth">Réautoriser le dossier</button><button data-a="x">✕</button>' : '🛟 ' + (lastAny() ? 'Aucune sauvegarde depuis ' + ago(lastAny()).replace('il y a ', '') : 'Vos projets ne sont sauvegardés que dans ce navigateur') + ' <button data-a="set">' + (FS ? 'Activer la sauvegarde auto' : 'Sauvegarder') + '</button><button data-a="later">Plus tard</button>';
        c.querySelectorAll('[data-a]').forEach(b => b.onclick = async () => { const a = b.dataset.a; if (a === 'auth') { const hh = await hget(); if (await perm(hh, true) === 'granted') { await run(true); say('🛟 Sauvegarde automatique reprise'); } chip(); } else if (a === 'set') { if (FS) panel(); else download(); } else if (a === 'later') { W({ snooze: Date.now() + 2 * 864e5 }); c.remove(); } else c.remove(); });
    }
    let T = null; function timer() { clearInterval(T); T = setInterval(() => { if (S().on) run(false); }, Math.max(5, +S().every || 30) * 60000); }
    function init() {
        const st = document.createElement('style'); st.textContent = '#xau-ov{position:fixed;inset:0;z-index:10240;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px;font:13.5px/1.45 "Segoe UI",system-ui,sans-serif}.xau-box{width:min(600px,100%);background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.6);border-radius:14px;padding:16px 18px}.xau-h{display:flex;justify-content:space-between;font-size:15px}.xau-x{cursor:pointer}.xau-d{color:var(--text-dim,#a8a39b);font-size:12.5px}.xau-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}.xau-w{color:#ffb74d;font-size:12.5px}.xau-st{margin:10px 0;padding:8px 10px;border-radius:8px;background:var(--bg-panel-alt,#2c2c31);font-size:12.5px}.xau-st small{color:var(--text-dim)}.xau-f{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}' +
            '.xau-box button,#xau-chip button{font:inherit;font-size:12.5px;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:7px;padding:4px 10px;cursor:pointer}.xau-box button.ok,#xau-chip button[data-a=set],#xau-chip button[data-a=auth]{background:rgba(240,179,120,.28);border-color:rgba(240,179,120,.75)}.xau-box select{font:inherit;color:inherit;background:var(--bg-input,#1b1b1f);border:1px solid var(--border-color,#45454b);border-radius:6px}' +
            '#xau-chip{position:fixed;left:16px;bottom:16px;z-index:9990;display:flex;gap:8px;align-items:center;flex-wrap:wrap;max-width:min(560px,calc(100vw - 32px));padding:8px 12px;border-radius:12px;background:var(--bg-menu,#2a2622);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.6);box-shadow:0 8px 24px rgba(0,0,0,.4);font:13px "Segoe UI",system-ui,sans-serif}';
        document.head.appendChild(st);
        if (typeof XBUNDLE !== 'undefined' && !XBUNDLE.__xa) { const _p = XBUNDLE.pack; XBUNDLE.pack = async function (o) { const r = await _p.apply(this, arguments); if (o && o.name !== 'Sauvegarde automatique') W({ lastManual: Date.now() }); return r; }; XBUNDLE.__xa = 1; }
        const go = () => {
            // 🛟 dans ⚙️ Paramètres › Aide (plus de bouton dans la barre)
            window.XSET_HELP = window.XSET_HELP || []; if (!window.XSET_HELP.some(x => x.k === 'xau')) window.XSET_HELP.push({ k: 'xau', icon: '🛟', label: 'Sauvegarde automatique', sub: 'Copie du projet (.xiii) dans un dossier de l\'ordinateur ou un cloud perso' + (S().on ? ' — activée' : ''), run: () => setTimeout(panel, 150) });
            chip(); timer(); setTimeout(() => { if (S().on) run(false); }, 20000);
        };
        XBOOT.idle(go, 3000);
    }
    return { init, panel, run, download, pick, _sig: sig };
})();

XAUTO.init();

