// Turns the project state into a list of timber members, sheet pieces and roof covering,
// plus structural checks. Pure functions, no DOM, so it also runs under Node for tests.
//
// Coordinates: x along the length L, y along the width W, z up; origin at the outer
// bottom corner of the 100×100 base frame. Wall coordinate U runs along a wall as seen
// from outside, from its left outer corner.

import { SECTIONS, WALL_IDS, WALL_NAMES } from './model.js';

const T = 45;          // timber thickness
const D = 95;          // timber depth = wall depth
const BEAM = 100;      // base beam section
const E = 11000;       // C24 mean modulus, MPa
const SHEET_W = 1250, SHEET_H = 2500;
const R = Math.round;
const EPS = 1e-6;

export function build(s) {
  const { L, W } = s.dims;
  const out = { members: [], wallSheets: [], floorSheets: [], cover: [], checks: [], warnings: [], walls: {}, info: {} };
  const a = (s.roof.pitch * Math.PI) / 180, tn = Math.tan(a), cs = Math.cos(a), sn = Math.sin(a);
  const zf = BEAM + D + s.floor.sheetT;          // top of floor
  const h0 = s.walls.h0;
  const mono = s.roof.type === 'mono', backHigh = s.roof.highSide !== 'front';

  // Birdsmouth seat: full plate width, but the notch may not cut deeper than 1/3 of the rafter.
  const sw = Math.min(D, D / 3 / Math.max(sn, EPS));
  // Underside of the rafters as a function of y; it meets each wall plate at the uphill end of the seat.
  const zr = (y) => {
    if (!mono) return zf + h0 + (Math.min(y, W - y) - sw) * tn;
    return zf + h0 + (backHigh ? y - sw : W - sw - y) * tn;
  };
  const Tf = mono ? (backHigh ? zr(sw) : zr(D - sw)) : zr(sw);
  const Tb = mono ? (backHigh ? zr(W - D + sw) : zr(W - sw)) : zr(W - sw);
  const pv = T / cs;                               // vertical thickness of a sloped plate
  Object.assign(out.info, { zf, Tf, Tb, a, tn, cs, sn, pv, zr, sw, notch: sw * sn, ridge: mono ? null : zr(W / 2) });
  if (sw < (2 * D) / 3 - 0.5) out.warnings.push(`Przy spadku ${s.roof.pitch}° siedzisko krokwi na oczepie ma tylko ${R(sw)} mm (wrąb ograniczony do 1/3 krokwi) – mocuj każdą krokiew łącznikiem krokwiowym albo zmniejsz spadek.`);

  const add = (m) => { m.len = R(m.len); out.members.push(m); return m; };

  // Bearing partitions (along the length) carry the rafters: their top plate meets the rafter
  // underside with the same birdsmouth seat as the outer plates; the height follows from the roof.
  const bearingTop = (c) => {
    const y0 = c - D / 2, y1 = c + D / 2, z0 = zr(y0), z1 = zr(y1);
    if (!mono && y0 < W / 2 && y1 > W / 2) return zr(W / 2);
    if (Math.abs(z1 - z0) < 1e-6) return z0;
    return z1 > z0 ? zr(y0 + sw) : zr(y1 - sw);
  };
  const parts = s.partitions.map((p) => (p.bearing && p.orient === 'x' ? { ...p, h: bearingTop(p.c) - zf, Tp: bearingTop(p.c) } : { ...p, bearing: false }));
  const bearing = parts.filter((p) => p.bearing);
  out.info.parts = parts;
  // rafter supports across the width; the roof width each eaves wall carries
  const supAll = [D / 2, W - D / 2, ...bearing.map((p) => p.c), ...(mono ? [] : [W / 2])].sort((p, q) => p - q);
  out.info.supAll = supAll;
  const eaveTrib = (front) => (bearing.length ? (front ? supAll[1] - supAll[0] : supAll[supAll.length - 1] - supAll[supAll.length - 2]) / 2 : W / 2) + s.roof.ovhEave;
  out.info.eaveTrib = Math.max(eaveTrib(true), eaveTrib(false));

  // ---------- base frame ----------
  const nT = Math.max(2, Math.ceil((L - BEAM) / s.base.maxSpan) + 1);
  const beamX = [...Array(nT)].map((_, i) => (i * (L - BEAM)) / (nT - 1));
  for (const [y0, side] of [[0, 'przód'], [W - BEAM, 'tył']]) {
    for (const [x0, x1] of splitAtSupports(0, L, beamX.map((x) => x + BEAM / 2), s.stock.b100.len))
      add({ kind: 'beam', sec: 'b100', len: x1 - x0, group: 'base', name: `Belka podłużna (${side})`, note: x1 - x0 < L ? 'styk nad belką poprzeczną' : '', shape: box('xy', x0, y0, x1, y0 + BEAM, 0, BEAM) });
  }
  for (const x0 of beamX)
    add({ kind: 'beam', sec: 'b100', len: W - 2 * BEAM, group: 'base', name: 'Belka poprzeczna', note: 'na wieszakach w belkach podłużnych', shape: box('xy', x0, BEAM, x0 + BEAM, W - BEAM, 0, BEAM) });
  // supports under the middle of transverse beams: as many as needed to keep spans ≤ maxSpan
  const nMid = s.base.midSupport === 'no' ? 0 : Math.max(s.base.midSupport === 'yes' ? 1 : 0, s.base.midSupport === 'auto' && W > 2000 ? Math.ceil((W - BEAM) / s.base.maxSpan - EPS) - 1 : 0);
  const mid = nMid > 0;
  // bearing walls get their own support line; regular mid supports closer than 300 mm to it are dropped
  const fixedY = [BEAM / 2, ...bearing.map((p) => p.c).sort((p, q) => p - q), W - BEAM / 2];
  const midY = [];
  for (let i = 0; i + 1 < fixedY.length; i++) {
    if (i > 0) midY.push(fixedY[i]);
    const gap = fixedY[i + 1] - fixedY[i];
    const k = nMid === 0 ? 1 : Math.max(1, Math.ceil(gap / s.base.maxSpan - EPS));
    for (let j = 1; j < k; j++) midY.push(fixedY[i] + (gap * j) / k);
  }
  if (nMid === 1 && !bearing.length && midY.length === 0) midY.push(W / 2);
  midY.sort((p, q) => p - q);
  out.info.supports = beamX.flatMap((x) => [[x + BEAM / 2, BEAM / 2], [x + BEAM / 2, W - BEAM / 2], ...midY.map((y) => [x + BEAM / 2, y])]);
  out.info.beamX = beamX;
  const supY = [BEAM / 2, ...midY, W - BEAM / 2];
  out.info.midSpan = Math.max(...supY.slice(1).map((y, i) => y - supY[i]));
  out.info.midY = midY;

  // ---------- floor joists ----------
  const joistY = spaced(0, W - T, s.floor.joistMax);
  const need = [];
  for (let k = 1; k * SHEET_H < W; k++) need.push(k * SHEET_H);   // floor sheet seams across the joists
  for (const p of parts) if (p.orient === 'x') { if (!p.bearing) need.push(p.c); }
  for (const c of need) if (!joistY.some((y) => y < c + T / 2 && y + T > c - T / 2 - 2)) joistY.push(c - T / 2);
  for (const p of bearing) {
    for (let i = joistY.length - 1; i >= 0; i--) if (joistY[i] < p.c + T + 2 && joistY[i] + T > p.c - T - 2) joistY.splice(i, 1);
    joistY.push(p.c - T - 1, p.c + 1);
  }
  joistY.sort((p, q) => p - q);
  const beamCenters = beamX.map((x) => x + BEAM / 2);
  // rim joists across the ends carry the gable-wall plates; long joists butt into them
  for (const x0 of [0, L - T])
    add({ kind: 'joist', sec: 'f45', len: W, group: 'floor', name: 'Legar czołowy', note: 'pod ścianą szczytową', shape: box('xy', x0, 0, x0 + T, W, BEAM, BEAM + D) });
  const joistRuns = chooseJoistSplit(T, L - T, beamCenters, s.stock.f45.len, s.floor.splitJoists, joistY.length, s.kerf);
  for (const y0 of joistY)
    for (const [x0, x1] of joistRuns)
      add({ kind: 'joist', sec: 'f45', len: x1 - x0, group: 'floor', name: 'Legar podłogi', note: joistRuns.length > 1 ? 'styk nad belką' : '', shape: box('xy', x0, y0, x1, y0 + T, BEAM, BEAM + D) });
  out.info.joistY = joistY;

  // ---------- floor sheets ----------
  const fl = tileSheets({ U0: 0, U1: L, z0: 0, top: () => W, kinks: [], holes: [] }, SHEET_W, SHEET_H);
  fl.forEach((p, i) => { p.label = `P${i + 1}`; p.shape3d = { plane: 'xy', d: [BEAM + D, zf], map: (u) => u }; });
  out.floorSheets = fl;

  // ---------- walls ----------
  const st = s.walls.sheathT;
  const defs = {
    front: { id: 'front', A: 0, B: L, Us: [-st, L + st], flat: true, top: () => Tf, kinks: [], plane: 'xz', map: (U) => U, depth: [0, D], sheet: [-st, 0], long: true },
    back: { id: 'back', A: 0, B: L, Us: [-st, L + st], flat: true, top: () => Tb, kinks: [], plane: 'xz', map: (U) => L - U, depth: [W - D, W], sheet: [W, W + st], long: true },
    left: { id: 'left', A: D, B: W - D, Us: [0, W], flat: false, top: (U) => zr(W - U), kinks: mono ? [] : [W / 2], plane: 'yz', map: (U) => W - U, depth: [0, D], sheet: [-st, 0] },
    right: { id: 'right', A: D, B: W - D, Us: [0, W], flat: false, top: (U) => zr(U), kinks: mono ? [] : [W / 2], plane: 'yz', map: (U) => U, depth: [L - D, L], sheet: [L, L + st] },
  };
  const extra = { front: [], back: [], left: [], right: [] };
  const pDefs = parts.map((p) => partitionDef(p, zf));
  for (const p of parts) {
    extra[p.id] = [];
    const host = (wall, U) => extra[wall] && extra[wall].push(U);
    if (p.orient === 'x') { if (Math.abs(p.a - D) < 5) host('left', W - p.c); if (Math.abs(p.b - (L - D)) < 5) host('right', p.c); }
    else { if (Math.abs(p.a - D) < 5) host('front', p.c); if (Math.abs(p.b - (W - D)) < 5) host('back', L - p.c); }
  }
  for (const p of parts) for (const q of parts) {
    if (p === q || p.orient === q.orient) continue;
    for (const end of [p.a, p.b]) if ((Math.abs(end - (q.c - D / 2)) < 5 || Math.abs(end - (q.c + D / 2)) < 5) && p.c > q.a && p.c < q.b) extra[q.id].push(p.c - q.a);
  }

  // roof width carried by each wall (for header sizing): eaves walls half the span plus the overhang,
  // gable-end walls about half a rafter bay
  const rafterBay = (L - T) / Math.max(1, Math.ceil((L - T) / s.roof.rafterMax - EPS));
  const trib = { front: eaveTrib(true), back: eaveTrib(false), left: rafterBay / 2, right: rafterBay / 2 };
  for (const id of WALL_IDS) {
    const def = { ...defs[id], zb: zf, pv, a, name: WALL_NAMES[id], trib: trib[id] };
    out.walls[id] = def;
    frameWall(def, s.openings[id], extra[id], s, out);
    if (s.walls.sheathe) {
      const zS = BEAM - s.walls.sheathBelow;
      const top = def.flat ? def.top : def.top;
      const opt = { U0: def.Us[0], U1: def.Us[1], z0: zS, top, kinks: def.kinks, holes: holesOf(s.openings[id], zf) };
      const pieces = tileSheets(opt, SHEET_W, SHEET_H);
      def.gap = opt.dropped ? Math.max(...opt.dropped.map(([w, h]) => Math.min(w, h))) : 0;
      pieces.forEach((p, i) => { p.label = `${id[0].toUpperCase()}${i + 1}`; p.wall = id; p.shape3d = { plane: def.plane, d: def.sheet, map: def.map }; });
      out.wallSheets.push(...pieces);
      def.sheets = pieces;
    }
  }
  // roof width carried by a bearing wall: half of the rafter spans on both sides
  const bearingTrib = (c) => { const i = supAll.indexOf(c); return 1.25 * (((supAll[i + 1] ?? c) - (supAll[i - 1] ?? c)) / 2); };
  // gable ties pass through bearing walls: keep studs and noggings out of their way
  const tieX = !mono && s.roof.ties ? (() => { const n = Math.max(2, Math.ceil((L - T) / s.roof.rafterMax - EPS) + 1); return [...Array(n)].map((_, i) => (i * (L - T)) / (n - 1)).slice(1, -1).map((x) => [x + T, x + 2 * T]); })() : [];
  parts.forEach((p, i) => {
    const def = { ...pDefs[i], pv, a, name: p.bearing ? `Ściana nośna ${i + 1}` : `Ścianka ${i + 1}`, trib: p.bearing ? bearingTrib(p.c) : 0 };
    out.walls[p.id] = def;
    const ys = p.orient === 'x' ? [p.c - D / 2, p.c + D / 2] : [p.a, p.b, ...(mono || p.a > W / 2 || p.b < W / 2 ? [] : [W / 2])];
    if (!p.bearing && zf + p.h > Math.min(...ys.map(zr)) + 1) out.warnings.push(`${def.name}: wyższa niż spód krokwi w tym miejscu – obniż ją.`);
    if (p.bearing && tieX.length) {
      def.tieZone = { us: tieX.map(([x0, x1]) => [x0 - p.a, x1 - p.a]), z0: Tf - 5, z1: Tf + D + 5 };
      if (p.Tp - 2 * T < Tf + D + 5) out.warnings.push(`${def.name}: oczep ściany nośnej wypada na wysokości ściągów – przesuń ścianę bliżej kalenicy.`);
    }
    if (p.sheathe) def.seamBase = zf;
    frameWall(def, p.openings, extra[p.id], s, out);
    if (p.sheathe) {
      def.sheets = [];
      for (const [side, d] of [['a', [def.depth[0] - st, def.depth[0]]], ['b', [def.depth[1], def.depth[1] + st]]]) {
        const pieces = tileSheets({ U0: 0, U1: def.B, z0: zf, top: def.top, kinks: [], holes: holesOf(p.openings, zf) }, SHEET_W, SHEET_H);
        pieces.forEach((q, k) => { q.label = `S${i + 1}${side}${k + 1}`; q.wall = p.id; q.shape3d = { plane: def.plane, d, map: def.map }; });
        out.wallSheets.push(...pieces);
        if (side === 'a') def.sheets.push(...pieces);
      }
    }
  });

  // ---------- roof ----------
  buildRoof(s, out, { zr, Tf, Tb, a, tn, cs, sn, mono, backHigh, zf, bearing });

  checks(s, out, { joistY, beamX, mid, cs, mono, bearing });
  return out;
}

