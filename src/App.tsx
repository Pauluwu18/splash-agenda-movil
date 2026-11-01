import React, { useState, useEffect } from 'react';
import { Header } from './components/ui/Header';
import { BottomNav, NavigationTab } from './components/ui/BottomNav';
import { AgendaView } from './modules/agenda/AgendaView';
import { CreateServiceView } from './modules/services/CreateServiceView';
import { PeopleView } from './modules/people/PeopleView';
import { ServicesCatalogView } from './modules/catalog/ServicesCatalogView';
import { SettingsView } from './modules/settings/SettingsView';
import { WhatsAppSummary } from './modules/services/WhatsAppSummary';
import { EditServiceModal } from './modules/services/EditServiceModal';
import { LoginView } from './modules/auth/LoginView';
import { ServicioAgenda } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('agenda');
  const [sharingService, setSharingService] = useState<ServicioAgenda | null>(null);
  const [editingService, setEditingService] = useState<ServicioAgenda | null>(null);
  const [toast, setToast] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Estado de Tema: 'dark' u 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('sumaq_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Estado de Autenticación
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(() => {
    try {
      const saved = localStorage.getItem('sumaq_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sincronizar clase en HTML para modo claro / oscuro
  useEffect(() => {
    try {
      localStorage.setItem('sumaq_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } catch (_) {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    localStorage.removeItem('sumaq_auth_user');
    setCurrentUser(null);
    showNotification('👋 Sesión cerrada correctamente');
  };

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

  // Si no está autenticado, mostrar la vista de Login idéntica a captura del usuario
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showNotification(`¡Bienvenido, ${user.username}!`);
        }}
      />
    );
  }

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'light-mode bg-[#F1F5F9] text-slate-900' : 'bg-[#0A0E11] text-[#F0F4F8]'} flex justify-center selection:bg-[#00CED1] selection:text-slate-950 w-full overflow-x-hidden transition-colors`}>
      <div className={`w-full max-w-full lg:max-w-6xl xl:max-w-7xl min-h-screen flex flex-col relative ${isLight ? 'bg-[#F8FAFC] lg:border-x lg:border-slate-200 shadow-xl' : 'bg-[#0A0E11] lg:border-x lg:border-[#1E2530] shadow-2xl'}`}>
        
        {/* Barra Superior SUMAQ con Logo y Menú de Perfil */}
        <Header
          onRefresh={() => {
            setRefreshKey(prev => prev + 1);
            showNotification('🔄 Agenda sincronizada');
          }}
          onOpenSettings={() => setActiveTab('ajustes')}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          username={currentUser.username}
          role={currentUser.role}
        />

        {/* Notificación Flotante Toast */}
        {toast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1E2530]/95 border border-[#00CED1]/50 text-[#F0F4F8] px-4 py-2 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            {toast}
          </div>
        )}

        {/* Contenido Principal por Módulo */}
        <main className="flex-1 w-full">
          {activeTab === 'agenda' && (
            <AgendaView
              key={refreshKey}
              onNewService={() => setActiveTab('crear')}
              onShareService={(svc) => setSharingService(svc)}
              onEditService={(svc) => setEditingService(svc)}
            />
          )}

          {activeTab === 'servicios' && (
            <ServicesCatalogView />
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
