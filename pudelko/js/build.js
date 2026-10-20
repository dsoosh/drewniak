// Practice box generator: a small finger-jointed box with one of four closures, from locked
// dimensions or from the boards the user owns. Pure functions, no DOM.
//
// Coordinates: x along the length, y along the depth (front at y = 0), z up, z = 0 at the bottom
// of the walls, which is also the table.

import { fingerLayout, nearestValid } from '../../skrzynia/js/build.js';
import { packBest } from '../../skrzynia/js/boards.js';

export { fingerLayout };
export const E = 9000;                       // MPa, pine without a strength class
const DENSITY = 500;
const IRONS = [3, 4, 5, 6, 8, 10];           // common plough plane irons
const HINGES = [20, 25, 30, 40, 50];
const HINGE_SCREWS = [[2, 8], [2.5, 10], [3, 12], [3, 16]];
const MIN_PER_FINGER = 12;
export const LIDS = { lift: 'Pokrywka nasadzana', slide: 'Przykrywka wsuwana', hinged: 'Wieko odcinane na zawiasach', flat: 'Przykrywka płaska' };

export const LIMITS = {
  boardL: [200, 3000], boardW: [40, 300], boardT: [8, 20], boardN: [1, 6], kerf: [0, 4], trim: [0, 50], sawKerf: [0.5, 2],
  L: [100, 500], D: [60, 350], H: [40, 200],
};

export function defaultState() {
  return {
    boards: { L: 1200, W: 120, T: 12, N: 2 },
    kerf: 2, trim: 10, sawKerf: 1,
    wood: 'soft',
    goal: 'proportions',
    lock: { L: null, D: null, H: null },
    lid: 'lift',
  };
}

const R1 = (v) => Math.round(v * 10) / 10;
const fmt1 = (v) => R1(v).toString().replace('.', ',');

// ---------------------------------------------------------------- joints and panels

/** Widest common plough iron of at most T/2. */
export const grooveWidth = (T) => [...IRONS].reverse().find((g) => g <= T / 2 + 1e-9) || IRONS[0];

/**
 * Groove depth and panel play for a panel spanning `inner` across the grain: play c = m·width + 1,
 * depth d = max(T/2, c + e), at most T − 3. Returns null when the board is too thin.
 */
export function panelFit(inner, T, wood) {
  const m = wood === 'hard' ? 0.015 : 0.01, e = T >= 10 ? 3 : 2;
  let d = T / 2, c = 0;
  for (let i = 0; i < 4; i++) { c = m * (inner + 2 * d) + 1; d = Math.max(T / 2, c + e); }
  if (d > T - 3 + 1e-9) return null;
  return { d, c, width: inner + 2 * d - c, e };
}

/** Panel strips: one board, two equal strips on the axis, or a full centre with two equal edges ≥ 40. */
export function panelStrips(P, W, ripW) {
  if (P <= W + 1e-9) return [{ cut: R1(P), final: R1(P), rip: P < ripW }];
  const half = P / 2;
  if (half + 2 <= W + 1e-9) return [0, 1].map(() => ({ cut: R1(half + 2), final: R1(half), rip: half + 2 < ripW }));
  const edge = (P - (W - 4)) / 2;
  if (edge >= 40 && edge + 2 <= W + 1e-9) return [{ cut: R1(edge + 2), final: R1(edge), rip: true }, { cut: W, final: W - 4, rip: false }, { cut: R1(edge + 2), final: R1(edge), rip: true }];
  return null;
}

// ---------------------------------------------------------------- one box

/**
 * Everything about one box of outer length Lo, depth Do and finished wall height H, or
 * {reject: reason} when it cannot be made. Does not lay out the boards.
 */
