// =====================================================================
//  SUITE XIII — 🔌 connecteur MCP pour Claude et ChatGPT (fonction Supabase « xiii-mcp »)
//  Le connecteur relie Claude.ai / ChatGPT au Drive d'équipe XIII de l'utilisateur (script Google « SUITE XIII »).
//  Aucune donnée n'est stockée ici : chaque appel est relayé vers le script Drive avec la clé contenue dans l'adresse
//  du connecteur (lien personnel créé dans XIII, droits de lecture ou d'écriture choisis par le Master).
//  Adresse : https://<projet>.supabase.co/functions/v1/xiii-mcp/k/<clé>   (clé = base64url de {"u": script, "t": jeton})
//  Protocole : MCP « Streamable HTTP » (JSON-RPC 2.0, réponses JSON).
// =====================================================================
const VERSION = '1.0.0';
const TOOLS_MAP = {
  backupo: ['backupoXIII.project', 'Déchargement des rushes'], callsheeto: ['callsheetoXIII.project', 'Feuilles de service (journées, horaires, lieux, équipe, déroulé, sécurité)'],
  casto: ['castoXIII.project', 'Casting (talents, rôles, statuts)'], conduco: ['conducoXIII.project', 'Conducteurs d’émission'], decoup: ['decoupXIII.project', 'Découpage, dépouillement du scénario, plan de travail'],
  deviso: ['devisoXIII.project', 'Devis et budget (versions, matériel, équipe, frais, factures)'], graphico: ['graphicoXIII.project', 'Habillage graphique'], lumo: ['lumoXIII.project', 'Plans de feu'],
  moodo: ['moodoXIII.project', 'Moodboards'], packingo: ['packingoXIII.project', 'Colisage (caisses et contenu)'], planno: ['plannoXIII.project', 'Planning (tâches par phase)'],
  plano: ['planoXIII.project', 'Plans d’implantation'], posto: ['postoXIII.project', 'Post-production (versions, retours)'], repero: ['reperoXIII.project', 'Repérages (lieux, photos, contraintes)'],
  ressourco: ['ressourcoXIII.project', 'Contrats, autorisations, droits, paie'], runo: ['runoXIII.project', 'Déroulés live'], scripto: ['scriptoXIII.project', 'Script et rapports de tournage'],
  sono: ['sonoXIII.project', 'Son (patch, HF)'], soustitro: ['soustitroXIII.project', 'Sous-titres'], storyboardo: ['storyboardoXIII.project', 'Storyboards'], syno: ['synoptique_projects', 'Synoptiques'],
  transporto: ['transportoXIII.project', 'Transports et logistique'], catalogue: ['xiii.catalogue', 'Catalogue matériel commun'], matos: ['matosXIII.parc', 'Parc matériel, réservations, matériel des projets'],
};
const SCRIPT = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/exec$/;
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization, mcp-session-id, mcp-protocol-version', 'access-control-allow-methods': 'POST, GET, OPTIONS', 'access-control-expose-headers': 'mcp-session-id' };
const json = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: Object.assign({ 'content-type': 'application/json' }, CORS, h) });

