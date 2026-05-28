import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface BotStatus {
  id: string;
  user_id: string;
  is_running: boolean;
  pid: number | null;
  started_at: string | null;
  last_search_at: string | null;
  next_search_at: string | null;
  current_search: string | null;
  searches_today: number;
  messages_today: number;
  items_seen_today: number;
  last_logs: string | null;
  updated_at: string;
}

/** Considera el bot offline si no actualizó su estado en >5 min */
export function isBotOnline(status: BotStatus | null | undefined): boolean {
  if (!status || !status.is_running) return false;
  if (!status.updated_at) return false;
  const diff = Date.now() - new Date(status.updated_at).getTime();
  return diff < 5 * 60 * 1000;
}

export function useBotStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['bot-status'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bot_status' as any)
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return (data as unknown as BotStatus) ?? null;
    },
    refetchInterval: 30000, // fallback polling cada 30s
  });

  // Realtime — el bot actualiza bot_status cada ~2 min
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('bot-status-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bot_status', filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['bot-status'] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  // Enviar comando al bot
  const sendCommand = useMutation({
    mutationFn: async (command: 'stop') => {
      const { error } = await supabase
        .from('bot_commands' as any)
        .insert({ user_id: user!.id, command, status: 'pending' });
      if (error) throw error;
    },
  });

  const online = isBotOnline(query.data);

  return {
    status: query.data ?? null,
    isLoading: query.isLoading,
    online,
    sendCommand,
  };
}
