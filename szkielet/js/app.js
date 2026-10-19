// Page controller: form, tabs, editing on drawings, results, saving and sharing.
import { defaultState, normalize, encodeState, decodeState, WALL_IDS, WALL_NAMES, OPENING_NAMES, SECTIONS, uid, osbPrice, ANCHOR_RANGE, LIMITS } from './model.js';
import { EXAMPLES } from './examples.js';
const halves = (n) => (n === 1 ? 'połówkę' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'połówki' : 'połówek');
import { build } from './build.js';
import { report, facts } from './report.js';
import { elevationSVG, planSVG, roofSVG, palette } from './draw.js';

const $ = (id) => document.getElementById(id);
const STORE = 'drewniak.szkielet.v1';
const R = Math.round;
const fmt = (n) => R(n).toLocaleString('pl-PL').replace(/ /g, ' ');

let state = loadInitial();
let res = null, rep = null, view3d = null;
const ui = { tab: '3d', wall: 'front', selOp: null, selPart: null, showSheets: true, inside: false };
const T2 = 22.5;   // half the stud thickness

// ---------- form ----------

const FIELDS = [
  ['Wymiary', [
    ['dims.L', 'Długość (przód, tył)', 'num', { step: 1, min: 1000 }],
    ['dims.W', 'Szerokość (boki)', 'num', { step: 1, min: 1000 }],
    ['walls.h0', 'Wysokość ściany niższej', 'num', { step: 5, note: 'szkielet od podłogi do wierzchu oczepu' }],
  ]],
  ['Dach', [
    ['roof.type', 'Rodzaj', 'sel', { options: [['mono', 'jednospadowy'], ['gable', 'dwuspadowy']] }],
    ['roof.highSide', 'Wyżej jest', 'sel', { options: [['back', 'tył'], ['front', 'przód']], show: (s) => s.roof.type === 'mono' }],
    ['roof.pitch', 'Spadek [°]', 'num', { step: 0.1 }],
    ['roof.ovhEave', 'Okap od spadku', 'num', { step: 10 }],
    ['roof.ovhGable', 'Okap od szczytu', 'num', { step: 10 }],
    ['roof.rafterMax', 'Krokwie – maks. rozstaw', 'num', { step: 5 }],
    ['roof.battenMax', 'Łaty – maks. rozstaw', 'num', { step: 5 }],
    ['roof.ties', 'Ściągi krokwi na oczepach', 'chk', { show: (s) => s.roof.type === 'gable' }],
    ['roof.splice', 'Łączenie krokwi i legarów poddasza', 'sel', { options: [['scab', 'nakładki z kantówki'], ['lap', 'na zakład (ściągi; krokwie nakładkami)'], ['plate', 'płytki kolczaste'], ['none', 'bez łączenia']], note: 'nad ścianą nośną (ściąg bez niej – w połowie), gdy zmniejsza to odpad albo element jest za długi' }],
  ]],
  ['Ściany', [
    ['walls.studMax', 'Rozstaw słupków', 'sel', { options: [[625, '625 (½ płyty)'], [416.6667, '417 (⅓ płyty)'], [312.5, '312,5 (¼ płyty)']], num: true }],
    ['walls.nogStep', 'Rygle co', 'num', { step: 10 }],
    ['walls.nogStagger', 'Rygle na mijankę', 'chk'],
    ['walls.sheathe', 'Poszycie OSB z zewnątrz', 'chk'],
    ['walls.sheathT', 'Grubość OSB na ściany [mm]', 'sel', { options: [12, 15, 18, 22, 25, 30].map((t) => [t, String(t)]), num: true }],
    ['walls.sheathBelow', 'Płyta zachodzi na ramę', 'num', { step: 5, show: (s) => s.walls.sheathe }],
    ['walls.sheatheIn', 'Poszycie OSB od środka', 'chk'],
    ['walls.doubleFrom', 'Podwójne słupki przy otworach od', 'num', { step: 10, note: 'węższe otwory: jeden słupek z każdej strony (także słupek z siatki), nadproże między nimi' }],
  ]],
  ['Rama i podłoga', [
    ['base.maxSpan', 'Belki poprzeczne – maks. rozstaw', 'num', { step: 10 }],
    ['base.anchorMax', 'Kotwy gruntowe – maks. rozstaw', 'num', { step: 50, note: 'kotwy pod belkami podłużnymi, ścianami nośnymi i w liniach pośrednich' }],
    ['floor.joistMax', 'Legary – maks. rozstaw', 'num', { step: 10 }],
    ['floor.sheetT', 'Płyta podłogi [mm]', 'sel', { options: [[18, '18'], [22, '22'], [25, '25'], [30, '30']], num: true }],
    ['floor.splitJoists', 'Łącz legary nad belką, gdy mniej odpadu', 'chk'],
  ]],
  ['Pokrycie', [
    ['roof.cover.name', 'Nazwa', 'txt'],
    ['roof.cover.len', 'Długość arkusza', 'num', { step: 1 }],
    ['roof.cover.wid', 'Szerokość arkusza', 'num', { step: 1 }],
    ['roof.cover.lapL', 'Zakład podłużny', 'num', { step: 5 }],
    ['roof.cover.lapW', 'Zakład boczny', 'num', { step: 1 }],
    ['roof.cover.nails', 'Gwoździe na arkusz', 'num', { step: 1 }],
  ]],
  ['Materiał i ceny', [
    ['stock.f45.len', 'Kantówka 45×95 – długość', 'num', { step: 100 }],
    ['stock.l50.len', 'Łata 50×50 – długość', 'num', { step: 100 }],
    ['stock.b100.len', 'Belka 100×100 – długość', 'num', { step: 100, note: 'skład tnie belki 13 m na pół – sprzedaje po 6,5 m' }],
    ['stock.f45.price', 'Cena 45×95 [zł/szt.]', 'num', { step: 0.01, opt: true }],
    ['stock.l50.price', 'Cena łaty [zł/szt.]', 'num', { step: 0.01, opt: true }],
    ['stock.b100.price', 'Cena 100×100 [zł/szt.]', 'num', { step: 0.01, opt: true }],
    ['stock.osbWall.price', 'Cena OSB ścian [zł/płyta]', 'num', { step: 0.01, opt: true, placeholder: (s) => `cennik: ${osbPrice(s.walls.sheathT)}` }],
    ['stock.osbFloor.price', 'Cena OSB podłogi [zł/płyta]', 'num', { step: 0.01, opt: true, placeholder: (s) => `cennik: ${osbPrice(s.floor.sheetT, true)}` }],
    ['stock.cover.price', 'Cena pokrycia [zł/arkusz]', 'num', { step: 0.01, opt: true }],
    ['stock.anchor.price', 'Cena kotwy gruntowej [zł]', 'num', { step: 1, opt: true, note: `w sklepach ${ANCHOR_RANGE[0]}–${ANCHOR_RANGE[1]} zł, widełki pokazane w kosztorysie` }],
  ]],
  ['Obciążenia do kontroli ugięć', [
    ['loads.floor', 'Podłoga [kN/m²]', 'num', { step: 0.1, note: '1,0 – schowek na narzędzia, przedsionek; 1,5–2,0 – pomieszczenie użytkowe. Sprawdzane jest tylko ugięcie.' }],
    ['loads.roof', 'Dach: śnieg + ciężar [kN/m²]', 'num', { step: 0.1, note: 'strefa 2: śnieg 0,8 × 0,9 = 0,72 + pokrycie i drewno' }],
  ]],
];

