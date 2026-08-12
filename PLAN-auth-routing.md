# PLAN: Server-Side Auth, Route Protection & Routing Cleanup

**Rank: #4.**

## Goal

Route protection is client-only (`ProtectedRoute` in a `useEffect`), `/dashboard` is not protected at all, `returnUrl` is captured but never used, `/auth/update-password` lets any logged-in user through without a recovery token, all 404s silently redirect to `/`, and `/` vs `/dashboard` render the same dashboard twice with divergent behavior. This plan installs `@supabase/ssr` cookie-based sessions + Next middleware for real gating and fixes the routing dead ends.

## Files to touch

| File | Action |
|---|---|
| `frontend/package.json` | Add `@supabase/ssr`; **remove** `@supabase/auth-helpers-nextjs` (deprecated, imported nowhere — confirmed dead). |
| `frontend/lib/supabase.ts` | Switch browser client creation to `createBrowserClient` from `@supabase/ssr` (cookie storage) — keep the exported `supabase` proxy and mock fallback intact so no call sites change. |
| `frontend/middleware.ts` | **New.** Session refresh + redirect unauthenticated users off protected paths. |
| `frontend/lib/supabase-server.ts` | **New.** `createServerClient` helper for middleware. |
| `frontend/components/auth/LoginPage.tsx` | Honor `returnUrl` (line ~38 currently hard-redirects to `/dashboard`). |
| `frontend/components/auth/UpdatePassword.tsx` | Only accept a genuine recovery session (lines 56-70 conflate "any session" with "recovery"). |
| `frontend/app/not-found.tsx` | Real 404 page instead of `redirect('/')`. |
| `frontend/app/page.tsx`, `frontend/app/dashboard/page.tsx` | De-duplicate: `/` = public landing, `/dashboard` = protected app. |
| `frontend/components/ProtectedRoute.tsx` | Keep as UX fallback but render a loading indicator instead of `null`. |

## Implementation order

1. `npm i @supabase/ssr && npm rm @supabase/auth-helpers-nextjs` (run in `frontend/`).

2. **`lib/supabase.ts`:** replace `createClient(url, key)` (line 53) with `createBrowserClient(url, key)` from `@supabase/ssr`. Everything else (proxy export, mock) stays. This moves the session from localStorage to cookies so middleware can see it. Existing users' localStorage sessions will be dropped — they just log in again; acceptable.

