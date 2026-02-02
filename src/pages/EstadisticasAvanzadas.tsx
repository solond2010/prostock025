import { useState, useMemo } from 'react';
import { PieChart, TrendingUp, Package, DollarSign, Percent, ShoppingCart, Trophy, AlertTriangle, Search, Calendar, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useStockItems } from '@/hooks/useStockItems';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { HistoricSummaryCards } from '@/components/stock/HistoricSummaryCards';
import { StockSummary } from '@/types/stock';

const EstadisticasAvanzadas = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [salesSearch, setSalesSearch] = useState('');
  
  const { data: stockItems = [], isLoading } = useStockItems();

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - i);

  const calculateCosteTotal = (item: typeof stockItems[0]) => {
    return item.purchase_price_per_unit + item.precio_envio + item.coste_reparacion;
  };

  const calculateBeneficioReal = (item: typeof stockItems[0]) => {
    const costeTotal = calculateCosteTotal(item);
    return item.precio_venta_real - costeTotal;
  };

  const calculateMargen = (item: typeof stockItems[0]) => {
    if (item.precio_venta_real === 0) return 0;
    const beneficio = calculateBeneficioReal(item);
    return (beneficio / item.precio_venta_real) * 100;
  };

  const filteredSoldItems = useMemo(() => {
    return stockItems.filter(item => {
      if (item.estado !== 'Vendido' || !item.fecha_venta) return false;
      const saleDate = parseISO(item.fecha_venta);
      return saleDate.getMonth() + 1 === selectedMonth && saleDate.getFullYear() === selectedYear;
    });
  }, [stockItems, selectedMonth, selectedYear]);

  const purchasedThisMonth = useMemo(() => {
    return stockItems.filter(item => {
      const purchaseDate = parseISO(item.purchase_date);
      return purchaseDate.getMonth() + 1 === selectedMonth && purchaseDate.getFullYear() === selectedYear;
    });
  }, [stockItems, selectedMonth, selectedYear]);

  // Sales history: sorted by date (most recent first) and filtered by search
  const salesHistory = useMemo(() => {
    return filteredSoldItems
      .filter(item => 
        salesSearch === '' || 
        item.name.toLowerCase().includes(salesSearch.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = a.fecha_venta ? parseISO(a.fecha_venta).getTime() : 0;
        const dateB = b.fecha_venta ? parseISO(b.fecha_venta).getTime() : 0;
        return dateB - dateA;
      });
  }, [filteredSoldItems, salesSearch]);

  const metrics = useMemo(() => {
    const totalProducts = filteredSoldItems.length;
    const totalBeneficio = filteredSoldItems.reduce((sum, item) => sum + calculateBeneficioReal(item), 0);
    const avgBeneficio = totalProducts > 0 ? totalBeneficio / totalProducts : 0;
    const avgTicket = totalProducts > 0 
      ? filteredSoldItems.reduce((sum, item) => sum + item.precio_venta_real, 0) / totalProducts 
      : 0;
    const avgMargen = totalProducts > 0 
      ? filteredSoldItems.reduce((sum, item) => sum + calculateMargen(item), 0) / totalProducts 
      : 0;

    return {
      totalProducts,
      totalBeneficio,
      avgBeneficio,
      avgTicket,
      avgMargen,
      purchasedCount: purchasedThisMonth.length,
    };
  }, [filteredSoldItems, purchasedThisMonth]);

  const ranking = useMemo(() => {
    if (filteredSoldItems.length === 0) return { best: null, worst: null, top5: [] };

    const itemsWithBeneficio = filteredSoldItems.map(item => ({
      ...item,
      beneficioReal: calculateBeneficioReal(item),
    })).sort((a, b) => b.beneficioReal - a.beneficioReal);

    return {
      best: itemsWithBeneficio[0] || null,
      worst: itemsWithBeneficio[itemsWithBeneficio.length - 1] || null,
      top5: itemsWithBeneficio.slice(0, 5),
    };
  }, [filteredSoldItems]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; totalBeneficio: number }> = {};
    
    filteredSoldItems.forEach(item => {
      if (!stats[item.category]) {
        stats[item.category] = { count: 0, totalBeneficio: 0 };
      }
      stats[item.category].count += 1;
      stats[item.category].totalBeneficio += calculateBeneficioReal(item);
    });

    return Object.entries(stats).map(([category, data]) => ({
      category,
      count: data.count,
      totalBeneficio: data.totalBeneficio,
      avgBeneficio: data.count > 0 ? data.totalBeneficio / data.count : 0,
    })).sort((a, b) => b.totalBeneficio - a.totalBeneficio);
  }, [filteredSoldItems]);

  // Facturación mensual histórica (independiente del selector)
  const monthlyBillingHistory = useMemo(() => {
    const soldItems = stockItems.filter(item => item.estado === 'Vendido' && item.fecha_venta);
    
    const billingByMonth: Record<string, { facturacion: number; ventas: number; month: number; year: number }> = {};
    
    soldItems.forEach(item => {
      const saleDate = parseISO(item.fecha_venta!);
      const month = saleDate.getMonth() + 1;
      const year = saleDate.getFullYear();
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!billingByMonth[key]) {
        billingByMonth[key] = { facturacion: 0, ventas: 0, month, year };
      }
      billingByMonth[key].facturacion += item.precio_venta_real;
      billingByMonth[key].ventas += 1;
    });

    return Object.entries(billingByMonth)
      .map(([key, data]) => ({
        key,
        label: `${months.find(m => m.value === data.month)?.label.slice(0, 3)} ${data.year}`,
        fullLabel: `${months.find(m => m.value === data.month)?.label} ${data.year}`,
        facturacion: data.facturacion,
        ventas: data.ventas,
        month: data.month,
        year: data.year,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  }, [stockItems, months]);

  // Últimos 12 meses para el gráfico
  const chartData = useMemo(() => {
    return [...monthlyBillingHistory].reverse().slice(-12);
  }, [monthlyBillingHistory]);

  // Calculate historic summary for all items
  const historicSummary = useMemo<StockSummary>(() => {
    let totalInvested = 0;
    let totalExpectedRevenue = 0;
    let totalRealProfit = 0;

    stockItems.forEach((item) => {
      const coste_total = calculateCosteTotal(item);
      totalInvested += coste_total;
      totalExpectedRevenue += Number(item.sale_price_per_unit);

      if (item.estado === 'Vendido') {
        totalRealProfit += Number(item.precio_venta_real) - coste_total;
      }
    });

    const totalExpectedProfit = totalExpectedRevenue - totalInvested;
    const profitMargin = totalExpectedRevenue > 0 ? (totalExpectedProfit / totalExpectedRevenue) * 100 : 0;

    return { totalInvested, totalExpectedRevenue, totalExpectedProfit, totalRealProfit, profitMargin };
  }, [stockItems]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const getSelectedMonthName = () => {
    const month = months.find(m => m.value === selectedMonth);
    return month ? month.label : '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <PieChart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Estadísticas Avanzadas</h1>
              <p className="text-sm text-muted-foreground">Métricas detalladas por mes</p>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex items-center gap-3">
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Histórico Total */}
        <div className="mb-8">
          <HistoricSummaryCards summary={historicSummary} />
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos vendidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beneficio real total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.totalBeneficio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.totalBeneficio)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beneficio medio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.avgBeneficio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.avgBeneficio)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket medio</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.avgTicket)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margen medio</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.avgMargen >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.avgMargen.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comprados este mes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.purchasedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Ranking de productos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <CardTitle>Producto más rentable del mes</CardTitle>
            </CardHeader>
            <CardContent>
              {ranking.best ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{ranking.best.name}</p>
                  <p className="text-sm text-muted-foreground">{ranking.best.category}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(ranking.best.beneficioReal)}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Sin datos para este periodo</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle>Peor producto del mes</CardTitle>
            </CardHeader>
            <CardContent>
              {ranking.worst ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{ranking.worst.name}</p>
                  <p className="text-sm text-muted-foreground">{ranking.worst.category}</p>
                  <p className={`text-2xl font-bold ${ranking.worst.beneficioReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(ranking.worst.beneficioReal)}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Sin datos para este periodo</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top 5 productos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top 5 productos por beneficio</CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.top5.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Beneficio real</TableHead>
                    <TableHead className="text-right">Fecha de venta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.top5.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <span className="mr-2 text-muted-foreground">#{index + 1}</span>
                        {item.name}
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className={`text-right font-semibold ${item.beneficioReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.beneficioReal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.fecha_venta ? format(parseISO(item.fecha_venta), 'dd MMM yyyy', { locale: es }) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sin productos vendidos en este periodo</p>
            )}
          </CardContent>
        </Card>

        {/* Resumen por categoría */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resumen por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Productos vendidos</TableHead>
                    <TableHead className="text-right">Beneficio real total</TableHead>
                    <TableHead className="text-right">Beneficio medio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryStats.map((stat) => (
                    <TableRow key={stat.category}>
                      <TableCell className="font-medium">{stat.category}</TableCell>
                      <TableCell className="text-right">{stat.count}</TableCell>
                      <TableCell className={`text-right font-semibold ${stat.totalBeneficio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.totalBeneficio)}
                      </TableCell>
                      <TableCell className={`text-right ${stat.avgBeneficio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.avgBeneficio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sin datos para este periodo</p>
            )}
          </CardContent>
        </Card>

        {/* Facturación mensual histórica */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <CardTitle>Facturación mensual (histórico)</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresos totales por mes (suma de precio de venta real)
            </p>
          </CardHeader>
          <CardContent>
            {monthlyBillingHistory.length > 0 ? (
              <div className="space-y-6">
                {/* Gráfico de barras */}
                {chartData.length > 1 && (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <XAxis 
                          dataKey="label" 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                          formatter={(value: number) => [formatCurrency(value), 'Facturación']}
                        />
                        <Bar 
                          dataKey="facturacion" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        >
                          {chartData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`hsl(var(--primary) / ${0.6 + (index / chartData.length) * 0.4})`}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Tabla de facturación */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mes</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-right">Facturación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyBillingHistory.map((item) => (
                        <TableRow key={item.key}>
                          <TableCell className="font-medium">{item.fullLabel}</TableCell>
                          <TableCell className="text-right">{item.ventas}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {formatCurrency(item.facturacion)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Total histórico */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">Facturación total histórica</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(monthlyBillingHistory.reduce((sum, item) => sum + item.facturacion, 0))}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Aún no hay ventas registradas para generar facturación mensual.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de ventas del mes */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Historial de ventas del mes</CardTitle>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {salesHistory.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha de venta</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Precio venta (€)</TableHead>
                        <TableHead className="text-right">Coste total (€)</TableHead>
                        <TableHead className="text-right">Beneficio real (€)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesHistory.map((item) => {
                        const costeTotal = calculateCosteTotal(item);
                        const beneficioReal = calculateBeneficioReal(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.fecha_venta ? format(parseISO(item.fecha_venta), 'dd MMM yyyy', { locale: es }) : '-'}
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.precio_venta_real)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(costeTotal)}</TableCell>
                            <TableCell className={`text-right font-semibold ${beneficioReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(beneficioReal)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Mostrando {salesHistory.length} {salesHistory.length === 1 ? 'venta' : 'ventas'} de {getSelectedMonthName()} {selectedYear}
                </p>
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No hay ventas registradas en este mes.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstadisticasAvanzadas;
