import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface BotSearch {
  id: string;
  user_id: string;
  name: string;
  keywords: string;
  order_by: 'newest' | 'relevance';
  time_filter: 'today' | 'lastWeek' | 'lastMonth';
  distance_km: number | null;
  lat: number | null;
  lng: number | null;
  min_price: number | null;
  max_price: number | null;
  active: boolean;
  created_at: string;
}

export type NewBotSearch = Omit<BotSearch, 'id' | 'user_id' | 'created_at'>;

export function useBotSearches() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['bot-searches', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bot_searches' as any)
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as unknown as BotSearch[]) ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (s: NewBotSearch) => {
      const { error } = await supabase.from('bot_searches' as any).insert(s as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bot-searches'] }); toast.success('Búsqueda guardada'); },
    onError: (e: any) => toast.error('Error al guardar: ' + e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<BotSearch> }) => {
      const { error } = await supabase.from('bot_searches' as any).update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bot-searches'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bot_searches' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bot-searches'] }); toast.success('Búsqueda eliminada'); },
  });

  return { searches: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