const get = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const set = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
const fid = (p) => `f-${p.replace(/\./g, '-')}`;

function renderForm() {
  const host = $('form');
  host.innerHTML = FIELDS.map(([legend, fields]) => `<fieldset><legend>${legend}</legend>${fields.map(([p, label, type, o = {}]) => {
    const id = fid(p);
    if (type === 'chk') return `<div class="chkrow" data-field="${p}"><input type="checkbox" id="${id}"><label for="${id}">${label}</label></div>`;
    const input = type === 'sel' ? `<select id="${id}">${o.options.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select>`
      : `<input id="${id}" type="${type === 'txt' ? 'text' : 'number'}" ${o.step ? `step="${o.step}"` : ''} ${LIMITS[p] ? `min="${LIMITS[p][0]}" max="${LIMITS[p][1]}"` : ''} inputmode="decimal">`;
    return `<label for="${id}" data-field="${p}" class="${type === 'txt' ? 'wide' : ''}">${label}</label><span data-field="${p}" class="${type === 'txt' ? 'wide' : ''}">${input}</span>${o.note ? `<p class="note" data-field="${p}">${o.note}</p>` : ''}`;
  }).join('')}</fieldset>`).join('');
  for (const [, fields] of FIELDS) for (const [p, , type, o = {}] of fields) {
    const el = $(fid(p));
    const apply = () => {
      let v = type === 'chk' ? el.checked : el.value;
      if (type === 'num') { if (v === '' && o.opt) v = ''; else { v = Number(String(v).replace(',', '.')); if (!Number.isFinite(v)) return; } }
      if (type === 'sel' && o.num) v = Number(v);
      if (get(state, p) === v) return;
      set(state, p, v);
      state = normalize(state);
      const got = get(state, p);
      if (type === 'num' && v !== '' && got !== v && LIMITS[p]) {
        const [lo, hi] = LIMITS[p];
        toast(v > hi ? `Najwięcej ${fmtLimit(p, hi)} – przyjęto ${fmtLimit(p, hi)}.` : `Najmniej ${fmtLimit(p, lo)} – przyjęto ${fmtLimit(p, lo)}.`);
        el.value = got;
      }
      changed();
    };
    if (type === 'txt' || type === 'num') typed(el, apply); else el.addEventListener('change', apply);
  }
  syncForm();
}

function syncForm() {
  for (const [, fields] of FIELDS) for (const [p, , type, o = {}] of fields) {
    const el = $(fid(p)), v = get(state, p);
    if (document.activeElement !== el) {
      if (type === 'chk') el.checked = !!v;
      else if (type === 'sel') el.value = String(v);
      else el.value = v ?? '';
    }
    if (o.placeholder) el.placeholder = o.placeholder(state);
    const hide = o.show && !o.show(state);
    document.querySelectorAll(`[data-field="${p}"]`).forEach((n) => (n.dataset.hidden = hide ? '1' : '0'));
  }
}

const fmtLimit = (p, v) => (/^(dims|walls\.h0|stock\.)/.test(p) && v >= 1000 ? `${String(v / 1000).replace('.', ',')} m` : String(v).replace('.', ','));

// Typing rebuilds after a pause or when the field is committed (Enter, leaving it), so typing
// "135" does not compute 1 and 13 first.
const TYPE_DELAY = 450;
function typed(el, apply) {
  let t = null, last = el.value;
  // the same raw text is applied once, even if the model clamped it (135 → 1000) in between
  const run = () => { clearTimeout(t); if (el.value === last) return; apply(); last = el.value; };
  el.addEventListener('focus', () => { last = el.value; });
  el.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, TYPE_DELAY); });
  el.addEventListener('change', run);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
}

