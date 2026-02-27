import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if real credentials are configured (not placeholder values)
const isRealConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key');

if (!isRealConfig) {
  console.info('Supabase not configured. Running in demo mode with local data.');
}

export const supabase = isRealConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => {
  return supabase !== null;
};