export function design(s, Lo, Do, H) {
  const { W, T } = s.boards;
  const lid = s.lid;
  const fl = fingerLayout(H, T);
  if (!fl.ok) return { reject: 'fingers' };
  const n = fl.n, w = fl.w;
  if ((lid === 'lift' || lid === 'hinged') && n < 5) return { reject: 'n5' };
  if (lid === 'hinged' && T < 8) return { reject: 'thinHinge' };
  const markH = lid === 'hinged' ? H + s.sawKerf + 1 : H;
  if (markH > W + 1e-9) return { reject: 'wallWidth', need: markH };
  if (lid === 'lift' && 3 * w > W + 1e-9) return { reject: 'wallWidth', need: 3 * w };
  const inL = Lo - 2 * T, inD = Do - 2 * T;
  if (inL < 40 || inD < 30) return { reject: 'small' };
  const g = grooveWidth(T);
  const fit = panelFit(inD, T, s.wood);
  if (!fit) return { reject: 'thin' };
  // bottom groove in the bottom band, lower edge ≥ 4 mm above the table
  const bz0 = Math.max(4, (w - g) / 2);
  if (bz0 + g > w - 1 + 1e-9) return { reject: 'band' };
  const bottom = { z0: bz0, z1: bz0 + g, d: fit.d, len: inL + 2 * fit.d - 1, width: fit.width, play: fit.c };
  const top = (bandTop) => ({ z1: bandTop - (w - g) / 2, z0: bandTop - (w - g) / 2 - g, recess: (w - g) / 2 });
  const out = { Lo, Do, H, markH, inL, inD, n, w, T, g, bottom, fit, lid };
  if (lid === 'lift') {
    out.rim = { h: 3 * w, n: 3, panel: { ...top(3 * w), len: bottom.len, width: fit.width } };
    out.lip = { t: T / 2, h: w + 6, long: Lo - 2 * T, short: Do - 3 * T };
    out.total = { L: Lo, D: Do, H: H + 3 * w };
  } else if (lid === 'slide') {
    const lfit = panelFit(inD, T, s.wood);
    out.slide = { low: H - T, z0: H - T, z1: H - T + g, d: lfit.d, len: Lo - T + lfit.d - 1, width: lfit.width, play: lfit.c,
      recess: { w: 24, depth: T / 3, len: 2.5 * T / 3, from: T } };
    out.total = { L: Lo, D: Do, H };
  } else if (lid === 'hinged') {
    const k = Math.max(2, Math.floor(0.3 * n)), lidH = (k + 0.5) * w, bodyH = H - lidH;
    if (bodyH < 2.5 * w - 1e-9) return { reject: 'n5' };
    const hl = HINGES.reduce((a, b) => (Math.abs(b - Lo / 8) < Math.abs(a - Lo / 8) ? b : a));
    const scr = [...HINGE_SCREWS].reverse().find(([dd, l]) => dd <= T / 4 + 1e-9 && l <= Math.min(lidH, bodyH) - 5) || HINGE_SCREWS[0];
    const from = Math.max(T + w, w + 10);
    if (2 * (from + hl) > Lo) return { reject: 'small' };
    out.hinged = { k, lidH, bodyH, cut: bodyH, band: n - k - 1, bandW: w + s.sawKerf + 1, panel: { ...top(H), len: bottom.len, width: fit.width },
      hinge: { len: hl, leaf: T - 2, from, screw: scr }, grip: { depth: T / 3, len: Lo / 3 } };
    out.total = { L: Lo, D: Do, H };
  } else {
    const o = Math.max(4, Math.round(T / 2));
    out.flat = { over: o, len: Lo + 2 * o, width: Do + 2 * o, batten: { t: T, w: 1.5 * T, len: Do - 2 * T - 2 } };
    out.total = { L: Lo + 2 * o, D: Do + 2 * o, H: H + T };
  }
  return out;
}

// ---------------------------------------------------------------- parts

