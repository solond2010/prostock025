import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StockItem, StockItemFormData } from '@/types/stock';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required').max(50),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  units_in_stock: z.coerce.number().int().min(0, 'Must be 0 or more'),
  purchase_price_per_unit: z.coerce.number().min(0, 'Must be 0 or more'),
  sale_price_per_unit: z.coerce.number().min(0, 'Must be 0 or more'),
  notes: z.string().max(500).optional(),
});

interface StockItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StockItem | null;
  onSubmit: (data: StockItemFormData) => void;
  isLoading: boolean;
}

export function StockItemDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading,
}: StockItemDialogProps) {
  const form = useForm<StockItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      purchase_date: new Date().toISOString().split('T')[0],
      units_in_stock: 0,
      purchase_price_per_unit: 0,
      sale_price_per_unit: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name,
          category: item.category,
          purchase_date: item.purchase_date,
          units_in_stock: item.units_in_stock,
          purchase_price_per_unit: item.purchase_price_per_unit,
          sale_price_per_unit: item.sale_price_per_unit,
          notes: item.notes || '',
        });
      } else {
        form.reset({
          name: '',
          category: '',
          purchase_date: new Date().toISOString().split('T')[0],
          units_in_stock: 0,
          purchase_price_per_unit: 0,
          sale_price_per_unit: 0,
          notes: '',
        });
      }
    }
  }, [open, item, form]);

  const handleSubmit = (data: StockItemFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Stock Item' : 'Add Stock Item'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="units_in_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchase_price_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buy Price</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_price_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sell Price</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : item ? 'Update' : 'Add Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
