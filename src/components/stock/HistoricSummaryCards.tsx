import { StockSummary } from '@/types/stock';
import { DollarSign, TrendingUp, Wallet, Percent, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HistoricSummaryCardsProps {
  summary: StockSummary;
}

// No decimals for large aggregate numbers
const fmtCompact = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export function HistoricSummaryCards({ summary }: HistoricSummaryCardsProps) {
  const cards = [
    {
      title: 'Invertido',
      fullTitle: 'Total invertido en todo el histórico',
      value: fmtCompact(summary.totalInvested),
      icon: Wallet,
      accent: 'hsl(262 73% 58%)',
      accentBg: 'hsl(262 73% 58% / 0.1)',
      trend: null as 'up' | 'down' | null,
    },
    {
      title: 'Ingresos Esp.',
      fullTitle: 'Ingresos esperados totales (precio venta × uds)',
      value: fmtCompact(summary.totalExpectedRevenue),
      icon: DollarSign,
      accent: 'hsl(217 91% 60%)',
      accentBg: 'hsl(217 91% 60% / 0.1)',
      trend: null as 'up' | 'down' | null,
    },
    {
      title: 'Beneficio Esp.',
      fullTitle: 'Beneficio esperado total si vendes todo al precio objetivo',
      value: fmtCompact(summary.totalExpectedProfit),
      icon: TrendingUp,
      accent: summary.totalExpectedProfit >= 0 ? 'hsl(160 84% 38%)' : 'hsl(0 72% 51%)',
      accentBg: summary.totalExpectedProfit >= 0 ? 'hsl(160 84% 38% / 0.1)' : 'hsl(0 72% 51% / 0.1)',
      trend: (summary.totalExpectedProfit >= 0 ? 'up' : 'down') as 'up' | 'down' | null,
    },
    {
      title: 'Beneficio Real',
      fullTitle: 'Beneficio real de todas las ventas confirmadas',
      value: fmtCompact(summary.totalRealProfit),
      icon: CheckCircle,
      accent: summary.totalRealProfit >= 0 ? 'hsl(160 84% 38%)' : 'hsl(0 72% 51%)',
      accentBg: summary.totalRealProfit >= 0 ? 'hsl(160 84% 38% / 0.1)' : 'hsl(0 72% 51% / 0.1)',
      trend: (summary.totalRealProfit >= 0 ? 'up' : 'down') as 'up' | 'down' | null,
    },
    {
      title: 'Margen',
      fullTitle: 'Margen de beneficio sobre ingresos esperados',
      value: `${summary.profitMargin.toFixed(1)}%`,
      icon: Percent,
      accent: summary.profitMargin >= 0 ? 'hsl(38 92% 50%)' : 'hsl(0 72% 51%)',
      accentBg: summary.profitMargin >= 0 ? 'hsl(38 92% 50% / 0.1)' : 'hsl(0 72% 51% / 0.1)',
      trend: (summary.profitMargin >= 0 ? 'up' : 'down') as 'up' | 'down' | null,
    },
  ];

  return (
    <TooltipProvider>
      <div>
        <h3 className="mb-3 text-[9px] font-bold tracking-[0.12em] text-muted-foreground/40 uppercase">
          HISTÓRICO TOTAL
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5 lg:gap-3">
          {cards.map((card, i) => (
            <Tooltip key={card.title}>
              <TooltipTrigger asChild>
                <div className={`kpi-card animate-slide-up-${Math.min(i + 1, 4)}`}>
                  {/* Accent top bar */}
                  <div className="h-[3px] w-full rounded-t-xl" style={{ background: card.accent }} />
                  <div className="p-3 sm:p-4">
                    {/* Icon row */}
                    <div className="flex items-start justify-between gap-1 mb-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                        style={{ background: card.accentBg }}
                      >
                        <card.icon className="h-[15px] w-[15px]" style={{ color: card.accent }} />
                      </div>
                      {card.trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />}
                      {card.trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />}
                    </div>
                    {/* Label */}
                    <p className="text-[10px] font-medium text-muted-foreground leading-snug mb-1">{card.title}</p>
                    {/* Number — full width, shrinks to fit */}
                    <p
                      className="stat-number font-bold leading-tight"
                      style={{
                        color: card.accent,
                        fontSize: 'clamp(0.8rem, 1.4vw, 1.35rem)',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-all',
                      }}
                    >
                      {card.value}
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="hidden lg:block max-w-[180px] text-xs text-center">
                <p>{card.fullTitle}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
