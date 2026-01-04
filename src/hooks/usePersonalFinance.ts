import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PersonalFinanceMovement {
  id: string;
  date: string;
  type: 'income' | 'expense';
  concept: string;
  category: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export type NewMovement = Omit<PersonalFinanceMovement, 'id' | 'created_at' | 'updated_at'>;

export const CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Suscripciones',
  'Ocio',
  'Hogar',
  'Salud',
  'Compras',
  'Trabajo',
  'Otros',
] as const;

export function usePersonalFinance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: movements = [], isLoading, error } = useQuery({
    queryKey: ['personal-finance-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_finance_movements')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as PersonalFinanceMovement[];
    },
  });

  const addMovement = useMutation({
    mutationFn: async (movement: NewMovement) => {
      const { data, error } = await supabase
        .from('personal_finance_movements')
        .insert([movement])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-finance-movements'] });
      toast({
        title: 'Movimiento guardado',
        description: 'El movimiento se ha añadido correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el movimiento.',
        variant: 'destructive',
      });
      console.error('Error adding movement:', error);
    },
  });

  const deleteMovement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('personal_finance_movements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-finance-movements'] });
      toast({
        title: 'Movimiento eliminado',
        description: 'El movimiento se ha eliminado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el movimiento.',
        variant: 'destructive',
      });
      console.error('Error deleting movement:', error);
    },
  });

  return {
    movements,
    isLoading,
    error,
    addMovement,
    deleteMovement,
  };
}
