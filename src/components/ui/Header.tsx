import React from 'react';
import { Database, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { isMainSupabaseConfigured } from '../../integrations/supabase-main/client';
import { isOperatorsSupabaseConfigured } from '../../integrations/supabase-operators/client';

interface HeaderProps {
  onRefresh?: () => void;
  onOpenSettings: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onRefresh, 
  onOpenSettings,
  isRefreshing = false 
}) => {
  const isMainSupa = isMainSupabaseConfigured();
  const isOpsSupa = isOperatorsSupabaseConfigured();

  return (
    <header className="sticky top-0 z-30 bg-[#0A0E11]/95 backdrop-blur-md border-b border-[#252D38] px-4 py-2.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0090A0] to-[#00CED1] flex items-center justify-center text-slate-950 font-black text-base shadow-sm shadow-[#00CED1]/20">
          S
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-extrabold text-[#F0F4F8] tracking-tight">SPLASH</h1>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#00CED1]/15 text-[#00CED1] border border-[#00CED1]/30">
              AGENDA MOBILE
            </span>
          </div>
          <p className="text-[10px] text-[#8A9BB0]">Gestión de Servicios y Despacho</p>
        </div>
      </div>

      {/* Indicadores de Supabase Dual & Botón de recarga */}
      <div className="flex items-center gap-1.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`w-8 h-8 rounded-xl bg-[#181D22] hover:bg-[#252D38] border border-[#2E3847] flex items-center justify-center text-[#8A9BB0] hover:text-[#F0F4F8] transition ${
              isRefreshing ? 'animate-spin text-[#00CED1]' : ''
            }`}
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#181D22] border border-[#2E3847] hover:border-[#3D4E63] transition"
          title="Ajustes de Supabase"
        >
          {/* Supa Principal */}
          <div 
            className={`w-2 h-2 rounded-full ${isMainSupa ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`} 
            title={isMainSupa ? 'Supa Principal Conectado' : 'Supa Principal Local'}
          />
          {/* Supa Operarios */}
          <div 
            className={`w-2 h-2 rounded-full ${isOpsSupa ? 'bg-[#00CED1]' : 'bg-[#4A5A70]'}`}
            title={isOpsSupa ? 'Supa Operarios Conectado' : 'Supa Operarios Pendiente'} 
          />
          <span className="text-[10px] font-bold text-[#8A9BB0] ml-0.5">Supa</span>
        </button>
      </div>
    </header>
  );
};

