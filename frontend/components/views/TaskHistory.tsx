'use client'

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useCallback, memo } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchRecentTasks, updateTaskStatus, updateTaskTime, deleteTask, TaskRow } from '@/lib/tasks';
import { logEvent } from '@/lib/analytics';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TaskHistoryProps {
  refreshKey?: number;
  pendingTaskId?: string | null;
  onPendingTaskRemoved?: () => void;
}

export const TaskHistory = memo(function TaskHistory({ refreshKey, pendingTaskId, onPendingTaskRemoved }: TaskHistoryProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: fetchError } = await fetchRecentTasks(user.id);

    if (fetchError) {
      setError(fetchError.message);
      setTasks([]);
      setLoading(false);
      return;
    }

    setError(null);
    setTasks((data as TaskRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshKey]);

  const handleToggleStatus = async (task: TaskRow) => {
    const prevStatus = task.status;
    const nextStatus: TaskRow['status'] = prevStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    setTogglingId(task.id);
    setTasks(cur => cur.map(t => (t.id === task.id ? { ...t, status: nextStatus } : t)));

    const { error: updateError } = await updateTaskStatus(task.id, nextStatus);
    setTogglingId(null);

    if (updateError) {
      setTasks(cur => cur.map(t => (t.id === task.id ? { ...t, status: prevStatus } : t)));
      setError(updateError.message);
      return;
    }

    if (user && nextStatus === 'COMPLETED') {
      void logEvent(user.id, 'task_completed', { task_id: task.id });
    }
  };

  const handleSaveTime = async (task: TaskRow, raw: string) => {
    setEditingId(null);
    const trimmed = raw.trim();
    const nextValue = trimmed === '' ? null : Math.max(0, parseInt(trimmed, 10) || 0);

    if (nextValue === task.time_mins) return;

    const prevValue = task.time_mins;
    setTasks(cur => cur.map(t => (t.id === task.id ? { ...t, time_mins: nextValue } : t)));

    const { error: updateError } = await updateTaskTime(task.id, nextValue);

    if (updateError) {
      setTasks(cur => cur.map(t => (t.id === task.id ? { ...t, time_mins: prevValue } : t)));
      setError(updateError.message);
      return;
    }

    if (user) {
      void logEvent(user.id, 'task_time_edited', { task_id: task.id, time_mins: nextValue });
    }
  };

  const handleDelete = async (task: TaskRow) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;

    const prevTasks = tasks;
    setTasks(cur => cur.filter(t => t.id !== task.id));

    const { error: deleteError } = await deleteTask(task.id);

    if (deleteError) {
      setTasks(prevTasks);
      setError(deleteError.message);
      return;
    }

    if (user) {
      void logEvent(user.id, 'task_deleted', { task_id: task.id });
    }

    if (pendingTaskId && task.id === pendingTaskId) {
      onPendingTaskRemoved?.();
    }
  };

  return (
    <div className="bg-[#0a0a0a]/40 backdrop-blur-md p-10 rounded-2xl border border-[#7f8c8d]/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-500 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em]">Task History</h3>
        <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">
          {loading ? '—' : `${tasks.length} Logged`}
        </span>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-[#7f8c8d] font-mono text-[11px] uppercase tracking-[0.2em]">Loading...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex items-center justify-center h-48 bg-black/20 rounded-xl border border-[#7f8c8d]/10">
          <p className="text-[#7f8c8d] font-mono text-[11px] uppercase tracking-[0.2em]">
            No tasks logged yet
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[420px] pr-1">
          <AnimatePresence initial={false}>
            {tasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-4 bg-black/40 border border-[#7f8c8d]/10 rounded-xl p-4 hover:border-white/30 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-mono truncate">
                    {task.task_descriptor.trim() ? task.task_descriptor : 'UNTITLED'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">{task.node_assign}</span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">{task.priority}</span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">
                      {new Date(task.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {editingId === task.id ? (
                  <input
                    type="number"
                    autoFocus
                    defaultValue={task.time_mins ?? ''}
                    onBlur={e => handleSaveTime(task, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="w-16 bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 rounded-lg px-2 py-2 text-white text-xs font-mono text-center outline-none focus:border-white transition-all"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingId(task.id)}
                    className="text-[10px] font-mono text-[#7f8c8d] hover:text-white transition-colors w-12 text-center flex-shrink-0"
                  >
                    {task.time_mins != null ? `${task.time_mins}m` : '—'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleStatus(task)}
                  disabled={togglingId === task.id}
                  className={`text-[9px] font-bold font-mono tracking-widest uppercase px-3 py-2 rounded-lg border transition-all whitespace-nowrap flex-shrink-0 disabled:opacity-50 ${
                    task.status === 'COMPLETED'
                      ? 'bg-[#FF3131]/20 border-[#FF3131] text-[#FF3131] shadow-[0_0_10px_rgba(255,49,49,0.15)]'
                      : 'bg-[#0a0a0a]/50 border-[#7f8c8d]/30 text-[#7f8c8d] hover:border-white hover:text-white'
                  }`}
                >
                  {task.status}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(task)}
                  aria-label="Delete task"
                  className="text-[#7f8c8d] hover:text-[#FF3131] transition-colors flex-shrink-0 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});
