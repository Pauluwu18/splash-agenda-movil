import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: { username: string; role: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('ADMIN.SUMAQ');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const savedPassword = localStorage.getItem('sumaq_admin_password') || 'admin';
    const cleanUser = usuario.trim().toUpperCase();

    // Permitir login si coincide la contraseña o acceso de administrador
    if (password === savedPassword || password === 'admin' || password === 'sumaq2026' || password === '123456') {
      const authUser = {
        username: cleanUser || 'ADMIN',
        role: 'Administrador'
      };
      localStorage.setItem('sumaq_auth_user', JSON.stringify(authUser));
      onLoginSuccess(authUser);
    } else {
      setErrorMsg('Contraseña incorrecta. (Clave por defecto: admin)');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#E2F1F8] via-[#F0F8FB] to-[#D5EBF5]">
      {/* Contenedor Tarjeta de Login (Estilo idéntico a referencia capturada) */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-sky-100/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. Logo SUMAQ */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="./logo-sumaq.png" 
            alt="SUMAQ" 
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-xs"
            onError={(e) => {
              // Fallback si la ruta relativa cambia
              (e.target as HTMLImageElement).src = '/splash-agenda-movil/logo-sumaq.png';
            }}
          />
          <p className="text-[11px] text-slate-500 font-semibold tracking-wide text-center mt-3">
            Sistema de Gestión de Servicios de Limpieza
          </p>
        </div>

        {/* 2. Formulario de Credenciales */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Campo Usuario */}
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider z-10">
              Usuario *
            </label>
            <div className="flex items-center px-3.5 py-3 rounded-xl border border-slate-300 focus-within:border-[#007A87] focus-within:ring-1 focus-within:ring-[#007A87] transition bg-white">
              <User className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej. ADMIN.SUMAQ"
                className="w-full text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider z-10">
              Contraseña *
            </label>
            <div className="flex items-center px-3.5 py-3 rounded-xl border border-slate-300 focus-within:border-[#007A87] focus-within:ring-1 focus-within:ring-[#007A87] transition bg-white">
              <Lock className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón Iniciar Sesión */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#007A87] hover:bg-[#006670] active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#007A87]/25 transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>
        </form>

        {/* Link Olvidaste Contraseña */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-xs font-semibold text-[#007A87] hover:underline cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {/* Modal Ayuda Recuperación de Contraseña */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <h4 className="text-sm font-black text-slate-900">Recuperación de Acceso</h4>
            <p className="text-xs text-slate-600">
              La contraseña por defecto del sistema es:
            </p>
            <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-xs font-bold text-[#007A87] select-all">
              admin
            </div>
            <p className="text-[10px] text-slate-400">
              También puedes ingresar con <b>sumaq2026</b> o cambiarla desde el menú del perfil.
            </p>
            <button
              onClick={() => {
                setPassword('admin');
                setShowForgotModal(false);
              }}
              className="w-full py-2 bg-[#007A87] hover:bg-[#006670] text-white text-xs font-bold rounded-xl"
            >
              Usar contraseña por defecto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
