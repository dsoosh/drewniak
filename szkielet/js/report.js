// Order summary, cut list and layouts derived from a build result. Pure, Node-testable.
import { SECTIONS, osbPrice, ANCHOR_RANGE } from './model.js';
import { packBars, packSheets, groupCuts } from './cut.js';

export function report(res, s) {
  const out = { timber: [], wall: null, floor: null, cover: [], extras: [], cuts: groupCuts(res.members) };
  const price = (p) => (p === '' || p === null || p === undefined || !Number.isFinite(+p) ? null : +p);
  const items = [];
  const addCost = (name, qty, unit, p) => { const v = price(p); if (v !== null && qty > 0) items.push({ name, qty, unit, price: v, sum: qty * v }); };

  const bySec = {};
  for (const m of res.members) (bySec[m.sec] ||= []).push({ len: m.len, label: m.name });
  for (const sec of Object.keys(SECTIONS)) {
    const list = bySec[sec];
    if (!list) continue;
    const stock = s.stock[sec].len, unit = s.stock[sec].unit || null;
    const pack = packBars(list, stock, s.kerf, 300, unit);
    const used = list.reduce((t, p) => t + p.len, 0);
    const buyLen = unit || stock, count = pack.units;
    // 100×100: cut from 13 m beams, ordered and priced in 6.5 m halves
    out.timber.push({ sec, name: SECTIONS[sec].name + (unit ? ' (połówki belki 13 m)' : ''), stock, buyLen, unit, count, beams: pack.bars.length, pieces: list.length, bars: pack.bars, tooLong: pack.tooLong, used, waste: count * buyLen - used });
    addCost(`${SECTIONS[sec].name} × ${buyLen / 1000} m`.replace('.', ',') + (unit ? ' (połówka belki 13 m)' : ''), count, 'szt.', s.stock[sec].price);
  }

  const sheetPack = (pieces, st) => {
    const fullOnes = pieces.filter((p) => p.full);
    const rest = pieces.filter((p) => !p.full).map((p) => ({ w: p.w, h: p.h, label: p.label }));
    const pk = packSheets(rest, st.w, st.h, s.kerf);
    const sheets = [...fullOnes.map((p) => ({ items: [{ x: 0, y: 0, w: st.w, h: st.h, label: p.label }] })), ...pk.sheets];
    return { name: st.name, count: sheets.length, sheets, area: pieces.reduce((t, p) => t + p.area, 0) / 1e6, tooBig: pk.tooBig };
  };
  const outer = res.wallSheets.filter((p) => p.side !== 'in'), inner = res.wallSheets.filter((p) => p.side === 'in');
  const wallPrice = price(s.stock.osbWall.price) ?? osbPrice(s.walls.sheathT);
  if (outer.length) { out.wall = sheetPack(outer, s.stock.osbWall); addCost(`${s.stock.osbWall.name} na ściany`, out.wall.count, 'płyt', wallPrice); }
  if (inner.length) { out.wallIn = sheetPack(inner, s.stock.osbWall); addCost(`${s.stock.osbWall.name} od środka i ścianki`, out.wallIn.count, 'płyt', wallPrice); }
  out.floor = sheetPack(res.floorSheets, { ...s.stock.osbFloor, name: `OSB/3 ${s.floor.sheetT} mm pióro-wpust` });
  addCost(`OSB/3 ${s.floor.sheetT} mm pióro-wpust (podłoga)`, out.floor.count, 'płyt', price(s.stock.osbFloor.price) ?? osbPrice(s.floor.sheetT, true));

  // covering: full-length cells take a sheet each, shorter ones are cut from sheets (1D)
  const cov = s.roof.cover;
  for (const clear of [false, true]) {
    const cells = res.roof.grid.flatMap((g) => g.cells).filter((c) => c.clear === clear);
    if (!cells.length) continue;
    const full = cells.filter((c) => c.len >= cov.len - 1).length;
    const part = cells.filter((c) => c.len < cov.len - 1).map((c) => ({ len: c.len, label: c.key }));
    const n = full + packBars(part, cov.len, s.kerf, 50).bars.length;
    out.cover.push({ clear, name: clear ? `${cov.name} przezroczysta` : cov.name, count: n, cells: cells.length });
    addCost(clear ? `${cov.name} przezroczysta (cena jak pokrycia)` : cov.name, n, 'ark.', s.stock.cover.price);
  }
  const sheetsTotal = out.cover.reduce((t, c) => t + c.count, 0);
  out.extras.push({ name: 'Gwoździe do pokrycia', qty: sheetsTotal * cov.nails, unit: 'szt.' });
  if (s.roof.type === 'gable') out.extras.push({ name: 'Gąsiory', qty: Math.ceil(res.roof.Lr / 850), unit: 'szt.' });
  const nSup = res.info.supports.length;
  // roof bracing: perforated strap crosses on long roofs; struts where a gable is split at the eaves plate
  if (res.roof.Lr > 6000) {
    const S = res.roof.slopes[0].S, bay = res.info.rafterSpacing * 4;
    out.extras.push({ name: 'Taśma perforowana do stężenia połaci (2 krzyże na połać)', qty: Math.ceil((res.roof.slopes.length * 4 * Math.hypot(S, bay)) / 1000), unit: 'm' });
  }
  const slides = Object.values(res.walls).reduce((n, d) => n + (d.slide || 0), 0);
  if (slides) out.extras.push({ name: 'Łącznik przesuwny ścianki pod ściągiem (luz na ugięcie)', qty: slides, unit: 'szt.' });
  const splitGables = Object.values(res.walls).filter((d) => d.split).length;
  if (splitGables) out.extras.push({ name: 'Zastrzały szczytu 45×95 ok. 1,5 m (oczep szczytu – ściągi)', qty: splitGables * 2, unit: 'szt.' });
  out.extras.push({ name: 'Kotwy gruntowe pod ramą', qty: nSup, unit: 'szt.' });
  out.extras.push({ name: 'Przekładka z papy na głowicę kotwy', qty: nSup, unit: 'szt.' });
  addCost('Kotwy gruntowe', nSup, 'szt.', s.stock.anchor.price);
  out.extras.push({ name: `Wieszaki belek ${SECTIONS[s.base.beamSec || 'b100'].name.replace('Belka ', '')}`, qty: res.info.beamX.length * 2, unit: 'szt.' });
  const perim = 2 * (s.dims.L + s.dims.W);
  out.extras.push({ name: 'Kotwy podwalina–rama (co ≤ 1,2 m)', qty: Math.ceil(perim / 1200) + 4, unit: 'szt.' });
  out.extras.push({ name: 'Taśma perforowana na narożniki oczepu', qty: 4, unit: 'szt.' });
  // rafters by position, not by spliced pieces
  const rafters = res.info.rafterX.length * (s.roof.type === 'gable' ? 2 : 1);
  const bearing = (res.info.parts || []).filter((p) => p.bearing);
  const rafterLines = res.info.rafterX.length;
  out.extras.push({ name: 'Łączniki krokwiowe (krokiew–oczep)', qty: rafters * 2 - (s.roof.type === 'gable' ? rafters : 0) + bearing.length * rafterLines, unit: 'szt.' });
  if (bearing.length) out.extras.push({ name: 'Kotwy podwaliny ściany nośnej do legarów', qty: bearing.reduce((t, p) => t + Math.ceil((p.b - p.a) / 1200) + 1, 0), unit: 'szt.' });
  if (res.info.plateSplices) out.extras.push({ name: 'Płaskownik perforowany 40×300 na styki oczepów', qty: res.info.plateSplices, unit: 'szt.' });
  if (res.info.headerBrackets) out.extras.push({ name: 'Kątowniki pod nadproża między słupkami', qty: res.info.headerBrackets, unit: 'szt.' });
  const sp = res.info.splices || { rafters: 0, ties: 0, method: 'none' };
  const joints = sp.rafters + sp.ties;
  const rm = sp.method === 'lap' || sp.method === 'none' ? 'scab' : sp.method, tm = sp.tieMethod || sp.method;
  const plates = (rm === 'plate' ? sp.rafters : 0) + (tm === 'plate' ? sp.ties : 0);
  if (plates) out.extras.push({ name: 'Płytki kolczaste (para na styk)', qty: plates * 2, unit: 'szt.' });
  if (sp.ties && tm === 'lap') out.extras.push({ name: 'Śruby M12 z podkładkami na styki ściągów na zakład', qty: sp.ties * 2, unit: 'kpl.' });
  if (sp.ties && tm === 'scab') out.extras.push({ name: 'Śruby M12 do nakładek ściągów', qty: sp.ties * 8, unit: 'kpl.' });
  if (s.roof.type === 'gable') out.extras.push({ name: 'Nakładki kalenicowe (para krokwi)', qty: res.info.rafterX.length, unit: 'szt.' });
  else out.extras.push({ name: 'Obróbka górnej krawędzi dachu', qty: (res.roof.Lr / 1000).toFixed(1).replace('.', ','), unit: 'm' });
  const osb = (out.wall?.count || 0) + (out.wallIn?.count || 0) + out.floor.count;
  out.extras.push({ name: 'Gwoździe lub wkręty do OSB (co 150 / 300 mm)', qty: Math.ceil((osb * 60) / 50) * 50, unit: 'szt.' });
  out.extras.push({ name: 'Impregnat do czół po cięciu', qty: 1, unit: 'l' });
  const total = items.reduce((t, i) => t + i.sum, 0);
  const anchorPrice = price(s.stock.anchor.price) ?? 0;
  out.cost = {
    items, total,
    min: total + nSup * (ANCHOR_RANGE[0] - anchorPrice),
    max: total + nSup * (ANCHOR_RANGE[1] - anchorPrice),
    excluded: ['łączniki krokwiowe, kątowniki, wieszaki, taśmy', 'gwoździe i wkręty', 'kotwy podwaliny', 'gąsiory i obróbki', 'papa i impregnat'],
  };
  return out;
}

