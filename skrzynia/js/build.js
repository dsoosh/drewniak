// Tool chest generator: from the boards the user owns, find a finger-jointed chest with a lid,
// trays and a skirt, and produce its parts, board layouts, fasteners, checks, work plan and
// box geometry for the drawings and the 3D model. Pure functions, no DOM.
//
// Coordinates of the geometry: x along the length, y along the depth (front at y = 0), z up,
// z = 0 at the bottom of the carcass walls; the floor is at z = -SKIRT_DROP.

import { packBest } from './boards.js';

export const E = 9000;                 // MPa, pine without a strength class
export const DENSITY = 500;            // kg/m³
export const SKIRT_DROP = 4;           // skirt stands this much below the carcass
const P_PERSON = 1000;                 // N, person sitting on the lid / standing in the chest
const SIGMA_MAX = 14;                  // MPa
const CLEAT_PROJ = 30;                 // bottom cleat projection
const RUNNER_H = 25;                   // runner height
const SCREW_KN = 0.5;                  // kN per cleat screw
const MIN_FREE = 120;                  // free height under the trays
const MIN_PER_FINGER = 10;             // minutes per finger, marking and fitting
const NAILS = [20, 25, 30, 35, 40, 50, 60, 70, 80];
const HINGE_SCREWS = [[3, 8], [3, 10], [3, 12], [3.5, 16], [3.5, 20], [3.5, 25]];
const NUT = 10;                        // cap nut height inside the chest
const SCREWS = [[3.5, 16], [3.5, 20], [3.5, 25], [3.5, 30], [3.5, 35], [4, 40], [4, 45], [4, 50], [5, 60], [5, 70], [5, 80]];

export const LIMITS = {
  boardL: [300, 6000], boardW: [60, 400], boardT: [12, 32], boardN: [1, 12], kerf: [0, 6], trim: [0, 100],
  trayT: [8, 16], trayW: [60, 400], trayL: [300, 6000], trayN: [1, 12],
  L: [400, 1400], D: [250, 700], H: [250, 700], trayH: [60, 150], minInner: [200, 1300], load: [0, 300], clear: [300, 2000],
};

export function defaultState() {
  return {
    boards: { L: 2500, W: 200, T: 20, N: 8 },
    kerf: 3, trim: 10,
    edgeGlue: true,
    goal: 'proportions',
    lock: { L: null, D: null, H: null },
    minInner: 600,
    trays: 1, trayH: 110,
    trayBoards: { L: 2000, W: 120, T: 12, N: 3 },  // null → trays from the chest boards
    handles: 'wood',
    load: 80,
    clear: null,
    finish: 'oil',
  };
}

const R1 = (v) => Math.round(v * 10) / 10;
const eq = (a, b) => Math.abs(a - b) < 1e-6;

// ---------------------------------------------------------------- finger joints

/** Smallest odd n >= 3 with h/n <= 1.5t; the layout is valid when h/n >= t. */
export function fingerLayout(h, t) {
  let n = 3;
  while (h / n > 1.5 * t + 1e-9) n += 2;
  return { n, w: h / n, ok: h / n >= t - 1e-9 };
}

/** Nearest heights on a `step` grid within [lo, hi] that have a valid layout, below and above h. */
export function nearestValid(h, t, lo, hi, step = 10) {
  const out = [];
  for (let v = Math.floor(h / step) * step; v >= lo; v -= step) if (v !== h && fingerLayout(v, t).ok) { out.push(v); break; }
  for (let v = Math.ceil(h / step) * step; v <= hi; v += step) if (v !== h && fingerLayout(v, t).ok) { out.push(v); break; }
  return out;
}

/**
 * Skirt height k·w + drop (k whole or half, k >= 2) with its own valid layout, 60–150 mm. Among
 * heights with h/H in 0.15–0.25 the skirt finger closest to w (0.85–1.15 w) wins, then the
 * height closest to H/5; without such a height, the one closest to H/5.
 */
export function skirtHeight(H, w, T) {
  const all = [];
  for (let k = 2; k * w + SKIRT_DROP <= 150 + 1e-9; k += 0.5) {
    const h = k * w + SKIRT_DROP, fl = fingerLayout(h, T);
    if (h < 60 - 1e-9 || !fl.ok) continue;
    all.push({ h, k, r: fl.w / w, d: Math.abs(h - H / 5) });
  }
  if (!all.length) return null;
  const band = all.filter((c) => c.h / H >= 0.15 - 1e-9 && c.h / H <= 0.25 + 1e-9 && c.r >= 0.85 - 1e-9 && c.r <= 1.15 + 1e-9);
  const best = band.length
    ? band.sort((a, b) => Math.abs(a.r - 1) - Math.abs(b.r - 1) || a.d - b.d)[0]
    : all.sort((a, b) => a.d - b.d)[0];
  return { h: best.h, k: best.k, top: best.k * w };
}

/** Is a horizontal line at z on the half-finger grid? */
export const onGrid = (z, w) => Math.abs(z / (w / 2) - Math.round(z / (w / 2))) < 1e-6;

/** A glue seam is fine on a finger boundary (±0.5), in the middle third of a finger, on the skirt top or ≥ 10 mm below it. */
export function seamOk(z, w, skirtTop) {
  const d = Math.abs(z - Math.round(z / w) * w);
  return d < 0.5 || Math.abs(d - w / 2) <= w / 6 + 1e-9 || Math.abs(z - skirtTop) < 0.5 || z <= skirtTop - 10 + 1e-9;
}

/**
 * Strips of a wall glued along the grain, bottom to top: remainder (cut +2 mm for its glued edge),
 * middle strips (W − 4 after jointing both edges), full strip at the top (W − 2). The remainder may
 * be widened by up to w/2, narrowing the top strip, to bring the seams onto valid positions.
 */
export function wallStrips(H, W, w, skirtTop) {
  if (H <= W + 1e-9) return { strips: [{ cut: H, final: H, rip: H < W - 0.5, role: 'one' }], seams: [], shift: 0 };
  for (let k = 2; k < 20; k++) {
    const base = (W - 2) + (k - 2) * (W - 4);
    let r = H - base;
    if (r > W - 2 + 1e-9) continue;
    let topCut = W;
    if (r < 40) { topCut = W - (40 - r); r = 40; }
    for (let shift = 0; shift <= w / 2 + 1e-9; shift += 0.5) {
      const rr = r + shift, tc = topCut - shift;
      if (rr > W - 2 + 1e-9) break;
      const seams = []; let z = rr;
      for (let i = 0; i < k - 1; i++) { seams.push(z); z += W - 4; }
      if (!seams.every((s) => seamOk(s, w, skirtTop))) continue;
      const strips = [{ cut: rr + 2, final: rr, rip: rr + 2 < W - 0.5, role: 'rest' }];
      for (let i = 0; i < k - 2; i++) strips.push({ cut: W, final: W - 4, rip: false, role: 'mid' });
      strips.push({ cut: tc, final: tc - 2, rip: tc < W - 0.5, role: 'top' });
      return { strips, seams, shift };
    }
    return null;
  }
  return null;
}

/** Strips of a panel glued along the grain, front to back: full front strip, middle strips, remainder at the back. */
function panelStrips(D, W) {
  if (D <= W + 1e-9) return [{ cut: D, final: D, rip: D < W - 0.5 }];
  for (let k = 2; k < 30; k++) {
    let r = D - (W - 2) - (k - 2) * (W - 4);
    if (r > W - 2 + 1e-9) continue;
    let frontCut = W;
    if (r < 40) { frontCut = W - (40 - r); r = 40; }
    const s = [{ cut: frontCut, final: frontCut - 2, rip: frontCut < W - 0.5 }];
    for (let i = 0; i < k - 2; i++) s.push({ cut: W, final: W - 4, rip: false });
    s.push({ cut: r + 2, final: r, rip: r + 2 < W - 0.5 });
    return s;
  }
  return null;
}

/** Shiplapped boards, front to back; each lap overlaps 12 mm with `play` left in it, the last board is ripped to fit. */
function shiplapBoards(D, W, lap = 12, play = 1.5) {
  const step = W - lap + play;
  const n = Math.max(1, Math.ceil((D - W) / step) + 1);
  const out = [];
  for (let i = 0; i < n; i++) out.push(W);
  const last = D - (n - 1) * step;
  out[n - 1] = Math.max(40, last);
  return out.map((v) => ({ cut: v, final: v, rip: v < W - 0.5 }));
}

