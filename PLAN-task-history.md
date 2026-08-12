# PLAN: Task History & Lifecycle Management

**Rank: #1 — do this first.**

## Goal

Add a task history panel so users can see, complete, edit, and delete logged tasks. Today tasks are write-only: `status` is set once at creation in `LoggingView` and can never change. This makes every headline metric (Completion Rate Delta, Pending Tasks, Avg Time Saved) semantically broken — a task logged as PENDING stays PENDING forever, so "completion rate" only measures what fraction of tasks users happened to pre-mark as complete at logging time. Closing this loop is the single highest-leverage change in the product.

## Files to touch

| File | Action |
|---|---|
| `frontend/components/views/LoggingView.tsx` | Replace the two decorative panels on the right (lines 237–288: "Efficiency Yield" and "Aggregated ROI Velocity" — both hardcoded fake data) with a live task history list. |
| `frontend/components/views/TaskHistory.tsx` | **New file.** The history list component. |
| `frontend/lib/tasks.ts` | **New file.** Typed query helpers: `fetchRecentTasks`, `updateTaskStatus`, `updateTask`, `deleteTask`. |

Do NOT touch `RoiView.tsx`, `TeamView.tsx`, `ExperimentView.tsx` in this plan — they already read `status` from the DB and will reflect changes automatically on next fetch.

## Data model (already exists in Supabase — do not create tables)

Table `tasks`, columns used by the app: `id (uuid)`, `user_id`, `task_descriptor (text)`, `node_assign (text)`, `priority (text)`, `mode ('AI-Assist'|'Human')`, `time_mins (int|null)`, `experiment_link (text)`, `status ('COMPLETED'|'PENDING')`, `created_at (timestamptz)`. RLS scopes rows to `user_id` — always add `.eq('user_id', user.id)` anyway, matching existing code style.

## Implementation order

1. **Create `frontend/lib/tasks.ts`:**
   ```ts
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
   ```
   Every helper returns the Supabase response — callers MUST check `.error` (see edge cases).

2. **Create `TaskHistory.tsx`** (client component, `'use client'` at top). Props: none needed — use `useAuth()` for the user like sibling views do. State: `tasks: TaskRow[]`, `loading: boolean`, `error: string | null`. Fetch on mount and expose a `refetch` via `useCallback`. Render each task as a row: descriptor, node badge, relative time, status pill. Row actions: toggle status (PENDING ⇄ COMPLETED), inline-edit `time_mins`, delete (with a `window.confirm`). Match the existing visual language exactly — copy class strings from `LoggingView.tsx` (e.g. `bg-[#0a0a0a]/40 backdrop-blur-md ... border border-[#7f8c8d]/20`, `text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]` labels, `#FF3131` accent). Use `Alert`/`AlertDescription` from `@/components/ui/alert` for errors, as `LoggingView` does at line 196.

3. **Wire into `LoggingView.tsx`:** delete the entire right column content (the two hardcoded panels, lines 238–287) and render `<TaskHistory />` in the `lg:col-span-2` div. After a successful insert in `handleSubmit` (line 108 area) and after `handleUndo`, trigger the history refetch. Simplest mechanism: lift a `refreshKey` number state in `LoggingView`, pass as prop `refreshKey` to `TaskHistory`, include it in the fetch `useEffect` deps, and increment it after insert/undo.

4. **Log analytics events** via `logEvent` (`@/lib/analytics`): `task_completed`, `task_deleted`, `task_time_edited` — fire-and-forget (`void logEvent(...)`), do not `await` them in the UI path.

## Edge cases a weaker model would miss

- **Mock Supabase client will crash.** `frontend/lib/supabase.ts` lines 22–34: when env vars are missing, `from()` returns an object supporting ONLY `select().eq().single()/maybeSingle()` and `insert().select().single()`. Calling `.order()`, `.update()`, or `.delete()` on it throws `TypeError: ... is not a function`. Extend the mock in `supabase.ts` to also return chainable no-ops for `update`, `delete`, `order`, `limit`, `neq`, `gte`, `lt` (each returning an object/promise resolving to `{ data: null, error: new Error('Supabase not configured') }`). Easiest: build a self-returning chainable proxy whose `then` resolves that value.
- **The existing 20-second Undo feature overlaps with delete.** `LoggingView` lines 10–62: after insert, an undo banner deletes the row by id. If the user deletes that same task from the new history list while the undo countdown runs, the later undo click double-deletes (harmless in Postgres, but the banner should clear). Call `clearUndo()`-equivalent when a history delete removes `lastTaskId` — or simpler: pass the just-inserted id to `TaskHistory` and have `LoggingView` clear the undo banner when its refetch no longer contains that id. Minimum acceptable: ensure `handleUndo` checks the delete `error` and clears the banner regardless.
- **Status toggle must be optimistic-safe.** If you optimistically flip the pill and the update fails (RLS, offline), revert and show the error. Existing code silently ignores update errors (`ExperimentView.tsx:121`) — do not copy that pattern.
- **`time_mins` edit:** empty string → `null`, not `0` (metrics treat `null` via `?? 0` but `0` would wrongly count as a measured zero-minute task). Reject negatives and non-integers: `const v = input.trim() === '' ? null : Math.max(0, parseInt(input, 10) || 0)`.
- **`task_descriptor` can be empty** (form has no `required` — `LoggingView.tsx:118-124`). Render empty descriptors as `—` / "UNTITLED" so rows aren't blank. (Optionally add `required` to the form input while you're in the file.)
- **Timestamps:** `created_at` is UTC (`timestamptz`). Display with `new Date(t.created_at).toLocaleString()` — do NOT slice the ISO string (that shows UTC and disagrees with the user's clock; the same bug already exists in trend bucketing elsewhere).
- **Do not `memo`-wrap and forget deps:** sibling views use `memo(...)` + `useCallback` keyed on `[user]`. Follow that pattern; include `refreshKey` in the effect deps or refresh-after-insert won't work.

## Acceptance criteria

1. `npm run build` passes in `frontend/` with no type errors.
2. Logging a task makes it appear at the top of the history list without a page reload.
3. Clicking a PENDING task's status pill flips it to COMPLETED; reloading the page shows it still COMPLETED; the RoiView completion-rate and TeamView pending-count reflect it after switching tools.
4. Deleting a task removes it from the list and from metrics after refetch; a confirm dialog appears first.
5. Editing time to empty saves `null` (verify in Supabase table editor); negative input is rejected.
6. With `NEXT_PUBLIC_SUPABASE_URL` unset, `npm run dev` renders the dashboard without throwing (mock mode shows the "not configured" error state instead of crashing).
7. The hardcoded "94.2% Efficiency Yield" and the fake "Aggregated ROI Velocity" SVG no longer exist anywhere in the codebase (`grep -r "94.2" frontend/` returns nothing).
