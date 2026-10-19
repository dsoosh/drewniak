// SVG drawings: wall elevations, floor plan, roof plan. Units are millimetres; screen y = -z
// (elevations) or -y (plans). Colours come from a palette object so the same code serves the
// themed page and the PDF (svg2pdf cannot resolve CSS variables).

import { WALL_NAMES, OPENING_NAMES } from './model.js';

const R = Math.round;
const f = (n) => (Math.round(n * 10) / 10).toString();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmt = (n) => R(n).toLocaleString('pl-PL').replace(/ /g, ' ');

export function palette(el = document.documentElement) {
  const cs = getComputedStyle(el);
  const g = (n, d) => cs.getPropertyValue(n).trim() || d;
  return {
    ink: g('--ink', '#1d2420'), muted: g('--muted', '#5f6b64'), line: g('--line', '#c9d0c9'), bg: g('--panel', '#ffffff'),
    accent: g('--accent', '#2f6b4f'), warn: g('--warn', '#b4442a'),
    beam: g('--c-beam', '#8c6a43'), joist: g('--c-joist', '#c9a66b'), stud: g('--c-stud', '#ddb980'), plate: g('--c-plate', '#c99a5b'),
    header: g('--c-header', '#b9783e'), nog: g('--c-nog', '#e6c896'), rafter: g('--c-rafter', '#b98a52'), batten: g('--c-batten', '#a77b45'),
    sheet: g('--c-sheet', '#d9b46a'), floor: g('--c-floor', '#bf9558'), cover: g('--c-cover', '#6f4a3a'), clear: g('--c-clear', '#8fd0e6'),
    font: g('--mono', 'monospace'), fontLabel: g('--sans', 'sans-serif'),
  };
}

export const PRINT_PALETTE = {
  ink: '#1d2420', muted: '#5f6b64', line: '#c9d0c9', bg: '#ffffff', accent: '#2f6b4f', warn: '#b4442a',
  beam: '#8c6a43', joist: '#c9a66b', stud: '#ddb980', plate: '#c99a5b', header: '#b9783e', nog: '#e6c896',
  rafter: '#b98a52', batten: '#a77b45', sheet: '#d9b46a', floor: '#bf9558', cover: '#6f4a3a', clear: '#8fd0e6',
  font: 'DejaVu', fontLabel: 'DejaVu',
};

const KIND_COLOR = { stud: 'stud', king: 'stud', trimmer: 'plate', cripple: 'stud', plate: 'plate', header: 'header', sill: 'header', nog: 'nog', rafter: 'rafter', tie: 'rafter', verge: 'rafter', batten: 'batten', beam: 'beam', joist: 'joist' };

function poly(pts, map, attrs) {
  return `<polygon points="${pts.map((p) => map(p).map(f).join(',')).join(' ')}" ${attrs}/>`;
}

function dimH(x1, x2, y, text, P, fs, ext = 0) {
  const t = fs * 0.35;
  return `<g stroke="${P.muted}" stroke-width="${f(fs / 14)}" fill="none">
<line x1="${f(x1)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y)}"/>
<line x1="${f(x1)}" y1="${f(y - t)}" x2="${f(x1)}" y2="${f(y + t + ext)}"/><line x1="${f(x2)}" y1="${f(y - t)}" x2="${f(x2)}" y2="${f(y + t + ext)}"/>
<line x1="${f(x1 - t)}" y1="${f(y + t)}" x2="${f(x1 + t)}" y2="${f(y - t)}"/><line x1="${f(x2 - t)}" y1="${f(y + t)}" x2="${f(x2 + t)}" y2="${f(y - t)}"/></g>
<text x="${f((x1 + x2) / 2)}" y="${f(y - fs * 0.35)}" font-size="${f(fs)}" text-anchor="middle" fill="${P.ink}" font-family="${P.font}">${esc(text)}</text>`;
}

