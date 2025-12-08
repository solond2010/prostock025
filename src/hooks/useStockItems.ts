import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockItem, StockItemFormData } from '@/types/stock';
import { toast } from 'sonner';

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
      const { data, error } = await supabase
        .from('stock_items')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      toast.success('Item added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add item: ' + error.message);
    },
  });
}

export function useUpdateStockItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, item }: { id: string; item: Partial<StockItemFormData> }) => {
      const { data, error } = await supabase
        .from('stock_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      toast.success('Item updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update item: ' + error.message);
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
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete item: ' + error.message);
    },
  });
}