/** Bottom boards across the inner length: full boards with gaps, one remainder ≥ 40 mm, 3 mm at each end. */
export function bottomBoards(inL, W) {
  const gap = Math.max(2, 0.01 * W), avail = inL - 6;
  let k = 0;
  while ((k + 1) * W + k * gap <= avail + 1e-9) k++;
  let rest = avail - k * W - k * gap;
  const out = Array(k).fill(W);
  // a remainder under half a board is split with the last full board into two equal ones
  if (rest >= W / 2 || (rest >= 40 && k === 0)) out.push(rest);
  else if (rest > 0.5 && k > 0) { out.pop(); const two = (rest + W) / 2; out.push(two, two); }
  return { widths: out.map(R1), gap };
}

// ---------------------------------------------------------------- fasteners

const nailUpTo = (max) => [...NAILS].reverse().find((n) => n <= max) || null;
const screwUpTo = (max, minD = 3.5) => [...SCREWS].reverse().find(([d, l]) => l <= max && d >= minD) || SCREWS.find(([, l]) => l <= max) || null;
const screwName = (s) => (s ? `${String(s[0]).replace('.', ',')}×${s[1]}` : '—');

// ---------------------------------------------------------------- one chest

/**
 * Everything about one chest of outer length Lo, depth Do and wall height H, or null when it cannot
 * be laid out (fingers, seams, trays). Does not lay out the boards.
 */
export function design(s, Lo, Do, H) {
  const { W, T } = s.boards;
  const tb = s.trayBoards;
  const tT = tb ? tb.T : T;
  const stacked = !s.edgeGlue;
  // finger grid: on a stacked wall each board carries its own layout
  const fl = stacked ? fingerLayout(W, T) : fingerLayout(H, T);
  if (!fl.ok) return null;
  const w = fl.w, nPerCorner = stacked ? fl.n * Math.round(H / W) : fl.n;
  const sk = skirtHeight(H, w, T);
  if (!sk) return null;
  const Hs = sk.h, skirtTop = sk.top, skirtN = fingerLayout(Hs, T).n;
  let wall;
  if (stacked) {
    const k = Math.round(H / W);
    if (!eq(k * W, H)) return null;
    wall = { strips: Array.from({ length: k }, () => ({ cut: W, final: W, rip: false, role: 'board' })), seams: Array.from({ length: k - 1 }, (_, i) => (i + 1) * W), shift: 0 };
  } else {
    wall = wallStrips(H, W, w, skirtTop);
    if (!wall) return null;
  }
  const inL = Lo - 2 * T, inD = Do - 2 * T;
  const Ha = 2 * w + T;                                   // apron height from the lid top
  const apronEdge = H + T - Ha;                           // = H − 2w
  const LD = (Do + T + 3) / 0.99;                         // lid depth: front overhang T + 3 + 1% LD
  const ovF = LD - Do, ovE = T + 3, LL = Lo + 2 * ovE;
  const battenLen = inD - 2 * (3 + 0.01 * LD);
  // handles: top on the highest half-grid line ≥ 40 mm below the apron edge
  let hm = 2, hd = Infinity;                              // handle height m·w/2 in 45–70, closest to 55
  for (let m = 1; m * w / 2 <= 70 + 1e-9; m++) { const h = m * w / 2; if (h >= 45 - 1e-9 && Math.abs(h - 55) < hd) { hd = Math.abs(h - 55); hm = m; } }
  if (!Number.isFinite(hd)) hm = Math.max(1, Math.round(55 / (w / 2)));
  const hH = hm * w / 2;
  const hTop = Math.floor((apronEdge - 40) / (w / 2) + 1e-6) * (w / 2), hBot = hTop - hH;
  const hLen = Math.min(240, Math.max(140, Math.round(0.5 * Do / 10) * 10));
  const layers = Math.ceil(30 / T);
  if (hBot <= skirtTop) return null;
  const effL = s.handles === 'bought' ? inL - 2 * (T + NUT) : inL;  // between the cap nuts
  if (effL < s.minInner - 1e-9) return null;

  // trays, top down
  const trays = [];
  const trayFl = fingerLayout(s.trayH, tT);
  if (s.trays > 0 && !trayFl.ok) return null;
  const p1Layers = Math.ceil((tT + 6) / T), p1 = p1Layers * T;
  let top = H - T - 5;                                    // under the lid battens
  let runnerTops = [];
  for (let i = 0; i < s.trays; i++) {
    const depth = i === 0 ? inD - 4 : inD - 2 * p1 - 4;
    const proj = i === 0 ? p1 : Math.ceil((p1 + tT + 4) / T) * T;
    const ttop = i === 0 ? top : Math.min(top, runnerTops[0] - 5);
    const tbot = ttop - s.trayH;
    trays.push({ depth, len: Math.floor(effL / 2), top: ttop, bot: tbot, proj, projLayers: proj / T, runnerTop: tbot, runnerBot: tbot - RUNNER_H });
    runnerTops.push(tbot);
    top = tbot - RUNNER_H - 5;
  }
  const bottomTop = T * Math.ceil(20 / T) + T;            // cleat height + bottom board
  const free = trays.length ? trays[trays.length - 1].runnerBot - bottomTop : H - bottomTop;
  if (free < 0) return null;
  const bb = bottomBoards(inL, W);

  return {
    Lo, Do, H, inL, inD, effL, inH: H - bottomTop, w, n: fl.n, nPerCorner, stacked, wall,
    skirt: { h: Hs, top: skirtTop, n: skirtN, k: sk.k },
    apron: { h: Ha, edge: apronEdge, fw: Ha / 3 },
    lid: { depth: LD, len: LL, ovF, ovE, glued: !stacked },
    batten: { len: battenLen, cut: Math.round(battenLen), clear: (inD - battenLen) / 2 },
    handle: { top: hTop, bot: hBot, h: hH, len: hLen, layers, proj: layers * T, undercut: Math.min(hH / 2, layers * T - 10) },
    trayX: T + (s.handles === 'bought' ? T + NUT : 0) + 2,
    trays, trayFl, tT, p1,
    bottom: bb, bottomTop, free,
    total: { L: LL, D: Do + 2 * T, H: H + T + SKIRT_DROP, Lh: Math.max(LL, Lo + 2 * layers * T) },
    lidPanel: { len: LL - 2 * T, depth: LD - T },
  };
}

// ---------------------------------------------------------------- parts

