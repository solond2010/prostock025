import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStockItems } from '@/hooks/useStockItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const MonthlyCharts = () => {
  const { data: items = [], isLoading } = useStockItems();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Get available years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    years.add(currentYear - 1);
    items.forEach((item) => {
      if (item.fecha_venta) {
        const year = new Date(item.fecha_venta).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [items, currentYear]);

  // Filter sold items and calculate monthly data
  const monthlyData = useMemo(() => {
    const data = MONTHS.map((month, index) => ({
      month,
      monthIndex: index,
      facturacion: 0,
      beneficio: 0,
      vendidos: 0,
    }));

    items.forEach((item) => {
      if (item.estado === 'Vendido' && item.fecha_venta) {
        const saleDate = new Date(item.fecha_venta);
        const saleYear = saleDate.getFullYear();
        const saleMonth = saleDate.getMonth();

        if (saleYear.toString() === selectedYear) {
          const precioVentaReal = Number(item.precio_venta_real) || 0;
          const costeTotal =
            Number(item.purchase_price_per_unit) * item.units_in_stock +
            Number(item.precio_envio) +
            Number(item.coste_reparacion);
          const beneficioReal = precioVentaReal - costeTotal;

          data[saleMonth].facturacion += precioVentaReal;
          data[saleMonth].beneficio += beneficioReal;
          data[saleMonth].vendidos += 1;
        }
      }
    });

    return data;
  }, [items, selectedYear]);

  // Calculate totals for the year
  const yearTotals = useMemo(() => {
    return monthlyData.reduce(
      (acc, month) => ({
        facturacion: acc.facturacion + month.facturacion,
        beneficio: acc.beneficio + month.beneficio,
        vendidos: acc.vendidos + month.vendidos,
      }),
      { facturacion: 0, beneficio: 0, vendidos: 0 }
    );
  }, [monthlyData]);

  const chartConfig = {
    facturacion: {
      label: 'Facturación',
      color: 'hsl(var(--primary))',
    },
    beneficio: {
      label: 'Beneficio',
      color: 'hsl(var(--chart-2))',
    },
    vendidos: {
      label: 'Productos Vendidos',
      color: 'hsl(var(--chart-3))',
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="rounded-lg bg-primary p-2">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Gráficos Mensuales</h1>
              <p className="text-sm text-muted-foreground">Análisis de ventas y beneficios</p>
            </div>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Facturación Total {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {yearTotals.facturacion.toFixed(2)} €
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Beneficio Total {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${yearTotals.beneficio >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {yearTotals.beneficio.toFixed(2)} €
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Productos Vendidos {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{yearTotals.vendidos}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Facturación Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Facturación Real por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `${value}€`} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(2)} €`} />}
                  />
                  <Bar dataKey="facturacion" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Beneficio Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Beneficio Real por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `${value}€`} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(2)} €`} />}
                  />
                  <Bar dataKey="beneficio" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Productos Vendidos Chart - Full width */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Productos Vendidos por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => `${value} productos`} />}
                  />
                  <Line
                    type="monotone"
                    dataKey="vendidos"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCharts;
