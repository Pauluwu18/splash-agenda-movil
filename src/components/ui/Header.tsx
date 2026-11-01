import React from 'react';
import { RefreshCw } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-30 bg-[#0A0E11]/95 backdrop-blur-md border-b border-[#252D38] px-4 py-2.5 flex items-center justify-between">
      {/* Brand SUMAQ */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0090A0] to-[#00CED1] flex items-center justify-center text-slate-950 font-black text-base shadow-sm shadow-[#00CED1]/20">
          S
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-black text-[#F0F4F8] tracking-wider">SUMAQ</h1>
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#00CED1]/15 text-[#00CED1] border border-[#00CED1]/30">
              AGENDA Y DESPACHO
            </span>
          </div>
          <p className="text-[10px] text-[#8A9BB0]">Gestión de Servicios y Operarios</p>
        </div>
      </div>

      {/* Indicador de Tiempo Real & Recarga */}
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`w-8 h-8 rounded-xl bg-[#181D22] hover:bg-[#252D38] border border-[#2E3847] flex items-center justify-center text-[#8A9BB0] hover:text-[#F0F4F8] transition cursor-pointer ${
              isRefreshing ? 'animate-spin text-[#00CED1]' : ''
            }`}
            title="Refrescar agenda en vivo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#181D22] border border-[#252D38] hover:border-[#00CED1]/40 transition cursor-pointer"
          title="Ver Estado de Sincronización"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-extrabold text-[#F0F4F8]">EN VIVO</span>
        </button>
      </div>
    </header>
  );
};
