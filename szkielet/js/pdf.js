// PDF export: jsPDF + svg2pdf.js loaded on demand, DejaVu Sans for Polish characters.
import { WALL_IDS, SECTIONS } from './model.js';
const halves = (n) => (n === 1 ? 'połówkę' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'połówki' : 'połówek');
import { elevationSVG, planSVG, roofSVG, PRINT_PALETTE } from './draw.js';
import { facts } from './report.js';

const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/svg2pdf.js@2.2.3/dist/svg2pdf.umd.min.js',
];
const R = Math.round;
const fmt = (n) => R(n).toLocaleString('pl-PL').replace(/ /g, ' ');

function loadScript(src) {
  return new Promise((ok, fail) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => fail(new Error(`nie wczytano ${src}`));
    document.head.appendChild(s);
  });
}

async function fontB64(name) {
  const buf = await (await fetch(new URL(`../fonts/${name}`, import.meta.url))).arrayBuffer();
  let bin = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const dbg = (...a) => window.__pdfDebug && console.log('[pdf]', Math.round(performance.now()), ...a);

export async function makePdf(res, rep, state, img3d) {
  dbg('start');
  for (const src of LIBS) await loadScript(src);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.addFileToVFS('DejaVuSans.ttf', await fontB64('DejaVuSans.ttf'));
  doc.addFont('DejaVuSans.ttf', 'DejaVu', 'normal');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', await fontB64('DejaVuSans-Bold.ttf'));
  doc.addFont('DejaVuSans-Bold.ttf', 'DejaVu', 'bold');
  doc.setFont('DejaVu', 'normal');
  dbg('fonts');

  const PW = 297, PH = 210, M = 12;
  const { L, W } = state.dims;
  const title = `Szkielet ${fmt(L)} × ${fmt(W)} mm, dach ${state.roof.type === 'mono' ? 'jednospadowy' : 'dwuspadowy'} ${String(state.roof.pitch).replace('.', ',')}°`;
  let page = 0;
  const header = (sub) => {
    if (page++) doc.addPage();
    doc.setFont('DejaVu', 'bold'); doc.setFontSize(13); doc.setTextColor(29, 36, 32);
    doc.text(sub, M, M + 2);
    doc.setFont('DejaVu', 'normal'); doc.setFontSize(8); doc.setTextColor(95, 107, 100);
    doc.text(`${title} · drewniak · ${new Date().toLocaleDateString('pl-PL')}`, PW - M, M + 2, { align: 'right' });
    doc.text('Wstępny dobór konstrukcji, nie projekt budowlany.', M, PH - 6);
    doc.text(String(page), PW - M, PH - 6, { align: 'right' });
    doc.setTextColor(29, 36, 32);
  };
  const svgBox = async (svgText, x, y, w, h) => {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-99999px;top:0;width:1200px';
    host.innerHTML = svgText;
    document.body.appendChild(host);
    const el = host.querySelector('svg');
    const [, , vw, vh] = el.getAttribute('viewBox').split(' ').map(Number);
    const k = Math.min(w / vw, h / vh), dw = vw * k, dh = vh * k;
    el.removeAttribute('width'); el.removeAttribute('height');
    await (doc.svg ? doc.svg.bind(doc) : (e, o) => window.svg2pdf.svg2pdf(e, doc, o))(el, { x: x + (w - dw) / 2, y: y + (h - dh) / 2, width: dw, height: dh });
    host.remove();
    dbg('svg', el.querySelectorAll('*').length);
  };
  const table = (rows, cols, x, y, widths, opts = {}) => {
    const lh = opts.lh || 5;
    doc.setFontSize(opts.fs || 8.5);
    let cy = y;
    const line = (cells, bold, fill) => {
      doc.setFont('DejaVu', bold ? 'bold' : 'normal');
      const span = opts.span && cells.slice(1).every((c) => c === '');
      // wrap each cell; the row is as tall as its longest cell
      const wrapped = span ? [[String(cells[0])]] : cells.map((c, i) => doc.splitTextToSize(String(c), widths[i] - 2));
      const n = Math.max(...wrapped.map((w) => w.length)), rh = lh * 0.82 * (n - 1) + lh;
      if (cy + rh - lh > PH - 16) { header(opts.cont || 'ciąg dalszy'); cy = M + 10; doc.setFont('DejaVu', bold ? 'bold' : 'normal'); doc.setFontSize(opts.fs || 8.5); }
      if (fill) { doc.setFillColor(237, 240, 234); doc.rect(x, cy - lh + 1.4, widths.reduce((a, b) => a + b, 0), rh, 'F'); }
      let cx = x;
      wrapped.forEach((lines, i) => {
        const right = !span && cols[i] === 'n';
        lines.forEach((t, k) => doc.text(t, right ? cx + widths[i] - 1.5 : cx + 1, cy + k * lh * 0.82, right ? { align: 'right' } : {}));
        cx += widths[i];
      });
      cy += rh;
    };
    for (const r of rows) line(r.cells, r.bold, r.fill);
    doc.setFont('DejaVu', 'normal');
    return cy;
  };

  // 1. summary
  header(title);
  const order = [];
  for (const t of rep.timber) order.push([`${t.name} × ${fmt(t.buyLen)}`, `${t.count} szt.`, `${t.pieces} el., odpad ${(t.waste / 1000).toFixed(1).replace('.', ',')} m`]);
  if (rep.wall) order.push([`${rep.wall.name} na ściany`, `${rep.wall.count} płyt`, `${rep.wall.area.toFixed(1).replace('.', ',')} m² po docięciu`]);
  order.push([rep.floor.name, `${rep.floor.count} płyt`, `${rep.floor.area.toFixed(1).replace('.', ',')} m²`]);
  for (const c of rep.cover) order.push([c.name, `${c.count} ark.`, `${state.roof.cover.len}×${state.roof.cover.wid}`]);
  for (const e of rep.extras) order.push([e.name, `${e.qty} ${e.unit}`, '']);
  order.push(['Koszt materiału (szacunek)', `${fmt(rep.cost.total)} zł`, 'szczegóły na stronie 2']);
  doc.setFont('DejaVu', 'bold'); doc.setFontSize(10); doc.text('Do zamówienia', M, M + 12);
  let y = table([{ cells: ['Pozycja', 'Ilość', 'Uwagi'], bold: true, fill: true }, ...order.map((r) => ({ cells: r }))], ['t', 'n', 't'], M, M + 18, [68, 20, 56]);
  y += 4;
  doc.setFont('DejaVu', 'bold'); doc.setFontSize(10); doc.text('Wymiary', M, y); y += 6;
  y = table(facts(res, state).map(([k, v]) => ({ cells: [k, v] })), ['t', 't'], M, y, [52, 90]);
  if (img3d) doc.addImage(img3d, 'JPEG', 160, M + 8, 125, 78);
  let yr = M + 92;
  doc.setFont('DejaVu', 'bold'); doc.setFontSize(10); doc.text('Kontrola ugięć (L/300)', 160, yr); yr += 6;
  yr = table([{ cells: ['Element', 'Ugięcie', 'Dop.', ''], bold: true, fill: true }, ...res.checks.map((c) => ({ cells: [c.name, `${c.d.toFixed(1)} mm`, `${c.lim.toFixed(1)} mm`, c.ok ? 'OK' : 'ZA DUŻE'] }))], ['t', 'n', 'n', 't'], 160, yr, [70, 18, 18, 19], { fs: 7.5, lh: 4.4 });
  if (res.warnings.length) {
    yr += 3; doc.setFont('DejaVu', 'bold'); doc.setFontSize(9); doc.setTextColor(180, 68, 42); doc.text('Ostrzeżenia', 160, yr); yr += 5;
    doc.setFont('DejaVu', 'normal'); doc.setFontSize(7.5);
    for (const w of res.warnings) { const lines = doc.splitTextToSize(`• ${w}`, 125); doc.text(lines, 160, yr); yr += lines.length * 3.6; }
    doc.setTextColor(29, 36, 32);
  }

  // cost estimate
  header('Koszt materiału (ceny orientacyjne 2026)');
  const c = rep.cost;
  y = table([{ cells: ['Pozycja', 'Ilość', 'Cena', 'Razem', 'Udział'], bold: true, fill: true },
    ...c.items.map((i) => ({ cells: [i.name, `${i.qty} ${i.unit}`, `${fmt(i.price)} zł`, `${fmt(i.sum)} zł`, `${Math.round((i.sum / c.total) * 100)}%`] })),
    { cells: ['Razem', '', '', `${fmt(c.total)} zł`, ''], bold: true, fill: true }], ['t', 'n', 'n', 'n', 'n'], M, M + 12, [120, 30, 30, 34, 22]);
  doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize(`Z kotwami gruntowymi w cenie 120–150 zł: ${fmt(c.min)}–${fmt(c.max)} zł. Nie wliczone: ${c.excluded.join(', ')}.`, 236), M, y + 4);

  // 2. drawings
  const P = PRINT_PALETTE;
  header('Rzut podłogi: rama, legary, ściany, ścianki działowe');
  await svgBox(planSVG(res, state, { pal: P }), M, M + 6, PW - 2 * M, PH - 2 * M - 10);
  header('Dach: krokwie, łaty, arkusze pokrycia');
  await svgBox(roofSVG(res, state, { pal: P }), M, M + 6, PW - 2 * M, PH - 2 * M - 10);
  for (const id of [...WALL_IDS, ...state.partitions.map((p) => p.id)]) {
    if (res.walls[id].sheetsIn?.length) {
      header(`${res.walls[id].name}: od środka`);
      await svgBox(elevationSVG(res, state, id, { pal: P, sheathing: true, inside: true }), M, M + 6, PW - 2 * M, PH - 2 * M - 10);
    }
    header(`${res.walls[id].name}: szkielet i poszycie, widok z zewnątrz`);
    await svgBox(elevationSVG(res, state, id, { pal: P, sheathing: true }), M, M + 6, PW - 2 * M, PH - 2 * M - 10);
  }

  // 3. cut list
  header('Lista cięć');
  const rows = [{ cells: ['Szt.', 'Długość', 'Element', 'Uwagi'], bold: true, fill: true }];
  let last = '';
  for (const g of rep.cuts) {
    if (g.sec !== last) { rows.push({ cells: [SECTIONS[g.sec].name, '', '', ''], bold: true, fill: true }); last = g.sec; }
    rows.push({ cells: [`${g.count}×`, fmt(g.len), g.name, g.note] });
  }
  table(rows, ['n', 'n', 't', 't'], M, M + 12, [16, 22, 70, 160], { cont: 'Lista cięć, ciąg dalszy', lh: 4.6, span: true });

  // 4. bars
  header('Rozkrój drewna');
  y = M + 12;
  for (const t of rep.timber) {
    if (y > PH - 30) { header('Rozkrój drewna, ciąg dalszy'); y = M + 12; }
    doc.setFont('DejaVu', 'bold'); doc.setFontSize(9.5); doc.text(t.unit ? `${SECTIONS[t.sec].name}: ${t.beams} × belka 13 m, kupujesz ${t.count} ${halves(t.count)} po ${fmt(t.unit)} mm` : `${t.name}: ${t.count} szt. po ${fmt(t.stock)} mm`, M, y); y += 4;
    t.bars.forEach((b, i) => {
      if (y > PH - 18) { header('Rozkrój drewna, ciąg dalszy'); y = M + 12; }
      const k = (PW - 2 * M - 10) / t.stock;
      doc.setFont('DejaVu', 'bold'); doc.setFontSize(7.5); doc.text(String(i + 1), M + 6, y + 3.6, { align: 'right' });
      doc.setFillColor(205, 212, 203); doc.rect(M + 8, y, t.stock * k, 5, 'F');
      doc.setFont('DejaVu', 'normal'); doc.setFontSize(6.5);
      for (const p of b.pieces) {
        doc.setFillColor(221, 185, 128); doc.setDrawColor(29, 36, 32); doc.setLineWidth(0.15);
        doc.rect(M + 8 + p.x * k, y, p.len * k, 5, 'FD');
        if (p.len * k > 9) doc.text(String(p.len), M + 8 + (p.x + p.len / 2) * k, y + 3.5, { align: 'center' });
      }
      doc.text(`zostaje ${fmt(b.waste)}${t.unit && b.units === 1 ? ' (kupujesz połowę)' : ''}`, M + 8 + t.stock * k, y + 7.8, { align: 'right' });
      y += 9.5;
    });
    y += 3;
  }

  // 5. sheets
  const sheetPages = (pk, st, name) => {
    if (!pk) return;
    header(`Rozkrój płyt: ${name}, ${pk.count} × ${pk.name}`);
    const cw = 28, ch = cw * (st.h / st.w), gap = 6;
    let x = M, yy = M + 10;
    pk.sheets.forEach((sh, i) => {
      if (x + cw > PW - M) { x = M; yy += ch + 16; }
      if (yy + ch > PH - 12) { header(`Rozkrój płyt: ${name}, ciąg dalszy`); x = M; yy = M + 10; }
      const k = cw / st.w;
      doc.setFillColor(205, 212, 203); doc.rect(x, yy, cw, ch, 'F');
      doc.setFontSize(6.5);
      for (const it of sh.items) {
        doc.setFillColor(217, 180, 106); doc.setDrawColor(29, 36, 32); doc.setLineWidth(0.2);
        doc.rect(x + it.x * k, yy + it.y * k, it.w * k, it.h * k, 'FD');
        if (Math.min(it.w, it.h) * k > 5) { doc.setFont('DejaVu', 'bold'); doc.text(it.label, x + (it.x + it.w / 2) * k, yy + (it.y + it.h / 2) * k + 1, { align: 'center' }); }
      }
      doc.setFont('DejaVu', 'normal'); doc.setFontSize(6);
      doc.text(doc.splitTextToSize(`${i + 1}. ${sh.items.map((it) => `${it.label} ${R(it.w)}×${R(it.h)}`).join(', ')}`, cw), x, yy + ch + 3.5);
      x += cw + gap;
    });
  };
  sheetPages(rep.wall, state.stock.osbWall, 'ściany z zewnątrz');
  sheetPages(rep.wallIn, state.stock.osbWall, 'od środka i ścianki');
  sheetPages(rep.floor, state.stock.osbFloor, 'podłoga');

  dbg('save');
  if (window.__pdfDebug) window.__pdfData = doc.output('datauristring');
  doc.save(`szkielet-${L}x${W}.pdf`);
}

