import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';

interface DuplicateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onConfirm: (count: number) => void;
  isLoading?: boolean;
}

export function DuplicateProductDialog({
  open,
  onOpenChange,
  productName,
  onConfirm,
  isLoading = false,
}: DuplicateProductDialogProps) {
  const [count, setCount] = useState(1);

  // Resetear el contador cada vez que se abre (también al abrirlo desde la tabla,
  // donde onOpenChange no se dispara y el valor anterior quedaría pegado).
  useEffect(() => {
    if (open) setCount(1);
  }, [open]);

  const handleConfirm = () => {
    if (count > 0) {
      onConfirm(count);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicar producto
          </DialogTitle>
          <DialogDescription>
            Vas a duplicar: <strong>{productName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="copy-count">¿Cuántas copias quieres crear?</Label>
          <Input
            id="copy-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Se crearán {count} {count === 1 ? 'copia' : 'copias'} con estado "En stock"
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || count < 1} className="btn-primary-gradient text-white">
            {isLoading ? 'Duplicando...' : `Crear ${count} ${count === 1 ? 'copia' : 'copias'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
