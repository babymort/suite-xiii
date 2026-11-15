// SUITE XIII — module commun. Source : xiii-src/cadro-sb-in.js
// =====================================================================
//  SUITE XIII — STORYBOARDO ← CADRO LIVE (saison 6, phase L)
//  Les images envoyées depuis le moniteur CADRO LIVE (📸 Capture › 🖼️ Envoyer à STORYBOARDO) attendent ici :
//  un bandeau propose de les ajouter, une image = un plan (image en fond de case, séquence, n° de plan et notes repris).
// =====================================================================
(function () {
    const K = 'xiii.inbox.cadrolive';
    const get = () => { try { return JSON.parse(localStorage.getItem(K)) || []; } catch (e) { return []; } };
    async function add() {
        const L = get(); if (!L.length || typeof addPanel !== 'function' || typeof putImg !== 'function') return; let n = 0;
        for (const it of L) { try { addPanel(); const p = PN(), id = 'bg' + uid(); await putImg(id, it.img); p.bg.img = id; if (it.seq) p.seq = it.seq; if (it.plan) p.num = it.plan; p.notes = it.notes || ''; n++; } catch (e) { console.warn(e); } }
        try { localStorage.removeItem(K); } catch (e) { } try { dirty(); renderAll(); } catch (e) { } ban(); if (typeof toast === 'function') toast('🖼️ ' + n + ' plan(s) ajouté(s) depuis CADRO LIVE');
    }
    function ban() {
        document.querySelectorAll('#xclsb').forEach(b => b.remove()); const L = get(); if (!L.length) return;
        const b = document.createElement('div'); b.id = 'xclsb'; b.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:10040;display:flex;gap:10px;align-items:center;padding:10px 14px;border-radius:12px;background:var(--bg-panel,#1c1c20);border:1px solid rgba(240,179,120,.55);box-shadow:0 10px 30px rgba(0,0,0,.45);font:13px system-ui,sans-serif;color:var(--text-main,#eee)';
        b.innerHTML = '<img src="' + L[L.length - 1].img + '" style="height:38px;border-radius:5px" alt=""><span>📥 <b>' + L.length + ' image(s)</b> de 📡 CADRO LIVE</span><button data-ok style="padding:6px 12px;border-radius:8px;border:1px solid rgba(240,179,120,.6);background:rgba(240,179,120,.18);color:inherit;cursor:pointer">➕ Ajouter comme plans</button><button data-no style="padding:6px 10px;border-radius:8px;border:1px solid #555;background:transparent;color:inherit;cursor:pointer">Ignorer</button>';
        document.body.appendChild(b); b.querySelector('[data-ok]').onclick = add; b.querySelector('[data-no]').onclick = () => { try { localStorage.removeItem(K); } catch (e) { } ban(); };
    }
    addEventListener('storage', e => { if (e.key === K) ban(); });
    const go = () => setTimeout(ban, 1500); if (document.readyState === 'complete') go(); else addEventListener('load', go);
    window.XCLSB = { add, ban };
})();
