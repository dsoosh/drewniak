// Project state: defaults, normalisation and (de)serialisation.
// All dimensions in millimetres, angles in degrees.

export const SECTIONS = {
  b100: { name: 'Belka 100×100', w: 100, h: 100 },
  f45: { name: 'Kantówka 45×95', w: 45, h: 95 },
  l50: { name: 'Łata 50×50', w: 50, h: 50 },
};

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
    base: { maxSpan: 1500, midSupport: 'auto' },
    floor: { joistMax: 600, sheetT: 25, splitJoists: false },
    walls: { h0: 2350, studMax: 625, nogStep: 800, nogStagger: true, sheathT: 12, sheathBelow: 50, sheathe: true },
    roof: {
      type: 'mono', pitch: 13.9, highSide: 'back', ovhEave: 300, ovhGable: 300,
      rafterMax: 450, battenMax: 420, battenSec: 'l50', ties: true,
      cover: { name: 'Płyta bitumiczna falista', len: 2000, wid: 950, lapL: 200, lapW: 95, nails: 20 },
      clear: [],
    },
    openings: {
      front: [{ id: 'o1', type: 'window', U: 1880, w: 1020, h: 520, sill: 1100 }],
      back: [{ id: 'o2', type: 'opening', U: 1100, w: 900, h: 2090, sill: 0 }],
      left: [],
      right: [{ id: 'o3', type: 'door', U: 740, w: 1020, h: 2090, sill: 0 }],
    },
    partitions: [],
    stock: {
      b100: { len: 6500, price: '' },   // sold as halves of 13 m beams
      f45: { len: 6000, price: '' },
      l50: { len: 5400, price: '' },
      osbWall: { name: 'OSB/3 12 mm', w: 1250, h: 2500, price: '' },
      osbFloor: { name: 'OSB/3 25 mm pióro-wpust', w: 1250, h: 2500, price: '' },
      cover: { price: '' },
    },
    kerf: 3,
    loads: { floor: 2.0, roof: 1.3 },
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
  o.dims.L = Math.max(1000, num(o.dims.L, 3101));
  o.dims.W = Math.max(1000, num(o.dims.W, 2500));
  o.roof.pitch = Math.min(45, Math.max(5, num(o.roof.pitch, 13.9)));
  for (const w of WALL_IDS) o.openings[w] = (o.openings[w] || []).map(fixOpening);
  o.partitions = (o.partitions || []).map((p) => ({ id: p.id || uid('p'), orient: p.orient === 'y' ? 'y' : 'x', c: +p.c, a: +p.a, b: +p.b, h: num(p.h, o.walls.h0), sheathe: !!p.sheathe, bearing: !!p.bearing && p.orient !== 'y', openings: (p.openings || []).map(fixOpening) }));
  if (!Array.isArray(o.roof.clear)) o.roof.clear = [];
  return o;
}

function fixOpening(op) {
  return { id: op.id || uid('o'), type: OPENING_NAMES[op.type] ? op.type : 'window', U: +op.U || 0, w: Math.max(200, +op.w || 600), h: Math.max(200, +op.h || 600), sill: op.type === 'door' ? 0 : Math.max(0, +op.sill || 0) };
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
