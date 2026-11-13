import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** False when either env var is missing — the app then runs on demo (mock) data. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/** The Supabase URL (empty string when not configured). */
export const supabaseUrl = url ?? '';

/** The anon key, needed as the `apikey` header for Edge Function calls. */
export const supabaseAnonKey = anonKey ?? '';

/** Null in demo mode; nothing in the app may crash when env vars are absent. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
