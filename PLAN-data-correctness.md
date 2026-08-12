# PLAN: Data Layer Correctness — Errors, Timezones, Races, Mock Client, Types

**Rank: #3.**

## Goal

Every dashboard number silently degrades to `0` on any query failure, day-bucketing is done in UTC against local clocks, rapid refetches can race, and the mock Supabase client crashes on most real call chains. This plan makes the numbers trustworthy: query errors are surfaced, date math is local-time correct, stale responses can't overwrite fresh ones, and the app runs (degraded, not crashed) without env vars.

## Files to touch

| File | Action |
|---|---|
| `frontend/lib/supabase.ts` | Replace shallow mock with a generic chainable stub. |
| `frontend/lib/dates.ts` | **New file.** Local-time day-key helpers. |
| `frontend/lib/analytics.ts` | Never throw; swallow + `console.warn` on insert error. |
| `frontend/components/views/RoiView.tsx` | Error state, local-day bucketing, single-point trend fix, stale-response guard. |
| `frontend/components/views/TeamView.tsx` | Error state, local-day bucketing, don't `await logEvent` in fetch path. |
| `frontend/components/views/ExperimentView.tsx` | Error states for fetch/deploy/toggle. |
| `frontend/context/AuthContext.tsx` | `.catch` on `getSession()` so `loading` can't hang forever. |

## Implementation order

1. **Mock client (`supabase.ts:9-41`).** The current mock's `from()` only supports `select().eq().single()/maybeSingle()` and `insert().select().single()`. Real code calls `.gte`, `.lt`, `.neq`, `.order`, `.limit`, `.delete`, `.update`, and bare `insert(...)` awaited directly — all `TypeError` in mock mode. Replace with a self-returning thenable:
   ```ts
   const mockResult = { data: null, error: new Error('Supabase not configured') };
   const chain: any = new Proxy(() => chain, {
     get: (_t, prop) => {
       if (prop === 'then') return (res: any) => res(mockResult);
       return () => chain;
     },
     apply: () => chain,
   });
   // from: () => chain
   ```
   Verify: `await supabase.from('x').select().eq().gte().order().limit()` resolves to `mockResult`, and `await supabase.from('x').insert({})` does too (PostgrestBuilder is awaited directly in `analytics.ts:8` and `ExperimentView.tsx:99`). Keep the existing `auth` and `storage` mocks, but add `storage.from().createSignedUrl` (used by `AccountPage.tsx`).

2. **`frontend/lib/dates.ts`:**
   ```ts
   /** YYYY-MM-DD in the user's local timezone */
   export function localDayKey(d: Date): string {
     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
   }
   export function daysAgoLocalMidnight(n: number): Date {
     const d = new Date();
     d.setHours(0, 0, 0, 0);
     d.setDate(d.getDate() - n);   // setDate handles DST, month/year rollover
     return d;
   }
   ```

