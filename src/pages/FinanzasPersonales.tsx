import { useMemo, useState } from 'react';
import { getMonth, getYear } from 'date-fns';
import { Wallet, TrendingDown, TrendingUp, Scale } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePersonalFinance } from '@/hooks/usePersonalFinance';
import { FinanceSummaryCards } from '@/components/finance/FinanceSummaryCards';
import { MovementsTable } from '@/components/finance/MovementsTable';
import { AddMovementDialog } from '@/components/finance/AddMovementDialog';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const fmtEur = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function FinanzasPersonales() {
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));

  const { movements, isLoading, addMovement, deleteMovement } = usePersonalFinance();

  const filteredMovements = useMemo(() => {
    return movements.filter(mov => {
      const d = new Date(mov.date);
      return getMonth(d) === selectedMonth && getYear(d) === selectedYear;
    });
  }, [movements, selectedMonth, selectedYear]);

  const { ingresos, gastos } = useMemo(() => {
    return filteredMovements.reduce(
      (acc, mov) => {
        if (mov.type === 'income') acc.ingresos += mov.amount;
        else acc.gastos += mov.amount;
        return acc;
      },
      { ingresos: 0, gastos: 0 }
    );
  }, [filteredMovements]);

  const balance = ingresos - gastos;
  const monthLabel = `${MONTHS[selectedMonth]} ${selectedYear}`;

  const selectors = (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
        <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {MONTHS.map((month, i) => <SelectItem key={i} value={i.toString()}>{month}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
        <SelectTrigger className="h-9 w-[100px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {YEARS.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
        </SelectContent>
      </Select>
      <AddMovementDialog onSave={mov => addMovement.mutate(mov)} isLoading={addMovement.isPending} />
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-6">

      <PageHeader
        icon={Wallet}
        title="Finanzas Personales"
        subtitle="Controla tus ingresos y gastos mensuales"
        iconColor="green"
        actions={selectors}
      />

      {/* Quick KPI strip */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up-1">
        <div className="kpi-card p-4" style={{ borderTop: '3px solid hsl(var(--success))' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span className="text-xs text-muted-foreground font-medium">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-success leading-none">{fmtEur(ingresos)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{monthLabel}</p>
        </div>
        <div className="kpi-card p-4" style={{ borderTop: '3px solid hsl(var(--destructive))' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs text-muted-foreground font-medium">Gastos</span>
          </div>
          <p className="text-2xl font-bold text-destructive leading-none">{fmtEur(gastos)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{monthLabel}</p>
        </div>
        <div
          className="kpi-card p-4"
          style={{ borderTop: `3px solid ${balance >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-3.5 w-3.5" style={{ color: balance >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }} />
            <span className="text-xs text-muted-foreground font-medium">Balance</span>
          </div>
          <p
            className="text-2xl font-bold leading-none"
            style={{ color: balance >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}
          >
            {balance >= 0 ? '+' : ''}{fmtEur(balance)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{monthLabel}</p>
        </div>
      </div>

      {/* Summary cards from component */}
      <FinanceSummaryCards ingresos={ingresos} gastos={gastos} />

      {/* Movements table */}
      <MovementsTable
        movements={filteredMovements}
        monthLabel={monthLabel}
        onDelete={id => deleteMovement.mutate(id)}
        isDeleting={deleteMovement.isPending}
      />
    </div>
  );
}
