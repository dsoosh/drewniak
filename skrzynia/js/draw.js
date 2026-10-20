// SVG drawings of the chest: orthographic views and sections drawn from the generator's boxes,
// board layouts and part sketches. Units are millimetres. Colours come from a palette object so
// the same code serves the themed page and the PDF (svg2pdf cannot resolve CSS variables).

import { banana } from '../../szkielet/js/draw.js';
import { SKIRT_DROP } from './build.js';

const f = (n) => (Math.round(n * 10) / 10).toString();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const fmt = (n, dec = 0) => (dec ? (Math.round(n * 10) / 10).toString().replace('.', ',') : Math.round(n).toString());

export function palette(el = document.documentElement) {
  const cs = getComputedStyle(el);
  const g = (n, d) => cs.getPropertyValue(n).trim() || d;
  return {
    ink: g('--ink', '#1d2420'), muted: g('--muted', '#5f6b64'), line: g('--line', '#c9d0c9'), bg: g('--panel', '#ffffff'),
    accent: g('--accent', '#2f6b4f'), font: g('--mono', 'monospace'), ...WOOD,
  };
}
const WOOD = {
  wall: '#d3a86f', end: '#c99c63', fingerA: '#ecd09f', fingerB: '#7a5228', skirt: '#c4955b', lid: '#d8b07a', apron: '#cfa36a',
  batten: '#b98a52', inner: '#bf925b', tray: '#dcb47e', handle: '#b98a52', metal: '#2a2a2a', hole: '#3b2a18',
};
export const PRINT_PALETTE = { ink: '#1d2420', muted: '#5f6b64', line: '#c9d0c9', bg: '#ffffff', accent: '#2f6b4f', font: 'DejaVu', ...WOOD };

const COLOR = (b, P) => ({
  wall: b.face === 'end' ? P.end : P.wall, fingerA: P.fingerA, fingerB: P.fingerB, skirt: P.skirt, lid: P.lid, apron: P.apron,
  batten: P.batten, cleat: P.inner, bottom: P.inner, runner: P.inner, tray: P.tray, trayBottom: P.inner, handle: P.handle, metal: P.metal, hinge: P.metal,
}[b.kind] || P.inner);

function dimH(x1, x2, y, text, P, fs) {
  const t = fs * 0.35;
  return `<g stroke="${P.muted}" stroke-width="${f(fs / 14)}" fill="none"><line x1="${f(x1)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y)}"/>
<line x1="${f(x1)}" y1="${f(y - t)}" x2="${f(x1)}" y2="${f(y + t)}"/><line x1="${f(x2)}" y1="${f(y - t)}" x2="${f(x2)}" y2="${f(y + t)}"/>
<line x1="${f(x1 - t)}" y1="${f(y + t)}" x2="${f(x1 + t)}" y2="${f(y - t)}"/><line x1="${f(x2 - t)}" y1="${f(y + t)}" x2="${f(x2 + t)}" y2="${f(y - t)}"/></g>
<text x="${f((x1 + x2) / 2)}" y="${f(y - fs * 0.35)}" font-size="${f(fs)}" text-anchor="middle" fill="${P.ink}" font-family="${P.font}">${esc(text)}</text>`;
}
function dimV(x, y1, y2, text, P, fs, side = 1) {
  const t = fs * 0.35;
  return `<g stroke="${P.muted}" stroke-width="${f(fs / 14)}" fill="none"><line x1="${f(x)}" y1="${f(y1)}" x2="${f(x)}" y2="${f(y2)}"/>
<line x1="${f(x - t)}" y1="${f(y1)}" x2="${f(x + t)}" y2="${f(y1)}"/><line x1="${f(x - t)}" y1="${f(y2)}" x2="${f(x + t)}" y2="${f(y2)}"/>
<line x1="${f(x - t)}" y1="${f(y1 + t)}" x2="${f(x + t)}" y2="${f(y1 - t)}"/><line x1="${f(x - t)}" y1="${f(y2 + t)}" x2="${f(x + t)}" y2="${f(y2 - t)}"/></g>
<text x="${f(x + side * fs * 0.4)}" y="${f((y1 + y2) / 2 + fs * 0.35)}" font-size="${f(fs)}" text-anchor="${side > 0 ? 'start' : 'end'}" fill="${P.ink}" font-family="${P.font}">${esc(text)}</text>`;
}
const svgOpen = (minX, minY, w, h, P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(minX)} ${f(minY)} ${f(w)} ${f(h)}" font-family="${P.font}"><rect x="${f(minX)}" y="${f(minY)}" width="${f(w)}" height="${f(h)}" fill="${P.bg}"/>`;

const INTERIOR = new Set(['cleat', 'bottom', 'runner', 'tray', 'trayBottom', 'batten']);

/**
 * One orthographic drawing. view: 'front' (looking +y), 'side' (from the right end, looking −x),
 * 'top' (looking down), 'secFront' (front wall, skirt and apron removed), 'secSide' (right end removed).
 */