/** Cut list. Walls are one strip cut in order front, end, back, end; panels in symmetric strips. */
export function parts(s, d) {
  const { W, T } = s.boards;
  const ripW = W - (s.kerf + 3);
  const out = [];
  const add = (p) => out.push({ qty: 1, t: T, rip: p.w < ripW, ...p });
  const endH = (side) => (d.lid === 'slide' && side === 'L' ? d.slide.low : d.markH);
  const walls = [['front', 'Przód', d.Lo + 1, d.markH], ['endL', d.lid === 'slide' ? 'Bok niski' : 'Bok lewy', d.Do + 1, endH('L')],
    ['back', 'Tył', d.Lo + 1, d.markH], ['endR', d.lid === 'slide' ? 'Bok wysoki' : 'Bok prawy', d.Do + 1, endH('R')]];
  walls.forEach(([key, name, l, h], i) => add({ key, name, l, w: R1(h), order: i + 1, wall: true, show: key === 'front', note: `${i + 1}. z jednego pasa: przód, bok, tył, bok` }));
  const panel = (key, name, len, width, extra = {}) => {
    const st = panelStrips(width, W, ripW);
    if (!st) return false;
    st.forEach((x, i) => add({ key: `${key}${st.length > 1 ? `-${i + 1}` : ''}`, name: st.length > 1 ? `${name}, pas ${i + 1}/${st.length}` : name, l: R1(len), w: x.cut, final: x.final, rip: x.rip, panel: key, ...extra }));
    return st.length;
  };
  let ok = panel('bottom', 'Dno', d.bottom.len, d.bottom.width, { note: 'wrąb od góry, pióro przy spodzie; bez kleju' });
  if (d.lid === 'lift') {
    for (const [key, name, l] of [['rimF', 'Obrzeże przód', d.Lo + 1], ['rimL', 'Obrzeże bok', d.Do + 1], ['rimB', 'Obrzeże tył', d.Lo + 1], ['rimR', 'Obrzeże bok', d.Do + 1]])
      add({ key, name, l, w: R1(d.rim.h), show: key === 'rimF', note: 'skrajne wczepy trzymają boki' });
    ok = ok && panel('rimPanel', 'Płyta pokrywki', d.rim.panel.len, d.rim.panel.width, { show: true, note: 'wrąb od spodu, pióro przy wierzchu' });
    add({ key: 'lipL', name: 'Listewka długa', qty: 2, l: R1(d.lip.long), w: R1(d.lip.h), t: d.lip.t, note: 'struganie na T/2; wręb 0,5 mm na górnych 6 mm, fazka 1 mm' });
    add({ key: 'lipS', name: 'Listewka krótka', qty: 2, l: R1(d.lip.short), w: R1(d.lip.h), t: d.lip.t, note: 'struganie na T/2; wręb 0,5 mm na górnych 6 mm, fazka 1 mm' });
  } else if (d.lid === 'slide') {
    ok = ok && panel('slideLid', 'Przykrywka wsuwana', d.slide.len, d.slide.width, { show: true, note: 'słoje wzdłuż; wrąb od góry, pióro przy spodzie; wnęka na palec' });
  } else if (d.lid === 'hinged') {
    ok = ok && panel('topPanel', 'Płyta wieka', d.hinged.panel.len, d.hinged.panel.width, { show: true, note: 'wrąb od spodu, pióro przy wierzchu' });
  } else {
    ok = ok && panel('flatLid', 'Przykrywka płaska', d.flat.len, d.flat.width, { show: true, note: 'słoje wzdłuż' });
    add({ key: 'batten', name: 'Listewka przykrywki', qty: 2, l: R1(d.flat.batten.len), w: R1(d.flat.batten.w), note: 'klej tylko w środkowej ⅓' });
  }
  return ok ? out : null;
}

const area = (ps) => ps.reduce((a, p) => a + p.qty * p.l * p.w, 0);

/** Pieces for the layout: the four walls as one strip when it fits the board, else one by one. */
function layoutPieces(s, ps) {
  const UL = s.boards.L - 2 * s.trim;
  const walls = ps.filter((p) => p.wall), rest = ps.filter((p) => !p.wall);
  const len = walls.reduce((a, p) => a + p.l, 0) + 3 * s.kerf;
  const pieces = [];
  if (len <= UL) pieces.push({ key: 'walls', name: 'Pas na ścianki', l: R1(len), w: Math.max(...walls.map((p) => p.w)), show: true, wallStrip: true });
  else walls.forEach((p) => pieces.push({ ...p }));
  for (const p of rest) for (let i = 0; i < p.qty; i++) pieces.push({ ...p, idx: i });
  return { pieces, oneStrip: len <= UL };
}

function layout(s, d) {
  const ps = parts(s, d);
  if (!ps) return { fail: 'panel' };
  const { L, W, N } = s.boards;
  if (area(ps) > N * W * (L - 2 * s.trim)) return { fail: 'area', cheap: true };
  const { pieces, oneStrip } = layoutPieces(s, ps);
  const pk = packBest(pieces, { L, W, count: N, kerf: s.kerf, trim: s.trim });
  if (!pk) return { fail: 'area' };
  return { parts: ps, boards: pk, oneStrip };
}

// ---------------------------------------------------------------- search

const outline = (s, d) => { const t = d.total; return { dev: Math.max(Math.abs(t.D / t.L - 0.6), Math.abs(t.H / t.L - 0.4)), vol: d.inL * d.inD * d.H }; };
const onePanel = (s, d) => {
  const W = s.boards.W, w = d.lid === 'lift' ? d.rim.panel.width : d.lid === 'slide' ? d.slide.width : d.lid === 'hinged' ? d.hinged.panel.width : d.flat.width;
  return w <= W ? 0 : 1;
};

