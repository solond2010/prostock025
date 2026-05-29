import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { StockItemWithCalculations } from '@/types/stock';

interface SellProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StockItemWithCalculations | null;
  onConfirm: (id: string, fechaVenta: string, precioVentaReal: number) => void;
  isLoading?: boolean;
}

export function SellProductDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false,
}: SellProductDialogProps) {
  const [fechaVenta, setFechaVenta] = useState<Date>(new Date());
  const [precioVentaReal, setPrecioVentaReal] = useState<string>('');

  // Rellenar el formulario cada vez que el diálogo se abre (también al abrirlo
  // programáticamente desde el botón "Vender", donde onOpenChange no se dispara).
  useEffect(() => {
    if (open && item) {
      setFechaVenta(new Date());
      setPrecioVentaReal(
        item.sale_price_per_unit ? item.sale_price_per_unit.toString() : ''
      );
    }
  }, [open, item]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const handleConfirm = () => {
    if (!item) return;
    const precio = precioVentaReal ? parseFloat(precioVentaReal) : 0;
    onConfirm(item.id, format(fechaVenta, 'yyyy-MM-dd'), precio);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-success">✅</span> Confirmar venta
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Product Name - Read Only */}
          <div className="grid gap-2">
            <Label>Producto</Label>
            <Input
              value={item.name}
              disabled
              className="bg-muted font-medium"
            />
          </div>

          {/* Sale Date */}
          <div className="grid gap-2">
            <Label>Fecha de venta</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !fechaVenta && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaVenta
                    ? format(fechaVenta, 'PPP', { locale: es })
                    : 'Selecciona una fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaVenta}
                  onSelect={(date) => date && setFechaVenta(date)}
                  initialFocus
                  className="pointer-events-auto"
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Sale Price */}
          <div className="grid gap-2">
            <Label>Precio de venta real (€)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Introduce el precio de venta"
              value={precioVentaReal}
              onChange={(e) => setPrecioVentaReal(e.target.value)}
            />
            {item.sale_price_per_unit > 0 && (
              <p className="text-xs text-muted-foreground">
                Precio esperado: {item.sale_price_per_unit.toFixed(2)} €
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="transition-all duration-200"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading}
            className="bg-success hover:bg-success/90 text-success-foreground transition-all duration-200 min-w-[140px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Guardando...
              </span>
            ) : (
              '✅ Confirmar venta'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