export function viewSVG(res, view, P) {
  const d = res.d, g = res.geometry, T = d.lid.ovE - 3;
  let boxes = g.boxes.filter((b) => b.kind !== 'hole');
  if (view === 'front' || view === 'side' || view === 'top') boxes = boxes.filter((b) => !INTERIOR.has(b.kind));
  if (view === 'secFront') boxes = boxes.filter((b) => !(b.y0 < T - 1e-6 && !b.tray && b.kind !== 'trayBottom' && b.kind !== 'tray') && !(b.lid && b.kind !== 'batten'));
  if (view === 'secSide') boxes = boxes.filter((b) => !(b.x1 > d.Lo - T + 1e-6 && !b.tray && b.kind !== 'tray') && !(b.lid && b.kind !== 'batten'));
  // projection: u right, v down
  const proj = {
    front: (b) => ({ u0: b.x0, u1: b.x1, v0: -b.z1, v1: -b.z0, depth: -b.y0 }),
    secFront: (b) => ({ u0: b.x0, u1: b.x1, v0: -b.z1, v1: -b.z0, depth: -b.y0 }),
    side: (b) => ({ u0: b.y0, u1: b.y1, v0: -b.z1, v1: -b.z0, depth: b.x1 }),
    secSide: (b) => ({ u0: b.y0, u1: b.y1, v0: -b.z1, v1: -b.z0, depth: b.x1 }),
    top: (b) => ({ u0: b.x0, u1: b.x1, v0: -b.y1, v1: -b.y0, depth: b.z1 }),
  }[view];
  const items = boxes.map((b) => ({ b, ...proj(b) })).sort((a, b) => a.depth - b.depth);
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (const it of items) { u0 = Math.min(u0, it.u0); u1 = Math.max(u1, it.u1); v0 = Math.min(v0, it.v0); v1 = Math.max(v1, it.v1); }
  const fs = Math.max(16, (u1 - u0) / 30), pad = fs * 6;
  const isTop = view === 'top';
  const floorV = SKIRT_DROP;                                  // floor line at z = −drop → v = +drop
  const bx = u1 + fs * 2, by = isTop ? v1 + fs * 9 : floorV; // banana on the floor beside the chest
  const W = u1 - u0 + 2 * pad + 230, Hh = v1 - v0 + 2 * pad + (isTop ? fs * 10 : 0);
  let s = svgOpen(u0 - pad, v0 - pad, W, Hh, P);
  if (!isTop) s += `<line x1="${f(u0 - pad)}" y1="${f(floorV)}" x2="${f(u1 + 230 + pad)}" y2="${f(floorV)}" stroke="${P.muted}" stroke-width="${f(fs / 10)}"/>`;
  for (const it of items) {
    const c = COLOR(it.b, P);
    s += `<rect x="${f(it.u0)}" y="${f(it.v0)}" width="${f(it.u1 - it.u0)}" height="${f(it.v1 - it.v0)}" fill="${c}" stroke="${P.ink}" stroke-opacity="0.45" stroke-width="${f(fs / 16)}"/>`;
  }
  // glue seams on exterior walls
  if (view === 'front' || view === 'side') {
    const [a, b] = view === 'front' ? [T, d.Lo - T] : [T, d.Do - T];
    for (const z of g.seams) if (z > d.skirt.h - SKIRT_DROP) s += `<line x1="${f(a)}" y1="${f(-z)}" x2="${f(b)}" y2="${f(-z)}" stroke="${P.ink}" stroke-opacity="0.35" stroke-width="${f(fs / 16)}" stroke-dasharray="${f(fs)} ${f(fs / 2)}"/>`;
  }
  // hand holes in the side section (tray ends) and front section (outline only)
  for (const h of g.boxes.filter((b) => b.kind === 'hole')) {
    if (view === 'secSide') {
      const r = h.h / 2, cx = h.yc, cz = -(h.zTop - r);
      if (h.cutout) s += `<rect x="${f(cx - h.len / 2)}" y="${f(-h.zTop - 0.5)}" width="${f(h.len)}" height="${f(h.h)}" rx="${f(r)}" fill="${P.hole}"/>`;
      else s += `<rect x="${f(cx - h.len / 2)}" y="${f(cz - r)}" width="${f(h.len)}" height="${f(h.h)}" rx="${f(r)}" fill="${P.hole}"/>`;
    }
  }
  // dimensions
  if (view === 'front' || view === 'secFront') {
    const top = -(d.H + T);
    s += dimH(-d.lid.ovE, d.Lo + d.lid.ovE, top - fs * 3, `${fmt(d.lid.len)}`, P, fs);
    s += dimH(0, d.Lo, floorV + fs * 3, `${fmt(d.Lo)}`, P, fs);
    const x = d.Lo + d.lid.ovE + fs * 2.5;
    if (view === 'front') {
      s += dimV(x, floorV, -(d.skirt.top), `${fmt(d.skirt.h, 1)}`, P, fs);
      s += dimV(x, -(d.skirt.top), -d.apron.edge, `${fmt(d.apron.edge - d.skirt.top, 1)}`, P, fs);
      s += dimV(x, -d.apron.edge, top, `${fmt(d.apron.h, 1)}`, P, fs);
      s += dimV(x + fs * 7, floorV, top, `${fmt(d.total.H)}`, P, fs);
    } else {
      for (const tr of d.trays) s += dimV(x, -tr.bot, -tr.top, `${fmt(tr.top - tr.bot)}`, P, fs);
      s += dimV(x + fs * 7, 0, -d.H, `${fmt(d.H)}`, P, fs);
    }
  }
  if (view === 'side' || view === 'secSide') {
    const top = -(d.H + T);
    s += dimH(d.Do - d.lid.depth, d.Do, top - fs * 3, `${fmt(d.lid.depth)}`, P, fs);
    s += dimH(0, d.Do, floorV + fs * 3, `${fmt(d.Do)}`, P, fs);
    if (view === 'side') {
      const x = d.Do + fs * 2.5;
      s += dimV(x, -d.handle.bot, -d.handle.top, `uchwyt ${fmt(d.handle.top - d.handle.bot, 1)}`, P, fs);
      s += dimV(x + fs * 9, 0, -d.handle.top, `${fmt(d.handle.top, 1)}`, P, fs);
    } else if (d.trays.length) {
      s += dimH(d.Do / 2 - d.trays[0].depth / 2, d.Do / 2 + d.trays[0].depth / 2, -d.trays[0].top - fs * 1.2, `${fmt(d.trays[0].depth)}`, P, fs);
    }
  }
  if (isTop) {
    s += dimH(-d.lid.ovE, d.Lo + d.lid.ovE, -d.Do - fs * 3, `${fmt(d.lid.len)}`, P, fs);
    s += dimV(d.Lo + d.lid.ovE + fs * 2.5, -d.Do, -(d.Do - d.lid.depth), `${fmt(d.lid.depth)}`, P, fs);
    // hinge positions from the left end
    let prev = 0;
    for (const x of g.hinges) { s += dimH(prev, x, -d.Do - fs * 6.5, `${fmt(x - prev)}`, P, fs * 0.85); prev = x; }
    s += dimH(prev, d.Lo, -d.Do - fs * 6.5, `${fmt(d.Lo - prev)}`, P, fs * 0.85);
    for (const x of g.hinges) s += `<rect x="${f(x - 35)}" y="${f(-d.Do - 6)}" width="70" height="8" fill="${P.metal}"/>`;
  }
  s += banana(bx, by, P, 1);
  return s + '</svg>';
}