// ---------- render ----------

let pending = null, heavyTimer = null;
// light: rebuild geometry and redraw only the active view (dragging); the summary, tables and
// layouts follow once things settle. full: everything on the next frame.
function changed(opts = {}) {
  save();
  markDirty();
  syncForm();
  const light = !!opts.light;
  if (pending === 'full') return;
  if (pending === null) requestAnimationFrame(() => {
    const mode = pending; pending = null;
    if (mode === 'light') { res = build(state); renderTab(); clearTimeout(heavyTimer); heavyTimer = setTimeout(render, 300); }
    else { clearTimeout(heavyTimer); render(); }
  });
  pending = light ? 'light' : 'full';
}

function render() {
  res = build(state);
  rep = report(res, state);
  const { L, W } = state.dims;
  $('headline').textContent = `${fmt(L)} × ${fmt(W)} mm · dach ${state.roof.type === 'mono' ? 'jednospadowy' : 'dwuspadowy'} ${String(state.roof.pitch).replace('.', ',')}°`;
  renderOrder();
  $('facts').innerHTML = facts(res, state).map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join('');
  const gaps = Object.values(res.walls).filter((d) => d.gap > 0).map((d) => `${d.name}: pas ${d.gap} mm pod oczepem bez płyty (szczelina wentylacyjna pod okapem).`);
  $('alerts').innerHTML = [...res.warnings.map((w) => `<div class="alert">${w}</div>`), ...res.checks.filter((c) => !c.ok).map((c) => `<div class="alert">${c.name}: ugięcie ${c.d.toFixed(1).replace('.', ',')} mm przy dopuszczalnych ${c.lim.toFixed(1).replace('.', ',')} – ${c.hint}.</div>`)].join('')
    + (gaps.length ? `<p class="hint-inline">${gaps.join(' ')}</p>` : '');
  renderTab();
  renderChecks();
  renderCutList();
  renderBars();
  renderSheets();
}

function renderOrder() {
  const cards = [];
  const col = { b100: 'var(--c-beam)', f45: 'var(--c-stud)', l50: 'var(--c-batten)' };
  for (const t of rep.timber) cards.push(card(t.count, 'szt.', `${t.name} × ${fmt(t.buyLen)}`, `${t.pieces} elementów, odpad ${(t.waste / 1000).toFixed(1).replace('.', ',')} m`, col[t.sec]));
  if (rep.wall) cards.push(card(rep.wall.count, 'płyt', `${rep.wall.name} na ściany`, `${rep.wall.area.toFixed(1).replace('.', ',')} m² po docięciu`, 'var(--c-sheet)'));
  if (rep.wallIn) cards.push(card(rep.wallIn.count, 'płyt', `${rep.wallIn.name} od środka i ścianki`, `${rep.wallIn.area.toFixed(1).replace('.', ',')} m² po docięciu`, 'var(--c-sheet)'));
  cards.push(card(rep.floor.count, 'płyt', rep.floor.name, `podłoga ${rep.floor.area.toFixed(1).replace('.', ',')} m²`, 'var(--c-floor)'));
  for (const c of rep.cover) cards.push(card(c.count, 'arkuszy', c.name, `${state.roof.cover.len}×${state.roof.cover.wid}`, c.clear ? 'var(--c-clear)' : 'var(--c-cover)'));
  for (const e of rep.extras) cards.push(card(e.qty, e.unit, e.name, '', 'var(--muted)'));
  $('order').innerHTML = cards.join('');
  const c = rep.cost;
  $('cost').innerHTML = `<h2>Koszt materiału: ok. ${fmt(c.total)} zł</h2>
<p class="hint-inline">Ceny orientacyjne (2026), do zmiany w „Materiał i ceny”. Z kotwami po ${ANCHOR_RANGE[0]}–${ANCHOR_RANGE[1]} zł: ${fmt(c.min)}–${fmt(c.max)} zł. Nie wliczone: ${c.excluded.join(', ')}.</p>
<div class="tw"><table><thead><tr><th>Pozycja</th><th class="n">Ilość</th><th class="n">Cena</th><th class="n">Razem</th><th class="n">Udział</th></tr></thead><tbody>${c.items.map((i) => `<tr><td>${i.name}</td><td class="n">${i.qty} ${i.unit}</td><td class="n">${fmt(i.price)} zł</td><td class="n">${fmt(i.sum)} zł</td><td class="n">${Math.round((i.sum / c.total) * 100)}%</td></tr>`).join('')}<tr class="grp"><td>Razem</td><td></td><td></td><td class="n">${fmt(c.total)} zł</td><td></td></tr></tbody></table></div>`;
}
const card = (q, unit, w, s, c) => `<div class="card" style="--c:${c}"><div class="q">${q}<small>${unit}</small></div><div class="w">${w}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;

function renderTab() {
  document.querySelectorAll('.tabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === ui.tab)));
  document.querySelectorAll('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== ui.tab));
  const P = palette();
  if (ui.tab === '3d') ensure3D().then((v) => { v.setBackground(P.bg); v.update(res, state); });
  if (ui.tab === 'plan') { $('planView').innerHTML = planSVG(res, state, { pal: P, interactive: true, selected: ui.selPart, preview: drag?.preview }); renderPartPanel(); }
  if (ui.tab === 'walls') {
    if (!res.walls[ui.wall]) ui.wall = 'front';
    $('wallChips').innerHTML = [...WALL_IDS.map((id) => [id, WALL_NAMES[id]]), ...state.partitions.map((p, i) => [p.id, res.walls[p.id]?.name || `Ścianka ${i + 1}`])]
      .map(([id, n]) => `<button data-wall="${id}" aria-pressed="${id === ui.wall}">${n}</button>`).join('');
    document.querySelectorAll('[data-face]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.face === 'in') === ui.inside)));
    $('wallView').innerHTML = elevationSVG(res, state, ui.wall, { pal: P, interactive: true, sheathing: ui.showSheets, selected: ui.selOp, inside: ui.inside });
    renderOpPanel();
  }
  if (ui.tab === 'roof') $('roofView').innerHTML = roofSVG(res, state, { pal: P, interactive: true });
}

let viewPromise = null;
function ensure3D() {
  if (!viewPromise) viewPromise = import('./view3d.js').then(({ View3D, LAYERS, PRESETS }) => {
    view3d = new View3D($('viewer'));
    $('layers').innerHTML = LAYERS.map(([k, n]) => `<label><input type="checkbox" data-layer="${k}" checked> ${n}</label>`).join('');
    const apply = (vis) => { view3d.setVisible(vis); document.querySelectorAll('[data-layer]').forEach((c) => (c.checked = view3d.vis[c.dataset.layer] !== false)); };
    $('layers').addEventListener('change', (e) => { const k = e.target.dataset.layer; if (k) { apply({ [k]: e.target.checked }); markPreset(null); } });
    $('presets').addEventListener('click', (e) => { const p = e.target.dataset.preset; if (p) { apply(PRESETS[p]); markPreset(p); } });
    const markPreset = (p) => document.querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === p)));
    return view3d;
  }).catch((err) => { $('viewer').innerHTML = `<p class="hint">Nie udało się uruchomić modelu 3D (${err.message}). Rysunki i zestawienia działają bez niego.</p>`; throw err; });
  return viewPromise;
}

// ---------- panels ----------

function wallOpenings(id) { return id in state.openings ? state.openings[id] : state.partitions.find((p) => p.id === id)?.openings; }

function renderOpPanel() {
  const list = wallOpenings(ui.wall) || [];
  const o = list.find((x) => x.id === ui.selOp);
  const panel = $('opPanel');
  const key = `${ui.wall}|${o?.id}|${o?.type}`;
  if (panel.dataset.key === key && panel.contains(document.activeElement)) return;
  panel.dataset.key = key;
  if (!o) { panel.hidden = false; panel.innerHTML = `<span class="hint-inline">${list.length ? 'Kliknij otwór, żeby go edytować. Przeciągaj go albo jego krawędzie.' : 'Ta ściana nie ma otworów. Dodaj drzwi, okno albo otwór przyciskiem wyżej.'}</span>`; return; }
  panel.hidden = false;
  panel.innerHTML = `<span class="title">${OPENING_NAMES[o.type]}</span>
