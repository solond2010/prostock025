import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StockSummary, CurrentStockSummary, StockItem } from '@/types/stock';
import { DollarSign, TrendingUp, Wallet, Percent, CheckCircle, Package } from 'lucide-react';
import { SummaryDetailModal } from './SummaryDetailModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SummaryCardsProps {
  summary: StockSummary;
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

export function SummaryCards({ summary, currentSummary, stockItems }: SummaryCardsProps) {
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

  const historicCards = [
    {
      title: 'Invertido',
      fullTitle: 'Total Invertido (Histórico)',
      value: formatCurrency(summary.totalInvested),
      icon: Wallet,
      className: 'text-foreground',
    },
    {
      title: 'Ingresos Esp.',
      fullTitle: 'Ingresos Esperados Totales',
      value: formatCurrency(summary.totalExpectedRevenue),
      icon: DollarSign,
      className: 'text-primary',
    },
    {
      title: 'Beneficio Esp.',
      fullTitle: 'Beneficio Esperado Total',
      value: formatCurrency(summary.totalExpectedProfit),
      icon: TrendingUp,
      className: summary.totalExpectedProfit >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      title: 'Beneficio Real',
      fullTitle: 'Beneficio Real (Ventas confirmadas)',
      value: formatCurrency(summary.totalRealProfit),
      icon: CheckCircle,
      className: summary.totalRealProfit >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      title: 'Margen',
      fullTitle: 'Margen de Beneficio',
      value: `${summary.profitMargin.toFixed(1)}%`,
      icon: Percent,
      className: summary.profitMargin >= 0 ? 'text-success' : 'text-destructive',
    },
  ];

  return (
    <TooltipProvider>
      <>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Resumen Actual (Stock) */}
          <div>
            <h3 className="mb-2 sm:mb-3 lg:mb-4 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Resumen Actual
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
              {currentCards.map((card) => (
                <Tooltip key={card.title}>
                  <TooltipTrigger asChild>
                    <Card 
                      className="border-border/50 bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.98] lg:metric-card"
                      onClick={() => handleCardClick(card.type)}
                    >
                      <CardContent className="p-3 sm:p-4 lg:p-5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs lg:text-xs font-medium text-muted-foreground leading-snug">{card.title}</p>
                            <p className={`mt-0.5 sm:mt-1 lg:mt-1.5 text-base sm:text-lg lg:text-xl xl:text-2xl font-bold tracking-tight ${card.className}`}>{card.value}</p>
                          </div>
                          <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 lg:p-2.5 shrink-0 hidden sm:block">
                            <card.icon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary" />
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

          {/* Histórico Total */}
          <div>
            <h3 className="mb-2 sm:mb-3 lg:mb-4 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Histórico Total
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5 lg:gap-4">
              {historicCards.map((card) => (
                <Tooltip key={card.title}>
                  <TooltipTrigger asChild>
                    <Card className="border-border/50 bg-card lg:metric-card">
                      <CardContent className="p-3 sm:p-4 lg:p-5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs lg:text-xs font-medium text-muted-foreground leading-snug">{card.title}</p>
                            <p className={`mt-0.5 sm:mt-1 lg:mt-1.5 text-base sm:text-lg lg:text-xl xl:text-2xl font-bold tracking-tight ${card.className}`}>{card.value}</p>
                          </div>
                          <div className="rounded-lg bg-secondary p-1.5 sm:p-2 lg:p-2.5 shrink-0 hidden sm:block">
                            <card.icon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground" />
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
