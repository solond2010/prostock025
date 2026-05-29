// Genera un PDF de una página con el resumen del mes. jsPDF se importa de
// forma diferida para no cargarlo hasta que el usuario pulsa "Descargar".

export interface MonthlyReportData {
  monthLabel: string;        // "Mayo 2026"
  facturacion: number;       // suma de precios de venta reales del mes
  beneficio: number;         // beneficio real del mes
  ventas: number;            // nº de ventas
  margenMedio: number;       // % medio
  invertido: number;         // coste total de lo vendido
  top: { name: string; beneficio: number; precio: number }[]; // top ventas
}

const eur = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

export async function generateMonthlyReport(data: MonthlyReportData) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // 595
  const M = 40;                                  // margen

  const violet: [number, number, number] = [124, 58, 237];
  const green: [number, number, number] = [16, 160, 110];
  const red: [number, number, number] = [210, 60, 60];
  const ink: [number, number, number] = [30, 30, 38];
  const muted: [number, number, number] = [130, 130, 140];

  // ── Cabecera ──
  doc.setFillColor(...violet);
  doc.rect(0, 0, W, 96, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Flipr', M, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Informe mensual', M, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(data.monthLabel, W - M, 56, { align: 'right' });

  // ── Tarjetas KPI (2x2) ──
  const cards = [
    { label: 'Facturación', value: eur(data.facturacion), color: violet },
    { label: 'Beneficio', value: `${data.beneficio >= 0 ? '+' : ''}${eur(data.beneficio)}`, color: data.beneficio >= 0 ? green : red },
    { label: 'Ventas', value: String(data.ventas), color: ink },
    { label: 'Margen medio', value: `${data.margenMedio.toFixed(1)}%`, color: data.margenMedio >= 0 ? green : red },
  ];
  const gap = 16;
  const cardW = (W - M * 2 - gap) / 2;
  const cardH = 78;
  let y = 130;
  cards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (cardW + gap);
    const cy = y + row * (cardH + gap);
    doc.setDrawColor(230, 230, 235);
    doc.setFillColor(250, 250, 252);
    doc.roundedRect(x, cy, cardW, cardH, 8, 8, 'FD');
    doc.setTextColor(...muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(c.label.toUpperCase(), x + 16, cy + 26);
    doc.setTextColor(...(c.color as [number, number, number]));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(c.value, x + 16, cy + 56);
  });

  // ── Coste invertido (línea informativa) ──
  let cursor = y + 2 * cardH + gap + 28;
  doc.setTextColor(...muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Coste de lo vendido este mes: ${eur(data.invertido)}`, M, cursor);
  cursor += 28;

  // ── Top ventas ──
  doc.setTextColor(...ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Top ventas del mes', M, cursor);
  cursor += 10;
  doc.setDrawColor(230, 230, 235);
  doc.line(M, cursor, W - M, cursor);
  cursor += 22;

  if (data.top.length === 0) {
    doc.setTextColor(...muted);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.text('No hubo ventas este mes.', M, cursor);
  } else {
    data.top.slice(0, 8).forEach((p, i) => {
      doc.setTextColor(180, 180, 188);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${i + 1}`, M, cursor);
      doc.setTextColor(...ink);
      doc.setFont('helvetica', 'normal');
      const name = p.name.length > 52 ? p.name.slice(0, 52) + '…' : p.name;
      doc.text(name, M + 22, cursor);
      doc.setTextColor(...(p.beneficio >= 0 ? green : red));
      doc.setFont('helvetica', 'bold');
      doc.text(`${p.beneficio >= 0 ? '+' : ''}${eur(p.beneficio)}`, W - M, cursor, { align: 'right' });
      cursor += 22;
    });
  }

  // ── Pie ──
  const footY = doc.internal.pageSize.getHeight() - 30;
  doc.setTextColor(...muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const generado = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Generado el ${generado} · Flipr`, M, footY);

  const slug = data.monthLabel.toLowerCase().replace(/\s+/g, '-');
  doc.save(`Flipr-informe-${slug}.pdf`);
}