function dimV(x, y1, y2, text, P, fs) {
  const t = fs * 0.35, cy = (y1 + y2) / 2;
  return `<g stroke="${P.muted}" stroke-width="${f(fs / 14)}" fill="none">
<line x1="${f(x)}" y1="${f(y1)}" x2="${f(x)}" y2="${f(y2)}"/>
<line x1="${f(x - t)}" y1="${f(y1)}" x2="${f(x + t)}" y2="${f(y1)}"/><line x1="${f(x - t)}" y1="${f(y2)}" x2="${f(x + t)}" y2="${f(y2)}"/>
<line x1="${f(x - t)}" y1="${f(y1 + t)}" x2="${f(x + t)}" y2="${f(y1 - t)}"/><line x1="${f(x - t)}" y1="${f(y2 + t)}" x2="${f(x + t)}" y2="${f(y2 - t)}"/></g>
<text x="${f(x - fs * 0.3)}" y="${f(cy + fs * 0.35)}" font-size="${f(fs)}" text-anchor="end" fill="${P.ink}" font-family="${P.font}">${esc(text)}</text>`;
}

// Banana, real size (~195 mm long), lying with its belly on the line y = y0 (screen coords).
function banana(x0, y0, P, scale = 1) {
  const k = scale;
  const pt = (x, y) => `${f(x0 + x * k)},${f(y0 - y * k)}`;
  const peel = `M ${pt(0, 18)} C ${pt(40, -2)} ${pt(130, -4)} ${pt(178, 26)} L ${pt(186, 34)} C ${pt(150, 20)} ${pt(60, 22)} ${pt(8, 40)} Z`;
  return `<g><path d="${peel}" fill="#f2cf3c" stroke="#8a6d12" stroke-width="${f(2 * k)}" stroke-linejoin="round"/>
<path d="M ${pt(178, 26)} L ${pt(195, 40)} L ${pt(190, 44)} L ${pt(184, 35)} Z" fill="#6b5a2a"/>
<path d="M ${pt(0, 18)} L ${pt(-6, 24)} L ${pt(6, 38)} L ${pt(8, 40)} Z" fill="#3b3320"/>
<path d="M ${pt(20, 22)} C ${pt(70, 12)} ${pt(120, 12)} ${pt(165, 26)}" fill="none" stroke="#c9a52a" stroke-width="${f(1.6 * k)}"/></g>`;
}

function svgOpen(minX, minY, w, h, P, extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(minX)} ${f(minY)} ${f(w)} ${f(h)}" width="${f(w / 10)}mm" height="${f(h / 10)}mm" font-family="${P.font}" ${extra}><rect x="${f(minX)}" y="${f(minY)}" width="${f(w)}" height="${f(h)}" fill="${P.bg}"/>`;
}

// ---------- wall elevation ----------

