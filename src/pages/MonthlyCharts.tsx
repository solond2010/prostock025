import { useState, useMemo } from 'react';
import { useStockItems } from '@/hooks/useStockItems';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const fmtEur = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const MonthlyCharts = () => {
  const { data: items = [], isLoading } = useStockItems();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear, currentYear - 1]);
    items.forEach(item => {
      if (item.fecha_venta) years.add(new Date(item.fecha_venta).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [items, currentYear]);

  const isAllTime = selectedYear === 'all';

  const monthlyData = useMemo(() => {
    const data = MONTHS.map((month, monthIndex) => ({ month, monthIndex, facturacion: 0, beneficio: 0, vendidos: 0 }));
    items.forEach(item => {
      if (item.estado === 'Vendido' && item.fecha_venta) {
        const d = new Date(item.fecha_venta);
        if (isAllTime || d.getFullYear().toString() === selectedYear) {
          const venta = Number(item.precio_venta_real) || 0;
          const coste = Number(item.purchase_price_per_unit) + Number(item.precio_envio) + Number(item.coste_reparacion);
          data[d.getMonth()].facturacion += venta;
          data[d.getMonth()].beneficio += venta - coste;
          data[d.getMonth()].vendidos += 1;
        }
      }
    });
    return data;
  }, [items, selectedYear, isAllTime]);

  const totals = useMemo(() => monthlyData.reduce(
    (acc, m) => ({ facturacion: acc.facturacion + m.facturacion, beneficio: acc.beneficio + m.beneficio, vendidos: acc.vendidos + m.vendidos }),
    { facturacion: 0, beneficio: 0, vendidos: 0 }
  ), [monthlyData]);

  const periodLabel = isAllTime ? 'Todo el tiempo' : selectedYear;

  const chartConfig = {
    facturacion: { label: 'Facturación', color: 'hsl(var(--primary))' },
    beneficio: { label: 'Beneficio', color: 'hsl(var(--chart-2))' },
    vendidos: { label: 'Vendidos', color: 'hsl(var(--chart-3))' },
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-6">

      <PageHeader
        icon={BarChart3}
        title="Gráficos Anuales"
        subtitle="Análisis de ventas y beneficios por mes"
        iconColor="violet"
        actions={
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el tiempo</SelectItem>
              {availableYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : [
          {
            icon: DollarSign,
            label: `Facturación · ${periodLabel}`,
            value: fmtEur(totals.facturacion),
            accent: 'hsl(262,73%,55%)',
          },
          {
            icon: TrendingUp,
            label: `Beneficio · ${periodLabel}`,
            value: fmtEur(totals.beneficio),
            accent: totals.beneficio >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
          },
          {
            icon: Package,
            label: `Vendidos · ${periodLabel}`,
            value: totals.vendidos.toString(),
            accent: 'hsl(217,91%,54%)',
          },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="kpi-card p-4" style={{ borderTop: `3px solid ${k.accent}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-3.5 w-3.5" style={{ color: k.accent }} />
                <span className="text-xs text-muted-foreground font-medium">{k.label}</span>
              </div>
              <p className="text-2xl font-bold leading-none" style={{ color: k.accent }}>{k.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts grid */}
      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className={`h-72 rounded-xl ${i === 3 ? 'lg:col-span-2' : ''}`} />)}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 animate-slide-up-2">
          {/* Facturación */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20" style={{ borderTop: '3px solid hsl(var(--primary))' }}>
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Facturación Real por Mes</span>
            </div>
            <div className="p-4">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} tickFormatter={v => `${v}€`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={v => `${Number(v).toFixed(0)} €`} />} />
                  <Bar dataKey="facturacion" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Beneficio */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20" style={{ borderTop: '3px solid hsl(var(--chart-2))' }}>
              <TrendingUp className="h-4 w-4" style={{ color: 'hsl(var(--chart-2))' }} />
              <span className="text-sm font-semibold">Beneficio Real por Mes</span>
            </div>
            <div className="p-4">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} tickFormatter={v => `${v}€`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={v => `${Number(v).toFixed(0)} €`} />} />
                  <Bar dataKey="beneficio" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Vendidos — full width */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden lg:col-span-2">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20" style={{ borderTop: '3px solid hsl(var(--chart-3))' }}>
              <Package className="h-4 w-4" style={{ color: 'hsl(var(--chart-3))' }} />
              <span className="text-sm font-semibold">Productos Vendidos por Mes</span>
            </div>
            <div className="p-4">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent formatter={v => `${v} productos`} />} />
                  <Line
                    type="monotone"
                    dataKey="vendidos"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyCharts;
