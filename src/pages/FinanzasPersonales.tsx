import { useMemo, useState } from 'react';
import { format, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePersonalFinance } from '@/hooks/usePersonalFinance';
import { FinanceSummaryCards } from '@/components/finance/FinanceSummaryCards';
import { MovementsTable } from '@/components/finance/MovementsTable';
import { AddMovementDialog } from '@/components/finance/AddMovementDialog';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function FinanzasPersonales() {
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  
  const { movements, isLoading, addMovement, deleteMovement } = usePersonalFinance();

  const filteredMovements = useMemo(() => {
    return movements.filter((mov) => {
      const movDate = new Date(mov.date);
      return getMonth(movDate) === selectedMonth && getYear(movDate) === selectedYear;
    });
  }, [movements, selectedMonth, selectedYear]);

  const { ingresos, gastos } = useMemo(() => {
    return filteredMovements.reduce(
      (acc, mov) => {
        if (mov.type === 'income') {
          acc.ingresos += mov.amount;
        } else {
          acc.gastos += mov.amount;
        }
        return acc;
      },
      { ingresos: 0, gastos: 0 }
    );
  }, [filteredMovements]);

  const monthLabel = `${MONTHS[selectedMonth]} ${selectedYear}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Finanzas personales
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Controla tus ingresos y gastos mensuales
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AddMovementDialog
              onSave={(mov) => addMovement.mutate(mov)}
              isLoading={addMovement.isPending}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <FinanceSummaryCards ingresos={ingresos} gastos={gastos} />

        {/* Movements Table */}
        <MovementsTable
          movements={filteredMovements}
          monthLabel={monthLabel}
          onDelete={(id) => deleteMovement.mutate(id)}
          isDeleting={deleteMovement.isPending}
        />
      </div>
    </div>
  );
}
