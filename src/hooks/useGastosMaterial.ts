import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface GastoMaterial {
  id: string;
  fecha: string;
  concepto: string;
  categoria: string;
  coste: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface GastoMaterialInsert {
  fecha: string;
  concepto: string;
  categoria: string;
  coste: number;
  notas?: string | null;
}

export const useGastosMaterial = () => {
  const queryClient = useQueryClient();

  const { data: gastos = [], isLoading, error } = useQuery({
    queryKey: ['gastos_material'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gastos_material')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      return data as GastoMaterial[];
    },
  });

  const addGasto = useMutation({
    mutationFn: async (gasto: GastoMaterialInsert) => {
      const { data, error } = await supabase
        .from('gastos_material')
        .insert([gasto])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos_material'] });
      toast({
        title: 'Gasto añadido',
        description: 'El gasto se ha registrado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo añadir el gasto.',
        variant: 'destructive',
      });
      console.error('Error adding gasto:', error);
    },
  });

  const deleteGasto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gastos_material')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos_material'] });
      toast({
        title: 'Gasto eliminado',
        description: 'El gasto se ha eliminado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el gasto.',
        variant: 'destructive',
      });
      console.error('Error deleting gasto:', error);
    },
  });

  return {
    gastos,
    isLoading,
    error,
    addGasto,
    deleteGasto,
  };
};
