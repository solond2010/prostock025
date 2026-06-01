import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminProfile {
  id: string;
  email: string | null;
  status: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string;
  plan: string | null;
  created_at: string;
}

export function useAdminProfiles() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('id,email,status,trial_ends_at,plan,created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as AdminProfile[]) ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<AdminProfile> }) => {
      const { error } = await supabase.from('profiles' as any).update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-profiles'] }),
  });

  return { profiles: query.data ?? [], isLoading: query.isLoading, update };
}
