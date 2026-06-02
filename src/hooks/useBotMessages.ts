import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface BotMessage {
  id: string;
  user_id: string;
  text: string;
  active: boolean;
  created_at: string;
}

export function useBotMessages() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['bot-messages', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bot_messages' as any)
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as unknown as BotMessage[]) ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase.from('bot_messages' as any).insert({ text } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bot-messages'] }); toast.success('Mensaje añadido'); },
    onError: (e: any) => toast.error('Error: ' + e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<BotMessage> }) => {
      const { error } = await supabase.from('bot_messages' as any).update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bot-messages'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bot_messages' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bot-messages'] }); toast.success('Mensaje eliminado'); },
  });

  return { messages: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