3. **RoiView (`RoiView.tsx`):**
   - `getPeriodBounds` (22-28): compute `start = daysAgoLocalMidnight(days - 1)` (calendar-day aligned, includes today) and `prevStart = daysAgoLocalMidnight(2*days - 1)`. Keep sending `.toISOString()` to Supabase — the DB comparison is instant-based and correct once the boundary instant is right.
   - `buildTrendPath` (30-54): bucket keys via `localDayKey(new Date(t.created_at))` — parse the timestamp, do NOT `slice(0,10)` the ISO string (that's the UTC date, off by one for evening tasks west of UTC / morning tasks east). Generate bucket keys with `localDayKey(daysAgoLocalMidnight(i))`.
   - Single-point fix (48-52): with `days === 1` there is 1 bucket, and the produced path is a lone `M 50 y` which renders nothing. When `points.length === 1`, emit a short horizontal segment: `M 40 y L 60 y`. Better: for Daily, bucket by hour (24 points) — optional, the segment fix is the minimum.
   - Error handling (70-85): destructure `error` from both queries; if either errored, `setError(message)` and render an `Alert` (import from `@/components/ui/alert` like `LoggingView.tsx:8`) instead of showing zeros as if they were data.
   - Stale-response guard (64-107): module pattern —
     ```ts
     const requestRef = useRef(0);
     const id = ++requestRef.current;
     ...await queries...
     if (id !== requestRef.current) return; // a newer fetch superseded this one
     ```
     Without this, clicking Daily→Weekly→Daily fast can leave Weekly's slower response as the final state under the Daily label.
   - Delta color (114-115): positive delta renders `#FF3131` (the alarm red) and the arrow always points up even for negative deltas. Make negative deltas show a down arrow (rotate the SVG 180°) and swap colors so improvement is white/positive-styled, regression red.

4. **TeamView (`TeamView.tsx`):**
   - Same local-day fix in `buildTrend` (32-42): compare `localDayKey(new Date(t.created_at))` to `localDayKey(daysAgoLocalMidnight(4 - i))`.
   - `computeDelta` (44-60) uses rolling ms windows — acceptable; leave, but rename the `compRate` field to `weekDelta` (it holds a delta, not a rate; the UI label at line 187 already says "Delta").
   - Check the query `error` (73) and render an error state.
   - Line 113: `await logEvent(...)` runs inside `fetchData` after `setDataLoading(false)`; if it rejects it's an unhandled rejection. Change to fire-and-forget `void logEvent(...)` and move it to a mount-only effect — currently it logs `team_dashboard_viewed` on every refetch, inflating analytics.

5. **ExperimentView (`ExperimentView.tsx`):**
   - Add `error` state. Check errors on both fetches (42-58), the deploy insert (99-107 — currently `if (!error)` silently drops failures with no user feedback and the form keeps `submitting=false` looking like nothing happened), and the status toggle update (121 — currently fire-and-forget then optimistically flips the badge even if the write failed).
   - Stale-response guard as in RoiView (fetchData is re-entrant via deploy → fetchData).

6. **analytics.ts:** wrap the insert: `const { error } = await supabase...; if (error) console.warn('analytics:', error.message);`. Never let analytics break UI paths.

7. **AuthContext.tsx (24-30):** append `.catch(() => setLoading(false))` to the `getSession()` promise — today a rejection leaves `loading=true` forever and `ProtectedRoute` renders `null` indefinitely (blank page, no error).

## Edge cases a weaker model would miss

- **`toISOString().slice(0,10)` is the UTC date.** A task created 2026-07-11 21:00 in UTC-5 has `created_at` `2026-07-12T02:00:00Z`; slicing yields `2026-07-12` while the user experienced July 11. Both bucket key generation AND task-date extraction must use the same local-time function or buckets systematically miss.
- **`now - i*86400000` breaks across DST**; `setDate()` arithmetic doesn't. Use `daysAgoLocalMidnight` everywhere; don't mix the two styles.
- **The thenable mock must not recurse on `await`:** `await` calls `.then` — make sure the proxy's `then` handler resolves with the result object rather than returning the chain itself, or `await` loops forever.
- **`Math.max(...points, 1)`** already guards divide-by-zero in trend scaling — keep it when refactoring.
- **Don't add `error` to `Metrics` state** — keep it separate so a failed refetch doesn't wipe the last-good numbers; render the alert above stale numbers.
- **`memo` + `useCallback([user])`:** when adding `requestRef`, do not add it to dependency arrays (refs are stable); adding state guards instead of refs would retrigger fetch loops.
- **RLS-dependent deletes:** `LoggingView.tsx:59` deletes by `id` only; while touching files, add `.eq('user_id', user.id)` to that delete (defense in depth — RLS is the real guard but client symmetry matters and mock mode behaves better).

## Acceptance criteria

1. `npm run build` passes.
2. With no `.env` (mock mode), `/` and `/dashboard` and all four tools render with visible "Supabase not configured" alerts — zero uncaught `TypeError`s in the console.
3. Log a task at ~11:30 PM local time (or fake it by editing `created_at`): it appears in TODAY's trend bucket in RoiView and TeamView, not tomorrow's.
4. Daily period shows a visible trend line (not blank).
5. Kill the network (devtools offline), switch period: an error alert appears; the metrics do NOT silently show `0m / +0% / 0`.
6. Rapidly toggle Daily/Weekly/Monthly 10×: final numbers always match the finally-selected period (add a temporary artificial delay to one query to verify, then remove it).
7. A negative completion delta renders a downward arrow and red color; positive renders upward and non-red.
8. `team_dashboard_viewed` fires once per mount, not once per refetch (check `analytics_events` rows).
