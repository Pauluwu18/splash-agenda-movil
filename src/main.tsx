import React, { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);

    // Si es un error de carga de chunk desactualizado por nueva versión, auto-recuperar inmediatamente
    const msg = error?.message || '';
    if (
      msg.includes('dynamically imported module') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Loading chunk') ||
      msg.includes('text/html')
    ) {
      this.handleLimpiarYRecargar(true);
    }
  }

  handleLimpiarYRecargar = async (silencioso = false) => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      localStorage.removeItem('splash_last_sync_time');
      localStorage.removeItem('sumaq_last_sync_time');
      sessionStorage.clear();
    } catch (_) {}

    // Hard reload forzando bypass de caché del navegador
    const cleanUrl = window.location.origin + window.location.pathname + '?v=' + Date.now();
    window.location.href = cleanUrl;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0E11] text-[#F0F4F8] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#181D22] border border-[#252D38] p-6 rounded-2xl space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center font-bold text-xl">
              ⚠️
            </div>
            <h2 className="text-base font-extrabold text-[#F0F4F8]">Aviso de Recuperación del Sistema</h2>
            <p className="text-xs text-[#8A9BB0]">
              La aplicación detectó una actualización en el sistema. Presiona el botón para sincronizar la versión más reciente.
            </p>
            {this.state.error?.message && (
              <p className="text-[10px] text-rose-400/80 bg-rose-950/30 p-2 rounded-lg font-mono text-left max-h-20 overflow-auto">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => this.handleLimpiarYRecargar(false)}
              className="w-full py-2.5 px-4 bg-[#00CED1] hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-lg shadow-[#00CED1]/20"
            >
              🔄 Limpiar Caché y Recargar SUMAQ
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Registrar Service Worker con actualización activa
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update();
    }).catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}