export function search(s) {
  const r = (lo, hi, lock) => { if (lock) return [lock]; const a = []; for (let v = lo; v <= hi; v += 10) a.push(v); return a; };
  const Ls = r(...LIMITS.L, s.lock.L), Ds = r(...LIMITS.D, s.lock.D), Hs = r(...LIMITS.H, s.lock.H);
  const list = [], rejects = {};
  for (const H of Hs) for (const Lo of Ls) for (const Do of Ds) {
    if (!(s.lock.L && s.lock.D) && Do > Lo) continue;
    const d = design(s, Lo, Do, H);
    if (d.reject) { rejects[d.reject] = (rejects[d.reject] || 0) + 1; if (d.reject === 'wallWidth') rejects.need = Math.max(rejects.need || 0, d.need); continue; }
    list.push({ d, ...outline(s, d), one: onePanel(s, d) });
  }
  const prop = s.goal === 'proportions';
  list.sort(prop
    ? (a, b) => (a.dev <= 0.05 ? 0 : a.dev) - (b.dev <= 0.05 ? 0 : b.dev) || b.d.n - a.d.n || a.one - b.one || b.vol - a.vol
    : (a, b) => b.vol - a.vol || a.dev - b.dev);
  let tries = 0, lastFail = null;
  for (const c of list) {
    const lay = layout(s, c.d);
    if (!lay.fail) return { d: c.d, lay, dev: c.dev };
    lastFail = lay.fail;
    if (!lay.cheap && ++tries > 400) break;
  }
  return { fail: true, rejects, empty: !list.length, lastFail };
}

// ---------------------------------------------------------------- validation and diagnosis

export function validate(s) {
  const errs = [];
  const chk = (v, [lo, hi], label) => { if (!(Number.isFinite(v) && v >= lo && v <= hi)) errs.push(`${label}: wpisz liczbę od ${lo} do ${hi}.`); };
  chk(s.boards.L, LIMITS.boardL, 'Długość deski'); chk(s.boards.W, LIMITS.boardW, 'Szerokość deski');
  chk(s.boards.T, LIMITS.boardT, 'Grubość deski'); chk(s.boards.N, LIMITS.boardN, 'Liczba desek');
  chk(s.kerf, LIMITS.kerf, 'Rzaz przy rozkroju'); chk(s.trim, LIMITS.trim, 'Obcięcie końców'); chk(s.sawKerf, LIMITS.sawKerf, 'Rzaz piły do odcinania wieka');
  for (const k of ['L', 'D', 'H']) if (s.lock[k] != null) chk(s.lock[k], LIMITS[k], { L: 'Długość', D: 'Głębokość', H: 'Wysokość ścianek' }[k]);
  if (!LIDS[s.lid]) errs.push('Wybierz zamknięcie.');
  return errs;
}

function diagnose(s, found) {
  const tips = [], { W, T } = s.boards, rj = found.rejects || {};
  if (s.lock.H) {
    const fl = fingerLayout(s.lock.H, T);
    if ((s.lid === 'lift' || s.lid === 'hinged') && fl.ok && fl.n < 5) {
      let h = s.lock.H; while (h <= LIMITS.H[1] && fingerLayout(h, T).n < 5) h += 10;
      tips.push(`Pudełko o ściankach ${s.lock.H} mm ma tylko ${fl.n} wczepy na narożnik — za niskie na ${LIDS[s.lid].toLowerCase()}. Najbliższa wysokość z 5 wczepami: ${h} mm.`);
    }
    if (!fl.ok) tips.push(`Wysokość ${s.lock.H} mm nie ma poprawnego układu wczepów przy desce ${T} mm; spróbuj ${nearestValid(s.lock.H, T, LIMITS.H[0], LIMITS.H[1]).join(' albo ')} mm.`);
  }
  if (rj.wallWidth) tips.push(`Ścianki są z jednej deski: potrzeba deski co najmniej ${Math.ceil(rj.need || 0)} mm szerokiej (masz ${W} mm) albo niższych ścianek.`);
  if (rj.thin) tips.push(`Deska ${T} mm jest za cienka na rowek przy tej szerokości dna — dno wypadłoby z rowka przy pracy drewna. Węższe pudełko albo grubsza deska.`);
  if (rj.thinHinge) tips.push('Wieko na zawiasach wymaga deski co najmniej 8 mm.');
  if (found.lastFail === 'area' || !tips.length) {
    const need = Math.ceil(((s.lock.L || 200) * 2 + (s.lock.D || 120) * 2) * (s.lock.H || 80) * 2.6 / (W * (s.boards.L - 2 * s.trim)));
    tips.push(`Za mało deski: potrzeba około ${Math.max(need, s.boards.N + 1)} desek ${s.boards.L}×${W} mm albo mniejszego pudełka.`);
  }
  return tips;
}

// ---------------------------------------------------------------- checks

