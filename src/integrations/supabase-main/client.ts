import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getMainSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_MAIN_URL || import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_MAIN_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('splash_supa_main_url') || localStorage.getItem('app_agenda_supa_url');
  const localKey = localStorage.getItem('splash_supa_main_key') || localStorage.getItem('app_agenda_supa_key');

  const url = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : (localUrl ? localUrl.trim() : '');
  const key = (envKey && envKey.trim() !== '') ? envKey.trim() : (localKey ? localKey.trim() : '');

  return { url, key };
};

let mainClient: SupabaseClient | null = null;

export const initMainSupabase = (customUrl?: string, customKey?: string): SupabaseClient | null => {
  const { url: defaultUrl, key: defaultKey } = getMainSupabaseConfig();
  const url = customUrl || defaultUrl;
  const key = customKey || defaultKey;

  if (url && key && url.startsWith('http')) {
    try {
      mainClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return mainClient;
    } catch (err) {
      console.warn('⚠️ Error al inicializar Supabase Principal:', err);
      mainClient = null;
    }
  } else {
    mainClient = null;
  }
  return null;
};

// Inicializar por defecto
initMainSupabase();

export const getMainSupabase = (): SupabaseClient | null => {
  if (!mainClient) {
    mainClient = initMainSupabase();
  }
  return mainClient;
};

export const isMainSupabaseConfigured = (): boolean => {
  return getMainSupabase() !== null;
};

export const saveMainSupabaseCredentials = (url: string, key: string) => {
  if (url) {
    localStorage.setItem('splash_supa_main_url', url.trim());
    localStorage.setItem('app_agenda_supa_url', url.trim());
  }
  if (key) {
    localStorage.setItem('splash_supa_main_key', key.trim());
    localStorage.setItem('app_agenda_supa_key', key.trim());
  }
  return initMainSupabase(url, key);
};