function decodeKey(k) {
  try { const b = k.replace(/-/g, '+').replace(/_/g, '/'); const s = new TextDecoder().decode(Uint8Array.from(atob(b + '==='.slice((b.length + 3) % 4)), c => c.charCodeAt(0)));
    const o = JSON.parse(s); if (!o || !SCRIPT.test(String(o.u || '')) || !(o.t || o.c)) return null; return { u: String(o.u), t: o.t ? String(o.t).slice(0, 200) : '', c: o.c ? String(o.c).slice(0, 200) : '', n: String(o.n || 'Claude').slice(0, 40) };
  } catch (e) { return null; }
}
async function drive(K, body) {
  const auth = K.t ? { tok: K.t } : { code: K.c };
  const r = await fetch(K.u, { method: 'POST', redirect: 'follow', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({}, body, auth, { by: '🤖 ' + K.n + ' (connecteur XIII)' })) });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { throw new Error('Réponse illisible du Drive XIII (le script est-il bien déployé et à jour ?)'); }
  if (!j.ok) { const E = { code: 'lien refusé (jeton expiré ou révoqué : recréez le lien du connecteur dans XIII)', forbidden: 'outil non autorisé pour ce lien', readonly: 'ce lien est en lecture seule', admin: 'réservé au Master', conflict: 'conflit de version', busy: 'Drive occupé, réessayez' }; const e = new Error(E[j.err] || ('Drive XIII : ' + (j.err || 'erreur'))); e.x = j; throw e; }
  return j;
}
// JSON pointer (« /days/0/schedule »)
const seg = p => String(p || '').split('/').slice(1).map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'));
function at(o, p) { let c = o; for (const k of seg(p)) { if (c == null) return undefined; c = c[Array.isArray(c) ? +k : k]; } return c; }
function setAt(o, p, v, mode) {
  const S = seg(p); if (!S.length) { if (mode === 'merge' && v && typeof v === 'object' && !Array.isArray(v)) return Object.assign(o || {}, v); return v; }
  let c = o; for (let i = 0; i < S.length - 1; i++) { const k = Array.isArray(c) ? +S[i] : S[i]; if (c[k] == null || typeof c[k] !== 'object') c[k] = /^\d+$/.test(S[i + 1]) ? [] : {}; c = c[k]; }
  const k = Array.isArray(c) ? (S[S.length - 1] === '-' ? c.length : +S[S.length - 1]) : S[S.length - 1];
  if (mode === 'append') { if (!Array.isArray(c[k])) throw new Error('« append » demande un tableau à cette adresse'); (Array.isArray(v) ? v : [v]).forEach(x => c[k].push(x)); }
  else if (mode === 'merge') { if (!c[k] || typeof c[k] !== 'object' || Array.isArray(c[k]) || typeof v !== 'object') throw new Error('« merge » demande un objet à cette adresse'); Object.assign(c[k], v); }
  else if (mode === 'delete') { if (Array.isArray(c)) c.splice(k, 1); else delete c[k]; }
  else c[k] = v;
  return o;
}
function outline(v, d = 0) { // aperçu de la structure : clés, tailles des tableaux
  if (Array.isArray(v)) return '[' + v.length + ' élément(s)' + (v.length && d < 2 ? ' ' + outline(v[0], d + 1) : '') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).slice(0, 25).map(k => k + (d < 2 ? ': ' + outline(v[k], d + 1) : '')).join(', ') + '}';
  return typeof v;
}
async function toolData(K, tool) {
  const m = TOOLS_MAP[tool]; if (!m) throw new Error('Outil inconnu : ' + tool + ' (outils : ' + Object.keys(TOOLS_MAP).join(', ') + ')');
  const j = await drive(K, { a: 'get', app: tool }); if (!j.rev) return { rev: 0, raw: {}, key: m[0], obj: null };
  const raw = j.data || {}; let obj = null; try { obj = typeof raw[m[0]] === 'string' ? JSON.parse(raw[m[0]]) : raw[m[0]]; } catch (e) { obj = null; }
  return { rev: j.rev, ts: j.ts, by: j.by, raw, key: m[0], obj };
}
const TOOLS = [
  { name: 'xiii_status', description: 'État du projet SUITE XIII relié : nom, outils disponibles avec leur date de dernière modification, droits du lien (lecture ou écriture). À appeler en premier.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'xiii_read', description: 'Lit les données d’un outil XIII (JSON). Sans « path » : structure + données (tronquées si très longues). Avec « path » (pointeur JSON, ex. « /days/0/schedule ») : seulement cette partie.', inputSchema: { type: 'object', properties: { tool: { type: 'string', enum: Object.keys(TOOLS_MAP) }, path: { type: 'string', description: 'Pointeur JSON, ex. /versions/0/eq' }, max_chars: { type: 'number', description: 'Taille maximale de la réponse (défaut 60000)' } }, required: ['tool'], additionalProperties: false } },
  { name: 'xiii_update', description: 'Modifie les données d’un outil XIII (lien en écriture seulement). Lisez d’abord avec xiii_read. mode : set (remplace la valeur à « path »), append (ajoute au tableau), merge (fusionne dans l’objet), delete (supprime). Les ouvertures de l’outil chez l’équipe reçoivent la modification par le Drive. Demandez toujours confirmation à l’utilisateur avant d’écrire.', inputSchema: { type: 'object', properties: { tool: { type: 'string', enum: Object.keys(TOOLS_MAP) }, path: { type: 'string', description: 'Pointeur JSON de la valeur à modifier, ex. /days/0/schedule' }, mode: { type: 'string', enum: ['set', 'append', 'merge', 'delete'] }, value: { description: 'Nouvelle valeur (JSON)' }, summary: { type: 'string', description: 'Résumé de la modification pour le journal de l’équipe' } }, required: ['tool', 'path', 'mode'], additionalProperties: false } },
];
async function call(K, name, a) {
  a = a || {};
  if (name === 'xiii_status') {
    const j = await drive(K, { a: 'ping' }), apps = j.apps || {}, me = j.me || {};
    const L = Object.keys(TOOLS_MAP).filter(t => apps[t]).map(t => '- ' + t + ' — ' + TOOLS_MAP[t][1] + ' · rév. ' + (apps[t].rev || apps[t]) + (apps[t].ts ? ' · modifié le ' + new Date(apps[t].ts).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : '') + (apps[t].by ? ' par ' + apps[t].by : ''));
    return 'Projet XIII : ' + (j.name || '?') + '\nDroits du lien : ' + (me.droit === 'edit' || !me.droit && K.c ? 'lecture et écriture' : me.droit === 'comment' ? 'commentaires' : 'lecture seule') + (me.nom ? ' (' + me.nom + ')' : '') + '\nOutils présents sur le Drive :\n' + (L.join('\n') || '(aucun outil synchronisé pour l’instant)') + '\nAutres outils possibles : ' + Object.keys(TOOLS_MAP).filter(t => !apps[t]).join(', ');
  }
  if (name === 'xiii_read') {
    const D = await toolData(K, a.tool); if (!D.rev) return 'L’outil ' + a.tool + ' n’a encore rien sur le Drive de l’équipe.';
    if (D.obj == null) return 'Données de ' + a.tool + ' présentes mais illisibles (format compressé ou fichiers).';
    const v = a.path ? at(D.obj, a.path) : D.obj, max = Math.max(2000, Math.min(200000, +a.max_chars || 60000));
    let s = JSON.stringify(v); const cut = s.length > max; if (cut) s = s.slice(0, max);
    return (a.path ? '' : 'Structure : ' + outline(D.obj) + '\n') + 'Révision ' + D.rev + (D.by ? ' (dernière modification par ' + D.by + ')' : '') + '\n' + s + (cut ? '\n… (tronqué : lisez une partie avec « path »)' : '');
  }
  if (name === 'xiii_update') {
    if (!a.path || !String(a.path).startsWith('/')) throw new Error('« path » doit être un pointeur JSON commençant par « / »');
    for (let essai = 0; essai < 2; essai++) {
      const D = await toolData(K, a.tool); if (!D.rev || D.obj == null) throw new Error('Rien à modifier : ouvrez d’abord ' + a.tool + ' dans XIII (relié au Drive) pour créer ses données.');
      const before = JSON.stringify(at(D.obj, a.path) ?? null).slice(0, 300);
      const obj = setAt(D.obj, a.path, a.value, a.mode), data = Object.assign({}, D.raw, { [D.key]: JSON.stringify(obj) });
      try { const r = await drive(K, { a: 'put', app: a.tool, base: D.rev, data, sum: String(a.summary || ('🤖 ' + a.mode + ' ' + a.path)).slice(0, 200) }); return '✅ ' + a.tool + ' modifié (révision ' + (r.rev || D.rev + 1) + ').\nAvant : ' + before + '\nL’équipe reçoit la modification à la prochaine synchronisation de l’outil.'; }
      catch (e) { if (e.x && e.x.err === 'conflict' && essai === 0) continue; throw e; }
    }
  }
  throw new Error('Outil MCP inconnu : ' + name);
}
async function rpc(K, m) {
  const id = m.id, ok = r => ({ jsonrpc: '2.0', id, result: r }), ko = (c, msg) => ({ jsonrpc: '2.0', id, error: { code: c, message: msg } });
  if (m.method === 'initialize') return ok({ protocolVersion: (m.params && m.params.protocolVersion) || '2025-06-18', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'SUITE XIII', version: VERSION }, instructions: 'Connecteur du projet SUITE XIII (outils de production audiovisuelle). Appelez xiii_status, puis xiii_read pour lire un outil. Pour écrire (xiii_update), lisez d’abord, montrez la modification à l’utilisateur et attendez son accord. Réponses en français.' });
  if (m.method === 'ping') return ok({});
  if (m.method === 'tools/list') return ok({ tools: TOOLS });
  if (m.method === 'tools/call') { try { const t = await call(K, m.params && m.params.name, m.params && m.params.arguments); return ok({ content: [{ type: 'text', text: t }] }); } catch (e) { return ok({ content: [{ type: 'text', text: '⚠️ ' + (e && e.message || e) }], isError: true }); } }
  if (m.method === 'resources/list') return ok({ resources: [] }); if (m.method === 'prompts/list') return ok({ prompts: [] });
  return ko(-32601, 'Méthode inconnue : ' + m.method);
}
export async function handle(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  const u = new URL(req.url), mk = /\/k\/([A-Za-z0-9_-]{20,})\/?$/.exec(u.pathname);
  if (req.method === 'GET') return mk ? json({ error: 'Utilisez POST (MCP Streamable HTTP)' }, 405, { allow: 'POST' }) : new Response('SUITE XIII — connecteur MCP. Créez votre adresse personnelle dans XIII : volet ✨ IA › 🔌.', { status: 200, headers: Object.assign({ 'content-type': 'text/plain; charset=utf-8' }, CORS) });
  if (req.method !== 'POST') return json({ error: 'méthode' }, 405);
  const K = mk && decodeKey(mk[1]); if (!K) return json({ jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Adresse de connecteur invalide : recréez-la dans XIII.' } }, 401);
  let body; try { body = await req.json(); } catch (e) { return json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON invalide' } }, 400); }
  const L = Array.isArray(body) ? body : [body], out = [];
  for (const m of L) { if (!m || m.jsonrpc !== '2.0' || !m.method) continue; if (m.id === undefined || m.id === null) continue; /* notifications */ out.push(await rpc(K, m)); }
  if (!out.length) return new Response(null, { status: 202, headers: CORS });
  return json(Array.isArray(body) ? out : out[0]);
}
// @ts-ignore Deno
if (typeof Deno !== 'undefined') Deno.serve(handle);
