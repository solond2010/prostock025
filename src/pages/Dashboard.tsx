import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, CheckCircle2, Target, Euro, ShoppingCart, Zap, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStockItems } from '@/hooks/useStockItems';
import { useTasks } from '@/hooks/useTasks';
import { useDeals } from '@/hooks/useDeals';
import { format, parseISO, startOfMonth, isWithinInterval, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { data: items = [], isLoading: loadingStock } = useStockItems();
  const { tasks, isLoading: loadingTasks } = useTasks();
  const { deals, isLoading: loadingDeals } = useDeals();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const stats = useMemo(() => {
    const inStock = items.filter(i => i.estado === 'En stock');
    const soldThisMonth = items.filter(i => {
      if (i.estado !== 'Vendido' || !i.fecha_venta) return false;
      const d = parseISO(i.fecha_venta);
      return isWithinInterval(d, { start: monthStart, end: monthEnd });
    });

    const beneficioMes = soldThisMonth.reduce((acc, i) => {
      const coste = Number(i.purchase_price_per_unit) + Number(i.precio_envio) + Number(i.coste_reparacion);
      return acc + (Number(i.precio_venta_real) - coste);
    }, 0);

    const invertidoActual = inStock.reduce((acc, i) =>
      acc + Number(i.purchase_price_per_unit) + Number(i.precio_envio) + Number(i.coste_reparacion), 0);

    const pendingTasks = tasks.filter(t => !t.is_done);
    const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');

    const recentDeals = deals.slice(0, 3);
    const fireDeals = deals.filter(d => d.score === 'fire').length;

    return {
      inStock: inStock.length,
      soldThisMonth: soldThisMonth.length,
      beneficioMes,
      invertidoActual,
      pendingTasks: pendingTasks.length,
      highPriorityTasks: highPriorityTasks.length,
      recentDeals,
      fireDeals,
    };
  }, [items, tasks, deals, monthStart, monthEnd]);

  const isLoading = loadingStock || loadingTasks || loadingDeals;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Buenos días 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {format(now, "EEEE, d 'de' MMMM", { locale: es })} · Aquí tienes el resumen de hoy
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Beneficio del mes</span>
                  <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-success" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stats.beneficioMes >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.beneficioMes >= 0 ? '+' : ''}{stats.beneficioMes.toFixed(0)}€
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stats.soldThisMonth} ventas este mes</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">En stock</span>
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stats.inStock}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.invertidoActual.toFixed(0)}€ invertido</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Tareas pendientes</span>
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.highPriorityTasks > 0
                    ? <span className="text-destructive font-medium">{stats.highPriorityTasks} de alta prioridad</span>
                    : 'Sin urgentes'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Ofertas bot</span>
                  <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Target className="h-3.5 w-3.5 text-destructive" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{deals.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.fireDeals > 0
                    ? <span className="text-destructive font-medium">🔥 {stats.fireDeals} precio brutal</span>
                    : 'en el feed'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Fila inferior: últimas ofertas + acceso rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Últimas ofertas del bot */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-destructive" />
                Últimas ofertas
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
                <Link to="/ofertas">Ver todo <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {loadingDeals && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            {!loadingDeals && stats.recentDeals.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                El bot aún no ha encontrado ofertas hoy
              </p>
            )}
            {stats.recentDeals.map(deal => (
              <div key={deal.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center text-lg shrink-0">
                  {deal.image_url
                    ? <img src={deal.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    : '📱'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{deal.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    hace {formatDistanceToNow(new Date(deal.created_at), { locale: es })}
                    {deal.location ? ` · ${deal.location}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{deal.price ? `${deal.price}€` : '—'}</p>
                  <Badge
                    variant="outline"
                    className={`text-[9px] h-4 px-1.5 ${deal.score === 'fire' ? 'text-destructive border-destructive/30' : deal.score === 'good' ? 'text-amber-500 border-amber-500/30' : 'text-primary border-primary/20'}`}
                  >
                    {deal.score === 'fire' ? '🔥' : deal.score === 'good' ? '⭐' : '📦'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Acceso rápido */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Acceso rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm" asChild>
              <Link to="/"><Package className="h-4 w-4" /> Gestor de Stock</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm" asChild>
              <Link to="/ofertas"><Target className="h-4 w-4 text-destructive" /> En directo</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm" asChild>
              <Link to="/tareas"><CheckCircle2 className="h-4 w-4 text-amber-500" /> Tareas</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm" asChild>
              <Link to="/estadisticas"><TrendingUp className="h-4 w-4 text-primary" /> Estadísticas</Link>
            </Button>

            {/* Tareas urgentes */}
            {stats.highPriorityTasks > 0 && !loadingTasks && (
              <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-xs font-semibold text-destructive mb-1">⚠️ Tareas urgentes</p>
                {tasks.filter(t => !t.is_done && t.priority === 'high').slice(0, 2).map(t => (
                  <p key={t.id} className="text-[11px] text-muted-foreground truncate">· {t.title}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
