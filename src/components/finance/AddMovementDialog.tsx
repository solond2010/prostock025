import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CATEGORIES, NewMovement } from '@/hooks/usePersonalFinance';
import { es } from 'date-fns/locale';

interface AddMovementDialogProps {
  onSave: (movement: NewMovement) => void;
  isLoading?: boolean;
}

export function AddMovementDialog({ onSave, isLoading }: AddMovementDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState<Date>(new Date());
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const resetForm = () => {
    setType('expense');
    setDate(new Date());
    setConcept('');
    setCategory('');
    setAmount('');
  };

  const handleSave = () => {
    if (!concept.trim() || !category || !amount) return;

    const movement: NewMovement = {
      type,
      date: format(date, 'yyyy-MM-dd'),
      concept: concept.trim(),
      category,
      amount: parseFloat(amount),
    };

    onSave(movement);
    setOpen(false);
    resetForm();
  };

  const handleCancel = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Añadir movimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo movimiento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="concept">Concepto</Label>
            <Input
              id="concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Nómina, Compra supermercado..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Importe (€)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!concept.trim() || !category || !amount || isLoading}
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
