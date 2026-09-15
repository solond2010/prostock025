import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string;
  plan: string | null;
  current_period_end: string | null;
}

export function useSubscription() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('id,status,trial_ends_at,plan,current_period_end')
        .eq('id', user!.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return (data as unknown as Profile) ?? null;
    },
  });

  const profile = query.data ?? null;
  const now = Date.now();
  const trialEnds = profile?.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0;

  const isActive = profile?.status === 'active';
  const isTrial = profile?.status === 'trial' && trialEnds > now;
  // Si no hay perfil aún (carga/cuenta antigua), no bloqueamos para evitar falsos positivos.
  const hasAccess = !profile || isActive || isTrial;
  const trialDaysLeft = isTrial ? Math.max(0, Math.ceil((trialEnds - now) / 86_400_000)) : 0;

  return {
    profile,
    isLoading: query.isLoading,
    hasAccess,
    isActive,
    isTrial,
    trialDaysLeft,
  };
}