function checks(s, d) {
  const T = d.T, out = [];
  // bottom: 10 kg spread, along the grain over the inner length
  const bI = (d.bottom.width * T ** 3) / 12, bL = d.inL, P = 10 * 9.81;
  const bdef = (5 * P * bL ** 3) / (384 * E * bI), blim = bL / 300;
  out.push({ id: 'bottom', name: 'Dno: 10 kg rozłożone', value: bdef, limit: blim, unit: 'mm', ok: bdef <= blim, detail: `wzdłuż słojów, rozpiętość ${R1(bL)} mm, szerokość ${R1(d.bottom.width)} mm, grubość ${T} mm, E = ${E} MPa, L/300`, hint: bdef <= blim ? '' : 'Krótsze pudełko albo grubsza deska.' });
  const lw = d.lid === 'lift' ? d.rim.panel.width : d.lid === 'slide' ? d.slide.width : d.lid === 'hinged' ? d.hinged.panel.width : d.flat.width;
  const lL = d.lid === 'flat' ? d.Lo - T : d.inL, lI = (lw * T ** 3) / 12;
  const ldef = (100 * lL ** 3) / (48 * E * lI), llim = lL / 300;
  out.push({ id: 'lid', name: 'Płyta zamknięcia: 100 N w środku', value: ldef, limit: llim, unit: 'mm', ok: ldef <= llim, detail: `wzdłuż słojów, rozpiętość ${R1(lL)} mm, szerokość ${R1(lw)} mm, grubość ${T} mm, L/300`, hint: ldef <= llim ? '' : 'Krótsze pudełko albo grubsza deska.' });
  return out;
}

// ---------------------------------------------------------------- build

export function build(state) {
  const s = state;
  const errors = validate(s);
  if (errors.length) return { ok: false, errors, tips: [] };
  const found = search(s);
  if (found.fail) return { ok: false, errors: [], tips: diagnose(s, found) };
  const { d, lay } = found;
  const T = d.T;
  const chk = checks(s, d);
  const warnings = chk.filter((c) => !c.ok).map((c) => `${c.name}: ${fmt1(c.value)} mm przy granicy ${fmt1(c.limit)} mm. ${c.hint}`);
  if (d.Lo > 30 * T) warnings.push(`Pudełko ${d.Lo} mm z deski ${T} mm wygląda wiotko (długość ponad 30 × grubość).`);
  if (d.Lo < 12 * T) warnings.push(`Pudełko ${d.Lo} mm z deski ${T} mm wygląda ciężko (długość poniżej 12 × grubość).`);
  const notes = [];
  if (s.goal === 'proportions' && found.dev > 0.05) notes.push(`Proporcje obrysu poza zakresem: głębokość ${(d.total.D / d.total.L).toFixed(2).replace('.', ',')} zamiast 0,6, wysokość ${(d.total.H / d.total.L).toFixed(2).replace('.', ',')} zamiast 0,4 długości.`);
  if (!lay.oneStrip) notes.push('Ścianki nie mieszczą się na jednym pasie deski — słoje nie obiegną narożników.');
  const fingers = 4 * d.n + (d.lid === 'lift' ? 4 * 3 : 0);
  const vol = lay.parts.reduce((a, p) => a + p.qty * p.l * p.w * p.t, 0);
  const res = {
    ok: true, d, parts: lay.parts, layout: lay.boards, oneStrip: lay.oneStrip, checks: chk, warnings, notes,
    fingers: { total: fingers, hours: (fingers * MIN_PER_FINGER) / 60 }, mass: vol * 1e-9 * DENSITY,
  };
  res.hardware = hardware(s, d);
  res.difficulty = difficulty(s, d);
  res.tools = tools(s, d);
  res.plan = plan(s, d, res);
  res.templates = templates(s, d);
  res.geometry = geometry(s, d);
  return res;
}

function hardware(s, d) {
  const out = [{ item: 'Klej do drewna o czasie otwartym ≥ 15 min', size: '', qty: 1, note: 'tylko wczepy i listewki; dna i płyt nie klej' }];
  if (d.lid === 'hinged') {
    const h = d.hinged.hinge;
    out.unshift({ item: 'Zawias wpuszczany z ogranicznikiem 95°, mosiądz', size: `${h.len} mm, skrzydełko ≤ ${h.leaf} mm`, qty: 2, note: `zewnętrzny koniec ${fmt1(h.from)} mm od końca pudełka` },
      { item: 'Wkręt mosiężny do zawiasów', size: `${String(h.screw[0]).replace('.', ',')}×${h.screw[1]}`, qty: 8, note: 'nawiercić; nacięcia łbów wzdłuż osi zawiasu' });
  }
  out.push({ item: 'Olej albo olejowosk', size: 'zewnątrz', qty: 1, note: 'płyty wykończ przed montażem' }, { item: 'Szelak albo wosk', size: 'środek', qty: 1, note: 'olej w zamkniętym pudełku pachnie' });
  return out;
}

