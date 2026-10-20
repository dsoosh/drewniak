// PDF export: jsPDF + svg2pdf.js loaded on demand, DejaVu Sans (from the frame page). The marking
// templates go on A4 portrait pages at exactly 1:1 (jsPDF units are millimetres).
import { viewSVG, templateSVG, boardSVG, PRINT_PALETTE, fmt } from './draw.js';
import { LIDS } from './build.js';

const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/svg2pdf.js@2.2.3/dist/svg2pdf.umd.min.js',
];
const n1 = (v) => fmt(v, 1);

function loadScript(src) {
  return new Promise((ok, fail) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => fail(new Error(`nie wczytano ${src}`));
    document.head.appendChild(s);
  });
}
async function fontB64(name) {
  const buf = await (await fetch(new URL(`../../szkielet/fonts/${name}`, import.meta.url))).arrayBuffer();
  let bin = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export async function makePdf(res, state, img3d) {
  for (const src of LIBS) await loadScript(src);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.addFileToVFS('DejaVuSans.ttf', await fontB64('DejaVuSans.ttf')); doc.addFont('DejaVuSans.ttf', 'DejaVu', 'normal');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', await fontB64('DejaVuSans-Bold.ttf')); doc.addFont('DejaVuSans-Bold.ttf', 'DejaVu', 'bold');
  doc.setFont('DejaVu', 'normal');
  const P = PRINT_PALETTE, d = res.d, M = 12;
  const title = `Pudełko ${fmt(d.total.L)} × ${fmt(d.total.D)} × ${fmt(d.total.H)} mm, ${LIDS[d.lid].toLowerCase()}`;
  let page = 0;
  const header = (sub, orient = 'landscape') => {
    if (page++) doc.addPage('a4', orient);
    const PW = orient === 'landscape' ? 297 : 210, PH = orient === 'landscape' ? 210 : 297;
    doc.setFont('DejaVu', 'bold'); doc.setFontSize(13); doc.setTextColor(29, 36, 32); doc.text(sub, M, M + 2);
    doc.setFont('DejaVu', 'normal'); doc.setFontSize(8); doc.setTextColor(95, 107, 100);
    doc.text(`${title} · drewniak · ${new Date().toLocaleDateString('pl-PL')}`, PW - M, M + 2, { align: 'right' });
    doc.text('Wstępny dobór konstrukcji z kontrolą rozsądku, nie projekt.', M, PH - 6);
    doc.text(String(page), PW - M, PH - 6, { align: 'right' });
    doc.setTextColor(29, 36, 32);
    return { PW, PH };
  };
  const svgAt = async (svgText, x, y, w, h, exact = false) => {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-99999px;top:0;width:1200px';
    host.innerHTML = svgText; document.body.appendChild(host);
    const el = host.querySelector('svg');
    const [, , vw, vh] = el.getAttribute('viewBox').split(' ').map(Number);
    const k = exact ? 1 : Math.min(w / vw, h / vh), dw = vw * k, dh = vh * k;
    await (doc.svg ? doc.svg.bind(doc) : (e, o) => window.svg2pdf.svg2pdf(e, doc, o))(el, { x: exact ? x : x + (w - dw) / 2, y: exact ? y : y + (h - dh) / 2, width: dw, height: dh });
    host.remove();
  };
  const table = (head, rows, widths, y, sub, PH = 210) => {
    const lh = 4.2;
    const row = (cells, bold) => {
      doc.setFont('DejaVu', bold ? 'bold' : 'normal');
      const wrapped = cells.map((c, i) => doc.splitTextToSize(String(c ?? ''), widths[i] - 2));
      const h = Math.max(...wrapped.map((w) => w.length)) * lh + 1.5;
      if (y + h > PH - 12) { header(sub); y = M + 10; }
      let x = M;
      wrapped.forEach((w, i) => { doc.text(w, x + 1, y + lh - 0.6); x += widths[i]; });
      doc.setDrawColor(201, 208, 201); doc.setLineWidth(0.15); doc.line(M, y + h - 0.5, M + widths.reduce((a, b) => a + b, 0), y + h - 0.5);
      y += h;
    };
    doc.setFontSize(8); row(head, true); rows.forEach((r) => row(r, false));
    return y + 4;
  };

  header('Rzuty');
  await svgAt(viewSVG(res, 'front', P), M, M + 6, 135, 90);
  await svgAt(viewSVG(res, 'side', P), M + 140, M + 6, 130, 90);
  await svgAt(viewSVG(res, 'top', P), M, M + 100, 135, 86);
  if (img3d) doc.addImage(img3d, 'JPEG', M + 150, M + 104, 110, 66);
  doc.setFontSize(9);
  doc.text(doc.splitTextToSize([`Korpus ${fmt(d.Lo)} × ${fmt(d.Do)} × ${fmt(d.H)} mm, ${d.n} wczepów po ${n1(d.w)} mm, deska ${d.T} mm`,
    `Rowki ${d.g} × ${n1(d.bottom.d)} mm; razem ${res.fingers.total} wczepów, ok. ${Math.round(res.fingers.hours)} h; trudność ${res.difficulty.level} / 5`, ...res.warnings, ...res.notes].join('\n'), 120), M + 150, M + 176);

  // marking templates, 1:1
  for (const t of res.templates) {
    header(`Szablon 1:1 — ${t.name}`, 'portrait');
    doc.setFontSize(9);
    doc.text('Drukuj w skali 100% (bez dopasowania do strony). Pasek kontrolny musi mieć 100 mm.', M, M + 9);
    await svgAt(templateSVG(t, d.T, P), M, M + 16, 0, 0, true);
  }

  header('Rozkrój');
  let y = M + 8;
  const num = new Map(res.parts.map((p, i) => [p.key, i + 1]));
  for (const [i, b] of res.layout.boards.entries()) {
    if (!b.secs.length) continue;
    const h = Math.min(40, (297 - 2 * M) * (state.boards.W / state.boards.L) + 8);
    if (y + h + 6 > 198) { header('Rozkrój'); y = M + 8; }
    doc.setFontSize(8); doc.text(`Deska ${i + 1}: odcinki ${b.secs.map((s, k) => `${String.fromCharCode(65 + k)} ${fmt(s.len)}`).join(', ')}`, M, y);
    await svgAt(boardSVG(b, state.boards, state.kerf, state.trim, (p) => (p.wallStrip ? '1–4' : num.get(p.key)), P), M, y + 1, 297 - 2 * M, h - 4);
    y += h + 2;
  }
  header('Lista cięć i materiały');
  y = table(['Nr', 'Element', 'Szt.', 'Dł.', 'Szer.', 'Gr.', 'Uwagi'], res.parts.map((p, i) => [i + 1, p.name + (p.show ? ' (lico)' : ''), p.qty, n1(p.l), n1(p.w) + (p.final && p.final !== p.w ? ` → ${n1(p.final)}` : ''), n1(p.t), [p.note, p.rip ? 'cięcie wzdłuż' : ''].filter(Boolean).join('; ')]), [10, 62, 12, 20, 26, 12, 131], M + 8, 'Lista cięć i materiały');
  y = table(['Materiał', 'Rozmiar', 'Szt.', 'Uwagi'], res.hardware.map((h) => [h.item, h.size, h.qty, h.note]), [90, 60, 12, 111], y, 'Lista cięć i materiały');
  table(['Kontrola', 'Wynik', 'Granica', '', 'Założenia'], res.checks.map((c) => [c.name, `${n1(c.value)} mm`, `${n1(c.limit)} mm`, c.ok ? 'OK' : 'za dużo', c.detail]), [70, 25, 25, 16, 137], y, 'Lista cięć i materiały');
  header('Plan pracy');
  y = table(['', 'Krok'], res.plan.map(([t, x], i) => [`${i + 1}. ${t}`, x]), [42, 231], M + 8, 'Plan pracy');
  table(['Narzędzia'], res.tools.map((t) => [t]), [273], y, 'Plan pracy');
  doc.save(`pudelko-${d.lid}-${fmt(d.total.L)}x${fmt(d.total.D)}x${fmt(d.total.H)}.pdf`);
  return doc;
}
