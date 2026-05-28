import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CalEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: 'sale' | 'purchase' | 'repair' | 'other';
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  amount: number | null;
  linked_stock_id: string | null;
  linked_deal_id: string | null;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export type EventInsert = Pick<CalEvent, 'title' | 'starts_at'> &
  Partial<Pick<CalEvent, 'description' | 'event_type' | 'ends_at' | 'location' | 'contact_name' | 'contact_phone' | 'amount'>>;

export function useEvents() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['events'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events' as any)
        .select('*')
        .gte('starts_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('starts_at', { ascending: true });
      if (error) throw error;
      return (data as unknown as CalEvent[]) ?? [];
    },
  });

  const addEvent = useMutation({
    mutationFn: async (input: EventInsert) => {
      if (!user) throw new Error('Sin sesión');
      const { error } = await supabase.from('events' as any).insert({ ...input, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  return { events: query.data ?? [], isLoading: query.isLoading, addEvent, deleteEvent };
}