/** Cut list of a chest. Each part: {key, name, qty, l (along the grain), w, t, stock, note, group, show, rip}. */
export function parts(s, d) {
  const { W, T } = s.boards;
  const out = [];
  const ripW = W - (s.kerf + 3);                           // narrower than this needs a rip, not a plane
  const add = (p) => out.push({ qty: 1, stock: 'chest', t: T, ...p, rip: p.w < ripW });
  const strips = (key, name, l, list, extra = {}) => list.forEach((st, i) => add({ key: `${key}${list.length > 1 ? `-${i + 1}` : ''}`, name: list.length > 1 ? `${name}, pas ${i + 1}/${list.length}` : name, l, w: R1(st.cut), final: R1(st.final), rip: st.rip, ...extra }));
  // carcass: finger-jointed pieces are 1 mm longer than the outer size
  for (const [key, name, l, show] of [['front', 'Przód', d.Lo + 1, true], ['back', 'Tył', d.Lo + 1, false], ['endL', 'Bok lewy', d.Do + 1, false], ['endR', 'Bok prawy', d.Do + 1, false]])
    strips(key, name, l, d.wall.strips, { group: key, show });
  add({ key: 'cleat', name: 'Listwa nośna dna', qty: 2 * Math.ceil(20 / T), l: d.inL - 2, w: CLEAT_PROJ });
  if (d.stacked) add({ key: 'vcleat', name: 'Listwa pionowa boku', qty: 2, l: R1(d.H - T * Math.ceil(20 / T) - T - 10), w: 40, note: 'od środka na boku, wkręt w oś każdej deski' });
  d.bottom.widths.forEach((bw, i) => add({ key: `bottom-${i + 1}`, name: 'Deska dna', l: d.inD - 2, w: bw }));
  // skirt
  const skStrips = d.skirt.h <= W ? [{ cut: d.skirt.h, final: d.skirt.h, rip: d.skirt.h < W - 0.5 }] : panelStrips(d.skirt.h, W);
  for (const [key, name, l] of [['skirtF', 'Cokół przód', d.Lo + 0.5 + 2 * T + 1], ['skirtB', 'Cokół tył', d.Lo + 0.5 + 2 * T + 1], ['skirtL', 'Cokół bok', d.Do + 0.5 + 2 * T + 1], ['skirtR', 'Cokół bok', d.Do + 0.5 + 2 * T + 1]])
    strips(key, name, l, skStrips, { group: key, show: key === 'skirtF' });
  // lid
  const lidStrips = d.lid.glued ? panelStrips(d.lidPanel.depth, W) : shiplapBoards(d.lidPanel.depth, W);
  strips('lid', 'Wieko', R1(d.lidPanel.len), lidStrips, { group: 'lid', show: true, note: d.lid.glued ? 'klejone, reszta z tyłu przy zawiasach' : 'na zakładkę 12 mm, 1,5 mm luzu w zakładce' });
  add({ key: 'apronF', name: 'Fartuch przód', l: R1(d.lid.len + 1), w: R1(d.apron.h), rip: d.apron.h < W - 0.5, show: true });
  add({ key: 'apronS', name: 'Fartuch bok', qty: 2, l: R1(d.lid.depth + 0.5), w: R1(d.apron.h), rip: d.apron.h < W - 0.5 });
  add({ key: 'batten', name: 'Listwa wieka', qty: 2, l: d.batten.cut, w: 50 });
  // handles
  if (s.handles === 'wood') add({ key: 'handle', name: 'Uchwyt, warstwa', qty: 2 * d.handle.layers, l: d.handle.len, w: R1(d.handle.h), note: `podcięcie 45° na ${fmt1(d.handle.undercut)} mm` });
  else add({ key: 'backing', name: 'Klocek pod uchwyt', qty: 2, l: d.handle.len, w: R1(d.handle.h) });
  // runners and guides
  d.trays.forEach((tr, i) => {
    add({ key: `runner${i + 1}`, name: `Prowadnica tacy ${i ? 'dolnej' : d.trays.length > 1 ? 'górnej' : ''}`.trim(), qty: 2 * tr.projLayers, l: d.inL - 2, w: RUNNER_H });
  });
  if (d.trays.length > 1) {
    const gh = d.trays[0].runnerBot - d.trays[1].runnerTop;
    if (gh > 1) add({ key: 'guide', name: 'Listwa prowadząca', qty: 2 * (d.p1 / T), l: d.inL - 2, w: R1(gh) });
  }
  // trays
  const tb = s.trayBoards, tW = tb ? tb.W : W, tT = d.tT, stock = tb ? 'tray' : 'chest';
  d.trays.forEach((tr, i) => {
    const nm = d.trays.length > 1 ? (i ? ' (dolna)' : ' (górna)') : '';
    const hStr = s.trayH <= tW ? [{ cut: s.trayH, final: s.trayH, rip: s.trayH < tW - 0.5 }] : panelStrips(s.trayH, tW);
    const tRip = tW - (s.kerf + 3);
    const addT = (p) => out.push({ qty: 1, stock, t: tT, ...p, rip: p.w < tRip });
    for (const [key, name, l] of [['tLong', `Taca${nm}, ścianka długa`, tr.len + 1], ['tEnd', `Taca${nm}, ścianka czołowa`, tr.depth + 1]])
      hStr.forEach((st, j) => addT({ key: `${key}${i}${hStr.length > 1 ? `-${j}` : ''}`, name, qty: 2, l, w: R1(st.cut), rip: st.rip }));
    const bl = tr.depth - 2 * tT, bwInner = tr.len - 2 * tT, bw = bwInner - (3 + 0.01 * bwInner);
    const bStr = s.edgeGlue ? panelStrips(bw, tW) : shiplapBoards(bw, tW, 0, 0);
    tr.bottom = { len: bl, width: R1(bw), clearance: R1(bwInner - bw), boards: s.edgeGlue ? 1 : bStr.length };
    bStr.forEach((st, j) => addT({ key: `tBot${i}-${j}`, name: `Taca${nm}, dno${bStr.length > 1 ? `, pas ${j + 1}/${bStr.length}` : ''}`, l: R1(bl), w: R1(st.cut), rip: st.rip }));
    addT({ key: `tCleat${i}`, name: `Taca${nm}, listewka dna`, qty: 2, l: R1(bwInner), w: 15, rip: true });
    const divH = s.trayH - 15 - tT - 10;
    addT({ key: `tDiv${i}`, name: `Taca${nm}, przegródka`, l: R1(tr.depth - 2 * tT + 2 * tT / 3), w: R1(divH), rip: divH < tW - 0.5 });
  });
  return out;
}

const area = (ps) => ps.reduce((a, p) => a + p.qty * p.l * p.w, 0);
const expand = (ps) => ps.flatMap((p) => Array.from({ length: p.qty }, (_, i) => ({ ...p, idx: i })));

/** Cheap lower bound of the chest-board area, to skip hopeless candidates before building parts. */
function areaGuess(s, Lo, Do, H) {
  const { T } = s.boards;
  const w = H / 15, Hs = 3 * w, Ha = 2 * w + T, LD = Do + T + 8, LL = Lo + 2 * T + 6;
  return 0.92 * (2 * H * (Lo + Do) + (Lo - 2 * T) * (Do - 2 * T) + LL * LD + 2 * Hs * (Lo + Do + 4 * T) + Ha * (LL + 2 * LD));
}

// ---------------------------------------------------------------- search

function candidates(s) {
  const { W } = s.boards;
  const r = (lo, hi, lock) => { if (lock) return [lock]; const a = []; for (let v = lo; v <= hi; v += 10) a.push(v); return a; };
  const Ls = r(...LIMITS.L, s.lock.L), Ds = r(...LIMITS.D, s.lock.D);
  let Hs;
  if (!s.edgeGlue) {
    Hs = [];
    for (let k = 1; k * W <= LIMITS.H[1]; k++) if (k * W >= LIMITS.H[0]) Hs.push(k * W);
    if (s.lock.H) Hs = Hs.filter((h) => eq(h, s.lock.H));
  } else Hs = r(...LIMITS.H, s.lock.H);
  return { Ls, Ds, Hs };
}

function score(s, Lo, Do, H) {
  const T = s.boards.T, w = H / 15;
  const LL = Lo + 2 * T + 6, tH = H + T + SKIRT_DROP, tD = Do + 2 * T;
  const dev = Math.max(Math.abs(tD / LL - 0.55), Math.abs(tH / LL - 0.6));
  const vol = (Lo - 2 * T) * (Do - 2 * T) * (H - 2 * T - w);
  return { dev, vol };
}

/** Lid and bottom pass their checks (the same formulas as checks()). */
function structuralOk(s, d) {
  const { W, T } = s.boards;
  return exceed(s, d) <= 1 + 1e-9;
}

/** Largest ratio of a check value to its limit (lid and bottom deflection and stress). */
function exceed(s, d) {
  const { W, T } = s.boards;
  const span = d.inL + T, b = d.lid.glued ? d.lidPanel.depth : W, I = ((d.lid.glued ? 1 : 0.9) * b * T ** 3) / 12;
  const bs = d.inD - CLEAT_PROJ, bI = (Math.min(...d.bottom.widths) * T ** 3) / 12;
  return Math.max(
    (P_PERSON * span ** 3) / (48 * E * I) / (span / 200), ((P_PERSON * span) / 4) * (T / 2) / I / SIGMA_MAX,
    (P_PERSON * bs ** 3) / (48 * E * bI) / (bs / 200), ((P_PERSON * bs) / 4) * (T / 2) / bI / SIGMA_MAX);
}

/** Lay out a chest on the boards; {fail: 'chest' | 'tray'} when it does not fit. `trayFails` holds
 * tray sizes that did not fit: any tray at least as long and as deep cannot fit either. */
function layout(s, d, trayFails = []) {
  const t0 = d.trays[0];
  if (t0 && trayFails.some((f) => t0.len >= f.len && t0.depth >= f.depth)) return { fail: 'tray', cheap: true };
  const ps = parts(s, d);
  const chest = ps.filter((p) => p.stock === 'chest'), tray = ps.filter((p) => p.stock === 'tray');
  const { L, W, N } = s.boards, tb = s.trayBoards;
  const trayArea = tray.length && area(tray) > tb.N * tb.W * (tb.L - 2 * s.trim);
  if (area(chest) > N * W * (L - 2 * s.trim)) return { fail: 'chest', cheap: true };
  if (trayArea) { trayFails.push({ len: t0.len, depth: t0.depth }); return { fail: 'tray', cheap: true }; }
  const a = packBest(expand(chest), { L, W, count: N, kerf: s.kerf, trim: s.trim });
  if (!a) return { fail: 'chest' };
  let b = null;
  if (tray.length) {
    b = packBest(expand(tray), { L: tb.L, W: tb.W, count: tb.N, kerf: s.kerf, trim: s.trim });
    if (!b) { trayFails.push({ len: t0.len, depth: t0.depth }); return { fail: 'tray' }; }
  }
  return { parts: ps, chest: a, tray: b, rips: a.rips + (b ? b.rips : 0) };
}

