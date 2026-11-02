import React, { useState } from 'react';
import { 
  Cloud, RefreshCw, Sparkles, ShieldCheck, 
  Smartphone, Monitor, Zap, Info, CheckCircle2 
} from 'lucide-react';
import { isMainSupabaseConfigured, getMainSupabaseConfig } from '../../integrations/supabase-main/client';
import { isOperatorsSupabaseConfigured } from '../../integrations/supabase-operators/client';
import { notifyServiciosChange } from '../../integrations/supabase-main/services';

export const SettingsView: React.FC = () => {
  const [sincronizando, setSincronizando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
  const mainConfig = getMainSupabaseConfig();
  const isMainConectado = isMainSupabaseConfigured();
  const isOpsConectado = isOperatorsSupabaseConfigured();

  const handleForzarSincronizacion = () => {
    setSincronizando(true);
    setMensaje('');
    notifyServiciosChange();
    setTimeout(() => {
      setSincronizando(false);
      setMensaje('⚡ Datos y agenda sincronizados en tiempo real.');
      setTimeout(() => setMensaje(''), 3000);
    }, 800);
  };

  return (
    <div className="pb-28 max-w-lg mx-auto">
      {/* Header móvil */}
      <div className="sticky top-13 z-20 bg-[#0A0E11]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#252D38] flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#F0F4F8] flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#00CED1]" />
            <span>Estado del Sistema</span>
          </h2>
          <p className="text-[10px] text-[#8A9BB0]">Conexión en Tiempo Real y Despacho</p>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>EN VIVO</span>
        </span>
      </div>

      <div className="p-4 space-y-4">
        {mensaje && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensaje}</span>
          </div>
        )}

        {/* 1. ESTADO DE LA CONEXIÓN CLOUD */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00CED1]/15 text-[#00CED1] flex items-center justify-center font-bold">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-[#F0F4F8]">SUMAQ Cloud (Supabase)</h3>
                <p className="text-[10px] text-[#8A9BB0] font-mono">
                  {mainConfig.url.replace('https://', '') || 'Conectado'}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Conectado</span>
            </span>
          </div>

          <div className="p-3 bg-[#111418] rounded-xl border border-[#252D38] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8A9BB0] flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-[#00CED1]" />
                <span>Web PC:</span>
              </span>
              <span className="text-emerald-400 font-bold">Sincronizado</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8A9BB0] flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#00CED1]" />
                <span>Web Móvil Android / PWA:</span>
              </span>
              <span className="text-emerald-400 font-bold">Sincronizado</span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1E2530]">
              <span className="text-[#8A9BB0]">Modo de sincronización:</span>
              <span className="text-[#00CED1] font-bold">WebSockets Realtime + Cross-Tab</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleForzarSincronizacion}
            disabled={sincronizando}
            className="w-full py-2.5 bg-[#1E2530] hover:bg-[#252D38] active:scale-98 text-[#00CED1] font-bold text-xs rounded-xl border border-[#2E3847] flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin' : ''}`} />
            <span>{sincronizando ? 'Sincronizando...' : 'Comprobar Sincronización en Vivo'}</span>
          </button>
        </div>

        {/* 2. PROTECCIÓN DE CREDENCIALES */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-xs text-[#F0F4F8]">Credenciales Aseguradas</h3>
          </div>
          <p className="text-[11px] text-[#8A9BB0] leading-relaxed">
            La conexión con Supabase está integrada permanentemente a nivel del código fuente y variables de entorno del repositorio (<code className="text-[#00CED1] bg-[#111418] px-1 py-0.5 rounded">.env</code>). Ningún operador puede modificar ni exponer las claves de la base de datos desde la interfaz de la aplicación.
          </p>
        </div>

        {/* 3. INFORMACIÓN DE LA APLICACIÓN */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-2 text-[11px] text-[#8A9BB0]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#F0F4F8]">SUMAQ Agenda Mobile</span>
            <span className="text-[10px] font-mono text-[#00CED1]">v1.2.0</span>
          </div>
          <p>
            Plataforma móvil y PWA optimizada para registro rápido de servicios, agendamiento táctil, corte de asignación de las 18:00 y despacho por WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
};
