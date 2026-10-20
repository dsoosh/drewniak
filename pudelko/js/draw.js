// SVG drawings of the practice box: orthographic views from the generator's boxes and the
// marking templates. Board layouts, part sketches and the palette come from the tool chest.

import { banana } from '../../szkielet/js/draw.js';
export { boardSVG, partSketch, palette, PRINT_PALETTE, fmt } from '../../skrzynia/js/draw.js';
import { fmt } from '../../skrzynia/js/draw.js';

const f = (n) => (Math.round(n * 10) / 10).toString();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const COLOR = (b, P) => ({
  wall: b.face === 'end' ? P.end : P.wall, fingerA: P.fingerA, fingerB: P.fingerB, bottom: P.inner, panel: P.lid, lidPanel: P.lid,
  lip: P.inner, batten: P.batten, hinge: '#b08d3a', grip: P.batten, recess: P.hole,
}[b.kind] || P.inner);

function dimH(x1, x2, y, text, P, fs) {
  const t = fs * 0.35;
  return `<g stroke="${P.muted}" stroke-width="${f(fs / 14)}" fill="none"><line x1="${f(x1)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y)}"/>
<line x1="${f(x1)}" y1="${f(y - t)}" x2="${f(x1)}" y2="${f(y + t)}"/><line x1="${f(x2)}" y1="${f(y - t)}" x2="${f(x2)}" y2="${f(y + t)}"/></g>
<text x="${f((x1 + x2) / 2)}" y="${f(y - fs * 0.35)}" font-size="${f(fs)}" text-anchor="middle" fill="${P.ink}" font-family="${P.font}">${esc(text)}</text>`;
}
function dimV(x, y1, y2, text, P, fs) {
  const t = fs * 0.35;
  return `<g stroke="${P.muted}" stroke-width="${f(fs / 14)}" fill="none"><line x1="${f(x)}" y1="${f(y1)}" x2="${f(x)}" y2="${f(y2)}"/>
<line x1="${f(x - t)}" y1="${f(y1)}" x2="${f(x + t)}" y2="${f(y1)}"/><line x1="${f(x - t)}" y1="${f(y2)}" x2="${f(x + t)}" y2="${f(y2)}"/></g>
<text x="${f(x + fs * 0.4)}" y="${f((y1 + y2) / 2 + fs * 0.35)}" font-size="${f(fs)}" fill="${P.ink}" font-family="${P.font}">${esc(text)}</text>`;
}

/** Front (looking +y), side (from the right, looking −x) or top view, lid closed. */
export function viewSVG(res, view, P) {
  const d = res.d, g = res.geometry;
  const boxes = g.boxes.filter((b) => !['bottom', 'lip'].includes(b.kind) || view === 'top');
  const proj = {
    front: (b) => ({ u0: b.x0, u1: b.x1, v0: -b.z1, v1: -b.z0, depth: -b.y0 }),
    side: (b) => ({ u0: b.y0, u1: b.y1, v0: -b.z1, v1: -b.z0, depth: b.x1 }),
    top: (b) => ({ u0: b.x0, u1: b.x1, v0: -b.y1, v1: -b.y0, depth: b.z1 }),
  }[view];
  const items = boxes.map((b) => ({ b, ...proj(b) })).sort((a, b) => a.depth - b.depth);
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (const it of items) { u0 = Math.min(u0, it.u0); u1 = Math.max(u1, it.u1); v0 = Math.min(v0, it.v0); v1 = Math.max(v1, it.v1); }
  const fs = Math.max(8, (u1 - u0) / 26), pad = fs * 5, isTop = view === 'top';
  const bx = u1 + fs * 9;                                    // banana clear of the dimensions
  const W = u1 - u0 + 2 * pad + fs * 7 + 220, H = v1 - v0 + 2 * pad + (isTop ? 70 : 0);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(u0 - pad)} ${f(v0 - pad)} ${f(W)} ${f(H)}" font-family="${P.font}"><rect x="${f(u0 - pad)}" y="${f(v0 - pad)}" width="${f(W)}" height="${f(H)}" fill="${P.bg}"/>`;
  if (!isTop) s += `<line x1="${f(u0 - pad)}" y1="0" x2="${f(u1 + fs * 7 + 220 + pad)}" y2="0" stroke="${P.muted}" stroke-width="${f(fs / 10)}"/>`;
  for (const it of items) s += `<rect x="${f(it.u0)}" y="${f(it.v0)}" width="${f(it.u1 - it.u0)}" height="${f(it.v1 - it.v0)}" fill="${COLOR(it.b, P)}" stroke="${P.ink}" stroke-opacity="0.45" stroke-width="${f(fs / 18)}"/>`;
  const totH = d.total.H;
  if (view === 'front') {
    s += dimH(u0, u1, -totH - fs * 2.5, fmt(u1 - u0), P, fs);
    s += dimV(u1 + fs * 2, 0, -d.H, fmt(d.H), P, fs);
    if (d.lid === 'hinged') s += dimV(u1 + fs * 6, 0, -d.hinged.cut, `cięcie ${fmt(d.hinged.cut)}`, P, fs);
    if (totH > d.H + 0.5) s += dimV(u1 + fs * 6, -d.H, -totH, fmt(totH - d.H, 1), P, fs);
  }
  if (view === 'side') {
    s += dimH(u0, u1, -totH - fs * 2.5, fmt(u1 - u0), P, fs);
    if (d.lid === 'slide') s += dimV(u1 + fs * 2, 0, -d.slide.low, `niski bok ${fmt(d.slide.low)}`, P, fs);
  }
  if (isTop) {
    s += dimV(u1 + fs * 2, v0, v1, fmt(v1 - v0), P, fs);
    if (d.lid === 'hinged') { const h = d.hinged.hinge; s += dimH(0, h.from, -d.Do - fs * 2.5, fmt(h.from), P, fs * 0.9); s += dimH(h.from, h.from + h.len, -d.Do - fs * 2.5, fmt(h.len), P, fs * 0.9); }
  }
  s += banana(bx, isTop ? v1 + 60 : 0, P, 1);
  return s + '</svg>';
}

