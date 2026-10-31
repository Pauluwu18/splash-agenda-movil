import React, { useState } from 'react';
import { Database, Check, AlertCircle, Save, ExternalLink, X, RefreshCw } from 'lucide-react';
import { 
  isSupabaseConfigured, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials 
} from '../lib/supabase';

export default function ConfigModal({ onClose }) {
  const [url, setUrl] = useState(localStorage.getItem('app_agenda_supa_url') || import.meta.env.VITE_SUPABASE_URL || '');
  const [key, setKey] = useState(localStorage.getItem('app_agenda_supa_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const conectado = isSupabaseConfigured();

  const handleGuardar = () => {
    if (!url.trim() || !key.trim()) {
      setIsError(true);
      setMsg('Por favor completa la URL y la Anon Key de Supabase');
      return;
    }

    try {
      saveSupabaseCredentials(url, key);
      setIsError(false);
      setMsg('¡Credenciales guardadas con éxito! Recargando datos...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e) {
      setIsError(true);
      setMsg('Error al conectar con Supabase');
    }
  };

  const handleReset = () => {
    if (confirm('¿Restablecer y usar el Modo Local (LocalStorage)?')) {
      clearSupabaseCredentials();
      setUrl('');
      setKey('');
      setMsg('Modo local activado');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Conexión con Supabase</h3>
              <p className="text-xs text-slate-500">Base de datos en la nube</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Estado actual */}
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          conectado 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {conectado ? (
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <div className="text-xs">
            <span className="font-bold block">
              {conectado ? 'Conectado a Supabase' : 'Modo Local (Sin conexión a Supabase)'}
            </span>
            <span className="text-[11px] opacity-80">
              {conectado ? 'Tus agendas se sincronizan en la nube.' : 'Los datos se guardan en la memoria de este teléfono.'}
            </span>
          </div>
        </div>

        {msg && (
          <div className={`p-2.5 rounded-lg text-xs font-medium ${isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
            {msg}
          </div>
        )}

        {/* Formulario */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Project URL de Supabase:
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Anon / Public API Key:
            </label>
            <textarea
              rows={2}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] text-slate-600 space-y-1 leading-relaxed">
            <p className="font-semibold text-slate-800">💡 ¿Dónde consigo estos datos?</p>
            <p>1. Entra a <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-600 underline">supabase.com</a> y crea un proyecto gratuito.</p>
            <p>2. Ve a <b>Project Settings → API</b> y copia tu URL y tu clave 'anon public'.</p>
            <p>3. En el menú <b>SQL Editor</b> ejecuta el archivo <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">supabase_schema.sql</code> que dejamos en tu carpeta de proyecto.</p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleGuardar}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-cyan-600/25 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Conectar Supabase</span>
            </button>

            {conectado && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 px-3 text-xs text-slate-500 hover:text-rose-600 transition"
              >
                Desconectar y volver a Modo Local
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