function difficulty(s, d) {
  const tech = [['Wczepy proste', 3], ['Rowek strugnicą', 3], ['Rowek zatrzymany, końce dłutem', 3], ['Wręb na pióro płyty', 3]];
  if (d.lid === 'lift') tech.push(['Listewki z wrębem 0,5 mm', 2]);
  if (d.lid === 'slide') tech.push(['Wnęka na palec', 2]);
  if (d.lid === 'hinged') tech.push(['Odcinanie wieka piłą', 3], ['Wpuszczanie zawiasów', 3]);
  if (d.lid === 'flat') tech.push(['Listewki klejone w środku', 1]);
  const hardest = Math.max(...tech.map(([, l]) => l));
  let level = hardest + (tech.filter(([, l]) => l >= 2).length >= 5 ? 1 : 0) + (d.T <= 8 ? 1 : 0);
  return { level: Math.min(5, level), techniques: tech };
}

function tools(s, d) {
  const g = d.g;
  const t = ['Piła grzbietnica do wczepów', 'Piła płatnica do rozkroju', 'Dłuta 6, 10 i 16 mm, pobijak', 'Znacznik i nóż do trasowania, kątownik',
    `Strugnica z żelazem ${g} mm`, `Strug kątnicowy (router plane) albo dłuto ${g} mm do zatrzymanych rowków`, 'Strug wręgowy do pióra płyt', 'Strug wygładzik', 'Ściski, co najmniej 2'];
  if (d.lid === 'hinged') t.push('Drobnozębna piła do odcięcia wieka i kliny do rzazu', 'Wiertła do nawiercania pod wkręty zawiasów, mały śrubokręt');
  return t;
}

