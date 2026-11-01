import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const REPO_DEFAULT_OPS_URL = 'https://eszshwdyvfuzynnvedxi.supabase.co';
export const REPO_DEFAULT_OPS_KEY = 'sb_publishable_0jQCEYJ-jUqdhnehK7X3ig_bIgiOChy';

export const getOperatorsSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_OPERATORS_URL;
  const envKey = import.meta.env.VITE_SUPABASE_OPERATORS_ANON_KEY;
  const localUrl = localStorage.getItem('splash_supa_ops_url');
  const localKey = localStorage.getItem('splash_supa_ops_key');

  const isInvalidCachedKey = localKey && (localKey.includes('juqdhneh') || localKey.includes('bIgioChy'));
  const effectiveLocalKey = isInvalidCachedKey ? '' : localKey;

  const url = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : (localUrl ? localUrl.trim() : REPO_DEFAULT_OPS_URL);
  const key = (envKey && envKey.trim() !== '') ? envKey.trim() : (effectiveLocalKey ? effectiveLocalKey.trim() : REPO_DEFAULT_OPS_KEY);

  return { url, key };
};

let operatorsClient: SupabaseClient | null = null;

export const initOperatorsSupabase = (customUrl?: string, customKey?: string): SupabaseClient | null => {
  const { url: defaultUrl, key: defaultKey } = getOperatorsSupabaseConfig();
  const url = customUrl || defaultUrl;
  const key = customKey || defaultKey;

  if (url && key && url.startsWith('http')) {
    try {
      operatorsClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      });
      return operatorsClient;
    } catch (err) {
      console.warn('⚠️ Error al inicializar Segundo Supabase (Operarios):', err);
      operatorsClient = null;
    }
  } else {
    operatorsClient = null;
  }
  return null;
};

// Inicializar por defecto
initOperatorsSupabase();

export const getOperatorsSupabase = (): SupabaseClient | null => {
  if (!operatorsClient) {
    operatorsClient = initOperatorsSupabase();
  }
  return operatorsClient;
};

export const isOperatorsSupabaseConfigured = (): boolean => {
  const { url, key } = getOperatorsSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};
