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

const FRESH_MS = 5 * 60 * 1000;

/** El proceso del bot ha dado señales de vida hace menos de 5 min. */
export function isBotFresh(status: BotStatus | null | undefined): boolean {
  if (!status || !status.updated_at) return false;
  return Date.now() - new Date(status.updated_at).getTime() < FRESH_MS;
}

/** Online = vivo Y buscando (no pausado). */
export function isBotOnline(status: BotStatus | null | undefined): boolean {
  return !!status?.is_running && isBotFresh(status);
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
        .maybeSingle();
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
    mutationFn: async (command: 'pause' | 'resume' | 'stop') => {
      const { error } = await supabase
        .from('bot_commands' as any)
        .insert({ user_id: user!.id, command, status: 'pending' });
      if (error) throw error;
    },
    onSuccess: () => {
      // refresco rápido para reflejar el cambio en cuanto el bot responda
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['bot-status'] }), 1500);
    },
  });

  const fresh = isBotFresh(query.data);
  const online = isBotOnline(query.data);
  const paused = fresh && !query.data?.is_running; // vivo pero sin buscar

  return {
    status: query.data ?? null,
    isLoading: query.isLoading,
    online,
    paused,
    fresh,
    sendCommand,
  };
}
