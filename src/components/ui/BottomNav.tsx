import React from 'react';
import { Calendar, Users, Tag, Plus, SlidersHorizontal } from 'lucide-react';

export type NavigationTab = 'agenda' | 'crear' | 'personas' | 'servicios' | 'ajustes';

interface BottomNavProps {
  activeTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  agendaBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  agendaBadgeCount = 0
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#111418]/95 backdrop-blur-xl border-t border-[#252D38] shadow-2xl max-w-lg lg:max-w-xl mx-auto safe-area-bottom rounded-t-2xl lg:rounded-t-3xl">
      <div className="flex items-center justify-around h-16 px-1">
        {/* 1. AGENDA */}
        <button
          type="button"
          onClick={() => onChangeTab('agenda')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'agenda' ? 'text-[#00CED1] font-bold' : 'text-[#8A9BB0] hover:text-[#F0F4F8]'
          }`}
        >
          <div className="relative">
            <Calendar className={`w-5 h-5 ${activeTab === 'agenda' ? 'stroke-[2.5]' : ''}`} />
            {agendaBadgeCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#00CED1] text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {agendaBadgeCount > 99 ? '99+' : agendaBadgeCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Agenda</span>
        </button>

        {/* 2. SERVICIOS (Catálogo y Precios) */}
        <button
          type="button"
          onClick={() => onChangeTab('servicios')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'servicios' ? 'text-[#00CED1] font-bold' : 'text-[#8A9BB0] hover:text-[#F0F4F8]'
          }`}
        >
          <Tag className={`w-5 h-5 ${activeTab === 'servicios' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">Servicios</span>
        </button>

        {/* BOTÓN CENTRAL: CREAR AGENDA */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={() => onChangeTab('crear')}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-slate-950 font-black shadow-lg shadow-[#00CED1]/30 transition-transform active:scale-90 cursor-pointer ${
              activeTab === 'crear'
                ? 'bg-[#F0F4F8] ring-4 ring-[#00CED1]/40'
                : 'bg-gradient-to-tr from-[#00B5B8] to-[#00CED1] hover:brightness-110'
            }`}
            title="Agendar Servicio"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* 3. PERSONAS (Colaboradores) */}
        <button
          type="button"
          onClick={() => onChangeTab('personas')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'personas' ? 'text-[#00CED1] font-bold' : 'text-[#8A9BB0] hover:text-[#F0F4F8]'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'personas' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">Personas</span>
        </button>

        {/* 4. MÁS / ESTADO */}
        <button
          type="button"
          onClick={() => onChangeTab('ajustes')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'ajustes' ? 'text-[#00CED1] font-bold' : 'text-[#8A9BB0] hover:text-[#F0F4F8]'
          }`}
        >
          <SlidersHorizontal className={`w-5 h-5 ${activeTab === 'ajustes' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">Más</span>
        </button>
      </div>
    </nav>
  );
};
