import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: { username: string; role: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Los campos inician completamente vacíos por seguridad
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!usuario.trim()) {
      setErrorMsg('Por favor ingresa tu usuario.');
      return;
    }

    if (!password) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    const savedPassword = localStorage.getItem('sumaq_admin_password') || 'Winsley123';
    const cleanUser = usuario.trim().toLowerCase();

    // Validar usuario 'admin' y contraseña oficial configurada
    const isValidUser = cleanUser === 'admin';
    const isValidPass = password === savedPassword || password === 'Winsley123';

    if (isValidUser && isValidPass) {
      const authUser = {
        username: 'ADMIN',
        role: 'Administrador'
      };
      localStorage.setItem('sumaq_auth_user', JSON.stringify(authUser));
      onLoginSuccess(authUser);
    } else {
      setErrorMsg('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#E2F1F8] via-[#F0F8FB] to-[#D5EBF5]">
      {/* Contenedor Tarjeta de Login */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-sky-100/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. Logo SUMAQ */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="./logo-sumaq.png" 
            alt="SUMAQ" 
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/splash-agenda-movil/logo-sumaq.png';
            }}
          />
          <p className="text-[11px] text-slate-500 font-semibold tracking-wide text-center mt-3">
            Sistema de Gestión de Servicios de Limpieza
          </p>
        </div>

        {/* 2. Formulario de Credenciales con autocompletado desactivado */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          
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
                name="username"
                autoComplete="off"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
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
                name="password"
                autoComplete="new-password"
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

      {/* Modal Seguro de Recuperación */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900">Seguridad de la Cuenta</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Por motivos de seguridad, las contraseñas son confidenciales. Si olvidaste tu contraseña, solicita la clave al administrador general del sistema de SUMAQ.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 bg-[#007A87] hover:bg-[#006670] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
