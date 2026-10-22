// Checks of the frame generator, report and cutting against the spec scenarios.
// Run: node tests/build.test.js   (VERBOSE=1 prints the cut list)
import assert from 'assert';
import { defaultState, normalize, encodeState, decodeState } from '../szkielet/js/model.js';
import { build } from '../szkielet/js/build.js';
import { report } from '../szkielet/js/report.js';
import { packBars, packSheets } from '../szkielet/js/cut.js';
import { EXAMPLES } from '../szkielet/js/examples.js';

let failed = 0;
const test = (name, fn) => { try { fn(); console.log('ok  ', name); } catch (e) { failed++; console.log('FAIL', name, '\n     ', e.message); } };
const fresh = (fn) => { const s = normalize(defaultState()); if (fn) fn(s); return normalize(s); };
const count = (r, kind) => r.members.filter((m) => m.kind === kind).length;
const finite = (r) => r.members.every((m) => m.len > 0 && m.shape.poly.every(([u, v]) => Number.isFinite(u) && Number.isFinite(v)));

test('default shed: frame, roof and battens as built', () => {
  const r = build(fresh());
  assert.equal(r.members.filter((m) => m.name.startsWith('Belka podłużna')).length, 2);
  assert.equal(r.members.filter((m) => m.name === 'Belka poprzeczna').length, 3);
  assert.equal(r.info.supports.length, 6);
  assert.equal(count(r, 'rafter'), 8);
  assert.equal(r.roof.battenRows[0].length, 10);
  assert.ok(r.members.filter((m) => m.kind === 'batten').every((m) => m.len === 3701 && m.sec === 'l50'));
  assert.deepEqual(r.warnings, []);
  assert.ok(r.checks.every((c) => c.ok), r.checks.filter((c) => !c.ok).map((c) => c.name).join());
  assert.ok(finite(r));
});

test('joist joints lie over transverse beams', () => {
  const s = fresh(), r = build(s);
  const centers = r.info.beamX.map((x) => x + 50);
  for (const m of r.members.filter((x) => x.kind === 'joist'))
    for (const x of [m.shape.poly[0][0], m.shape.poly[1][0]]) if (x > 46 && x < s.dims.L - 46) assert.ok(centers.some((c) => Math.abs(c - x) < 1), `joint at ${x}`);
});

test('high wall has three nogging rows, one on the sheet seam', () => {
  const rows = build(fresh()).walls.back.nogRows;
  assert.equal(rows.length, 3);
  assert.ok(rows.includes(50 + 2500));
});

test('wall sheathing skips strips under 60 mm and needs 11 sheets', () => {
  const s = fresh(), r = build(s), rep = report(r, s);
  assert.ok(r.wallSheets.every((p) => Math.min(p.w, p.h) >= 60));
  assert.equal(r.walls.front.gap, 25);
  assert.equal(rep.wall.count, 11);
});

test('openings: moving a window rebuilds framing, collisions warn', () => {
  const kings = (r) => r.members.filter((m) => m.wall === 'front' && m.kind === 'king').map((m) => m.upoly[0][0]);
  assert.notDeepEqual(kings(build(fresh())), kings(build(fresh((s) => { s.openings.front[0].U = 600; }))));
  const c = build(fresh((s) => { s.openings.front.push({ id: 'x', type: 'window', U: 1900, w: 600, h: 600, sill: 900 }); }));
  assert.ok(c.warnings.some((w) => /za blisko/.test(w)));
  const d = build(fresh((s) => { s.openings.front[0].U = 20; }));
  assert.ok(d.warnings.some((w) => /narożnik/.test(w)));
  const e = build(fresh((s) => { s.openings.front[0].sill = 1700; }));
  assert.ok(e.warnings.some((w) => /nadproże/.test(w)));
});

test('door interrupts the bottom plate', () => {
  const r = build(fresh());
  assert.equal(r.members.filter((m) => m.wall === 'right' && m.name === 'Podwalina ściany').length, 2);
});

test('gable roof with partition: ties, extra studs, no NaN', () => {
  const s = fresh((st) => {
    st.roof.type = 'gable';
    st.partitions.push({ id: 'p1', orient: 'y', c: 900, a: 95, b: 2405, h: 2100, openings: [{ id: 'q', type: 'door', U: 700, w: 900, h: 1900, sill: 0 }] });
  });
  const r = build(s);
  assert.equal(count(r, 'tie'), 6);
  assert.equal(count(r, 'rafter'), 16);
  assert.ok(r.members.some((m) => m.wall === 'front' && Math.abs(m.upoly[0][0] - (900 - 22.5)) < 1));
  assert.ok(r.members.some((m) => m.wall === 'back' && Math.abs(m.upoly[0][0] - (s.dims.L - 900 - 22.5)) < 1));
  assert.ok(r.walls.p1.nogRows.length >= 2);
  assert.deepEqual(r.warnings, []);
  assert.ok(finite(r));
  const hit = build(fresh((st) => st.partitions.push({ id: 'p', orient: 'y', c: 1500, a: 95, b: 2405, h: 2000, openings: [] })));
  assert.ok(hit.warnings.some((w) => /dochodzi do otworu/.test(w)));
  const noTies = build(fresh((st) => { st.roof.type = 'gable'; st.roof.ties = false; }));
  assert.ok(noTies.warnings.some((w) => /ściągów/.test(w)));
});

