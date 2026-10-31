import React, { useState } from 'react';
import { Header } from './components/ui/Header';
import { BottomNav, NavigationTab } from './components/ui/BottomNav';
import { AgendaView } from './modules/agenda/AgendaView';
import { CreateServiceView } from './modules/services/CreateServiceView';
import { PeopleView } from './modules/people/PeopleView';
import { FleetView } from './modules/fleet/FleetView';
import { SettingsView } from './modules/settings/SettingsView';
import { WhatsAppSummary } from './modules/services/WhatsAppSummary';
import { EditServiceModal } from './modules/services/EditServiceModal';
import { ServicioAgenda } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('agenda');
  const [sharingService, setSharingService] = useState<ServicioAgenda | null>(null);
  const [editingService, setEditingService] = useState<ServicioAgenda | null>(null);
  const [toast, setToast] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreateSuccess = (savedService: ServicioAgenda, compartirDirecto: boolean) => {
    setActiveTab('agenda');
    setRefreshKey(prev => prev + 1);

    if (compartirDirecto) {
      setSharingService(savedService);
      showNotification('✨ ¡Cita guardada! Lista para enviar por WhatsApp');
    } else {
      showNotification('✅ Servicio guardado correctamente en la agenda');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E11] text-[#F0F4F8] flex justify-center selection:bg-[#00CED1] selection:text-slate-950">
      <div className="w-full max-w-lg min-h-screen flex flex-col relative bg-[#0A0E11] shadow-2xl border-x border-[#1E2530]">
        
        {/* Barra Superior SPLASH */}
        <Header
          onRefresh={() => {
            setRefreshKey(prev => prev + 1);
            showNotification('🔄 Agenda actualizada');
          }}
          onOpenSettings={() => setActiveTab('ajustes')}
        />

        {/* Notificación Flotante Toast */}
        {toast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1E2530]/95 border border-[#00CED1]/50 text-[#F0F4F8] px-4 py-2 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            {toast}
          </div>
        )}

        {/* Contenido Principal por Módulo */}
        <main className="flex-1">
          {activeTab === 'agenda' && (
            <AgendaView
              key={refreshKey}
              onNewService={() => setActiveTab('crear')}
              onShareService={(svc) => setSharingService(svc)}
              onEditService={(svc) => setEditingService(svc)}
            />
          )}

          {activeTab === 'crear' && (
            <CreateServiceView
              onSuccess={handleCreateSuccess}
              onCancel={() => setActiveTab('agenda')}
            />
          )}

          {activeTab === 'personas' && (
            <PeopleView />
          )}

          {activeTab === 'flota' && (
            <FleetView />
          )}

          {activeTab === 'ajustes' && (
            <SettingsView />
          )}
        </main>

        {/* Barra de Navegación Inferior (Visible en todos los módulos excepto al crear) */}
        {activeTab !== 'crear' && (
          <BottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
          />
        )}

        {/* Modal de Compartir WhatsApp */}
        {sharingService && (
          <WhatsAppSummary
            servicio={sharingService}
            onClose={() => setSharingService(null)}
          />
        )}

        {/* Modal de Edición / Reprogramación / Rectificación */}
        {editingService && (
          <EditServiceModal
            servicio={editingService}
            onClose={() => setEditingService(null)}
            onSuccess={() => {
              setRefreshKey(prev => prev + 1);
              showNotification('✅ Servicio actualizado correctamente');
            }}
          />
        )}
      </div>
    </div>
  );
}