/** Find the chest. Returns {d, lay} or {fail:true, tried}. */
export function search(s) {
  const { Ls, Ds, Hs } = candidates(s);
  const { L, W, N } = s.boards;
  const total = N * W * (L - 2 * s.trim);
  const list = [];
  for (const H of Hs) for (const Lo of Ls) for (const Do of Ds) {
    if (!(s.lock.L && s.lock.D) && Do > 0.75 * Lo + 1e-9) continue;
    if (s.clear && H + s.boards.T + SKIRT_DROP > s.clear) continue;
    if (Lo - 2 * s.boards.T - (s.handles === 'bought' ? 2 * s.boards.T : 0) < s.minInner) continue;
    if (areaGuess(s, Lo, Do, H) > total) continue;
    const sc = score(s, Lo, Do, H);
    list.push({ Lo, Do, H, ...sc });
  }
  const prop = s.goal === 'proportions';
  list.sort(prop ? (a, b) => (a.dev <= 0.05 ? 0 : a.dev) - (b.dev <= 0.05 ? 0 : b.dev) || b.vol - a.vol : (a, b) => b.vol - a.vol || a.dev - b.dev);
  // First only chests that pass the checks. The first candidate that beat the result but did not
  // fit tells which material limits the size. When nothing passes, the fitting chest that exceeds
  // its limits the least.
  const MAX_TRIES = 600;
  let first = null, best = null, packs = 0, tries = 0, limitedBy = null;
  const trayFails = [];
  // the tray boards limit the chest only when the chest boards alone would take the larger one
  const chestFits = (d) => !!packBest(expand(parts(s, d).filter((p) => p.stock === 'chest')), { L, W, count: N, kerf: s.kerf, trim: s.trim });
  for (const c of list) {
    if (first) {
      // proportions: among the tie class near the first fit, fewer rips wins, then seams on the grid
      const sameClass = prop && (first.dev <= 0.05) === (c.dev <= 0.05) && (c.dev <= 0.05 || eq(c.dev, first.dev));
      if (!sameClass || c.vol < 0.9 * first.vol || packs > 40) break;
    }
    const d = design(s, c.Lo, c.Do, c.H);
    if (!d) continue;
    if ((s.trays > 0 && d.free < MIN_FREE) || !structuralOk(s, d)) continue;
    if (first) packs++;
    const lay = layout(s, d, trayFails);
    if (!lay.cheap && ++tries > MAX_TRIES) break;
    if (lay.fail) { if (!first && !limitedBy && lay.fail === 'tray' && chestFits(d)) limitedBy = 'tray'; if (!first && !limitedBy) limitedBy = 'none'; continue; }
    const cand = { d, lay, dev: c.dev, vol: c.vol, shift: d.wall.shift };
    if (!first) { first = c; best = cand; if (!prop) break; continue; }
    const k = (x) => [x.lay.rips, x.shift > 0 ? 1 : 0, Math.round(x.dev * 100), -x.vol];
    const ka = k(cand), kb = k(best);
    for (let i = 0; i < ka.length; i++) { if (ka[i] < kb[i]) { best = cand; break; } if (ka[i] > kb[i]) break; }
  }
  if (best) return { ...best, limitedBy: limitedBy === 'tray' ? 'tray' : null };
  // fallback: nothing passes the checks; the excess grows with the span, so shortest first
  let fb = null, n = 0;
  tries = 0;
  const byLen = [...list].sort((a, b) => a.Lo - b.Lo || a.dev - b.dev || b.vol - a.vol);
  for (const c of byLen) {
    if (n >= 30) break;
    const d = design(s, c.Lo, c.Do, c.H);
    if (!d) continue;
    const lay = layout(s, d, trayFails);
    if (!lay.cheap && ++tries > MAX_TRIES) break;
    if (lay.fail) continue;
    n++;
    const ex = exceed(s, d) + (s.trays > 0 && d.free < MIN_FREE ? 1 : 0);
    if (!fb || ex < fb.ex - 1e-9) fb = { d, lay, dev: c.dev, vol: c.vol, shift: d.wall.shift, ex };
  }
  return fb ? { ...fb, fallback: true, limitedBy: null } : { fail: true, tried: list.length };
}

// ---------------------------------------------------------------- validation, diagnosis

export function validate(s) {
  const errs = [];
  const chk = (v, [lo, hi], label) => { if (!(Number.isFinite(v) && v >= lo && v <= hi)) errs.push(`${label}: wpisz liczbę od ${lo} do ${hi}.`); };
  chk(s.boards.L, LIMITS.boardL, 'Długość deski'); chk(s.boards.W, LIMITS.boardW, 'Szerokość deski');
  chk(s.boards.T, LIMITS.boardT, 'Grubość deski'); chk(s.boards.N, LIMITS.boardN, 'Liczba desek');
  chk(s.kerf, LIMITS.kerf, 'Rzaz piły'); chk(s.trim, LIMITS.trim, 'Obcięcie końców');
  chk(s.minInner, LIMITS.minInner, 'Minimalna długość wewnętrzna'); chk(s.load, LIMITS.load, 'Obciążenie narzędziami');
  for (const k of ['L', 'D', 'H']) if (s.lock[k] != null) chk(s.lock[k], LIMITS[k], { L: 'Stała długość', D: 'Stała głębokość', H: 'Stała wysokość' }[k]);
  if (s.clear != null) chk(s.clear, LIMITS.clear, 'Wysokość pod stołem');
  if (![0, 1, 2].includes(s.trays)) errs.push('Liczba tac: 0, 1 albo 2.');
  if (s.trays > 0) {
    chk(s.trayH, LIMITS.trayH, 'Wysokość tacy');
    const tT = s.trayBoards ? s.trayBoards.T : s.boards.T;
    if (s.trayBoards) {
      chk(s.trayBoards.T, LIMITS.trayT, 'Grubość deski na tace'); chk(s.trayBoards.W, LIMITS.trayW, 'Szerokość deski na tace');
      chk(s.trayBoards.L, LIMITS.trayL, 'Długość deski na tace'); chk(s.trayBoards.N, LIMITS.trayN, 'Liczba desek na tace');
    }
    if (Number.isFinite(s.trayH) && Number.isFinite(tT)) {
      if (s.trayH < 3 * tT) errs.push(`Wysokość tacy: co najmniej ${3 * tT} mm (3 × grubość ścianki).`);
      else if (!fingerLayout(s.trayH, tT).ok) {
        const nv = nearestValid(s.trayH, tT, Math.max(LIMITS.trayH[0], 3 * tT), LIMITS.trayH[1]);
        const f5 = fingerLayout(s.trayH, tT);
        errs.push(`Wysokość tacy ${s.trayH} mm: ${f5.n} wczepów miałoby po ${R1(f5.w).toString().replace('.', ',')} mm, mniej niż grubość ścianki. Wybierz ${nv.join(' albo ')} mm.`);
      }
    }
  }
  if (!s.edgeGlue && s.lock.H != null && Number.isFinite(s.lock.H) && !eq(Math.round(s.lock.H / s.boards.W) * s.boards.W, s.lock.H))
    errs.push(`Bez klejenia krawędzi ściana to całe deski: wysokość ${[1, 2, 3, 4].map((k) => k * s.boards.W).filter((h) => h >= LIMITS.H[0] && h <= LIMITS.H[1]).join(', ') || '—'} mm.`);
  return errs;
}

export function diagnose(s) {
  const tips = [];
  const { L, W, T, N } = s.boards;
  if (!s.edgeGlue) {
    const ks = [1, 2, 3, 4].map((k) => k * W).filter((h) => h >= LIMITS.H[0] && h <= LIMITS.H[1]);
    if (!ks.length) tips.push(`Bez klejenia krawędzi ściana to całe deski na sobie, a z desek ${W} mm nie wychodzi wysokość 250–700 mm. Włącz klejenie krawędzi albo weź deski ${Math.ceil(LIMITS.H[0] / 2 / 10) * 10}–350 mm szerokie.`);
  }
  // the smallest chest that respects the inputs
  const Lo = s.lock.L || Math.max(LIMITS.L[0], Math.ceil((s.minInner + 2 * T + (s.handles === 'bought' ? 2 * T : 0)) / 10) * 10);
  const Do = s.lock.D || LIMITS.D[0];
  const H = s.lock.H || (s.edgeGlue ? 300 : [1, 2, 3].map((k) => k * W).find((h) => h >= LIMITS.H[0]) || 300);
  const d = design(s, Lo, Do, H);
  if (d) {
    const ps = parts(s, d), chest = ps.filter((p) => p.stock === 'chest');
    const longest = Math.max(...chest.map((p) => p.l));
    if (longest > L - 2 * s.trim) tips.push(`Dłuższe deski: najdłuższy element najmniejszej skrzyni ma ${Math.ceil(longest)} mm, a deska po obcięciu końców ${L - 2 * s.trim} mm.`);
    const need = Math.ceil((area(chest) * 1.15) / (W * (L - 2 * s.trim)));
    if (need > N) tips.push(`Więcej desek: najmniejsza skrzynia potrzebuje około ${need} desek ${L}×${W} mm.`);
    if (s.trayBoards && s.trays) {
      const tp = ps.filter((p) => p.stock === 'tray'), tb = s.trayBoards;
      const tn = Math.ceil((area(tp) * 1.15) / (tb.W * (tb.L - 2 * s.trim)));
      if (tn > tb.N) tips.push(`Więcej desek na tace: około ${tn}.`);
    }
  }
  if (s.minInner > 500) tips.push(`Mniejsza minimalna długość wewnętrzna (teraz ${s.minInner} mm).`);
  if (s.trays > 0) tips.push('Mniej tac albo niższe tace.');
  if (s.lock.L || s.lock.D || s.lock.H) tips.push('Zdejmij blokady wymiarów.');
  if (s.clear) tips.push(`Większa wysokość pod stołem (teraz ${s.clear} mm).`);
  return tips;
}

