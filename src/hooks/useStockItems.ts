import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockItem, StockItemFormData } from '@/types/stock';
import { toast } from 'sonner';

// Helper to sanitize form data before sending to DB
function sanitizeFormData(item: StockItemFormData) {
  return {
    ...item,
    purchase_date: item.purchase_date || null,
    fecha_venta: item.fecha_venta || null,
    almacenamiento: item.almacenamiento || null,
    bateria_porcentaje: item.bateria_porcentaje ?? null,
    reparaciones: item.reparaciones && item.reparaciones.length > 0 ? item.reparaciones : null,
  };
}

export function useStockItems() {
  return useQuery({
    queryKey: ['stock-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StockItem[];
    },
  });
}

export function useCreateStockItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: StockItemFormData) => {
      const sanitizedItem = sanitizeFormData(item);
      const { data, error } = await supabase
        .from('stock_items')
        .insert([sanitizedItem])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      toast.success('Producto añadido correctamente');
    },
    onError: (error) => {
      toast.error('Error al añadir producto: ' + error.message);
    },
  });
}

export function useUpdateStockItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, item }: { id: string; item: Partial<StockItemFormData> }) => {
      const sanitizedItem = sanitizeFormData(item as StockItemFormData);
      const { data, error } = await supabase
        .from('stock_items')
        .update(sanitizedItem)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      toast.success('Producto actualizado correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar producto: ' + error.message);
    },
  });
}

export function useDeleteStockItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      toast.success('Producto eliminado correctamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar producto: ' + error.message);
    },
  });
}
