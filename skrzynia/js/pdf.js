// PDF export: jsPDF + svg2pdf.js loaded on demand, DejaVu Sans (from the frame page) for Polish characters.
import { viewSVG, boardSVG, PRINT_PALETTE, fmt } from './draw.js';

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
  doc.addFileToVFS('DejaVuSans.ttf', await fontB64('DejaVuSans.ttf'));
  doc.addFont('DejaVuSans.ttf', 'DejaVu', 'normal');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', await fontB64('DejaVuSans-Bold.ttf'));
  doc.addFont('DejaVuSans-Bold.ttf', 'DejaVu', 'bold');
  doc.setFont('DejaVu', 'normal');
  const P = PRINT_PALETTE, d = res.d;
  const PW = 297, PH = 210, M = 12;
  const title = `Skrzynia warsztatowa ${fmt(d.total.L)} × ${fmt(d.total.D)} × ${fmt(d.total.H)} mm`;
  let page = 0;
  const header = (sub) => {
    if (page++) doc.addPage();
    doc.setFont('DejaVu', 'bold'); doc.setFontSize(13); doc.setTextColor(29, 36, 32);
    doc.text(sub, M, M + 2);
    doc.setFont('DejaVu', 'normal'); doc.setFontSize(8); doc.setTextColor(95, 107, 100);
    doc.text(`${title} · drewniak · ${new Date().toLocaleDateString('pl-PL')}`, PW - M, M + 2, { align: 'right' });
    doc.text('Wstępny dobór konstrukcji z kontrolą rozsądku, nie projekt.', M, PH - 6);
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
    await (doc.svg ? doc.svg.bind(doc) : (e, o) => window.svg2pdf.svg2pdf(e, doc, o))(el, { x: x + (w - dw) / 2, y: y + (h - dh) / 2, width: dw, height: dh });
    host.remove();
  };
  // simple table with wrapped cells; returns the y after it, adds pages when needed
  const table = (head, rows, widths, y, sub) => {
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
    doc.setFontSize(8);
    row(head, true);
    rows.forEach((r) => row(r, false));
    return y + 4;
  };

  // 1. views
  header('Rzuty');
  await svgBox(viewSVG(res, 'front', P), M, M + 6, 140, 92);
  await svgBox(viewSVG(res, 'side', P), M + 142, M + 6, 131, 92);
  await svgBox(viewSVG(res, 'top', P), M, M + 100, 140, 86);
  doc.setFontSize(9);
  const facts = [
    `Korpus ${fmt(d.Lo)} × ${fmt(d.Do)} × ${fmt(d.H)} mm, całość ${fmt(d.total.L)} × ${fmt(d.total.D)} × ${fmt(d.total.H)} mm`,
    `Wnętrze ${fmt(d.inL)} × ${fmt(d.inD)} × ${fmt(d.inH)} mm`,
    `Deski ${state.boards.L}×${state.boards.W}×${state.boards.T} mm: ${res.layout.chest.used} z ${state.boards.N}, ${res.rips} cięć wzdłuż`,
    `Wczepy korpusu ${d.n} × ${n1(d.w)} mm; razem ${res.fingers.total} wczepów (ok. ${Math.round(res.fingers.hours)} h)`,
    `Cokół ${n1(d.skirt.h)} mm, fartuch ${n1(d.apron.h)} mm, uchwyty ${n1(d.handle.bot)}–${n1(d.handle.top)} mm`,
    `Masa pustej skrzyni ${n1(res.mass)} kg; trudność ${res.difficulty.level} / 5`,
    ...res.warnings, ...res.notes,
  ];
  doc.text(doc.splitTextToSize(facts.join('\n'), 125), M + 148, M + 108);

  // 2. sections and 3D
  header('Przekroje i model');
  await svgBox(viewSVG(res, 'secFront', P), M, M + 6, 140, 100);
  await svgBox(viewSVG(res, 'secSide', P), M + 142, M + 6, 131, 100);
  if (img3d) doc.addImage(img3d, 'JPEG', M + 60, M + 110, 120, 72);

  // 3. board layouts
  header('Rozkrój');
  let y = M + 8;
  const num = new Map(res.parts.map((p, i) => [p.key, i + 1]));
  const layouts = [[res.layout.chest, state.boards, 'Deska'], ...(res.layout.tray ? [[res.layout.tray, state.trayBoards, 'Deska na tace']] : [])];
  for (const [lay, stock, label] of layouts) for (const [i, b] of lay.boards.entries()) {
    if (!b.secs.length) continue;
    const h = Math.min(30, (PW - 2 * M) * (stock.W / stock.L) + 8);
    if (y + h + 6 > PH - 12) { header('Rozkrój'); y = M + 8; }
    doc.setFontSize(8); doc.text(`${label} ${i + 1}: odcinki ${b.secs.map((s, k) => `${String.fromCharCode(65 + k)} ${fmt(s.len)}`).join(', ')}`, M, y);
    await svgBox(boardSVG(b, stock, state.kerf, state.trim, (p) => num.get(p.key), P), M, y + 1, PW - 2 * M, h - 4);
    y += h + 2;
  }

  // 4. cut list
  header('Lista cięć');
  table(['Nr', 'Element', 'Szt.', 'Dł.', 'Szer.', 'Gr.', 'Uwagi'],
    res.parts.map((p, i) => [i + 1, p.name + (p.show ? ' (lico)' : ''), p.qty, n1(p.l), n1(p.w) + (p.final && p.final !== p.w ? ` → ${n1(p.final)}` : ''), p.t, [p.note, p.rip ? 'cięcie wzdłuż' : ''].filter(Boolean).join('; ')]),
    [10, 70, 12, 20, 26, 12, 123], M + 8, 'Lista cięć');

  // 5. fasteners, hardware, checks
  header('Łączniki, okucia, kontrole');
  y = table(['Połączenie', 'Łącznik', 'Rozmiar', 'Szt.', 'Jak'], res.fasteners.map((f) => [f.joint, f.item, f.size, f.qty, f.note]), [58, 50, 22, 12, 131], M + 8, 'Łączniki, okucia, kontrole');
  y = table(['Okucie i materiał', 'Rozmiar', 'Szt.', 'Uwagi'], res.hardware.map((h) => [h.item, h.size, h.qty, h.note]), [80, 60, 12, 121], y, 'Łączniki, okucia, kontrole');
  table(['Kontrola', 'Wynik', 'Granica', '', 'Założenia'], res.checks.map((c) => [c.name, `${n1(c.value)} ${c.unit}`, `${n1(c.limit)} ${c.unit}`, c.ok ? 'OK' : 'za dużo', c.detail + (c.hint ? ` — ${c.hint}` : '')]), [80, 28, 28, 16, 121], y, 'Łączniki, okucia, kontrole');

  // 6. work plan, tools, difficulty
  header('Plan pracy');
  y = table(['', 'Krok'], res.plan.map(([t, x], i) => [`${i + 1}. ${t}`, x]), [40, 233], M + 8, 'Plan pracy');
  y = table(['Narzędzia'], res.tools.map((t) => [t]), [273], y, 'Plan pracy');
  table(['Technika', 'Poziom'], [...res.difficulty.techniques.map(([t, l]) => [t, l]), [`Trudność całości`, `${res.difficulty.level} / 5`]], [233, 40], y, 'Plan pracy');

  doc.save(`skrzynia-${fmt(d.total.L)}x${fmt(d.total.D)}x${fmt(d.total.H)}.pdf`);
  return doc;
}
