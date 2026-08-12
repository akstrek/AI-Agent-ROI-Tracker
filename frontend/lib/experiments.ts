import { supabase } from '@/lib/supabase';

export const CONDITIONS = ['Alpha - Flow A', 'Beta - Flow B'] as const;

export interface ActiveExperiment {
  id: string;
  name: string;
  start_date: string | null;
  condition_assignment: string;
  status: 'Running' | 'Paused' | 'Completed';
  created_at: string;
}

export interface ExperimentResultRow {
  condition: string | null;
  time_mins: number | null;
  status: string;
}

/**
 * The single Running experiment (if any) used to drive the Logging form's
 * condition dropdown. Uses `maybeSingle()` because new users have zero
 * experiments, and `.order().limit(1)` to stay deterministic if multiple
 * Running experiments somehow exist.
 */
export async function fetchActiveExperiment(userId: string) {
  return supabase
    .from('experiments')
    .select('id, name, start_date, condition_assignment, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'Running')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
}

/**
 * Tasks linked to a specific experiment via the real `experiment_id` FK.
 * Legacy rows that only carry `experiment_link` (no `experiment_id`) are
 * intentionally excluded — there is no way to backfill which experiment
 * they belonged to.
 *
 * Deliberately NOT wrapped in `async` (which would eagerly await the
 * chain): callers that need to further scope the query (e.g. filter by
 * `start_date`) can chain additional builder methods before awaiting.
 */
export function fetchExperimentResults(userId: string, experimentId: string) {
  return supabase
    .from('tasks')
    .select('condition, time_mins, status')
    .eq('user_id', userId)
    .eq('experiment_id', experimentId);
}
