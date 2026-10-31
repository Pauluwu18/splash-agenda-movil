import React, { useState } from 'react';
import AgendaView from './components/AgendaView';
import CreateAgendaForm from './components/CreateAgendaForm';
import PersonasView from './components/PersonasView';
import ShareModal from './components/ShareModal';
import ConfigModal from './components/ConfigModal';
import BottomNav from './components/BottomNav';
import { isSupabaseConfigured } from './lib/supabase';
import { Sparkles, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('agenda'); // 'agenda', 'crear', 'personas'
  const [shareServicio, setShareServicio] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [toast, setToast] = useState('');

  const isSupa = isSupabaseConfigured();

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveSuccess = (servicioCompleto, compartirDirecto) => {
    if (compartirDirecto) {
      // Requisito: Botón "Guardar y compartir agenda"
      setShareServicio(servicioCompleto);
      setActiveTab('agenda');
      showNotification('✨ ¡Cita guardada! Lista para compartir');
    } else {
      // Requisito: Botón "Solo guardar"
      setActiveTab('agenda');
      showNotification('✅ Cita guardada correctamente en la agenda');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-cyan-500 selection:text-white">
      {/* Contenedor principal con ancho máximo de teléfono móvil */}
      <div className="w-full max-w-lg bg-slate-50 min-h-screen flex flex-col shadow-2xl relative">
        
        {/* Barra superior con branding y estado de Supabase */}
        <header className="px-4 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              S
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>SPLASH</span>
              <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded-md border border-cyan-200/60">
                AGENDA
              </span>
            </h1>
          </div>

          <button
            onClick={() => setShowConfig(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
              isSupa
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isSupa ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isSupa ? 'Supabase' : 'Modo Local'}</span>
          </button>
        </header>

        {/* Notificación flotante Toast */}
        {toast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-xs animate-in fade-in slide-in-from-top-2">
            {toast}
          </div>
        )}

        {/* Vistas según Tab activo */}
        <main className="flex-1">
          {activeTab === 'agenda' && (
            <AgendaView
              onNewAgenda={() => setActiveTab('crear')}
              onShareServicio={(svc) => setShareServicio(svc)}
            />
          )}

          {activeTab === 'crear' && (
            <CreateAgendaForm
              onSaveSuccess={handleSaveSuccess}
              onCancel={() => setActiveTab('agenda')}
              onOpenAddPersona={() => setActiveTab('personas')}
            />
          )}

          {activeTab === 'personas' && (
            <PersonasView />
          )}
        </main>

        {/* Barra de navegación inferior móvil */}
        {activeTab !== 'crear' && (
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenConfig={() => setShowConfig(true)}
          />
        )}

        {/* Modal de Compartir Agenda */}
        {shareServicio && (
          <ShareModal
            servicio={shareServicio}
            onClose={() => setShareServicio(null)}
          />
        )}

        {/* Modal de Configuración Supabase */}
        {showConfig && (
          <ConfigModal
            onClose={() => setShowConfig(false)}
          />
        )}
      </div>
    </div>
  );
}
