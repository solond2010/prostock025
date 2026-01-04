import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FinanceSummaryCardsProps {
  ingresos: number;
  gastos: number;
}

export function FinanceSummaryCards({ ingresos, gastos }: FinanceSummaryCardsProps) {
  const ahorroNeto = ingresos - gastos;
  const porcentajeAhorro = ingresos > 0 ? (ahorroNeto / ingresos) * 100 : 0;

  const getAhorroColor = (value: number) => {
    if (value >= 20) return 'text-emerald-500';
    if (value >= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Ingresos */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ingresos del mes</p>
              <p className="text-2xl font-bold text-emerald-500">
                +{ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gastos del mes</p>
              <p className="text-2xl font-bold text-red-500">
                -{gastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ahorro Neto */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ahorro neto</p>
              <p className={`text-2xl font-bold ${ahorroNeto >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {ahorroNeto >= 0 ? '+' : ''}{ahorroNeto.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${ahorroNeto >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <PiggyBank className={`h-5 w-5 ${ahorroNeto >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* % Ahorro */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">% Ahorro</p>
              <p className={`text-2xl font-bold ${getAhorroColor(porcentajeAhorro)}`}>
                {ingresos > 0 ? `${porcentajeAhorro.toFixed(1)}%` : '—'}
              </p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${ingresos > 0 ? (porcentajeAhorro >= 10 ? 'bg-emerald-500/10' : 'bg-yellow-500/10') : 'bg-muted/50'}`}>
              <Percent className={`h-5 w-5 ${getAhorroColor(porcentajeAhorro)}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
