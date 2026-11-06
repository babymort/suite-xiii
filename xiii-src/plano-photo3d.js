// =====================================================================
//  PLANO XIII — 📷 Photo → décor 3D
//  Une photo de repérage ou de plateau est lue par l'IA de l'utilisateur (si elle voit les images) :
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
    function catalogue() {
        return LIB.filter(l => OK_CAT.includes(l.cat) && !SKIP.test(l.id) && !/^s-(porte|fenetre|baie)/.test(l.id)).map(l => l.id + ' = ' + l.name + ' (' + l.w + '×' + l.h + ' cm)').join('\n');
    }
    // ---------- image ----------
    async function toJpeg(src) {
        const im = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('image illisible')); i.src = src; });
        const k = Math.min(1, 1568 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k));
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        const url = c.toDataURL('image/jpeg', 0.85); return { url, image: { mediaType: 'image/jpeg', base64: url.split(',')[1] } };
    }
    const fileToUrl = f => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = ko; r.readAsDataURL(f); });
    function pickFile() {
        return new Promise(ok => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = () => ok(i.files && i.files[0] || null); i.click(); });
    }
    // ---------- IA ----------
    function prompt(hint) {
        return 'Tu es repéreur et chef décorateur pour le cinéma et la télévision. Analyse la photo jointe (un lieu de tournage : pièce, plateau, salle) et reconstitue-la en PLAN VU DE DESSUS, à l’échelle, en centimètres, pour une maquette 3D.\n\n'
            + 'Repère du plan : la pièce est un rectangle de largeur W (axe x, de la gauche vers la droite de la photo) et de profondeur D (axe y, du mur du fond y = 0 vers le photographe y = D). Murs : "fond" (y = 0), "gauche" (x = 0), "droite" (x = W), "avant" (y = D, côté photographe, souvent invisible).\n'
            + 'Estime les dimensions avec les repères habituels : porte 204 × 83 cm, poignée à 105 cm, plafond 250–300 cm en logement, assise de chaise 45 cm, plan de travail 90 cm, prise à 30 cm, carreaux de 30 ou 60 cm, lames de parquet ~ 14 cm, personne debout ~ 170 cm. Si une partie de la pièce est hors champ, prolonge raisonnablement et baisse la confiance.\n'
            + (hint ? 'Indications de l’utilisateur (prioritaires) : ' + hint + '\n' : '')
            + '\nMobilier : choisis "ref" UNIQUEMENT dans cette liste (identifiant = nom (largeur × profondeur)) ; si rien ne correspond exactement, prends le plus proche et décris l’objet réel dans "label" ; donne la taille réelle estimée (w, d) si elle diffère.\n' + catalogue() + '\n\n'
            + 'Ouvertures : type parmi porte, porte_double, porte_coulissante, fenetre, baie ; mur parmi fond, gauche, droite, avant ; pos = position du CENTRE le long du mur, de 0 à 1 (fond / avant : de la gauche vers la droite ; gauche / droite : du fond vers le photographe) ; largeur en cm.\n'
            + 'Lumières visibles ou évidentes : type parmi fenetre (lumière du jour), lampe (lampe posée, lampadaire, applique), plafonnier, ecran, neon ; position x, y ; température de couleur estimée en kelvins.\n'
            + 'Point de vue : position estimée de l’appareil (x, y), point visé (vx, vy) et focale équivalente plein format en mm.\n\n'
            + 'Réponds UNIQUEMENT par un objet JSON, sans texte autour :\n'
            + '{"piece":{"nom":"…","W":cm,"D":cm,"H":cm,"confiance":0-1,"remarque":"…"},'
            + '"ouvertures":[{"type":"porte","mur":"gauche","pos":0.5,"largeur":83,"label":"…"}],'
            + '"mobilier":[{"ref":"m-canape-3","label":"…","x":cm,"y":cm,"rot":degrés (0 = face au photographe, 90 = tourné vers la gauche, 180 = dos au photographe),"w":cm,"d":cm}],'
            + '"lumieres":[{"type":"lampe","label":"…","x":cm,"y":cm,"kelvin":2700}],'
            + '"camera":{"x":cm,"y":cm,"vx":cm,"vy":cm,"focale":mm},'
            + '"conseils":["remarques utiles pour le tournage dans ce lieu (prises, recul, lumière naturelle, bruit…)"]}';
    }
    // ---------- normalisation (l'IA peut se tromper : tout est borné) ----------
    function normalize(j) {
        j = j || {}; const pc = j.piece || j.room || {};
        const W = clamp(Math.round(num(pc.W, 500)), 150, 6000), D = clamp(Math.round(num(pc.D, 400)), 150, 6000), H = clamp(Math.round(num(pc.H, 260)), 180, 2000);
        const S = { nom: String(pc.nom || pc.name || 'Décor d’après photo').slice(0, 60), W, D, H, conf: clamp(num(pc.confiance, 0.5), 0, 1), rem: String(pc.remarque || '').slice(0, 300), open: [], mob: [], lum: [], cam: null, tips: [] };
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
        const c = j.camera; if (c && isFinite(num(c.x, NaN))) S.cam = { x: clamp(num(c.x, W / 2), -500, W + 500), y: clamp(num(c.y, D), -500, D + 800), vx: num(c.vx, W / 2), vy: num(c.vy, 0), f: clamp(num(c.focale, 28), 8, 300), on: true };
        S.tips = (j.conseils || []).slice(0, 6).map(t => String(t).slice(0, 200));
        return S;
    }
    async function analyse(img, hint, signal) {
        if (typeof XAI === 'undefined' || !XAI.configured || !XAI.configured()) throw new Error('noai');
        if (XAI.canSee && !XAI.canSee()) throw new Error('L’IA connectée ne lit pas les images : choisissez-en une autre dans ⚙️ › Intelligence artificielle (Claude, Gemini, GPT…).');
        const r = await XAI.ask(prompt(hint), { image: img, maxTokens: 4000, signal });
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
        if (S.cam && S.cam.on) {
            const lib = libById('cam-cine'); if (lib) { const it = itemFromLib(lib, Math.round(S.cam.x * ax), Math.round(S.cam.y * ay)); it.rot = aim(it.x, it.y, S.cam.vx * ax, S.cam.vy * ay);
                if (it.fov) { it.fov.angle = Math.round(2 * Math.atan(36 / (2 * S.cam.f)) / DEG); it.fov.len = Math.round(Math.hypot(S.W, S.D)); } it.label = 'Point de vue photo (' + Math.round(S.cam.f) + ' mm)'; it.showLabel = true; out.push(it); }
        }
        return out;
    }
    function build(S, opt) {
        opt = opt || {}; const sc = opt.scale || null, t = newTab(('📷 ' + S.nom).slice(0, 40));
        t.items = itemsOf(S, sc);
        P.tabs.push(t); switchTab(P.tabs.length - 1);
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
        if (S.cam && S.cam.on) { const a = Math.atan2(S.cam.vy - S.cam.y, S.cam.vx - S.cam.x), hf = Math.atan(36 / (2 * S.cam.f)), L = Math.hypot(W, D) * 0.6;
            g += '<path d="M' + S.cam.x + ' ' + S.cam.y + 'L' + (S.cam.x + Math.cos(a - hf) * L) + ' ' + (S.cam.y + Math.sin(a - hf) * L) + 'L' + (S.cam.x + Math.cos(a + hf) * L) + ' ' + (S.cam.y + Math.sin(a + hf) * L) + 'Z" fill="rgba(79,195,247,.18)" stroke="#4fc3f7" stroke-width="' + fs / 8 + '"/><circle cx="' + S.cam.x + '" cy="' + S.cam.y + '" r="' + fs * 0.8 + '" fill="#4fc3f7"/>'; }
        const x0 = Math.min(-pad, S.cam && S.cam.on ? S.cam.x - pad : 0), y0 = -pad, x1 = Math.max(W + pad, S.cam && S.cam.on ? S.cam.x + pad : 0), y1 = Math.max(D + pad, S.cam && S.cam.on ? S.cam.y + pad : 0);
        return '<svg viewBox="' + x0 + ' ' + y0 + ' ' + (x1 - x0) + ' ' + (y1 - y0) + '" style="width:100%;height:100%">' + g + '</svg>';
    }
    // ---------- interface ----------
    function css() {
        if (document.getElementById('xph3d-css')) return; const s = document.createElement('style'); s.id = 'xph3d-css';
        s.textContent = '#xph3d{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font:13px system-ui,sans-serif}#xph3d .b{background:var(--bg-panel,#2d2d2d);color:var(--text-main,#eee);border-radius:12px;width:min(1060px,96vw);max-height:92vh;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.5)}#xph3d .h{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border-color,#444)}#xph3d .h b{font-size:15px}#xph3d .h .sp{flex:1}#xph3d .c{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;padding:14px 16px;overflow:auto}#xph3d .ph{background:#000;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:200px}#xph3d .ph img{max-width:100%;max-height:340px;display:block}#xph3d .pv{border:1px solid var(--border-color,#444);border-radius:8px;height:340px;padding:6px;color:var(--text-main,#eee)}#xph3d .f{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}#xph3d input[type=number]{width:72px}#xph3d input[type=text],#xph3d textarea{width:100%;box-sizing:border-box}#xph3d .ls{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:4px 14px}#xph3d .ls label{display:flex;gap:6px;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#xph3d .hd{grid-column:1/-1;font-weight:700;margin-top:6px}#xph3d .ft{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--border-color,#444);flex-wrap:wrap}#xph3d .ft .sp{flex:1}#xph3d .warn{color:#ffb74d}#xph3d .dim{opacity:.75}#xph3d .tips{grid-column:1/-1;margin:4px 0 0;padding-left:18px}#xph3d button{cursor:pointer}#xph3d .go{background:rgb(var(--accent,240,179,120));color:#111;border:0;border-radius:6px;padding:7px 14px;font-weight:700}';
        document.head.appendChild(s);
    }
    function close() { const o = document.getElementById('xph3d'); if (o) o.remove(); }
    function shell(title, body, foot) {
        css(); close(); const o = document.createElement('div'); o.id = 'xph3d';
        o.innerHTML = '<div class="b"><div class="h"><b>' + title + '</b><span class="sp"></span><button data-x="close" title="Fermer">✕</button></div>' + body + '<div class="ft">' + foot + '</div></div>';
        document.body.appendChild(o); o.querySelector('[data-x=close]').onclick = close; o.addEventListener('mousedown', e => { if (e.target === o) close(); });
        return o;
    }
    // 1. choix de la photo + indications
    async function open() {
        const L0 = (typeof items === 'function' ? items() : []).filter(i => i.kind === 'bg'), bg = L0.find(i => sel.has(i.id)) || L0[0];
        let src = null, name = '';
        if (bg && bg.src) { src = bg.src; name = bg.name || 'Fond de plan'; }
        const o = shell('📷 Photo → décor 3D',
            '<div class="c"><div class="ph" id="xph-ph">' + (src ? '<img alt="" src="' + esc(src) + '">' : '<span class="dim">Aucune photo</span>') + '</div><div>'
            + '<p style="margin-top:0">Une photo du lieu (repérage, plateau, salle) : l’IA y lit la pièce, ses dimensions, les portes et fenêtres, le mobilier et les lumières, puis vous <b>propose</b> un plan à l’échelle et sa vue 3D. Rien n’est créé sans votre accord.</p>'
            + '<div class="f"><button id="xph-file">🖼️ Choisir une photo…</button>' + (src ? '<span class="dim">ou celle du fond de plan : « ' + esc(name) + ' »</span>' : '') + '</div>'
            + '<label class="dim">Ce que vous savez déjà (facultatif) : une mesure, l’usage du lieu…</label><textarea id="xph-hint" rows="3" placeholder="ex. la pièce fait environ 5 × 4 m ; le canapé mesure 2,20 m ; plafond à 2,70 m"></textarea>'
            + '<p class="dim" id="xph-ai"></p></div></div>',
            '<span class="sp"></span>' + (last ? '<button id="xph-last">↩️ Reprendre la dernière proposition</button>' : '') + '<button data-x="close2">Annuler</button><button class="go" id="xph-go"' + (src ? '' : ' disabled') + '>🤖 Analyser la photo</button>');
        o.querySelector('[data-x=close2]').onclick = close;
        const ai = o.querySelector('#xph-ai');
        const ready = typeof XAI !== 'undefined' && XAI.configured && XAI.configured();
        ai.innerHTML = ready ? ('IA : <b>' + esc(XAI.label ? XAI.label() : 'connectée') + '</b>' + (XAI.canSee && !XAI.canSee() ? ' — <span class="warn">elle ne lit pas les images, choisissez-en une autre</span>' : '')) : '<span class="warn">Aucune IA connectée.</span> <a href="#" id="xph-set">Connecter mon IA</a> (Claude, ChatGPT, Gemini…)';
        const st = o.querySelector('#xph-set'); if (st) st.onclick = e => { e.preventDefault(); close(); try { XAI.openSettings(); } catch (x) { say('⚙️ › Intelligence artificielle'); } };
        o.querySelector('#xph-file').onclick = async () => { const f = await pickFile(); if (!f) return; src = await fileToUrl(f); name = f.name; o.querySelector('#xph-ph').innerHTML = '<img alt="" src="' + esc(src) + '">'; o.querySelector('#xph-go').disabled = false; };
        if (last) o.querySelector('#xph-last').onclick = () => propose(last.S, last.url);
        o.querySelector('#xph-go').onclick = async () => {
            if (!src) return; const btn = o.querySelector('#xph-go'), hint = o.querySelector('#xph-hint').value.trim();
            if (!ready) { ai.innerHTML = '<span class="warn">Connectez d’abord votre IA dans ⚙️ › Intelligence artificielle.</span>'; return; }
            btn.disabled = true; btn.textContent = '⏳ L’IA regarde la photo…'; const ac = new AbortController(); o.querySelector('[data-x=close]').addEventListener('click', () => ac.abort());
            try { const im = await toJpeg(src), S = await analyse(im.image, hint, ac.signal); last = { S, url: im.url }; propose(S, im.url); }
            catch (e) { if (ac.signal.aborted) return; btn.disabled = false; btn.textContent = '🤖 Réessayer'; ai.innerHTML = '<span class="warn">⚠️ ' + esc(e.message === 'noai' ? 'Aucune IA connectée.' : (e.message || e)) + '</span>'; }
        };
    }
    // 2. proposition à valider
    function propose(S, url) {
        const W0 = S.W, D0 = S.D, row = (k, i, txt) => '<label title="' + esc(txt) + '"><input type="checkbox" data-k="' + k + '" data-i="' + i + '"' + (S[k][i].on ? ' checked' : '') + '>' + esc(txt) + '</label>';
        const o = shell('📷 Proposition de décor — à valider',
            '<div class="c"><div><div class="ph"><img alt="" src="' + esc(url) + '"></div>'
            + '<div class="f"><b>' + esc(S.nom) + '</b><span class="dim">· confiance ' + Math.round(S.conf * 100) + ' %</span></div>' + (S.rem ? '<p class="dim" style="margin:0">' + esc(S.rem) + '</p>' : '')
            + '<div class="f">Largeur <input type="number" id="xph-w" min="150" max="6000" step="10" value="' + S.W + '"> cm · Profondeur <input type="number" id="xph-d" min="150" max="6000" step="10" value="' + S.D + '"> cm · Hauteur <input type="number" id="xph-h" min="180" max="2000" step="10" value="' + S.H + '"> cm</div>'
            + '<p class="dim" style="margin:0">Corrigez une dimension si vous la connaissez : tout le mobilier se replace à la nouvelle échelle.</p></div>'
            + '<div class="pv" id="xph-pv"></div>'
            + (S.open.length ? '<div class="hd">🚪 Portes et fenêtres</div><div class="ls">' + S.open.map((x, i) => row('open', i, (libById(x.ref) || {}).name + ' — ' + WALLS[x.mur] + (x.label ? ' (' + x.label + ')' : ''))).join('') + '</div>' : '')
            + (S.mob.length ? '<div class="hd">🛋️ Mobilier (' + S.mob.length + ')</div><div class="ls">' + S.mob.map((x, i) => row('mob', i, (x.label || libById(x.ref).name) + ' · ' + x.w + '×' + x.d)).join('') + '</div>' : '')
            + (S.lum.length ? '<div class="hd">💡 Lumières</div><div class="ls">' + S.lum.map((x, i) => row('lum', i, (x.label || x.type) + ' · ' + x.k + ' K' + (x.type === 'fenetre' ? ' (projecteur de jour à l’extérieur)' : ''))).join('') + '</div>' : '')
            + (S.cam ? '<div class="hd">🎥 Point de vue</div><div class="ls"><label><input type="checkbox" id="xph-cam"' + (S.cam.on ? ' checked' : '') + '>Caméra à l’emplacement de la photo (' + Math.round(S.cam.f) + ' mm)</label></div>' : '')
            + (S.tips.length ? '<div class="hd">💬 Conseils pour le tournage</div><ul class="tips">' + S.tips.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' : '')
            + '<p class="dim" style="grid-column:1/-1;margin:6px 0 0">⚠️ Estimation d’après une seule photo : vérifiez les cotes sur place (mètre laser) avant de commander du matériel ou de construire.</p></div>',
            '<button id="xph-back">← Autre photo</button><span class="sp"></span><label><input type="checkbox" id="xph-3d" checked> Ouvrir la vue 3D</label><button data-x="close2">Annuler</button><button class="go" id="xph-ok">✅ Créer le plan</button>');
        const pv = o.querySelector('#xph-pv'), scaled = () => { const w = num(o.querySelector('#xph-w').value, W0), d = num(o.querySelector('#xph-d').value, D0); return { x: w / W0, y: d / D0 }; };
        const draw = () => { const sc = scaled(), T = JSON.parse(JSON.stringify(S)); T.W = Math.round(W0 * sc.x); T.D = Math.round(D0 * sc.y); T.mob.forEach(m => { m.x *= sc.x; m.y *= sc.y; }); T.lum.forEach(l => { l.x *= sc.x; l.y *= sc.y; }); if (T.cam) { T.cam.x *= sc.x; T.cam.y *= sc.y; T.cam.vx *= sc.x; T.cam.vy *= sc.y; } pv.innerHTML = preview(T); };
        o.querySelectorAll('input[data-k]').forEach(c => c.onchange = () => { S[c.dataset.k][+c.dataset.i].on = c.checked; draw(); });
        const cam = o.querySelector('#xph-cam'); if (cam) cam.onchange = () => { S.cam.on = cam.checked; draw(); };
        ['#xph-w', '#xph-d'].forEach(s => o.querySelector(s).oninput = draw); draw();
        o.querySelector('[data-x=close2]').onclick = close; o.querySelector('#xph-back').onclick = open;
        o.querySelector('#xph-ok').onclick = () => {
            const sc = scaled(), T = JSON.parse(JSON.stringify(S)); T.W = clamp(Math.round(W0 * sc.x), 150, 6000); T.D = clamp(Math.round(D0 * sc.y), 150, 6000); T.H = clamp(Math.round(num(o.querySelector('#xph-h').value, S.H)), 180, 2000);
            const want3d = o.querySelector('#xph-3d').checked; close(); build(T, { scale: sc });
            say('📷 Plan « ' + T.nom + ' » créé à l’échelle (' + (T.W / 100).toLocaleString('fr-FR') + ' × ' + (T.D / 100).toLocaleString('fr-FR') + ' m) — tout reste modifiable', 4000);
            if (want3d && window.PL3D && PL3D.open) setTimeout(() => PL3D.open(), 120);
        };
    }
    // ---------- bouton ----------
    function mount() {
        if (document.getElementById('xph3d-btn')) return; const ref = [...document.querySelectorAll('#toolbar button')].find(b => /bg-upload/.test(b.getAttribute('onclick') || '')); if (!ref) return;
        ref.insertAdjacentHTML('afterend', '<button id="xph3d-btn" title="Photo → décor 3D : l’IA lit une photo du lieu (pièce, dimensions, portes, fenêtres, mobilier, lumières) et propose un plan à l’échelle et sa vue 3D, à valider"><span class="btn-icon">📷</span><span class="btn-label">Photo → 3D</span></button>');
        document.getElementById('xph3d-btn').onclick = open;
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else setTimeout(mount, 0);
    addEventListener('load', mount);
    return { open, analyse, normalize, build, itemsOf, preview, prompt, catalogue };
})();