// ---------- helpers: geometry primitives ----------

function box(plane, u0, v0, u1, v1, d0, d1) {
  return { plane, poly: [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], d: [d0, d1] };
}

// Evenly spaced positions of members of thickness T from a to b, spacing ≤ max (left faces).
export function spaced(a, b, max) {
  const n = Math.max(2, Math.ceil((b - a) / max - EPS) + 1);
  return [...Array(n)].map((_, i) => a + (i * (b - a)) / (n - 1));
}

function splitEven(a, b, max) {
  const n = Math.max(1, Math.ceil((b - a) / max - EPS));
  return [...Array(n)].map((_, i) => [a + ((b - a) * i) / n, a + ((b - a) * (i + 1)) / n]);
}

// Splits a run [a,b] into pieces ≤ max, joints only at the given support centres (greedy, farthest first).
export function splitAtSupports(a, b, supports, max) {
  const out = [];
  let s = a;
  const sup = supports.filter((c) => c > a + 1 && c < b - 1).sort((p, q) => p - q);
  while (b - s > max + EPS) {
    const c = sup.filter((x) => x > s + 1 && x - s <= max).pop();
    if (c === undefined) return splitEven(a, b, max);
    out.push([s, c]);
    s = c;
  }
  out.push([s, b]);
  return out;
}

