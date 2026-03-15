import { createClient } from '@supabase/supabase-js';

// Get env vars with graceful fallback for development without Supabase
const getEnv = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] as string || fallback;
};

// Use placeholder values if env vars not set - app will work in demo mode
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'placeholder-key';

// SECURITY: Throw error in production if credentials are missing
if (supabaseUrl.includes('placeholder') && import.meta.env.PROD) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in production');
}

// Warn if using placeholder credentials (development only!)
if (supabaseUrl.includes('placeholder') && import.meta.env.DEV) {
  console.warn('⚠️ WARNING: Using placeholder Supabase credentials - this is for development/demo only!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

export const checkConnection = async () => {
  try {
    // If using placeholder, always return false
    if (supabaseUrl.includes('placeholder')) {
      return false;
    }
    const { error } = await supabase.from('activities').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Supabase Connection Check Failed:", e);
    return false;
  }
};
