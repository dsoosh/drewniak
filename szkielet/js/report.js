// Order summary, cut list and layouts derived from a build result. Pure, Node-testable.
import { SECTIONS } from './model.js';
import { packBars, packSheets, groupCuts } from './cut.js';

export function report(res, s) {
  const out = { timber: [], wall: null, floor: null, cover: [], extras: [], cuts: groupCuts(res.members), total: 0, priced: false };
  const price = (p) => (p === '' || p === null || p === undefined || !Number.isFinite(+p) ? null : +p);
  const addCost = (qty, p) => { const v = price(p); if (v !== null) { out.total += qty * v; out.priced = true; } };

  const bySec = {};
  for (const m of res.members) (bySec[m.sec] ||= []).push({ len: m.len, label: m.name });
  for (const sec of ['b100', 'f45', 'l50']) {
    const list = bySec[sec];
    if (!list) continue;
    const stock = s.stock[sec].len;
    const pack = packBars(list, stock, s.kerf);
    const used = list.reduce((t, p) => t + p.len, 0);
    out.timber.push({ sec, name: SECTIONS[sec].name + (sec === 'b100' && stock === 6500 ? ' (połówka belki 13 m)' : ''), stock, count: pack.bars.length, pieces: list.length, bars: pack.bars, tooLong: pack.tooLong, used, waste: pack.bars.length * stock - used });
    addCost(pack.bars.length, s.stock[sec].price);
  }

  const sheetPack = (pieces, st) => {
    const fullOnes = pieces.filter((p) => p.full);
    const rest = pieces.filter((p) => !p.full).map((p) => ({ w: p.w, h: p.h, label: p.label }));
    const pk = packSheets(rest, st.w, st.h, s.kerf);
    const sheets = [...fullOnes.map((p) => ({ items: [{ x: 0, y: 0, w: st.w, h: st.h, label: p.label }] })), ...pk.sheets];
    return { name: st.name, count: sheets.length, sheets, area: pieces.reduce((t, p) => t + p.area, 0) / 1e6, tooBig: pk.tooBig };
  };
  if (res.wallSheets.length) { out.wall = sheetPack(res.wallSheets, s.stock.osbWall); addCost(out.wall.count, s.stock.osbWall.price); }
  out.floor = sheetPack(res.floorSheets, { ...s.stock.osbFloor, name: `OSB/3 ${s.floor.sheetT} mm pióro-wpust` });
  addCost(out.floor.count, s.stock.osbFloor.price);

  // covering: full-length cells take a sheet each, shorter ones are cut from sheets (1D)
  const cov = s.roof.cover;
  for (const clear of [false, true]) {
    const cells = res.roof.grid.flatMap((g) => g.cells).filter((c) => c.clear === clear);
    if (!cells.length) continue;
    const full = cells.filter((c) => c.len >= cov.len - 1).length;
    const part = cells.filter((c) => c.len < cov.len - 1).map((c) => ({ len: c.len, label: c.key }));
    const n = full + packBars(part, cov.len, s.kerf, 50).bars.length;
    out.cover.push({ clear, name: clear ? `${cov.name} przezroczysta` : cov.name, count: n, cells: cells.length });
    if (!clear) addCost(n, s.stock.cover.price);
  }
  const sheetsTotal = out.cover.reduce((t, c) => t + c.count, 0);
  out.extras.push({ name: 'Gwoździe do pokrycia', qty: sheetsTotal * cov.nails, unit: 'szt.' });
  if (s.roof.type === 'gable') out.extras.push({ name: 'Gąsiory', qty: Math.ceil(res.roof.Lr / 850), unit: 'szt.' });
  const nSup = res.info.supports.length;
  out.extras.push({ name: 'Podpory pod ramą (bloczki / kotwy)', qty: nSup, unit: 'szt.' });
  out.extras.push({ name: 'Kotwy rama–podpora + przekładka z papy', qty: nSup, unit: 'kpl.' });
  out.extras.push({ name: 'Wieszaki belek 100×100', qty: res.info.beamX.length * 2, unit: 'szt.' });
  const perim = 2 * (s.dims.L + s.dims.W);
  out.extras.push({ name: 'Kotwy podwalina–rama (co ≤ 1,2 m)', qty: Math.ceil(perim / 1200) + 4, unit: 'szt.' });
  out.extras.push({ name: 'Taśma perforowana na narożniki oczepu', qty: 4, unit: 'szt.' });
  const rafters = res.members.filter((m) => m.kind === 'rafter').length;
  const bearing = (res.info.parts || []).filter((p) => p.bearing);
  const rafterLines = res.info.rafterX.length;
  out.extras.push({ name: 'Łączniki krokwiowe (krokiew–oczep)', qty: rafters * 2 - (s.roof.type === 'gable' ? rafters : 0) + bearing.length * rafterLines, unit: 'szt.' });
  if (bearing.length) out.extras.push({ name: 'Kotwy podwaliny ściany nośnej do legarów', qty: bearing.reduce((t, p) => t + Math.ceil((p.b - p.a) / 1200) + 1, 0), unit: 'szt.' });
  if (res.info.rafterSplices) out.extras.push({ name: 'Nakładki na styk krokwi + śruby M12', qty: res.info.rafterSplices, unit: 'kpl.' });
  if (s.roof.type === 'gable') out.extras.push({ name: 'Nakładki kalenicowe (para krokwi)', qty: rafters, unit: 'szt.' });
  else out.extras.push({ name: 'Obróbka górnej krawędzi dachu', qty: (res.roof.Lr / 1000).toFixed(1).replace('.', ','), unit: 'm' });
  const osb = (out.wall?.count || 0) + out.floor.count;
  out.extras.push({ name: 'Gwoździe lub wkręty do OSB (co 150 / 300 mm)', qty: Math.ceil((osb * 60) / 50) * 50, unit: 'szt.' });
  out.extras.push({ name: 'Impregnat do czół po cięciu', qty: 1, unit: 'l' });
  return out;
}

export function facts(res, s) {
  const i = res.info, { L, W } = s.dims;
  const list = [
    ['Obrys ramy', `${L} × ${W}`],
    ['Powierzchnia', `${((L * W) / 1e6).toFixed(2).replace('.', ',')} m²`],
    ['Ściana przód', `${Math.round(i.Tf - i.zf)}`],
    ['Ściana tył', `${Math.round(i.Tb - i.zf)}`],
    ['Najwyższy punkt', `${Math.round(i.topZ)} nad gruntem`],
    ['Krokwie', `${i.rafterX.length} × co ${Math.round(i.rafterSpacing)}`],
    ['Łaty', `${res.roof.battenRows.map((r) => r.length).join(' + ')} rzędów co ${Math.round(res.roof.slopes[0].battenSpacing)}`],
    ['Wrąb krokwi', `${Math.round(95 * i.sn)} mm`],
  ];
  if (i.ridge) list.splice(4, 0, ['Kalenica (spód krokwi)', `${Math.round(i.ridge - i.zf)} od podłogi`]);
  return list;
}
