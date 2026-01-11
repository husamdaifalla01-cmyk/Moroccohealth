// ==============================================
// DAWA.ma Supabase Server Client
// Uses service role key - ONLY for server-side use
// ==============================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

/**
 * Create a Supabase admin client with service role key
 * IMPORTANT: Only use this on the server side
 * This bypasses RLS policies
 */
export const createSupabaseAdmin = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY - admin client requires service role key');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Create a Supabase client with a specific user's JWT
 * Useful for API routes that need to act on behalf of a user
 */
export const createSupabaseClientWithToken = (accessToken: string) => {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseAnonKey) {
    throw new Error('Missing Supabase anon key');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

/**
 * Set app context for audit logging
 * Call this before operations that should be audited
 */
export const setAuditContext = async (
  client: ReturnType<typeof createSupabaseAdmin>,
  userType: string,
  userId: string
) => {
  await client.rpc('set_config', {
    setting: 'app.user_type',
    value: userType,
  });
  await client.rpc('set_config', {
    setting: 'app.user_id',
    value: userId,
  });
};

// Re-export types
export type { Database };
