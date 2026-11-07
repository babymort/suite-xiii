// SUITE XIII — module commun. Source : xiii-src/plano-photo3d.js
// =====================================================================
//  PLANO XIII — 📷 Photo → décor 3D
//  Une ou plusieurs photos de repérage ou de plateau (fichiers, fond de plan, photos de REPERO) sont lues par l'IA de l'utilisateur (si elle voit les images) :
//  pièce et dimensions estimées, murs, portes, fenêtres, mobilier, lumières, point de vue de la photo.
//  Proposition à valider (cases à cocher, dimensions corrigeables, aperçu du plan) → nouvel onglet à l'échelle,
//  hauteur des murs de la vue 3D, puis 🧊 Vue 3D.
// =====================================================================
var XPH3D = window.XPH3D || (() => {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const say = (m, ms) => { try { toast(m, ms); } catch (e) { } };
    const num = (v, d) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : d; };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const OK_CAT = ['MOB', 'DEC', 'STR'];
    const SKIP = /^s-(nord|prise|sortie|ascenseur)$|^d-(spike|spike-t|truss|truss-coin|totem|vauban|poteau|tapis-danse|scene|fondvert)$/;
    const OPEN = { porte: 's-porte', porte_double: 's-porte-double', porte_coulissante: 's-porte-coul', fenetre: 's-fenetre', baie: 's-baie' };
    const WALLS = { fond: 'mur du fond', gauche: 'mur gauche', droite: 'mur droit', avant: 'mur côté photographe' };
    let last = null;   // dernière analyse (pour rouvrir la proposition sans repayer l'IA)
    const MAXP = 8;
    function catalogue() {
        return LIB.filter(l => OK_CAT.includes(l.cat) && !SKIP.test(l.id) && !/^s-(porte|fenetre|baie)/.test(l.id)).map(l => l.id + ' = ' + l.name + ' (' + l.w + '×' + l.h + ' cm)').join('\n');
    }
    // ---------- image ----------
    async function toJpeg(src, mx) {
        const im = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('image illisible')); i.src = src; });
        const k = Math.min(1, (mx || 1568) / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k));
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        const url = c.toDataURL('image/jpeg', 0.85); return { url, image: { mediaType: 'image/jpeg', base64: url.split(',')[1] } };
    }
    const fileToUrl = f => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = ko; r.readAsDataURL(f); });
    function pickFiles() {
        return new Promise(ok => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.multiple = true; i.onchange = () => ok([...(i.files || [])]); i.click(); });
    }
    // photos de REPERO (même navigateur) : lieux et leurs photos, sans jamais créer la base si elle n'existe pas
    function reperoSpots() { try { const p = JSON.parse(localStorage.getItem('reperoXIII.project') || 'null'); return p && Array.isArray(p.spots) ? p.spots.filter(s => (s.photos || []).length) : []; } catch (e) { return []; } }
    function reperoPhoto(id) {
        return new Promise(ok => { let r; try { r = indexedDB.open('reperoXIII', 1); } catch (e) { return ok(null); }
            r.onupgradeneeded = () => { try { r.transaction.abort(); } catch (e) { } };
            r.onerror = () => ok(null); r.onblocked = () => ok(null);
            r.onsuccess = () => { const d = r.result; try { const q = d.transaction('photos', 'readonly').objectStore('photos').get(id); q.onsuccess = () => { ok(q.result && q.result.data || null); d.close(); }; q.onerror = () => { ok(null); d.close(); }; } catch (e) { ok(null); d.close(); } }; });
    }
    // ---------- IA ----------
    function prompt(hint, caps, prev) {
        const n = (caps || []).length || 1;
        return 'Tu es repéreur et chef décorateur pour le cinéma et la télévision. ' + (n > 1 ? 'Les ' + n + ' photos jointes montrent LE MÊME LIEU de tournage sous différents angles (dans l’ordre : photo 1, photo 2…). Croise-les : un même meuble vu sur deux photos ne compte qu’une fois, chaque photo complète ce que les autres ne montrent pas (murs hors champ, portes, profondeur). ' : 'Analyse la photo jointe (un lieu de tournage : pièce, plateau, salle). ') + 'Reconstitue le lieu en PLAN VU DE DESSUS, à l’échelle, en centimètres, pour une maquette 3D.\n\n'
            + (n > 1 ? 'Légendes des photos : ' + caps.map((c, i) => 'photo ' + (i + 1) + (c ? ' = ' + c : '')).join(' ; ') + '.\nLe repère suit la PHOTO 1 : ' : '')
            + (prev ? 'PLAN DÉJÀ ÉTABLI (version précédente, validée par l’utilisateur) — garde-le comme base, corrige-le et complète-le avec ces photos ; ne supprime un élément que si les photos montrent clairement qu’il n’existe pas :\n' + JSON.stringify(prev) + '\n\n' : '')
            + 'Repère du plan : la pièce est un rectangle de largeur W (axe x, de la gauche vers la droite de la photo) et de profondeur D (axe y, du mur du fond y = 0 vers le photographe y = D). Murs : "fond" (y = 0), "gauche" (x = 0), "droite" (x = W), "avant" (y = D, côté photographe, souvent invisible).\n'
            + 'Estime les dimensions avec les repères habituels : porte 204 × 83 cm, poignée à 105 cm, plafond 250–300 cm en logement, assise de chaise 45 cm, plan de travail 90 cm, prise à 30 cm, carreaux de 30 ou 60 cm, lames de parquet ~ 14 cm, personne debout ~ 170 cm. Si une partie de la pièce est hors champ, prolonge raisonnablement et baisse la confiance.\n'
            + (hint ? 'Indications de l’utilisateur (prioritaires) : ' + hint + '\n' : '')
            + '\nMobilier : choisis "ref" UNIQUEMENT dans cette liste (identifiant = nom (largeur × profondeur)) ; si rien ne correspond exactement, prends le plus proche et décris l’objet réel dans "label" ; donne la taille réelle estimée (w, d) si elle diffère.\n' + catalogue() + '\n\n'
            + 'Ouvertures : type parmi porte, porte_double, porte_coulissante, fenetre, baie ; mur parmi fond, gauche, droite, avant ; pos = position du CENTRE le long du mur, de 0 à 1 (fond / avant : de la gauche vers la droite ; gauche / droite : du fond vers le photographe) ; largeur en cm.\n'
            + 'Lumières visibles ou évidentes : type parmi fenetre (lumière du jour), lampe (lampe posée, lampadaire, applique), plafonnier, ecran, neon ; position x, y ; température de couleur estimée en kelvins.\n'
            + 'Points de vue : pour CHAQUE photo, position estimée de l’appareil (x, y), point visé (vx, vy) et focale équivalente plein format en mm.\n\n'
            + 'Réponds UNIQUEMENT par un objet JSON, sans texte autour :\n'
            + '{"piece":{"nom":"…","W":cm,"D":cm,"H":cm,"confiance":0-1,"remarque":"…"},'
            + '"ouvertures":[{"type":"porte","mur":"gauche","pos":0.5,"largeur":83,"label":"…"}],'
            + '"mobilier":[{"ref":"m-canape-3","label":"…","x":cm,"y":cm,"rot":degrés (0 = face au photographe, 90 = tourné vers la gauche, 180 = dos au photographe),"w":cm,"d":cm}],'
            + '"lumieres":[{"type":"lampe","label":"…","x":cm,"y":cm,"kelvin":2700}],'
            + '"cameras":[{"photo":1,"x":cm,"y":cm,"vx":cm,"vy":cm,"focale":mm}],'
            + '"conseils":["remarques utiles pour le tournage dans ce lieu (prises, recul, lumière naturelle, bruit…)"]}';
    }
    // ---------- normalisation (l'IA peut se tromper : tout est borné) ----------
    function normalize(j) {
        j = j || {}; const pc = j.piece || j.room || {};
        const W = clamp(Math.round(num(pc.W, 500)), 150, 6000), D = clamp(Math.round(num(pc.D, 400)), 150, 6000), H = clamp(Math.round(num(pc.H, 260)), 180, 2000);
        const S = { nom: String(pc.nom || pc.name || 'Décor d’après photo').slice(0, 60), W, D, H, conf: clamp(num(pc.confiance, 0.5), 0, 1), rem: String(pc.remarque || '').slice(0, 300), open: [], mob: [], lum: [], cams: [], tips: [] };
        (j.ouvertures || []).slice(0, 12).forEach(o => {
            const ref = OPEN[String(o.type || '').toLowerCase().replace(/[\s-]+/g, '_')], mur = String(o.mur || '').toLowerCase(); if (!ref || !WALLS[mur]) return;
            S.open.push({ ref, mur, pos: clamp(num(o.pos, 0.5), 0.05, 0.95), w: clamp(Math.round(num(o.largeur, libById(ref) ? libById(ref).w : 90)), 40, 600), label: String(o.label || '').slice(0, 40), on: true });
        });
        (j.mobilier || []).slice(0, 40).forEach(m => {
            const lib = libById(String(m.ref || '')); if (!lib || !OK_CAT.includes(lib.cat)) return;
            S.mob.push({ ref: lib.id, label: String(m.label || '').slice(0, 40), x: clamp(num(m.x, W / 2), 0, W), y: clamp(num(m.y, D / 2), 0, D), rot: ((Math.round(num(m.rot, 0)) % 360) + 360) % 360,
                w: clamp(Math.round(num(m.w, lib.w)), 10, 2000), d: clamp(Math.round(num(m.d, lib.h)), 10, 2000), on: true });
        });
        (j.lumieres || []).slice(0, 12).forEach(l => {
            const t = String(l.type || 'lampe').toLowerCase();
            S.lum.push({ type: t, label: String(l.label || '').slice(0, 40), x: clamp(num(l.x, W / 2), -300, W + 300), y: clamp(num(l.y, D / 2), -300, D + 300), k: clamp(Math.round(num(l.kelvin, t === 'fenetre' ? 5600 : 2900)), 1800, 10000), on: t !== 'fenetre' });
        });
        const C = Array.isArray(j.cameras) ? j.cameras : j.camera ? [j.camera] : [];
        C.slice(0, MAXP).forEach((c, i) => { if (c && isFinite(num(c.x, NaN))) S.cams.push({ photo: Math.round(num(c.photo, i + 1)), x: clamp(num(c.x, W / 2), -500, W + 500), y: clamp(num(c.y, D), -500, D + 800), vx: num(c.vx, W / 2), vy: num(c.vy, 0), f: clamp(num(c.focale, 28), 8, 300), on: true }); });
        S.tips = (j.conseils || []).slice(0, 6).map(t => String(t).slice(0, 200));
        return S;
    }
    async function analyse(imgs, hint, signal, caps, prev) {
        if (!Array.isArray(imgs)) imgs = [imgs];
        if (typeof XAI === 'undefined' || !XAI.configured || !XAI.configured()) throw new Error('noai');
        if (XAI.canSee && !XAI.canSee()) throw new Error('L’IA connectée ne lit pas les images : choisissez-en une autre dans ⚙️ › Intelligence artificielle (Claude, Gemini, GPT…).');
        const r = await XAI.ask(prompt(hint, caps || imgs.map(() => ''), prev), imgs.length > 1 ? { images: imgs, image: imgs[0], maxTokens: 5000, signal } : { image: imgs[0], maxTokens: 4000, signal });
        let j; try { j = XAI.json(r); } catch (e) { throw new Error('Réponse de l’IA illisible — réessayez.'); }
        return normalize(j);
    }
    // ---------- construction du plan ----------
    const DEG = Math.PI / 180, aim = (x, y, tx, ty) => Math.round(((Math.atan2(tx - x, -(ty - y)) / DEG) + 360) % 360);
    function itemsOf(S, sc) {
        const ax = sc ? sc.x : 1, ay = sc ? sc.y : 1, W = S.W, D = S.D, out = [];
        out.push({ id: uid(), kind: 'wall', pts: [[0, 0], [W, 0], [W, D], [0, D]], closed: true, thick: 20, color: null, label: S.nom, showLen: true, showArea: true, fill: true, fillColor: '#90a4ae', locked: false });
        S.open.filter(o => o.on).forEach(o => {
            const lib = libById(o.ref); if (!lib) return; const isWin = /fenetre|baie/.test(o.ref), hh = isWin ? 0 : lib.h / 2;
            let x, y, rot;
            if (o.mur === 'fond') { x = o.pos * W; y = hh; rot = 180; } else if (o.mur === 'avant') { x = o.pos * W; y = D - hh; rot = 0; }
            else if (o.mur === 'gauche') { x = hh; y = o.pos * D; rot = 90; } else { x = W - hh; y = o.pos * D; rot = 270; }
            if (isWin) rot = (o.mur === 'gauche' || o.mur === 'droite') ? 90 : 0;
            const it = itemFromLib(lib, Math.round(x), Math.round(y)); it.rot = rot; it.w = o.w; if (o.label) { it.label = o.label; it.showLabel = true; } out.push(it);
        });
        S.mob.filter(m => m.on).forEach(m => { const lib = libById(m.ref); if (!lib) return; const it = itemFromLib(lib, Math.round(m.x * ax), Math.round(m.y * ay)); it.rot = m.rot; it.w = m.w; it.h = m.d; if (m.label) { it.label = m.label; it.showLabel = true; } out.push(it); });
        S.lum.filter(l => l.on).forEach(l => {
            const ref = l.type === 'fenetre' ? 'l-hmi-1800' : l.type === 'plafonnier' || l.type === 'neon' ? 'l-ledpanel' : 'l-lampe', lib = libById(ref) || libById('l-lampe'); if (!lib) return;
            const it = itemFromLib(lib, Math.round(l.x * ax), Math.round(l.y * ay)); if (it.L) it.L.kelvin = l.k;
            if (l.type === 'fenetre') { it.rot = aim(it.x, it.y, S.W / 2, S.D / 2); it.label = l.label || 'Jour (fenêtre)'; it.showLabel = true; }
            else if (l.label) { it.label = l.label; it.showLabel = true; } out.push(it);
        });
        (S.cams || []).filter(c => c.on).forEach(c => {
            const lib = libById('cam-cine'); if (!lib) return; const it = itemFromLib(lib, Math.round(c.x * ax), Math.round(c.y * ay)); it.rot = aim(it.x, it.y, c.vx * ax, c.vy * ay);
            if (it.fov) { it.fov.angle = Math.round(2 * Math.atan(36 / (2 * c.f)) / DEG); it.fov.len = Math.round(Math.hypot(S.W, S.D)); } it.label = 'Photo ' + c.photo + ' (' + Math.round(c.f) + ' mm)'; it.showLabel = true; out.push(it);
        });
        out.forEach(it => { it.ph3d = 1; });   // éléments issus des photos : remplacés si l'on peaufine le plan
        return out;
    }
    function build(S, opt) {
        opt = opt || {}; const sc = opt.scale || null; let t;
        if (opt.update && tab()) { t = tab(); t.items = t.items.filter(i => !i.ph3d).concat(itemsOf(S, sc)); t.name = ('📷 ' + S.nom).slice(0, 40); try { renderTabs(); } catch (e) { } }
        else { t = newTab(('📷 ' + S.nom).slice(0, 40)); t.items = itemsOf(S, sc); P.tabs.push(t); switchTab(P.tabs.length - 1); }
        // base pour peaufiner plus tard avec d'autres photos (sans les images, trop lourdes)
        const B = JSON.parse(JSON.stringify(S)); if (sc) { B.mob.forEach(m => { m.x *= sc.x; m.y *= sc.y; }); B.lum.forEach(l => { l.x *= sc.x; l.y *= sc.y; }); (B.cams || []).forEach(c => { c.x *= sc.x; c.y *= sc.y; c.vx *= sc.x; c.vy *= sc.y; }); }
        t.ph3d = { S: B, n: (opt.caps || []).length, caps: opt.caps || [], ts: Date.now() };
        if (opt.height !== false) { try { P.settings.v3d = P.settings.v3d || { wallH: 300, beams: true, fov: true, labels: true }; P.settings.v3d.wallH = S.H; } catch (e) { } }
        commit(); try { fitView(); } catch (e) { } try { autosave(); } catch (e) { }
        return t;
    }
    // ---------- aperçu du plan (SVG) ----------
    function preview(S) {
        const W = S.W, D = S.D, pad = Math.max(W, D) * 0.12; let g = '';
        g += '<rect x="0" y="0" width="' + W + '" height="' + D + '" fill="rgba(144,164,174,.18)" stroke="#90a4ae" stroke-width="' + (Math.max(W, D) / 120) + '"/>';
        const fs = Math.max(W, D) / 34;
        S.open.forEach(o => { if (!o.on) return; const h = 18, horiz = o.mur === 'fond' || o.mur === 'avant'; const x = horiz ? o.pos * W - o.w / 2 : (o.mur === 'gauche' ? -h / 2 : W - h / 2), y = horiz ? (o.mur === 'fond' ? -h / 2 : D - h / 2) : o.pos * D - o.w / 2;
            g += '<rect x="' + x + '" y="' + y + '" width="' + (horiz ? o.w : h) + '" height="' + (horiz ? h : o.w) + '" fill="' + (/fenetre|baie/.test(o.ref) ? '#4fc3f7' : '#ffb74d') + '"/>'; });
        S.mob.forEach(m => { if (!m.on) return; g += '<g transform="translate(' + m.x + ' ' + m.y + ') rotate(' + m.rot + ')"><rect x="' + (-m.w / 2) + '" y="' + (-m.d / 2) + '" width="' + m.w + '" height="' + m.d + '" rx="' + Math.min(m.w, m.d) * 0.08 + '" fill="rgba(161,136,127,.55)" stroke="#a1887f" stroke-width="' + fs / 8 + '"/></g><text x="' + m.x + '" y="' + (m.y + fs / 3) + '" font-size="' + fs + '" text-anchor="middle" fill="currentColor">' + esc((m.label || libById(m.ref).name).slice(0, 18)) + '</text>'; });
        S.lum.forEach(l => { if (!l.on) return; g += '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + fs * 0.7 + '" fill="#ffd54f" stroke="#000" stroke-width="' + fs / 10 + '"/>'; });
        let x0 = -pad, y0 = -pad, x1 = W + pad, y1 = D + pad;
        (S.cams || []).forEach(c => { if (!c.on) return; const a = Math.atan2(c.vy - c.y, c.vx - c.x), hf = Math.atan(36 / (2 * c.f)), L = Math.hypot(W, D) * 0.6;
            g += '<path d="M' + c.x + ' ' + c.y + 'L' + (c.x + Math.cos(a - hf) * L) + ' ' + (c.y + Math.sin(a - hf) * L) + 'L' + (c.x + Math.cos(a + hf) * L) + ' ' + (c.y + Math.sin(a + hf) * L) + 'Z" fill="rgba(79,195,247,.14)" stroke="#4fc3f7" stroke-width="' + fs / 8 + '"/><circle cx="' + c.x + '" cy="' + c.y + '" r="' + fs * 0.8 + '" fill="#4fc3f7"/><text x="' + c.x + '" y="' + (c.y + fs * 0.35) + '" font-size="' + fs * 0.9 + '" text-anchor="middle" fill="#000" font-weight="700">' + c.photo + '</text>';
            x0 = Math.min(x0, c.x - pad); x1 = Math.max(x1, c.x + pad); y0 = Math.min(y0, c.y - pad); y1 = Math.max(y1, c.y + pad); });
        return '<svg viewBox="' + x0 + ' ' + y0 + ' ' + (x1 - x0) + ' ' + (y1 - y0) + '" style="width:100%;height:100%">' + g + '</svg>';
    }
    // ---------- interface ----------
    function css() {
        if (document.getElementById('xph3d-css')) return; const s = document.createElement('style'); s.id = 'xph3d-css';
        s.textContent = '#xph3d{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font:13px system-ui,sans-serif}#xph3d .b{background:var(--bg-panel,#2d2d2d);color:var(--text-main,#eee);border-radius:12px;width:min(1060px,96vw);max-height:92vh;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.5)}#xph3d .h{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border-color,#444)}#xph3d .h b{font-size:15px}#xph3d .h .sp{flex:1}#xph3d .c{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;padding:14px 16px;overflow:auto}#xph3d .ph{background:#000;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:200px}#xph3d .ph img{max-width:100%;max-height:340px;display:block}#xph3d .pv{border:1px solid var(--border-color,#444);border-radius:8px;height:340px;padding:6px;color:var(--text-main,#eee)}#xph3d .f{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}#xph3d input[type=number]{width:72px}#xph3d input[type=text],#xph3d textarea{width:100%;box-sizing:border-box}#xph3d .ls{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:4px 14px}#xph3d .ls label{display:flex;gap:6px;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#xph3d .hd{grid-column:1/-1;font-weight:700;margin-top:6px}#xph3d .ft{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--border-color,#444);flex-wrap:wrap}#xph3d .ft .sp{flex:1}#xph3d .warn{color:#ffb74d}#xph3d .dim{opacity:.75}#xph3d .tips{grid-column:1/-1;margin:4px 0 0;padding-left:18px}#xph3d button{cursor:pointer}#xph3d .gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;grid-column:1/-1}#xph3d .gal .t{position:relative;background:#000;border-radius:6px;overflow:hidden}#xph3d .gal img{width:100%;height:100px;object-fit:cover;display:block}#xph3d .gal .n{position:absolute;left:4px;top:4px;background:#4fc3f7;color:#000;font-weight:700;border-radius:10px;padding:0 7px}#xph3d .gal .x{position:absolute;right:4px;top:4px}#xph3d .gal input{width:100%;box-sizing:border-box;border:0;padding:4px 6px;font-size:12px}#xph3d .rp{grid-column:1/-1;max-height:220px;overflow:auto;border:1px solid var(--border-color,#444);border-radius:8px;padding:8px}#xph3d .rp .sp2{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 10px}#xph3d .rp img{width:90px;height:64px;object-fit:cover;border-radius:4px;cursor:pointer;border:3px solid transparent}#xph3d .rp img.on{border-color:#4fc3f7}#xph3d .go{background:rgb(var(--accent,240,179,120));color:#111;border:0;border-radius:6px;padding:7px 14px;font-weight:700}';
        document.head.appendChild(s);
    }
    function close() { const o = document.getElementById('xph3d'); if (o) o.remove(); }
    function shell(title, body, foot) {
        css(); close(); const o = document.createElement('div'); o.id = 'xph3d';
        o.innerHTML = '<div class="b"><div class="h"><b>' + title + '</b><span class="sp"></span><button data-x="close" title="Fermer">✕</button></div>' + body + '<div class="ft">' + foot + '</div></div>';
        document.body.appendChild(o); o.querySelector('[data-x=close]').onclick = close; o.addEventListener('mousedown', e => { if (e.target === o) close(); });
        return o;
    }
    // 1. photos (une ou plusieurs) + indications
    let PHS = [];   // [{ url, name, cap }]
    async function addUrl(url, name, cap) { if (PHS.length >= MAXP) { say('📷 ' + MAXP + ' photos au maximum par analyse'); return; } if (PHS.some(p => p.url === url)) return; PHS.push({ url, name: name || 'Photo', cap: cap || '' }); }
    async function open() {
        const L0 = (typeof items === 'function' ? items() : []).filter(i => i.kind === 'bg'), bg = L0.find(i => sel.has(i.id)) || L0[0];
        const cur = tab && tab() && tab().ph3d ? tab() : null, spots = reperoSpots();
        if (!PHS.length && bg && bg.src && !cur) await addUrl(bg.src, bg.name || 'Fond de plan', '');
        const o = shell('📷 Photos → décor 3D',
            '<div class="c"><div style="grid-column:1/-1"><p style="margin:0">Une ou plusieurs photos <b>du même lieu</b> (repérage, plateau, salle), prises sous différents angles : l’IA croise les vues pour estimer la pièce, ses dimensions, les portes et fenêtres, le mobilier et les lumières, puis vous <b>propose</b> un plan à l’échelle et sa vue 3D. Plus il y a d’angles, plus le plan est juste. Rien n’est créé sans votre accord.</p></div>'
            + (cur ? '<div style="grid-column:1/-1" class="f"><label><input type="checkbox" id="xph-ref" checked> <b>Peaufiner le plan « ' + esc(cur.name) + ' »</b> : l’IA part du plan déjà validé et le corrige avec ces nouvelles photos (vos éléments ajoutés à la main sont conservés)</label></div>' : '')
            + '<div class="gal" id="xph-gal"></div>'
            + '<div style="grid-column:1/-1" class="f"><button id="xph-file">🖼️ Ajouter des photos…</button>' + (bg && bg.src ? '<button id="xph-bg">🗺️ Le fond de plan</button>' : '') + (spots.length ? '<button id="xph-rp">📍 Photos de REPERO (' + spots.length + ' lieu' + (spots.length > 1 ? 'x' : '') + ')</button>' : '') + '<span class="dim">jusqu’à ' + MAXP + ' photos · légendez-les (« depuis la porte », « vers la fenêtre »…)</span></div>'
            + '<div class="rp" id="xph-rpl" style="display:none"></div>'
            + '<div style="grid-column:1/-1"><label class="dim">Ce que vous savez déjà (facultatif) : une mesure, l’usage du lieu…</label><textarea id="xph-hint" rows="2" placeholder="ex. la pièce fait environ 5 × 4 m ; le canapé mesure 2,20 m ; plafond à 2,70 m"></textarea><p class="dim" id="xph-ai"></p></div></div>',
            '<span class="sp"></span>' + (last ? '<button id="xph-last">↩️ Reprendre la dernière proposition</button>' : '') + '<button data-x="close2">Annuler</button><button class="go" id="xph-go">🤖 Analyser</button>');
        o.querySelector('[data-x=close2]').onclick = close;
        const ai = o.querySelector('#xph-ai'), go = o.querySelector('#xph-go'), gal = o.querySelector('#xph-gal');
        const ready = typeof XAI !== 'undefined' && XAI.configured && XAI.configured();
        ai.innerHTML = ready ? ('IA : <b>' + esc(XAI.label ? XAI.label() : 'connectée') + '</b>' + (XAI.canSee && !XAI.canSee() ? ' — <span class="warn">elle ne lit pas les images, choisissez-en une autre</span>' : '')) : '<span class="warn">Aucune IA connectée.</span> <a href="#" id="xph-set">Connecter mon IA</a> (Claude, ChatGPT, Gemini…)';
        const st = o.querySelector('#xph-set'); if (st) st.onclick = e => { e.preventDefault(); close(); try { XAI.openSettings(); } catch (x) { say('⚙️ › Intelligence artificielle'); } };
        const drawGal = () => {
            gal.innerHTML = PHS.length ? PHS.map((p, i) => '<div class="t"><img alt="" src="' + esc(p.url) + '"><span class="n">' + (i + 1) + '</span><button class="x" data-del="' + i + '" title="Retirer">✕</button><input type="text" data-cap="' + i + '" value="' + esc(p.cap) + '" placeholder="' + (i === 0 ? 'Photo 1 : sert de repère' : 'Légende (facultatif)') + '"></div>').join('') : '<span class="dim">Aucune photo pour l’instant.</span>';
            gal.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { PHS.splice(+b.dataset.del, 1); drawGal(); });
            gal.querySelectorAll('[data-cap]').forEach(c => c.oninput = () => { PHS[+c.dataset.cap].cap = c.value.slice(0, 80); });
            go.disabled = !PHS.length; go.textContent = '🤖 Analyser ' + (PHS.length > 1 ? 'les ' + PHS.length + ' photos' : 'la photo');
        };
        drawGal();
        o.querySelector('#xph-file').onclick = async () => { const fs = await pickFiles(); for (const f of fs) await addUrl(await fileToUrl(f), f.name, ''); drawGal(); };
        const bb = o.querySelector('#xph-bg'); if (bb) bb.onclick = async () => { await addUrl(bg.src, bg.name || 'Fond de plan', 'fond de plan'); drawGal(); };
        const rb = o.querySelector('#xph-rp'); if (rb) rb.onclick = async () => {
            const box = o.querySelector('#xph-rpl'); if (box.style.display !== 'none') { box.style.display = 'none'; return; } box.style.display = ''; box.innerHTML = '<span class="dim">Chargement des photos…</span>';
            let h = ''; const urls = {};
            for (const sp of spots.slice(0, 30)) { const ph = (sp.photos || []).filter(x => !x.pano).slice(0, 12), th = [];
                for (const x of ph) { const u = await reperoPhoto(x.id); if (u) { urls[x.id] = { u, cap: (sp.name || 'Lieu') + (x.cap ? ' — ' + x.cap : '') }; th.push('<img alt="" data-rid="' + esc(x.id) + '" title="' + esc(urls[x.id].cap) + '" src="' + esc(u) + '"' + (PHS.some(p => p.url === u) ? ' class="on"' : '') + '>'); } }
                if (th.length) h += '<b>📍 ' + esc(sp.name || 'Lieu sans nom') + '</b>' + (sp.city ? ' <span class="dim">' + esc(sp.city) + '</span>' : '') + ' <button data-all="' + esc(sp.id) + '">Tout ajouter</button><div class="sp2" data-sp="' + esc(sp.id) + '">' + th.join('') + '</div>'; }
            box.innerHTML = h || '<span class="dim">Aucune photo trouvée dans REPERO sur ce navigateur.</span>';
            box.querySelectorAll('img[data-rid]').forEach(im => im.onclick = async () => { const x = urls[im.dataset.rid], i = PHS.findIndex(p => p.url === x.u); if (i >= 0) { PHS.splice(i, 1); im.classList.remove('on'); } else { await addUrl(x.u, 'REPERO', x.cap); if (PHS.some(p => p.url === x.u)) im.classList.add('on'); } drawGal(); });
            box.querySelectorAll('[data-all]').forEach(b => b.onclick = async () => { for (const im of box.querySelectorAll('[data-sp="' + b.dataset.all + '"] img')) { const x = urls[im.dataset.rid]; await addUrl(x.u, 'REPERO', x.cap); if (PHS.some(p => p.url === x.u)) im.classList.add('on'); } drawGal(); });
        };
        if (last) o.querySelector('#xph-last').onclick = () => propose(last.S, last.urls, last.refine);
        go.onclick = async () => {
            if (!PHS.length) return; const hint = o.querySelector('#xph-hint').value.trim(), ref = o.querySelector('#xph-ref'), refine = !!(ref && ref.checked && cur);
            if (!ready) { ai.innerHTML = '<span class="warn">Connectez d’abord votre IA dans ⚙️ › Intelligence artificielle.</span>'; return; }
            go.disabled = true; go.textContent = '⏳ L’IA regarde ' + (PHS.length > 1 ? 'les ' + PHS.length + ' photos' : 'la photo') + '…'; const ac = new AbortController(); o.querySelector('[data-x=close]').addEventListener('click', () => ac.abort());
            try {
                const ims = []; for (const p of PHS) ims.push(await toJpeg(p.url, PHS.length > 3 ? 1150 : 1568));
                const prev = refine ? brief(cur.ph3d.S) : null, caps = PHS.map(p => p.cap);
                const S = await analyse(ims.map(x => x.image), hint, ac.signal, caps, prev);
                last = { S, urls: ims.map(x => x.url), refine, caps }; propose(S, last.urls, refine, caps);
            } catch (e) { if (ac.signal.aborted) return; go.disabled = false; go.textContent = '🤖 Réessayer'; ai.innerHTML = '<span class="warn">⚠️ ' + esc(e.message === 'noai' ? 'Aucune IA connectée.' : (e.message || e)) + '</span>'; }
        };
    }
    // plan précédent résumé pour l'IA (format de la réponse attendue)
    function brief(S) {
        return { piece: { nom: S.nom, W: S.W, D: S.D, H: S.H }, ouvertures: S.open.filter(x => x.on).map(x => ({ type: Object.keys(OPEN).find(k => OPEN[k] === x.ref), mur: x.mur, pos: +x.pos.toFixed(2), largeur: x.w, label: x.label })),
            mobilier: S.mob.filter(x => x.on).map(x => ({ ref: x.ref, label: x.label, x: Math.round(x.x), y: Math.round(x.y), rot: x.rot, w: x.w, d: x.d })), lumieres: S.lum.filter(x => x.on).map(x => ({ type: x.type, label: x.label, x: Math.round(x.x), y: Math.round(x.y), kelvin: x.k })) };
    }
    // 2. proposition à valider
    function propose(S, urls, refine, caps) {
        urls = Array.isArray(urls) ? urls : [urls];
        const W0 = S.W, D0 = S.D, row = (k, i, txt) => '<label title="' + esc(txt) + '"><input type="checkbox" data-k="' + k + '" data-i="' + i + '"' + (S[k][i].on ? ' checked' : '') + '>' + esc(txt) + '</label>';
        const o = shell('📷 Proposition de décor — à valider' + (refine ? ' (plan peaufiné)' : ''),
            '<div class="c"><div><div class="ph"><img alt="" id="xph-big" src="' + esc(urls[0]) + '"></div>'
            + (urls.length > 1 ? '<div class="f">' + urls.map((u, i) => '<img alt="" data-u="' + i + '" src="' + esc(u) + '" style="width:62px;height:44px;object-fit:cover;border-radius:4px;cursor:pointer" title="Photo ' + (i + 1) + '">').join('') + '</div>' : '')
            + '<div class="f"><b>' + esc(S.nom) + '</b><span class="dim">· confiance ' + Math.round(S.conf * 100) + ' % · ' + urls.length + ' photo' + (urls.length > 1 ? 's' : '') + '</span></div>' + (S.rem ? '<p class="dim" style="margin:0">' + esc(S.rem) + '</p>' : '')
            + '<div class="f">Largeur <input type="number" id="xph-w" min="150" max="6000" step="10" value="' + S.W + '"> cm · Profondeur <input type="number" id="xph-d" min="150" max="6000" step="10" value="' + S.D + '"> cm · Hauteur <input type="number" id="xph-h" min="180" max="2000" step="10" value="' + S.H + '"> cm</div>'
            + '<p class="dim" style="margin:0">Corrigez une dimension si vous la connaissez : tout le mobilier se replace à la nouvelle échelle.</p></div>'
            + '<div class="pv" id="xph-pv"></div>'
            + (S.open.length ? '<div class="hd">🚪 Portes et fenêtres</div><div class="ls">' + S.open.map((x, i) => row('open', i, (libById(x.ref) || {}).name + ' — ' + WALLS[x.mur] + (x.label ? ' (' + x.label + ')' : ''))).join('') + '</div>' : '')
            + (S.mob.length ? '<div class="hd">🛋️ Mobilier (' + S.mob.length + ')</div><div class="ls">' + S.mob.map((x, i) => row('mob', i, (x.label || libById(x.ref).name) + ' · ' + x.w + '×' + x.d)).join('') + '</div>' : '')
            + (S.lum.length ? '<div class="hd">💡 Lumières</div><div class="ls">' + S.lum.map((x, i) => row('lum', i, (x.label || x.type) + ' · ' + x.k + ' K' + (x.type === 'fenetre' ? ' (projecteur de jour à l’extérieur)' : ''))).join('') + '</div>' : '')
            + (S.cams.length ? '<div class="hd">🎥 Points de vue des photos</div><div class="ls">' + S.cams.map((x, i) => row('cams', i, 'Photo ' + x.photo + (caps && caps[x.photo - 1] ? ' — ' + caps[x.photo - 1] : '') + ' · ' + Math.round(x.f) + ' mm')).join('') + '</div>' : '')
            + (S.tips.length ? '<div class="hd">💬 Conseils pour le tournage</div><ul class="tips">' + S.tips.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' : '')
            + '<p class="dim" style="grid-column:1/-1;margin:6px 0 0">⚠️ Estimation d’après ' + (urls.length > 1 ? urls.length + ' photos' : 'une seule photo') + ' : vérifiez les cotes sur place (mètre laser) avant de commander du matériel ou de construire.</p></div>',
            '<button id="xph-back">← Photos</button><span class="sp"></span><label><input type="checkbox" id="xph-3d" checked> Ouvrir la vue 3D</label><button data-x="close2">Annuler</button><button class="go" id="xph-ok">' + (refine ? '✅ Mettre à jour le plan' : '✅ Créer le plan') + '</button>');
        o.querySelectorAll('img[data-u]').forEach(im => im.onclick = () => { o.querySelector('#xph-big').src = urls[+im.dataset.u]; });
        const pv = o.querySelector('#xph-pv'), scaled = () => { const w = num(o.querySelector('#xph-w').value, W0), d = num(o.querySelector('#xph-d').value, D0); return { x: w / W0, y: d / D0 }; };
        const draw = () => { const sc = scaled(), T = JSON.parse(JSON.stringify(S)); T.W = Math.round(W0 * sc.x); T.D = Math.round(D0 * sc.y); T.mob.forEach(m => { m.x *= sc.x; m.y *= sc.y; }); T.lum.forEach(l => { l.x *= sc.x; l.y *= sc.y; }); T.cams.forEach(c => { c.x *= sc.x; c.y *= sc.y; c.vx *= sc.x; c.vy *= sc.y; }); pv.innerHTML = preview(T); };
        o.querySelectorAll('input[data-k]').forEach(c => c.onchange = () => { S[c.dataset.k][+c.dataset.i].on = c.checked; draw(); });
        ['#xph-w', '#xph-d'].forEach(s => o.querySelector(s).oninput = draw); draw();
        o.querySelector('[data-x=close2]').onclick = close; o.querySelector('#xph-back').onclick = open;
        o.querySelector('#xph-ok').onclick = () => {
            const sc = scaled(), T = JSON.parse(JSON.stringify(S)); T.W = clamp(Math.round(W0 * sc.x), 150, 6000); T.D = clamp(Math.round(D0 * sc.y), 150, 6000); T.H = clamp(Math.round(num(o.querySelector('#xph-h').value, S.H)), 180, 2000);
            const want3d = o.querySelector('#xph-3d').checked; close(); build(T, { scale: sc, update: !!refine, caps: caps || [] }); PHS = [];
            say('📷 Plan « ' + T.nom + ' » ' + (refine ? 'mis à jour' : 'créé à l’échelle') + ' (' + (T.W / 100).toLocaleString('fr-FR') + ' × ' + (T.D / 100).toLocaleString('fr-FR') + ' m) — tout reste modifiable', 4000);
            if (want3d && window.PL3D && PL3D.open) setTimeout(() => PL3D.open(), 120);
        };
    }
    // ---------- bouton ----------
    function mount() {
        if (document.getElementById('xph3d-btn')) return; const ref = [...document.querySelectorAll('#toolbar button')].find(b => /bg-upload/.test(b.getAttribute('onclick') || '')); if (!ref) return;
        ref.insertAdjacentHTML('afterend', '<button id="xph3d-btn" title="Photos → décor 3D : l’IA lit une ou plusieurs photos du lieu (fichiers, fond de plan, REPERO) (pièce, dimensions, portes, fenêtres, mobilier, lumières) et propose un plan à l’échelle et sa vue 3D, à valider"><span class="btn-icon">📷</span><span class="btn-label">Photos → 3D</span></button>');
        document.getElementById('xph3d-btn').onclick = open;
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else setTimeout(mount, 0);
    addEventListener('load', mount);
    return { open, analyse, normalize, build, itemsOf, preview, prompt, catalogue, brief, photos: () => PHS };
})();