function plan(s, d, res) {
  const T = d.T, f = fmt1, steps = [];
  steps.push(['Drewno', `Deska wystrugana na ${T} mm, aklimatyzowana w warsztacie. Ścianki tnij z jednego pasa w kolejności przód, bok, tył, bok, żeby słoje obiegły narożniki.`]);
  steps.push(['Narożnik próbny', `Na odpadzie: ${d.n} wczepów po ${f(d.w)} mm, głębokość ${f(T + 0.5)} mm. Przyłóż szablon 1:1 z PDF, trasuj nożem.`]);
  steps.push(['Rowki', `Rowki ${d.g} mm szerokie i ${f(d.bottom.d)} mm głębokie przed piłowaniem wczepów. Rowek dna ${f(d.bottom.z0)}–${f(d.bottom.z1)} mm nad dołem: przelotowy w bokach, w przodzie i tyle zatrzymany ${f(T / 2)} mm przed końcem — końce wybierz dłutem na ok. 20 mm, potem strugnica krótkimi pociągnięciami.${d.lid === 'slide' ? ` Rowki przykrywki w przodzie i tyle na ${f(d.slide.z0)}–${f(d.slide.z1)} mm: przelotowe przy niskim boku, zatrzymane przy wysokim; w wysokim boku rowek na tej samej wysokości.` : ''}${d.lid === 'lift' ? ` Rowek płyty w obrzeżu: przelotowy w przodzie i tyle, zatrzymany w bokach.` : ''}${d.lid === 'hinged' ? ' Rowek płyty wieka w górnym pasie jak rowek dna.' : ''}`]);
  steps.push(['Wczepy', `Trasuj od dołu ścianek${d.lid === 'hinged' ? `, pas ${d.hinged.band + 1} poszerzony do ${f(d.hinged.bandW)} mm (rzaz i struganie)` : ''}. Przód i tył trzymają skrajne wczepy korpusu. Razem ${res.fingers.total} wczepów (ok. ${Math.round(res.fingers.hours)} h).`]);
  steps.push(['Płyty', `Płyty z jednej deski albo z równych pasów. Wręb na pióro ${d.g} mm; dno z wrębem od góry. Luz w poprzek słojów ${f(d.bottom.play)} mm. Wykończ płyty przed montażem, żeby po skurczu nie wyszedł surowy pas.`]);
  steps.push(['Klejenie', 'Montaż na sucho, klej tylko na wczepach, dno pływa w rowku bez kleju. Sprawdź przekątne, po wyschnięciu zestrugaj wczepy na równo.']);
  if (d.lid === 'lift') steps.push(['Pokrywka', `Obrzeże ${f(d.rim.h)} mm z 3 wczepami, skrajne trzymają boki. Płyta cofnięta o ${f(d.rim.panel.recess)} mm pod krawędź. Listewki ${f(d.lip.t)} × ${f(d.lip.h)} mm wklej od środka na górnym pasie, wystają 6 mm; na wystającej części wręb 0,5 mm i fazka 1 mm.`]);
  if (d.lid === 'slide') steps.push(['Przykrywka wsuwana', `Płyta ${f(d.slide.len)} × ${f(d.slide.width)} mm, słoje wzdłuż, wrąb od góry, pióro przy spodzie, wierzch równo ze ściankami. Niski bok ${f(d.slide.low)} mm. Wnęka na palec ${d.slide.recess.w} × ${f(d.slide.recess.len)} mm, ${f(d.slide.recess.depth)} mm głęboka, ${f(d.slide.recess.from)} mm od końca, żłobikiem.`]);
  if (d.lid === 'hinged') steps.push(['Odcinanie wieka', `Sklej zamknięte pudełko (${f(d.markH)} mm). Trasuj linię cięcia dookoła w środku pasa ${d.hinged.band + 1}, ${f(d.hinged.cut)} mm nad dołem po struganiu. Tnij od narożników, przy trzecim boku włóż kliny w rzaz. Struguj obie krawędzie od narożnika do środka, żeby nie wyrwać czół wczepów. Wpuść zawiasy ${d.hinged.hinge.len} mm z ogranicznikiem 95°, ${f(d.hinged.hinge.from)} mm od końców. Fazka chwytu 45° ${f(d.hinged.grip.depth)} mm na środkowej ⅓ przodu wieka.`]);
  if (d.lid === 'flat') steps.push(['Przykrywka płaska', `Płyta ${f(d.flat.len)} × ${f(d.flat.width)} mm (wysięg ${d.flat.over} mm). Listewki ${T} × ${f(d.flat.batten.w)} × ${f(d.flat.batten.len)} mm w poprzek słojów, zewnętrzne lica 1 mm od boków od środka, klej tylko w środkowej ⅓.`]);
  steps.push(['Krawędzie i wykończenie', `Jedna fazka ${T <= 12 ? 1 : 1.5} mm na krawędziach, 0,5 mm wzdłuż styku zamknięcia, bez fazek na wylotach rowków. Na zewnątrz olej albo olejowosk, w środku szelak albo wosk.`]);
  return steps;
}

/** Finger layouts at 1:1 for the PDF: band edges from the bottom of each piece. */
function templates(s, d) {
  const band = (n, w, widen) => Array.from({ length: n }, (_, i) => (widen && widen.i === i ? widen.w : w));
  const out = [{ name: 'Ścianki', bands: band(d.n, d.w, d.lid === 'hinged' ? { i: d.hinged.band, w: d.hinged.bandW } : null), depth: d.T + 0.5, frontHolds: 'even' }];
  if (d.lid === 'lift') out.push({ name: 'Obrzeże pokrywki', bands: band(3, d.w), depth: d.T + 0.5, frontHolds: 'odd' });
  return out;
}

// ---------------------------------------------------------------- geometry

