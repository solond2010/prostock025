import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StockSummary, CurrentStockSummary, StockItem } from '@/types/stock';
import { DollarSign, TrendingUp, Wallet, Percent, CheckCircle, Package } from 'lucide-react';
import { SummaryDetailModal } from './SummaryDetailModal';

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
      title: 'Total Invertido Actual',
      value: formatCurrency(currentSummary.totalInvestedCurrent),
      icon: Package,
      className: 'text-foreground',
      type: 'invested' as ModalType,
    },
    {
      title: 'Ingresos Esperados Actuales',
      value: formatCurrency(currentSummary.expectedRevenueCurrent),
      icon: DollarSign,
      className: 'text-primary',
      type: 'revenue' as ModalType,
    },
    {
      title: 'Beneficio Posible Actual',
      value: formatCurrency(currentSummary.possibleProfitCurrent),
      icon: TrendingUp,
      className: currentSummary.possibleProfitCurrent >= 0 ? 'text-success' : 'text-destructive',
      type: 'profit' as ModalType,
    },
    {
      title: 'Margen Posible Actual',
      value: `${currentSummary.possibleMarginCurrent.toFixed(1)}%`,
      icon: Percent,
      className: currentSummary.possibleMarginCurrent >= 0 ? 'text-success' : 'text-destructive',
      type: 'margin' as ModalType,
    },
  ];

  const historicCards = [
    {
      title: 'Total Invertido',
      value: formatCurrency(summary.totalInvested),
      icon: Wallet,
      className: 'text-foreground',
    },
    {
      title: 'Ingresos Esperados',
      value: formatCurrency(summary.totalExpectedRevenue),
      icon: DollarSign,
      className: 'text-primary',
    },
    {
      title: 'Beneficio Esperado',
      value: formatCurrency(summary.totalExpectedProfit),
      icon: TrendingUp,
      className: summary.totalExpectedProfit >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      title: 'Beneficio Real',
      value: formatCurrency(summary.totalRealProfit),
      icon: CheckCircle,
      className: summary.totalRealProfit >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      title: 'Margen de Beneficio',
      value: `${summary.profitMargin.toFixed(1)}%`,
      icon: Percent,
      className: summary.profitMargin >= 0 ? 'text-success' : 'text-destructive',
    },
  ];

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Resumen Actual (Stock) */}
        <div>
          <h3 className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Resumen Actual (Stock)
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {currentCards.map((card) => (
              <Card 
                key={card.title} 
                className="border-border/50 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => handleCardClick(card.type)}
              >
                <CardContent className="p-3 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between gap-2 lg:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-sm lg:text-sm font-medium text-muted-foreground leading-tight lg:leading-normal lg:whitespace-normal">{card.title}</p>
                      <p className={`mt-0.5 sm:mt-1 lg:mt-2 text-base sm:text-2xl lg:text-3xl font-semibold ${card.className}`}>{card.value}</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-1.5 sm:p-2.5 lg:p-3 shrink-0 hidden sm:block">
                      <card.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Histórico Total */}
        <div>
          <h3 className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Histórico Total
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-5 lg:gap-5">
            {historicCards.map((card) => (
              <Card key={card.title} className="border-border/50 shadow-sm">
                <CardContent className="p-3 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between gap-2 lg:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-sm lg:text-sm font-medium text-muted-foreground leading-tight lg:leading-normal lg:whitespace-normal">{card.title}</p>
                      <p className={`mt-0.5 sm:mt-1 lg:mt-2 text-base sm:text-2xl lg:text-3xl font-semibold ${card.className}`}>{card.value}</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-1.5 sm:p-2.5 lg:p-3 shrink-0 hidden sm:block">
                      <card.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
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
  );
}
