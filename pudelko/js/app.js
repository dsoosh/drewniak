// Page wiring for the practice box: form ↔ state, results, drawings, 3D, link and PDF.
import { build, defaultState, LIDS } from './build.js';
import { viewSVG, templateSVG, boardSVG, partSketch, palette, fmt } from './draw.js';

const $ = (id) => document.getElementById(id);
const STORE = 'drewniak-pudelko';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const n1 = (v) => fmt(v, 1);

const NUM = { bL: ['boards', 'L'], bW: ['boards', 'W'], bT: ['boards', 'T'], bN: ['boards', 'N'], kerf: ['kerf'], trim: ['trim'], sawKerf: ['sawKerf'],
  lockL: ['lock', 'L'], lockD: ['lock', 'D'], lockH: ['lock', 'H'] };

function toForm(s) {
  for (const [id, path] of Object.entries(NUM)) { const v = path.reduce((o, k) => o?.[k], s); $(id).value = v ?? ''; }
  $('lid').value = s.lid; $('goal').value = s.goal; $('wood').value = s.wood;
  syncFields();
}
function fromForm() {
  const s = defaultState();
  const num = (id) => { const t = $(id).value.trim().replace(',', '.'); return t === '' ? null : Number(t); };
  for (const [id, path] of Object.entries(NUM)) { const v = num(id); if (path.length === 1) s[path[0]] = v ?? defaultState()[path[0]]; else s[path[0]][path[1]] = v; }
  s.lid = $('lid').value; s.goal = $('goal').value; s.wood = $('wood').value;
  return s;
}
function syncFields() { $('sawKerf').disabled = $('lid').value !== 'hinged'; }

const encode = (s) => btoa(unescape(encodeURIComponent(JSON.stringify(s)))).replace(/=+$/, '');
const decode = (t) => JSON.parse(decodeURIComponent(escape(atob(t))));
function merge(base, o) {
  for (const k of Object.keys(base)) if (k in o) {
    if (base[k] && typeof base[k] === 'object' && o[k] && typeof o[k] === 'object') merge(base[k], o[k]); else base[k] = o[k];
  }
  return base;
}
function initialState() {
  const h = location.hash.match(/s=([A-Za-z0-9+/]+)/);
  if (h) try { return merge(defaultState(), decode(h[1])); } catch (_) { /* fall through */ }
  try { const o = JSON.parse(localStorage.getItem(STORE) || 'null'); if (o) return merge(defaultState(), o); } catch (_) { /* no storage */ }
  return defaultState();
}

let view3d = null, res = null, state = null, tab = '3d';

