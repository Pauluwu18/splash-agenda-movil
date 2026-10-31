import React, { useState } from 'react';
import { Database, Save, Check, AlertCircle, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { 
  isMainSupabaseConfigured, 
  saveMainSupabaseCredentials, 
  getMainSupabaseConfig 
} from '../../integrations/supabase-main/client';
import { 
  isOperatorsSupabaseConfigured, 
  saveOperatorsSupabaseCredentials, 
  clearOperatorsSupabaseCredentials, 
  getOperatorsSupabaseConfig 
} from '../../integrations/supabase-operators/client';

export const SettingsView: React.FC = () => {
  // Supabase Principal
  const mainConf = getMainSupabaseConfig();
  const [mainUrl, setMainUrl] = useState<string>(mainConf.url);
  const [mainKey, setMainKey] = useState<string>(mainConf.key);

  // Segundo Supabase (Operarios)
  const opsConf = getOperatorsSupabaseConfig();
  const [opsUrl, setOpsUrl] = useState<string>(opsConf.url);
  const [opsKey, setOpsKey] = useState<string>(opsConf.key);

  const [notif, setNotif] = useState<string>('');

  const isMainConectado = isMainSupabaseConfigured();
  const isOpsConectado = isOperatorsSupabaseConfigured();

  const handleGuardarMain = () => {
    if (!mainUrl.trim() || !mainKey.trim()) {
      setNotif('⚠️ Completa la URL y Anon Key del Supabase Principal');
      return;
    }
    saveMainSupabaseCredentials(mainUrl, mainKey);
    setNotif('✅ Supabase Principal guardado correctamente');
    setTimeout(() => window.location.reload(), 1200);
  };

  const handleGuardarOps = () => {
    if (!opsUrl.trim() || !opsKey.trim()) {
      setNotif('⚠️ Completa la URL y Anon Key del Segundo Supabase');
      return;
    }
    saveOperatorsSupabaseCredentials(opsUrl, opsKey);
    setNotif('✅ Segundo Supabase (Operarios) guardado correctamente');
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <div className="pb-28 max-w-lg mx-auto">
      {/* Header móvil */}
      <div className="sticky top-13 z-20 bg-[#0A0E11]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#252D38] flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#F0F4F8] flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#00CED1]" />
            <span>Configuración Supabase Dual</span>
          </h2>
          <p className="text-[10px] text-[#8A9BB0]">Gestión de Conexiones Cloud</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {notif && (
          <div className="p-3 bg-[#181D22] border border-[#00CED1]/50 text-[#F0F4F8] text-xs font-bold rounded-2xl">
            {notif}
          </div>
        )}

        {/* 1. SUPABASE PRINCIPAL */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMainConectado ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <h3 className="font-extrabold text-xs text-[#F0F4F8]">1. Supabase Principal (Servicios)</h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isMainConectado ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              {isMainConectado ? 'Conectado' : 'Modo Local'}
            </span>
          </div>

          <p className="text-[11px] text-[#8A9BB0] leading-relaxed">
            Administra Servicios, Clientes, Catálogo, Empresas, Sucursales y Agenda.
          </p>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-bold text-[#8A9BB0] block mb-1">Project URL:</label>
              <input
                type="url"
                placeholder="https://xyz.supabase.co"
                value={mainUrl}
                onChange={(e) => setMainUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8A9BB0] block mb-1">Anon / Public API Key:</label>
              <textarea
                rows={2}
                placeholder="eyJhbGci..."
                value={mainKey}
                onChange={(e) => setMainKey(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleGuardarMain}
              className="w-full py-2.5 bg-[#00CED1] hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#00CED1]/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Supabase Principal</span>
            </button>
          </div>
        </div>

        {/* 2. SEGUNDO SUPABASE (OPERARIOS) */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOpsConectado ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
              <h3 className="font-extrabold text-xs text-[#F0F4F8]">2. Segundo Supabase (Operarios)</h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isOpsConectado ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-[#111418] text-[#8A9BB0] border border-[#2E3847]'
            }`}>
              {isOpsConectado ? 'Conectado' : 'Pendiente / Local'}
            </span>
          </div>

          <p className="text-[11px] text-[#8A9BB0] leading-relaxed">
            Administra Colaboradores, DNI, Sueldos por servicio, Roles y Capacitaciones de forma aislada.
          </p>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-bold text-[#8A9BB0] block mb-1">Project URL (Operarios):</label>
              <input
                type="url"
                placeholder="https://segundo-proyecto.supabase.co"
                value={opsUrl}
                onChange={(e) => setOpsUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8A9BB0] block mb-1">Anon / Public Key (Operarios):</label>
              <textarea
                rows={2}
                placeholder="eyJhbGci..."
                value={opsKey}
                onChange={(e) => setOpsKey(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGuardarOps}
                className="flex-1 py-2.5 bg-[#1E2530] hover:bg-[#252D38] border border-[#2E3847] text-[#00CED1] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Segundo Supabase</span>
              </button>

              {isOpsConectado && (
                <button
                  type="button"
                  onClick={() => {
                    clearOperatorsSupabaseCredentials();
                    window.location.reload();
                  }}
                  className="px-3 py-2 text-xs text-rose-400 bg-[#111418] border border-[#2E3847] rounded-xl"
                >
                  Desconectar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Información de Arquitectura */}
        <div className="bg-[#111418] p-4 rounded-2xl border border-[#252D38] text-[11px] text-[#8A9BB0] space-y-2 leading-relaxed">
          <p className="font-extrabold text-[#F0F4F8]">💡 Arquitectura Independiente</p>
          <p>
            Ambos proyectos Supabase funcionan con clientes y credenciales separadas. Las asignaciones de operarios a los servicios se enlazan mediante identificadores estables sin requerir llaves foráneas cruzadas.
          </p>
        </div>
      </div>
    </div>
  );
};
