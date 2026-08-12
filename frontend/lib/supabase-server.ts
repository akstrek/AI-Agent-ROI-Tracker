import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

// Server/middleware-oriented Supabase client. Deliberately does NOT import
// from `lib/supabase.ts` — that module exports a browser client wrapped in a
// mock-fallback Proxy which is not appropriate for edge/middleware use.
//
// Follows the official @supabase/ssr Next.js middleware pattern: the
// response is recreated (via `NextResponse.next({ request })`) every time
// cookies are set, so the refreshed request cookies propagate to downstream
// server rendering, AND the same cookies are mirrored onto the response so
// the browser receives them. Doing only one of these is the most common
// source of "randomly logged out" bugs with @supabase/ssr.
//
// Returns `configured: false` when the required env vars are absent so
// `middleware.ts` can pass every request through untouched instead of
// crashing when Supabase isn't set up — this mirrors the client-side
// mock-mode fallback in `lib/supabase.ts`.
export const updateSession = async (
  request: NextRequest
): Promise<{ response: NextResponse; user: User | null; configured: boolean }> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { response: NextResponse.next(), user: null, configured: false };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Always use getUser() (not getSession()) in server code — it performs a
  // real network round-trip to Supabase to validate the JWT, whereas
  // getSession() only reads the (spoofable) cookie value.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, configured: true };
};
