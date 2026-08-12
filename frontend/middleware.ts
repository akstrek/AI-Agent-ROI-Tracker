import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase-server';

export async function middleware(request: NextRequest) {
  const { response, user, configured } = await updateSession(request);

  // If Supabase isn't configured (no env vars — e.g. local mock-mode dev),
  // pass every request through untouched rather than crashing the site.
  if (!configured) {
    return NextResponse.next();
  }

  if (!user) {
    // URLSearchParams.set() already URL-encodes the value on serialization —
    // do not encodeURIComponent() it again here or it double-encodes.
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
};
