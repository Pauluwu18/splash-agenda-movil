import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =========================================================================
// CONFIGURACIÓN OFICIAL FIJADA EN EL REPOSITORIO (SUMAQ)
// =========================================================================
export const REPO_DEFAULT_MAIN_URL = 'https://eszshwdyvfuzynnvedxi.supabase.co';
export const REPO_DEFAULT_MAIN_KEY = 'sb_publishable_0jQCEYJ-jUqdhnehK7X3ig_bIgiOChy';

export const normalizeSupabaseUrl = (raw: string): string => {
  if (!raw) return '';
  return raw.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

export const getMainSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_MAIN_URL || import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_MAIN_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('splash_supa_main_url');
  const localKey = localStorage.getItem('splash_supa_main_key');

  const rawUrl = (envUrl && envUrl.trim() !== '') 
    ? envUrl 
    : (localUrl && localUrl.trim() !== '' ? localUrl : REPO_DEFAULT_MAIN_URL);
    
  // Si la clave guardada en localStorage es la versión anterior con minúsculas erróneas, usar la clave válida del repositorio
  const isInvalidCachedKey = localKey && (localKey.includes('juqdhneh') || localKey.includes('bIgioChy'));
  const effectiveLocalKey = isInvalidCachedKey ? '' : localKey;

  const key = (envKey && envKey.trim() !== '') 
    ? envKey.trim() 
    : (effectiveLocalKey && effectiveLocalKey.trim() !== '' ? effectiveLocalKey.trim() : REPO_DEFAULT_MAIN_KEY);

  const url = normalizeSupabaseUrl(rawUrl);

  return { url, key };
};

let mainClient: SupabaseClient | null = null;

export const initMainSupabase = (customUrl?: string, customKey?: string): SupabaseClient | null => {
  const { url: defaultUrl, key: defaultKey } = getMainSupabaseConfig();
  const rawUrl = customUrl || defaultUrl;
  const key = customKey || defaultKey;
  const url = normalizeSupabaseUrl(rawUrl);

  if (url && key && url.startsWith('http')) {
    try {
      mainClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
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
  const { url, key } = getMainSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};
