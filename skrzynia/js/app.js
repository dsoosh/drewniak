// Page wiring for the tool chest: form ↔ state, results, drawings, 3D, link and PDF.
import { build, defaultState } from './build.js';
import { viewSVG, boardSVG, partSketch, palette, fmt } from './draw.js';

const $ = (id) => document.getElementById(id);
const STORE = 'drewniak-skrzynia';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const n1 = (v) => fmt(v, 1);

// ---------------------------------------------------------------- state ↔ form

const NUM = { bL: ['boards', 'L'], bW: ['boards', 'W'], bT: ['boards', 'T'], bN: ['boards', 'N'], kerf: ['kerf'], trim: ['trim'],
  lockL: ['lock', 'L'], lockD: ['lock', 'D'], lockH: ['lock', 'H'], minInner: ['minInner'], clear: ['clear'], trayH: ['trayH'], load: ['load'] };
const TRAY = { tL: 'L', tW: 'W', tT: 'T', tN: 'N' };
let lastTrayBoards = defaultState().trayBoards;

function toForm(s) {
  for (const [id, path] of Object.entries(NUM)) { const v = path.reduce((o, k) => o?.[k], s); $(id).value = v ?? ''; }
  $('edgeGlue').checked = s.edgeGlue; $('goal').value = s.goal; $('trays').value = String(s.trays);
  $('handles').value = s.handles; $('finish').value = s.finish;
  $('trayOwn').checked = !!s.trayBoards;
  const tb = s.trayBoards || lastTrayBoards;
  for (const [id, k] of Object.entries(TRAY)) $(id).value = tb[k];
  syncTrayFields();
}
function fromForm() {
  const s = defaultState();
  const num = (id) => { const t = $(id).value.trim().replace(',', '.'); return t === '' ? null : Number(t); };
  for (const [id, path] of Object.entries(NUM)) {
    const v = num(id);
    if (path.length === 1) s[path[0]] = v; else s[path[0]][path[1]] = v;
  }
  for (const k of ['kerf', 'trim', 'minInner', 'trayH', 'load']) if (s[k] == null) s[k] = defaultState()[k];
  s.edgeGlue = $('edgeGlue').checked; s.goal = $('goal').value; s.trays = Number($('trays').value);
  s.handles = $('handles').value; s.finish = $('finish').value;
  const tb = Object.fromEntries(Object.entries(TRAY).map(([id, k]) => [k, num(id)]));
  lastTrayBoards = tb;
  s.trayBoards = $('trayOwn').checked ? tb : null;
  return s;
}
function syncTrayFields() {
  const on = $('trayOwn').checked && $('trays').value !== '0';
  document.querySelectorAll('[data-tray]').forEach((e) => { e.dataset.hidden = on ? '0' : '1'; });
  $('trayH').disabled = $('trays').value === '0';
}

const encode = (s) => btoa(unescape(encodeURIComponent(JSON.stringify(s)))).replace(/=+$/, '');
const decode = (t) => JSON.parse(decodeURIComponent(escape(atob(t))));
function merge(base, o) {
  for (const k of Object.keys(base)) if (k in o) {
    if (base[k] && typeof base[k] === 'object' && o[k] && typeof o[k] === 'object') merge(base[k], o[k]);
    else base[k] = o[k];
  }
  if ('trayBoards' in o) base.trayBoards = o.trayBoards;
  return base;
}
function initialState() {
  const h = location.hash.match(/s=([A-Za-z0-9+/]+)/);
  if (h) try { return merge(defaultState(), decode(h[1])); } catch (_) { /* fall through */ }
  try { const o = JSON.parse(localStorage.getItem(STORE) || 'null'); if (o) return merge(defaultState(), o); } catch (_) { /* no storage */ }
  return defaultState();
}

// ---------------------------------------------------------------- rendering

let view3d = null, res = null, state = null;
let tab = '3d';