test('partition parallel to joists gets a joist under it', () => {
  const r = build(fresh((s) => s.partitions.push({ id: 'p', orient: 'x', c: 1700, a: 95, b: 3006, h: 2000, openings: [] })));
  assert.ok(r.info.joistY.some((y) => Math.abs(y + 22.5 - 1700) < 1));
});

test('heavier floor load makes the transverse beam check fail and points at anchors', () => {
  const c = build(fresh((s) => { s.loads.floor = 2.0; })).checks.find((x) => x.name.startsWith('Belka poprzeczna'));
  assert.equal(c.ok, false);
  assert.match(c.hint, /kotew/);
});

test('ground anchors: lines every ≤ anchorMax, under transverse beams, on bearing walls', () => {
  const r = build(fresh((s) => { s.dims.L = 6000; s.dims.W = 6500; }));
  const xs = [...new Set(r.info.supports.map(([x]) => x))].sort((a, b) => a - b);
  const ys = [...new Set(r.info.supports.map(([, y]) => Math.round(y)))].sort((a, b) => a - b);
  assert.ok(xs.slice(1).every((x, i) => x - xs[i] <= 2500 + 1));
  assert.ok(ys.slice(1).every((y, i) => y - ys[i] <= 2500 + 1));
  const centers = r.info.beamX.map((x) => x + 50);
  assert.ok(xs.every((x) => centers.some((c) => Math.abs(c - x) < 0.5)));
  assert.ok(r.info.beamX.slice(1).every((x, i) => x - r.info.beamX[i] <= 1500 * 1.01));
  const b = build(fresh((s) => { s.dims.W = 4000; s.partitions.push({ id: 'b', orient: 'x', c: 2000, a: 95, b: 3006, h: 2000, bearing: true, openings: [] }); }));
  assert.ok(b.info.supports.some(([, y]) => y === 2000));
});

test('large and steep building stays consistent', () => {
  const r = build(fresh((s) => { s.dims.L = 7200; s.dims.W = 4000; s.roof.pitch = 30; s.roof.type = 'gable'; }));
  assert.ok(finite(r));
  assert.ok(r.members.filter((m) => m.sec === 'f45').every((m) => m.len <= 6000 || m.kind === 'rafter'));
});

test('clear sheets are counted separately', () => {
  const s = fresh((st) => { st.roof.clear = ['0:1:0', '0:1:1']; });
  assert.equal(report(build(s), s).cover.find((c) => c.clear).cells, 2);
});

test('cutting is deterministic and respects stock', () => {
  const pieces = [2810, 2810, 2215, 2215, 1110, 1110, 580, 580, 463, 463, 463].map((len) => ({ len }));
  const a = packBars(pieces, 6000, 3), b = packBars(pieces, 6000, 3);
  assert.deepEqual(a.bars.map((x) => x.used), b.bars.map((x) => x.used));
  assert.ok(a.bars.every((x) => x.used <= 6000));
  assert.equal(packSheets([{ w: 1236, h: 306 }, { w: 1236, h: 306 }, { w: 1250, h: 615 }], 1250, 2500).sheets.length, 1);
});

test('a batten sits under every end lap of the covering', () => {
  for (const L of [3101, 7200]) {
    const s = fresh((st) => { st.dims.L = L; st.dims.W = 3500; });
    const r = build(s), cov = s.roof.cover;
    r.roof.slopes.forEach((sl, i) => {
      const rows = r.roof.battenRows[i];
      for (let k = 1; k < r.roof.grid[i].nr; k++) {
        const lap0 = k * (cov.len - cov.lapL), lap1 = lap0 + cov.lapL;
        assert.ok(rows.some((b) => b >= lap0 - 1 && b + 50 <= lap1 + 1), `no batten under lap ${lap0}`);
      }
      assert.ok(rows.slice(1).every((b, j) => b - rows[j] <= s.roof.battenMax + 1));
    });
  }
});

test('wide door gets an edge header, small window a flat one', () => {
  const r = build(fresh((s) => { s.dims.L = 4000; s.openings.front.push({ id: 'd', type: 'door', U: 230, w: 2000, h: 2000, sill: 0 }); s.openings.front[0].U = 2700; }));
  const heads = r.members.filter((m) => m.wall === 'front' && m.kind === 'header');
  assert.ok(heads.some((m) => m.note.startsWith('na sztorc') && m.len === 2090));
  assert.ok(heads.some((m) => m.note.startsWith('płasko, między słupkami')));
  assert.ok(r.checks.filter((c) => c.name.startsWith('Nadproże')).every((c) => c.ok), r.checks.map((c) => `${c.name} ${c.d.toFixed(1)}/${c.lim.toFixed(1)}`).join('; '));
});

test('steep roof limits the birdsmouth to 1/3 and warns', () => {
  const r = build(fresh((s) => { s.roof.pitch = 30; }));
  assert.ok(r.info.notch <= 95 / 3 + 0.01);
  const ok = build(fresh((s) => { s.roof.pitch = 35; }));
  assert.ok(ok.warnings.some((w) => /siedzisko/.test(w)));
});

