import React from 'react';
import { Calendar, Plus, Users, Settings, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export default function BottomNav({ activeTab, setActiveTab, onOpenConfig }) {
  const isSupa = isSupabaseConfigured();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-2xl max-w-lg mx-auto safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Tab 1: Agenda */}
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'agenda' ? 'text-cyan-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'agenda' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1">Agenda</span>
        </button>

        {/* Tab 2: Botón Central Crear Agenda */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={() => setActiveTab('crear')}
            className={`w-13 h-13 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
              activeTab === 'crear'
                ? 'bg-slate-900 ring-4 ring-cyan-500/30 shadow-cyan-600/40'
                : 'bg-gradient-to-tr from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 shadow-cyan-600/35'
            }`}
            title="Agendar Cita"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Personas */}
        <button
          onClick={() => setActiveTab('personas')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'personas' ? 'text-cyan-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'personas' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1">Personas</span>
        </button>

        {/* Tab 4: Configuración */}
        <button
          onClick={onOpenConfig}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-600 transition-all relative"
        >
          <div className="relative">
            <Settings className="w-5 h-5" />
            <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
              isSupa ? 'bg-emerald-500' : 'bg-amber-400'
            }`} />
          </div>
          <span className="text-[11px] mt-1">Supa</span>
        </button>
      </div>
    </nav>
  );
}