<label>Rodzaj<select id="op-type">${Object.entries(OPENING_NAMES).map(([k, n]) => `<option value="${k}" ${k === o.type ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
<label>Od lewego narożnika<input id="op-U" type="number" step="10" value="${o.U}"></label>
<label>Szerokość otworu<input id="op-w" type="number" step="10" value="${o.w}"></label>
<label>Wysokość otworu<input id="op-h" type="number" step="10" value="${o.h}"></label>
${o.type === 'door' ? '' : `<label>Od podłogi<input id="op-sill" type="number" step="10" value="${o.sill}"></label>`}
<button class="danger" id="op-del">Usuń</button>`;
  const num = (id, k) => { const el = $(id); if (el) typed(el, () => { const v = Number(el.value); if (Number.isFinite(v) && o[k] !== v) { o[k] = v; state = normalize(state); changed(); } }); };
  num('op-U', 'U'); num('op-w', 'w'); num('op-h', 'h'); num('op-sill', 'sill');
  $('op-type').addEventListener('change', (e) => { o.type = e.target.value; if (o.type === 'door') o.sill = 0; else if (o.type === 'window' && o.sill === 0) o.sill = 900; changed(); });
  $('op-del').addEventListener('click', () => { list.splice(list.indexOf(o), 1); ui.selOp = null; changed(); });
}

function renderPartPanel() {
  const p = state.partitions.find((x) => x.id === ui.selPart), panel = $('partPanel');
  if (!p) { panel.hidden = true; panel.dataset.key = ''; return; }
  const i = state.partitions.indexOf(p);
  const hEff = R(res.info.parts.find((x) => x.id === p.id)?.h ?? p.h);
  const key = `${p.id}|${p.bearing}|${hEff}`;
  if (panel.dataset.key === key && panel.contains(document.activeElement)) return;
  panel.dataset.key = key;
  panel.hidden = false;
  panel.innerHTML = `<span class="title">${res.walls[p.id]?.name || `Ścianka ${i + 1}`} (${p.orient === 'x' ? 'wzdłuż długości' : 'w poprzek'})</span>
<label>Oś ${p.orient === 'x' ? 'od przodu' : 'od lewej'}<input id="pp-c" type="number" step="5" value="${R(p.c)}"></label>
<label>Od<input id="pp-a" type="number" step="5" value="${R(p.a)}"></label>
<label>Do<input id="pp-b" type="number" step="5" value="${R(p.b)}"></label>
<label>Wysokość${p.bearing ? ' (z dachu)' : ''}<input id="pp-h" type="number" step="5" value="${p.bearing ? hEff : p.h}" ${p.bearing ? 'disabled' : ''}></label>
${p.orient === 'x' ? `<label class="chk" style="flex-direction:row"><input id="pp-bear" type="checkbox" ${p.bearing ? 'checked' : ''}> nośna (pod krokwie)</label>` : ''}
<label>Poszycie OSB<select id="pp-sh">${[['none', 'brak'], ['a', p.orient === 'x' ? 'od przodu' : 'od lewej'], ['b', p.orient === 'x' ? 'od tyłu' : 'od prawej'], ['both', 'obie strony']].map(([v, t]) => `<option value="${v}" ${p.sheathe === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
<button id="pp-ops">Otwory w ściance</button>
<button class="danger" id="pp-del">Usuń</button>`;
  for (const k of ['c', 'a', 'b', 'h']) { const el = $(`pp-${k}`); typed(el, () => { const v = Number(el.value); if (Number.isFinite(v) && p[k] !== v) { p[k] = v; changed(); } }); }
  $('pp-bear')?.addEventListener('change', (e) => { p.bearing = e.target.checked; changed(); });
  $('pp-sh').addEventListener('change', (e) => { p.sheathe = e.target.value; changed(); });
  $('pp-ops').addEventListener('click', () => { ui.tab = 'walls'; ui.wall = p.id; ui.selOp = null; renderTab(); });
  $('pp-del').addEventListener('click', () => { state.partitions.splice(i, 1); ui.selPart = null; changed(); });
}

// ---------- results ----------

function renderChecks() {
  $('checks').innerHTML = `<h2>Kontrola ugięć</h2><div class="tw"><table><thead><tr><th>Element</th><th class="n">Rozpiętość</th><th class="n">Ugięcie</th><th class="n">Dopuszczalne</th><th></th></tr></thead><tbody>${res.checks.map((c) => `<tr><td>${c.name}</td><td class="n">${fmt(c.span)}</td><td class="n">${c.d.toFixed(1).replace('.', ',')} mm</td><td class="n">${c.lim.toFixed(1).replace('.', ',')} mm</td><td class="${c.ok ? 'ok' : 'bad'}">${c.ok ? 'OK' : c.hint}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderCutList() {
  let rows = '', last = '';
  for (const g of rep.cuts) {
    if (g.sec !== last) { rows += `<tr class="grp"><td colspan="4">${SECTIONS[g.sec].name}</td></tr>`; last = g.sec; }
    rows += `<tr><td class="n">${g.count}×</td><td class="n">${fmt(g.len)}</td><td>${g.name}</td><td>${g.note}</td></tr>`;
  }
  $('cutlist').innerHTML = `<h2>Lista cięć</h2><div class="tw"><table><thead><tr><th class="n">Szt.</th><th class="n">Długość</th><th>Element</th><th>Uwagi</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

export function barSVG(bar, stock, P) {
  const h = 26, k = 1000 / stock;
  let s = `<svg viewBox="0 0 1000 ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="1000" height="${h}" fill="${P.line}"/>`;
  for (const p of bar.pieces) {
    const w = p.len * k;
    s += `<rect x="${(p.x * k).toFixed(1)}" y="1" width="${w.toFixed(1)}" height="${h - 2}" fill="${P.stud}" stroke="${P.ink}" stroke-width="0.6"/>`;
    if (w > 34) s += `<text x="${((p.x + p.len / 2) * k).toFixed(1)}" y="${h / 2 + 4}" font-size="11" text-anchor="middle" fill="${P.ink}" font-family="${P.font}">${p.len}</text>`;
  }
  return s + '</svg>';
}

function renderBars() {
  const P = palette();
  $('bars').innerHTML = `<h2>Rozkrój drewna</h2>${rep.timber.map((t) => `<details ${t.sec === 'f45' ? '' : 'open'}><summary>${t.unit ? `${SECTIONS[t.sec].name}: ${t.beams} ${t.beams === 1 ? 'belka' : 'belki'} 13 m, kupujesz ${t.count} ${halves(t.count)} po ${fmt(t.unit)} mm` : `${t.name}: ${t.count} szt. po ${fmt(t.stock)} mm`}</summary><div class="block">${t.bars.map((b, i) => `<div class="barrow"><b>${i + 1}</b>${barSVG(b, t.stock, P)}<span class="barcap">${b.pieces.map((p) => p.len).join(' + ')} · zostaje ${fmt(b.waste)}${t.unit && b.units === 1 ? ' · z tej belki kupujesz połowę' : ''}</span></div>`).join('')}${t.tooLong.length ? `<div class="alert">Dłuższe niż materiał: ${t.tooLong.map((p) => `${p.label} ${p.len}`).join(', ')}</div>` : ''}</div></details>`).join('')}`;
}

export function sheetSVG(sh, st, P) {
  let s = `<svg viewBox="-10 -10 ${st.w + 20} ${st.h + 20}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${st.w}" height="${st.h}" fill="${P.line}" stroke="${P.ink}" stroke-width="4"/>`;
  for (const it of sh.items) {
    s += `<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="${P.sheet}" stroke="${P.ink}" stroke-width="5"/>`;
    const fs = Math.min(150, Math.max(60, Math.min(it.w, it.h) / 3));
    if (Math.min(it.w, it.h) > 120) s += `<text x="${it.x + it.w / 2}" y="${it.y + it.h / 2 + fs / 3}" font-size="${fs}" text-anchor="middle" fill="${P.ink}" font-family="${P.fontLabel}" font-weight="700">${it.label}</text>`;
  }
  return s + '</svg>';
}

function renderSheets() {
  const P = palette();
  const part = (pk, st, title) => pk ? `<h3>${title}: ${pk.count} × ${pk.name}</h3><div class="sheetgrid">${pk.sheets.map((sh, i) => `<figure>${sheetSVG(sh, st, P)}<figcaption>${i + 1}. ${sh.items.map((it) => `${it.label} ${R(it.w)}×${R(it.h)}`).join(', ')}</figcaption></figure>`).join('')}</div>` : '';
  $('sheets').innerHTML = `<h2>Rozkrój płyt</h2>${part(rep.wall, state.stock.osbWall, 'Ściany z zewnątrz')}${part(rep.wallIn, state.stock.osbWall, 'Od środka i ścianki')}${part(rep.floor, state.stock.osbFloor, 'Podłoga')}`;
}

// ---------- editing on drawings ----------

let drag = null;
const svgPt = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
const snap = (v, s = 10) => Math.round(v / s) * s;

function bindEditing() {
  document.querySelector('.tabs').addEventListener('click', (e) => { const t = e.target.dataset.tab; if (t) { ui.tab = t; renderTab(); } });
  $('wallChips').addEventListener('click', (e) => { const w = e.target.dataset.wall; if (w) { ui.wall = w; ui.selOp = null; renderTab(); } });
  $('showSheets').addEventListener('change', (e) => { ui.showSheets = e.target.checked; renderTab(); });
  $('faceSeg').addEventListener('click', (e) => { const f = e.target.dataset.face; if (f) { ui.inside = f === 'in'; renderTab(); } });
  document.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => addOpening(b.dataset.add)));

  const wv = $('wallView');
  wv.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('[data-op]');
    const svg = wv.querySelector('svg');
    if (!t || !svg) { if (e.target.closest('svg') && !t) { ui.selOp = null; renderTab(); } return; }
    const o = (wallOpenings(ui.wall) || []).find((x) => x.id === t.dataset.op);
    if (!o) return;
    ui.selOp = o.id;
    const p = svgPt(svg, e);
    drag = { kind: 'op', mode: t.dataset.mode, o, x0: p.x, y0: p.y, orig: { ...o } };
    wv.setPointerCapture(e.pointerId);
    e.preventDefault();
    renderTab();
  });
  wv.addEventListener('pointermove', (e) => {
    if (drag?.kind !== 'op') return;
    const svg = wv.querySelector('svg'), p = svgPt(svg, e);
    const dx = snap((p.x - drag.x0) * (ui.inside ? -1 : 1)), dz = snap(drag.y0 - p.y), o = drag.o, g = drag.orig;
    const def = res.walls[ui.wall], minU = def.A + (def.long ? 90 : 45) + 90, maxU = (w) => def.B - (def.long ? 90 : 45) - 90 - w;
    if (drag.mode === 'move') {
      o.U = Math.min(maxU(o.w), Math.max(minU, g.U + dx));
      // snap an edge to the face of a grid stud within 30 mm, so the stud can be the side of the opening
      const step = state.walls.studMax, g0 = def.Us[0];
      const k0 = Math.round((o.U - T2 - g0) / step), k1 = Math.round((o.U + o.w + T2 - g0) / step);
      const faceL = g0 + k0 * step + T2, faceR = g0 + k1 * step - T2;
      if (Math.abs(o.U - faceL) <= 30 && faceL >= minU) o.U = Math.ceil(faceL);
      else if (Math.abs(o.U + o.w - faceR) <= 30 && faceR - o.w <= maxU(o.w)) o.U = Math.floor(faceR - o.w);
      if (o.sill > 0) o.sill = Math.max(100, g.sill + dz);
    }
    if (drag.mode === 'l') { const U = Math.min(g.U + g.w - 300, Math.max(minU, g.U + dx)); o.w = g.w + g.U - U; o.U = U; }
    if (drag.mode === 'r') o.w = Math.max(300, Math.min(maxU(0) - g.U, g.w + dx));
    if (drag.mode === 't') o.h = Math.max(300, g.h + dz);
    if (drag.mode === 'b') { const sill = Math.min(g.sill + g.h - 300, Math.max(100, g.sill + dz)); o.h = g.h + g.sill - sill; o.sill = sill; }
    changed({ light: true });
  });
  const end = () => { drag = null; };
  wv.addEventListener('pointerup', end); wv.addEventListener('pointercancel', end);

  const pv = $('planView');
  pv.addEventListener('pointerdown', (e) => {
    const svg = pv.querySelector('svg');
    if (!svg) return;
    const p = svgPt(svg, e), x = p.x, y = -p.y;
    const sug = e.target.closest('[data-suggest]');
    if (sug) {
      const g = res.suggestions[+sug.dataset.suggest];
      const q = { ...g, id: uid('p'), h: state.walls.h0, sheathe: 'both', bearing: true, openings: [] };
      state.partitions.push(q);
      ui.selPart = q.id;
      changed();
      toast('Dodano ścianę nośną. Wysokość wynika z dachu.');
      return;
    }
    const t = e.target.closest('[data-part]');
    if (t) {
      const part = state.partitions.find((q) => q.id === t.dataset.part);
      ui.selPart = part.id;
      drag = { kind: 'part', part, x0: x, y0: y, orig: { ...part } };
    } else {
      ui.selPart = null;
      drag = { kind: 'draw', x0: x, y0: y, preview: null };
    }
    pv.setPointerCapture(e.pointerId);
    e.preventDefault();
    renderTab();
  });
  pv.addEventListener('pointermove', (e) => {
    if (!drag || (drag.kind !== 'part' && drag.kind !== 'draw')) return;
    const svg = pv.querySelector('svg'), p = svgPt(svg, e), x = p.x, y = -p.y;
    const { L, W } = state.dims;
    if (drag.kind === 'part') {
      const q = drag.part, d = q.orient === 'x' ? y - drag.y0 : x - drag.x0;
      const lim = q.orient === 'x' ? W : L;
      q.c = Math.min(lim - 95 - 47.5, Math.max(95 + 47.5, snap(drag.orig.c + d, 5)));
      changed({ light: true });
    } else {
      drag.preview = partitionFrom(drag.x0, drag.y0, x, y);
      renderTab();
    }
  });
  pv.addEventListener('pointerup', () => {
    if (drag?.kind === 'draw' && drag.preview && drag.preview.b - drag.preview.a >= 400) {
      const p = { ...drag.preview, id: uid('p'), h: state.walls.h0, sheathe: 'both', openings: [] };
      state.partitions.push(p);
      ui.selPart = p.id;
      drag = null;
      changed();
      return;
    }
    drag = null;
    renderTab();
  });

  $('roofView').addEventListener('click', (e) => {
    const c = e.target.closest('[data-cell]');
    if (!c) return;
    const k = c.dataset.cell, list = state.roof.clear, i = list.indexOf(k);
    if (i >= 0) list.splice(i, 1); else list.push(k);
    changed();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Delete' || /input|select|textarea/i.test(document.activeElement?.tagName)) return;
    if (ui.tab === 'walls' && ui.selOp) { const l = wallOpenings(ui.wall); l.splice(l.findIndex((o) => o.id === ui.selOp), 1); ui.selOp = null; changed(); }
    if (ui.tab === 'plan' && ui.selPart) { state.partitions = state.partitions.filter((p) => p.id !== ui.selPart); ui.selPart = null; changed(); }
  });
}

// Axis-aligned partition from a drag, snapped to inner wall faces and to other partitions.
function partitionFrom(x0, y0, x1, y1) {
  const { L, W } = state.dims;
  const orient = Math.abs(x1 - x0) >= Math.abs(y1 - y0) ? 'x' : 'y';
  const lim = orient === 'x' ? L : W, plim = orient === 'x' ? W : L;
  let c = snap(orient === 'x' ? y0 : x0, 5);
  c = Math.min(plim - 95 - 47.5, Math.max(95 + 47.5, c));
  let a = Math.min(orient === 'x' ? x0 : y0, orient === 'x' ? x1 : y1), b = Math.max(orient === 'x' ? x0 : y0, orient === 'x' ? x1 : y1);
  const stops = [95, lim - 95];
  for (const q of state.partitions) if (q.orient !== orient && c > q.a && c < q.b) stops.push(q.c - 47.5, q.c + 47.5);
  const near = (v) => { const s = stops.reduce((best, t) => (Math.abs(t - v) < Math.abs(best - v) ? t : best), stops[0]); return Math.abs(s - v) < 150 ? s : snap(v); };
  a = Math.max(95, near(a)); b = Math.min(lim - 95, near(b));
  return { orient, c, a, b };
}

function addOpening(type) {
  const list = wallOpenings(ui.wall);
  if (!list) return;
  const def = res.walls[ui.wall];
  const size = { door: [1020, 2090, 0], window: [1020, 620, 1000], opening: [900, 2090, 0] }[type];
  const corner = (def.long ? 90 : 45) + 90;
  const busy = list.map((o) => [o.U - 90, o.U + o.w + 90]);
  let U = null;
  for (let u = def.A + corner; u + size[0] <= def.B - corner; u += 10)
    if (!busy.some(([p, q]) => u - 90 < q && u + size[0] + 90 > p)) { U = u; break; }
  if (U === null) { toast('Na tej ścianie nie ma miejsca na taki otwór.'); return; }
  const o = { id: uid('o'), type, U, w: size[0], h: size[1], sill: size[2] };
  list.push(o);
  ui.selOp = o.id;
  changed();
}

// ---------- storage and sharing ----------

function loadInitial() {
  const h = location.hash;
  if (h.startsWith('#s=')) { try { return decodeState(h.slice(3)); } catch (_) { /* fall through */ } }
  try { const raw = localStorage.getItem(STORE); if (raw) return normalize(JSON.parse(raw)); } catch (_) { /* ignore */ }
  return normalize(defaultState());
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) { /* ignore */ } }

