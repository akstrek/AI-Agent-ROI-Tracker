'use client'

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { logEvent } from '@/lib/analytics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaskHistory } from '@/components/views/TaskHistory';
import { CONDITIONS, fetchActiveExperiment, type ActiveExperiment } from '@/lib/experiments';

const UNDO_SECONDS = 20;

export const LoggingView = memo(function LoggingView() {
  const { user } = useAuth();
  const [isAi, setIsAi] = useState(true);
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lastTaskId, setLastTaskId] = useState<string | null>(null);
  const [undoCountdown, setUndoCountdown] = useState(0);
  const undoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [activeExp, setActiveExp] = useState<ActiveExperiment | null>(null);

  const [form, setForm] = useState({
    task_descriptor: '',
    node_assign: 'Ergon-Prime',
    priority: 'CRITICAL',
    time_mins: '',
    experiment_link: 'None (Control)',
  });

  const clearUndo = () => {
    setLastTaskId(null);
    setUndoCountdown(0);
    if (undoTimer.current) clearInterval(undoTimer.current);
  };

  useEffect(() => {
    return () => { if (undoTimer.current) clearInterval(undoTimer.current); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setActiveExp(null);
      return;
    }
    fetchActiveExperiment(user.id).then(({ data, error }) => {
      if (cancelled) return;
      setActiveExp(!error && data ? (data as ActiveExperiment) : null);
    });
    return () => { cancelled = true; };
  }, [user]);

  const startUndoTimer = (id: string) => {
    setLastTaskId(id);
    setUndoCountdown(UNDO_SECONDS);
    if (undoTimer.current) clearInterval(undoTimer.current);
    undoTimer.current = setInterval(() => {
      setUndoCountdown(prev => {
        if (prev <= 1) {
          clearInterval(undoTimer.current!);
          setLastTaskId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUndo = async () => {
    if (!lastTaskId || !user) return;
    await supabase.from('tasks').delete().eq('id', lastTaskId).eq('user_id', user.id);
    await logEvent(user.id, 'task_undone', { task_id: lastTaskId });
    clearUndo();
    setHistoryRefreshKey(k => k + 1);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    clearUndo();

    const condition = activeExp && form.experiment_link !== 'None (Control)' ? form.experiment_link : null;

    const { data: inserted, error: insertError } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        task_descriptor: form.task_descriptor,
        node_assign: form.node_assign,
        priority: form.priority,
        mode: isAi ? 'AI-Assist' : 'Human',
        time_mins: form.time_mins ? parseInt(form.time_mins, 10) : null,
        experiment_link: form.experiment_link,
        experiment_id: activeExp?.id ?? null,
        condition,
        status: complete ? 'COMPLETED' : 'PENDING',
      })
      .select('id')
      .single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    await logEvent(user.id, 'task_logged', {
      node: form.node_assign,
      priority: form.priority,
      mode: isAi ? 'AI-Assist' : 'Human',
      status: complete ? 'COMPLETED' : 'PENDING',
    });

    setForm({ task_descriptor: '', node_assign: 'Ergon-Prime', priority: 'CRITICAL', time_mins: '', experiment_link: 'None (Control)' });
    setComplete(false);
    setIsAi(true);
    setSubmitting(false);

    if (inserted?.id) startUndoTimer(inserted.id);
    setHistoryRefreshKey(k => k + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-[#0a0a0a]/40 backdrop-blur-md p-8 rounded-2xl border border-[#7f8c8d]/20 flex flex-col hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-500">
        <h3 className="text-white text-[11px] font-mono mb-8 uppercase tracking-[0.2em]">Command Terminal</h3>
        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Task Descriptor</label>
            <input
              type="text"
              required
              placeholder="CRITICAL OVERRIDE..."
              value={form.task_descriptor}
              onChange={e => handleChange('task_descriptor', e.target.value)}
              className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Node Assign</label>
              <select
                value={form.node_assign}
                onChange={e => handleChange('node_assign', e.target.value)}
                className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white transition-all font-mono text-sm appearance-none cursor-pointer"
              >
                <option>Ergon-Prime</option>
                <option>Synth-01</option>
                <option>Ghost-Node</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Priority</label>
              <select
                value={form.priority}
                onChange={e => handleChange('priority', e.target.value)}
                className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white transition-all font-mono text-sm appearance-none cursor-pointer"
              >
                <option>CRITICAL</option>
                <option>HIGH</option>
                <option>DEFAULT</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Mode</label>
              <div className="flex bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 rounded-lg p-1 h-[54px]">
                <button type="button" onClick={() => setIsAi(true)} className={`flex-1 text-[9px] font-bold tracking-[0.1em] uppercase rounded flex items-center justify-center transition-all ${isAi ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-[#7f8c8d] hover:text-white'}`}>AI-Assist</button>
                <button type="button" onClick={() => setIsAi(false)} className={`flex-1 text-[9px] font-bold tracking-[0.1em] uppercase rounded flex items-center justify-center transition-all ${!isAi ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-[#7f8c8d] hover:text-white'}`}>Human</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Time (Mins)</label>
              <input
                type="number"
                placeholder="0"
                value={form.time_mins}
                onChange={e => handleChange('time_mins', e.target.value)}
                className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all font-mono text-sm h-[54px]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">
                Experiment Link
                {activeExp && (
                  <span className="text-white/40 normal-case tracking-normal ml-1">— {activeExp.name}</span>
                )}
              </label>
              <select
                value={form.experiment_link}
                onChange={e => handleChange('experiment_link', e.target.value)}
                disabled={!activeExp}
                className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white transition-all font-mono text-sm appearance-none cursor-pointer h-[54px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeExp ? (
                  <>
                    <option>None (Control)</option>
                    {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </>
                ) : (
                  <option value="None (Control)">No Active Experiment</option>
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Status</label>
              <div
                onClick={() => setComplete(!complete)}
                className={`w-full border p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all h-[54px] ${complete ? 'bg-[#FF3131]/20 border-[#FF3131] shadow-[0_0_15px_rgba(255,49,49,0.2)]' : 'bg-[#0a0a0a]/50 border-[#7f8c8d]/30 hover:border-white'}`}
              >
                <span className={`text-[10px] font-mono tracking-widest ${complete ? 'text-[#FF3131]' : 'text-[#7f8c8d]'}`}>{complete ? 'COMPLETED' : 'PENDING'}</span>
                <div className={`w-3 h-3 rounded-full border border-current ${complete ? 'bg-[#FF3131]' : 'bg-transparent'}`} />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence>
            {lastTaskId && undoCountdown > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3"
              >
                <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Task logged</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-[#7f8c8d]">{undoCountdown}s</span>
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#FF3131] hover:text-white border border-[#FF3131]/40 hover:border-white px-3 py-1 rounded transition-all"
                  >
                    Undo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-auto bg-gradient-to-b from-white to-[#a0a0a0] text-black py-4 rounded-lg font-bold tracking-[0.2em] uppercase text-[10px] shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] transition-all flex-shrink-0 disabled:opacity-50"
          >
            {submitting ? 'Executing...' : 'Execute Log'}
          </motion.button>
        </form>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-8">
        <TaskHistory
          refreshKey={historyRefreshKey}
          pendingTaskId={lastTaskId}
          onPendingTaskRemoved={clearUndo}
        />
      </div>
    </div>
  );
});
