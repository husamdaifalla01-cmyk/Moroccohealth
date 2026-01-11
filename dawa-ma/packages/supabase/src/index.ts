// ==============================================
// DAWA.ma Supabase Package
// ==============================================

// Client exports (for browser/mobile)
export { supabase, createSupabaseClient } from './client';

// Server exports (for API routes/edge functions)
export { createSupabaseAdmin, createSupabaseClientWithToken, setAuditContext } from './server';

// Type exports
export type { Database, Tables, TablesInsert, TablesUpdate, Json } from './database.types';
