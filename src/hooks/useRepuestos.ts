import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Repuesto {
  id: string;
  nombre: string;
  marca: string;
  dispositivo: string | null;
  modelo: string | null;
  cantidad: number;
  notas: string | null;
  created_at: string;
}

export function useRepuestos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['repuestos'],
    queryFn: async (): Promise<Repuesto[]> => {
      const { data, error } = await supabase
        .from('repuestos_inventario' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any) ?? [];
    },
  });

  const addRepuesto = useMutation({
    mutationFn: async (item: { nombre: string; cantidad: number; notas?: string }) => {
      const { error } = await supabase
        .from('repuestos_inventario' as any)
        .insert(item as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      toast({ title: 'Pieza añadida', description: 'Se ha añadido correctamente' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo añadir la pieza', variant: 'destructive' });
    },
  });

  const deleteRepuesto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('repuestos_inventario' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      toast({ title: 'Pieza eliminada', description: 'Se ha eliminado correctamente' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo eliminar la pieza', variant: 'destructive' });
    },
  });

  const updateRepuesto = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; nombre?: string; cantidad?: number; notas?: string | null }) => {
      const { error } = await supabase
        .from('repuestos_inventario' as any)
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      toast({ title: 'Pieza actualizada' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    },
  });

  return { ...query, addRepuesto, deleteRepuesto, updateRepuesto };
}