function table(head, rows, numCols = [], skCol = -1) {
  return `<table><thead><tr>${head.map((h, i) => `<th${numCols.includes(i) ? ' class="n"' : ''}>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${numCols.includes(i) ? ' class="n"' : i === skCol ? ' class="sk"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function render() {
  state = fromForm();
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) { /* no storage */ }
  history.replaceState(null, '', `#s=${encode(state)}`);
  res = build(state);
  if (!res.ok) {
    $('results').hidden = true;
    const list = res.errors.length ? res.errors : res.tips;
    $('errors').innerHTML = `<div class="alert"><b>${res.errors.length ? 'Popraw parametry' : 'Takie pudełko nie wychodzi'}</b>${list.length ? `<ul>${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>`;
    return;
  }
  $('errors').innerHTML = ''; $('results').hidden = false;
  const d = res.d, P = palette();
  $('headline').textContent = `${LIDS[d.lid]} · ${fmt(d.total.L)} × ${fmt(d.total.D)} × ${fmt(d.total.H)} mm · wnętrze ${fmt(d.inL)} × ${fmt(d.inD)} mm`;
  const card = (q, unit, w, s) => `<div class="card"><span class="q${String(q).length > 6 ? ' sm' : ''}">${q}<small>${unit}</small></span><span class="w">${w}</span><span class="s">${s}</span></div>`;
  $('order').innerHTML = [
    card(`${fmt(d.Lo)}×${fmt(d.Do)}×${fmt(d.H)}`, 'mm', 'Korpus', `z zamknięciem ${fmt(d.total.L)} × ${fmt(d.total.D)} × ${fmt(d.total.H)}`),
    card(res.fingers.total, 'wczepów', `${d.n} po ${n1(d.w)} mm na narożnik`, `ok. ${Math.round(res.fingers.hours)} h`),
    card(res.layout.used, `z ${state.boards.N}`, 'Deski', `${state.boards.L}×${state.boards.W}×${state.boards.T} · ${res.layout.rips} cięć wzdłuż`),
    card(res.difficulty.level, '/ 5', 'Trudność', LIDS[d.lid]),
  ].join('');
  const facts = [['Rowki', `${d.g} × ${n1(d.bottom.d)} mm`], ['Dno', `${n1(d.bottom.z0)}–${n1(d.bottom.z1)} mm nad stołem`], ['Luz płyt', `${n1(d.bottom.play)} mm`]];
  if (d.lid === 'lift') facts.push(['Obrzeże', `${n1(d.rim.h)} mm, 3 wczepy`]);
  if (d.lid === 'slide') facts.push(['Niski bok', `${n1(d.slide.low)} mm`]);
  if (d.lid === 'hinged') facts.push(['Trasowanie', `${n1(d.markH)} mm`], ['Cięcie', `${n1(d.hinged.cut)} mm, wieko ${n1(d.hinged.lidH)} mm`]);
  if (d.lid === 'flat') facts.push(['Wysięg', `${d.flat.over} mm`]);
  $('facts').innerHTML = facts.map(([k, v]) => `<span>${k}: <b>${esc(v)}</b></span>`).join('');
  $('alerts').innerHTML = res.warnings.map((w) => `<div class="alert">${esc(w)}</div>`).join('') + res.notes.map((w) => `<div class="alert note">${esc(w)}</div>`).join('');
  const fig = (t, svg) => `<figure><figcaption>${t}</figcaption>${svg}</figure>`;
  $('views').innerHTML = fig('Przód', viewSVG(res, 'front', P)) + fig('Bok', viewSVG(res, 'side', P)) + fig('Góra', viewSVG(res, 'top', P));
  $('tpl').innerHTML = res.templates.map((t) => fig(t.name, templateSVG(t, d.T, P))).join('');
  const num = new Map(res.parts.map((p, i) => [p.key, i + 1]));
  const label = (p) => (p.wallStrip ? '1–4' : num.get(p.key));
  $('boards').innerHTML = res.layout.boards.map((b, i) => (b.secs.length ? `<figure>${boardSVG(b, state.boards, state.kerf, state.trim, label, P)}<figcaption>Deska ${i + 1}: odcinki ${b.secs.map((s, k) => `${String.fromCharCode(65 + k)} ${fmt(s.len)}`).join(', ')}</figcaption></figure>` : '')).join('');
  $('cutlist').innerHTML = table(['Nr', 'Element', 'Szt.', 'Długość', 'Szerokość', 'Grubość', 'Szkic', 'Uwagi'],
    res.parts.map((p, i) => [i + 1, esc(p.name) + (p.show ? ' <small>(lico)</small>' : ''), p.qty, n1(p.l), n1(p.w) + (p.final && p.final !== p.w ? ` → ${n1(p.final)}` : ''), n1(p.t), partSketch(p, P), esc([p.note, p.rip ? 'cięcie wzdłuż' : ''].filter(Boolean).join('; '))]), [2, 3, 4, 5], 6);
  $('hardware').innerHTML = table(['Materiał', 'Rozmiar', 'Szt.', 'Uwagi'], res.hardware.map((h) => [esc(h.item), esc(h.size), h.qty, esc(h.note)]), [2]);
  $('checks').innerHTML = table(['Kontrola', 'Wynik', 'Granica', '', 'Założenia'], res.checks.map((c) => [esc(c.name), `${n1(c.value)} mm`, `${n1(c.limit)} mm`, c.ok ? '<span class="ok">OK</span>' : '<span class="bad">za dużo</span>', esc(c.detail + (c.hint ? ` — ${c.hint}` : ''))]), [1, 2]);
  $('plan').innerHTML = res.plan.map(([t, x]) => `<li><b>${esc(t)}.</b> ${esc(x)}</li>`).join('');
  $('tools').innerHTML = res.tools.map((t) => `<li>${esc(t)}</li>`).join('');
  $('difficulty').innerHTML = `<p class="level">${res.difficulty.level} / 5</p><ul>${res.difficulty.techniques.map(([t, l]) => `<li>${esc(t)} — ${l}</li>`).join('')}</ul>`;
  draw3d();
}

async function draw3d() {
  if (tab !== '3d' || !res?.ok) return;
  if (!view3d) {
    try { const { BoxView } = await import('./view3d.js'); view3d = new BoxView($('viewer')); }
    catch (e) { $('viewer').innerHTML = `<p class="hint">Model 3D się nie wczytał: ${esc(e.message)}</p>`; return; }
  }
  view3d.open = Number($('openAmt').value) / 100;
  view3d.update(res, getComputedStyle(document.documentElement).getPropertyValue('--panel').trim());
}

let timer = 0;
$('form').addEventListener('input', () => { syncFields(); clearTimeout(timer); timer = setTimeout(render, 150); });
$('form').addEventListener('submit', (e) => e.preventDefault());
document.querySelectorAll('[role="tab"]').forEach((b) => b.addEventListener('click', () => {
  tab = b.dataset.tab;
  document.querySelectorAll('[role="tab"]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  document.querySelectorAll('.pane').forEach((p) => { p.hidden = p.dataset.pane !== tab; });
  draw3d();
}));
$('openAmt').addEventListener('input', (e) => view3d?.setOpen(Number(e.target.value) / 100));
$('btnReset').addEventListener('click', () => { toForm(defaultState()); render(); });
$('btnLink').addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); toast('Link skopiowany'); } catch (_) { toast('Skopiuj adres z paska przeglądarki'); } });
$('btnPdf').addEventListener('click', async () => {
  if (!res?.ok) return;
  const btn = $('btnPdf'); btn.disabled = true; btn.textContent = 'Składam PDF…';
  try { const img = view3d && tab === '3d' ? view3d.snapshot() : null; const { makePdf } = await import('./pdf.js'); await makePdf(res, state, img); }
  catch (e) { toast(`PDF się nie udał: ${e.message}`); console.error(e); }
  btn.disabled = false; btn.textContent = 'Pobierz PDF';
});
function toast(t) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 2500); }

toForm(initialState());
render();
window.__pudelko = () => ({ state, res });