// Joists are one piece when they fit the stock; longer runs are joined over beams, choosing the
// joints that need the fewest stock pieces when allowed.
function chooseJoistSplit(a, b, centers, stock, allow, count, kerf) {
  const base = splitAtSupports(a, b, centers, stock);
  if (b - a <= stock || !allow) return base;
  const inner = centers.filter((c) => c > a + 1 && c < b - 1);
  const options = [base];
  for (let k = base.length - 1; k <= inner.length; k++) {
    const target = (i) => a + ((b - a) * (i + 1)) / (k + 1);
    const picks = [...Array(k)].map((_, i) => inner.reduce((best, c) => (Math.abs(c - target(i)) < Math.abs(best - target(i)) ? c : best), inner[0]));
    const cuts = [...new Set(picks)].sort((p, q) => p - q);
    const runs = []; let s0 = a;
    for (const c of cuts) { runs.push([s0, c]); s0 = c; }
    runs.push([s0, b]);
    if (runs.every(([x0, x1]) => x1 - x0 <= stock)) options.push(runs);
  }
  const bars = (runs) => {
    const lens = []; for (let i = 0; i < count; i++) for (const [x0, x1] of runs) lens.push(x1 - x0);
    return ffd(lens, stock, kerf);
  };
  let best = base, bb = bars(base);
  for (const o of options) { const n = bars(o); if (n < bb) { bb = n; best = o; } }
  return best;
}

function ffd(lens, stock, kerf) {
  const bins = [];
  for (const l of [...lens].sort((p, q) => q - p)) {
    const b = bins.find((r) => r >= l);
    if (b !== undefined) bins[bins.indexOf(b)] = b - l - kerf; else bins.push(stock - l - kerf);
  }
  return bins.length;
}

// Clips a polygon to the half-plane v ≤ m·u + q.
function clipBelow(poly, m, q) {
  const f = ([u, v]) => m * u + q - v;
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length];
    const fp = f(P), fq = f(Q);
    if (fp >= -EPS) out.push(P);
    if ((fp >= -EPS) !== (fq >= -EPS)) {
      const t = fp / (fp - fq);
      out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
    }
  }
  return out;
}

export function area(poly) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length]; s += x1 * y2 - x2 * y1; }
  return Math.abs(s) / 2;
}

// Top edge of a member from u1 back to u0 under a (piecewise linear) top function.
function topEdge(u0, u1, f, kinks) {
  const pts = [[u1, f(u1)]];
  for (const k of [...kinks].sort((p, q) => q - p)) if (k > u0 + EPS && k < u1 - EPS) pts.push([k, f(k)]);
  pts.push([u0, f(u0)]);
  return pts;
}

