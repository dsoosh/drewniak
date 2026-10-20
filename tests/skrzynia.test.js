// Checks of the tool chest generator against the spec scenarios.
// Run: node tests/skrzynia.test.js   (VERBOSE=1 prints the default cut list)
import assert from 'assert';
import { pack, packBest, countRips } from '../skrzynia/js/boards.js';
import {
  build, design, parts, defaultState, fingerLayout, nearestValid, skirtHeight, wallStrips, bottomBoards,
  onGrid, seamOk, validate, trayHole, LIMITS,
} from '../skrzynia/js/build.js';

let failed = 0;
const test = (name, fn) => { try { fn(); console.log('ok  ', name); } catch (e) { failed++; console.log('FAIL', name, '\n     ', e.message); } };
const st = (fn) => { const s = defaultState(); if (fn) fn(s); return s; };
const near = (a, b, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const finiteDeep = (o) => JSON.stringify(o, (k, v) => { if (typeof v === 'number' && !Number.isFinite(v)) throw new Error(`${k} = ${v}`); return v; });
const D800 = (fn) => { const s = st(fn); return { s, d: design(s, 800, 440, 400) }; };

// ---- board layout

test('layout keeps kerf and end trim', () => {
  const two = [{ l: 1000, w: 100 }, { l: 1000, w: 100 }];
  assert.ok(pack(two.map((p) => ({ ...p, w: 200 })), { L: 2010, W: 200, count: 1, kerf: 10 }));
  assert.equal(pack(two.map((p) => ({ ...p, w: 200 })), { L: 2010, W: 200, count: 1, kerf: 11 }), null);
  assert.ok(pack(two.map((p) => ({ ...p, w: 200 })), { L: 2030, W: 200, count: 1, kerf: 10, trim: 10 }));
  assert.equal(pack(two.map((p) => ({ ...p, w: 200 })), { L: 2029, W: 200, count: 1, kerf: 10, trim: 10 }), null);
});

test('rip count: between strips and for the leftover', () => {
  const full = packBest([{ l: 500, w: 98.5 }, { l: 500, w: 98.5 }], { L: 1000, W: 200, count: 1, kerf: 3 });
  assert.equal(full.rips, 1);
  const r = pack([{ l: 500, w: 100 }, { l: 500, w: 90 }], { L: 600, W: 200, count: 1, kerf: 3 });
  assert.equal(countRips(r, 200), 2);
  assert.equal(packBest([{ l: 500, w: 200 }], { L: 600, W: 200, count: 1 }).rips, 0);
});

// ---- finger rule and grid

test('finger rule: carcass, skirt, apron, trays', () => {
  const f = fingerLayout(400, 20);
  assert.equal(f.n, 15); near(f.w, 26.67, 0.01);
  const sk = skirtHeight(400, f.w, 20);
  near(sk.h, 84, 0.01); assert.equal(fingerLayout(sk.h, 20).n, 3); near(sk.h / 3, 28, 0.01);
  const { d } = D800();
  near(d.apron.h, 73.33, 0.01); near(d.apron.fw, 24.44, 0.01);
  const t = fingerLayout(110, 12);
  assert.equal(t.n, 7); near(t.w, 15.71, 0.01);
});

test('every T 12–32 and H 250–700 has a layout and a skirt', () => {
  for (let T = 12; T <= 32; T++) for (let H = 250; H <= 700; H += 10) {
    const f = fingerLayout(H, T);
    assert.ok(f.ok, `H ${H} T ${T}`);
    assert.ok(skirtHeight(H, f.w, T), `skirt H ${H} T ${T}`);
  }
});

test('tray of 75 mm from 16 mm boards is rejected with 70 and 80', () => {
  assert.deepEqual(nearestValid(75, 16, 60, 150), [70, 80]);
  const errs = validate(st((s) => { s.trayH = 75; s.trayBoards.T = 16; }));
  assert.ok(errs.some((e) => e.includes('70 albo 80')), errs.join(' | '));
});

test('thick boards still give a chest', () => {
  for (const T of [28, 32]) {
    const r = build(st((s) => { s.boards.T = T; s.boards.N = 12; s.boards.L = 3000; s.boards.W = 250; }));
    assert.ok(r.ok, `T ${T}: ${JSON.stringify(r.tips || r.errors)}`);
    assert.ok(fingerLayout(r.d.skirt.h, T).ok);
    assert.ok(r.d.apron.fw >= T - 1e-9 && r.d.apron.fw <= 1.5 * T + 1e-9);
  }
});

test('default grid: skirt top, apron edge, seam, handle', () => {
  const { d } = D800();
  near(d.skirt.top, 80, 0.01); near(d.apron.edge, 346.67, 0.01);
  for (const z of [d.skirt.top, d.apron.edge, d.handle.top, d.handle.bot]) assert.ok(onGrid(z, d.w), `${z}`);
  assert.deepEqual(d.wall.seams.map(Math.round), [44, 240]);
  near(d.handle.bot, 253.33, 0.01); near(d.handle.top, 306.67, 0.01);
  assert.equal(d.handle.len, 220); assert.equal(d.handle.layers, 2);
});

test('glue seams: wall of 330 from 200 boards; seams always valid', () => {
  const ws = wallStrips(330, 200, 30, 60);
  assert.deepEqual(ws.strips.map((x) => [x.cut, x.final]), [[134, 132], [200, 198]]);
  for (let H = 250; H <= 700; H += 10) {
    const w = fingerLayout(H, 20).w, sk = skirtHeight(H, w, 20), r = wallStrips(H, 200, w, sk.top);
    if (!r) continue;
    assert.ok(r.seams.every((z) => seamOk(z, w, sk.top)), `H ${H}`);
    assert.equal(r.strips[r.strips.length - 1].role === 'top' || r.strips.length === 1, true);
    assert.ok(r.shift <= w / 2 + 1e-9);
  }
});

test('edge gluing off: walls of whole boards, 7 fingers each, lid shiplapped', () => {
  const s = st((x) => { x.edgeGlue = false; });
  const d = design(s, 800, 440, 400);
  assert.equal(d.wall.strips.length, 2); assert.equal(d.n, 7); near(d.w, 28.57, 0.01);
  assert.ok(parts(s, d).some((p) => p.key.startsWith('lid') && p.note.includes('zakładkę')));
  const r = build(s);
  assert.ok(r.ok); assert.equal(r.d.H % 200, 0);
  const errs = validate(st((x) => { x.edgeGlue = false; x.lock.H = 450; }));
  assert.ok(errs.some((e) => e.includes('400')), errs.join());
});

// ---- carcass, bottom, skirt, lid

test('corner pieces 1 mm over the outer size, no corner nails, 14 corners', () => {
  const { s, d } = D800();
  const ps = parts(s, d);
  assert.ok(ps.filter((p) => p.key.startsWith('front')).every((p) => p.l === 801));
  assert.ok(ps.filter((p) => p.key.startsWith('endL')).every((p) => p.l === 441));
  const r = build(s);
  assert.equal(r.fingers.corners, 14);
  assert.ok(!r.fasteners.some((f) => /narożnik/i.test(f.joint)));
});

test('bottom: three 200 boards and 148, gaps 2, nails in the middle third', () => {
  const b = bottomBoards(760, 200);
  assert.deepEqual(b.widths, [200, 200, 200, 148]); assert.equal(b.gap, 2);
  const { s, d } = D800();
  assert.ok(parts(s, d).filter((p) => p.key.startsWith('bottom')).every((p) => p.l === 398));
  const f = build(s).fasteners.find((x) => x.joint.startsWith('Dno'));
  assert.ok(f.note.includes('środkowej'));
});

test('fasteners never come through', () => {
  const r = build(st());
  const skirt = r.fasteners.find((f) => f.joint.startsWith('Cokół'));
  assert.ok(skirt.len <= 37, `${skirt.len}`);
  assert.ok(skirt.note.includes(`${Math.floor(r.d.skirt.h / 2 - 4)}`), skirt.note);
  for (const f of r.fasteners) assert.ok(f.len > 0, f.joint);
});

test('lid: overhang, battens, side aprons not glued', () => {
  const { s, d } = D800();
  assert.equal(d.lid.ovE, 23); assert.equal(Math.round(d.lid.ovF), 28);
  assert.equal(d.batten.cut, 385); assert.ok(d.batten.clear >= 7.5);
  const r = build(s);
  const lidStep = r.plan.find(([t]) => t === 'Wieko')[1];
  assert.ok(lidStep.includes('boki bez kleju') && lidStep.includes('otworach podłużnych'));
  assert.ok(r.notes.some((n) => /za skrzynią potrzeba około \d+0 mm/.test(n)));
});

test('long lid gets three hinges', () => {
  const s = st();
  const d = design(s, 900, 440, 400);
  const r = build(st((x) => { x.lock.L = 900; x.lock.D = 440; x.lock.H = 400; }));
  assert.ok(d.lid.len > 800);
  assert.equal(r.hardware[0].qty, 3);
  assert.ok(r.hardware.some((h) => h.item.startsWith('Łańcuszek')));
});

// ---- trays

test('one tray: depth and runners', () => {
  const { d } = D800();
  assert.equal(d.trays[0].depth, 396); assert.ok(d.trays[0].proj >= 18);
});

test('two trays are stepped and guided', () => {
  const s = st((x) => { x.trays = 2; x.lock.H = 480; x.lock.L = 800; x.lock.D = 440; });
  const d = design(s, 800, 440, 480);
  const [up, lo] = d.trays;
  assert.equal(lo.depth, 400 - 2 * up.proj - 4);
  assert.ok(lo.proj >= up.proj + 12 + 4);
  assert.ok(lo.top <= up.runnerTop - 5);
  const ps = parts(s, d);
  assert.ok(ps.some((p) => p.key === 'guide'));
  // lower tray between the guides: 2 mm play each side
  near((400 - 2 * d.p1 - lo.depth) / 2, 2, 1e-9);
});

test('tray hand hole on the grid, cut-out on a low tray', () => {
  const { s, d } = D800();
  const h = trayHole(s, d);
  assert.equal(h.kind, 'hole'); near(h.h, 31.43, 0.01); near(h.top, 31.43, 0.01); assert.equal(h.len, 100);
  const s2 = st((x) => { x.trayH = 70; });
  assert.equal(trayHole(s2, design(s2, 800, 440, 400)).kind, 'cutout');
});

test('tray bottom clearance and pins', () => {
  const { s, d } = D800();
  parts(s, d);
  near(d.trays[0].bottom.clearance, 6.6, 0.05);
  assert.ok(build(s).hardware.some((h) => h.item.startsWith('Gwoździk') && h.qty === 2));
});

test('trays from the chest boards are heavier', () => {
  const r = build(st((x) => { x.trayBoards = null; }));
  assert.ok(r.ok);
  assert.ok(r.parts.filter((p) => p.key.startsWith('tLong')).every((p) => p.t === 20 && p.stock === 'chest'));
  assert.ok(r.notes.some((n) => n.includes('cięższe')));
});

// ---- handles

test('wooden handles on thin boards have 3 layers', () => {
  const s = st((x) => { x.boards.T = 12; });
  assert.equal(design(s, 800, 440, 400).handle.layers, 3);
});

test('bought handles: bolts, cap nuts, backing blocks, inner length between blocks', () => {
  const r = build(st((x) => { x.handles = 'bought'; }));
  assert.ok(r.ok);
  for (const k of ['Śruba M6', 'Podkładka', 'Nakrętka kołpakowa']) assert.ok(r.hardware.some((h) => h.item.startsWith(k)), k);
  assert.ok(r.parts.some((p) => p.key === 'backing' && p.qty === 2));
  assert.ok(r.d.effL === r.d.inL - 2 * (20 + 10) && r.d.effL >= 600);
});

// ---- checks

test('lid check: shiplapped fails with a hint, glued passes', () => {
  const r = build(st((x) => { x.edgeGlue = false; x.lock.L = 800; x.lock.D = 440; x.lock.H = 400; }));
  const c = r.checks.find((x) => x.id === 'lid');
  near(c.value, 9.15, 0.05); assert.equal(c.ok, false); assert.ok(c.hint.includes('klejenie krawędzi'));
  const g = build(st((x) => { x.lock.L = 800; x.lock.D = 440; x.lock.H = 400; }));
  const gl = g.checks.find((x) => x.id === 'lid'), gs = g.checks.find((x) => x.id === 'lidStress');
  assert.ok(gl.ok && gl.value < 3.9 && gs.value < 14);
});

test('bottom check on the narrowest board', () => {
  const r = build(st((x) => { x.lock.L = 800; x.lock.D = 440; x.lock.H = 400; }));
  const c = r.checks.find((x) => x.id === 'bottom');
  near(c.value, 1.19, 0.02); near(c.limit, 1.85, 0.001); assert.ok(c.ok);
  assert.ok(r.checks.find((x) => x.id === 'cleats').value >= 4);
});

// ---- search

test('default chest: valid, no warnings, under a second, proportions on the outline', () => {
  const t0 = performance.now();
  const r = build(st());
  const ms = performance.now() - t0;
  assert.ok(r.ok, JSON.stringify(r.tips));
  assert.ok(ms < 1000, `${Math.round(ms)} ms`);
  assert.deepEqual(r.warnings, []);
  assert.ok(r.checks.every((c) => c.ok));
  finiteDeep(r);
  const t = r.d.total;
  assert.ok(Math.abs(t.D / t.L - 0.55) <= 0.05 && Math.abs(t.H / t.L - 0.6) <= 0.05, `${t.L} ${t.D} ${t.H}`);
  assert.ok(r.difficulty.level >= 4);
  for (const k of ['spustnik', 'Ściski', 'nawiercania']) assert.ok(r.tools.some((x) => x.includes(k)), k);
  assert.ok(r.hardware.filter((h) => !/Klej|olej|Szelak|Farba/i.test(h.item)).every((h) => /czernion|Gwoździk/.test(h.item)));
  if (process.env.VERBOSE) console.log(r.d, r.parts.map((p) => `${p.qty}× ${p.name} ${p.l}×${p.w}×${p.t}`).join('\n'));
});

test('locks and bounds', () => {
  const r = build(st((x) => { x.lock.H = 400; }));
  assert.ok(r.ok); assert.equal(r.d.H, 400); assert.equal(r.d.total.H, 424);
  const m = build(st((x) => { x.minInner = 700; x.boards.N = 10; }));
  assert.ok(m.ok); assert.ok(m.d.inL >= 700);
  assert.ok(m.d.Do <= 0.75 * m.d.Lo);
});

test('chest under a bench', () => {
  const r = build(st((x) => { x.clear = 750; x.lock.H = 420; x.lock.D = 440; }));
  assert.ok(r.ok); assert.ok(r.d.total.H <= 750);
  assert.ok(r.notes.some((n) => n.includes('wysunąć')));
});

test('boards too small: tips', () => {
  const r = build(st((x) => { x.boards.N = 1; }));
  assert.equal(r.ok, false);
  assert.ok(r.tips.some((t) => t.startsWith('Więcej desek')), r.tips.join(' | '));
  assert.ok(r.tips.some((t) => t.includes('tac')));
});

test('geometry is finite and has the banana-free box list', () => {
  const r = build(st((x) => { x.trays = 2; x.lock.H = 480; }));
  assert.ok(r.ok);
  for (const b of r.geometry.boxes.filter((x) => x.kind !== 'hole')) for (const k of ['x0', 'x1', 'y0', 'y1', 'z0', 'z1']) assert.ok(Number.isFinite(b[k]), k);
  assert.ok(r.geometry.boxes.some((b) => b.lid));
  assert.equal(r.geometry.hinges.length, r.hardware[0].qty);
});

test('limits are sane', () => { assert.deepEqual(LIMITS.H, [250, 700]); });

// ---- fixes after the masters' review of the implementation

test('stacked boards are tied by vertical cleats, one screw per board', () => {
  const s = st((x) => { x.edgeGlue = false; });
  const d = design(s, 930, 450, 600);
  assert.equal(d.wall.strips.length, 3);
  assert.ok(parts(s, d).some((p) => p.key === 'vcleat' && p.qty === 2));
  const r = build(st((x) => { x.edgeGlue = false; x.lock.H = 600; }));
  const f = r.fasteners.find((x) => x.joint.startsWith('Listwa pionowa'));
  assert.equal(f.qty, 2 * 3);
});

test('lid panel sits inside the apron, tops flush', () => {
  const s = st(), d = design(s, 850, 460, 530);
  near(d.lidPanel.len, 856, 0.01); near(d.lidPanel.depth, 467.9, 0.05);
  assert.ok(parts(s, d).filter((p) => p.key.startsWith('lid')).every((p) => p.l === 856));
  const r = build(st((x) => { x.lock.L = 850; x.lock.D = 460; x.lock.H = 530; }));
  const lid = r.geometry.boxes.find((b) => b.kind === 'lid'), apron = r.geometry.boxes.find((b) => b.kind === 'apron' && b.face === 'front');
  near(lid.z1, apron.z1, 1e-9); assert.ok(lid.y0 >= apron.y1 - 1e-9);
});

test('skirt follows the carcass finger rhythm', () => {
  const s = st(), d = design(s, 850, 460, 530);
  near(d.skirt.h, 87.7, 0.05); assert.equal(d.skirt.n, 3); near(d.skirt.h / 3, 29.2, 0.05);
});

test('seams near a finger line are rejected', () => {
  const w = 30;
  assert.equal(seamOk(10 * w + 0.27 * w, w, 60), false);
  assert.equal(seamOk(10 * w + 0.5 * w, w, 60), true);
  assert.equal(seamOk(10 * w + 0.3, w, 60), true);
});

test('handle height 45–70 and an undercut that fits', () => {
  for (const T of [12, 16, 20, 24, 28, 32]) {
    const s = st((x) => { x.boards.T = T; });
    const d = design(s, 800, 440, 450);
    if (!d) continue;
    assert.ok(d.handle.h >= 45 - 1e-9 && d.handle.h <= 70 + 1e-9, `T ${T}: ${d.handle.h}`);
    assert.ok(d.handle.undercut <= d.handle.proj - 10 + 1e-9, `T ${T}`);
    assert.ok(onGrid(d.handle.top, d.w) && onGrid(d.handle.bot, d.w));
  }
});

test('bought handles: trays start beyond the cap nuts, blocks drawn', () => {
  const r = build(st((x) => { x.handles = 'bought'; }));
  assert.ok(r.d.trayX >= 2 * 20 + 10);
  assert.ok(r.geometry.boxes.some((b) => b.kind === 'cleat' && b.side));
  assert.ok(r.hardware.find((h) => h.item.startsWith('Śruba')).size === 'M6×65');
});

test('thin boards: every fastener has a length and stays inside', () => {
  const r = build(st((x) => { x.boards.T = 12; x.boards.N = 12; }));
  assert.ok(r.ok);
  for (const f of r.fasteners) assert.ok(f.len > 0, f.joint);
  const hinge = r.hardware.find((h) => h.item.startsWith('Wkręt do zawiasów'));
  assert.ok(/×(8|9)$/.test(hinge.size), hinge.size);
  assert.ok(r.fasteners.find((f) => f.joint.startsWith('Listwa nośna')).note.includes('w ścianę 9 mm'));
  assert.ok(r.fasteners.find((f) => f.joint.startsWith('Fartuch boczny')).size === '3,5×50');
});

test('assembly play and the skirt frame', () => {
  const { s, d } = D800();
  const ps = parts(s, d);
  assert.equal(ps.find((p) => p.key === 'cleat').l, 758);
  assert.equal(ps.find((p) => p.key === 'runner1').l, 758);
  assert.equal(ps.find((p) => p.key === 'skirtF').l, 841.5);
});

test('bottom remainder split keeps 3 mm at the ends', () => {
  const b = bottomBoards(630, 200);
  near(b.widths.reduce((a, x) => a + x, 0) + (b.widths.length - 1) * b.gap, 624, 1e-6);
});

test('length over the handles is given', () => {
  const d = design(st(), 850, 460, 530);
  assert.equal(d.total.Lh - d.total.L, 2 * (d.handle.proj - d.lid.ovE));
});

test('the page says when tray boards limit the chest', () => {
  const r = build(st((x) => { x.boards.N = 12; x.boards.L = 4000; x.trayBoards.N = 1; }));
  assert.ok(r.ok);
  assert.equal(r.limitedBy, 'tray');
  assert.ok(r.notes.some((n) => n.includes('deski na tace')));
});

test('bottom stress is checked; a fallback chest exceeds the least and says it can break', () => {
  const r = build(st((x) => { x.boards.T = 12; }));
  assert.ok(r.checks.some((c) => c.id === 'bottomStress'));
  if (r.ok && r.fallback) assert.ok(r.warnings.some((w) => w.includes('najmniej')));
  if (r.ok) for (const c of r.checks.filter((x) => !x.ok && x.unit === 'MPa')) assert.ok(c.hint.includes('pęknąć'));
});

test('trays overlap nothing: stacked walls, bought handles, two trays', () => {
  const overlap = (a, b) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6 && a.z0 < b.z1 - 1e-6 && b.z0 < a.z1 - 1e-6;
  for (const fn of [(x) => { x.edgeGlue = false; }, (x) => { x.edgeGlue = false; x.trays = 2; x.lock.H = 600; }, (x) => { x.handles = 'bought'; }, (x) => { x.trays = 2; x.lock.H = 480; }]) {
    const r = build(st(fn));
    assert.ok(r.ok);
    const B = r.geometry.boxes.filter((b) => b.kind !== 'hole' && !b.lid);
    const trays = B.filter((b) => b.tray !== undefined), rest = B.filter((b) => b.tray === undefined);
    for (const t of trays) for (const o of rest) assert.ok(!overlap(t, o), `${t.kind} × ${o.kind}`);
    if (!r.d.stacked) continue;
    near(r.d.trays[0].len, Math.floor((r.d.inL - 40) / 2), 1e-9);
  }
});

test('planing is not a rip', () => {
  const ps = parts(st(), design(st(), 850, 460, 530));
  assert.ok(ps.filter((p) => p.w >= 197).every((p) => !p.rip));
});


if (failed) { console.log(`\n${failed} failed`); process.exit(1); }
console.log('\nall passed');
