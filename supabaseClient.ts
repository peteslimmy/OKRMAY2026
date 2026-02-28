
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] as string | undefined;
  if (!value && !fallback) {
    console.error(`Missing required environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || fallback!;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', getEnv('SUPABASE_URL'));
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', getEnv('SUPABASE_ANON_KEY'));

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('activities').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Supabase Connection Check Failed:", e);
    return false;
  }
};
