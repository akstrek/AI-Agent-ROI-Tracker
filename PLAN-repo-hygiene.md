# PLAN: Repo Hygiene — Dead Code, Broken Tooling, Deps, Metadata, A11y Quick Wins

**Rank: #5.**

## Goal

Remove artifacts that mislead future work and fix broken tooling: a leftover Vite `index.html` with a `window.fetch`-override hack, a `components.json` pointing at nonexistent `src/` paths, ~300 lines of dead code, a `lint` script with no ESLint installed, deprecated/misplaced dependencies, near-absent SEO metadata, and the highest-impact accessibility gaps. Low individual effort, high compound payoff: every future task (human or model) stops tripping over these.

## Files to touch

Deletions: `frontend/index.html`, `frontend/components/layout/LandingLayout.tsx`, `authSkeletons` block in `frontend/lib/supabase.ts` (lines 69-95), inline starfields in `frontend/components/auth/ResetPassword.tsx` (~lines 14-44) and `UpdatePassword.tsx` (~lines 13-40).

Edits: `frontend/components.json`, `frontend/package.json`, `frontend/app/layout.tsx`, `frontend/components/account/AccountPage.tsx`, `frontend/components/dashboard/ToolGrid.tsx`, `frontend/components/layout/Header.tsx`, `frontend/components/auth/LoginPage.tsx` + `SignupPage.tsx` + `UpdatePassword.tsx` (aria-labels, label/id linkage), `frontend/eslint.config.mjs` (**new**).

## Implementation order

1. **Delete `frontend/index.html`.** It is a Vite leftover: references `/src/main.tsx` which does not exist, contains a "sandbox bypass" script that no-ops the `window.fetch` setter. Next.js never loads it — pure dead weight. Verify nothing references it: `grep -r "index.html" frontend/ --include='*.ts*' --include='*.json'` (expect only `.next`/lockfile noise; `next.config.ts` has no rewrite to it).

2. **Fix `frontend/components.json`:** set `"rsc": true` (this is an App Router project), and repoint CSS from `"src/index.css"` to `"app/globals.css"`. Without this, the next `npx shadcn add <component>` writes files into a `src/` tree that doesn't exist.

3. **Delete dead code:**
   - `components/layout/LandingLayout.tsx` — an entire alternate landing page, imported nowhere, with its own conflicting `TOOLS` array (ids `vision/forge/nexus/team` vs the real `logging/roi/experiment/team` in `lib/constants.ts`). Confirm with `grep -r "LandingLayout" frontend/` before deleting.
   - `authSkeletons` export in `lib/supabase.ts:69-95` — parallel auth API, zero importers (`grep -r "authSkeletons" frontend/`).
   - The two inline `StarfieldComponent` duplicates in `ResetPassword.tsx` and `UpdatePassword.tsx`; import `Starfield` from `@/components/canvas/Starfield` instead (as `LoginPage`/`SignupPage` already do). Check the shared component's props match how the inline versions were mounted (likely prop-less fullscreen canvas — read `Starfield.tsx` first).
   - `AccountPage.tsx:20` redefines the E-logo path that `lib/constants.ts:10` already exports as `E_PATH` — import it instead.

