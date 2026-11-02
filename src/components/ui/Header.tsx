import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Moon, Sun, KeyRound, LogOut, Check, X, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  onOpenSettings: () => void;
  isRefreshing?: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
  username?: string;
  role?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onRefresh, 
  onOpenSettings,
  isRefreshing = false,
  theme,
  onToggleTheme,
  onLogout,
  username = 'ADMIN',
  role = 'Administrador'
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleGuardarContrasena = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!newPass.trim()) {
      setPassError('Ingresa una contraseña válida');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Las contraseñas no coinciden');
      return;
    }
    localStorage.setItem('sumaq_admin_password', newPass);
    setPassSuccess(true);
    setTimeout(() => {
      setPassSuccess(false);
      setModalPassword(false);
      setNewPass('');
      setConfirmPass('');
    }, 1200);
  };

  const isDarkMode = theme === 'dark';

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0A0E11]/95 backdrop-blur-md border-b border-[#252D38] px-3 sm:px-4 py-2.5 flex items-center justify-between transition-colors">
        
        {/* Brand SUMAQ con Logo Oficial y Botón de Perfil */}
        <div className="flex items-center gap-2.5 relative" ref={menuRef}>
          
          {/* Avatar 'S' interactivo señalado por el usuario */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#0090A0] to-[#00CED1] hover:brightness-110 active:scale-95 flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-[#00CED1]/20 cursor-pointer transition shrink-0"
            title="Abrir menú de usuario (Modo claro/oscuro, seguridad y logout)"
            aria-label="Menú de Usuario"
          >
            S
          </button>

          {/* Logo Oficial SUMAQ en vez de solo texto plano */}
          <div className="flex items-center gap-2">
            <img 
              src="./logo-sumaq.png" 
              alt="SUMAQ" 
              className="h-7 sm:h-8 w-auto object-contain cursor-pointer drop-shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = './logo-sumaq.png';
              }}
              onClick={() => setMenuOpen(!menuOpen)}
            />
            <div className="hidden md:flex flex-col">
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#00CED1]/15 text-[#00CED1] border border-[#00CED1]/30 w-fit">
                AGENDA Y DESPACHO
              </span>
              <p className="text-[10px] text-[#8A9BB0]">Gestión de Servicios y Operarios</p>
            </div>
          </div>

          {/* DROPDOWN POPOVER EXACTO A CAPTURA DEL USUARIO */}
          {menuOpen && (
            <div className="absolute top-11 left-0 z-50 w-56 bg-[#181D22] border border-[#2E3847] rounded-2xl shadow-2xl p-3.5 space-y-3.5 text-xs animate-in fade-in zoom-in-95 duration-150 admin-popover">
              
              {/* Encabezado: ADMIN / Administrador */}
              <div className="border-b border-[#252D38] pb-2.5">
                <h4 className="font-extrabold text-[#F0F4F8] text-sm tracking-wide uppercase">
                  {username}
                </h4>
                <p className="text-[11px] text-[#8A9BB0]">
                  {role}
                </p>
              </div>

              {/* 1. Toggle Modo Oscuro / Modo Claro */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-[#F0F4F8] font-bold">
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-[#00CED1]" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                  <span>Modo oscuro</span>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    isDarkMode ? 'bg-[#00CED1]' : 'bg-[#3E4A5B]'
                  }`}
                  aria-label="Alternar modo oscuro y claro"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      isDarkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 2. Cambiar contraseña */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setModalPassword(true);
                  }}
                  className="w-full flex items-center gap-2.5 py-1.5 text-[#F0F4F8] hover:text-[#00CED1] font-bold text-left transition cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-[#8A9BB0]" />
                  <span>Cambiar contraseña</span>
                </button>
              </div>

              {/* 3. Cerrar sesión */}
              <div className="border-t border-[#252D38] pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 py-1 text-rose-500 hover:text-rose-400 font-bold text-left transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Indicador de Tiempo Real & Recarga */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`w-8 h-8 rounded-xl bg-[#181D22] hover:bg-[#252D38] border border-[#2E3847] flex items-center justify-center text-[#8A9BB0] hover:text-[#F0F4F8] transition cursor-pointer ${
                isRefreshing ? 'animate-spin text-[#00CED1]' : ''
              }`}
              title="Refrescar agenda en vivo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#181D22] border border-[#252D38] hover:border-[#00CED1]/40 transition cursor-pointer"
            title="Ver Estado de Sincronización"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-extrabold text-[#F0F4F8]">EN VIVO</span>
          </button>
        </div>
      </header>

      {/* MODAL PARA CAMBIAR CONTRASEÑA */}
      {modalPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
          <form 
            onSubmit={handleGuardarContrasena}
            className="w-full max-w-sm bg-[#181D22] border border-[#2E3847] rounded-2xl p-5 space-y-3.5 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between border-b border-[#252D38] pb-2">
              <h4 className="text-xs font-black text-[#F0F4F8] uppercase tracking-wide">
                Cambiar Contraseña — {username}
              </h4>
              <button
                type="button"
                onClick={() => setModalPassword(false)}
                className="text-[#8A9BB0] hover:text-[#F0F4F8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passError && (
              <p className="p-2 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-[11px] font-bold">
                {passError}
              </p>
            )}

            {passSuccess && (
              <p className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> ¡Contraseña actualizada con éxito!
              </p>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8A9BB0] uppercase">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Ingresa nueva contraseña"
                className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:border-[#00CED1] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8A9BB0] uppercase">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:border-[#00CED1] focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalPassword(false)}
                className="flex-1 py-2 bg-[#111418] hover:bg-[#252D38] text-[#8A9BB0] text-xs font-bold rounded-xl border border-[#252D38] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#00CED1] hover:brightness-110 text-slate-950 text-xs font-black rounded-xl cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
