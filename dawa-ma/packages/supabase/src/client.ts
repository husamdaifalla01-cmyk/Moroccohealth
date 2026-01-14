// ==============================================
// DAWA.ma Supabase Client (Browser/Mobile)
// ==============================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables (set in your app's env)
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || process.env['EXPO_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client for browser/mobile usage
 * Uses the anon key with RLS policies
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Create a new Supabase client with custom options
 * Useful for creating clients with different configurations
 */
export const createSupabaseClient = (options?: {
  supabaseUrl?: string;
  supabaseKey?: string;
  persistSession?: boolean;
}) => {
  return createClient<Database>(
    options?.supabaseUrl || supabaseUrl,
    options?.supabaseKey || supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: options?.persistSession ?? true,
        detectSessionInUrl: true,
      },
    }
  );
};

// Re-export types
export type { Database };