3. **`lib/supabase-server.ts`:** standard `@supabase/ssr` middleware helper — `createServerClient(url, key, { cookies: { getAll: () => req.cookies.getAll(), setAll: ... } })` per the official Next.js guide. Do not import `lib/supabase.ts` here (it's browser-oriented and has the mock proxy).

4. **`middleware.ts`** (must live in `frontend/` root, beside `app/`):
   ```ts
   export const config = { matcher: ['/dashboard/:path*', '/account/:path*'] };
   ```
   Refresh the session (`supabase.auth.getUser()` — use `getUser()`, not `getSession()`, in server code; `getSession()` doesn't validate the JWT server-side). If no user → `NextResponse.redirect(new URL('/auth/login?returnUrl=' + encodeURIComponent(pathname), req.url))`. If env vars are missing, pass through (mirrors mock mode; don't crash the whole site).

5. **LoginPage:** on success, `const returnUrl = useSearchParams().get('returnUrl'); router.push(returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/dashboard')`. The `startsWith('/') && !startsWith('//')` check prevents open-redirect to external hosts. Note: `useSearchParams` in a client page requires a `<Suspense>` boundary in Next 15 or the build fails — the auth pages are client components re-exported by server pages; wrap the component usage accordingly.

6. **UpdatePassword:** listen for `onAuthStateChange` event `PASSWORD_RECOVERY` to set `sessionReady`, instead of accepting any session. Keep a fallback: if the URL contains a Supabase recovery `code`/`token_hash` fragment, allow. A plain logged-in visit without a recovery event should show "Request a reset link first" with a link to `/auth/reset`. (Changing password while simply logged in is a legitimate feature, but it must then require the current password — out of scope; just stop treating login-session as recovery.)

7. **Routing cleanup:**
   - `app/page.tsx` currently mounts the full `DashboardView` (with preloader) publicly; `app/dashboard/page.tsx` mounts the same view minus preloader. Keep `/` as the public landing (ToolGrid marketing view is fine) but make tool *interaction* route to `/dashboard` when authed, `/auth/login` when not. Minimum viable: leave `/` rendering as-is and simply wrap `/dashboard` content in `ProtectedRoute` (it currently is NOT — only `/account` is), with middleware as the real gate.
   - `app/not-found.tsx`: replace `redirect('/')` with a small styled 404 (match the dark theme: `bg-[#0a0a0a]`, mono uppercase text, link home).
   - `ProtectedRoute.tsx:18`: replace `return null` with a minimal centered spinner/text so redirects don't flash a blank page.

## Edge cases a weaker model would miss

- **`getUser()` vs `getSession()` in middleware:** `getSession()` reads the cookie without server verification — a forged cookie passes. Supabase docs are explicit: use `getUser()` in server code. It costs a network call per protected navigation; the matcher above keeps it off public/static routes.
- **Middleware must forward refreshed cookies** on BOTH the request and response (the `setAll` handler writes to `req` for downstream and to `res` for the browser) or sessions expire mid-use. Copy the exact pattern from the `@supabase/ssr` docs — hand-rolling this is the #1 source of "randomly logged out" bugs.
- **Mock mode:** with no env vars, middleware must not call `createServerClient` with `undefined` — guard and `NextResponse.next()`. Otherwise a fresh clone 500s on every route instead of showing the mock-mode UI.
- **`useSearchParams` + Next 15 static build:** without a Suspense boundary the build errors with "useSearchParams() should be wrapped in a suspense boundary". The login route is `app/auth/login/page.tsx` re-exporting a client component; wrap `<LoginPage />` in `<Suspense>` in the page file.
- **Open redirect:** `returnUrl=https://evil.com` and `returnUrl=//evil.com` must both fall back to `/dashboard` (the double-slash form is a protocol-relative URL — `startsWith('/')` alone is insufficient).
- **`sessionStorage` signup banner flow** (`SignupPage.tsx` sets `justSignedUp`, `DashboardView` reads it): signup currently routes to `/dashboard` immediately after `signUp` even though the email isn't confirmed — once middleware protects `/dashboard`, that redirect will bounce to login. Change signup success to route to `/auth/login?signup=1` (or a "check your email" panel) so the flow doesn't dead-end.
- **Header nav from `/account`** (`Header.tsx:19` pushes `/` with local tool state that dies on navigation) — don't try to fix tool deep-linking here; just be aware protection changes shouldn't touch Header. Tool-in-URL is a separate improvement.
- **AuthContext still works unchanged:** `createBrowserClient` implements the same `auth` API; `onAuthStateChange`/`getSession` calls in `AuthContext.tsx` need no edits.

## Acceptance criteria

1. `npm run build` passes; `npm rm` left no imports of `auth-helpers-nextjs` (`grep -r auth-helpers frontend/ --include='*.ts*'` → nothing).
2. Logged out, navigating directly to `/dashboard` or `/account` returns a 307 to `/auth/login?returnUrl=...` **before** any dashboard HTML/JS renders (verify in devtools Network — the document request itself redirects).
3. Logging in from that redirect lands back on the originally requested path.
4. `returnUrl=https://evil.com` and `returnUrl=//evil.com` land on `/dashboard`, not the external site.
5. Visiting `/auth/update-password` as a normally-logged-in user (no recovery link) shows the "request a reset" message; arriving via a real emailed recovery link shows the password form and updating works.
6. `/some/garbage/path` renders a themed 404 page (no redirect to `/`).
7. With no env vars, all routes still render in mock mode (no middleware 500s).
8. Session survives a hard refresh and a server restart (cookies, not localStorage — verify `sb-*` cookies exist in devtools).