/**
 * Marking template of one finger layout, drawn in millimetres (1 unit = 1 mm): bands from the
 * bottom of the piece, waste crossed, depth line T + 0.5 and a 100 mm control bar.
 */
export function templateSVG(t, T, P, holder = 'front') {
  const h = t.bands.reduce((a, b) => a + b, 0), depth = t.depth, wid = 150;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -${f(h + 30)} ${wid + 60} ${f(h + 60)}" font-family="${P.font}"><rect x="-30" y="-${f(h + 30)}" width="${wid + 60}" height="${f(h + 60)}" fill="#fff"/>`;
  // two columns: the front/back piece and the end piece; waste = the bands the other piece holds
  const cols = [['przód / tył', 0], ['bok', 80]];
  let z = 0;
  t.bands.forEach((b, i) => {
    const frontHolds = (i % 2 === 0) !== (t.frontHolds === 'odd');
    for (const [, x0] of cols) {
      const isFront = x0 === 0, waste = isFront ? !frontHolds : frontHolds;
      s += `<rect x="${x0}" y="${f(-z - b)}" width="${f(depth)}" height="${f(b)}" fill="${waste ? '#eee' : '#fff'}" stroke="#000" stroke-width="0.25"/>`;
      if (waste) s += `<path d="M ${x0} ${f(-z - b)} L ${f(x0 + depth)} ${f(-z)} M ${f(x0 + depth)} ${f(-z - b)} L ${x0} ${f(-z)}" stroke="#000" stroke-width="0.25"/>`;
      s += `<line x1="${f(x0 + depth)}" y1="${f(-z - b)}" x2="${f(x0 + 60)}" y2="${f(-z - b)}" stroke="#000" stroke-width="0.15" stroke-dasharray="1 1"/>`;
    }
    s += `<text x="${f(depth + 3)}" y="${f(-z - b / 2 + 1.2)}" font-size="3.2" fill="#000">${fmt(b, 1)}</text>`;
    z += b;
  });
  for (const [label, x0] of cols) s += `<text x="${x0}" y="${f(-h - 4)}" font-size="3.5" fill="#000">${label}</text><line x1="${f(x0 + depth)}" y1="0" x2="${f(x0 + depth)}" y2="${f(-h)}" stroke="#000" stroke-width="0.35"/>`;
  s += `<text x="0" y="6" font-size="3" fill="#000">głębokość ${fmt(depth, 1)} mm (T + 0,5)</text>`;
  s += `<rect x="0" y="12" width="100" height="4" fill="none" stroke="#000" stroke-width="0.3"/><rect x="0" y="12" width="50" height="4" fill="#000"/><text x="102" y="15.5" font-size="3" fill="#000">100 mm</text>`;
  return s + '</svg>';
}