/** Boxes for the drawings and the 3D model; lid boxes carry lid: true, with the motion in `lidMotion`. */
export function geometry(s, d) {
  const T = d.T, B = [];
  const box = (x0, x1, y0, y1, z0, z1, kind, extra = {}) => B.push({ x0, x1, y0, y1, z0, z1, kind, ...extra });
  // finger-jointed frame on n bands over z0..z1 drawn between lo..hi; flip gives the outer fingers to the ends
  const frame = (x0, x1, y0, y1, z0, z1, n, opt = {}) => {
    const fw = (z1 - z0) / n, lo = opt.lo ?? z0, hi = opt.hi ?? z1, ex = opt.extra || {};
    const endTop = (side) => (opt.lowEnd === side ? opt.endTop : hi);
    for (const [a, b] of [[y0, y0 + T], [y1 - T, y1]]) box(x0 + T, x1 - T, a, b, lo, hi, 'wall', { ...ex, face: a === y0 ? 'front' : 'back' });
    for (const [side, a, b] of [['L', x0, x0 + T], ['R', x1 - T, x1]]) box(a, b, y0 + T, y1 - T, lo, Math.min(hi, endTop(side)), 'wall', { ...ex, face: 'end' });
    for (let i = 0; i < n; i++) {
      const za = Math.max(lo, z0 + i * fw), zb = Math.min(hi, z0 + (i + 1) * fw);
      if (zb <= za + 1e-6) continue;
      const front = (i % 2 === 0) !== !!opt.flip;
      for (const [side, xa, xb] of [['L', x0, x0 + T], ['R', x1 - T, x1]]) {
        const top = front ? zb : Math.min(zb, endTop(side));
        if (top > za + 1e-6) for (const [ya, yb] of [[y0, y0 + T], [y1 - T, y1]]) box(xa, xb, ya, yb, za, top, front ? 'fingerA' : 'fingerB', ex);
      }
    }
  };
  const { Lo, Do, H, w, g } = d;
  // recessed panel in a rim: tongue at the top face in the groove, body below
  const recessed = (zTop, extra) => {
    box(T - d.bottom.d + 0.5, Lo - T + d.bottom.d - 0.5, T - d.bottom.d + 0.5, Do - T + d.bottom.d - 0.5, zTop - g, zTop, 'panel', extra);
    box(T, Lo - T, T, Do - T, zTop - T, zTop - g, 'panel', extra);
  };
  // bottom panel: rebated from the top, tongue at the underside
  const b = d.bottom;
  box(T - b.d + 0.5, Lo - T + b.d - 0.5, T - b.d + 0.5, Do - T + b.d - 0.5, b.z0, b.z1, 'bottom');
  box(T, Lo - T, T, Do - T, b.z1, b.z0 + T, 'bottom');
  let lidMotion;
  if (d.lid === 'lift') {
    frame(0, Lo, 0, Do, 0, H, d.n);
    const lip = d.lip;
    box(T, Lo - T, T, T + lip.t, H - w, H + 6, 'lip'); box(T, Lo - T, Do - T - lip.t, Do - T, H - w, H + 6, 'lip');
    box(T, T + lip.t, T + lip.t, Do - T - lip.t, H - w, H + 6, 'lip'); box(Lo - T - lip.t, Lo - T, T + lip.t, Do - T - lip.t, H - w, H + 6, 'lip');
    const n0 = B.length;
    frame(0, Lo, 0, Do, H, H + d.rim.h, 3, { flip: true, extra: { lid: true } });
    recessed(H + d.rim.h - d.rim.panel.recess, { lid: true });
    lidMotion = { kind: 'lift', dz: d.rim.h + 60, first: n0 };
  } else if (d.lid === 'slide') {
    frame(0, Lo, 0, Do, 0, H, d.n, { lowEnd: 'L', endTop: d.slide.low });
    const sl = d.slide;
    box(0, sl.len, T - sl.d + sl.play / 2, Do - T + sl.d - sl.play / 2, H - T, H - T + g, 'lidPanel', { lid: true });
    box(0, sl.len, T, Do - T, H - T + g, H, 'lidPanel', { lid: true });
    box(sl.recess.from, sl.recess.from + sl.recess.len, Do / 2 - sl.recess.w / 2, Do / 2 + sl.recess.w / 2, H - 0.3, H + 0.3, 'recess', { lid: true });
    lidMotion = { kind: 'slide', dx: -0.6 * sl.len };
  } else if (d.lid === 'hinged') {
    const cut = d.hinged.cut;
    frame(0, Lo, 0, Do, 0, H, d.n, { hi: cut - 0.5 });
    frame(0, Lo, 0, Do, 0, H, d.n, { lo: cut + 0.5, extra: { lid: true } });
    recessed(H - d.hinged.panel.recess, { lid: true });
    box(Lo / 3, (2 * Lo) / 3, -0.4, 0.6, cut + 0.5, cut + 0.5 + d.hinged.grip.depth, 'grip', { lid: true });
    const h = d.hinged.hinge;
    for (const x of [h.from + h.len / 2, Lo - h.from - h.len / 2]) box(x - h.len / 2, x + h.len / 2, Do, Do + 1.2, cut - 8, cut + 8, 'hinge', { hingeX: x });
    lidMotion = { kind: 'hinge', y: Do, z: cut, deg: 95 };
  } else {
    frame(0, Lo, 0, Do, 0, H, d.n);
    const o = d.flat.over, bt = d.flat.batten;
    box(-o, Lo + o, -o, Do + o, H, H + T, 'lidPanel', { lid: true });
    for (const x of [T + 1, Lo - T - 1 - bt.w]) box(x, x + bt.w, T + 1, Do - T - 1, H - bt.t, H, 'batten', { lid: true });
    lidMotion = { kind: 'lift', dz: 70 };
  }
  return { boxes: B, lidMotion };
}