test('long building staggers plate and batten joints and warns', () => {
  const r = build(fresh((s) => { s.dims.L = 7200; }));
  const joints = (name) => r.members.filter((m) => m.wall === 'front' && m.name === name).map((m) => m.upoly[1][0]).filter((x) => x < 7199);
  for (const j of joints('Oczep (górny)')) assert.ok(joints('Oczep (dolny)').every((k) => Math.abs(k - j) > 600));
  assert.ok(r.warnings.some((w) => /oczepy i podwalina łączone/.test(w)));
  const rows = {};
  for (const m of r.members.filter((x) => x.kind === 'batten')) (rows[m.shape.poly[0].join()] ||= []).push(m.shape.d[1]);
  const ends = Object.values(rows).map((e) => e.sort((a, b) => a - b)[0]);
  for (let i = 1; i < ends.length; i++) assert.notEqual(Math.round(ends[i]), Math.round(ends[i - 1]));
});

test('workshop plates are joined to save stock, joints on studs and staggered', () => {
  const ex = EXAMPLES.find((e) => e.id === 'warsztat');
  const s = ex.make(), r = build(s), rep = report(r, s), f = rep.timber.find((t) => t.sec === 'f45');
  assert.ok(f.count <= 58 && f.waste < 16000, `${f.count} szt., odpad ${f.waste}`);
  assert.ok(r.members.filter((m) => m.name === 'Ściąg').every((m) => m.len === 4000));
  assert.ok(r.warnings.some((w) => /z dwóch kawałków/.test(w) && /2 rzędami gwoździ/.test(w)));
  const splices = rep.extras.find((e) => /Płaskownik perforowany/.test(e.name));
  assert.ok(splices && splices.qty === r.members.filter((m) => /Oczep \(/.test(m.name) && m.note.includes('styk')).length / 2);
  const rim = r.members.filter((m) => m.name === 'Legar czołowy');
  const rimJoint = Math.min(...rim.map((m) => m.len));   // y of the joint (pieces start at y = 0)
  assert.ok(r.info.joistY.every((y) => rimJoint <= y - 1 || rimJoint >= y + 45 + 1), 'styk legaru czołowego na czole legara');
  for (const id of ['front', 'back', 'left', 'right']) {
    const mine = r.members.filter((m) => m.wall === id), us = (m) => m.upoly.map(([u]) => u);
    const zb = r.info.zf + 45;
    // full-height studs only: from the bottom plate up to the plates
    const studs = mine.filter((m) => ['stud', 'king'].includes(m.kind) && Math.min(...m.upoly.map(([, v]) => v)) === zb).map((m) => Math.min(...us(m)) + 22.5);
    const at = (name) => mine.filter((m) => m.name === name && m.note.includes('styk na słupku')).map((m) => Math.min(...us(m))).filter((u) => u > r.walls[id].A + 1);
    const seams = [0, 1, 2, 3, 4].map((k) => r.walls[id].Us[0] + k * 1250);
    for (const name of ['Podwalina ściany', 'Oczep (dolny)', 'Oczep (górny)', 'Podwalina szczytu']) for (const j of at(name)) {
      assert.ok(studs.some((c) => Math.abs(c - j) < 0.5), `${id}: ${name} styk ${j} nie na pełnym słupku`);
      assert.ok(seams.every((m) => Math.abs(m - j) >= 45), `${id}: ${name} styk ${j} na styku płyt`);
    }
    const apart = (p, q) => { for (const a of p) for (const b of q) assert.ok(Math.abs(a - b) > 600, `${id}: ${a} / ${b}`); };
    apart(at('Oczep (dolny)'), at('Oczep (górny)'));
    apart([...at('Oczep (dolny)'), ...at('Oczep (górny)')], at('Podwalina szczytu'));
    if (id === 'left' || id === 'right') apart(at('Podwalina ściany'), [id === 'left' ? 4000 - rimJoint : rimJoint]);
    for (const u of at('Oczep (górny)')) assert.ok(u - r.walls[id].A >= 1250 && r.walls[id].B - u >= 1250, `${id}: krótki górny oczep`);
  }
  const offState = ex.make();
  offState.walls.splitPlates = false;
  const off = build(offState);
  assert.ok(off.members.filter((m) => m.kind === 'plate' && m.wall === 'back').every((m) => m.len === 4000 || m.len === 2102));
  assert.equal(off.members.filter((m) => m.name === 'Legar czołowy').length, 2);
});

test('joined plate never meets over a door in the middle of the wall', () => {
  const s = fresh((st) => { st.dims = { L: 4000, W: 2500 }; st.openings.front = [{ id: 'g', type: 'door', U: 1200, w: 1600, h: 2000, sill: 0 }]; });
  const r = build(s), front = r.members.filter((m) => m.wall === 'front' && /Oczep \(/.test(m.name));
  for (const m of front) for (const [u] of m.upoly) assert.ok(u <= 1200 - 45 + 0.5 || u >= 2800 + 45 - 0.5 || u === 0 || u === 4000, `styk ${u} nad bramą`);
});

test('shed plates stay whole when joining saves nothing', () => {
  const s = EXAMPLES.find((e) => e.id === 'szopa').make(), r = build(s);
  assert.ok(!r.members.some((m) => m.note.includes('styk na słupku')));
  assert.equal(r.members.filter((m) => m.name === 'Legar czołowy').length, 2);
  assert.equal(fresh().walls.splitPlates, true);
});

test('ties: checked with a ceiling when they can carry one, partitions kept below them', () => {
  const house = build(EXAMPLES.find((e) => e.id === 'dom70').make());
  assert.ok(house.checks.some((c) => c.name.startsWith('Ściąg 45×195 (ciężar własny + sufit') && c.ok));
  const shop = build(EXAMPLES.find((e) => e.id === 'warsztat').make());
  assert.ok(shop.checks.some((c) => c.name.startsWith('Ściąg 45×95 (tylko ciężar własny') && c.ok));
  const hi = EXAMPLES.find((e) => e.id === 'dom70').make();
  assert.ok(report(house, EXAMPLES.find((e) => e.id === 'dom70').make()).extras.some((x) => x.name.startsWith('Łącznik przesuwny')));
  hi.partitions[0].h = 2585;
  assert.ok(build(hi).warnings.some((w) => w.includes('za blisko ściągów')));
});

test('wide gable roof: tie lapped and warned, more mid supports', () => {
  const r = build(fresh((s) => { s.dims.L = 6000; s.dims.W = 6500; s.roof.type = 'gable'; }));
  assert.ok(r.warnings.some((w) => w.includes('Ściągi łączone')));
  assert.ok(r.members.filter((m) => m.kind === 'tie').every((m) => m.len <= 6000));
  assert.ok(r.info.midSpan <= 2500);
});

test('rim joists under gable walls and verge boards on the roof', () => {
  const r = build(fresh());
  assert.equal(r.members.filter((m) => m.name === 'Legar czołowy').length, 2);
  assert.equal(r.members.filter((m) => m.kind === 'verge').length, 2);
  assert.ok(r.members.filter((m) => m.name === 'Legar podłogi').every((m) => m.len === 3101 - 90));
});

test('100×100 cut from 13 m beams, ordered in 6.5 m halves', () => {
  const s = fresh(), rep = report(build(s), s);
  const b = rep.timber.find((t) => t.sec === 'b100');
  assert.equal(b.stock, 13000);
  assert.equal(b.count, 3);
  const w = EXAMPLES.find((e) => e.id === 'warsztat').make();
  const bw = report(build(w), w).timber.find((t) => t.sec === 'b100');
  assert.equal(bw.count, 4);
  assert.equal(bw.beams, 2);
  const r = build(fresh((st) => { st.dims.L = 10000; }));
  const front = r.members.filter((m) => m.name === 'Belka podłużna (przód)');
  assert.equal(front.length, 1);
  assert.equal(front[0].len, 10000);
  const r2 = build(fresh((st) => { st.dims.L = 15000; }));
  const f2 = r2.members.filter((m) => m.name === 'Belka podłużna (przód)');
  const ax = r2.info.anchorX.map((x) => x + 50);
  assert.ok(f2.length === 2 && ax.some((c) => Math.abs(c - f2[0].shape.poly[1][0]) < 1));
});

test('wide mono roof proposes bearing walls that make rafters pass', () => {
  const s0 = fresh((st) => { st.dims.W = 5000; st.dims.L = 4000; });
  const r = build(s0);
  const rafter = r.checks.find((c) => c.name.startsWith('Krokiew'));
  assert.equal(rafter.ok, false);
  assert.ok(r.suggestions.length >= 1);
  assert.ok(r.warnings.some((w) => /proponowane ściany nośne/.test(w)));
  const s1 = fresh((st) => { st.dims.W = 5000; st.dims.L = 4000; for (const g of r.suggestions) st.partitions.push({ ...g, id: 'b' + g.c, h: 2000, bearing: true, openings: [] }); });
  const r1 = build(s1);
  assert.ok(r1.checks.find((c) => c.name.startsWith('Krokiew')).ok);
  assert.equal(r1.suggestions.length, 0);
});

test('bearing wall: plate under rafters, notched rafters, supports and double joist', () => {
  const s = fresh((st) => { st.dims.W = 4000; st.partitions.push({ id: 'b', orient: 'x', c: 2000, a: 95, b: 3006, h: 1000, bearing: true, openings: [] }); });
  const r = build(s);
  const p = r.info.parts.find((x) => x.id === 'b');
  const plate = r.members.filter((m) => m.wall === 'b' && m.name === 'Oczep (górny)');
  const top = Math.max(...plate.flatMap((m) => m.upoly.map((q) => q[1])));
  assert.ok(Math.abs(top - p.Tp) < 0.5);
  assert.ok(Math.abs(p.Tp - r.info.zr(2000 - 47.5 + r.info.sw)) < 0.5);
  assert.ok(r.info.supports.filter(([, y]) => y === 2000).length === r.info.anchorX.length);
  assert.ok(r.info.joistY.filter((y) => y > 2000 - 100 && y < 2000 + 60).length >= 2);
  const raf = r.members.find((m) => m.kind === 'rafter');
  assert.ok(raf.shape.poly.some(([y, z]) => Math.abs(y - (2000 - 47.5)) < 0.5));
  assert.equal(r.walls.b.name, 'Ściana nośna 1');
});

test('noggings are staggered except on the sheet seam row', () => {
  const r = build(fresh());
  const back = r.members.filter((m) => m.wall === 'back' && m.kind === 'nog');
  const zs = (row) => back.map((m) => (m.upoly[0][1] + m.upoly[2][1]) / 2).filter((z) => Math.abs(z - row) < 40);
  const regular = zs(r.walls.back.nogRows[0]);
  assert.ok(new Set(regular.map(Math.round)).size === 2, 'two heights in a regular row');
  const seam = zs(2550);
  assert.ok(seam.length > 0 && seam.every((z) => Math.abs(z - 2550) < 0.5));
});

test('review 2: doubled joist on a sheet seam, ridge wall, ties clear of bearing walls, rafter splice', () => {
  const add = (st, c) => st.partitions.push({ id: 'b' + c, orient: 'x', c, a: 95, b: st.dims.L - 95, h: 2000, bearing: true, openings: [] });
  const r1 = build(fresh((st) => { st.dims.W = 5000; add(st, 2500); }));
  assert.equal(r1.info.joistY.filter((y) => y < 2500 + 47.5 && y + 45 > 2500 - 47.5).length, 2);
  const r2 = build(fresh((st) => { st.dims.W = 6000; st.roof.type = 'gable'; st.roof.pitch = 25; add(st, 3000); }));
  assert.ok(Math.abs(r2.info.parts[0].Tp - r2.info.zr(3000)) < 0.5);
  const s3 = fresh((st) => { st.dims.W = 6000; st.roof.type = 'gable'; add(st, 1525); add(st, 4475); });
  const r3 = build(s3);
  const ties = r3.members.filter((m) => m.kind === 'tie');
  const hits = r3.members.filter((m) => m.group.startsWith('b') && ['stud', 'nog'].includes(m.kind)).filter((m) => {
    const xs = m.shape.poly.map((p) => p[0]), zs = m.shape.poly.map((p) => p[1]);
    return ties.some((t) => Math.min(...xs) < t.shape.d[1] && Math.max(...xs) > t.shape.d[0] && Math.min(...zs) < t.shape.poly[2][1] && Math.max(...zs) > t.shape.poly[0][1]);
  });
  assert.equal(hits.length, 0, `${hits.length} collisions`);
  const r4 = build(fresh((st) => { st.dims.W = 6000; add(st, 3000); }));
  assert.ok(r4.members.filter((m) => m.kind === 'rafter').every((m) => m.len <= 6000));
  assert.ok(r4.warnings.filter((w) => /Krokiew d+ mm jest dłuższa/.test(w)).length <= 1);
  const s5 = fresh((st) => { st.dims.W = 5000; st.partitions.push({ id: 'n', orient: 'x', c: 2480, a: 95, b: 3006, h: 2000, openings: [] }); });
  assert.ok(build(s5).warnings.some((w) => /oznacz ją jako nośną/.test(w)));
});

test('small openings: single studs, reused grid stud, no trimmers; wide ones keep trimmers', () => {
  const r = build(fresh());
  const front = r.members.filter((m) => m.wall === 'front');
  assert.equal(front.filter((m) => m.kind === 'trimmer').length, 0);
  // window U=1880 starts 2.5 mm right of the grid stud face at 1877.5 -> reused, one new stud only
  assert.equal(front.filter((m) => m.kind === 'king').length, 1);
  assert.ok(front.some((m) => m.name === 'Słupek (bok otworu)'));
  const wide = build(fresh((st) => { st.walls.doubleFrom = 900; }));
  assert.equal(wide.members.filter((m) => m.wall === 'front' && m.kind === 'trimmer').length, 2);
});

test('no separate nogging at the sill or header height inside the opening bay', () => {
  const r = build(fresh((st) => { st.openings.front[0].sill = 1600 - 220 + 22.5 - 1600 + 800 + 220 - 220; }));
  const o = { U: 1880, w: 1020 };
  const nogs = r.members.filter((m) => m.wall === 'front' && m.kind === 'nog' && m.upoly[0][0] >= o.U - 50 && m.upoly[1][0] <= o.U + o.w + 50);
  const sillZ = 220 + r.members.length * 0 + (fresh().openings.front[0].sill);
  void sillZ;
  for (const m of nogs) {
    const zc = (m.upoly[0][1] + m.upoly[2][1]) / 2;
    const sill = r.members.find((x) => x.wall === 'front' && x.kind === 'sill');
    const sz = (sill.upoly[0][1] + sill.upoly[2][1]) / 2;
    assert.ok(Math.abs(zc - sz) > 30 + 45, `nogging at ${zc} duplicates sill at ${sz}`);
  }
});

test('interior sheathing, one-sided partition sheathing, offcut minus kerf', () => {
  const s = fresh((st) => { st.walls.sheatheIn = true; st.partitions.push({ id: 'p', orient: 'y', c: 1500, a: 95, b: 2405, h: 2000, sheathe: 'b', openings: [] }); });
  const r = build(s), rep = report(r, s);
  const inner = r.wallSheets.filter((p) => p.side === 'in');
  assert.ok(inner.some((p) => p.label.startsWith('Fw')) && inner.some((p) => p.label.startsWith('Rw')));
  assert.ok(rep.wallIn && rep.wallIn.count > 0);
  const part = r.wallSheets.filter((p) => p.wall === 'p');
  assert.ok(part.length > 0 && part.every((p) => p.face === 'b'));
  const bars = packBars([{ len: 3101 }, { len: 2830 }], 6000, 3).bars;
  assert.equal(bars[0].waste, 63);
  assert.equal(normalize({ ...defaultState(), partitions: [{ id: 'x', orient: 'x', c: 1000, a: 95, b: 3006, h: 2000, sheathe: true, openings: [] }] }).partitions[0].sheathe, 'both');
});

test('review 3: shared stud, header hanger load, seam nogging over a header, interior sheets on studs', () => {
  // two windows sharing grid stud 1215.5..1260.5 on the front wall
  const r1 = build(fresh((st) => { st.openings.front = [{ id: 'a', type: 'window', U: 700, w: 515.5, h: 500, sill: 1000 }, { id: 'b', type: 'window', U: 1260.5, w: 500, h: 500, sill: 1000 }]; }));
  const studs = r1.members.filter((m) => m.wall === 'front' && ['stud', 'king'].includes(m.kind)).map((m) => m.upoly[0][0]);
  assert.ok(studs.some((u) => Math.abs(u - 1215.5) < 0.5), 'shared stud kept');
  assert.equal(studs.filter((u) => u > 1150 && u < 1300).length, 1);
  // heavy eaves wall: header hangs on brackets or gets studs under it
  const r2 = build(fresh((st) => { st.dims.W = 5000; st.dims.L = 4000; st.openings.front = [{ id: 'w', type: 'window', U: 1890, w: 900, h: 600, sill: 1000 }]; }));
  const h2 = r2.members.filter((m) => m.wall === 'front' && m.kind === 'header');
  assert.ok(h2.some((m) => /kątowniki/.test(m.note)) || r2.members.some((m) => m.wall === 'front' && m.kind === 'trimmer'));
  // seam at 2550 above a header top at 2505 keeps its nogging
  const r3 = build(fresh((st) => { st.openings.back = [{ id: 'x', type: 'window', U: 1300, w: 600, h: 600, sill: 1640 - 220 }]; }));
  const seamNogs = r3.members.filter((m) => m.wall === 'back' && m.kind === 'nog' && Math.abs((m.upoly[0][1] + m.upoly[2][1]) / 2 - 2550) < 1);
  assert.ok(seamNogs.some((m) => m.upoly[0][0] < 1600 && m.upoly[1][0] > 1300), 'seam nogging over the window bay');
  // interior sheets: vertical edges on studs, horizontal seam at 2550, cut below rafters
  const s4 = fresh((st) => { st.walls.sheatheIn = true; });
  const r4 = build(s4);
  for (const id of ['front', 'back']) {
    const studsU = r4.members.filter((m) => m.wall === id && ['stud', 'king', 'cripple'].includes(m.kind)).map((m) => [m.upoly[0][0], m.upoly[1][0]]);
    for (const p of r4.walls[id].sheetsIn) for (const x of [p.bbox[0], p.bbox[2]]) assert.ok(studsU.some(([a, b]) => x >= a - 0.5 && x <= b + 0.5), `${id} inner edge ${x} not on a stud`);
  }
  // no sheet cell inside a rafter: sheets are notched where the rafter dips below the plate top
  const rafters = r4.members.filter((m) => m.kind === 'rafter');
  for (const id of ['front', 'back']) for (const p of [...r4.walls[id].sheets, ...r4.walls[id].sheetsIn]) for (const c of p.cells) {
    const [ya, yb] = p.shape3d.d, zl = Math.min(r4.info.zr(ya), r4.info.zr(yb));
    const xs = c.poly.map(([u]) => p.shape3d.map(u)), x0 = Math.min(...xs), x1 = Math.max(...xs), ztop = Math.max(...c.poly.map((q) => q[1]));
    if (ztop <= zl + 0.5) continue;
    assert.ok(!rafters.some((m) => m.shape.d[0] < x1 - 0.5 && m.shape.d[1] > x0 + 0.5), `${id} sheet ${p.label} hits a rafter at x ${x0}`);
  }
  assert.ok(r4.walls.back.sheetsIn.some((p) => Math.abs(p.bbox[1] - 2550) < 0.5 || Math.abs(p.bbox[3] - 2550) < 0.5));
});

test('cost estimate: default prices, OSB thickness from the table, anchor range', () => {
  const s = fresh(), c = report(build(s), s).cost;
  const get = (re) => c.items.find((i) => re.test(i.name));
  assert.equal(get(/100×100/).price, 189);
  assert.equal(get(/45×95/).price, 69);
  assert.equal(get(/50×50/).price, 22);
  assert.equal(get(/Kotwy gruntowe/).qty, 6);
  assert.equal(get(/na ściany/).price, 69);
  assert.ok(Math.abs(c.total - c.items.reduce((a, i) => a + i.sum, 0)) < 0.01);
  assert.equal(c.max - c.min, 6 * 30);
  const s18 = fresh((st) => { st.walls.sheathT = 18; });
  assert.equal(report(build(s18), s18).cost.items.find((i) => /na ściany/.test(i.name)).price, 98);
  const own = fresh((st) => { st.walls.sheathT = 18; st.stock.osbWall.price = 90; });
  assert.equal(report(build(own), own).cost.items.find((i) => /na ściany/.test(i.name)).price, 90);
});

test('review 4: intermediate-line anchors under every transverse beam, beam joints over anchors', () => {
  const r = build(fresh((s) => { s.dims.L = 7200; s.dims.W = 4000; }));
  for (const y of r.info.midY) for (const x of r.info.beamX) assert.ok(r.info.supports.some(([ax, ay]) => Math.abs(ax - x - 50) < 0.5 && Math.abs(ay - y) < 0.5));
  const ax = r.info.anchorX.map((x) => x + 50);
  for (const m of r.members.filter((x) => x.name.startsWith('Belka podłużna'))) {
    const end = m.shape.poly[1][0];
    if (end < 7199) assert.ok(ax.some((a) => Math.abs(a - end) < 0.5), `joint at ${end} not over an anchor`);
  }
  assert.ok(r.info.anchorLoad > 0);
});

test('limits clamp absurd values', () => {
  const s = normalize({ ...defaultState(), dims: { L: 80000, W: -5 }, roof: { ...defaultState().roof, pitch: 90, battenMax: 1 } });
  assert.deepEqual(s.dims, { L: 15000, W: 1000 });
  assert.equal(s.roof.pitch, 45);
  assert.equal(s.roof.battenMax, 200);
  const many = normalize({ ...defaultState(), partitions: [...Array(50)].map((_, i) => ({ id: 'p' + i, orient: 'y', c: 1000, a: 95, b: 2405, h: 2000, openings: [] })) });
  assert.equal(many.partitions.length, 30);
});

test('examples build without failing checks or design warnings', () => {
  for (const e of EXAMPLES) {
    const s = e.make(), r = build(s);
    assert.ok(r.checks.every((c) => c.ok), `${e.id}: ${r.checks.filter((c) => !c.ok).map((c) => c.name).join(', ')}`);
    const real = r.warnings.filter((w) => !/łączon|dłuższa niż kantówka|dłuższe niż materiał/.test(w));
    assert.deepEqual(real, [], e.id);
    assert.equal((r.suggestions || []).length, 0, e.id);
    assert.ok(finite(r));
  }
});

test('no sheet above the rafters, partition strip in interior sheathing', () => {
  const s = fresh((st) => { st.walls.sheatheIn = true; st.partitions.push({ id: 'p', orient: 'y', c: 1500, a: 95, b: 2405, h: 2000, sheathe: 'both', openings: [] }); });
  const r = build(s);
  for (const id of ['front', 'back']) for (const p of [...r.walls[id].sheets, ...r.walls[id].sheetsIn]) {
    const ys = p.shape3d.d;
    assert.ok(p.bbox[3] <= Math.min(r.info.zr(ys[0]), r.info.zr(ys[1])) + 0.5 || p.bbox[3] <= r.walls[id].top() + 0.5);
  }
  const strip = r.walls.front.sheetsIn.flatMap((p) => p.cells).filter((c) => c.x0 < 1500 + 47.5 && c.x1 > 1500 - 47.5);
  assert.equal(strip.length, 0, 'interior sheet covers the partition end');
});

test('review 5: no member longer than its stock in the examples, studs under partition cut-out edges', () => {
  for (const e of EXAMPLES) {
    const s = e.make(), rep = report(build(s), s);
    assert.ok(rep.timber.every((x) => x.tooLong.length === 0), `${e.id}: ${rep.timber.flatMap((x) => x.tooLong.map((p) => p.label + ' ' + p.len)).join(', ')}`);
  }
  const s = fresh((st) => { st.walls.sheatheIn = true; st.partitions.push({ id: 'p', orient: 'y', c: 1500, a: 95, b: 2405, h: 2000, sheathe: 'both', openings: [] }); });
  const r = build(s);
  const studs = r.members.filter((m) => m.wall === 'front' && m.kind === 'stud').map((m) => [m.upoly[0][0], m.upoly[1][0]]);
  for (const edge of [1500 - 47.5 - 12, 1500 + 47.5 + 12]) assert.ok(studs.some(([a, b]) => edge >= a && edge <= b), `no stud under edge ${edge}`);
});

test('splices: rafters only over a bearing wall, ties over a bearing wall or at mid-span', () => {
  const bw = (st, c) => st.partitions.push({ id: 'b' + c, orient: 'x', c, a: 95, b: st.dims.L - 95, h: 2000, bearing: true, openings: [] });
  const r = build(fresh((st) => { st.dims.W = 6000; bw(st, 3000); }));
  const parts = r.members.filter((m) => m.kind === 'rafter');
  assert.equal(parts.length, 2 * r.info.rafterX.length);
  const ends = new Set(parts.flatMap((m) => { const ys = m.shape.poly.map((q) => q[0]); return [Math.round(Math.min(...ys)), Math.round(Math.max(...ys))]; }));
  assert.ok(ends.has(3000));
  assert.equal(r.members.filter((m) => m.kind === 'scab').length, 2 * r.info.rafterX.length);
  // splitting never costs more stock than whole rafters
  const s2 = fresh((st) => { st.dims.W = 4000; bw(st, 2000); });
  const whole = fresh((st) => { st.dims.W = 4000; bw(st, 2000); st.roof.splice = 'none'; });
  const bars = (s) => report(build(s), s).timber.find((x) => x.sec === 'f45').count;
  assert.ok(bars(s2) <= bars(whole));
  // loft joists over the bearing wall
  const g = build(fresh((st) => { st.dims.W = 7000; st.dims.L = 5000; st.roof.type = 'gable'; st.roof.pitch = 30; bw(st, 2400); bw(st, 4600); }));
  const ties = g.members.filter((m) => m.kind === 'tie');
  assert.ok(ties.some((m) => Math.abs(m.shape.poly[1][0] - 2400) < 1 || Math.abs(m.shape.poly[0][0] - 2400) < 1 || Math.abs(m.shape.poly[1][0] - 4600) < 1));
  assert.ok(ties.every((m) => m.len <= 6000));
  // plates go to the order
  const sp = fresh((st) => { st.dims.W = 6000; bw(st, 3000); st.roof.splice = 'plate'; });
  assert.ok(report(build(sp), sp).extras.some((e) => /Płytki kolczaste/.test(e.name)));
});

test('review 7: rafters never lapped, long ties lapped with bolts when none, tie ends below rafter top, no stud in tie zone', () => {
  const bw = (st, c) => st.partitions.push({ id: 'b' + c, orient: 'x', c, a: 95, b: st.dims.L - 95, h: 2000, bearing: true, openings: [] });
  const lap = build(fresh((st) => { st.dims.W = 6000; bw(st, 3000); st.roof.splice = 'lap'; }));
  const rx = lap.info.rafterX;
  assert.ok(lap.members.filter((m) => m.kind === 'rafter').every((m) => rx.some((x) => Math.abs(m.shape.d[0] - x) < 0.5)), 'rafter piece moved out of plane');
  const s = fresh((st) => { st.dims.W = 7000; st.dims.L = 5000; st.roof.type = 'gable'; st.roof.pitch = 30; st.roof.splice = 'none'; });
  const r = build(s), rep = report(r, s);
  assert.ok(r.members.filter((m) => m.kind === 'tie').every((m) => m.len <= 6000));
  assert.ok(rep.extras.some((e) => /zakład/.test(e.name)));
  const zt = (y) => r.info.zr(y) + 95 / r.info.cs;
  for (const m of r.members.filter((x) => x.kind === 'tie')) for (const [y, z] of m.shape.poly) assert.ok(z <= Math.max(r.info.Tf + 95, zt(y)) + 0.5 && z <= zt(y) + 0.5 || z <= r.info.Tf + 0.5, `tie corner above rafter at y ${y}`);
  const g = build(fresh((st) => { st.dims.W = 7000; st.dims.L = 5000; st.roof.type = 'gable'; st.roof.pitch = 30; bw(st, 2400); bw(st, 4600); }));
  const scabs = g.members.filter((m) => m.kind === 'scab' && m.name.includes('ściągu'));
  const studs = g.members.filter((m) => m.wall && m.wall.startsWith('b') && ['stud', 'nog'].includes(m.kind));
  const hit = studs.filter((m) => scabs.some((c) => { const xs = m.shape.poly.map((p) => p[0]); return Math.min(...xs) < c.shape.d[1] && Math.max(...xs) > c.shape.d[0] && Math.min(...m.shape.poly.map((p) => p[1])) < c.shape.poly[2][1] && Math.max(...m.shape.poly.map((p) => p[1])) > c.shape.poly[0][1]; }));
  assert.equal(hit.length, 0);
});

test('sections: deep rafters, 150×150 frame, header sizing, gable split', () => {
  const g = (f) => build(fresh((st) => { st.dims.L = 6000; st.dims.W = 7000; st.roof.type = 'gable'; st.roof.pitch = 30; st.walls.h0 = 2600; f && f(st); }));
  const deep = g((st) => { st.roof.rafterSec = 'f195'; st.roof.rafterMax = 600; });
  assert.ok(deep.checks.find((c) => c.name.startsWith('Krokiew')).ok);
  assert.equal(deep.suggestions.length, 0);
  assert.ok(deep.members.filter((m) => m.kind === 'rafter').every((m) => m.sec === 'f195'));
  const b100 = g(), b150 = g((st) => { st.base.beamSec = 'b150'; });
  assert.equal(b150.info.zf - b100.info.zf, 50);
  assert.ok(b150.members.filter((m) => m.kind === 'beam').every((m) => m.sec === 'b150'));
  const door = g((st) => { st.openings.front = [{ id: 'd', type: 'door', U: 1500, w: 2400, h: 2100, sill: 0 }]; });
  const hd = door.members.filter((m) => m.wall === 'front' && m.kind === 'header');
  assert.ok(hd.every((m) => m.sec === 'f145' || m.sec === 'f195'), hd.map((m) => m.sec).join());
  assert.ok(door.checks.filter((c) => c.name.startsWith('Nadproże')).every((c) => c.ok));
  const studs = b100.members.filter((m) => (m.wall === 'left' || m.wall === 'right') && ['stud', 'king', 'cripple'].includes(m.kind));
  assert.ok(studs.every((m) => m.len <= 3000), Math.max(...studs.map((m) => m.len)));
  assert.ok(b100.walls.left.split > 0);
  const tall = build(fresh((st) => { st.walls.h0 = 3300; }));
  assert.ok(tall.warnings.some((w) => /dłuższe niż 3 m/.test(w)));
});

test('state survives a share link', () => {
  const s = fresh((st) => { st.dims.L = 4200; st.partitions.push({ id: 'p', orient: 'y', c: 2000, a: 95, b: 2405, h: 2000, openings: [] }); });
  assert.deepEqual(decodeState(encodeState(s)), s);
});

if (process.env.VERBOSE) {
  const s = fresh(), rep = report(build(s), s);
  for (const g of rep.cuts) console.log(`${g.sec} ${g.count}× ${g.len} ${g.name} ${g.note}`);
  for (const t of rep.timber) console.log(t.name, t.count, 'szt.');
}
if (failed) { console.log(`\n${failed} failed`); process.exit(1); }
console.log('\nall passed');
