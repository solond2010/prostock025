import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';

interface FinanceSummaryCardsProps {
  ingresos: number;
  gastos: number;
}

const fmtEur = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v);

export function FinanceSummaryCards({ ingresos, gastos }: FinanceSummaryCardsProps) {
  const ahorroNeto = ingresos - gastos;
  const porcentajeAhorro = ingresos > 0 ? (ahorroNeto / ingresos) * 100 : 0;

  const savingsAccent = porcentajeAhorro >= 20
    ? 'hsl(var(--success))'
    : porcentajeAhorro >= 10
    ? 'hsl(38,92%,46%)'
    : 'hsl(var(--destructive))';

  const cards = [
    {
      label: 'Ingresos del mes',
      value: `+${fmtEur(ingresos)}`,
      icon: TrendingUp,
      accent: 'hsl(var(--success))',
    },
    {
      label: 'Gastos del mes',
      value: `-${fmtEur(gastos)}`,
      icon: TrendingDown,
      accent: 'hsl(var(--destructive))',
    },
    {
      label: 'Ahorro neto',
      value: `${ahorroNeto >= 0 ? '+' : ''}${fmtEur(ahorroNeto)}`,
      icon: PiggyBank,
      accent: ahorroNeto >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
    },
    {
      label: '% Ahorro',
      value: ingresos > 0 ? `${porcentajeAhorro.toFixed(1)}%` : '—',
      icon: Percent,
      accent: savingsAccent,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="kpi-card p-4" style={{ borderTop: `3px solid ${card.accent}` }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                style={{ background: `${card.accent}18` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: card.accent }} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
            </div>
            <p className="text-2xl font-bold leading-none tabular-nums" style={{ color: card.accent }}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
