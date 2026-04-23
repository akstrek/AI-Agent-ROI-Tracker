import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These env vars should be provided by the platform/user in the Settings menu.
const getSupabaseConfig = () => {
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  return { url, key };
};

/**
 * Mock Supabase Client
 * 
 * Provides no-op implementations of core methods to prevent app crashes 
 * when credentials are missing.
 */
const createMockSupabase = () => {
  console.warn('RUNNING IN MOCK MODE: Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing.');
  
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
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error('Supabase not configured') }),
          maybeSingle: async () => ({ data: null, error: new Error('Supabase not configured') }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: new Error('Supabase not configured') }),
        }),
      }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
    },
  } as unknown as SupabaseClient;
};

let supabaseInstance: SupabaseClient | null = null;

/**
 * Ergon Supabase Client Getter
 * 
 * Lazy initializes the client. If credentials are missing, returns a 
 * mock client to ensure the UI remains usable for demonstration.
 */
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

/**
 * Exported Supabase client proxy
 * 
 * Ensures any code importing 'supabase' gets the configured or mock instance safely.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop, receiver) => {
    return Reflect.get(getSupabase(), prop, receiver);
  }
});

/**
 * SKELETON FUNCTIONS
 * Using the proxy-wrapped supabase for all operations.
 */
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
      redirectTo: `${window.location.origin}/auth/update-password` 
    });
  },

  updateUser: async (attributes: any) => {
    return supabase.auth.updateUser(attributes);
  },

  signOut: async () => {
    return supabase.auth.signOut();
  }
};
