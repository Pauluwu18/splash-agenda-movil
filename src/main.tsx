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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

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
              La aplicación detectó una versión desactualizada en caché. Presiona el botón para limpiar y recargar la última versión.
            </p>
            <button
              onClick={() => {
                if ('caches' in window) {
                  caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
                }
                localStorage.removeItem('splash_last_sync_time');
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-[#00CED1] hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs rounded-xl transition"
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

// Registrar o actualizar Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update();
    }).catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}
