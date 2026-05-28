import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Package, CheckCircle2, Target,
  ArrowRight, AlertTriangle, Trophy, Flame, Clock, ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { useStockItems } from '@/hooks/useStockItems';
import { useTasks } from '@/hooks/useTasks';
import { useDeals } from '@/hooks/useDeals';
import {
  format, parseISO, startOfMonth, endOfMonth, isWithinInterval,
  subMonths, differenceInDays, formatDistanceToNow
} from 'date-fns';
import { es } from 'date-fns/locale';

// ─── helpers ──────────────────────────────────────────────────────────────────
function coste(i: any) {
  return Number(i.purchase_price_per_unit) + Number(i.precio_envio) + Number(i.coste_reparacion);
}
function beneficioReal(i: any) { return Number(i.precio_venta_real) - coste(i); }
function margen(i: any) {
  const pv = Number(i.precio_venta_real);
  if (!pv) return 0;
  return ((pv - coste(i)) / pv) * 100;
}

const SCORE_COLOR: Record<string, string> = {
  fire: 'text-destructive border-destructive/30 bg-destructive/5',
  good: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
  ok:   'text-primary border-primary/20 bg-primary/5',
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: items = [], isLoading: loadingStock } = useStockItems();
  const { tasks, isLoading: loadingTasks } = useTasks();
  const { deals, isLoading: loadingDeals } = useDeals();

  const now = new Date();

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd   = endOfMonth(now);
    const prevStart  = startOfMonth(subMonths(now, 1));
    const prevEnd    = endOfMonth(subMonths(now, 1));

    const soldThis = items.filter(i =>
      i.estado === 'Vendido' && i.fecha_venta &&
      isWithinInterval(parseISO(i.fecha_venta), { start: monthStart, end: monthEnd })
    );
    const soldPrev = items.filter(i =>
      i.estado === 'Vendido' && i.fecha_venta &&
      isWithinInterval(parseISO(i.fecha_venta), { start: prevStart, end: prevEnd })
    );

    const benMes  = soldThis.reduce((a, i) => a + beneficioReal(i), 0);
    const benPrev = soldPrev.reduce((a, i) => a + beneficioReal(i), 0);
    const benDelta = benPrev !== 0 ? ((benMes - benPrev) / Math.abs(benPrev)) * 100 : 0;

    const inStock = items.filter(i => i.estado === 'En stock');
    const invertido = inStock.reduce((a, i) => a + coste(i), 0);

    // margen medio del mes
    const margenMedio = soldThis.length
      ? soldThis.reduce((a, i) => a + margen(i), 0) / soldThis.length
      : 0;

    // items en riesgo (21+ días en stock)
    const atRisk = inStock.filter(i => differenceInDays(now, parseISO(i.purchase_date)) >= 21);
    // muertos (35+ días)
    const dead   = inStock.filter(i => differenceInDays(now, parseISO(i.purchase_date)) >= 35);

    // últimas 5 ventas
    const recentSales = [...items]
      .filter(i => i.estado === 'Vendido' && i.fecha_venta)
      .sort((a, b) => parseISO(b.fecha_venta!).getTime() - parseISO(a.fecha_venta!).getTime())
      .slice(0, 5);

    // top 3 márgenes del mes
    const topItems = [...soldThis]
      .sort((a, b) => beneficioReal(b) - beneficioReal(a))
      .slice(0, 3);

    // chart: últimos 6 meses
    const monthlyChart = Array.from({ length: 6 }, (_, k) => {
      const d = subMonths(now, 5 - k);
      const ms = startOfMonth(d), me = endOfMonth(d);
      const sold = items.filter(i =>
        i.estado === 'Vendido' && i.fecha_venta &&
        isWithinInterval(parseISO(i.fecha_venta), { start: ms, end: me })
      );
      const ben = sold.reduce((a, i) => a + beneficioReal(i), 0);
      return {
        mes: format(d, 'MMM', { locale: es }),
        beneficio: Math.round(ben),
        ventas: sold.length,
      };
    });

    // por categoría (mes actual)
    const byCat: Record<string, number> = {};
    soldThis.forEach(i => {
      byCat[i.category] = (byCat[i.category] || 0) + beneficioReal(i);
    });
    const catChart = Object.entries(byCat)
      .map(([cat, ben]) => ({ cat, ben: Math.round(ben) }))
      .sort((a, b) => b.ben - a.ben)
      .slice(0, 5);

    const pendingTasks = tasks.filter(t => !t.is_done);
    const urgentTasks  = pendingTasks.filter(t => t.priority === 'high');

    return {
      benMes, benPrev, benDelta,
      soldThisCount: soldThis.length,
      inStockCount: inStock.length, invertido,
      margenMedio,
      atRisk, dead,
      recentSales, topItems,
      monthlyChart, catChart,
      pendingTasks, urgentTasks,
    };
  }, [items, tasks, now]);

  const isLoading = loadingStock || loadingTasks || loadingDeals;

  // ── Custom tooltip para recharts ──────────────────────────────────────────
  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === 'beneficio' ? `Beneficio: ${p.value}€` : `Ventas: ${p.value}`}
          </p>
        ))}
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {format(now, "EEEE d 'de' MMMM", { locale: es })
              .replace(/^\w/, c => c.toUpperCase())}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Resumen general de tu negocio
          </p>
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        )) : (<>

          {/* Beneficio del mes */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Beneficio del mes</span>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${stats.benMes >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <TrendingUp className={`h-3.5 w-3.5 ${stats.benMes >= 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${stats.benMes >= 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.benMes >= 0 ? '+' : ''}{stats.benMes.toFixed(0)}€
              </p>
              <div className="flex items-center gap-1 mt-1">
                {stats.benDelta >= 0
                  ? <TrendingUp className="h-3 w-3 text-success" />
                  : <TrendingDown className="h-3 w-3 text-destructive" />}
                <span className={`text-[11px] font-medium ${stats.benDelta >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.benDelta >= 0 ? '+' : ''}{stats.benDelta.toFixed(0)}% vs mes anterior
                </span>
              </div>
            </CardContent>
          </Card>

          {/* En stock */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">En stock</span>
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.inStockCount}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {stats.invertido.toFixed(0)}€ invertido
                {stats.dead.length > 0 && (
                  <span className="text-destructive font-medium"> · {stats.dead.length} parados</span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Margen medio */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Margen medio</span>
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.margenMedio.toFixed(1)}%</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stats.soldThisCount} ventas este mes</p>
            </CardContent>
          </Card>

          {/* Tareas / bot */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Tareas / Bot</span>
                <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-destructive" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-2xl font-bold">{stats.urgentTasks.length}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">urgentes</p>
                </div>
                <div className="pb-1 text-right">
                  <p className="text-sm font-bold text-destructive">{deals.filter(d => d.score === 'fire').length}</p>
                  <p className="text-[11px] text-muted-foreground">🔥 deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>)}
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Beneficio últimos 6 meses */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Beneficio últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStock ? <Skeleton className="h-44 w-full" /> : (
              <ResponsiveContainer width="100%" height={176}>
                <BarChart data={stats.monthlyChart} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                  <Bar dataKey="beneficio" name="beneficio" radius={[4, 4, 0, 0]}>
                    {stats.monthlyChart.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.beneficio >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                        opacity={i === stats.monthlyChart.length - 1 ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Por categoría */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Beneficio por categoría</CardTitle>
            <p className="text-[11px] text-muted-foreground">Este mes</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingStock ? <Skeleton className="h-44 w-full" /> :
              stats.catChart.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-8">Sin ventas este mes</p>
                : stats.catChart.map((c, i) => {
                  const max = stats.catChart[0]?.ben || 1;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium truncate">{c.cat}</span>
                        <span className="font-bold text-success shrink-0">+{c.ben}€</span>
                      </div>
                      <Progress value={(c.ben / max) * 100} className="h-1.5" />
                    </div>
                  );
                })
            }
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Últimas ventas */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" /> Últimas ventas
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-[11px] gap-0.5 px-2" asChild>
                <Link to="/">Ver stock <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {loadingStock ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11" />) :
              stats.recentSales.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-6">Sin ventas recientes</p>
                : stats.recentSales.map(item => {
                  const ben = beneficioReal(item);
                  return (
                    <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.fecha_venta ? format(parseISO(item.fecha_venta), 'd MMM', { locale: es }) : '—'}
                        </p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${ben >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {ben >= 0 ? '+' : ''}{ben.toFixed(0)}€
                      </span>
                    </div>
                  );
                })
            }
          </CardContent>
        </Card>

        {/* Stock en riesgo */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Stock en riesgo
              </CardTitle>
              <Badge variant="outline" className="text-[10px] h-5">
                {stats.atRisk.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {loadingStock ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-11" />) :
              stats.atRisk.length === 0
                ? (
                  <div className="text-center py-6">
                    <p className="text-xs font-medium text-success">✅ Todo en orden</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Ningún artículo lleva más de 21 días</p>
                  </div>
                )
                : stats.atRisk.slice(0, 5).map(item => {
                  const days = differenceInDays(now, parseISO(item.purchase_date));
                  const isDead = days >= 35;
                  return (
                    <div key={item.id} className={`flex items-center gap-2.5 p-2 rounded-lg border ${isDead ? 'border-destructive/30 bg-destructive/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{coste(item).toFixed(0)}€ invertido</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] h-5 shrink-0 ${isDead ? 'text-destructive border-destructive/30' : 'text-amber-500 border-amber-500/30'}`}>
                        {days}d
                      </Badge>
                    </div>
                  );
                })
            }
          </CardContent>
        </Card>

        {/* Últimas ofertas bot */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-destructive" /> Ofertas bot
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-[11px] gap-0.5 px-2" asChild>
                <Link to="/ofertas">En directo <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {loadingDeals ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />) :
              deals.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-6">Sin ofertas aún</p>
                : deals.slice(0, 4).map(deal => (
                  <a
                    key={deal.id}
                    href={deal.item_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors block"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center text-base shrink-0 overflow-hidden">
                      {deal.image_url
                        ? <img src={deal.image_url} alt="" className="w-9 h-9 object-cover" />
                        : '📱'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate leading-tight">{deal.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        hace {formatDistanceToNow(new Date(deal.created_at), { locale: es })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{deal.price ? `${deal.price}€` : '—'}</p>
                      <Badge variant="outline" className={`text-[9px] h-4 px-1 ${SCORE_COLOR[deal.score]}`}>
                        {deal.score === 'fire' ? '🔥' : deal.score === 'good' ? '⭐' : '·'} {deal.score}
                      </Badge>
                    </div>
                  </a>
                ))
            }
          </CardContent>
        </Card>
      </div>

      {/* ── Tareas urgentes (si las hay) ──────────────────────────────── */}
      {!loadingTasks && stats.urgentTasks.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Tareas urgentes pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {stats.urgentTasks.map(t => (
                <Badge key={t.id} variant="outline" className="text-xs border-destructive/30 text-destructive">
                  {t.title}
                </Badge>
              ))}
              <Button size="sm" variant="outline" className="h-6 text-xs border-destructive/30 text-destructive hover:bg-destructive/10" asChild>
                <Link to="/tareas">Ver todas <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