4. **`package.json`:**
   - Remove `@supabase/auth-helpers-nextjs` (deprecated AND unused — zero imports). **Skip this line if PLAN-auth-routing was/will be done, which already handles it.**
   - Move `shadcn` from `dependencies` to `devDependencies` (it's a CLI).
   - Remove `autoprefixer` from devDependencies **only if** `postcss.config.mjs` doesn't reference it — read that file first; Tailwind v4's `@tailwindcss/postcss` handles prefixing.
   - Fix lint: `next lint` is deprecated in Next 15 and there is no ESLint config or dependency at all. Add dev deps `eslint`, `eslint-config-next`, create a minimal `eslint.config.mjs` (flat config re-exporting `next/core-web-vitals`), and change the script to `"lint": "eslint ."`. Expect existing violations (e.g. `as any` in `Magnetic.tsx:31`, `BackgroundE.tsx:27-28`, `LandingLayout` — deleted anyway); fix trivial ones, or set those rules to `warn` rather than suppressing whole files.

5. **Metadata (`app/layout.tsx:5-8`):** expand the `metadata` export: `metadataBase: new URL('https://ergon-peach.vercel.app')`, `openGraph` (title, description, image — use `docs/screenshots/dashboard.png` copied to `frontend/app/opengraph-image.png`, which Next auto-serves), `icons`, and add an exported `viewport` with `colorScheme: 'dark'` — then delete the hand-written `<head><meta name="color-scheme"...></head>` block (lines 13-15) that bypasses the metadata API.

6. **A11y quick wins (mechanical, low risk):**
   - Clickable `<div>`s → `<button type="button">` (or add `role="button"`, `tabIndex={0}`, Enter/Space key handler where a button breaks layout): `ToolGrid.tsx:24-31` tool tiles, `Header.tsx:26-28` logo and `:44-45` nav items, the status toggle div in `LoggingView.tsx:186-193`.
   - `aria-label` on icon-only buttons: password show/hide toggles (`LoginPage.tsx:116-120`, `SignupPage.tsx:203`, `UpdatePassword.tsx:194`, `AccountPage.tsx:349`), mobile menu toggle (`Header.tsx:106`), Export/Activity buttons (`ToolDashboard.tsx:55`).
   - Link labels to inputs in `SignupPage.tsx` (labels at ~151/~170 lack `htmlFor`; inputs lack `id`) — the login page already does it right; mirror that pattern.

## Edge cases a weaker model would miss

- **Do not "fix" the fetch-override script by keeping index.html** — the file's only content of note is that hack; the app never loads it. Delete, don't migrate.
- **`components.json` `"config": ""` for tailwind is CORRECT for Tailwind v4** (no tailwind.config file); only fix `rsc` and the CSS path. Don't invent a `tailwind.config.ts`.
- **Converting `motion.div onClick` tiles to `<button>`:** use `motion.button` (keeps animations) and add `type="button"` so a button inside any form doesn't submit. Buttons are `display: inline-block` with UA styles — add `text-left w-full` / `appearance-none bg-transparent` classes as needed so the grid layout doesn't shift.
- **`eslint-config-next` flat-config:** with ESLint 9 use the flat config form (`import next from 'eslint-config-next'`); the old `.eslintrc` extends form won't load. Pin `eslint@^9`.
- **`opengraph-image.png` must live in `app/`** (route-level convention), not `public/`, to get the auto meta tags; keep it under ~1MB — the screenshot may need downscaling to 1200×630.
- **Deleting `LandingLayout` may orphan imports of icons/assets used only by it** — after deletion run `npm run build`; tree-shaking makes unused deps harmless but broken imports will fail the build, which is your safety net.
- **`shadcn` in dependencies vs Vercel builds:** moving it to devDependencies is safe (Vercel installs devDeps at build time), and it's never imported at runtime.

## Acceptance criteria

1. `npm run build` passes; `npm run lint` executes real ESLint and exits 0 (or with only intentional warnings).
2. `frontend/index.html` and `LandingLayout.tsx` are gone; `grep -r "authSkeletons\|LandingLayout\|src/main.tsx" frontend/ --include='*.ts*' --include='*.html'` returns nothing.
3. `npx shadcn add badge --dry-run` (or add + revert) targets `app/`/`components/` paths, not `src/`.
4. `curl -s localhost:3000 | grep -i og:` shows OpenGraph tags; sharing the deployed URL in a link previewer renders title + screenshot.
5. Tab key reaches and Enter activates: each dashboard tool tile, header nav items, password visibility toggles; a screen reader announces labels for the icon-only buttons.
6. `package.json` has no `@supabase/auth-helpers-nextjs`; `shadcn` sits in devDependencies; a fresh `npm ci && npm run build` succeeds.
