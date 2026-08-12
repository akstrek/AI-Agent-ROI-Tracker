'use client'

import { motion } from 'motion/react';
import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { logEvent } from '@/lib/analytics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { localDayKey, daysAgoLocalMidnight } from '@/lib/dates';

interface Task {
  time_mins: number | null;
  status: string;
  created_at: string;
}

interface Metrics {
  avgTime: number;
  totalHrs: number;
  completionDelta: number;
  trendPath: string;
}

function getPeriodBounds(period: string): { start: Date; prevStart: Date; days: number } {
  const days = period === 'Daily' ? 1 : period === 'Weekly' ? 7 : 30;
  // Calendar-day aligned bounds (includes today), using local-midnight math
  // so the window doesn't drift across DST boundaries.
  const start = daysAgoLocalMidnight(days - 1);
  const prevStart = daysAgoLocalMidnight(2 * days - 1);
  return { start, prevStart, days };
}

function buildTrendPath(tasks: Task[], days: number): string {
  if (tasks.length === 0) return 'M 0 35 L 100 35';

  // Build day buckets, keyed by local calendar day (not the UTC date the
  // ISO string happens to slice to).
  const buckets: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    buckets[localDayKey(daysAgoLocalMidnight(i))] = 0;
  }
  tasks.forEach(t => {
    const day = localDayKey(new Date(t.created_at));
    if (day in buckets) buckets[day]++;
  });

  const points = Object.values(buckets);
  const max = Math.max(...points, 1);

  if (points.length === 1) {
    // A lone `M x y` renders nothing — emit a short horizontal segment instead.
    const y = 35 - (points[0] / max) * 30;
    return `M 40 ${y.toFixed(1)} L 60 ${y.toFixed(1)}`;
  }

  return points
    .map((count, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 35 - (count / max) * 30;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export const RoiView = memo(function RoiView() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('Weekly');
  const [metrics, setMetrics] = useState<Metrics>({ avgTime: 0, totalHrs: 0, completionDelta: 0, trendPath: 'M 0 35 L 100 35' });
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const agents = ['Ergon-Prime', 'Synth-01', 'Ghost-Node'];

  const fetchMetrics = useCallback(async (selectedPeriod: string) => {
    if (!user) return;
    const id = ++requestRef.current;
    setDataLoading(true);
    setError(null);

    const { start, prevStart, days } = getPeriodBounds(selectedPeriod);

    const [{ data: current, error: currentError }, { data: prev, error: prevError }] = await Promise.all([
      supabase
        .from('tasks')
        .select('time_mins, status, created_at')
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString()),
      supabase
        .from('tasks')
        .select('status')
        .eq('user_id', user.id)
        .gte('created_at', prevStart.toISOString())
        .lt('created_at', start.toISOString()),
    ]);

    if (id !== requestRef.current) return; // a newer fetch superseded this one

    if (currentError || prevError) {
      setError((currentError ?? prevError)!.message);
      setDataLoading(false);
      return;
    }

    const cur = (current as Task[]) ?? [];
    const prv = (prev as { status: string }[]) ?? [];

    const completed = cur.filter(t => t.status === 'COMPLETED');
    const avgTime = completed.length
      ? Math.round(completed.reduce((s, t) => s + (t.time_mins ?? 0), 0) / completed.length)
      : 0;
    const totalMins = completed.reduce((s, t) => s + (t.time_mins ?? 0), 0);
    const totalHrs = parseFloat((totalMins / 60).toFixed(1));

    const curRate = cur.length ? (completed.length / cur.length) * 100 : 0;
    const prevCompleted = prv.filter(t => t.status === 'COMPLETED').length;
    const prevRate = prv.length ? (prevCompleted / prv.length) * 100 : 0;
    const completionDelta = parseFloat((curRate - prevRate).toFixed(1));

    const trendPath = buildTrendPath(cur, days);

    setMetrics({ avgTime, totalHrs, completionDelta, trendPath });
    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMetrics(period);
  }, [period, fetchMetrics]);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    if (user) logEvent(user.id, 'roi_period_changed', { period: p });
  };

  const isNegativeDelta = metrics.completionDelta < 0;
  const deltaSign = metrics.completionDelta >= 0 ? '+' : '';
  const deltaColor = isNegativeDelta ? 'text-[#FF3131]' : 'text-white';
  const deltaGlow = isNegativeDelta ? 'drop-shadow-[0_0_15px_rgba(255,49,49,0.4)]' : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]';
  const deltaStroke = isNegativeDelta ? '#FF3131' : '#ffffff';
  const deltaIconGlow = isNegativeDelta ? 'drop-shadow-[0_0_10px_rgba(255,49,49,1)]' : 'drop-shadow-[0_0_10px_rgba(255,255,255,1)]';

  return (
    <div className="bg-[#0a0a0a]/40 backdrop-blur-md p-10 rounded-3xl border border-[#7f8c8d]/20 min-h-[600px] relative overflow-hidden flex flex-col hover:shadow-[0_0_40px_rgba(255,255,255,0.08)] transition-all duration-500">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center z-20 mb-12 gap-6">
        <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] max-w-xs">Scorecard Metrics</h3>
        <div className="flex w-full md:w-auto bg-[#0a0a0a]/80 border border-[#7f8c8d]/30 rounded-lg p-1 backdrop-blur-md">
          {['Daily', 'Weekly', 'Monthly'].map(p => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 text-[9px] font-bold tracking-widest uppercase rounded transition-all ${p === period ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-[#7f8c8d] hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="relative z-20 mb-8">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="absolute inset-0 pointer-events-none z-0 p-10">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {agents.map((agent, idx) => {
            const startY = 20 + idx * 30;
            const pathObj = `M 0 ${startY} C 30 ${startY}, 70 50, 100 50`;
            return (
              <g key={agent}>
                <text x="-5" y={startY - 2} fill="#7f8c8d" fontSize="2" textAnchor="end" className="font-mono tracking-widest">{agent}</text>
                <path d={pathObj} stroke="#7f8c8d" strokeWidth="0.1" fill="none" opacity="0.3" />
                <motion.path
                  d={pathObj}
                  stroke="#FF3131"
                  strokeWidth="0.3"
                  fill="none"
                  strokeDasharray="5 15"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(255,49,49,1)]"
                  animate={{ strokeDashoffset: [0, -40] }}
                  transition={{ duration: 3 + idx * 0.7, repeat: Infinity, ease: "linear" }}
                />
                <circle cx="0" cy={startY} r="0.5" fill="#ffffff" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 flex-1">

        {/* Avg Time Saved */}
        <div className="bg-[#0a0a0a]/70 border border-[#7f8c8d]/30 p-6 md:p-8 rounded-2xl backdrop-blur-md hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#7f8c8d]">Avg Time Saved</p>
          <motion.p
            key={metrics.avgTime}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl md:text-7xl text-white font-brand font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-tighter"
          >
            {dataLoading ? '—' : metrics.avgTime}<span className="text-2xl md:text-3xl text-[#7f8c8d] ml-1">m</span>
          </motion.p>
        </div>

        {/* Completion Rate Delta */}
        <div className="bg-[#0a0a0a]/70 border border-[#7f8c8d]/30 p-6 md:p-8 rounded-2xl backdrop-blur-md hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between overflow-hidden relative">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#7f8c8d] relative z-10">Completion Rate Delta</p>
          <div className="flex items-center gap-4 relative z-10 mt-6 md:mt-6">
            <motion.div
              animate={{ y: isNegativeDelta ? [0, 8, 0] : [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={deltaStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={deltaIconGlow}
                style={isNegativeDelta ? { transform: 'rotate(180deg)' } : undefined}
              >
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </motion.div>
            <p className={`text-5xl md:text-6xl font-brand font-bold ${deltaGlow} tracking-tighter ${deltaColor}`}>
              {dataLoading ? '—' : `${deltaSign}${metrics.completionDelta}%`}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
            <svg
              width="200" height="200" viewBox="0 0 24 24" fill="none" stroke={deltaStroke} strokeWidth="1"
              style={isNegativeDelta ? { transform: 'rotate(180deg)' } : undefined}
            >
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </div>
        </div>

        {/* Trend */}
        <div className="bg-[#0a0a0a]/70 border border-[#7f8c8d]/30 p-6 md:p-8 rounded-2xl backdrop-blur-md hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#7f8c8d] mb-4">Trend (Trailing)</p>
          <div className="w-full h-[100px] md:h-[120px] relative">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
              <motion.path
                key={metrics.trendPath}
                d={metrics.trendPath}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </div>

        {/* Total Hours Saved */}
        <div className="bg-[#0a0a0a]/70 border border-[#7f8c8d]/30 p-6 md:p-8 rounded-2xl backdrop-blur-md hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between items-end text-right">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#7f8c8d] w-full text-left">Total Hours Saved</p>
          <p className="text-5xl md:text-7xl text-white font-brand font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] tracking-tighter mt-4 md:mt-6">
            {dataLoading ? '—' : metrics.totalHrs.toLocaleString()}
          </p>
        </div>

      </div>
    </div>
  );
});