function holesOf(openings, zf) {
  return (openings || []).map((o) => ({ u0: o.U, u1: o.U + o.w, v0: zf + o.sill, v1: zf + o.sill + o.h }));
}

function partitionDef(p, zf) {
  const len = p.b - p.a;
  const base = { id: p.id, zb: zf, A: 0, B: len, Us: [0, len], flat: true, top: () => zf + p.h, kinks: [], depth: [p.c - D / 2, p.c + D / 2], partition: true, sheet: null };
  return p.orient === 'x' ? { ...base, plane: 'xz', map: (U) => p.a + U } : { ...base, plane: 'yz', map: (U) => p.a + U };
}

// ---------- wall framing ----------

function frameWall(def, openings, extraStuds, s, out) {
  const { A, B, zb, flat, kinks } = def;
  const pv = def.pv;
  const ut = flat ? () => def.top() - 2 * T : (U) => def.top(U) - pv;   // underside of the top plate(s)
  const name = def.name;
  const members = [];
  const push = (kind, sec, poly, len, label, note = '', dd = null) => {
    const m = { kind, sec, len: R(len), group: def.id, name: label, note, wall: def.id, upoly: poly, shape: { plane: def.plane, poly: poly.map(([u, v]) => [def.map(u), v]), d: dd ? [def.depth[0] + dd[0], def.depth[0] + dd[1]] : def.depth } };
    members.push(m); out.members.push(m); return m;
  };
  const rect = (u0, u1, v0, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
  const stud = (u0, u1, v0, topf) => [[u0, v0], [u1, v0], ...topEdge(u0, u1, topf, kinks)];
  const studLen = (u0, u1, v0, topf) => Math.max(topf(u0), topf(u1), ...kinks.filter((k) => k > u0 && k < u1).map(topf)) - v0;
  const slopeNote = flat ? '' : `góra skośnie ${fmtDeg(def.a)}`;

  const ops = (openings || []).map((o) => ({ ...o, o0: o.U, o1: o.U + o.w, ob: zb + o.sill, ot: zb + o.sill + o.h }));
  ops.sort((p, q) => p.o0 - q.o0);
  for (let i = 0; i < ops.length; i++) {
    const o = ops[i];
    if (o.o0 - 2 * T < A + (def.long ? 2 * T : T) - 1 || o.o1 + 2 * T > B - (def.long ? 2 * T : T) + 1) out.warnings.push(`${name}: otwór ${i + 1} wchodzi na słupki narożne – odsuń go od narożnika.`);
    if (i > 0 && ops[i - 1].o1 + 2 * T > o.o0 - 2 * T) out.warnings.push(`${name}: otwory ${i} i ${i + 1} są za blisko siebie (słupki się nakładają).`);
    const hTop = o.ot + (o.w > 1200 ? D : 2 * T);
    if (hTop > Math.min(ut(o.o0 - T), ut(o.o1 + T)) + 1) out.warnings.push(`${name}: nadproże otworu ${i + 1} nie mieści się pod oczepem – obniż otwór.`);
  }

  // bottom plate, interrupted by openings that reach the floor
  let segs = [[A, B]];
  for (const o of ops) if (o.sill === 0) segs = segs.flatMap(([p, q]) => (o.o1 <= p || o.o0 >= q ? [[p, q]] : [[p, o.o0], [o.o1, q]].filter(([x, y]) => y - x > 1)));

  // vertical members
  const full = [];
  const take = (u0, kind) => {
    if (u0 < A - EPS || u0 + T > B + EPS) return false;
    if (full.some((f) => u0 < f.u0 + T - 1 && u0 + T > f.u0 + 1)) return false;
    full.push({ u0, kind }); return true;
  };
  take(A, 'end'); take(B - T, 'end');
  if (def.long) { take(A + T, 'end'); take(B - 2 * T, 'end'); }
  for (const c of extraStuds || []) take(c - T / 2, 'extra');
  const grid = [];
  const s0 = def.Us[0], step = s.walls.studMax;
  for (let g = s0 + Math.ceil((A - s0) / step - EPS) * step; g <= B + EPS; g += step) grid.push(g);
  for (const g of grid) {
    let u0 = Math.min(B - T, Math.max(A, g - T / 2));
    const hit = def.tieZone && def.tieZone.us.find(([p, q]) => u0 < q && u0 + T > p);
    if (hit) u0 = u0 + T / 2 < (hit[0] + hit[1]) / 2 ? hit[0] - T : hit[1];
    take(u0, 'grid');
  }

  const zone = (u0) => ops.find((o) => u0 < o.o1 + 2 * T - 1 && u0 + T > o.o0 - 2 * T + 1);
  const verts = [];   // [u0,u1,v0,v1(min),topf] for nogging
  for (const f of full.sort((p, q) => p.u0 - q.u0)) {
    const o = zone(f.u0);
    if (o && f.kind === 'extra') out.warnings.push(`${name}: ścianka działowa dochodzi do otworu – przesuń ściankę albo otwór.`);
    if (o && f.kind !== 'end') continue;
    const tf = ut;
    push('stud', 'f45', stud(f.u0, f.u0 + T, zb + T, tf), studLen(f.u0, f.u0 + T, zb + T, tf), f.kind === 'end' ? 'Słupek narożny' : 'Słupek', slopeNote);
    verts.push([f.u0, f.u0 + T, zb + T, tf]);
  }
  for (const o of ops) {
    // header: two 45×95 laid flat when that is stiff enough and the opening ≤ 1200, else on edge with a 5 mm spacer
    const span = o.w + T, q = s.loads.roof * (def.trib || 0) / 1000, lim = span / 300;
    const dFlat = q > 0 ? (5 * q * span ** 4) / (384 * E * 2 * ((D * T ** 3) / 12)) : 0;
    const dEdge = q > 0 ? (5 * q * span ** 4) / (384 * E * 2 * ((T * D ** 3) / 12)) : 0;
    o.edge = o.w > 1200 || dFlat > lim;
    o.hh = o.edge ? D : 2 * T;
    if (q > 0) out.checks.push({ name: `Nadproże 2×45×95 ${o.edge ? 'na sztorc' : 'płasko'}, ${name.toLowerCase()} ${o.w}`, span: R(span), d: o.edge ? dEdge : dFlat, lim, ok: (o.edge ? dEdge : dFlat) <= lim, hint: 'węższy otwór albo nadproże z belki 100×100 lub klejonki' });
    for (const u0 of [o.o0 - 2 * T, o.o1 + T]) {
      push('king', 'f45', stud(u0, u0 + T, zb + T, ut), studLen(u0, u0 + T, zb + T, ut), 'Słupek przy otworze', slopeNote);
      verts.push([u0, u0 + T, zb + T, ut]);
    }
    for (const u0 of [o.o0 - T, o.o1]) {
      push('trimmer', 'f45', rect(u0, u0 + T, zb + T, o.ot), o.ot - zb - T, 'Słupek pod nadprożem');
      verts.push([u0, u0 + T, zb + T, () => o.ot]);
    }
    if (o.edge) {
      push('header', 'f45', rect(o.o0 - T, o.o1 + T, o.ot, o.ot + D), o.w + 2 * T, 'Nadproże', 'na sztorc, 2 szt. z przekładką 5 mm', [0, T]);
      push('header', 'f45', rect(o.o0 - T, o.o1 + T, o.ot, o.ot + D), o.w + 2 * T, 'Nadproże', 'na sztorc, 2 szt. z przekładką 5 mm', [D - T, D]);
    } else {
      push('header', 'f45', rect(o.o0 - T, o.o1 + T, o.ot, o.ot + T), o.w + 2 * T, 'Nadproże (dolna warstwa)', 'płasko');
      push('header', 'f45', rect(o.o0 - T, o.o1 + T, o.ot + T, o.ot + 2 * T), o.w + 2 * T, 'Nadproże (górna warstwa)', 'płasko');
    }
    if (o.sill > 0) push('sill', 'f45', rect(o.o0, o.o1, o.ob - T, o.ob), o.w, 'Podokiennik', 'płasko');
    const inner = grid.map((g) => g - T / 2).filter((u0) => u0 >= o.o0 + 1 && u0 + T <= o.o1 - 1);
    for (const u0 of inner) {
      const top0 = o.ot + o.hh;
      if (Math.min(ut(u0), ut(u0 + T)) - top0 > 30) { push('cripple', 'f45', stud(u0, u0 + T, top0, ut), studLen(u0, u0 + T, top0, ut), 'Słupek nad nadprożem', slopeNote); verts.push([u0, u0 + T, top0, ut]); }
      if (o.sill > 0 && o.ob - T - (zb + T) > 30) { push('cripple', 'f45', rect(u0, u0 + T, zb + T, o.ob - T), o.ob - T - zb - T, 'Słupek pod podokiennikiem'); verts.push([u0, u0 + T, zb + T, () => o.ob - T]); }
    }
  }

  for (const [p, q] of segs) for (const [x0, x1] of splitAtSupports(p, q, full.map((f) => f.u0 + T / 2), s.stock.f45.len))
    push('plate', 'f45', rect(x0, x1, zb, zb + T), x1 - x0, 'Podwalina ściany', 'płasko');

  if (flat) {
    const Tp = def.top();
    const centers = full.map((f) => f.u0 + T / 2);
    const lower = splitAtSupports(A, B, centers, s.stock.f45.len);
    const joints = lower.slice(1).map(([x0]) => x0);
    // upper layer joints at least one stud bay away from the lower ones
    const upper = splitAtSupports(A, B, centers.filter((c) => joints.every((j) => Math.abs(c - j) > step - 1)), s.stock.f45.len);
    if (joints.length) out.warnings.push(`${name}: ściana dłuższa niż kantówka – oczepy i podwalina łączone na słupkach, styki rozsunięte; spinaj je płaskownikiem.`);
    for (const [lvl, label, runs] of [[0, 'Oczep (dolny)', lower], [1, 'Oczep (górny)', upper]])
      for (const [x0, x1] of runs)
        push('plate', 'f45', rect(x0, x1, Tp - 2 * T + lvl * T, Tp - T + lvl * T), x1 - x0, label, 'płasko');
  } else {
    const cuts = [A, ...kinks.filter((k) => k > A && k < B), B];
    for (let i = 0; i + 1 < cuts.length; i++) {
      const u0 = cuts[i], u1 = cuts[i + 1];
      const poly = [[u0, def.top(u0) - pv], [u1, def.top(u1) - pv], [u1, def.top(u1)], [u0, def.top(u0)]];
      push('plate', 'f45', poly, Math.hypot(u1 - u0, def.top(u1) - def.top(u0)), 'Oczep skośny', `końce pod kątem ${fmtDeg(def.a)}`);
    }
  }

  // noggings, rows every ~nogStep plus one at each horizontal sheet seam
  const zS = BEAM - s.walls.sheathBelow;
  const utMax = Math.max(ut(A), ut(B), ...kinks.map(ut));
  const rows = [];
  for (let z = zb + s.walls.nogStep; z < utMax - 150; z += s.walls.nogStep) rows.push(z);
  const seams = new Set();
  const seamBase = def.partition ? def.seamBase : zS;
  if (seamBase !== undefined) for (let z = seamBase + SHEET_H; z < utMax - T; z += SHEET_H) {
    const i = rows.findIndex((r) => Math.abs(r - z) < s.walls.nogStep / 2);
    if (i >= 0) rows[i] = z; else rows.push(z);
    seams.add(z);
  }
  def.nogRows = rows;
  verts.sort((p, q) => p[0] - q[0]);
  for (const z0 of rows) {
    let bay = 0;
    const cover = verts.filter(([u0, u1, v0, tf]) => v0 <= z0 - T && Math.min(tf(u0), tf(u1)) >= z0 + T);
    for (let i = 0; i + 1 < cover.length; i++) {
      const u0 = cover[i][1], u1 = cover[i + 1][0];
      if (u1 - u0 < 80) continue;
      // staggered rows alternate above and below the line; a sheet-seam row stays in line
      const z = z0 + (s.walls.nogStagger && !seams.has(z0) ? (bay++ % 2 ? T / 2 + 5 : -T / 2 - 5) : 0);
      const um = (u0 + u1) / 2;
      if (ops.some((o) => um > o.o0 - T && um < o.o1 + T && z + T / 2 > o.ob - T - 5 && z - T / 2 < o.ot + o.hh + 5)) continue;
      if (z + T / 2 > Math.min(ut(u0), ut(u1)) - 5) continue;
      if (def.tieZone && z + T / 2 > def.tieZone.z0 && z - T / 2 < def.tieZone.z1) continue;
      push('nog', 'f45', rect(u0, u1, z - T / 2, z + T / 2), u1 - u0, 'Rygiel', '95 w głąb ściany, licem ze słupkami');
    }
  }
  def.members = members;
}

// ---------- sheets ----------

// Tiles the outline U0..U1 × z0..top(U) with sheets (columns w, rows h), cuts out holes and
// returns one piece per connected region of a sheet. A piece is a list of convex cells.
export function tileSheets(o, w, h) {
  const { U0, U1, z0, top, kinks, holes } = o;
  const zMax = Math.max(top(U0), top(U1), ...kinks.map(top));
  const pieces = [];
  for (let u = U0; u < U1 - 1; u += w) for (let v = z0; v < zMax - 1; v += h) {
    const x0 = u, x1 = Math.min(U1, u + w), y0 = v, y1 = v + h;
    const xs = [...new Set([x0, x1, ...holes.flatMap((H) => [H.u0, H.u1]), ...kinks].filter((x) => x >= x0 && x <= x1))].sort((p, q) => p - q);
    const ys = [...new Set([y0, y1, ...holes.flatMap((H) => [H.v0, H.v1])].filter((y) => y >= y0 && y <= y1))].sort((p, q) => p - q);
    const cells = new Map();
    for (let i = 0; i + 1 < xs.length; i++) for (let j = 0; j + 1 < ys.length; j++) {
      const a0 = xs[i], a1 = xs[i + 1], b0 = ys[j], b1 = ys[j + 1];
      if (a1 - a0 < 0.5 || b1 - b0 < 0.5) continue;
      const m = (top(a1) - top(a0)) / (a1 - a0), q = top(a0) - m * a0;
      const poly = clipBelow([[a0, b0], [a1, b0], [a1, b1], [a0, b1]], m, q);
      if (poly.length < 3 || area(poly) < 50) continue;
      const cx = poly.reduce((t, p) => t + p[0], 0) / poly.length, cy = poly.reduce((t, p) => t + p[1], 0) / poly.length;
      if (holes.some((H) => cx > H.u0 && cx < H.u1 && cy > H.v0 && cy < H.v1)) continue;
      cells.set(`${i},${j}`, { i, j, poly, x0: a0, x1: a1, y0: b0, y1: b1 });
    }
    // connected components
    const seen = new Set();
    for (const [k, c] of cells) {
      if (seen.has(k)) continue;
      const comp = [], stack = [k]; seen.add(k);
      while (stack.length) {
        const cur = cells.get(stack.pop()); comp.push(cur);
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nk = `${cur.i + di},${cur.j + dj}`;
          if (cells.has(nk) && !seen.has(nk)) { seen.add(nk); stack.push(nk); }
        }
      }
      for (const c2 of comp) c2.edges = cellEdges(c2, cells);
      const pts = comp.flatMap((c2) => c2.poly);
      const bx0 = Math.min(...pts.map((p) => p[0])), bx1 = Math.max(...pts.map((p) => p[0]));
      const by0 = Math.min(...pts.map((p) => p[1])), by1 = Math.max(...pts.map((p) => p[1]));
      const bw = R(bx1 - bx0), bh = R(by1 - by0);
      if (Math.min(bw, bh) < (o.minStrip ?? 60)) { (o.dropped ||= []).push([bw, bh]); continue; }
      pieces.push({ cells: comp, bbox: [bx0, by0, bx1, by1], w: bw, h: bh, full: bw >= w - 1 && bh >= h - 1 && comp.length === 1 && comp[0].poly.length === 4, area: comp.reduce((t, c2) => t + area(c2.poly), 0) });
    }
  }
  return pieces;
}

