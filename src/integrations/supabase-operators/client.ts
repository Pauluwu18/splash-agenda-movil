import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getOperatorsSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_OPERATORS_URL;
  const envKey = import.meta.env.VITE_SUPABASE_OPERATORS_ANON_KEY;
  const localUrl = localStorage.getItem('splash_supa_ops_url');
  const localKey = localStorage.getItem('splash_supa_ops_key');

  const url = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : (localUrl ? localUrl.trim() : '');
  const key = (envKey && envKey.trim() !== '') ? envKey.trim() : (localKey ? localKey.trim() : '');

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
  return getOperatorsSupabase() !== null;
};

export const saveOperatorsSupabaseCredentials = (url: string, key: string) => {
  if (url) localStorage.setItem('splash_supa_ops_url', url.trim());
  if (key) localStorage.setItem('splash_supa_ops_key', key.trim());
  return initOperatorsSupabase(url, key);
};

export const clearOperatorsSupabaseCredentials = () => {
  localStorage.removeItem('splash_supa_ops_url');
  localStorage.removeItem('splash_supa_ops_key');
  operatorsClient = null;
};
