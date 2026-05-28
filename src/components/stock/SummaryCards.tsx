import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CurrentStockSummary, StockItem } from '@/types/stock';
import { DollarSign, TrendingUp, Percent, Package, Trophy } from 'lucide-react';
import { SummaryDetailModal } from './SummaryDetailModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { differenceInDays } from 'date-fns';

interface SummaryCardsProps {
  currentSummary: CurrentStockSummary;
  stockItems: StockItem[];
}

const fmt = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

type ModalType = 'invested' | 'revenue' | 'profit' | 'margin';

export function SummaryCards({ currentSummary, stockItems }: SummaryCardsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('invested');

  const handleCardClick = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  // Real benefit this month
  const monthStats = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const sold = stockItems.filter(i => {
      if (i.estado !== 'Vendido' || !i.fecha_venta) return false;
      const d = new Date(i.fecha_venta);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });
    const ben = sold.reduce((s, i) => {
      const c = Number(i.purchase_price_per_unit) + Number(i.precio_envio) + Number(i.coste_reparacion);
      return s + (Number(i.precio_venta_real) - c);
    }, 0);
    // Items parados (21+ días)
    const parados = stockItems.filter(i => {
      if (i.estado !== 'En stock' || !i.purchase_date) return false;
      return differenceInDays(now, new Date(i.purchase_date)) >= 21;
    }).length;
    return { ben, count: sold.length, parados };
  }, [stockItems]);

  const cards = [
    {
      title: 'Capital en stock',
      subtitle: 'Lo que tienes invertido ahora',
      value: fmt(currentSummary.totalInvestedCurrent),
      subValue: `${stockItems.filter(i => i.estado === 'En stock').length} productos`,
      icon: Package,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      valueColor: 'text-foreground',
      type: 'invested' as ModalType,
    },
    {
      title: 'Si vendes todo',
      subtitle: 'Beneficio posible si vendes al precio esperado',
      value: fmt(currentSummary.possibleProfitCurrent),
      subValue: `${currentSummary.possibleMarginCurrent.toFixed(1)}% margen`,
      icon: TrendingUp,
      iconBg: currentSummary.possibleProfitCurrent >= 0 ? 'bg-success/10' : 'bg-destructive/10',
      iconColor: currentSummary.possibleProfitCurrent >= 0 ? 'text-success' : 'text-destructive',
      valueColor: currentSummary.possibleProfitCurrent >= 0 ? 'text-success' : 'text-destructive',
      type: 'profit' as ModalType,
    },
    {
      title: 'Beneficio del mes',
      subtitle: 'Ganancia real con ventas de este mes',
      value: (monthStats.ben >= 0 ? '+' : '') + fmt(monthStats.ben),
      subValue: `${monthStats.count} ventas este mes`,
      icon: Trophy,
      iconBg: monthStats.ben >= 0 ? 'bg-amber-500/10' : 'bg-destructive/10',
      iconColor: monthStats.ben >= 0 ? 'text-amber-500' : 'text-destructive',
      valueColor: monthStats.ben >= 0 ? 'text-success' : 'text-destructive',
      type: 'margin' as ModalType,
    },
    {
      title: 'Precio de venta esp.',
      subtitle: 'Ingresos totales esperados si vendes todo',
      value: fmt(currentSummary.expectedRevenueCurrent),
      subValue: monthStats.parados > 0 ? `⚠️ ${monthStats.parados} parados 21+d` : 'Todo reciente',
      icon: DollarSign,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      valueColor: 'text-foreground',
      type: 'revenue' as ModalType,
    },
  ];

  return (
    <TooltipProvider>
      <>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          {cards.map((card) => (
            <Tooltip key={card.title}>
              <TooltipTrigger asChild>
                <Card
                  className="border-border/60 bg-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
                  onClick={() => handleCardClick(card.type)}
                >
                  <CardContent className="p-3 sm:p-4 lg:p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-snug">{card.title}</p>
                      <div className={`rounded-lg ${card.iconBg} p-1.5 shrink-0`}>
                        <card.icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
                      </div>
                    </div>
                    <p className={`text-lg sm:text-xl lg:text-2xl font-bold tracking-tight ${card.valueColor}`}>
                      {card.value}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{card.subValue}</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="hidden lg:block max-w-[200px] text-center">
                <p>{card.subtitle}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <SummaryDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          type={modalType}
          stockItems={stockItems}
        />
      </>
    </TooltipProvider>
  );
}