// ---------------------------------------------------------------- checks

function checks(s, d, mass) {
  const { W, T } = s.boards;
  const out = [];
  // lid: middle board, simply supported on the ends
  const span = d.inL + T, b = d.lid.glued ? d.lidPanel.depth : W, k = d.lid.glued ? 1 : 0.9;
  const I = (k * b * T ** 3) / 12;
  const def = (P_PERSON * span ** 3) / (48 * E * I), lim = span / 200;
  const sig = ((P_PERSON * span) / 4) * (T / 2) / I;
  const lidOk = def <= lim && sig <= SIGMA_MAX;
  out.push({ id: 'lid', name: 'Wieko: deska środkowa, osoba siedząca (1 kN w środku)', value: def, limit: lim, unit: 'mm', ok: def <= lim,
    detail: `rozpiętość ${R1(span)} mm, ${d.lid.glued ? `szerokość wieka ${Math.round(b)} mm` : `jedna deska ${W} mm na zakładkę (I − 10%)`}, E = ${E} MPa, L/200`,
    hint: def <= lim ? '' : d.lid.glued ? 'Grubsza deska na wieko.' : 'Włącz klejenie krawędzi albo weź grubszą deskę na wieko.' });
  out.push({ id: 'lidStress', name: 'Wieko: naprężenie przy zginaniu', value: sig, limit: SIGMA_MAX, unit: 'MPa', ok: sig <= SIGMA_MAX,
    detail: 'σ = M / W, ten sam przypadek', hint: sig <= SIGMA_MAX ? '' : `Deska może pęknąć. ${d.lid.glued ? 'Grubsza deska na wieko.' : 'Włącz klejenie krawędzi albo weź grubszą deskę na wieko.'}` });
  // bottom: narrowest board, 1 kN in the middle
  const bw = Math.min(...d.bottom.widths), bspan = d.inD - CLEAT_PROJ, bI = (bw * T ** 3) / 12;
  const bdef = (P_PERSON * bspan ** 3) / (48 * E * bI), blim = bspan / 200;
  out.push({ id: 'bottom', name: 'Dno: najwęższa deska, 1 kN w środku', value: bdef, limit: blim, unit: 'mm', ok: bdef <= blim,
    detail: `deska ${R1(bw)} mm, rozpiętość ${R1(bspan)} mm (do osi listew), E = ${E} MPa, L/200 (dno skrzyni, nie podłoga)`, hint: bdef <= blim ? '' : 'Grubsze deski dna.' });
  const bsig = ((P_PERSON * bspan) / 4) * (T / 2) / bI;
  out.push({ id: 'bottomStress', name: 'Dno: naprężenie przy zginaniu', value: bsig, limit: SIGMA_MAX, unit: 'MPa', ok: bsig <= SIGMA_MAX,
    detail: 'σ = M / W, ten sam przypadek', hint: bsig <= SIGMA_MAX ? '' : 'Deska może pęknąć. Grubsze deski dna.' });
  // cleat screws: twice the loaded chest
  const loadN = 2 * (mass + s.load) * 9.81, screws = Math.ceil(loadN / 1000 / SCREW_KN);
  const perCleat = Math.max(4, Math.ceil(screws / 2), Math.ceil(d.inL / 150) + 1);
  out.push({ id: 'cleats', name: 'Listwy nośne dna: wkręty', value: perCleat, limit: Math.ceil(screws / 2), unit: 'szt. na listwę', ok: true,
    detail: `2 × (${Math.round(mass)} kg skrzyni + ${s.load} kg narzędzi) = ${R1(loadN / 1000)} kN, ${SCREW_KN} kN na wkręt` });
  return out;
}

// ---------------------------------------------------------------- build

export function build(state) {
  const s = state;
  const errors = validate(s);
  if (errors.length) return { ok: false, errors, tips: [] };
  const found = search(s);
  if (found.fail) return { ok: false, errors: [], tips: diagnose(s) };
  const { d, lay } = found;
  const { T } = s.boards;
  const ps = lay.parts;
  // mass: all parts, density 500
  const vol = ps.reduce((a, p) => a + p.qty * p.l * p.w * p.t, 0);
  const mass = (vol * 1e-9) * DENSITY;
  const trayMassExtra = s.trayBoards || !d.trays.length ? 0 : ps.filter((p) => /^t(Long|End|Bot|Cleat|Div)/.test(p.key)).reduce((a, p) => a + p.qty * p.l * p.w * p.t, 0) * 1e-9 * DENSITY * (1 - 12 / T);
  const fingersTotal = 4 * d.nPerCorner + 4 * d.skirt.n + d.trays.length * 4 * d.trayFl.n + 2 * 3;
  const chk = checks(s, d, mass);
  const fast = fasteners(s, d, chk.find((c) => c.id === 'cleats').value);
  const hw = hardware(s, d);
  const warnings = [];
  for (const c of chk) if (!c.ok) warnings.push(`${c.name}: ${fmt1(c.value)} ${c.unit} przy granicy ${fmt1(c.limit)} ${c.unit}. ${c.hint}`);
  if (d.trays.length && d.free < MIN_FREE) warnings.push(`Pod tacami zostaje ${Math.round(d.free)} mm wolnej wysokości nad dnem, mniej niż ${MIN_FREE} mm.`);
  if (s.boards.T >= 24 && d.H < 300 && d.skirt.h > 0.3 * d.H) warnings.push(`Cokół ${fmt1(d.skirt.h)} mm to ponad 0,3 wysokości ściany — skrzynia wygląda ciężko u dołu.`);
  if (found.fallback) warnings.push('Żadna skrzynia z tych desek nie przechodzi kontroli; pokazana przekracza granice najmniej.');
  const notes = [];
  const t = d.total, dev = Math.max(Math.abs(t.D / t.L - 0.55), Math.abs(t.H / t.L - 0.6));
  const LIMIT_NAME = { chest: 'deski skrzyni', tray: 'deski na tace' };
  if (found.limitedBy) notes.push(`Większą skrzynię ogranicza materiał: ${LIMIT_NAME[found.limitedBy]}.`);
  if (s.goal === 'proportions' && dev > 0.05) notes.push(`Proporcje obrysu odbiegają od 1 : 0,55 : 0,6 o ${fmt1(dev * 100)}% (głębokość ${(t.D / t.L).toFixed(2).replace('.', ',')}, wysokość ${(t.H / t.L).toFixed(2).replace('.', ',')})${found.limitedBy ? ` — ograniczają je ${LIMIT_NAME[found.limitedBy]}` : ' — ograniczają je blokady, tace albo kontrole wieka i dna'}.`);
  const behind = d.lid.depth * Math.sin((10 * Math.PI) / 180) + T;
  notes.push(`Żeby otworzyć wieko na 100°, za skrzynią potrzeba około ${Math.round(behind / 10) * 10} mm wolnego miejsca.`);
  if (s.clear && d.H + d.lid.depth > s.clear) notes.push(`Pod stołem (${s.clear} mm) wieko się nie otworzy: potrzeba ${Math.round(d.H + d.lid.depth)} mm. Skrzynię trzeba wysunąć.`);
  if (trayMassExtra > 0.05) notes.push(`Tace z desek skrzyni są cięższe o około ${fmt1(trayMassExtra)} kg niż z desek 12 mm.`);
  const holes = d.trays.map(() => trayHole(s, d));
  const res = {
    ok: true, d, parts: ps, layout: { chest: lay.chest, tray: lay.tray }, rips: lay.rips, limitedBy: found.limitedBy, fallback: !!found.fallback,
    fingers: { total: fingersTotal, hours: (fingersTotal * MIN_PER_FINGER) / 60, corners: 4 + 4 + 4 * d.trays.length + 2 },
    fasteners: fast, hardware: hw, checks: chk, warnings, notes, mass, trayMassExtra, holes,
  };
  res.difficulty = difficulty(s, fingersTotal);
  res.tools = tools(s, d);
  res.plan = plan(s, d, res);
  res.geometry = geometry(s, d, holes);
  return res;
}

