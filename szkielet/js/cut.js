// Cutting optimisers: 1D for timber (stock lengths), 2D for sheets (OSB). Pure functions.

// Packs pieces [{len,label}] into bars of length `stock`. Tries first-fit decreasing and a few
// hundred randomised best-fit runs; keeps the fewest bars, then the most concentrated offcut.
export function packBars(pieces, stock, kerf = 3, tries = 300) {
  const tooLong = pieces.filter((p) => p.len > stock);
  const list = pieces.filter((p) => p.len <= stock);
  const run = (order, best) => {
    const bars = [];
    for (const p of order) {
      let pick = -1, room = Infinity;
      for (let i = 0; i < bars.length; i++) {
        const free = stock - bars[i].used - (bars[i].pieces.length ? kerf : 0);
        if (free >= p.len && (!best || free - p.len < room)) { pick = i; room = free - p.len; if (!best) break; }
      }
      if (pick < 0) { bars.push({ pieces: [], used: 0 }); pick = bars.length - 1; }
      const b = bars[pick];
      b.used += (b.pieces.length ? kerf : 0) + p.len;
      b.pieces.push(p);
    }
    return bars;
  };
  const score = (bars) => bars.length * 1e12 - bars.reduce((t, b) => t + (stock - b.used) ** 2, 0);
  const sorted = [...list].sort((a, b) => b.len - a.len);
  let best = run(sorted, false), bestS = score(best);
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let t = 0; t < tries && list.length > 1; t++) {
    const order = sorted.map((p) => ({ p, k: p.len * (1 + (rnd() - 0.5) * 0.6) })).sort((a, b) => b.k - a.k).map((o) => o.p);
    const bars = run(order, true), sc = score(bars);
    if (sc < bestS) { best = bars; bestS = sc; }
  }
  for (const b of best) {
    b.pieces.sort((p, q) => q.len - p.len);
    let x = 0;
    for (const p of b.pieces) { p.x = x; x += p.len + kerf; }
    b.waste = stock - b.used;
  }
  best.sort((a, b) => a.waste - b.waste);
  return { bars: best, tooLong };
}

// MaxRects packing (best short side fit, rotation allowed) of pieces [{w,h,label}] into sheets W×H.
export function packSheets(pieces, W, H, kerf = 3) {
  const sheets = [];
  const order = [...pieces].sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h) || b.w * b.h - a.w * a.h);
  const tooBig = [];
  for (const p of order) {
    const fits = (w, h) => w <= W + 0.5 && h <= H + 0.5;
    if (!fits(p.w, p.h) && !fits(p.h, p.w)) { tooBig.push(p); continue; }
    let placed = false;
    for (const sh of sheets) if (place(sh, p)) { placed = true; break; }
    if (!placed) {
      const sh = { free: [{ x: 0, y: 0, w: W, h: H }], items: [] };
      sheets.push(sh);
      place(sh, p);
    }
  }
  function place(sh, p) {
    let best = null;
    for (const f of sh.free) for (const [w, h, rot] of [[p.w, p.h, false], [p.h, p.w, true]]) {
      if (w <= f.w + 0.5 && h <= f.h + 0.5) {
        const ss = Math.min(f.w - w, f.h - h);
        if (!best || ss < best.ss) best = { f, w, h, rot, ss };
      }
    }
    if (!best) return false;
    const r = { x: best.f.x, y: best.f.y, w: best.w, h: best.h };
    sh.items.push({ ...p, ...r, rot: best.rot });
    const cut = { x: r.x, y: r.y, w: r.w + kerf, h: r.h + kerf };
    const next = [];
    for (const f of sh.free) {
      if (cut.x >= f.x + f.w || cut.x + cut.w <= f.x || cut.y >= f.y + f.h || cut.y + cut.h <= f.y) { next.push(f); continue; }
      if (cut.x > f.x) next.push({ x: f.x, y: f.y, w: cut.x - f.x, h: f.h });
      if (cut.x + cut.w < f.x + f.w) next.push({ x: cut.x + cut.w, y: f.y, w: f.x + f.w - cut.x - cut.w, h: f.h });
      if (cut.y > f.y) next.push({ x: f.x, y: f.y, w: f.w, h: cut.y - f.y });
      if (cut.y + cut.h < f.y + f.h) next.push({ x: f.x, y: cut.y + cut.h, w: f.w, h: f.y + f.h - cut.y - cut.h });
    }
    sh.free = next.filter((a, i) => a.w > 1 && a.h > 1 && !next.some((b, j) => j !== i && b.x <= a.x && b.y <= a.y && b.x + b.w >= a.x + a.w && b.y + b.h >= a.y + a.h && (j < i || b.w * b.h > a.w * a.h)));
    return true;
  }
  return { sheets, tooBig };
}

// Groups identical cuts for the cut list.
export function groupCuts(members) {
  const map = new Map();
  for (const m of members) {
    const key = `${m.sec}|${m.len}|${m.name}|${m.note || ''}`;
    if (!map.has(key)) map.set(key, { sec: m.sec, len: m.len, name: m.name, note: m.note || '', count: 0, groups: new Set() });
    const g = map.get(key); g.count++; g.groups.add(m.group);
  }
  return [...map.values()].sort((a, b) => a.sec.localeCompare(b.sec) || b.len - a.len);
}
