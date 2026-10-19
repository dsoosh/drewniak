// Project state: defaults, normalisation and (de)serialisation.
// All dimensions in millimetres, angles in degrees.

export const SECTIONS = {
  b100: { name: 'Belka 100×100', w: 100, h: 100 },
  b150: { name: 'Belka 150×150', w: 150, h: 150 },
  f45: { name: 'Kantówka 45×95', w: 45, h: 95 },
  f145: { name: 'Kantówka 45×145', w: 45, h: 145 },
  f195: { name: 'Kantówka 45×195', w: 45, h: 195 },
  l50: { name: 'Łata 50×50', w: 50, h: 50 },
};

// OSB/3 2500×1250, price per sheet, DIY stores 2026 (25 and 30 mm estimated from the trend);
// tongue-and-groove floor sheets cost about 5% more.
export const OSB_PRICES = { 12: 69, 15: 80, 18: 98, 22: 124, 25: 145, 30: 175 };
export const osbPrice = (t, floor = false) => Math.round((OSB_PRICES[t] || 0) * (floor ? 1.05 : 1));
export const PRICE_DEFAULTS = { b100: 189, b150: 425, f45: 69, f145: 105, f195: 142, l50: 22, cover: 45, anchor: 135 };
export const ANCHOR_RANGE = [120, 150];

// Allowed ranges of numeric parameters [min, max]; one source for normalisation, form inputs
// and the clamp message.
export const LIMITS = {
  'dims.L': [1000, 15000], 'dims.W': [1000, 10000], 'walls.h0': [1500, 3500],
  'roof.pitch': [5, 45], 'roof.ovhEave': [0, 800], 'roof.ovhGable': [0, 400],
  'roof.rafterMax': [300, 1200], 'roof.battenMax': [200, 600],
  'walls.nogStep': [300, 1500], 'walls.doubleFrom': [400, 3000], 'walls.sheathBelow': [0, 100],
  'base.maxSpan': [600, 3000], 'base.anchorMax': [800, 2500], 'floor.joistMax': [300, 900],
  'stock.f45.len': [2000, 13000], 'stock.f145.len': [2000, 13000], 'stock.f195.len': [2000, 13000], 'stock.l50.len': [2000, 13000], 'stock.b100.len': [2000, 13000],
  'loads.floor': [1.0, 10], 'loads.roof': [0.9, 5],
  'roof.cover.len': [500, 4000], 'roof.cover.wid': [300, 2000], 'roof.cover.lapL': [50, 500],
  'roof.cover.lapW': [0, 300], 'roof.cover.nails': [0, 60], kerf: [0, 10],
};
export const MAX_PARTITIONS = 30, MAX_OPENINGS = 20;
const getP = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const setP = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
const clampN = (v, lo, hi, d) => Math.min(hi, Math.max(lo, Number.isFinite(+v) && v !== '' && v !== null ? +v : d));

export const WALL_IDS = ['front', 'back', 'left', 'right'];
export const WALL_NAMES = { front: 'Przód', back: 'Tył', left: 'Lewa', right: 'Prawa' };
export const OPENING_NAMES = { door: 'Drzwi', window: 'Okno', opening: 'Otwór' };

let seq = 1;
export const uid = (p) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

// Defaults reproduce the built shed ("Wiata 2,5 × 3,1 m") with the changes made on site:
// noggings every ~800 mm, 300 mm roof overhang on every side, 8 rafters and 10 battens 50×50.
export function defaultState() {
  return {
    v: 1,
    dims: { L: 3101, W: 2500 },
    base: { maxSpan: 1500, anchorMax: 2500, beamSec: 'b100' },
    floor: { joistMax: 600, sheetT: 30, splitJoists: false },
    walls: { h0: 2350, studMax: 625, nogStep: 800, nogStagger: true, doubleFrom: 1200, sheatheIn: false, sheathT: 12, sheathBelow: 50, sheathe: true },
    roof: {
      type: 'mono', pitch: 13.9, highSide: 'back', ovhEave: 300, ovhGable: 300,
      rafterMax: 450, battenMax: 420, battenSec: 'l50', ties: true, splice: 'scab', rafterSec: 'f45',
      cover: { name: 'Płyta bitumiczna falista', len: 2000, wid: 950, lapL: 200, lapW: 95, nails: 20 },
      clear: [],
    },
    openings: {
      front: [{ id: 'o1', type: 'window', U: 1890, w: 1020, h: 520, sill: 1100 }],
      back: [{ id: 'o2', type: 'opening', U: 1100, w: 900, h: 2090, sill: 0 }],
      left: [],
      right: [{ id: 'o3', type: 'door', U: 740, w: 1020, h: 2090, sill: 0 }],
    },
    partitions: [],
    stock: {
      b100: { len: 13000, unit: 6500, price: 189 },   // 13 m beams cut to order, sold and priced in 6.5 m halves
      b150: { len: 13000, unit: 6500, price: 425 },
      f45: { len: 6000, price: 69 },
      f145: { len: 6000, price: 105 },
      f195: { len: 6000, price: 142 },
      l50: { len: 5400, price: 22 },
      osbWall: { name: 'OSB/3 12 mm', w: 1250, h: 2500, price: '' },    // '' = price from OSB_PRICES
      osbFloor: { name: 'OSB/3 30 mm pióro-wpust', w: 1250, h: 2500, price: '' },
      cover: { price: 45 },
      anchor: { price: 135 },
    },
    kerf: 3,
    loads: { floor: 1.0, roof: 1.3 },
  };
}