const fmt1 = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');

export function trayHole(s, d) {
  const wt = d.trayFl.w, j = Math.ceil(25 / wt - 1e-9), hh = Math.ceil(25 / wt - 1e-9) * wt;
  const hl = Math.max(100, Math.ceil((3 * hh) / 10 - 1e-9) * 10), below = j * wt;
  const rest = s.trayH - below - hh - (15 + d.tT);
  return rest >= 20 ? { kind: 'hole', top: below, h: hh, len: hl } : { kind: 'cutout', top: 0, h: below + hh, len: hl };
}

// ---------------------------------------------------------------- fasteners and hardware

const hingeLen = (T) => (T < 16 ? 40 : T < 24 ? 50 : 60);
const sideApronScrew = (T) => (T < 16 ? [3.5, 50] : T < 28 ? [5, 60] : [5, 80]);
const chainScrew = (T) => [...HINGE_SCREWS].reverse().find(([, l]) => l <= T - 3);

function fasteners(s, d, cleatScrews) {
  const { T } = s.boards;
  const out = [];
  // nails: never longer than the material along them minus 3 mm, and no longer than 3T
  const nail = (joint, depth, count, note) => { const n = nailUpTo(Math.min(depth - 3, 3 * T)); out.push({ joint, item: 'gwóźdź kuty lub cięty, czerniony', size: `${n} mm`, len: n, qty: count, note }); };
  const screw = (joint, depth, count, note, minD) => { const sc = screwUpTo(depth - 3, minD); out.push({ joint, item: 'wkręt do drewna, czerniony', size: screwName(sc), len: sc && sc[1], qty: count, note }); };
  // through a strip into the wall: counterbore the strip so the screw enters the wall T − 3
  const through = (joint, strip, count, note) => {
    const sc = screwUpTo(strip + T - 3);
    const cb = Math.max(0, strip - (sc[1] - (T - 3)));
    out.push({ joint, item: 'wkręt do drewna, czerniony', size: screwName(sc), len: sc[1], qty: count, note: `${note}; otwór pogłębiony ${fmt1(cb)} mm, w ścianę ${T - 3} mm` });
  };
  // skirt: one line on the axis of the visible skirt, from 2T off the carcass corners, ≤ 150 apart
  const skirtRow = (len) => Math.ceil((len - 4 * T) / 150) + 1;
  nail('Cokół → ściany', 2 * T, 2 * skirtRow(d.Lo) + 2 * skirtRow(d.Do), `jedna linia ${fmt1(d.skirt.h / 2 - SKIRT_DROP)} mm nad dołem ścian (oś cokołu), co ≤ 150 mm, skrajne ≥ ${2 * T} mm od narożników`);
  through('Listwa nośna dna → przód / tył', CLEAT_PROJ, 2 * cleatScrews, 'od środka, plus klej');
  const bn = d.bottom.widths.reduce((a, w) => a + 2 * (w > 150 ? 2 : 1), 0);
  nail('Dno → listwy nośne', T + T * Math.ceil(20 / T), bn, 'z góry; jeden gwóźdź w osi deski, przy deskach > 150 mm dwa w środkowej ⅓');
  if (d.stacked) through('Listwa pionowa → bok', 20, 2 * d.wall.strips.length, 'jeden wkręt w oś każdej deski boku');
  for (const tr of d.trays) through('Prowadnica tacy → przód / tył', tr.proj, 2 * (Math.ceil(d.inL / 150) + 1), 'od środka, plus klej');
  if (d.trays.length > 1) through('Listwa prowadząca → przód / tył', d.p1, 2 * (Math.ceil(d.inL / 150) + 1), 'plus klej');
  if (s.handles === 'wood') screw('Uchwyt → bok', T + d.handle.layers * T, 8, 'od środka; plus klej na długich włóknach');
  // lid
  const bScrews = d.lid.glued ? Math.ceil(d.batten.cut / 150) + 1 : shiplapBoards(d.lidPanel.depth, s.boards.W).length;
  screw('Listwa wieka → wieko', 2 * T, 2 * bScrews, d.lid.glued ? `stały przy przodzie, dalej otwory podłużne do tyłu (1% odległości od stałego + 2 mm, najdalszy ${fmt1(0.01 * d.batten.cut + 2)} mm)` : 'jeden stały wkręt w osi każdej deski');
  const sa = sideApronScrew(T);
  out.push({ joint: 'Fartuch boczny → wieko', item: 'wkręt do drewna, czerniony', size: screwName(sa), len: sa[1], qty: 2 * (d.lid.depth > 300 ? 3 : 2), note: `w czoło wieka, nawiercić; stały przy przodzie, pozostałe w otworach podłużnych ≥ ${fmt1(0.015 * d.lid.depth)} mm, ≥ 30 mm od tyłu; bez kleju` });
  nail('Fartuch przedni → krawędź wieka', T + s.boards.W - 2, Math.ceil(d.lid.len / 150) + 1, `jedna linia ${fmt1(T / 2)} mm pod wierzchem wieka; plus klej`);
  return out;
}

function hardware(s, d) {
  const { T } = s.boards;
  const hinges = d.lid.len > 800 ? 3 : 2;
  const hs = chainScrew(T);
  const out = [
    { item: 'Zawias wpuszczany, stal czerniona', size: `${hingeLen(T)} mm, skrzydełko ≤ ${T} mm`, qty: hinges, note: `w równych odstępach od końców, ≥ 20 mm od listew wieka; wkręty ${screwName(hs)} (≤ T − 3)` },
    { item: 'Wkręt do zawiasów, czerniony', size: screwName(hs), qty: hinges * 8, note: '' },
    { item: 'Łańcuszek ogranicznika, stal czerniona', size: `≈ ${Math.round(Math.sqrt(2) * 0.55 * d.inD / 10) * 10} mm`, qty: 1, note: 'otwarcie ≈ 100°; do bocznej powierzchni listwy wieka i do boku skrzyni' },
    { item: 'Wkręt do łańcuszka, czerniony', size: screwName(hs), qty: 2, note: 'oba na ścinanie' },
  ];
  if (s.handles === 'bought') {
    const bl = Math.ceil((2 * T + 6 + 15) / 5) * 5;
    out.push({ item: 'Uchwyt kupny, stal czerniona', size: `rozstaw ≤ ${d.handle.len - 40} mm`, qty: 2, note: 'na wysokości uchwytów drewnianych' });
    out.push({ item: 'Śruba M6, czerniona', size: `M6×${bl}`, qty: 4, note: 'na wylot przez stopkę, bok i klocek' });
    out.push({ item: 'Podkładka M6, czerniona', size: 'M6', qty: 8, note: '' });
    out.push({ item: 'Nakrętka kołpakowa M6, czerniona', size: 'M6', qty: 4, note: 'od środka, żeby nie zaczepiała narzędzi' });
  }
  if (d.trays.length) {
    const per = d.trays[0].bottom ? d.trays[0].bottom.boards : 1;
    out.push({ item: 'Gwoździk do dna tacy, czerniony', size: '20 mm', qty: 2 * per * d.trays.length, note: per > 1 ? 'po jednym w osi każdej deski dna nad każdą listewką' : 'jeden w środku każdej listewki' });
  }
  out.push({ item: 'Klej do drewna o czasie otwartym ≥ 15 min', size: 'glutynowy w płynie albo PVA wolnowiążący', qty: 1, note: 'około 0,5 kg' });
  if (s.finish === 'paint') out.push({ item: 'Farba mleczna', size: 'jeden kolor', qty: 1, note: 'cały zewnętrzny korpus z cokołem i fartuchem' });
  else out.push({ item: 'Twardy olej-wosk', size: 'zewnątrz', qty: 1, note: 'nie zabiera wczepom kontrastu drewna czołowego' });
  out.push({ item: 'Szelak albo wosk', size: 'środek i tace', qty: 1, note: 'bez oleju lnianego w środku; bez wykończenia na klejonych powierzchniach' });
  return out;
}

// ---------------------------------------------------------------- difficulty, tools, plan

