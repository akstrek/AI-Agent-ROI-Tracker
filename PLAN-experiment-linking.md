# PLAN: Real Experiment ↔ Task Linkage

**Rank: #2.**

## Goal

Make the A/B Experiment feature actually experiment on something. Today the link between experiments and tasks is fictional:

- `LoggingView.tsx:174-183` offers a hardcoded dropdown (`None (Control)`, `Alpha - Flow A`, `Beta - Flow B`) stored as a free-text `experiment_link` string. It never reads the user's real experiments.
- `ExperimentView.tsx:54-58` aggregates **all** tasks with `experiment_link != 'None (Control)'` for the user, across all time and all experiments — results are never scoped to the displayed experiment, its `start_date`, or its conditions.
- Halting an experiment (`handleStatusToggle`, `ExperimentView.tsx:118-124`) changes nothing about logging: users can keep linking tasks to a "Paused" experiment.
- The experiment's `condition_assignment` (`Latency Factor C` etc.) is stored but never used anywhere.

After this plan: tasks carry a real `experiment_id` FK + a `condition` column; the logging form shows only the currently Running experiment's two conditions; results are scoped per-experiment and respect `start_date`; pausing an experiment removes it from the logging dropdown.

## Files to touch

| File | Action |
|---|---|
| Supabase (SQL, run in dashboard SQL editor) | Add `experiment_id uuid references experiments(id)` and `condition text` to `tasks`. Keep `experiment_link` untouched for old rows. |
| `frontend/lib/experiments.ts` | **New file.** `fetchActiveExperiment(userId)`, `fetchExperimentResults(userId, experimentId)`. |
| `frontend/components/views/LoggingView.tsx` | Replace hardcoded experiment dropdown with live active-experiment conditions; write `experiment_id` + `condition` on insert. |
| `frontend/components/views/ExperimentView.tsx` | Scope results to the active experiment via `experiment_id`; filter by `start_date`; refetch after status toggle. |

## Implementation order

1. **SQL migration** (paste into Supabase SQL editor; save a copy in a new `supabase/migrations/0001_experiment_link.sql` in the repo for the record):
   ```sql
   alter table tasks add column if not exists experiment_id uuid references experiments(id) on delete set null;
   alter table tasks add column if not exists condition text;
   create index if not exists tasks_experiment_id_idx on tasks(experiment_id);
   ```
   RLS: existing task policies keyed on `user_id` continue to apply; no new policies needed.

2. **`frontend/lib/experiments.ts`:**
   - `CONDITIONS = ['Alpha - Flow A', 'Beta - Flow B'] as const;` — single source of truth (currently duplicated in `LoggingView.tsx:180-181` and `ExperimentView.tsx:130-131`).
   - `fetchActiveExperiment(userId)`: `from('experiments').select('id, name, start_date, condition_assignment, status, created_at').eq('user_id', userId).eq('status', 'Running').order('created_at', {ascending:false}).limit(1).maybeSingle()`. Note: current code uses `.neq('status','Completed')` (`ExperimentView.tsx:46`) which also returns Paused experiments — for the logging dropdown you want Running only; keep the ExperimentView display query as `.neq('Completed')` so a paused experiment still shows with its Resume button.
   - `fetchExperimentResults(userId, experimentId)`: `from('tasks').select('condition, time_mins, status').eq('user_id', userId).eq('experiment_id', experimentId)`.

3. **`LoggingView.tsx`:**
   - On mount (and after `ExperimentView` changes — see edge cases), fetch the active experiment. If none or fetch errors → hide/disable the Experiment Link select and always submit `experiment_id: null, condition: null`.
   - If one exists, render options: `None (Control)` plus the two `CONDITIONS`, with a small label showing the experiment name.
   - In `handleSubmit` insert: keep writing `experiment_link` (legacy string, so old ExperimentView code paths and any DB constraints stay valid) AND write `experiment_id: activeExp?.id ?? null`, `condition: selected === 'None (Control)' ? null : selected`.