// Edges of a cell that lie on the outline of its piece (for drawing outlines without inner seams).
function cellEdges(c, cells) {
  const out = [];
  const n = c.poly.length;
  for (let k = 0; k < n; k++) {
    const P = c.poly[k], Q = c.poly[(k + 1) % n];
    let nb = null;
    if (Math.abs(P[0] - Q[0]) < EPS && Math.abs(P[0] - c.x0) < EPS) nb = `${c.i - 1},${c.j}`;
    else if (Math.abs(P[0] - Q[0]) < EPS && Math.abs(P[0] - c.x1) < EPS) nb = `${c.i + 1},${c.j}`;
    else if (Math.abs(P[1] - Q[1]) < EPS && Math.abs(P[1] - c.y0) < EPS) nb = `${c.i},${c.j - 1}`;
    else if (Math.abs(P[1] - Q[1]) < EPS && Math.abs(P[1] - c.y1) < EPS) nb = `${c.i},${c.j + 1}`;
    if (!nb || !cells.has(nb)) out.push([P, Q]);
  }
  return out;
}

// ---------- roof ----------

function buildRoof(s, out, g) {
  const { L, W } = s.dims;
  const r = s.roof, o = r.ovhEave, oG = r.ovhGable;
  const { zr, Tf, Tb, a, cs, sn, mono, backHigh, bearing } = g;
  const zt = (y) => zr(y) + D / cs;
  const n = Math.max(2, Math.ceil((L - T) / r.rafterMax - EPS) + 1);
  const rx = [...Array(n)].map((_, i) => (i * (L - T)) / (n - 1));
  out.info.rafterX = rx;
  out.info.rafterSpacing = (L - T) / (n - 1);
  const notch = R(out.info.notch);
  const plates = [[0, D, Tf], [W - D, W, Tb], ...bearing.map((p) => [p.c - D / 2, p.c + D / 2, p.Tp])];
  const under = (y0, y1) => {
    // underside from y0 to y1 with birdsmouth seats on the wall plates
    const pts = [[y0, zr(y0)]];
    for (const [p0, p1, Tp] of plates) {
      if (p1 <= y0 || p0 >= y1) continue;
      const q0 = Math.max(p0, y0), q1 = Math.min(p1, y1);
      pts.push([q0, zr(q0)], [q0, Math.max(Tp, zr(q0))], [q1, Math.max(Tp, zr(q1))], [q1, zr(q1)]);
    }
    pts.push([y1, zr(y1)]);
    return pts.filter((p, i, arr) => i === 0 || Math.hypot(p[0] - arr[i - 1][0], p[1] - arr[i - 1][1]) > 0.01);
  };
  const rafterPoly = (y0, y1) => [...under(y0, y1), [y1, zt(y1)], [y0, zt(y0)]];
  const halves = mono ? [[-o, W + o]] : [[-o, W / 2], [W / 2, W + o]];
  let tooLong = 0, spliced = 0;
  for (const x0 of rx) for (const [y0, y1] of halves) {
    let runs = [[y0, y1]];
    if ((y1 - y0) / cs > s.stock.f45.len) {
      const mid = (y0 + y1) / 2;
      const c = bearing.map((p) => p.c).filter((c) => c > y0 && c < y1).sort((p, q) => Math.abs(p - mid) - Math.abs(q - mid))[0];
      if (c !== undefined && Math.max(c - y0, y1 - c) / cs <= s.stock.f45.len) { runs = [[y0, c], [c, y1]]; spliced++; } else tooLong = Math.max(tooLong, (y1 - y0) / cs);
    }
    for (const [p, q] of runs)
      out.members.push({ kind: 'rafter', sec: 'f45', len: R((q - p) / cs), group: 'roof', name: 'Krokiew', note: `wcięcie ${notch} mm, końce pionowo${mono ? '' : ', przy kalenicy pod kątem'}${runs.length > 1 ? ', styk na ścianie nośnej z nakładkami na śruby' : ''}`, shape: { plane: 'yz', poly: rafterPoly(p, q), d: [x0, x0 + T] } });
  }
  out.info.rafterSplices = spliced;
  if (tooLong) out.warnings.push(`Krokiew ${R(tooLong)} mm jest dłuższa niż kantówka ${s.stock.f45.len} mm – dodaj ścianę nośną, na której da się ją połączyć, albo kup dłuższy materiał.`);
  else if (spliced) out.warnings.push(`Krokwie łączone na ścianie nośnej (${spliced} styków) – nakładki z obu stron, skręcone śrubami.`);
  if (!mono) {
    const long = W > s.stock.f45.len;
    if (r.ties) for (const x0 of rx.slice(1, -1)) {
      const parts = long ? [[0, W / 2 + 300], [W / 2 - 300, W]] : [[0, W]];
      for (const [p, q] of parts)
        out.members.push({ kind: 'tie', sec: 'f45', len: q - p, group: 'roof', name: 'Ściąg krokwi', note: long ? 'dwie części na zakład 600 mm, skręcone śrubami' : 'na oczepach, przykręcony do krokwi', shape: box('yz', p, Tf, q, Tf + D, x0 + T, x0 + 2 * T) });
    }
    else out.warnings.push('Dach dwuspadowy bez ściągów rozpycha ściany podłużne – włącz ściągi.');
    if (r.ties && long) out.warnings.push(`Ściąg ma ${W} mm, więcej niż kantówka – łączony na zakład 600 mm na śruby (pracuje na rozciąganie, nie na styk).`);
  }

  // slopes: R0 = rafter top at the eave, dir = up the slope, nrm = outward normal
  const slopes = [];
  if (mono) {
    if (backHigh) slopes.push({ R0: [-o, zt(-o)], dir: [cs, sn], nrm: [-sn, cs], S: (W + 2 * o) / cs, eave: 'front' });
    else slopes.push({ R0: [W + o, zt(W + o)], dir: [-cs, sn], nrm: [sn, cs], S: (W + 2 * o) / cs, eave: 'back' });
  } else {
    slopes.push({ R0: [-o, zt(-o)], dir: [cs, sn], nrm: [-sn, cs], S: (W / 2 + o) / cs, eave: 'front' });
    slopes.push({ R0: [W + o, zt(W + o)], dir: [-cs, sn], nrm: [sn, cs], S: (W / 2 + o) / cs, eave: 'back' });
  }
  const bsec = SECTIONS[r.battenSec] || SECTIONS.l50, bw = bsec.w, bh = bsec.h;
  const at = (sl, sv, off = 0) => [sl.R0[0] + sl.dir[0] * sv + sl.nrm[0] * off, sl.R0[1] + sl.dir[1] * sv + sl.nrm[1] * off];
  const x0r = -oG, x1r = L + oG, Lr = x1r - x0r;
  const cov = r.cover;
  out.roof = { slopes, Lr, x0r, x1r, battenRows: [], grid: [] };
  const bStock = s.stock[r.battenSec]?.len || 5400;
  const rafterCenters = rx.map((x) => x + T / 2);
  let longBattens = false;
  slopes.forEach((sl, si) => {
    // covering grid first: a batten must sit under every end lap of the sheets
    const effL = cov.len - cov.lapL, effW = cov.wid - cov.lapW;
    const nr = sl.S <= cov.len ? 1 : 1 + Math.ceil((sl.S - cov.len) / effL - EPS);
    const fixed = [0, ...[...Array(nr - 1)].map((_, i) => (i + 1) * effL + cov.lapL / 2 - bw / 2), sl.S - bw].sort((p, q) => p - q);
    const rows = [fixed[0]];
    let gapMax = 0;
    for (let i = 0; i + 1 < fixed.length; i++) {
      const gap = fixed[i + 1] - fixed[i];
      if (gap < 1) continue;
      const k = Math.max(1, Math.ceil(gap / r.battenMax - EPS));
      for (let j = 1; j <= k; j++) rows.push(fixed[i] + (gap * j) / k);
      gapMax = Math.max(gapMax, gap / k);
    }
    out.roof.battenRows.push(rows);
    sl.battenSpacing = gapMax;
    let prevJoints = [];
    for (const sv of rows) {
      const poly = [at(sl, sv), at(sl, sv + bw), at(sl, sv + bw, bh), at(sl, sv, bh)];
      // joints on a rafter, and never on the same rafter as in the row below
      const runs = splitAtSupports(x0r, x1r, rafterCenters.filter((c) => !prevJoints.some((j) => Math.abs(c - j) < 1)), bStock);
      prevJoints = runs.slice(1).map(([p]) => p);
      if (prevJoints.length) longBattens = true;
      for (const [p, q] of runs)
        out.members.push({ kind: 'batten', sec: r.battenSec, len: R(q - p), group: 'roof', name: 'Łata', note: runs.length > 1 ? 'styk na krokwi, na mijankę' : '', shape: { plane: 'yz', poly, d: [p, q] } });
    }
    // verge boards close the batten ends at both gables
    for (const [d0, d1] of [[x0r - T, x0r], [x1r, x1r + T]]) {
      const vpoly = [at(sl, 0, -T), at(sl, sl.S, -T), at(sl, sl.S, bh), at(sl, 0, bh)];
      for (const [p, q] of splitEven(0, sl.S, s.stock.f45.len))
        out.members.push({ kind: 'verge', sec: 'f45', len: R(q - p), group: 'roof', name: 'Wiatrownica', note: 'na końcach łat, na sztorc', shape: { plane: 'yz', poly: [at(sl, p, -T), at(sl, q, -T), at(sl, q, bh), at(sl, p, bh)], d: [d0, d1] } });
      void vpoly;
    }
    const nc = Lr <= cov.wid ? 1 : 1 + Math.ceil((Lr - cov.wid) / effW - EPS);
    const grid = { nr, nc, cells: [] };
    for (let c = 0; c < nc; c++) for (let rr = 0; rr < nr; rr++) {
      const s0 = rr * effL, s1 = Math.min(sl.S, s0 + cov.len);
      const cx0 = x0r + c * effW, cx1 = Math.min(x1r, cx0 + cov.wid);
      const key = `${si}:${c}:${rr}`;
      const th = 30;
      grid.cells.push({ key, c, r: rr, s0, s1, x0: cx0, x1: cx1, len: R(s1 - s0), wid: R(cx1 - cx0), clear: r.clear.includes(key), shape: { plane: 'yz', poly: [at(sl, s0, bh), at(sl, s1, bh), at(sl, s1, bh + th), at(sl, s0, bh + th)], d: [cx0, cx1] } });
    }
    out.roof.grid.push(grid);
  });
  out.info.topZ = Math.max(...slopes.map((sl) => at(sl, sl.S, bh + 30)[1]));
  if (longBattens) out.warnings.push('Łaty dłuższe niż materiał – łączone na krokwiach, styki na mijankę.');
  if (r.pitch < 10) out.warnings.push(`Spadek ${r.pitch}° jest mniejszy niż 10° – przy 5–10° producenci płyt falistych wymagają pełnego deskowania i zakładu podłużnego ok. 300 mm. Sprawdź kartę producenta.`);
}

