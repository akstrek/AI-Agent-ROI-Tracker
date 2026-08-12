'use client'

import { motion } from 'motion/react';
import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { logEvent } from '@/lib/analytics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CONDITIONS, fetchExperimentResults } from '@/lib/experiments';

interface Experiment {
  id: string;
  name: string;
  start_date: string | null;
  condition_assignment: string;
  status: 'Running' | 'Paused' | 'Completed';
}

interface ConditionResult {
  name: string;
  count: number;
  avgTime: number;
  completionRate: number;
}

export const ExperimentView = memo(function ExperimentView() {
  const { user } = useAuth();
  const [activeExp, setActiveExp] = useState<Experiment | null>(null);
  const [conditions, setConditions] = useState<ConditionResult[]>([]);
  const [syncRate, setSyncRate] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    start_date: '',
    condition_assignment: 'Latency Factor C',
  });

  const requestRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const id = ++requestRef.current;
    setDataLoading(true);
    setError(null);

    // Fetch the most recent non-completed experiment
    const { data: expData, error: expError } = await supabase
      .from('experiments')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'Completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (id !== requestRef.current) return; // a newer fetch superseded this one

    if (expError) {
      setError(expError.message);
      setActiveExp(null);
      setConditions([]);
      setSyncRate(0);
      setDataLoading(false);
      return;
    }

    const exp = (expData as Experiment) ?? null;
    setActiveExp(exp);

    if (!exp) {
      // No experiment to scope results to — nothing to fetch.
      setConditions([]);
      setSyncRate(0);
      setDataLoading(false);
      return;
    }

    // Fetch tasks linked to this specific experiment via experiment_id,
    // scoped to on-or-after the experiment's start_date (local midnight).
    let taskQuery = fetchExperimentResults(user.id, exp.id);
    if (exp.start_date) {
      const startOfDayLocal = new Date(`${exp.start_date}T00:00:00`);
      taskQuery = taskQuery.gte('created_at', startOfDayLocal.toISOString());
    }
    const { data: tasks, error: tasksError } = await taskQuery;

    if (id !== requestRef.current) return; // a newer fetch superseded this one

    if (tasksError) {
      setError(tasksError.message);
      setConditions([]);
      setSyncRate(0);
      setDataLoading(false);
      return;
    }

    if (tasks && tasks.length > 0) {
      const groups: Record<string, { time_mins: number | null; status: string }[]> = {};
      tasks.forEach((t: { condition: string | null; time_mins: number | null; status: string }) => {
        if (!t.condition) return;
        if (!groups[t.condition]) groups[t.condition] = [];
        groups[t.condition].push({ time_mins: t.time_mins, status: t.status });
      });

      const condResults: ConditionResult[] = Object.entries(groups).map(([name, rows]) => {
        const completed = rows.filter(r => r.status === 'COMPLETED');
        const avgTime = completed.length
          ? Math.round(completed.reduce((s, r) => s + (r.time_mins ?? 0), 0) / completed.length)
          : 0;
        const completionRate = rows.length
          ? parseFloat(((completed.length / rows.length) * 100).toFixed(1))
          : 0;
        return { name, count: rows.length, avgTime, completionRate };
      });

      setConditions(condResults);

      const scopedTasks = tasks.filter((t: { condition: string | null }) => t.condition);
      const totalCompleted = scopedTasks.filter((t: { status: string }) => t.status === 'COMPLETED').length;
      setSyncRate(scopedTasks.length ? parseFloat(((totalCompleted / scopedTasks.length) * 100).toFixed(2)) : 0);
    } else {
      setConditions([]);
      setSyncRate(0);
    }

    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name) return;
    setSubmitting(true);
    setError(null);

    // Block deploying a second Running experiment — count Running
    // experiments rather than assuming there's at most one already.
    const { data: runningExps, error: runningError } = await supabase
      .from('experiments')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'Running');

    if (runningError) {
      setError(runningError.message);
      setSubmitting(false);
      return;
    }

    if (runningExps && runningExps.length > 0) {
      setError('Halt the current experiment first.');
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('experiments').insert({
      user_id: user.id,
      name: form.name,
      start_date: form.start_date || null,
      condition_assignment: form.condition_assignment,
      status: 'Running',
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    await logEvent(user.id, 'experiment_created', {
      name: form.name,
      condition: form.condition_assignment,
    });
    setForm({ name: '', start_date: '', condition_assignment: 'Latency Factor C' });
    await fetchData();
    setSubmitting(false);
  };

  const handleStatusToggle = async () => {
    if (!activeExp || !user) return;
    setError(null);
    const newStatus: 'Running' | 'Paused' = activeExp.status === 'Running' ? 'Paused' : 'Running';
    const { error: updateError } = await supabase.from('experiments').update({ status: newStatus }).eq('id', activeExp.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await logEvent(user.id, 'experiment_status_changed', { id: activeExp.id, status: newStatus });
    await fetchData();
  };

  const status = activeExp?.status ?? 'Running';
  const displayConditions = conditions.length > 0
    ? conditions
    : CONDITIONS.map(name => ({ name, count: 0, avgTime: 0, completionRate: 0 }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 flex flex-col gap-8">
        <div className="bg-[#0a0a0a]/40 backdrop-blur-md p-8 rounded-3xl border border-[#7f8c8d]/20 flex flex-col hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500">
          <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] mb-6">Create Experiment</h3>
          <form onSubmit={handleDeploy} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Experiment Name</label>
              <input
                type="text"
                placeholder="Protocol Omega..."
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-3 rounded-lg text-white font-mono text-sm outline-none focus:border-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-3 rounded-lg text-white font-mono text-sm outline-none focus:border-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Condition Assignment</label>
              <select
                value={form.condition_assignment}
                onChange={e => setForm(prev => ({ ...prev, condition_assignment: e.target.value }))}
                className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-3 rounded-lg text-white font-mono text-sm outline-none focus:border-white transition-all cursor-pointer"
              >
                <option>Latency Factor C</option>
                <option>Yield Threshold</option>
                <option>Strict Mode</option>
              </select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <motion.button
              type="submit"
              disabled={submitting || !form.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white text-black py-4 rounded-lg font-bold uppercase text-[10px] tracking-[0.2em] mt-2 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.8)] transition-all disabled:opacity-50"
            >
              {submitting ? 'Deploying...' : 'Deploy Set'}
            </motion.button>
          </form>
        </div>

        <div className="bg-[#0a0a0a]/40 backdrop-blur-md p-8 rounded-3xl border border-[#7f8c8d]/20 flex flex-col justify-center flex-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-500">
          <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] mb-8">Network Sync Rate</h3>
          <p className="text-6xl text-white font-brand font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] tracking-tighter mb-8">
            {dataLoading ? '—' : syncRate.toFixed(2)}<span className="text-2xl text-[#7f8c8d]">%</span>
          </p>
          <div className="w-full bg-[#7f8c8d]/20 h-2 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-white shadow-[0_0_15px_white]"
              initial={{ width: "0%" }}
              animate={{ width: `${syncRate}%` }}
              transition={{ duration: 2.5, ease: "circOut" }}
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-[#0a0a0a]/40 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-[#7f8c8d]/20 min-h-[500px] relative overflow-hidden flex flex-col hover:shadow-[0_0_30px_rgba(255,49,49,0.05)] transition-all duration-500">

        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-auto">
              <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] mb-2">
                {activeExp ? activeExp.name : 'Live Experiment Results'}
              </h3>
              {activeExp && (
                <p className="text-[9px] text-[#7f8c8d]/70 font-mono uppercase tracking-widest mb-2">
                  {activeExp.condition_assignment}
                </p>
              )}
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${status === 'Running' ? 'bg-[#FF3131] text-[#FF3131] animate-pulse' : 'bg-[#7f8c8d] text-[#7f8c8d]'}`} />
                <p className="text-[10px] text-[#7f8c8d] font-mono uppercase tracking-widest">
                  Status: <span className="text-white">{status}</span>
                </p>
              </div>
            </div>
          </div>

          <motion.button
            onClick={handleStatusToggle}
            disabled={!activeExp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full md:w-auto border px-8 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all z-20 disabled:opacity-40 ${status === 'Running' ? 'border-[#FF3131] text-[#FF3131] shadow-[0_0_20px_rgba(255,49,49,0.2)] hover:bg-[#FF3131] hover:text-black' : 'border-white text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
          >
            {status === 'Running' ? 'Halt Experiment' : 'Resume Protocol'}
          </motion.button>
        </div>

        <div className="flex-1 flex flex-col gap-6 overflow-x-auto">
          <div className="min-w-[450px]">
            <div className="grid grid-cols-4 gap-4 px-6 border-b border-[#7f8c8d]/20 pb-4 mb-4">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Condition</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d] text-right">Task Count</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d] text-right">Avg Time</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d] text-right">Comp. Rate</span>
            </div>

            <div className="space-y-4">
              {displayConditions.map((cond, idx) => (
                <div key={cond.name} className="grid grid-cols-4 gap-4 items-center bg-black/40 border border-[#7f8c8d]/10 p-5 md:p-6 rounded-2xl hover:border-white/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full shrink-0 ${idx === 0 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-[#FF3131] shadow-[0_0_10px_#FF3131]'}`} />
                    <span className="font-mono text-xs md:text-sm text-white truncate">{cond.name}</span>
                  </div>
                  <div className="text-right font-brand text-xl md:text-2xl text-white">
                    {dataLoading ? '—' : cond.count}
                  </div>
                  <div className="text-right font-brand text-xl md:text-2xl text-white">
                    {dataLoading ? '—' : cond.avgTime > 0 ? `${cond.avgTime}m` : '—'}
                  </div>
                  <div className="text-right font-brand text-xl md:text-2xl text-[#FF3131] drop-shadow-[0_0_10px_rgba(255,49,49,0.5)]">
                    {dataLoading ? '—' : `${cond.completionRate}%`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto px-6 pt-10">
            <svg className="w-full h-[60px]" preserveAspectRatio="none" viewBox="0 0 100 20">
              {displayConditions[0] && (
                <line
                  x1="0" y1={20 - (displayConditions[0].completionRate / 100) * 15}
                  x2="100" y2={20 - (displayConditions[0].completionRate / 100) * 15}
                  stroke="#7f8c8d" strokeWidth="0.3" strokeDasharray="1 3"
                />
              )}
              {displayConditions[1] && (
                <line
                  x1="0" y1={20 - (displayConditions[1].completionRate / 100) * 15}
                  x2="100" y2={20 - (displayConditions[1].completionRate / 100) * 15}
                  stroke="#FF3131" strokeWidth="0.3" opacity="0.5"
                />
              )}
              <motion.circle
                cx="50" cy="10" r="1" fill="white"
                className="drop-shadow-[0_0_5px_white]"
                animate={{ cx: [10, 90, 10] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
});