export function facts(res, s) {
  const i = res.info, { L, W } = s.dims;
  const list = [
    ['Obrys ramy', `${L} × ${W}`],
    ['Kotwy gruntowe', `${res.info.supports.length} szt., najwyżej ok. ${res.info.anchorLoad.toFixed(1).replace('.', ',')} kN na kotwę`],
    ['Kontrola ugięć przy', `podłoga ${String(s.loads.floor).replace('.', ',')} kN/m², dach ${String(s.loads.roof).replace('.', ',')} kN/m²`],
    ['Powierzchnia', `${((L * W) / 1e6).toFixed(2).replace('.', ',')} m²`],
    ['Ściana przód', `${Math.round(i.Tf - i.zf)}`],
    ['Ściana tył', `${Math.round(i.Tb - i.zf)}`],
    ['Najwyższy punkt', `${Math.round(i.topZ)} nad gruntem`],
    ['Krokwie', `${i.rafterX.length} × co ${Math.round(i.rafterSpacing)}`],
    ['Łaty', `${res.roof.battenRows.map((r) => r.length).join(' + ')} rzędów co ${Math.round(res.roof.slopes[0].battenSpacing)}`],
    ['Wrąb krokwi', `${Math.round(i.notch)} mm`],
  ];
  if (i.ridge) list.splice(4, 0, ['Kalenica (spód krokwi)', `${Math.round(i.ridge - i.zf)} od podłogi`]);
  return list;
}