const num = (v, d) => (Number.isFinite(+v) && v !== '' && v !== null ? +v : d);

// Fills missing keys from defaults so old links and hand-edited JSON keep working.
export function normalize(s) {
  const d = defaultState();
  const merge = (a, b) => {
    if (Array.isArray(b)) return Array.isArray(a) ? a : b;
    if (b && typeof b === 'object') {
      const o = {};
      for (const k of Object.keys(b)) o[k] = merge(a && typeof a === 'object' ? a[k] : undefined, b[k]);
      return o;
    }
    return a === undefined ? b : a;
  };
  const o = merge(s || {}, d);
  for (const [p, [lo, hi]] of Object.entries(LIMITS)) setP(o, p, clampN(getP(o, p), lo, hi, getP(d, p)));
  o.roof.cover.lapL = Math.min(o.roof.cover.lapL, o.roof.cover.len - 100);
  o.roof.cover.lapW = Math.min(o.roof.cover.lapW, o.roof.cover.wid - 100);
  const { L, W } = o.dims;
  for (const w of WALL_IDS) o.openings[w] = (o.openings[w] || []).slice(0, MAX_OPENINGS).map(fixOpening);
  o.partitions = (o.partitions || []).slice(0, MAX_PARTITIONS).map((p) => {
    const lim = p.orient === 'y' ? [W, L] : [L, W];   // [along, across]
    const a = clampN(p.a, 95, lim[0] - 95 - 300, 95), b = clampN(p.b, a + 300, lim[0] - 95, lim[0] - 95);
    return { p, a, b, c: clampN(p.c, 95 + 47.5, lim[1] - 95 - 47.5, lim[1] / 2) };
  }).map(({ p, a, b, c }) => ({ id: p.id || uid('p'), orient: p.orient === 'y' ? 'y' : 'x', c, a, b, h: clampN(p.h, 500, 3500, o.walls.h0), sheathe: p.sheathe === true ? 'both' : ['a', 'b', 'both'].includes(p.sheathe) ? p.sheathe : 'none', bearing: !!p.bearing && p.orient !== 'y', openings: (p.openings || []).map(fixOpening) }));
  if (!Array.isArray(o.roof.clear)) o.roof.clear = [];
  o.roof.clear = o.roof.clear.slice(0, 500);
  if (!['none', 'scab', 'lap', 'plate'].includes(o.roof.splice)) o.roof.splice = 'scab';
  const studs = [625, 416.6667, 312.5];
  o.walls.studMax = studs.reduce((best, v) => (Math.abs(v - o.walls.studMax) < Math.abs(best - o.walls.studMax) ? v : best), 625);
  // older saves counted 100×100 as separate 6.5 m pieces
  if (!o.stock.b100.unit || o.stock.b100.unit === 6500 && o.stock.b100.len === 6500) { o.stock.b100.len = 13000; o.stock.b100.unit = 6500; }
  // older saves had empty prices: fall back to the price list
  for (const k of ['b100', 'b150', 'f45', 'f145', 'f195', 'l50', 'cover', 'anchor']) if (o.stock[k].price === '' || o.stock[k].price === null) o.stock[k].price = PRICE_DEFAULTS[k];
  if (!['f45', 'f145', 'f195'].includes(o.roof.rafterSec)) o.roof.rafterSec = 'f45';
  if (!['b100', 'b150'].includes(o.base.beamSec)) o.base.beamSec = 'b100';
  if (!OSB_PRICES[o.walls.sheathT]) o.walls.sheathT = 12;
  if (![18, 22, 25, 30].includes(+o.floor.sheetT)) o.floor.sheetT = 30;
  o.stock.osbWall.name = `OSB/3 ${o.walls.sheathT} mm`;
  o.stock.osbFloor.name = `OSB/3 ${o.floor.sheetT} mm pióro-wpust`;
  return o;
}

function fixOpening(op) {
  return { id: op.id || uid('o'), type: OPENING_NAMES[op.type] ? op.type : 'window', U: clampN(op.U, 0, 15000, 0), w: clampN(op.w, 200, 6000, 600), h: clampN(op.h, 200, 3000, 600), sill: op.type === 'door' ? 0 : clampN(op.sill, 0, 2500, 0) };
}

export function encodeState(s) {
  const json = JSON.stringify(s);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeState(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return normalize(JSON.parse(decodeURIComponent(escape(atob(b64)))));
}