// ---------- structural checks (simple beams, L/300) ----------

function checks(s, out, g) {
  const { L, W } = s.dims;
  const I = (b, h) => (b * h ** 3) / 12;
  const defl = (q, l, i) => (5 * q * l ** 4) / (384 * E * i);
  const add = (name, q, l, i, hint) => {
    const d = defl(q, l, i), lim = l / 300;
    out.checks.push({ name, span: R(l), d, lim, ok: d <= lim, hint });
  };
  const jSp = Math.max(...g.joistY.slice(1).map((y, i) => y - g.joistY[i]));
  const bSp = Math.max(...g.beamX.slice(1).map((x, i) => x - g.beamX[i]));
  add(`Legar podłogi 45×95, rozstaw ${R(jSp)}`, s.loads.floor * jSp / 1000, bSp, I(T, D), 'zmniejsz rozstaw belek poprzecznych');
  add(`Belka poprzeczna 100×100${g.mid ? ' z podporami pośrednimi' : ''}`, s.loads.floor * bSp / 1000, out.info.midSpan, I(BEAM, BEAM), 'dodaj podporę pod środkiem belek poprzecznych');
  // longitudinal beam: half the floor, the eaves wall and the roof from its side, between supports
  const qLong = (s.loads.floor * (W / 2) + s.loads.roof * out.info.eaveTrib) / 1000 + 0.5;
  add('Belka podłużna 100×100 pod ścianą', qLong, bSp, I(BEAM, BEAM), 'zmniejsz rozstaw belek poprzecznych (więcej podpór)');
  for (const p of g.bearing) {
    const tribW = out.walls[p.id]?.trib || 0;
    add(`Legar podwójny pod ścianą nośną (oś ${R(p.c)})`, (s.loads.roof * tribW + s.loads.floor * 0.2) / 1000 + 0.5, bSp, 2 * I(T, D), 'gęściej belki poprzeczne albo belka 100×100 pod ścianą');
  }
  const rSp = out.info.rafterSpacing;
  // rafter spans between supports: outer plates, bearing walls and (gable) the ridge
  const sup = [D / 2, W - D / 2, ...g.bearing.map((p) => p.c), ...(g.mono ? [] : [W / 2])].sort((p, q) => p - q);
  const gaps = sup.slice(1).map((y, i) => [sup[i], y]);
  const spanH = Math.max(...gaps.map(([p, q]) => q - p));
  const qR = (s.loads.roof * rSp / 1000) * g.cs ** 2;
  add(`Krokiew 45×95, rozstaw ${R(rSp)}${g.bearing.length ? ', ze ścianą nośną' : ''}`, qR, spanH / g.cs, I(T, D), 'dodaj ścianę nośną (propozycja na rzucie) albo więcej krokwi');
  // proposals: split every too-long span evenly so each part passes L/300
  const lhMax = Math.cbrt((384 * E * I(T, D)) / (1500 * qR)) * g.cs;
  out.suggestions = [];
  for (const [p, q] of gaps) {
    if (q - p <= lhMax) continue;
    const k = Math.ceil((q - p) / lhMax - EPS);
    for (let j = 1; j < k; j++) {
      const c = Math.round((p + ((q - p) * j) / k) / 5) * 5;
      const near = s.partitions.find((x) => x.orient === 'x' && Math.abs(x.c - c) < D * 3 && !x.bearing);
      if (near) { out.warnings.push(`${out.walls[near.id]?.name || 'Ścianka'} stoi tam, gdzie potrzebna jest ściana nośna (oś ${c}) – oznacz ją jako nośną.`); continue; }
      if (s.partitions.some((x) => x.orient === 'x' && Math.abs(x.c - c) < D)) continue;
      out.suggestions.push({ orient: 'x', c, a: D, b: L - D });
    }
  }
  if (out.suggestions.length) out.warnings.push(`Krokiew 45×95 nie przenosi przęsła ${R(spanH)} mm – proponowane ściany nośne w osi ${out.suggestions.map((x) => `${x.c} mm`).join(', ')} od przodu (przerywane na rzucie podłogi, kliknij, żeby dodać).`);
  const sl = out.roof.slopes[0];
  const bs = SECTIONS[s.roof.battenSec] || SECTIONS.l50;
  add(`Łata ${bs.w}×${bs.h}, rozstaw ${R(sl.battenSpacing)}`, (s.loads.roof * sl.battenSpacing / 1000) * g.cs, rSp, I(bs.w, bs.h), 'więcej krokwi');
}

export function fmtDeg(a) { return `${(Math.round((a * 180) / Math.PI * 10) / 10).toString().replace('.', ',')}°`; }