// ---------- local file ----------
// With the File System Access API (Chrome, Edge) "Zapisz" writes back to the opened file;
// elsewhere it downloads a .json and "Otwórz" uses a plain file input.
const file = { handle: null, name: '', dirty: false };
const FS_OK = 'showSaveFilePicker' in window;
const PICK = { types: [{ description: 'Konfiguracja szkieletu', accept: { 'application/json': ['.json'] } }] };

function markDirty() { file.dirty = true; showFile(); }
function showFile() {
  const el = $('fileName');
  if (!el) return;
  el.textContent = file.name ? `${file.name}${file.dirty ? ' • niezapisane zmiany' : ''}` : '';
  el.hidden = !file.name;
}
async function saveFile(asNew) {
  const text = JSON.stringify({ app: 'drewniak/szkielet', ...state }, null, 1);
  const suggested = file.name || `szkielet-${state.dims.L}x${state.dims.W}.json`;
  if (FS_OK) {
    try {
      if (asNew || !file.handle) file.handle = await window.showSaveFilePicker({ suggestedName: suggested, ...PICK });
      const w = await file.handle.createWritable();
      await w.write(text); await w.close();
      file.name = file.handle.name; file.dirty = false; showFile();
      toast(`Zapisano: ${file.name}`);
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
      file.handle = null;   // fall back to a download
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = suggested; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  file.name = suggested; file.dirty = false; showFile();
  toast(`Pobrano plik ${suggested}`);
}
async function openFile() {
  if (!FS_OK) { $('fileImport').click(); return; }
  try {
    const [h] = await window.showOpenFilePicker(PICK);
    const f = await h.getFile();
    await loadText(await f.text(), f.name, h);
  } catch (err) { if (err?.name !== 'AbortError') toast('Nie udało się otworzyć pliku.'); }
}
async function loadText(text, name, handle) {
  releaseFocus();
  try {
    state = normalize(JSON.parse(text));
    ui.selOp = ui.selPart = null;
    changed();
    file.handle = handle; file.name = name; file.dirty = false; showFile();
    toast(`Wczytano: ${name}`);
  } catch (_) { toast('To nie jest plik konfiguracji szkieletu.'); }
}

// a focused field keeps its text through syncForm; commit it before the whole state is replaced
function releaseFocus() { const a = document.activeElement; if (a && /input|select|textarea/i.test(a.tagName)) a.blur(); }

function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 2600 + t.length * 35); }