4. **`ExperimentView.tsx`:**
   - Fetch the displayed experiment as today (`.neq('Completed')`), then fetch results with `.eq('experiment_id', activeExp.id)` — **only if an experiment exists**; if `activeExp` is null skip the task query entirely and show the zero-row placeholder.
   - Additionally filter `.gte('created_at', startOfDayISO(activeExp.start_date))` when `start_date` is non-null. `start_date` is a plain `YYYY-MM-DD` string (`ExperimentView.tsx:102,154`); convert with `new Date(start_date + 'T00:00:00')` (local midnight) then `.toISOString()`.
   - Group by the new `condition` column instead of `experiment_link` (`ExperimentView.tsx:62-64`).
   - `handleStatusToggle`: check the update `error` (currently ignored at line 121) and call `fetchData()` after success instead of only patching local state, so Paused state propagates.
   - Deploy (`handleDeploy`): before inserting, if a Running experiment already exists, either block with an error ("Halt the current experiment first") or set the old one to `Completed`. Pick blocking — it's one query and no destructive write. Also surface insert errors: current code (`line 107`) silently swallows them; add an `error` state + `Alert` like `LoggingView.tsx:196-200`.

5. **Cross-view refresh:** `ToolDashboard` mounts one view at a time, so switching tools remounts and refetches — no shared cache needed. Just ensure `LoggingView` fetches the active experiment on mount (it will, per step 3).

## Edge cases a weaker model would miss

- **Legacy rows:** existing tasks have `experiment_link` text but `experiment_id = null`. Do NOT try to backfill (there's no way to know which experiment they belonged to). Old data simply won't appear in per-experiment results — that's correct, not a bug. Don't delete the `experiment_link` column or old inserts/`neq` filters break.
- **Mock Supabase mode:** `frontend/lib/supabase.ts:22-34` mock `from()` lacks `.order`, `.neq`, `.gte`, `.update`, `.limit`. Any new chain will throw in mock mode (no env vars). Extend the mock with a generic chainable stub first, or every one of these views crashes on a fresh clone. (PLAN-data-layer covers this properly; if doing this plan first, add the chainable stub as part of step 2.)
- **`maybeSingle()` vs `single()`:** use `maybeSingle()` for the active-experiment fetch — `single()` errors when zero rows exist, and new users always have zero experiments.
- **Multiple Running experiments already in the DB:** users could have deployed several under the old code (deploy never blocked). `limit(1)` + ordering by `created_at desc` gives deterministic behavior; the deploy-blocking check should count Running experiments, not assume 0/1.
- **The user pauses the experiment while the Logging form is open:** the dropdown was populated at mount and the insert will still carry that `experiment_id`. Acceptable for MVP — but check on submit: if the active-experiment fetch is older than the submit, re-validate is overkill; instead just note it. Do NOT try to add realtime subscriptions.
- **Sync Rate metric (`ExperimentView.tsx:80-81`)** currently uses all linked tasks; after scoping, compute it from the per-experiment result set so the number matches the table below it.
- **`condition_assignment` still unused:** display it as a subtitle under the experiment name in the results header (`ExperimentView.tsx:204`) so the stored field finally surfaces. Don't invent behavior for it.
- **Timezone on `start_date`:** using UTC midnight (`new Date('YYYY-MM-DD')`) would exclude tasks logged between local midnight and UTC midnight for users west of UTC. Use local midnight as specified above.

## Acceptance criteria

1. `npm run build` passes.
2. With no experiments, the Logging form shows no experiment selector (or a disabled "No active experiment" state), and inserts succeed with `experiment_id null`.
3. Deploy an experiment → the Logging form now offers `None (Control)` / `Alpha - Flow A` / `Beta - Flow B`; log 2 Alpha tasks (1 completed) and 1 completed Beta task → ExperimentView shows Alpha count 2 / 50% rate, Beta count 1 / 100% rate, and Sync Rate 66.67%.
4. Tasks logged before the experiment's `start_date` (edit `created_at` in the Supabase table editor to test) do not appear in results.
5. Halt the experiment → Logging form drops the experiment options; Resume restores them.
6. Deploying a second experiment while one is Running shows an error alert and inserts nothing.
7. Legacy tasks (with only `experiment_link`) no longer pollute a new experiment's results.
