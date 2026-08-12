'use client'

import { motion } from 'motion/react';
import { useState, useEffect, useCallback, memo } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { logEvent } from '@/lib/analytics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { localDayKey, daysAgoLocalMidnight } from '@/lib/dates';

interface Task {
  node_assign: string;
  time_mins: number | null;
  status: string;
  created_at: string;
}

interface NodeMember {
  name: string;
  type: string;
  avgTime: string;
  weekDelta: string;
  hrs: number;
  trend: number[];
}

const NODE_TYPES: Record<string, string> = {
  'Ergon-Prime': 'Primary Core',
  'Synth-01': 'AI Sub-Node',
  'Ghost-Node': 'Shadow Agent',
};

function buildTrend(tasks: Task[], node: string): number[] {
  return Array.from({ length: 5 }, (_, i) => {
    const dayKey = localDayKey(daysAgoLocalMidnight(4 - i));
    return tasks.filter(
      t => t.node_assign === node && localDayKey(new Date(t.created_at)) === dayKey
    ).length;
  });
}

function computeDelta(tasks: Task[], node: string): string {
  const now = Date.now();
  const week = 7 * 86400000;
  const nodeTasks = tasks.filter(t => t.node_assign === node);

  const cur = nodeTasks.filter(t => now - new Date(t.created_at).getTime() < week);
  const prev = nodeTasks.filter(t => {
    const age = now - new Date(t.created_at).getTime();
    return age >= week && age < week * 2;
  });

  const rate = (arr: Task[]) =>
    arr.length ? (arr.filter(t => t.status === 'COMPLETED').length / arr.length) * 100 : 0;

  const delta = rate(cur) - rate(prev);
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

export const TeamView = memo(function TeamView() {
  const { user } = useAuth();
  const [members, setMembers] = useState<NodeMember[]>([]);
  const [totalHrs, setTotalHrs] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('node_assign, time_mins, status, created_at')
      .eq('user_id', user.id);

    if (fetchError) {
      setError(fetchError.message);
      setDataLoading(false);
      return;
    }

    const tasks = (data as Task[]) ?? [];

    const nodeGroups: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (!t.node_assign) return;
      if (!nodeGroups[t.node_assign]) nodeGroups[t.node_assign] = [];
      nodeGroups[t.node_assign].push(t);
    });

    const built: NodeMember[] = Object.entries(nodeGroups).map(([name, rows]) => {
      const completed = rows.filter(r => r.status === 'COMPLETED');
      const totalMins = completed.reduce((s, r) => s + (r.time_mins ?? 0), 0);
      const avgTime = completed.length
        ? `${Math.round(totalMins / completed.length)}m`
        : '—';
      const hrs = parseFloat((totalMins / 60).toFixed(1));
      return {
        name,
        type: NODE_TYPES[name] ?? 'AI Node',
        avgTime,
        weekDelta: computeDelta(tasks, name),
        hrs,
        trend: buildTrend(tasks, name),
      };
    });

    setMembers(built);

    const allMins = tasks
      .filter(t => t.status === 'COMPLETED')
      .reduce((s, t) => s + (t.time_mins ?? 0), 0);
    setTotalHrs(parseFloat((allMins / 60).toFixed(1)));
    setPendingCount(tasks.filter(t => t.status === 'PENDING').length);
    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fire once per mount, not on every refetch — logging this in fetchData
  // inflated analytics because fetchData reruns whenever `user` changes.
  useEffect(() => {
    if (!user) return;
    void logEvent(user.id, 'team_dashboard_viewed');
  }, [user]);

  const activeNodeCount = members.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-[#0a0a0a]/40 backdrop-blur-md p-8 rounded-3xl border border-[#7f8c8d]/20 flex flex-col md:flex-row justify-between items-center hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all gap-8">
        <div>
          <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] mb-2">Cluster Status</h3>
          <p className="text-3xl text-white font-brand font-bold drop-shadow-[0_0_15px_white] tracking-tighter">
            {dataLoading ? '—' : `${activeNodeCount} Active Node${activeNodeCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7f8c8d] mb-1">Total Hrs Saved</p>
            <p className="text-4xl text-white font-brand font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {dataLoading ? '—' : totalHrs.toLocaleString()}
            </p>
          </div>
          <div className="hidden sm:block w-[1px] h-12 bg-[#7f8c8d]/20" />
          <div className="flex-1 md:flex-none flex justify-between md:justify-end items-center bg-[#0a0a0a]/80 py-4 px-6 border border-[#FF3131]/40 rounded-2xl shadow-[0_0_20px_rgba(255,49,49,0.15)] glow-card">
            <div className="text-left md:text-right mr-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#FF3131] mb-1 drop-shadow-[0_0_5px_rgba(255,49,49,0.8)] font-bold">Pending Tasks</p>
              <p className="text-4xl text-[#FF3131] font-brand font-bold drop-shadow-[0_0_15px_rgba(255,49,49,0.8)]">
                {dataLoading ? '—' : pendingCount}
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-4 h-4 rounded-full bg-[#FF3131] shadow-[0_0_15px_#FF3131] border-2 border-white/50"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!dataLoading && members.length === 0 ? (
        <div className="flex items-center justify-center h-48 bg-[#0a0a0a]/40 backdrop-blur-md rounded-3xl border border-[#7f8c8d]/20">
          <p className="text-[#7f8c8d] font-mono text-[11px] uppercase tracking-[0.2em]">
            No tasks logged yet — nodes appear here after first log
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(dataLoading
            ? Array.from({ length: 4 }, (_, i) => ({
                name: '—', type: '—', avgTime: '—', weekDelta: '—', hrs: 0,
                trend: [0, 0, 0, 0, 0], id: i,
              }))
            : members
          ).map((m, idx) => (
            <div key={idx} className="bg-[#0a0a0a]/40 backdrop-blur-md p-8 rounded-3xl border border-[#7f8c8d]/20 flex flex-col hover:border-white/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all group">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-2xl text-white font-bold font-brand mb-1 tracking-tighter">{m.name}</h4>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">{m.type}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-[#7f8c8d]/30 flex items-center justify-center p-2.5 group-hover:border-white group-hover:shadow-[0_0_15px_white] transition-all bg-[#0a0a0a]/50">
                  <User className="text-[#7f8c8d] group-hover:text-white transition-all w-full h-full" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8 bg-black/40 p-4 rounded-xl border border-[#7f8c8d]/10">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.15em] text-[#7f8c8d] mb-1">Avg Time</p>
                  <p className="text-xl text-white font-brand font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{m.avgTime}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.15em] text-[#7f8c8d] mb-1">Delta</p>
                  <p className="text-xl text-[#FF3131] font-brand font-bold drop-shadow-[0_0_5px_rgba(255,49,49,0.5)]">{m.weekDelta}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.15em] text-[#7f8c8d] mb-1">Hours</p>
                  <p className="text-xl text-white font-brand font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{m.hrs}</p>
                </div>
              </div>

              <div className="w-full h-16 mt-auto relative bg-[#0a0a0a] border border-[#7f8c8d]/10 rounded-lg overflow-hidden flex items-end p-2 gap-1.5">
                <div className="absolute top-2 left-2 text-[8px] uppercase tracking-[0.2em] text-[#7f8c8d] z-10">Weekly Trend</div>
                {m.trend.map((val, i, arr) => {
                  const max = Math.max(...arr, 1);
                  const height = (val / max) * 100;
                  return (
                    <div key={i} className="flex-1 rounded-sm relative flex items-end h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`w-full rounded-sm ${i === arr.length - 1 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-[#7f8c8d]/30 group-hover:bg-[#7f8c8d]/50 transition-colors'}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