function difficulty(s, fingers) {
  const tech = [
    [`Wczepy proste (finger joint), ${fingers} sztuk`, 4],
    ['Fugowanie i klejenie krawędzi', s.edgeGlue ? 3 : 0],
    ['Zakładka w deskach wieka', s.edgeGlue ? 0 : 3],
    ['Wpust pod przegródkę tacy', s.trays ? 3 : 0],
    ['Wpuszczanie zawiasów', 3],
    ['Otwór na dłoń: wiercenie i piłowanie', s.trays ? 2 : 0],
    ['Cięcie wzdłuż i w poprzek', 1],
  ].filter(([, l]) => l > 0);
  const hardest = Math.max(...tech.map(([, l]) => l));
  const level = Math.min(5, hardest + (tech.filter(([, l]) => l >= 2).length >= 4 ? 1 : 0));
  return { level, techniques: tech };
}

function tools(s, d) {
  return [
    'Piła płatnica (cięcie w poprzek i wzdłuż)', 'Piła grzbietnica do wczepów', 'Dłuta 6, 12 i 20 mm, pobijak',
    'Strug spustnik do fugowania krawędzi', 'Strug wygładzik', 'Kątownik, znacznik, cyrkiel do trasowania wczepów',
    `Ściski, co najmniej 4, o rozstawie ≥ ${Math.ceil((d.Lo + 50) / 50) * 50} mm`, 'Przekładki (cauls) do klejenia',
    'Wiertarka ręczna z wiertłami do nawiercania pod gwoździe i wkręty, pogłębiacz', 'Wiertło 25–30 mm do otworów na dłoń',
    'Śrubokręt, młotek', 'Papier ścierny i klocek',
  ];
}

function plan(s, d, res) {
  const { T } = s.boards;
  const f = fmt1;
  const steps = [];
  steps.push(['Drewno', `Deski aklimatyzuj w warsztacie do wilgotności 8–12%. Wystrugaj na grubość ${T} mm. Najładniejszą deskę zostaw na przód i wieko; sęki trzymaj ≥ ${T + 20} mm od końców elementów i poza gniazdami zawiasów.`]);
  steps.push(['Rozkrój', `Tnij według rozkroju: najpierw w poprzek na odcinki, potem wzdłuż na pasy (${res.rips} cięć wzdłuż), potem pasy w poprzek. Elementy z wczepami są o 1 mm dłuższe od wymiaru zewnętrznego; listwy i dno o 2 mm krótsze od wnętrza, żeby nie klinowały się przy montażu.`]);
  if (s.edgeGlue && d.wall.strips.length > 1) steps.push(['Klejenie ścian', 'Pasy jednej ściany tnij kolejno z jednej deski, ze zgodnym kierunkiem słojów. Pełny pas na górze, resztówka na dole. Fuguj krawędzie spustnikiem (pas pełny traci 2 mm), sklej, po wyschnięciu wyrównaj. Wczepy trasujesz dopiero na sklejonej ścianie — szew może wypaść w środku wczepu.']);
  if (!s.edgeGlue) steps.push(['Ściany z desek', `Każda ściana to ${d.wall.strips.length} deski na sobie bez kleju w szwie; każda deska ma własne wczepy (${d.n} po ${f(d.w)} mm). Od środka na każdym boku pionowa listwa przez całą wysokość, jeden wkręt w oś każdej deski — tak każda deska trzyma się uchwytów.`]);
  steps.push(['Narożnik próbny', `Na odpadzie wytnij jeden narożnik: ${d.n} wczepów po ${f(d.w)} mm, głębokość ${f(T + 0.5)} mm. Sprawdź pasowanie na sucho, zanim zaczniesz właściwe elementy.`]);
  steps.push(['Wczepy korpusu', `Trasuj od dołu ścian, od wczepów, nie od miarki. Przód i tył trzymają wczepy skrajne u góry i u dołu. Razem ${res.fingers.total} wczepów (ok. ${Math.round(res.fingers.hours)} h).`]);
  const lists = [`listwy nośne dna (${CLEAT_PROJ} mm wysięgu)`];
  if (d.trays.length) lists.push(`prowadnice tac (wierzch na ${d.trays.map((t) => f(t.runnerTop)).join(' i ')} mm od dołu ścian)`);
  if (d.trays.length > 1) lists.push(`listwy prowadzące między prowadnicami (${f(d.trays[1].runnerTop)}–${f(d.trays[0].runnerBot)} mm)`);
  steps.push(['Listwy nośne i prowadnice', `Przyklej i przykręć od środka ${lists.join(', ')} do przodu i tyłu. Otwory w listwach pogłęb tak, żeby wkręt wszedł w ścianę na ${T - 3} mm. Zrób to przed klejeniem korpusu, póki ściany leżą płasko.`]);
  steps.push(['Klejenie korpusu', 'Montaż na sucho ze ściskami i przekładkami. Klej o czasie otwartym ≥ 15 min, co najmniej 4 ściski dłuższe od skrzyni o 50 mm. Sprawdź przekątne. Po wyschnięciu zestrugaj wczepy na równo.']);
  steps.push(['Dno', `Deski dna (${d.bottom.widths.map(f).join(' + ')} mm) połóż na listwach ze szczelinami ${f(d.bottom.gap)} mm i 3 mm luzu przy bokach. Przybij z góry w listwy: jeden gwóźdź w osi deski, przy deskach > 150 mm dwa w środkowej ⅓. Dna nie klej.`]);
  steps.push(['Cokół', `Sklej ramę cokołu (${f(d.skirt.h)} mm, ${d.skirt.n} wczepy) na sucho dopasowaną do korpusu, wewnątrz 0,5 mm większą. Nasuń od dołu z klejem, tak by stała ${SKIRT_DROP} mm niżej niż ściany, i przybij jedną linią gwoździ w osi cokołu.`]);
  const sa = sideApronScrew(T);
  steps.push(['Wieko', `${d.lid.glued ? `Sklej płytę wieka ${f(d.lidPanel.len)} × ${f(d.lidPanel.depth)} mm z pasów (reszta z tyłu przy zawiasach).` : 'Deski płyty wieka połącz na zakładkę z 1,5 mm luzu w każdej zakładce.'} Fartuch ${f(d.apron.h)} mm obejmuje płytę, wierzchy równo: przód przyklejony i przybity do krawędzi płyty, boki bez kleju — wczep przy przodzie, wkręt ${screwName(sa)} stały przy przodzie i 1–2 w otworach podłużnych ≥ ${f(0.015 * d.lid.depth)} mm, ≥ 30 mm od tyłu. Listwy ${T}×50×${d.batten.cut} mm 30 mm od boków: ${d.lid.glued ? `wkręt stały przy przodzie, dalej otwory podłużne do tyłu (1% odległości od stałego + 2 mm, najdalszy ${f(0.01 * d.batten.cut + 2)} mm)` : 'jeden stały wkręt w osi każdej deski'}; bez kleju.`]);
  steps.push(['Uchwyty', s.handles === 'wood'
    ? `Sklej ${d.handle.layers} warstwy na uchwyt (${d.handle.len}×${f(d.handle.h)} mm), podetnij od spodu pod palce fazką 45° na ${f(d.handle.undercut)} mm. Przyklej wzdłuż włókien i przykręć od środka, wierzch na ${f(d.handle.top)} mm od dołu ścian.`
    : `Wklej od środka klocki podkładowe i przykręć uchwyty śrubami M6 na wylot z podkładkami i nakrętkami kołpakowymi, wierzch na ${f(d.handle.top)} mm. Tace zaczynają się za nakrętkami.`]);
  if (d.trays.length) {
    const h = res.holes[0];
    const clr = d.trays.map((t, i) => `${d.trays.length > 1 ? (i ? 'dolna ' : 'górna ') : ''}${f(t.bottom.clearance)} mm`).join(', ');
    steps.push(['Tace', `Tace ${s.trayH} mm z desek ${d.tT} mm, ${d.trayFl.n} wczepów po ${f(d.trayFl.w)} mm. Dno na listewkach przy ściankach długich, słoje między nimi, luz w poprzek słojów ${clr}; ${d.trays[0].bottom.boards > 1 ? 'po jednym gwoździku w osi każdej deski dna nad każdą listewką' : 'jeden gwoździk w środku każdej listewki'}. Przegródka we wpuście ${f(d.tT / 3)} mm. ${h.kind === 'hole' ? `Otwór na dłoń ${f(h.h)}×${h.len} mm, ${f(h.top)} mm pod krawędzią: dwa otwory wiertłem i piła między nimi.` : `Wycięcie na dłoń od góry, ${f(h.h)} mm głębokie.`}${d.trays.length > 1 ? ' Dolna taca jest węższa i chodzi między listwami prowadzącymi.' : ''}`]);
  }
  steps.push(['Krawędzie', 'Jedna fazka 1,5 mm na wszystkich krawędziach, także na narożach wczepów po zestruganiu; bez fazek wzdłuż linii wczepów. Spód cokołu fazka 3 mm, dolna krawędź przedniego fartucha 45° × 5 mm jako chwyt.']);
  steps.push(['Wykończenie', s.finish === 'paint' ? 'Farba mleczna w jednym kolorze na cały zewnętrzny korpus z cokołem i fartuchem; w środku i na tacach szelak albo wosk. Klejonych powierzchni nie wykańczaj.' : 'Na zewnątrz twardy olej-wosk, w środku i na tacach szelak albo wosk, bez oleju lnianego. Spód cokołu naolejuj. Klejonych powierzchni nie wykańczaj.']);
  steps.push(['Okucia', `Wpuść ${res.hardware[0].qty} zawiasy ${hingeLen(T)} mm (stal czerniona) w równych odstępach od końców, wkręty ≤ ${T - 3} mm. Łańcuszek ogranicznika do bocznej powierzchni listwy wieka i do boku skrzyni. Okucia zakładaj po wykończeniu.`]);
  return steps;
}

