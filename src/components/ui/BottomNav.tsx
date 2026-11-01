import React from 'react';
import { Calendar, Users, Truck, Plus, SlidersHorizontal } from 'lucide-react';

export type NavigationTab = 'agenda' | 'crear' | 'personas' | 'flota' | 'ajustes';

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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#111418]/95 backdrop-blur-xl border-t border-[#252D38] shadow-2xl max-w-lg mx-auto safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {/* 1. AGENDA */}
        <button
          type="button"
          onClick={() => onChangeTab('agenda')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
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

        {/* 2. PERSONAS (2do Supabase) */}
        <button
          type="button"
          onClick={() => onChangeTab('personas')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'personas' ? 'text-[#00CED1] font-bold' : 'text-[#8A9BB0] hover:text-[#F0F4F8]'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'personas' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">Personas</span>
        </button>

        {/* BOTÓN CENTRAL: CREAR AGENDA */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={() => onChangeTab('crear')}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-slate-950 font-black shadow-lg shadow-[#00CED1]/30 transition-transform active:scale-90 ${
              activeTab === 'crear'
                ? 'bg-[#F0F4F8] ring-4 ring-[#00CED1]/40'
                : 'bg-gradient-to-tr from-[#00B5B8] to-[#00CED1] hover:brightness-110'
            }`}
            title="Crear Servicio"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* 3. FLOTA */}
        <button
          type="button"
          onClick={() => onChangeTab('flota')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'flota' ? 'text-[#00CED1] font-bold' : 'text-[#8A9BB0] hover:text-[#F0F4F8]'
          }`}
        >
          <Truck className={`w-5 h-5 ${activeTab === 'flota' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1 font-medium">Flota</span>
        </button>

        {/* 4. MÁS / AJUSTES */}
        <button
          type="button"
          onClick={() => onChangeTab('ajustes')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
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