/** Board layout of one board: sections, strips and numbered pieces. */
export function boardSVG(board, stock, kerf, trim, num, P) {
  const { L, W } = stock, fs = Math.max(26, W / 5);
  let s = svgOpen(-10, -10, L + 20, W + 20, P);
  s += `<rect x="0" y="0" width="${f(L)}" height="${f(W)}" fill="${P.bg}" stroke="${P.ink}" stroke-width="3"/>`;
  if (trim) s += `<rect x="0" y="0" width="${f(trim)}" height="${f(W)}" fill="${P.line}"/><rect x="${f(L - trim)}" y="0" width="${f(trim)}" height="${f(W)}" fill="${P.line}"/>`;
  board.secs.forEach((sec, si) => {
    const x0 = trim + sec.x;
    for (const st of sec.strips) for (const it of st.items) {
      const p = it.p, x = x0 + it.x, y = st.y;
      s += `<rect x="${f(x)}" y="${f(y)}" width="${f(p.l)}" height="${f(p.w)}" fill="${p.show ? P.wall : P.end}" stroke="${P.ink}" stroke-width="2"/>`;
      if (p.l > fs * 2 && p.w > fs * 0.9) s += `<text x="${f(x + p.l / 2)}" y="${f(y + p.w / 2 + fs * 0.35)}" font-size="${f(Math.min(fs, p.w * 0.8))}" text-anchor="middle" fill="${P.ink}">${num(p)}</text>`;
    }
    s += `<text x="${f(x0 + 6)}" y="${f(W - 6)}" font-size="${f(fs * 0.7)}" fill="${P.accent}" font-weight="700">${String.fromCharCode(65 + si)}</text>`;
  });
  return s + '</svg>';
}

/** Small sketch of a part: a rectangle in proportion with its length and width. */
export function partSketch(p, P) {
  const k = 120 / Math.max(p.l, p.w * 3);
  const w = Math.max(2, p.l * k), h = Math.max(2, p.w * k);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w + 2)} ${f(h + 2)}" width="${f(w + 2)}" height="${f(h + 2)}"><rect x="1" y="1" width="${f(w)}" height="${f(h)}" fill="${p.show ? P.wall : P.end}" stroke="${P.ink}" stroke-width="0.8"/><line x1="4" y1="${f(1 + h / 2)}" x2="${f(w - 3)}" y2="${f(1 + h / 2)}" stroke="${P.ink}" stroke-opacity="0.25" stroke-width="0.6"/></svg>`;
}
