// SUITE XIII — module commun. Source : xiii-src/cadro-grade.js
// =====================================================================
//  SUITE XIII — CADRO LIVE · outils d'étalonnage (saison 6, phase L)
//  Aperçu étalonné du signal, calculé par la carte graphique (WebGL 2) — l'image source n'est jamais modifiée :
//   · lift / gamma / gain (maître + rouge, vert, bleu), saturation ;
//   · balance des blancs par pipette (cliquer un blanc ou un gris neutre de l'image) ;
//   · LUT 3D .cube en aperçu (17 → 65 points), intensité réglable ;
//   · avant / après (E), scopes et aides sur l'image étalonnée ou sur la source ;
//   · mire de référence (24 plages type ColorChecker) en surimpression pour juger une charte filmée ;
//   · mémoires de raccord : jusqu'à 12 images figées (avec leurs réglages) gardées sur l'appareil,
//     rappelées en image A pour la comparaison (volet A | B) et pour raccorder les plans.
// =====================================================================
const XCGRADE = (() => {
    const K = 'xiii.cadro.grade';
    const Z3 = () => [0, 0, 0];
    const DEF = { on: false, lift: [0, 0, 0], liftM: 0, gam: [1, 1, 1], gamM: 1, gain: [1, 1, 1], gainM: 1, sat: 1, wb: [1, 1, 1], lutOn: false, lutMix: 100, lutName: '', scopes: 'graded', chart: false };
    const J = () => { try { return Object.assign(JSON.parse(JSON.stringify(DEF)), JSON.parse(localStorage.getItem(K)) || {}); } catch (e) { return JSON.parse(JSON.stringify(DEF)); } };
    let C = J(); const W = () => { try { localStorage.setItem(K, JSON.stringify(C)); } catch (e) { } };
    let ov = null, raf = 0, gl = null, cv = null, prog = null, tex = null, lutTex = null, lutN = 0, bypass = false, picking = false, lutData = null;
    // ---------- WebGL ----------
    const VS = '#version 300 es\nin vec2 p;out vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
    const FS = '#version 300 es\nprecision highp float;precision highp sampler3D;in vec2 uv;out vec4 o;uniform sampler2D v;uniform sampler3D L;uniform vec3 lift,gam,gain,wb;uniform float sat,lut,lutN;' +
        'void main(){vec3 c=texture(v,uv).rgb*wb;c=gain*(c+lift*(1.-c));c=pow(max(c,0.),1./max(gam,vec3(.01)));float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,sat);' +
        'if(lut>0.){vec3 q=clamp(c,0.,1.);vec3 t=(q*(lutN-1.)+.5)/lutN;c=mix(c,texture(L,t).rgb,lut);}o=vec4(clamp(c,0.,1.),1.);}';
    function initGL() {
        if (gl) return true; cv = document.createElement('canvas'); cv.className = 'xcg-cv'; gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false }); if (!gl) return false;
        const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(x)); return x; };
        prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
        const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
        gl.uniform1i(gl.getUniformLocation(prog, 'v'), 0); gl.uniform1i(gl.getUniformLocation(prog, 'L'), 1); lutTex = gl.createTexture(); setLut(lutData); return true;
    }
    function setLut(d) { lutData = d; if (!gl) return; gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_3D, lutTex); const n = d ? d.n : 2, a = d ? d.a : new Uint8Array([0, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 255, 255, 0, 255, 0, 0, 255, 255, 255, 0, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255]);
        gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, n, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, a); [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_3D, p, gl.LINEAR)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R].forEach(p => gl.texParameteri(gl.TEXTURE_3D, p, gl.CLAMP_TO_EDGE)); lutN = n; gl.activeTexture(gl.TEXTURE0); }
    function parseCube(txt) { let n = 0, lo = [0, 0, 0], hi = [1, 1, 1]; const V = []; txt.split(/\r?\n/).forEach(l => { l = l.trim(); if (!l || l[0] === '#') return; const m = l.split(/\s+/); if (m[0] === 'LUT_3D_SIZE') n = +m[1]; else if (m[0] === 'DOMAIN_MIN') lo = m.slice(1, 4).map(Number); else if (m[0] === 'DOMAIN_MAX') hi = m.slice(1, 4).map(Number); else if (/^[-\d.]/.test(m[0]) && m.length >= 3) V.push(+m[0], +m[1], +m[2]); });
        if (!n || V.length < n * n * n * 3) throw new Error('fichier .cube 3D illisible (LUT_3D_SIZE ?)'); const a = new Uint8Array(n * n * n * 4); for (let i = 0; i < n * n * n; i++) for (let k = 0; k < 3; k++) { a[i * 4 + k] = Math.max(0, Math.min(255, Math.round((V[i * 3 + k] - lo[k]) / (hi[k] - lo[k]) * 255))); a[i * 4 + 3] = 255; } return { n, a }; } // .cube : rouge varie le plus vite = ordre x, y, z de texImage3D
    function render(v) {
        if (!initGL()) return false; const w = v.videoWidth, h = v.videoHeight; if (!w) return false; if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v); } catch (e) { return false; }
        const U = n => gl.getUniformLocation(prog, n), add = (a, m) => a.map(x => x + m), mul = (a, m) => a.map(x => x * m);
        gl.uniform3fv(U('lift'), add(C.lift, C.liftM)); gl.uniform3fv(U('gam'), mul(C.gam, C.gamM)); gl.uniform3fv(U('gain'), mul(C.gain, C.gainM)); gl.uniform3fv(U('wb'), C.wb); gl.uniform1f(U('sat'), C.sat); gl.uniform1f(U('lut'), C.lutOn && lutData ? C.lutMix / 100 : 0); gl.uniform1f(U('lutN'), lutN);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); return true;
    }
    const active = () => C.on && !bypass;
    // ---------- interface ----------
    const css = () => { if (document.getElementById('xcg-css')) return; const s = document.createElement('style'); s.id = 'xcg-css';
        s.textContent = '#xcl .xcg-cv{position:absolute;pointer-events:none;z-index:1}#xcl .xcv-a{z-index:2!important}#xcl .xce-cv{z-index:3!important}#xcl .xcv-g{z-index:4!important}#xcl .xcv-h{z-index:5!important}#xcl.xcg-pick .mon{cursor:copy!important}' +
            '#xcl .xcg label{display:flex;align-items:center;gap:6px;margin:2px 0;font-size:12px;cursor:pointer}#xcl .xcg .sl{display:grid;grid-template-columns:66px 1fr 40px;gap:6px;align-items:center;font-size:11.5px;margin:1px 0}#xcl .xcg .sl input{width:100%;accent-color:#f0b378}#xcl .xcg .sl span{font:600 10.5px ui-monospace,monospace;text-align:right;opacity:.85}#xcl .xcg .sl.r input{accent-color:#ef5350}#xcl .xcg .sl.g input{accent-color:#66bb6a}#xcl .xcg .sl.b input{accent-color:#42a5f5}#xcl .xcg .sl.c{padding-left:10px}' +
            '#xcl .xcg details{margin:2px 0}#xcl .xcg summary{cursor:pointer;font-size:12px;opacity:.85}#xcl .xcg .bt{display:flex;gap:4px;flex-wrap:wrap;margin:4px 0}#xcl .xcg .bt button{padding:4px 8px;font-size:11.5px}#xcl .xcg .bt button.on{background:rgba(240,179,120,.18);border-color:#f0b378;color:#f6c79a}#xcl .xcg .mem{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:4px 0}#xcl .xcg .mem div{position:relative;cursor:pointer;border:1px solid #333;border-radius:5px;overflow:hidden}#xcl .xcg .mem img{width:100%;display:block;aspect-ratio:16/9;object-fit:cover}#xcl .xcg .mem small{position:absolute;left:3px;bottom:2px;font:600 9.5px system-ui;color:#fff;text-shadow:0 1px 2px #000}#xcl .xcg .mem b{position:absolute;right:2px;top:1px;font-size:10px;color:#fff;text-shadow:0 1px 2px #000;opacity:.7}' +
            '#xcl .xcg-chart{position:absolute;right:12px;bottom:12px;z-index:6;display:grid;grid-template-columns:repeat(6,26px);gap:2px;padding:4px;background:#111;border:1px solid #444;border-radius:6px;pointer-events:none}#xcl .xcg-chart i{height:26px;border-radius:2px}#xcl .xcg-badge{position:absolute;right:10px;bottom:10px;z-index:5;font:700 11px ui-monospace,monospace;padding:3px 7px;border-radius:5px;background:rgba(240,179,120,.9);color:#111;pointer-events:none}';
        document.head.appendChild(s); };
    const CHART = ['#735244', '#c29682', '#627a9d', '#576c43', '#8580b1', '#67bdaa', '#d67e2c', '#505ba6', '#c15a63', '#5e3c6c', '#9dbc40', '#e0a32e', '#383d96', '#469449', '#af363c', '#e7c71f', '#bb5695', '#0885a1', '#f3f3f2', '#c8c8c8', '#a0a0a0', '#7a7a79', '#555555', '#343434'];
    function panel(o) { const as = o.querySelector('aside'); if (!as || as.querySelector('.xcg')) return; const d = document.createElement('div'); d.className = 'xcg'; const ref = as.querySelector('.xcv') || as.querySelector('.xce'); if (ref) ref.after(d); else as.appendChild(d); draw(d); mems(); }
    const sl = (lab, key, i, mn, mx, st, cls) => { const v = i == null ? C[key] : C[key][i]; return '<div class="sl ' + (cls || '') + '"><span style="text-align:left;opacity:.75">' + lab + '</span><input type="range" min="' + mn + '" max="' + mx + '" step="' + st + '" value="' + v + '" data-k="' + key + '" ' + (i == null ? '' : 'data-i="' + i + '"') + '><span>' + (+v).toFixed(2) + '</span></div>'; };
    function draw(d) {
        d = d || (ov && ov.querySelector('.xcg')); if (!d) return;
        const rgb = (key, mn, mx, st) => ['r', 'g', 'b'].map((c, i) => sl({ r: 'R', g: 'V', b: 'B' }[c], key, i, mn, mx, st, c + ' c')).join('');
        d.innerHTML = '<h4>🎨 Étalonnage (aperçu)</h4><label><input type="checkbox" data-c="on"' + (C.on ? ' checked' : '') + '> Activer l\'étalonnage<span class="kb" style="margin-left:auto;font:600 10px ui-monospace;opacity:.5;border:1px solid #444;border-radius:4px;padding:0 4px">E</span></label>' +
            (C.on ? sl('Lift', 'liftM', null, -.3, .3, .005) + '<details><summary>Lift R V B</summary>' + rgb('lift', -.2, .2, .005) + '</details>' + sl('Gamma', 'gamM', null, .4, 2.5, .01) + '<details><summary>Gamma R V B</summary>' + rgb('gam', .6, 1.6, .01) + '</details>' + sl('Gain', 'gainM', null, .3, 2, .01) + '<details><summary>Gain R V B</summary>' + rgb('gain', .6, 1.6, .01) + '</details>' + sl('Saturation', 'sat', null, 0, 2, .01) +
                '<div class="bt"><button data-a="wb" class="' + (picking ? 'on' : '') + '" title="Cliquez ensuite un blanc ou un gris neutre de l\'image">⚪ Pipette balance des blancs</button><button data-a="wb0" title="Balance neutre">↺ Balance</button></div>' +
                '<div class="bt"><button data-a="lut">🎞️ Charger une LUT .cube…</button>' + (lutData ? '<button data-a="lutx" title="Retirer la LUT">✕</button>' : '') + '</div>' + (lutData ? '<label><input type="checkbox" data-c="lutOn"' + (C.lutOn ? ' checked' : '') + '> ' + (C.lutName || 'LUT') + ' (' + lutN + ' pts)</label>' + sl('Intensité', 'lutMix', null, 0, 100, 1) : '') +
                '<div class="bt"><button data-a="ba" class="' + (bypass ? 'on' : '') + '">' + (bypass ? '◐ Avant (source)' : '◑ Après (étalonné)') + '</button><button data-a="reset">↺ Tout remettre à zéro</button></div>' +
                '<label>Scopes et aides <select data-s="scopes" style="width:auto;margin:0;padding:3px;font-size:11.5px"><option value="graded"' + (C.scopes === 'graded' ? ' selected' : '') + '>sur l\'image étalonnée</option><option value="source"' + (C.scopes === 'source' ? ' selected' : '') + '>sur la source</option></select></label>' : '') +
            '<label><input type="checkbox" data-c="chart"' + (C.chart ? ' checked' : '') + '> Mire de référence (24 plages)</label>' +
            '<div style="font-size:12px;margin-top:6px">Mémoires de raccord</div><div class="bt"><button data-a="mem" title="Fige l\'image (étalonnée) et ses réglages">📸 Mémoriser l\'image</button></div><div class="mem"></div>';
        d.querySelectorAll('input[type=range]').forEach(i => i.oninput = () => { const v = +i.value; if (i.dataset.i != null) C[i.dataset.k][+i.dataset.i] = v; else C[i.dataset.k] = v; i.nextElementSibling.textContent = v.toFixed(2); W(); });
        d.querySelectorAll('[data-c]').forEach(i => i.onchange = () => { C[i.dataset.c] = i.checked; W(); draw(d); mems(); });
        d.querySelectorAll('[data-s]').forEach(i => i.onchange = () => { C[i.dataset.s] = i.value; W(); });
        d.querySelectorAll('[data-a]').forEach(b => b.onclick = () => act(b.dataset.a));
    }
    function act(a) {
        if (a === 'wb') { picking = !picking; ov.classList.toggle('xcg-pick', picking); draw(); }
        else if (a === 'wb0') { C.wb = [1, 1, 1]; W(); }
        else if (a === 'ba') { bypass = !bypass; draw(); }
        else if (a === 'reset') { const keep = { on: C.on, chart: C.chart, scopes: C.scopes, lutName: C.lutName }; C = Object.assign(JSON.parse(JSON.stringify(DEF)), keep); W(); draw(); }
        else if (a === 'lutx') { setLut(null); C.lutOn = false; C.lutName = ''; W(); idb('put', 'lut', null); draw(); }
        else if (a === 'lut') { const i = document.createElement('input'); i.type = 'file'; i.accept = '.cube'; i.onchange = () => { const f = i.files[0]; if (!f) return; f.text().then(t => { try { const d = parseCube(t); setLut(d); C.lutOn = true; C.lutName = f.name.replace(/\.cube$/i, ''); W(); idb('put', 'lut', { n: d.n, a: d.a, name: C.lutName }); draw(); } catch (e) { alert('LUT non chargée : ' + e.message); } }); }; i.click(); }
        else if (a === 'mem') memo();
    }
    // balance des blancs : moyenne 5 × 5 pixels sur la source → gains pour R = V = B (vert inchangé)
    function wbAt(v, fx, fy) { const c = document.createElement('canvas'); c.width = c.height = 5; const x = c.getContext('2d'); x.drawImage(v, Math.max(0, fx * v.videoWidth - 2), Math.max(0, fy * v.videoHeight - 2), 5, 5, 0, 0, 5, 5); const d = x.getImageData(0, 0, 5, 5).data; let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; } r /= 25; g /= 25; b /= 25; if (r < 8 || g < 8 || b < 8) return false; C.wb = [g / r, 1, g / b].map(x => +Math.max(.5, Math.min(2, x)).toFixed(4)); W(); return true; }
    // ---------- mémoires (IndexedDB, sur l'appareil) ----------
    function idb(op, key, val) { return new Promise(res => { try { const rq = indexedDB.open('xiii-cadro-live', 1); rq.onupgradeneeded = () => rq.result.createObjectStore('kv'); rq.onsuccess = () => { const db = rq.result, tx = db.transaction('kv', op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore('kv'); const r = op === 'get' ? st.get(key) : st.put(val, key); r.onsuccess = () => res(r.result); r.onerror = () => res(null); }; rq.onerror = () => res(null); } catch (e) { res(null); } }); }
    async function memo() { const v = ov && ov.querySelector('video'); if (!v || !v.videoWidth) return; const c = document.createElement('canvas'), w = Math.min(1280, v.videoWidth); c.width = w; c.height = Math.round(w * v.videoHeight / v.videoWidth); c.getContext('2d').drawImage(active() && render(v) ? cv : v, 0, 0, c.width, c.height);
        const L = (await idb('get', 'mem')) || []; L.unshift({ src: c.toDataURL('image/jpeg', .88), t: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), n: 'Plan ' + (L.length + 1), g: JSON.parse(JSON.stringify(C)) }); await idb('put', 'mem', L.slice(0, 12)); mems(); }
    async function mems() { const box = ov && ov.querySelector('.xcg .mem'); if (!box) return; const L = (await idb('get', 'mem')) || []; box.innerHTML = L.map((m, i) => '<div data-m="' + i + '" title="' + m.n + ' · ' + m.t + ' — clic : image A (comparaison) · double-clic : reprendre ses réglages · ✕ : supprimer"><img src="' + m.src + '" alt=""><small>' + m.n + '</small><b data-del="' + i + '">✕</b></div>').join('') || '<small style="grid-column:1/-1;opacity:.6">Aucune image mémorisée.</small>';
        box.querySelectorAll('[data-m]').forEach(el => { const m = L[+el.dataset.m]; el.onclick = e => { if (e.target.dataset.del != null) { L.splice(+e.target.dataset.del, 1); idb('put', 'mem', L).then(mems); return; } if (typeof XCVIEW !== 'undefined' && XCVIEW.setA) XCVIEW.setA({ src: m.src, t: m.n + ' ' + m.t }); };
            el.ondblclick = () => { if (m.g) { const keep = { scopes: C.scopes, chart: C.chart }; C = Object.assign(JSON.parse(JSON.stringify(DEF)), m.g, keep); W(); draw(); mems(); } }; }); }
    // ---------- boucle ----------
    const fit = (el, r, m) => { const s = el.style, L = (r.left - m.left) + 'px', T = (r.top - m.top) + 'px', Wd = r.width + 'px', Hd = r.height + 'px'; if (s.left !== L) s.left = L; if (s.top !== T) s.top = T; if (s.width !== Wd) s.width = Wd; if (s.height !== Hd) s.height = Hd; };
    function tick() {
        raf = requestAnimationFrame(tick); ov = document.getElementById('xcl'); if (!ov) return; css(); panel(ov); const mon = ov.querySelector('.mon'), v = ov.querySelector('video'); if (!mon || !v) return;
        let ch = mon.querySelector('.xcg-chart'); if (C.chart && !ch) { ch = document.createElement('div'); ch.className = 'xcg-chart'; ch.innerHTML = CHART.map(c => '<i style="background:' + c + '"></i>').join(''); mon.appendChild(ch); } else if (!C.chart && ch) ch.remove();
        let bd = mon.querySelector('.xcg-badge'); const lab = C.on && !v.hidden ? (bypass ? 'AVANT' : 'ÉTALONNÉ' + (C.lutOn && lutData ? ' · ' + (C.lutName || 'LUT') : '')) : ''; if (lab && !bd) { bd = document.createElement('div'); bd.className = 'xcg-badge'; mon.appendChild(bd); } if (bd) { if (!lab) bd.remove(); else if (bd.textContent !== lab) bd.textContent = lab; }
        if (!active() || v.hidden || !v.videoWidth) { if (cv && cv.parentElement) cv.remove(); return; }
        if (!render(v)) return; if (cv.parentElement !== mon) mon.insertBefore(cv, v.nextSibling); fit(cv, v.getBoundingClientRect(), mon.getBoundingClientRect());
    }
    // pipette de balance : clic sur le moniteur (avant la pipette des aides)
    document.addEventListener('click', e => { if (!picking || !ov) return; const v = ov.querySelector('video'); if (!v || !e.target.closest('#xcl .mon')) return; const r = v.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height; if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return; e.stopImmediatePropagation(); e.preventDefault(); const ok = wbAt(v, fx, fy); picking = false; ov.classList.remove('xcg-pick'); if (!ok) alert('Zone trop sombre : cliquez un blanc ou un gris neutre bien exposé.'); draw(); }, true);
    addEventListener('keydown', e => { if (!document.getElementById('xcl') || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return; if (e.key.toLowerCase() === 'e') { e.preventDefault(); e.stopImmediatePropagation(); if (!C.on) { C.on = true; W(); } else bypass = !bypass; draw(); } }, true);
    const watch = () => new MutationObserver(() => { const o = document.getElementById('xcl'); if (o && !raf) { raf = requestAnimationFrame(tick); idb('get', 'lut').then(d => { if (d && d.a) { setLut({ n: d.n, a: d.a }); draw(); } }); } else if (!o && raf) { cancelAnimationFrame(raf); raf = 0; picking = false; bypass = false; } }).observe(document.body, { childList: true });
    if (document.body) watch(); else addEventListener('DOMContentLoaded', watch);
    // source à analyser pour les scopes et les aides
    function src(v) { return C.on && C.scopes === 'graded' && !bypass && cv && cv.parentElement && cv.width ? cv : v; }
    return { src, cfg: () => JSON.parse(JSON.stringify(C)), parseCube, setLut, memo };
})();
