import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Ajuste numérico guardado en la nube (tabla app_settings).
 * Sirve para que los objetivos no dependan del dispositivo.
 */
export function useNumericSetting(key: string, defaultValue: number) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['app_setting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) throw error;
      const num = data ? Number(data.value) : NaN;
      return Number.isFinite(num) ? num : defaultValue;
    },
  });

  const mutation = useMutation({
    mutationFn: async (value: number) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value: String(value) }, { onConflict: 'key' });
      if (error) throw error;
      return value;
    },
    onSuccess: (value) => {
      queryClient.setQueryData(['app_setting', key], value);
    },
  });

  return {
    value: data ?? defaultValue,
    isLoading,
    setValue: (v: number) => mutation.mutate(v),
  };
}
