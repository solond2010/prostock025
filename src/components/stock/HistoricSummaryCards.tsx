import { Card, CardContent } from '@/components/ui/card';
import { StockSummary } from '@/types/stock';
import { DollarSign, TrendingUp, Wallet, Percent, CheckCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HistoricSummaryCardsProps {
  summary: StockSummary;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export function HistoricSummaryCards({ summary }: HistoricSummaryCardsProps) {
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
      <div>
        <h3 className="mb-2 sm:mb-3 lg:mb-4 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Histórico Total
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5 lg:gap-4">
          {historicCards.map((card) => (
            <Tooltip key={card.title}>
              <TooltipTrigger asChild>
                <Card className="border-border/60 bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 lg:metric-card">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-muted-foreground leading-snug line-clamp-2">{card.title}</p>
                        <p className={`mt-0.5 sm:mt-1 lg:mt-2 text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold tracking-tight ${card.className}`}>{card.value}</p>
                      </div>
                      <div className="rounded-xl bg-secondary p-1.5 sm:p-2 lg:p-3 shrink-0 hidden sm:block">
                        <card.icon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-muted-foreground" />
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
    </TooltipProvider>
  );
}
