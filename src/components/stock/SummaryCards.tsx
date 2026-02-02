import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CurrentStockSummary, StockItem } from '@/types/stock';
import { DollarSign, TrendingUp, Percent, Package } from 'lucide-react';
import { SummaryDetailModal } from './SummaryDetailModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SummaryCardsProps {
  currentSummary: CurrentStockSummary;
  stockItems: StockItem[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

type ModalType = 'invested' | 'revenue' | 'profit' | 'margin';

export function SummaryCards({ currentSummary, stockItems }: SummaryCardsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('invested');

  const handleCardClick = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  const currentCards = [
    {
      title: 'Invertido',
      fullTitle: 'Total Invertido Actual (Stock)',
      value: formatCurrency(currentSummary.totalInvestedCurrent),
      icon: Package,
      className: 'text-foreground',
      type: 'invested' as ModalType,
    },
    {
      title: 'Ingresos Esp.',
      fullTitle: 'Ingresos Esperados Actuales',
      value: formatCurrency(currentSummary.expectedRevenueCurrent),
      icon: DollarSign,
      className: 'text-primary',
      type: 'revenue' as ModalType,
    },
    {
      title: 'Beneficio Pos.',
      fullTitle: 'Beneficio Posible Actual',
      value: formatCurrency(currentSummary.possibleProfitCurrent),
      icon: TrendingUp,
      className: currentSummary.possibleProfitCurrent >= 0 ? 'text-success' : 'text-destructive',
      type: 'profit' as ModalType,
    },
    {
      title: 'Margen Pos.',
      fullTitle: 'Margen Posible Actual',
      value: `${currentSummary.possibleMarginCurrent.toFixed(1)}%`,
      icon: Percent,
      className: currentSummary.possibleMarginCurrent >= 0 ? 'text-success' : 'text-destructive',
      type: 'margin' as ModalType,
    },
  ];

  return (
    <TooltipProvider>
      <>
        <div>
          <h3 className="mb-2 sm:mb-3 lg:mb-4 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Resumen Actual
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
            {currentCards.map((card) => (
              <Tooltip key={card.title}>
                <TooltipTrigger asChild>
                  <Card 
                    className="border-border/60 bg-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98] lg:metric-card"
                    onClick={() => handleCardClick(card.type)}
                  >
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-muted-foreground leading-snug line-clamp-2">{card.title}</p>
                          <p className={`mt-0.5 sm:mt-1 lg:mt-2 text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold tracking-tight ${card.className}`}>{card.value}</p>
                        </div>
                        <div className="rounded-xl bg-primary/10 p-1.5 sm:p-2 lg:p-3 shrink-0 hidden sm:block">
                          <card.icon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="hidden lg:block">
                  <p>{card.fullTitle}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
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