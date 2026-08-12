import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, key };
};

// A self-returning chainable stub: every method call (select/insert/update/delete/
// eq/neq/gte/lt/order/limit/single/maybeSingle/etc.) returns the same object, and
// the object is itself "thenable" so `await`-ing it at any point in the chain
// resolves to a consistent "not configured" response. This mirrors how the real
// supabase-js query builder is a thenable that can be chained arbitrarily before
// being awaited, without having to hand-enumerate every method the app might call.
const createMockQueryBuilder = (): any => {
  const result = { data: null, error: new Error('Supabase not configured') };
  const builder: any = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          // Makes `await builder` (at any point in the chain) resolve to `result`.
          return (resolve: (v: typeof result) => void) => resolve(result);
        }
        if (prop === 'catch' || prop === 'finally') {
          return () => builder;
        }
        // Any other property access is assumed to be a query-builder method
        // (select/insert/update/delete/eq/neq/gte/lt/order/limit/single/...):
        // return a function that keeps returning the same chainable builder.
        return (..._args: unknown[]) => builder;
      },
    }
  );
  return builder;
};

const createMockSupabase = () => {
  console.warn('RUNNING IN MOCK MODE: Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing.');

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase not configured') }),
      updateUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    },
    from: () => createMockQueryBuilder(),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
    },
  } as unknown as SupabaseClient;
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const { url, key } = getSupabaseConfig();

    if (!url || !key) {
      supabaseInstance = createMockSupabase();
    } else {
      try {
        supabaseInstance = createClient(url, key);
      } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
        supabaseInstance = createMockSupabase();
      }
    }
  }
  return supabaseInstance;
};

export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop, receiver) => {
    return Reflect.get(getSupabase(), prop, receiver);
  }
});

export const authSkeletons = {
  signIn: async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  },

  signUp: async (email: string, password: string, metadata: any) => {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
  },

  resetPassword: async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/update-password`
    });
  },

  updateUser: async (attributes: any) => {
    return supabase.auth.updateUser(attributes);
  },

  signOut: async () => {
    return supabase.auth.signOut();
  }
};
