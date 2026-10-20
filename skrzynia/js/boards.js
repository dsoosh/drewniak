// Board layout for boards the user owns: cross-cut each board into sections, rip a section into
// strips, cross-cut the strips into pieces. Ported from skrzynka/index.html (which is not a module);
// pure functions, no DOM.

const ORDERS = [
  (a, b) => b.l - a.l || b.w - a.w,
  (a, b) => b.w - a.w || b.l - a.l,
  (a, b) => b.l * b.w - a.l * a.w || b.l - a.l,
];

/**
 * Greedy layout of pieces {l, w} (l along the grain) on `count` boards of length L and width W.
 * Returns boards [{secs:[{x, len, usedW, strips:[{y, w, used, items:[{p, x}]}]}], end}] or null.
 */
export function pack(pieces, { L, W, count, kerf = 3, trim = 0 }, order = ORDERS[0]) {
  const k = kerf, UL = L - 2 * trim;
  const boards = Array.from({ length: count }, () => ({ secs: [], end: 0 }));
  for (const p of [...pieces].sort(order)) {
    if (p.w > W + 1e-6 || p.l > UL + 1e-6) return null;
    let best = null;
    // 1. into an existing strip, after the pieces already there
    for (const b of boards) for (const s of b.secs) for (const st of s.strips) {
      const need = (st.items.length ? k : 0) + p.l;
      if (p.w <= st.w + 1e-6 && st.used + need <= s.len + 1e-6) {
        const sc = (st.w - p.w) * 1e4 + (s.len - st.used - need);
        if (!best || sc < best.sc) best = { sc, st, need };
      }
    }
    if (best) { const st = best.st; st.items.push({ p, x: st.used + (st.items.length ? k : 0) }); st.used += best.need; continue; }
    // 2. a new strip ripped from an existing section
    for (const b of boards) for (const s of b.secs) {
      const need = (s.strips.length ? k : 0) + p.w;
      if (p.l <= s.len + 1e-6 && s.usedW + need <= W + 1e-6) {
        const sc = (s.len - p.l) + (W - s.usedW - need) * 0.5;
        if (!best || sc < best.sc) best = { sc, s, need };
      }
    }
    if (best) { const s = best.s; s.strips.push({ y: s.usedW + (s.strips.length ? k : 0), w: p.w, used: p.l, items: [{ p, x: 0 }] }); s.usedW += best.need; continue; }
    // 3. a new section cross-cut from a board
    let placed = false;
    for (const b of boards) {
      const need = (b.secs.length ? k : 0) + p.l;
      if (b.end + need <= UL + 1e-6) {
        b.secs.push({ x: b.end + (b.secs.length ? k : 0), len: p.l, usedW: p.w, strips: [{ y: 0, w: p.w, used: p.l, items: [{ p, x: 0 }] }] });
        b.end += need; placed = true; break;
      }
    }
    if (!placed) return null;
  }
  return boards;
}

// A rip is a cut along the grain: one between neighbouring strips of a section, one more when the
// strips do not fill the board width, and one for each piece narrower than its strip.
export function countRips(boards, W) {
  let n = 0;
  for (const b of boards) for (const s of b.secs) {
    n += s.strips.length - 1 + (s.usedW < W - 2 ? 1 : 0); // a sliver under 2 mm is sawdust
    for (const st of s.strips) for (const it of st.items) if (it.p.w < st.w - 0.5) n++;
  }
  return n;
}

/** Best of several orders: fewest boards used, then fewest rips, then least length used. */
export function packBest(pieces, stock) {
  let best = null;
  for (const o of ORDERS) {
    const r = pack(pieces, stock, o);
    if (!r) continue;
    const used = r.reduce((s, b) => s + b.end, 0), nb = r.filter((b) => b.secs.length).length, rips = countRips(r, stock.W);
    const sc = nb * 1e9 + rips * 1e6 + used;
    if (!best || sc < best.sc) best = { sc, boards: r, rips, used: nb };
  }
  return best;
}
