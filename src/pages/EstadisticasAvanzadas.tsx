import { useState, useMemo } from 'react';
import {
  PieChart, TrendingUp, Package, DollarSign, Percent, ShoppingCart,
  Trophy, AlertTriangle, Search, Calendar, Receipt, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { useStockItems } from '@/hooks/useStockItems';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { HistoricSummaryCards } from '@/components/stock/HistoricSummaryCards';
import { StockSummary } from '@/types/stock';

// ── formatters ────────────────────────────────────────────────────────────────
const fmtEur = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtEur0 = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs shadow-lg">
      <p className="font-semibold mb-1 text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill ?? p.color }}>
          {fmtEur0(p.value)} · {p.payload.ventas} {p.payload.ventas === 1 ? 'venta' : 'ventas'}
        </p>
      ))}
    </div>
  );
}

const EstadisticasAvanzadas = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear]   = useState(currentDate.getFullYear());
  const [salesSearch, setSalesSearch]     = useState('');

  const { data: stockItems = [], isLoading } = useStockItems();

  const months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
  ];
  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - i);

  // ── Calculations ─────────────────────────────────────────────────────────────
  const calcCoste     = (i: typeof stockItems[0]) => i.purchase_price_per_unit + i.precio_envio + i.coste_reparacion;
  const calcBenReal   = (i: typeof stockItems[0]) => i.precio_venta_real - calcCoste(i);
  const calcMargen    = (i: typeof stockItems[0]) => i.precio_venta_real === 0 ? 0 : (calcBenReal(i) / i.precio_venta_real) * 100;

  const filteredSold = useMemo(() =>
    stockItems.filter(i => {
      if (i.estado !== 'Vendido' || !i.fecha_venta) return false;
      const d = parseISO(i.fecha_venta);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    }),
    [stockItems, selectedMonth, selectedYear]
  );

  const purchasedThisMonth = useMemo(() =>
    stockItems.filter(i => {
      const d = parseISO(i.purchase_date);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    }),
    [stockItems, selectedMonth, selectedYear]
  );

  const salesHistory = useMemo(() =>
    filteredSold
      .filter(i => !salesSearch || i.name.toLowerCase().includes(salesSearch.toLowerCase()))
      .sort((a, b) => parseISO(b.fecha_venta!).getTime() - parseISO(a.fecha_venta!).getTime()),
    [filteredSold, salesSearch]
  );

  const metrics = useMemo(() => {
    const n      = filteredSold.length;
    const totBen = filteredSold.reduce((s, i) => s + calcBenReal(i), 0);
    const avgBen = n > 0 ? totBen / n : 0;
    const avgTkt = n > 0 ? filteredSold.reduce((s, i) => s + i.precio_venta_real, 0) / n : 0;
    const avgMrg = n > 0 ? filteredSold.reduce((s, i) => s + calcMargen(i), 0) / n : 0;
    return { n, totBen, avgBen, avgTkt, avgMrg, purchased: purchasedThisMonth.length };
  }, [filteredSold, purchasedThisMonth]);

  const ranking = useMemo(() => {
    if (!filteredSold.length) return { best: null, worst: null, top5: [] as any[] };
    const sorted = filteredSold
      .map(i => ({ ...i, _ben: calcBenReal(i) }))
      .sort((a, b) => b._ben - a._ben);
    return { best: sorted[0], worst: sorted[sorted.length - 1], top5: sorted.slice(0, 5) };
  }, [filteredSold]);

  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; ben: number }> = {};
    filteredSold.forEach(i => {
      if (!map[i.category]) map[i.category] = { count: 0, ben: 0 };
      map[i.category].count += 1;
      map[i.category].ben   += calcBenReal(i);
    });
    return Object.entries(map)
      .map(([cat, d]) => ({ cat, count: d.count, ben: d.ben, avg: d.count ? d.ben / d.count : 0 }))
      .sort((a, b) => b.ben - a.ben);
  }, [filteredSold]);

  const monthlyHistory = useMemo(() => {
    const map: Record<string, { fac: number; ventas: number; month: number; year: number }> = {};
    stockItems.filter(i => i.estado === 'Vendido' && i.fecha_venta).forEach(i => {
      const d = parseISO(i.fecha_venta!);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { fac: 0, ventas: 0, month: d.getMonth() + 1, year: d.getFullYear() };
      map[key].fac    += i.precio_venta_real;
      map[key].ventas += 1;
    });
    return Object.entries(map)
      .map(([, d]) => ({
        label:  `${months.find(m => m.value === d.month)?.label.slice(0, 3)} ${d.year}`,
        full:   `${months.find(m => m.value === d.month)?.label} ${d.year}`,
        facturacion: d.fac,
        ventas: d.ventas,
        month:  d.month,
        year:   d.year,
      }))
      .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
  }, [stockItems, months]);

  const chartData = useMemo(() => [...monthlyHistory].reverse().slice(-12), [monthlyHistory]);

  const historicSummary = useMemo<StockSummary>(() => {
    let inv = 0, rev = 0, realProfit = 0;
    stockItems.forEach(i => {
      const c = calcCoste(i);
      inv += c;
      rev += Number(i.sale_price_per_unit);
      if (i.estado === 'Vendido') realProfit += Number(i.precio_venta_real) - c;
    });
    const expProfit = rev - inv;
    return {
      totalInvested: inv,
      totalExpectedRevenue: rev,
      totalExpectedProfit: expProfit,
      totalRealProfit: realProfit,
      profitMargin: rev > 0 ? (expProfit / rev) * 100 : 0,
    };
  }, [stockItems]);

  const getMonthName = () => months.find(m => m.value === selectedMonth)?.label ?? '';

  // ── Month KPI cards definition ─────────────────────────────────────────────
  const monthKpis = [
    {
      label: 'Productos vendidos',
      value: metrics.n,
      fmt: (v: number) => v.toString(),
      icon: Package,
      accent: 'hsl(262 73% 58%)',
      accentBg: 'hsl(262 73% 58% / 0.1)',
      trend: null as 'up' | 'down' | null,
      sub: `${metrics.purchased} comprados este mes`,
    },
    {
      label: 'Beneficio real total',
      value: metrics.totBen,
      fmt: fmtEur,
      icon: DollarSign,
      accent: metrics.totBen >= 0 ? 'hsl(160 84% 38%)' : 'hsl(0 72% 51%)',
      accentBg: metrics.totBen >= 0 ? 'hsl(160 84% 38% / 0.1)' : 'hsl(0 72% 51% / 0.1)',
      trend: (metrics.totBen >= 0 ? 'up' : 'down') as 'up' | 'down' | null,
      sub: `${metrics.n} ventas en ${getMonthName()}`,
    },
    {
      label: 'Beneficio medio',
      value: metrics.avgBen,
      fmt: fmtEur,
      icon: TrendingUp,
      accent: metrics.avgBen >= 0 ? 'hsl(160 84% 38%)' : 'hsl(0 72% 51%)',
      accentBg: metrics.avgBen >= 0 ? 'hsl(160 84% 38% / 0.1)' : 'hsl(0 72% 51% / 0.1)',
      trend: (metrics.avgBen >= 0 ? 'up' : 'down') as 'up' | 'down' | null,
      sub: 'por unidad vendida',
    },
    {
      label: 'Ticket medio',
      value: metrics.avgTkt,
      fmt: fmtEur,
      icon: ShoppingCart,
      accent: 'hsl(217 91% 60%)',
      accentBg: 'hsl(217 91% 60% / 0.1)',
      trend: null as 'up' | 'down' | null,
      sub: 'precio de venta promedio',
    },
    {
      label: 'Margen medio',
      value: metrics.avgMrg,
      fmt: (v: number) => `${v.toFixed(1)}%`,
      icon: Percent,
      accent: metrics.avgMrg >= 0 ? 'hsl(38 92% 50%)' : 'hsl(0 72% 51%)',
      accentBg: metrics.avgMrg >= 0 ? 'hsl(38 92% 50% / 0.1)' : 'hsl(0 72% 51% / 0.1)',
      trend: (metrics.avgMrg >= 0 ? 'up' : 'down') as 'up' | 'down' | null,
      sub: 'sobre precio de venta',
    },
    {
      label: 'Comprados este mes',
      value: metrics.purchased,
      fmt: (v: number) => v.toString(),
      icon: Package,
      accent: 'hsl(188 84% 40%)',
      accentBg: 'hsl(188 84% 40% / 0.1)',
      trend: null as 'up' | 'down' | null,
      sub: 'nuevas entradas al stock',
    },
  ];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-6 space-y-5">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-6 space-y-6">

      {/* ── Header ── */}
      <PageHeader
        icon={PieChart}
        title="Estadísticas"
        iconColor="violet"
        subtitle="Métricas detalladas por mes"
        actions={
          <div className="flex items-center gap-2">
            <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[90px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* ── Histórico total ── */}
      <HistoricSummaryCards summary={historicSummary} />

      {/* ── KPIs del mes ── */}
      <div>
        <h3 className="mb-3 text-[9px] font-bold tracking-[0.12em] text-muted-foreground/40 uppercase">
          {getMonthName().toUpperCase()} {selectedYear}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
          {monthKpis.map((kpi, i) => (
            <div key={kpi.label} className={`kpi-card animate-slide-up-${Math.min(i + 1, 4)} cursor-default`}>
              <div className="h-[3px] w-full rounded-t-xl" style={{ background: kpi.accent }} />
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-1 mb-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                    style={{ background: kpi.accentBg }}>
                    <kpi.icon className="h-[15px] w-[15px]" style={{ color: kpi.accent }} />
                  </div>
                  {kpi.trend === 'up'   && <ArrowUpRight   className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />}
                  {kpi.trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />}
                </div>
                <p className="text-[10px] font-medium text-muted-foreground leading-snug mb-1">{kpi.label}</p>
                <p
                  className="stat-number font-bold leading-tight break-all"
                  style={{ color: kpi.accent, fontSize: 'clamp(1rem, 1.8vw, 1.45rem)' }}
                >
                  {kpi.fmt(kpi.value)}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5 leading-snug">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ranking del mes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mejor */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden animate-slide-up">
          <div className="h-[3px]" style={{ background: 'hsl(160 84% 38%)' }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/12">
                <Trophy className="h-[18px] w-[18px] text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold">Producto más rentable</p>
                <p className="text-[10px] text-muted-foreground">{getMonthName()} {selectedYear}</p>
              </div>
            </div>
            {ranking.best ? (
              <div>
                <p className="text-lg font-bold leading-snug">{ranking.best.name}</p>
                <p className="text-xs text-muted-foreground mb-3">{ranking.best.category}</p>
                <p className="stat-number text-2xl font-bold" style={{ color: 'hsl(160 84% 38%)' }}>
                  +{fmtEur(ranking.best._ben)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sin datos para este periodo</p>
            )}
          </div>
        </div>

        {/* Peor */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden animate-slide-up-2">
          <div className="h-[3px]" style={{ background: ranking.worst?._ben < 0 ? 'hsl(0 72% 51%)' : 'hsl(38 92% 50%)' }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/12">
                <AlertTriangle className="h-[18px] w-[18px] text-destructive" />
              </div>
              <div>
                <p className="text-sm font-bold">Peor producto del mes</p>
                <p className="text-[10px] text-muted-foreground">{getMonthName()} {selectedYear}</p>
              </div>
            </div>
            {ranking.worst ? (
              <div>
                <p className="text-lg font-bold leading-snug">{ranking.worst.name}</p>
                <p className="text-xs text-muted-foreground mb-3">{ranking.worst.category}</p>
                <p
                  className="stat-number text-2xl font-bold"
                  style={{ color: ranking.worst._ben >= 0 ? 'hsl(160 84% 38%)' : 'hsl(0 72% 51%)' }}
                >
                  {ranking.worst._ben >= 0 ? '+' : ''}{fmtEur(ranking.worst._ben)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sin datos para este periodo</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Top 5 + Categorías ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 */}
        <Card className="border-border/60 animate-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top 5 productos por beneficio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ranking.top5.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="pl-5 text-[11px]">Producto</TableHead>
                    <TableHead className="text-right text-[11px]">Beneficio</TableHead>
                    <TableHead className="text-right pr-5 text-[11px]">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.top5.map((item, idx) => (
                    <TableRow key={item.id} className="table-row-premium">
                      <TableCell className="pl-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground/40 w-4">#{idx + 1}</span>
                          <div>
                            <p className="text-xs font-semibold leading-snug">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <span
                          className="text-xs font-bold tabular-nums"
                          style={{ color: item._ben >= 0 ? 'hsl(160 84% 38%)' : 'hsl(0 72% 51%)' }}
                        >
                          {item._ben >= 0 ? '+' : ''}{fmtEur0(item._ben)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-5 py-3 text-[11px] text-muted-foreground">
                        {item.fecha_venta ? format(parseISO(item.fecha_venta), 'dd MMM', { locale: es }) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10 px-5">Sin productos vendidos este periodo</p>
            )}
          </CardContent>
        </Card>

        {/* Categorías */}
        <Card className="border-border/60 animate-slide-up-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Por categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {categoryStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="pl-5 text-[11px]">Categoría</TableHead>
                    <TableHead className="text-right text-[11px]">Uds</TableHead>
                    <TableHead className="text-right text-[11px]">Beneficio</TableHead>
                    <TableHead className="text-right pr-5 text-[11px]">Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryStats.map(s => (
                    <TableRow key={s.cat} className="table-row-premium">
                      <TableCell className="pl-5 py-3 text-xs font-semibold">{s.cat}</TableCell>
                      <TableCell className="text-right py-3 text-xs tabular-nums">{s.count}</TableCell>
                      <TableCell className="text-right py-3">
                        <span className="text-xs font-bold tabular-nums"
                          style={{ color: s.ben >= 0 ? 'hsl(160 84% 38%)' : 'hsl(0 72% 51%)' }}>
                          {s.ben >= 0 ? '+' : ''}{fmtEur0(s.ben)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-5 py-3 text-xs tabular-nums text-muted-foreground">
                        {fmtEur0(s.avg)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10 px-5">Sin datos este periodo</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Facturación mensual ── */}
      <Card className="border-border/60 animate-slide-up">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/12">
              <Receipt className="h-[15px] w-[15px] text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Facturación mensual</CardTitle>
              <p className="text-[10px] text-muted-foreground">Ingresos totales por mes (histórico)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {monthlyHistory.length > 0 ? (
            <div className="space-y-5">
              {chartData.length > 1 && (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                    <Bar dataKey="facturacion" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i}
                          fill="hsl(var(--primary))"
                          opacity={i === chartData.length - 1 ? 1 : 0.45 + (i / chartData.length) * 0.45}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-[11px]">Mes</TableHead>
                    <TableHead className="text-right text-[11px]">Ventas</TableHead>
                    <TableHead className="text-right text-[11px]">Facturación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyHistory.map(item => (
                    <TableRow key={`${item.year}-${item.month}`} className="table-row-premium">
                      <TableCell className="py-2.5 text-xs font-medium">{item.full}</TableCell>
                      <TableCell className="text-right py-2.5 text-xs tabular-nums">{item.ventas}</TableCell>
                      <TableCell className="text-right py-2.5 text-xs font-bold tabular-nums text-primary">
                        {fmtEur0(item.facturacion)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-xs font-medium text-muted-foreground">Total histórico</span>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {fmtEur0(monthlyHistory.reduce((s, i) => s + i.facturacion, 0))}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aún no hay ventas registradas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Historial de ventas del mes ── */}
      <Card className="border-border/60 animate-slide-up">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/12">
                <Calendar className="h-[15px] w-[15px] text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Ventas del mes</CardTitle>
                <p className="text-[10px] text-muted-foreground">{getMonthName()} {selectedYear}</p>
              </div>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar producto..."
                value={salesSearch}
                onChange={e => setSalesSearch(e.target.value)}
                className="pl-9 h-8 text-xs rounded-xl"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {salesHistory.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="pl-5 text-[11px]">Fecha</TableHead>
                    <TableHead className="text-[11px]">Producto</TableHead>
                    <TableHead className="hidden sm:table-cell text-[11px]">Categoría</TableHead>
                    <TableHead className="text-right text-[11px]">Venta</TableHead>
                    <TableHead className="text-right text-[11px]">Coste</TableHead>
                    <TableHead className="text-right pr-5 text-[11px]">Beneficio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesHistory.map(item => {
                    const coste = calcCoste(item);
                    const ben   = calcBenReal(item);
                    return (
                      <TableRow key={item.id} className="table-row-premium">
                        <TableCell className="pl-5 py-3 text-[11px] text-muted-foreground whitespace-nowrap">
                          {item.fecha_venta ? format(parseISO(item.fecha_venta), 'dd MMM yyyy', { locale: es }) : '—'}
                        </TableCell>
                        <TableCell className="py-3 text-xs font-semibold">{item.name}</TableCell>
                        <TableCell className="hidden sm:table-cell py-3 text-xs text-muted-foreground">{item.category}</TableCell>
                        <TableCell className="text-right py-3 text-xs tabular-nums">{fmtEur(item.precio_venta_real)}</TableCell>
                        <TableCell className="text-right py-3 text-xs tabular-nums text-muted-foreground">{fmtEur(coste)}</TableCell>
                        <TableCell className="text-right pr-5 py-3">
                          <span
                            className="text-xs font-bold tabular-nums"
                            style={{ color: ben >= 0 ? 'hsl(160 84% 38%)' : 'hsl(0 72% 51%)' }}
                          >
                            {ben >= 0 ? '+' : ''}{fmtEur(ben)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="px-5 py-3 border-t border-border/40">
                <p className="text-[11px] text-muted-foreground">
                  {salesHistory.length} {salesHistory.length === 1 ? 'venta' : 'ventas'} · {getMonthName()} {selectedYear}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-14">
              <Calendar className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">No hay ventas en este mes</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default EstadisticasAvanzadas;
