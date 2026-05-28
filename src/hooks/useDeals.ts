import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PipelineStatus = 'found' | 'contacted' | 'responded' | 'bought' | 'repairing' | 'sold';

export interface Deal {
  id: string;
  user_id: string;
  item_id: string;
  item_url: string;
  title: string;
  price: number | null;
  description: string | null;
  image_url: string | null;
  location: string | null;
  seller_id: string | null;
  search_keyword: string | null;
  score: 'fire' | 'good' | 'ok';
  is_archived: boolean;
  message_status: 'pending' | 'queued' | 'sending' | 'sent' | 'failed' | 'skipped';
  message_sent_at: string | null;
  pipeline_status: PipelineStatus | null;
  created_at: string;
  updated_at: string;
}

interface UseDealsCallbacks {
  onDealFailed?: (deal: Deal) => void;
  onDealSent?: (deal: Deal) => void;
}

export function useDeals(
  filter: { onlyFire?: boolean; maxPrice?: number } = {},
  callbacks?: UseDealsCallbacks
) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // Use ref so the Realtime subscription doesn't re-create on every render
  const callbacksRef = useRef<UseDealsCallbacks | undefined>(callbacks);
  callbacksRef.current = callbacks;

  const query = useQuery({
    queryKey: ['deals', filter],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from('deals' as any)
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(200);                        // increased from 50
      if (filter.onlyFire) q = q.eq('score', 'fire');
      if (filter.maxPrice) q = q.lte('price', filter.maxPrice);
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as Deal[]) ?? [];
    },
  });

  // Separate COUNT query — not capped by the display limit
  const statsQuery = useQuery({
    queryKey: ['deals-stats'],
    enabled: !!user,
    staleTime: 30_000,           // refresh every 30 s
    queryFn: async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [todayRes, sentRes, pendingRes, fireRes] = await Promise.all([
        supabase
          .from('deals' as any)
          .select('id', { count: 'exact', head: true })
          .eq('is_archived', false)
          .gte('created_at', startOfToday.toISOString()),
        supabase
          .from('deals' as any)
          .select('id', { count: 'exact', head: true })
          .eq('is_archived', false)
          .eq('message_status', 'sent'),
        supabase
          .from('deals' as any)
          .select('id', { count: 'exact', head: true })
          .eq('is_archived', false)
          .eq('message_status', 'pending'),
        supabase
          .from('deals' as any)
          .select('id', { count: 'exact', head: true })
          .eq('is_archived', false)
          .eq('score', 'fire')
          .gte('created_at', startOfToday.toISOString()),
      ]);

      return {
        todayTotal:    todayRes.count   ?? 0,
        sentTotal:     sentRes.count    ?? 0,
        pendingTotal:  pendingRes.count ?? 0,
        fireTodayTotal: fireRes.count   ?? 0,
      };
    },
  });

  // Realtime: invalidate cache and fire callbacks on status changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('deals-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          queryClient.invalidateQueries({ queryKey: ['deals'] });
          const updated = payload.new as unknown as Deal | undefined;
          if (!updated) return;
          if (updated.message_status === 'failed') {
            callbacksRef.current?.onDealFailed?.(updated);
          } else if (updated.message_status === 'sent') {
            callbacksRef.current?.onDealSent?.(updated);
            // Auto-advance pipeline: found → contacted when message is sent
            const pipeStatus = updated.pipeline_status ?? 'found';
            if (pipeStatus === 'found') {
              await supabase
                .from('deals' as any)
                .update({ pipeline_status: 'contacted' })
                .eq('id', updated.id);
            }
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const markSent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals' as any)
        .update({ message_status: 'sent', message_sent_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  const archive = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals' as any)
        .update({ is_archived: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  const queueSend = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals' as any)
        .update({ message_status: 'queued' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  const updatePipeline = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PipelineStatus }) => {
      const { error } = await supabase
        .from('deals' as any)
        .update({ pipeline_status: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  return {
    deals: query.data ?? [],
    isLoading: query.isLoading,
    // Real counts from DB — not limited by the display cap
    realStats: statsQuery.data ?? { todayTotal: 0, sentTotal: 0, pendingTotal: 0, fireTodayTotal: 0 },
    markSent,
    archive,
    queueSend,
    updatePipeline,
  };
}