export function elevationSVG(res, state, id, opt) {
  const P = opt.pal, def = res.walls[id];
  if (!def) return '';
  const zf = res.info.zf;
  const isPart = !!def.partition;
  const U0 = isPart ? 0 : def.Us[0], U1 = isPart ? def.B : def.Us[1];
  const members = res.members.filter((m) => m.wall === id);
  let zTop = Math.max(...members.flatMap((m) => m.upoly.map((p) => p[1])));
  const roofProfile = [];
  if (!isPart && (id === 'left' || id === 'right')) {
    // end rafter, battens and covering seen at the gable
    const toU = id === 'left' ? (y) => state.dims.W - y : (y) => y;
    const xEnd = id === 'left' ? 0 : state.dims.L;
    for (const m of res.members) if ((m.kind === 'rafter' || m.kind === 'batten') && m.shape.d[0] <= xEnd + 1 && m.shape.d[1] >= xEnd - 1)
      roofProfile.push({ c: KIND_COLOR[m.kind], pts: m.shape.poly.map(([y, z]) => [toU(y), z]) });
    for (const g of res.roof.grid) for (const c of g.cells) if (c.x0 <= xEnd && c.x1 >= xEnd) roofProfile.push({ c: c.clear ? 'clear' : 'cover', pts: c.shape.poly.map(([y, z]) => [toU(y), z]) });
  }
  const allPts = roofProfile.flatMap((r) => r.pts);
  const xs = [U0, U1, ...allPts.map((p) => p[0])], zs = [zTop, ...allPts.map((p) => p[1])];
  const minU = Math.min(...xs), maxU = Math.max(...xs);
  zTop = Math.max(...zs);
  const fs = Math.max(55, (maxU - minU) / 45);
  const padL = fs * 15, padR = fs * 6 + 260, padT = fs * 3, padB = fs * 4.2;
  const vb = [minU - padL, -zTop - padT, maxU - minU + padL + padR, zTop + padT + padB];
  const M = ([u, z]) => [u, -z];
  let s = '';
  s += `<line x1="${f(vb[0])}" y1="0" x2="${f(vb[0] + vb[2])}" y2="0" stroke="${P.muted}" stroke-width="${f(fs / 10)}"/>`;
  if (!isPart) {
    s += poly([[U0, 0], [U1, 0], [U1, 100], [U0, 100]], M, `fill="${P.beam}" stroke="${P.ink}" stroke-width="1.5" vector-effect="non-scaling-stroke"`);
    s += poly([[U0, 100], [U1, 100], [U1, 195], [U0, 195]], M, `fill="${P.joist}" stroke="${P.ink}" stroke-width="1" vector-effect="non-scaling-stroke"`);
    s += poly([[U0, 195], [U1, 195], [U1, zf], [U0, zf]], M, `fill="${P.floor}" stroke="${P.ink}" stroke-width="1" vector-effect="non-scaling-stroke"`);
  } else {
    s += `<line x1="${f(U0 - 200)}" y1="${f(-zf)}" x2="${f(U1 + 200)}" y2="${f(-zf)}" stroke="${P.floor}" stroke-width="${f(fs / 4)}"/>`;
  }
  for (const r of roofProfile) s += poly(r.pts, M, `fill="${P[r.c]}" fill-opacity="${r.c === 'clear' ? 0.6 : 1}" stroke="${P.ink}" stroke-width="1" vector-effect="non-scaling-stroke"`);
  const order = ['plate', 'stud', 'king', 'trimmer', 'cripple', 'nog', 'sill', 'header'];
  for (const k of order) for (const m of members.filter((x) => x.kind === k))
    s += poly(m.upoly, M, `fill="${P[KIND_COLOR[k]]}" stroke="${P.ink}" stroke-width="1" vector-effect="non-scaling-stroke"`);
  const sheetList = opt.inside ? def.sheetsIn : def.sheets;
  if (opt.sheathing && sheetList) {
    for (const p of sheetList) {
      for (const c of p.cells) s += poly(c.poly, M, `fill="${P.sheet}" fill-opacity="0.55" stroke="none"`);
      for (const c of p.cells) for (const [a, b] of c.edges) s += `<line x1="${f(a[0])}" y1="${f(-a[1])}" x2="${f(b[0])}" y2="${f(-b[1])}" stroke="${P.ink}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
      const cell = p.cells.reduce((m, c) => ((c.x1 - c.x0) * (c.y1 - c.y0) > (m.x1 - m.x0) * (m.y1 - m.y0) ? c : m), p.cells[0]);
      const cx = cell.poly.reduce((t, q) => t + q[0], 0) / cell.poly.length, cyy = cell.poly.reduce((t, q) => t + q[1], 0) / cell.poly.length;
      const [bx0, by0, bx1, by1] = [cx - 1, cyy - 1, cx + 1, cyy + 1];
      const big = Math.min(cell.x1 - cell.x0, cell.y1 - cell.y0) > fs * 2.2;
      if (big) {
        s += `<text x="${f((bx0 + bx1) / 2)}" y="${f(-(by0 + by1) / 2)}" font-size="${f(fs * 1.4)}" text-anchor="middle" font-weight="700" fill="${P.ink}" font-family="${P.fontLabel}">${p.label}</text>`;
        s += `<text x="${f((bx0 + bx1) / 2)}" y="${f(-(by0 + by1) / 2 + fs * 1.3)}" font-size="${f(fs * 0.9)}" text-anchor="middle" fill="${P.ink}">${p.w}×${p.h}</text>`;
      } else if (Math.max(cell.x1 - cell.x0, cell.y1 - cell.y0) > fs * 3) {
        s += `<text x="${f((bx0 + bx1) / 2)}" y="${f(-(by0 + by1) / 2 + fs * 0.35)}" font-size="${f(fs * 0.9)}" text-anchor="middle" font-weight="700" fill="${P.ink}" font-family="${P.fontLabel}">${p.label}</text>`;
      }
    }
  }
  const ops = isPart ? (state.partitions.find((p) => p.id === id) || {}).openings || [] : state.openings[id] || [];
  for (const o of ops) {
    const x0 = o.U, x1 = o.U + o.w, z0 = zf + o.sill, z1 = z0 + o.h, sel = opt.selected === o.id;
    s += `<rect x="${f(x0)}" y="${f(-z1)}" width="${f(o.w)}" height="${f(o.h)}" fill="${sel ? P.accent : P.bg}" fill-opacity="${sel ? 0.18 : 0.35}" stroke="${sel ? P.accent : P.ink}" stroke-width="${sel ? 3 : 1.5}" stroke-dasharray="${sel ? '' : '12 8'}" vector-effect="non-scaling-stroke" ${opt.interactive ? `data-op="${o.id}" data-mode="move" style="cursor:move"` : ''}/>`;
    s += `<text x="${f((x0 + x1) / 2)}" y="${f(-(z0 + z1) / 2)}" font-size="${f(fs)}" text-anchor="middle" fill="${P.ink}" font-family="${P.fontLabel}" pointer-events="none">${OPENING_NAMES[o.type]} ${o.w}×${o.h}</text>`;
    if (opt.interactive) {
      const hw = fs * 0.9;
      s += `<rect x="${f(x0 - hw / 2)}" y="${f(-z1)}" width="${f(hw)}" height="${f(o.h)}" fill="${P.accent}" fill-opacity="${sel ? 0.5 : 0}" data-op="${o.id}" data-mode="l" style="cursor:ew-resize"/>`;
      s += `<rect x="${f(x1 - hw / 2)}" y="${f(-z1)}" width="${f(hw)}" height="${f(o.h)}" fill="${P.accent}" fill-opacity="${sel ? 0.5 : 0}" data-op="${o.id}" data-mode="r" style="cursor:ew-resize"/>`;
      s += `<rect x="${f(x0)}" y="${f(-z1 - hw / 2)}" width="${f(o.w)}" height="${f(hw)}" fill="${P.accent}" fill-opacity="${sel ? 0.5 : 0}" data-op="${o.id}" data-mode="t" style="cursor:ns-resize"/>`;
      if (o.sill > 0) s += `<rect x="${f(x0)}" y="${f(-z0 - hw / 2)}" width="${f(o.w)}" height="${f(hw)}" fill="${P.accent}" fill-opacity="${sel ? 0.5 : 0}" data-op="${o.id}" data-mode="b" style="cursor:ns-resize"/>`;
    }
  }
  // dimensions
  const yB = fs * 2.6;
  s += dimH(def.A, def.B, yB, `${fmt(def.B - def.A)} szkielet`, P, fs);
  if (!isPart) s += dimH(U0, U1, yB + fs * 1.6, `${fmt(U1 - U0)} po poszyciu`, P, fs);
  const sorted = [...ops].sort((a, b) => a.U - b.U);
  let prev = def.A;
  const yO = -(zf) + fs * 1.2;
  for (const o of sorted) {
    if (o.U - prev > fs * 2) s += dimH(prev, o.U, yO, fmt(o.U - prev), P, fs * 0.85);
    prev = o.U + o.w;
  }
  if (sorted.length && def.B - prev > fs * 2) s += dimH(prev, def.B, yO, fmt(def.B - prev), P, fs * 0.85);
  const topL = def.top(def.A), topR = def.top(def.B);
  s += dimV(minU - fs * 1.6, -zf, -topL, `${fmt(topL - zf)}`, P, fs);
  if (Math.abs(topR - topL) > 1) s += dimV(maxU + fs * 5, -zf, -topR, `${fmt(topR - zf)}`, P, fs);
  if (!isPart) s += dimV(minU - fs * 6.5, 0, -topL, `${fmt(topL)} od gruntu`, P, fs);
  if (opt.inside) s += banana(def.A + (def.B - def.A) * 0.12, -zf, P);
  else s += banana(U1 + 60, 0, P);
  const extra = opt.interactive ? `data-view="wall" data-id="${id}"` : '';
  if (!opt.inside) return svgOpen(vb[0], vb[1], vb[2], vb[3], P, extra) + s + '</svg>';
  // inside view: mirror the whole drawing about the wall centre, then un-mirror every label
  const C = U0 + U1;
  const texts = s.replace(/<text ([^>]*?)x="(-?[\d.]+)"([^>]*)>/g, (m, a, x, b) => {
    const attrs = (a + 'x="' + x + '"' + b).replace(/text-anchor="(end|start)"/, (q, w) => `text-anchor="${w === 'end' ? 'start' : 'end'}"`);
    return `<text ${attrs} transform="matrix(-1 0 0 1 ${f(2 * +x)} 0)">`;
  });
  return svgOpen(C - (vb[0] + vb[2]), vb[1], vb[2], vb[3], P, extra + ' data-inside="1"') + `<g transform="matrix(-1 0 0 1 ${f(C)} 0)">` + texts + '</g></svg>';
}

// ---------- floor plan ----------

export function planSVG(res, state, opt) {
  const P = opt.pal, { L, W } = state.dims;
  const fs = Math.max(55, Math.max(L, W) / 45);
  const pad = fs * 5;
  const vb = [-pad - fs * 4, -W - pad, L + 2 * pad + fs * 6 + 250, W + 2 * pad];
  const M = ([x, y]) => [x, -y];
  let s = svgOpen(vb[0], vb[1], vb[2], vb[3], P, opt.interactive ? 'data-view="plan"' : '');
  for (const m of res.members.filter((x) => x.kind === 'beam')) s += poly(m.shape.poly, M, `fill="${P.beam}" fill-opacity="0.45" stroke="${P.ink}" stroke-width="1" vector-effect="non-scaling-stroke"`);
  for (const m of res.members.filter((x) => x.kind === 'joist')) s += poly(m.shape.poly, M, `fill="${P.joist}" fill-opacity="0.6" stroke="${P.muted}" stroke-width="0.6" vector-effect="non-scaling-stroke"`);
  for (const [x, y] of res.info.supports) s += `<rect x="${f(x - 90)}" y="${f(-y - 90)}" width="180" height="180" fill="none" stroke="${P.muted}" stroke-dasharray="20 14" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
  // outer walls as hatched bands, openings as gaps
  const band = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], M, `fill="${P.stud}" stroke="${P.ink}" stroke-width="1.5" vector-effect="non-scaling-stroke"`);
  s += band(0, 0, L, 95) + band(0, W - 95, L, W) + band(0, 95, 95, W - 95) + band(L - 95, 95, L, W - 95);
  const gap = (x0, y0, x1, y1, o) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], M, `fill="${o.sill === 0 ? P.bg : P.clear}" stroke="${P.ink}" stroke-width="1" vector-effect="non-scaling-stroke"`);
  for (const o of state.openings.front) s += gap(o.U, 0, o.U + o.w, 95, o);
  for (const o of state.openings.back) s += gap(L - o.U - o.w, W - 95, L - o.U, W, o);
  for (const o of state.openings.left) s += gap(0, W - o.U - o.w, 95, W - o.U, o);
  for (const o of state.openings.right) s += gap(L - 95, o.U, L, o.U + o.w, o);
  state.partitions.forEach((p, i) => {
    const sel = opt.selected === p.id;
    const r = p.orient === 'x' ? [p.a, p.c - 47.5, p.b, p.c + 47.5] : [p.c - 47.5, p.a, p.c + 47.5, p.b];
    s += poly([[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], M, `fill="${sel ? P.accent : p.bearing ? P.header : P.plate}" stroke="${P.ink}" stroke-width="${sel ? 2.5 : 1.5}" vector-effect="non-scaling-stroke" ${opt.interactive ? `data-part="${p.id}" style="cursor:move"` : ''}`);
    for (const o of p.openings) {
      const g = p.orient === 'x' ? [p.a + o.U, p.c - 47.5, p.a + o.U + o.w, p.c + 47.5] : [p.c - 47.5, p.a + o.U, p.c + 47.5, p.a + o.U + o.w];
      s += poly([[g[0], g[1]], [g[2], g[1]], [g[2], g[3]], [g[0], g[3]]], M, `fill="${P.bg}" stroke="${P.ink}" stroke-width="1" vector-effect="non-scaling-stroke" pointer-events="none"`);
    }
    const cx = (r[0] + r[2]) / 2, cy = (r[1] + r[3]) / 2;
    s += `<text x="${f(cx + (p.orient === 'y' ? fs * 0.9 : 0))}" y="${f(-cy - (p.orient === 'x' ? fs * 0.7 : 0))}" font-size="${f(fs)}" text-anchor="middle" fill="${P.ink}" font-family="${P.fontLabel}" pointer-events="none">${esc(res.walls[p.id]?.name || `Ścianka ${i + 1}`)}</text>`;
  });
  // proposed bearing walls from the rafter check
  (res.suggestions || []).forEach((g, k) => {
    const r = [g.a, g.c - 47.5, g.b, g.c + 47.5];
    s += poly([[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], M, `fill="${P.warn}" fill-opacity="0.12" stroke="${P.warn}" stroke-width="2.5" stroke-dasharray="14 9" vector-effect="non-scaling-stroke" ${opt.interactive ? `data-suggest="${k}" style="cursor:copy"` : ''}`);
    s += `<text x="${f((g.a + g.b) / 2)}" y="${f(-g.c - fs * 0.9)}" font-size="${f(fs)}" text-anchor="middle" fill="${P.warn}" font-family="${P.fontLabel}" font-weight="700" pointer-events="none">proponowana ściana nośna, oś ${fmt(g.c)}${opt.interactive ? ' – kliknij, żeby dodać' : ''}</text>`;
  });
  if (opt.preview) {
    const p = opt.preview;
    const r = p.orient === 'x' ? [p.a, p.c - 47.5, p.b, p.c + 47.5] : [p.c - 47.5, p.a, p.c + 47.5, p.b];
    s += poly([[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], M, `fill="${P.accent}" fill-opacity="0.4" stroke="${P.accent}" stroke-width="2" vector-effect="non-scaling-stroke"`);
    s += `<text x="${f((r[0] + r[2]) / 2)}" y="${f(-(r[1] + r[3]) / 2 - fs)}" font-size="${f(fs)}" text-anchor="middle" fill="${P.accent}">${fmt(p.b - p.a)}</text>`;
  }
  const lbl = (x, y, t) => `<text x="${f(x)}" y="${f(y)}" font-size="${f(fs * 1.1)}" text-anchor="middle" fill="${P.muted}" font-weight="700" font-family="${P.fontLabel}" letter-spacing="${f(fs / 8)}">${t}</text>`;
  s += lbl(L / 2, fs * 4.6, 'PRZÓD') + lbl(L / 2, -W - fs * 3.6, 'TYŁ') + lbl(-fs * 6, -W / 2 - fs * 1.5, 'LEWA') + lbl(L + fs * 4, -W / 2, 'PRAWA');
  s += dimH(0, L, fs * 2.4, fmt(L), P, fs);
  s += dimV(-fs * 1.8, 0, -W, fmt(W), P, fs);
  s += banana(L + fs * 0.5 + 30, -W - fs * 1.5, P);
  s += '</svg>';
  return s;
}

// ---------- roof plan ----------

export function roofSVG(res, state, opt) {
  const P = opt.pal, { L, W } = state.dims;
  const o = state.roof.ovhEave, oG = state.roof.ovhGable;
  const fs = Math.max(55, Math.max(L, W) / 45);
  const pad = fs * 4.5;
  const vb = [-oG - pad - fs * 3, -W - o - pad, L + 2 * oG + 2 * pad + fs * 3 + 250, W + 2 * o + 2 * pad];
  const M = ([x, y]) => [x, -y];
  let s = svgOpen(vb[0], vb[1], vb[2], vb[3], P, opt.interactive ? 'data-view="roof"' : '');
  s += poly([[0, 0], [L, 0], [L, W], [0, W]], M, `fill="none" stroke="${P.muted}" stroke-dasharray="30 20" stroke-width="1.5" vector-effect="non-scaling-stroke"`);
  const yAt = (sl, sv) => sl.R0[0] + sl.dir[0] * sv;
  res.roof.slopes.forEach((sl, si) => {
    const g = res.roof.grid[si];
    for (const c of g.cells) {
      const y0 = yAt(sl, c.s0), y1 = yAt(sl, c.s1);
      s += poly([[c.x0, y0], [c.x1, y0], [c.x1, y1], [c.x0, y1]], M, `fill="${c.clear ? P.clear : P.cover}" fill-opacity="${c.clear ? 0.75 : 0.35}" stroke="${P.ink}" stroke-width="1" vector-effect="non-scaling-stroke" ${opt.interactive ? `data-cell="${c.key}" style="cursor:pointer"` : ''}`);
      if (opt.labels !== false) s += `<text x="${f((c.x0 + c.x1) / 2)}" y="${f(-(y0 + y1) / 2 + fs * 0.35)}" font-size="${f(fs * 0.85)}" text-anchor="middle" fill="${P.ink}" pointer-events="none">${c.wid}×${c.len}</text>`;
    }
    for (const sv of res.roof.battenRows[si]) {
      const y = yAt(sl, sv + 25);
      s += `<line x1="${f(res.roof.x0r)}" y1="${f(-y)}" x2="${f(res.roof.x1r)}" y2="${f(-y)}" stroke="${P.batten}" stroke-width="${f(fs / 5)}" opacity="0.8" pointer-events="none"/>`;
    }
  });
  for (const x of res.info.rafterX) s += `<rect x="${f(x)}" y="${f(-W - o)}" width="45" height="${f(W + 2 * o)}" fill="${P.rafter}" opacity="0.85" pointer-events="none"/>`;
  if (state.roof.type === 'gable') s += `<line x1="${f(res.roof.x0r)}" y1="${f(-W / 2)}" x2="${f(res.roof.x1r)}" y2="${f(-W / 2)}" stroke="${P.ink}" stroke-width="3" vector-effect="non-scaling-stroke"/>`;
  s += dimH(res.roof.x0r, res.roof.x1r, o + fs * 2.4, `${fmt(res.roof.Lr)}`, P, fs);
  s += dimV(-oG - fs * 1.2, o, -W - o, fmt(W + 2 * o), P, fs);
  s += banana(L + oG + fs * 0.5 + 30, -W - o + fs, P);
  s += '</svg>';
  return s;
}

export function wallTitle(res, id) { return res.walls[id]?.name || WALL_NAMES[id] || id; }
export { banana };
