// SUITE XIII — service worker (généré par pwa/make_pwa.py : ne pas modifier à la main)
const VER = 'd5b54f6955', PAGES = ["404.html", "annonces.html", "arrivee.html", "backupo-m.html", "backupo.html", "cadro-m.html", "cadro.html", "caisse.html", "calendrier.html", "callsheeto-m.html", "callsheeto.html", "casto-m.html", "casto.html", "catalogue.html", "compte.html", "conduco-m.html", "conduco.html", "controle.html", "decoup-m.html", "decoup.html", "deleg.html", "deviso-m.html", "deviso.html", "direct.html", "documents.html", "dossier-m.html", "dossier.html", "drive.html", "echanges.html", "equipe.html", "graphico.html", "importo.html", "index.html", "jour.html", "kiosque.html", "legal.html", "ludo.html", "lumo-m.html", "lumo.html", "matos.html", "melango.html", "moodo-m.html", "moodo.html", "notes.html", "packingo-m.html", "packingo.html", "planno-m.html", "planno.html", "plano-m.html", "plano.html", "posto-client.html", "posto-m.html", "posto.html", "prompteur.html", "repero-m.html", "repero.html", "ressourco-m.html", "ressourco.html", "runo-chat.html", "runo-m.html", "runo.html", "scripto-m.html", "scripto.html", "sono-m.html", "sono.html", "soustitro-m.html", "soustitro.html", "storyboardo-m.html", "storyboardo.html", "syno.html", "team.html", "transporto-m.html", "transporto.html", "viseur.html", "vitrine.html", "voir.html", "manifest.webmanifest", "equipe.webmanifest", "xiii-logo.png", "xiii-logo-suite.png", "xiii-icon-192.png", "xiii-icon-512.png", "xiii-icon-maskable.png", "xiii-apple-touch.png"], CDN = ["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js", "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js", "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js", "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js", "https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js", "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js", "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js", "https://cdn.jsdelivr.net/npm/tesseract.js", "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js", "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css", "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js", "https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js", "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js", "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js", "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js", "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js", "https://cdnjs.cloudflare.com/ajax/libs/three.js", "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", "https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js", "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js", "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"];
const ONLINE = new URL(self.location.href).searchParams.get('mode') === 'online'; // « Installer » simple : application installée, tout reste en ligne
const APP_CACHE = 'xiii-app-' + VER, LIB_CACHE = 'xiii-lib-v1';
const LIB_HOSTS = /^(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
self.addEventListener('install', e => { if (ONLINE) { self.skipWaiting(); return; } e.waitUntil(caches.open(APP_CACHE).then(c => Promise.all(PAGES.map(p => c.add(new Request(p, { cache: 'reload' })).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => ONLINE ? k.indexOf('xiii-') === 0 : (k.indexOf('xiii-app-') === 0 && k !== APP_CACHE)).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
async function libFetch(req) { const c = await caches.open(LIB_CACHE), hit = await c.match(req, { ignoreVary: true }); if (hit) return hit; const r = await fetch(req); if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()).catch(() => { }); return r; }
async function pageFetch(req) {
    const c = await caches.open(APP_CACHE), key = new URL(req.url); key.hash = ''; key.search = ''; if (key.pathname.endsWith('/')) key.pathname += 'index.html';
    try { const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 5000); const r = await fetch(req, { signal: ctl.signal }); clearTimeout(t); if (r.ok) c.put(key.href, r.clone()).catch(() => { }); return r; }
    catch (e) { const hit = await c.match(key.href) || await caches.match(key.href); if (hit) return hit; return new Response('<meta charset="utf-8"><body style="font:16px system-ui;background:#1d1b19;color:#eee;text-align:center;padding:15vh 20px"><h1>SUITE XIII</h1><p>Cette page n\'a pas encore été enregistrée pour le hors-ligne.<br>Ouvrez-la une fois avec une connexion.</p><p><a style="color:#f0b378" href="index.html">← Accueil</a></p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }
}
self.addEventListener('fetch', e => {
    if (ONLINE) return; // tout passe par le réseau, comme sur le site
    const req = e.request; if (req.method !== 'GET') return; const u = new URL(req.url);
    if (u.origin === location.origin) {
        if (/\/__|\/sw\.js$/.test(u.pathname)) return;
        if (req.mode === 'navigate' || /\.html$/.test(u.pathname) || u.pathname.endsWith('/')) { e.respondWith(pageFetch(req)); return; }
        e.respondWith(caches.match(req, { ignoreSearch: true }).then(h => h || fetch(req).then(r => { if (r.ok) caches.open(APP_CACHE).then(c => c.put(req, r.clone())); return r; })));
        return;
    }
    if (LIB_HOSTS.test(u.hostname)) e.respondWith(libFetch(req));
});
self.addEventListener('message', async e => {
    const d = e.data || {}, port = e.ports && e.ports[0], reply = m => { if (port) port.postMessage(m); };
    if (ONLINE) { reply({ ver: VER, online: true, pages: 0, total: PAGES.length, libs: 0, libsTotal: CDN.length }); return; }
    if (d.t === 'has') { const l = await caches.open(LIB_CACHE), a = await caches.open(APP_CACHE), o = {}; for (const u of d.urls || []) o[u] = !!((await l.match(u, { ignoreVary: true })) || (await a.match(u, { ignoreSearch: true })) || (await caches.match(u, { ignoreSearch: true }))); reply({ has: o, ver: VER }); return; }
    if (d.t === 'status') { const a = await (await caches.open(APP_CACHE)).keys(), l = await (await caches.open(LIB_CACHE)).keys(); reply({ ver: VER, pages: a.length, total: PAGES.length, libs: l.length, libsTotal: CDN.length }); }
    else if (d.t === 'warm') { const c = await caches.open(LIB_CACHE); let ok = 0; for (const u of CDN) { try { if (!(await c.match(u))) { const r = await fetch(u, { mode: 'no-cors' }); await c.put(u, r); } ok++; } catch (er) { } } const a = await caches.open(APP_CACHE); for (const p of PAGES) { try { if (!(await a.match(new URL(p, location).href))) await a.add(p); } catch (er) { } } reply({ ok, total: CDN.length }); }
});
// ---------- 🔔 notifications de l'équipe (Web Push, application équipe) ----------
self.addEventListener('push', e => {
    let m = {}; try { m = e.data ? e.data.json() : {}; } catch (x) { m = { title: 'SUITE XIII', body: e.data ? e.data.text() : '' }; }
    const urg = m.lvl === 'urg';
    e.waitUntil((async () => {
        try { const c = await caches.open('xnotifs'); const r = await c.match('list'); const L = r ? await r.json() : []; L.unshift({ title: m.title, body: m.body, url: m.url, at: m.at || Date.now(), lvl: m.lvl }); await c.put('list', new Response(JSON.stringify(L.slice(0, 50)))); } catch (x) { }
        const cl = await self.clients.matchAll({ type: 'window', includeUncontrolled: true }); cl.forEach(c => c.postMessage({ t: 'xiii-push', m }));
        await self.registration.showNotification((urg ? '🚨 ' : '') + (m.title || 'SUITE XIII'), { body: (m.p ? m.p + ' · ' : '') + (m.body || ''), icon: 'xiii-icon-192.png', badge: 'xiii-icon-192.png', tag: m.tag || undefined, renotify: !!m.tag, requireInteraction: urg, vibrate: urg ? [300, 120, 300, 120, 500] : [200, 100, 200], data: { url: m.url || 'equipe.html' } });
    })());
});
self.addEventListener('notificationclick', e => {
    e.notification.close(); const url = new URL((e.notification.data && e.notification.data.url) || 'equipe.html', self.registration.scope).href;
    e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cl => { const w = cl.find(c => c.url.split('#')[0] === url.split('#')[0]) || cl.find(c => /equipe\.html/.test(c.url)); if (w) { w.focus(); return w.navigate ? w.navigate(url).catch(() => { }) : null; } return self.clients.openWindow(url); }));
});
