// Checks of the practice box generator against the spec scenarios.
// Run: node tests/pudelko.test.js
import assert from 'assert';
import { build, design, parts, defaultState, grooveWidth, panelFit, panelStrips, fingerLayout } from '../pudelko/js/build.js';

let failed = 0;
const test = (name, fn) => { try { fn(); console.log('ok  ', name); } catch (e) { failed++; console.log('FAIL', name, '\n     ', e.message); } };
const st = (fn) => { const s = defaultState(); s.lock = { L: 240, D: 150, H: 90 }; if (fn) fn(s); return s; };
const near = (a, b, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const finite = (o) => JSON.stringify(o, (k, v) => { if (typeof v === 'number' && !Number.isFinite(v)) throw new Error(`${k} = ${v}`); return v; });
const LIDS = ['lift', 'slide', 'hinged', 'flat'];

test('practice box: 5 fingers of 18 mm, walls at outer size + 1', () => {
  const r = build(st());
  assert.ok(r.ok);
  assert.equal(r.d.n, 5); near(r.d.w, 18);
  assert.equal(r.parts.find((p) => p.key === 'front').l, 241);
  assert.equal(r.parts.find((p) => p.key === 'endL').l, 151);
});

test('all locked: exactly that box, every lid, no warnings, finite', () => {
  for (const lid of LIDS) {
    const r = build(st((s) => { s.lid = lid; }));
    assert.ok(r.ok, lid);
    assert.deepEqual([r.d.Lo, r.d.Do, r.d.H], [240, 150, 90]);
    assert.deepEqual(r.warnings, [], `${lid}: ${r.warnings}`);
    finite(r);
    assert.ok(r.geometry.boxes.length > 20);
  }
});

test('nothing locked: proportions on the outline within 0.05, under a second', () => {
  for (const lid of LIDS) {
    const s = defaultState(); s.lid = lid;
    const t0 = performance.now(); const r = build(s); const ms = performance.now() - t0;
    assert.ok(r.ok, lid); assert.ok(ms < 1000, `${lid} ${Math.round(ms)} ms`);
    const t = r.d.total;
    assert.ok(Math.abs(t.D / t.L - 0.6) <= 0.05 && Math.abs(t.H / t.L - 0.4) <= 0.05, `${lid} ${t.L} ${t.D} ${t.H}`);
  }
});

test('boards too small: results hidden with how much more board', () => {
  const r = build(st((s) => { s.boards.N = 1; s.boards.L = 400; }));
  assert.equal(r.ok, false);
  assert.ok(r.tips.some((t) => t.startsWith('Za mało deski')), r.tips.join(' | '));
});

test('walls are one piece: a narrow board is rejected with the width needed', () => {
  const r = build(st((s) => { s.boards.W = 80; }));
  assert.equal(r.ok, false);
  assert.ok(r.tips.some((t) => t.includes('co najmniej 90 mm')), r.tips.join(' | '));
});

test('grooves: width from plough irons, depth from the play', () => {
  assert.equal(grooveWidth(14), 6); assert.equal(grooveWidth(12), 6); assert.equal(grooveWidth(20), 10); assert.equal(grooveWidth(8), 4);
  const f = panelFit(126, 12, 'soft');
  near(f.d, 6); assert.ok(f.d - f.c >= 3);
  assert.equal(panelFit(330 - 2 * 4, 8, 'soft'), null);
  const hard = panelFit(126, 12, 'hard');
  assert.ok(hard.c > f.c);
});

test('thin board, wide box: rejected with the reason', () => {
  const r = build(st((s) => { s.boards.T = 8; s.lock = { L: 400, D: 340, H: 60 }; s.boards.W = 200; s.boards.N = 6; s.boards.L = 3000; }));
  assert.equal(r.ok, false);
  assert.ok(r.tips.some((t) => t.includes('za cienka')), r.tips.join(' | '));
});

test('bottom: groove 6–12 mm, panel underside 6 mm above the table', () => {
  const d = design(st(), 240, 150, 90);
  near(d.bottom.z0, 6); near(d.bottom.z1, 12);
  const r = build(st());
  const b = r.geometry.boxes.filter((x) => x.kind === 'bottom');
  near(Math.min(...b.map((x) => x.z0)), 6);
});

test('panels from one board or symmetric strips', () => {
  assert.equal(panelStrips(100, 120, 115).length, 1);
  const two = panelStrips(162, 120, 115);
  assert.equal(two.length, 2); assert.equal(two[0].final, two[1].final);
  const three = panelStrips(300, 120, 115);
  assert.equal(three.length, 3); assert.equal(three[0].final, three[2].final); assert.ok(three[0].final >= 40);
});

test('lift-off lid: rim 3w, ends hold its outer fingers, lip strips, n ≥ 5', () => {
  const r = build(st());
  near(r.d.rim.h, 54);
  const rimFingers = r.geometry.boxes.filter((b) => b.lid && /finger/.test(b.kind)).sort((a, b) => a.z0 - b.z0);
  assert.equal(rimFingers[0].kind, 'fingerB'); assert.equal(rimFingers[rimFingers.length - 1].kind, 'fingerB');
  const lipL = r.parts.find((p) => p.key === 'lipL'), lipS = r.parts.find((p) => p.key === 'lipS');
  assert.equal(lipL.l, 216); assert.equal(lipS.l, 114); assert.equal(lipL.t, 6); assert.equal(lipL.w, 24);
  near(r.d.rim.panel.recess, 6);
  const low = build(st((s) => { s.lock.H = 50; }));
  assert.equal(low.ok, false);
  assert.ok(low.tips.some((t) => t.includes('Najbliższa wysokość z 5 wczepami')), low.tips.join(' | '));
});

test('sliding lid: low end 78, high end 90, recess 24 × 10 × 4', () => {
  const r = build(st((s) => { s.lid = 'slide'; }));
  assert.equal(r.parts.find((p) => p.key === 'endL').w, 78);
  assert.equal(r.parts.find((p) => p.key === 'endR').w, 90);
  const rc = r.d.slide.recess;
  assert.deepEqual([rc.w, rc.len, rc.depth, rc.from], [24, 10, 4, 12]);
  assert.ok(!r.parts.some((p) => /klocek/i.test(p.name)));
  assert.ok(r.plan.some(([t, x]) => /przelotowe przy niskim boku, zatrzymane przy wysokim/.test(x)));
});

test('hinged lid: marked 92, cut mid band, 45 / 45, hinges 30 mm 30 from the ends', () => {
  const r = build(st((s) => { s.lid = 'hinged'; }));
  const h = r.d.hinged;
  assert.equal(r.d.markH, 92); assert.equal(h.band, 2); near(h.lidH, 45); near(h.bodyH, 45);
  assert.equal(h.hinge.len, 30); assert.equal(h.hinge.from, 30); assert.equal(h.hinge.leaf, 10); assert.equal(h.hinge.screw[0], 3);
  near(h.grip.depth, 4); near(h.grip.len, 80);
  assert.ok(r.hardware.some((x) => x.item.includes('ogranicznikiem 95°')));
  const plan = r.plan.find(([t]) => t === 'Odcinanie wieka')[1];
  for (const k of ['zamknięte pudełko', 'dookoła', 'kliny', 'od narożnika do środka', 'Wpuść zawiasy']) assert.ok(plan.includes(k), k);
  const low = build(st((s) => { s.lid = 'hinged'; s.lock.H = 50; }));
  assert.equal(low.ok, false);
});

test('flat lid: 252 × 162, battens 12 × 18 × 124 one mm inside the ends', () => {
  const r = build(st((s) => { s.lid = 'flat'; }));
  assert.equal(r.d.flat.len, 252); assert.equal(r.d.flat.width, 162);
  const b = r.parts.find((p) => p.key === 'batten');
  assert.deepEqual([b.t, b.w, b.l, b.qty], [12, 18, 124, 2]);
  const bx = r.geometry.boxes.filter((x) => x.kind === 'batten');
  near(Math.min(...bx.map((x) => x.x0)), 13); near(Math.max(...bx.map((x) => x.x1)), 227);
});

test('switching the lid changes the cut list', () => {
  const lift = build(st()), slide = build(st((s) => { s.lid = 'slide'; }));
  assert.ok(lift.parts.some((p) => p.key.startsWith('lip')) && !slide.parts.some((p) => p.key.startsWith('lip')));
  assert.ok(slide.parts.some((p) => p.key.startsWith('slideLid')) && !lift.parts.some((p) => p.key.startsWith('slideLid')));
});

test('checks: thin long bottom fails, heavy box warns', () => {
  const r = build(st((s) => { s.boards = { L: 3000, W: 200, T: 8, N: 6 }; s.lock = { L: 500, D: 200, H: 60 }; s.lid = 'flat'; }));
  assert.ok(r.ok, JSON.stringify(r.tips));
  const c = r.checks.find((x) => x.id === 'bottom');
  assert.equal(c.ok, false);
  const h = build(st((s) => { s.boards = { L: 3000, W: 200, T: 20, N: 6 }; s.lock = { L: 200, D: 120, H: 100 }; s.lid = 'flat'; }));
  assert.ok(h.ok, JSON.stringify(h.tips));
  assert.ok(h.warnings.some((x) => x.includes('ciężko')));
});

test('walls cut in order front, end, back, end from one strip', () => {
  const r = build(st());
  assert.deepEqual(r.parts.filter((p) => p.wall).map((p) => p.key), ['front', 'endL', 'back', 'endR']);
  assert.ok(r.oneStrip);
  assert.ok(r.layout.boards.some((b) => b.secs.some((s) => s.strips.some((x) => x.items.some((i) => i.p.wallStrip)))));
});

test('tools and difficulty', () => {
  const r = build(st());
  assert.ok(r.tools.some((t) => t.includes('Strugnica z żelazem 6 mm')));
  assert.ok(r.tools.some((t) => t.includes('router plane') && t.includes('6 mm')));
  const thin = build(st((s) => { s.boards.T = 8; s.lock.H = 60; s.boards.W = 150; }));
  assert.ok(thin.ok, JSON.stringify(thin.tips));
  assert.equal(thin.difficulty.level, Math.min(5, r.difficulty.level + 1));
});

test('templates: walls with the widened band for the hinged lid', () => {
  const r = build(st((s) => { s.lid = 'hinged'; }));
  const t = r.templates[0];
  assert.equal(t.bands.length, 5); assert.equal(t.bands[2], 20); near(t.bands.reduce((a, b) => a + b, 0), 92);
  assert.equal(build(st()).templates.length, 2);
});

test('the finger rule is the tool chest rule', () => {
  assert.deepEqual([fingerLayout(90, 12).n, fingerLayout(54, 12).n], [5, 3]);
});

if (failed) { console.log(`\n${failed} failed`); process.exit(1); }
console.log('\nall passed');
