import { Card, CardContent } from '@/components/ui/card';
import { StockSummary } from '@/types/stock';
import { DollarSign, TrendingUp, Wallet, Percent } from 'lucide-react';

interface SummaryCardsProps {
  summary: StockSummary;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Invested',
      value: formatCurrency(summary.totalInvested),
      icon: Wallet,
      className: 'text-foreground',
    },
    {
      title: 'Expected Revenue',
      value: formatCurrency(summary.totalExpectedRevenue),
      icon: DollarSign,
      className: 'text-primary',
    },
    {
      title: 'Expected Profit',
      value: formatCurrency(summary.totalExpectedProfit),
      icon: TrendingUp,
      className: summary.totalExpectedProfit >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      title: 'Profit Margin',
      value: `${summary.profitMargin.toFixed(1)}%`,
      icon: Percent,
      className: summary.profitMargin >= 0 ? 'text-success' : 'text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className={`mt-1 text-2xl font-semibold ${card.className}`}>{card.value}</p>
              </div>
              <div className="rounded-lg bg-secondary p-2.5">
                <card.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