function render() {
  state = fromForm();
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) { /* no storage */ }
  history.replaceState(null, '', `#s=${encode(state)}`);
  res = build(state);
  const errBox = $('errors');
  if (!res.ok) {
    $('results').hidden = true;
    const list = res.errors.length ? res.errors : res.tips;
    errBox.innerHTML = `<div class="alert"><b>${res.errors.length ? 'Popraw parametry' : 'Z tych desek nie wychodzi żadna skrzynia'}</b>${list.length ? `<ul>${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>`;
    $('headline').textContent = 'Z desek, które masz · wczepy proste · narzędzia ręczne';
    return;
  }
  errBox.innerHTML = '';
  $('results').hidden = false;
  const d = res.d, P = palette();
  $('headline').textContent = `${fmt(d.total.L)} × ${fmt(d.total.D)} × ${fmt(d.total.H)} mm · wnętrze ${fmt(d.inL)} × ${fmt(d.inD)} × ${fmt(d.inH)} mm`;
  const used = res.layout.chest.used, card = (q, unit, w, s, c) => `<div class="card" style="--c:${c || 'var(--accent)'}"><span class="q${String(q).length > 6 ? ' sm' : ''}">${q}<small>${unit}</small></span><span class="w">${w}</span><span class="s">${s}</span></div>`;
  $('order').innerHTML = [
    card(`${fmt(d.Lo)}×${fmt(d.Do)}×${fmt(d.H)}`, 'mm', 'Korpus', `z wiekiem i cokołem ${fmt(d.total.L)} × ${fmt(d.total.D)} × ${fmt(d.total.H)}`),
    card(used, `z ${state.boards.N}`, 'Deski skrzyni', `${state.boards.L}×${state.boards.W}×${state.boards.T} · ${res.rips} cięć wzdłuż`),
    res.layout.tray ? card(res.layout.tray.used, `z ${state.trayBoards.N}`, 'Deski na tace', `${state.trayBoards.L}×${state.trayBoards.W}×${state.trayBoards.T}`) : '',
    card(res.fingers.total, 'wczepów', `${res.fingers.corners} narożników`, `ok. ${Math.round(res.fingers.hours)} h trasowania i dopasowania`),
    card(n1(res.mass), 'kg', 'Masa pustej skrzyni', 'sosna, 500 kg/m³'),
    card(res.difficulty.level, '/ 5', 'Trudność', res.difficulty.techniques[0][0]),
  ].join('');
  $('facts').innerHTML = [
    ['Wczepy korpusu', `${d.n} × ${n1(d.w)} mm`], ['Cokół', `${n1(d.skirt.h)} mm, ${d.skirt.n} wczepy`], ['Fartuch wieka', `${n1(d.apron.h)} mm`],
    ['Uchwyty', `${n1(d.handle.bot)}–${n1(d.handle.top)} mm`], ['Wieko', `${fmt(d.lid.len)} × ${fmt(d.lid.depth)} mm, ${d.lid.glued ? 'klejone' : 'na zakładkę'}`],
    d.trays.length ? ['Tace', `${d.trays.length} × ${state.trayH} mm, ${d.trayFl.n} wczepów`] : null,
    ['Pod tacami', `${fmt(d.free)} mm`],
  ].filter(Boolean).map(([k, v]) => `<span>${k}: <b>${esc(v)}</b></span>`).join('');
  $('alerts').innerHTML = res.warnings.map((w) => `<div class="alert">${esc(w)}</div>`).join('') + res.notes.map((w) => `<div class="alert note">${esc(w)}</div>`).join('');

  // drawings
  const fig = (title, svg) => `<figure><figcaption>${title}</figcaption>${svg}</figure>`;
  $('views').innerHTML = fig('Przód', viewSVG(res, 'front', P)) + fig('Bok', viewSVG(res, 'side', P)) + fig('Góra', viewSVG(res, 'top', P));
  $('sections').innerHTML = fig('Przekrój wzdłuż', viewSVG(res, 'secFront', P)) + fig('Przekrój w poprzek', viewSVG(res, 'secSide', P));
  const num = numbering(res.parts);
  const boardsHtml = (lay, stock, label) => lay.boards.map((b, i) => b.secs.length ? `<figure>${boardSVG(b, stock, state.kerf, state.trim, (p) => num.get(p.key), P)}<figcaption>${label} ${i + 1}: ${cutOrder(b)}</figcaption></figure>` : '').join('');
  $('boards').innerHTML = boardsHtml(res.layout.chest, state.boards, 'Deska') + (res.layout.tray ? `<h3>Deski na tace</h3>${boardsHtml(res.layout.tray, state.trayBoards, 'Deska na tace')}` : '');

  // tables
  $('cutlist').innerHTML = table(['Nr', 'Element', 'Szt.', 'Długość', 'Szerokość', 'Grubość', 'Szkic', 'Uwagi'],
    res.parts.map((p) => [num.get(p.key), esc(p.name) + (p.show ? ' <small>(lico)</small>' : ''), p.qty, n1(p.l), n1(p.w) + (p.final && p.final !== p.w ? ` → ${n1(p.final)}` : ''), p.t, partSketch(p, P), esc([p.note, p.rip ? 'cięcie wzdłuż' : ''].filter(Boolean).join('; '))]), [2, 3, 4, 5], 6);
  $('fasteners').innerHTML = table(['Połączenie', 'Łącznik', 'Rozmiar', 'Szt.', 'Jak'], res.fasteners.map((f) => [esc(f.joint), esc(f.item), esc(f.size), f.qty, esc(f.note)]), [3]);
  $('hardware').innerHTML = table(['Okucie i materiał', 'Rozmiar', 'Szt.', 'Uwagi'], res.hardware.map((h) => [esc(h.item), esc(h.size), h.qty, esc(h.note)]), [2]);
  $('checks').innerHTML = table(['Kontrola', 'Wynik', 'Granica', '', 'Założenia'], res.checks.map((c) => [esc(c.name), `${n1(c.value)} ${c.unit}`, `${n1(c.limit)} ${c.unit}`, c.ok ? '<span class="ok">OK</span>' : '<span class="bad">za dużo</span>', esc(c.detail + (c.hint ? ` — ${c.hint}` : ''))]), [1, 2]);
  $('plan').innerHTML = res.plan.map(([t, x]) => `<li><b>${esc(t)}.</b> ${esc(x)}</li>`).join('');
  $('tools').innerHTML = res.tools.map((t) => `<li>${esc(t)}</li>`).join('');
  $('difficulty').innerHTML = `<p class="level">${res.difficulty.level} / 5</p><ul>${res.difficulty.techniques.map(([t, l]) => `<li>${esc(t)} — ${l}</li>`).join('')}</ul>`;
  draw3d();
}

function numbering(ps) { const m = new Map(); ps.forEach((p, i) => m.set(p.key, i + 1)); return m; }

function cutOrder(b) {
  const secs = b.secs.map((s, i) => `${String.fromCharCode(65 + i)} ${fmt(s.len)}`);
  const rips = b.secs.reduce((a, s) => a + s.strips.length - 1, 0);
  return `w poprzek na odcinki ${secs.join(', ')}; potem wzdłuż na pasy${rips ? ` (${rips} cięć między pasami)` : ''}; potem pasy w poprzek.`;
}

function table(head, rows, numCols = [], skCol = -1) {
  return `<table><thead><tr>${head.map((h, i) => `<th${numCols.includes(i) ? ' class="n"' : ''}>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${numCols.includes(i) ? ' class="n"' : i === skCol ? ' class="sk"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

async function draw3d() {
  if (tab !== '3d' || !res?.ok) return;
  if (!view3d) {
    try { const { ChestView } = await import('./view3d.js'); view3d = new ChestView($('viewer')); }
    catch (e) { $('viewer').innerHTML = `<p class="hint">Model 3D się nie wczytał: ${esc(e.message)}</p>`; return; }
  }
  view3d.update(res, getComputedStyle(document.documentElement).getPropertyValue('--panel').trim());
}

// ---------------------------------------------------------------- events

let timer = 0;
$('form').addEventListener('input', () => { syncTrayFields(); clearTimeout(timer); timer = setTimeout(render, 150); });
$('form').addEventListener('submit', (e) => e.preventDefault());
document.querySelectorAll('[role="tab"]').forEach((b) => b.addEventListener('click', () => {
  tab = b.dataset.tab;
  document.querySelectorAll('[role="tab"]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  document.querySelectorAll('.pane').forEach((p) => { p.hidden = p.dataset.pane !== tab; });
  draw3d();
}));
$('lidAngle').addEventListener('input', (e) => view3d?.setLid(Number(e.target.value)));
$('btnReset').addEventListener('click', () => { toForm(defaultState()); render(); });
$('btnLink').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); toast('Link skopiowany'); } catch (_) { toast('Skopiuj adres z paska przeglądarki'); }
});
$('btnPdf').addEventListener('click', async () => {
  if (!res?.ok) return;
  const btn = $('btnPdf'); btn.disabled = true; btn.textContent = 'Składam PDF…';
  try {
    const img = view3d && tab === '3d' ? view3d.snapshot() : null;
    const { makePdf } = await import('./pdf.js');
    await makePdf(res, state, img);
  } catch (e) { toast(`PDF się nie udał: ${e.message}`); console.error(e); }
  btn.disabled = false; btn.textContent = 'Pobierz PDF';
});
function toast(t) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 2500); }

toForm(initialState());
render();
window.__skrzynia = () => ({ state, res });
