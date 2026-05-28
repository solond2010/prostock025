import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  priority: 'high' | 'medium' | 'low';
  is_done: boolean;
  due_date: string | null;
  linked_stock_id: string | null;
  linked_deal_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type TaskInsert = Pick<Task, 'title'> & Partial<Pick<Task, 'notes' | 'priority' | 'due_date'>>;

export function useTasks() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['tasks'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks' as any)
        .select('*')
        .order('is_done', { ascending: true })
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });
      if (error) throw error;
      return (data as unknown as Task[]) ?? [];
    },
  });

  const addTask = useMutation({
    mutationFn: async (input: TaskInsert) => {
      if (!user) throw new Error('Sin sesión');
      const { error } = await supabase.from('tasks' as any).insert({ ...input, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const toggleDone = useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      const { error } = await supabase
        .from('tasks' as any)
        .update({ is_done: isDone, completed_at: isDone ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return { tasks: query.data ?? [], isLoading: query.isLoading, addTask, toggleDone, deleteTask };
}