// ---------------------------------------------------------------- geometry

/**
 * Boxes for the drawings and the 3D model: {x0,x1,y0,y1,z0,z1, kind, lid?}. Finger zones are
 * separate boxes (kind 'fingerA' for fingers of the front/back, 'fingerB' for the ends).
 */
export function geometry(s, d, holes) {
  const { T } = s.boards;
  const B = [];
  const box = (x0, x1, y0, y1, z0, z1, kind, extra = {}) => B.push({ x0, x1, y0, y1, z0, z1, kind, ...extra });
  // a finger-jointed frame; long sides (along x) hold the even fingers (top and bottom)
  const frame = (x0, x1, y0, y1, z0, z1, t, kind, n, extra = {}) => {
    const fw = (z1 - z0) / n;
    for (const [a, b] of [[y0, y0 + t], [y1 - t, y1]]) box(x0 + t, x1 - t, a, b, z0, z1, kind, { ...extra, face: a === y0 ? 'front' : 'back' });
    for (const [a, b] of [[x0, x0 + t], [x1 - t, x1]]) box(a, b, y0 + t, y1 - t, z0, z1, kind, { ...extra, face: 'end' });
    for (let i = 0; i < n; i++) for (const [xa, xb] of [[x0, x0 + t], [x1 - t, x1]]) for (const [ya, yb] of [[y0, y0 + t], [y1 - t, y1]])
      box(xa, xb, ya, yb, z0 + i * fw, z0 + (i + 1) * fw, i % 2 === 0 ? 'fingerA' : 'fingerB', extra);
  };
  const { Lo, Do, H } = d;
  if (d.stacked) d.wall.strips.forEach((_, i) => frame(0, Lo, 0, Do, i * s.boards.W, (i + 1) * s.boards.W, T, 'wall', d.n));
  else frame(0, Lo, 0, Do, 0, H, T, 'wall', d.n);
  const seams = d.wall.seams;
  // bottom
  const cleatH = T * Math.ceil(20 / T);
  box(T + 1, Lo - T - 1, T, T + CLEAT_PROJ, 0, cleatH, 'cleat'); box(T + 1, Lo - T - 1, Do - T - CLEAT_PROJ, Do - T, 0, cleatH, 'cleat');
  { let x = T + 3; for (const bw of d.bottom.widths) { box(x, x + bw, T + 1, Do - T - 1, cleatH, cleatH + T, 'bottom'); x += bw + d.bottom.gap; } }
  // vertical cleats tying stacked boards
  if (d.stacked) for (const [xa, xb] of [[T, T + 20], [Lo - T - 20, Lo - T]]) box(xa, xb, Do / 2 - 20, Do / 2 + 20, cleatH + T + 5, H - T - 5, 'cleat');
  // skirt
  frame(-T, Lo + T, -T, Do + T, -SKIRT_DROP, d.skirt.h - SKIRT_DROP, T, 'skirt', d.skirt.n);
  // handles: wooden blocks with the undercut drawn as a step, or bought handles on backing blocks
  for (const side of [-1, 1]) {
    const out0 = side < 0 ? -d.handle.proj : Lo, out1 = side < 0 ? 0 : Lo + d.handle.proj;
    const y0 = Do / 2 - d.handle.len / 2, y1 = Do / 2 + d.handle.len / 2;
    if (s.handles === 'wood') {
      const u = d.handle.undercut, zMid = d.handle.bot + u;
      box(out0, out1, y0, y1, zMid, d.handle.top, 'handle', { side });
      const in0 = side < 0 ? -d.handle.proj + u : Lo, in1 = side < 0 ? 0 : Lo + d.handle.proj - u;
      box(in0, in1, y0, y1, d.handle.bot, zMid, 'handle', { side });
    } else {
      box(side < 0 ? -12 : Lo, side < 0 ? 0 : Lo + 12, y0 + 20, y1 - 20, d.handle.bot, d.handle.top, 'metal', { side });
      box(side < 0 ? T : Lo - 2 * T, side < 0 ? 2 * T : Lo - T, y0, y1, d.handle.bot, d.handle.top, 'cleat', { side });
    }
  }
  // runners, guides, trays
  d.trays.forEach((tr, i) => {
    for (const [a, b] of [[T, T + tr.proj], [Do - T - tr.proj, Do - T]]) box(T + 1, Lo - T - 1, a, b, tr.runnerBot, tr.runnerTop, 'runner');
    const x0 = d.trayX, x1 = x0 + tr.len, y0 = T + inDOff(d, i), y1 = Do - T - inDOff(d, i);
    frame(x0, x1, y0, y1, tr.bot, tr.top, d.tT, 'tray', d.trayFl.n, { tray: i });
    box(x0 + d.tT, x1 - d.tT, y0 + d.tT, y1 - d.tT, tr.bot + 15, tr.bot + 15 + d.tT, 'trayBottom', { tray: i });
    const xm = (x0 + x1) / 2;
    box(xm - d.tT / 2, xm + d.tT / 2, y0 + d.tT * 2 / 3, y1 - d.tT * 2 / 3, tr.bot + 15 + d.tT, tr.top - 10, 'tray', { tray: i, face: 'divider' });
    const h = holes[i];
    B.push({ kind: 'hole', tray: i, x: [x0, x1], yc: (y0 + y1) / 2, zTop: tr.top - h.top, h: h.h, len: h.len, cutout: h.kind === 'cutout' });
  });
  if (d.trays.length > 1) {
    const g0 = d.trays[1].runnerTop, g1 = d.trays[0].runnerBot;
    for (const [a, b] of [[T, T + d.p1], [Do - T - d.p1, Do - T]]) box(T + 1, Lo - T - 1, a, b, g0, g1, 'runner');
  }
  // lid (closed position): the apron encloses the panel, tops flush; the 3D model turns boxes
  // with lid: true about the hinge axis y = Do, z = H
  const LD = d.lid.depth, LL = d.lid.len, ly0 = Do - LD, lx0 = -d.lid.ovE, lx1 = Lo + d.lid.ovE;
  const top = H + T, az0 = top - d.apron.h;
  box(lx0 + T, lx1 - T, ly0 + T, Do, H, top, 'lid', { lid: true });
  box(lx0 + T, lx1 - T, ly0, ly0 + T, az0, top, 'apron', { lid: true, face: 'front' });
  box(lx0, lx0 + T, ly0 + T, Do, az0, top, 'apron', { lid: true, face: 'end' });
  box(lx1 - T, lx1, ly0 + T, Do, az0, top, 'apron', { lid: true, face: 'end' });
  for (let i = 0; i < 3; i++) for (const [xa, xb] of [[lx0, lx0 + T], [lx1 - T, lx1]])
    box(xa, xb, ly0, ly0 + T, az0 + i * d.apron.fw, az0 + (i + 1) * d.apron.fw, i % 2 === 0 ? 'fingerA' : 'fingerB', { lid: true });
  const by0 = T + (d.inD - d.batten.cut) / 2;
  for (const xa of [T + 30, Lo - T - 30 - 50]) box(xa, xa + 50, by0, by0 + d.batten.cut, H - T, H, 'batten', { lid: true });
  // hinges at equal distances from both ends, ≥ 20 mm from the battens
  const nh = LL > 800 ? 3 : 2, hx = [], hl = hingeLen(T);
  const edge = T + 30 + 50 + 20 + hl / 2;
  if (nh === 2) hx.push(edge, Lo - edge); else hx.push(edge, Lo / 2, Lo - edge);
  for (const x of hx) box(x - hl / 2, x + hl / 2, Do, Do + 2, H - Math.min(40, T + 15), H, 'hinge', { hingeX: x });
  return { boxes: B, seams, hinges: hx, hingeLen: hl, lidAxis: { y: Do, z: H } };
}

const inDOff = (d, i) => (i === 0 ? 2 : d.p1 + 2);
