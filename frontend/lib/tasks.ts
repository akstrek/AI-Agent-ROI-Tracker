import { supabase } from '@/lib/supabase';

export interface TaskRow {
  id: string;
  task_descriptor: string;
  node_assign: string;
  priority: string;
  mode: string;
  time_mins: number | null;
  experiment_link: string;
  status: 'COMPLETED' | 'PENDING';
  created_at: string;
}

export async function fetchRecentTasks(userId: string, limit = 25) {
  return supabase.from('tasks')
    .select('id, task_descriptor, node_assign, priority, mode, time_mins, experiment_link, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function updateTaskStatus(id: string, status: 'COMPLETED' | 'PENDING') {
  return supabase.from('tasks').update({ status }).eq('id', id);
}

export async function updateTaskTime(id: string, time_mins: number | null) {
  return supabase.from('tasks').update({ time_mins }).eq('id', id);
}

export async function deleteTask(id: string) {
  return supabase.from('tasks').delete().eq('id', id);
}