function bindActions() {
  $('btnLink').addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}#s=${encodeState(state)}`;
    history.replaceState(null, '', url);
    try { await navigator.clipboard.writeText(url); toast('Link skopiowany. Otwiera dokładnie tę konfigurację.'); } catch (_) { toast('Link jest w pasku adresu – skopiuj go stamtąd.'); }
  });
  $('exampleSel').innerHTML += EXAMPLES.map((e) => `<option value="${e.id}">${e.name}</option>`).join('');
  $('exampleSel').addEventListener('change', (e) => {
    const ex = EXAMPLES.find((x) => x.id === e.target.value);
    e.target.value = '';
    if (!ex) return;
    releaseFocus();
    state = ex.make();
    ui.selOp = ui.selPart = null; ui.wall = 'front';
    file.handle = null; file.name = ''; showFile();
    history.replaceState(null, '', location.pathname);
    if (view3d) view3d.first = true;
    changed();
    toast(`${ex.name}. ${ex.note}`);
  });
  $('btnStereo').addEventListener('click', async () => {
    const v = await ensure3D(); const on = !v.stereo;
    v.setStereo(on); $('btnStereo').setAttribute('aria-pressed', String(on));
    if (on) toast('Patrz zezem na środek między obrazami, aż złożą się w jeden przestrzenny.');
  });
  $('btnSave').addEventListener('click', () => saveFile(false));
  $('btnSaveAs').addEventListener('click', () => saveFile(true));
  $('btnOpen').addEventListener('click', openFile);
  $('fileImport').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    await loadText(await f.text(), f.name, null);
    e.target.value = '';
  });
  window.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === 's') { e.preventDefault(); saveFile(e.shiftKey); }
    if (k === 'o') { e.preventDefault(); openFile(); }
  });
  window.addEventListener('beforeunload', (e) => { if (file.dirty && file.handle) { e.preventDefault(); e.returnValue = ''; } });
  $('btnReset').addEventListener('click', () => {
    const b = $('btnReset');
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = 'Na pewno? Kliknij jeszcze raz'; setTimeout(() => { b.dataset.armed = '0'; b.textContent = 'Od nowa'; }, 3000); return; }
    b.dataset.armed = '0'; b.textContent = 'Od nowa';
    releaseFocus();
    state = normalize(defaultState()); ui.selOp = ui.selPart = null; history.replaceState(null, '', location.pathname); changed(); toast('Przywrócono wiatę 3101 × 2500.');
  });
  $('btnPdf').addEventListener('click', async () => {
    const b = $('btnPdf'); b.disabled = true; b.textContent = 'Składam PDF…';
    try {
      const { makePdf } = await import('./pdf.js');
      const img = await ensure3D().then((v) => { v.update(res, state); return v.snapshot(); }).catch(() => null);
      await makePdf(res, rep, state, img);
    } catch (err) {
      console.error(err);
      toast('Nie udało się złożyć PDF – otwieram wydruk przeglądarki.');
      printFallback();
    } finally { b.disabled = false; b.textContent = 'Pobierz PDF'; }
  });
  window.addEventListener('beforeprint', fillPrintViews);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => render());
}

function fillPrintViews() {
  const P = palette();
  const ids = [...WALL_IDS, ...state.partitions.map((p) => p.id)];
  $('printViews').innerHTML = `<section><h2>Rzut podłogi</h2>${planSVG(res, state, { pal: P })}</section><section><h2>Dach</h2>${roofSVG(res, state, { pal: P })}</section>`
    + ids.map((id) => `<section><h2>${res.walls[id].name}</h2>${elevationSVG(res, state, id, { pal: P, sheathing: true })}</section>`).join('');
}
function printFallback() { fillPrintViews(); setTimeout(() => window.print(), 50); }

// ---------- boot ----------

renderForm();
bindEditing();
bindActions();
render();
