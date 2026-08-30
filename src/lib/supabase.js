import { createClient } from '@supabase/supabase-js';

// Get config from localStorage or fallback to Vite env variables
export function getSupabaseConfig() {
  const localUrl = localStorage.getItem('kos_supabase_url');
  const localKey = localStorage.getItem('kos_supabase_anon_key');
  
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const url = localUrl || envUrl || '';
  const key = localKey || envKey || '';
  
  return { url, key, isCustom: Boolean(localUrl && localKey) };
}

export function saveSupabaseConfig(url, key) {
  if (url && key) {
    localStorage.setItem('kos_supabase_url', url.trim());
    localStorage.setItem('kos_supabase_anon_key', key.trim());
  } else {
    localStorage.removeItem('kos_supabase_url');
    localStorage.removeItem('kos_supabase_anon_key');
  }
}

let supabaseInstance = null;

export function getSupabase() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  
  if (!supabaseInstance || supabaseInstance.supabaseUrl !== url) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (e) {
      console.error('Gagal menginisialisasi Supabase:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
}
