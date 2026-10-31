import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, Briefcase, Trash2, Check, X, Shield, Sparkles } from 'lucide-react';
import { getOperarios, saveOperario } from '../lib/supabase';

const COLORES_DISPONIBLES = [
  '#0284c7', '#0d9488', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#ef4444', '#10b981', '#6366f1'
];

export default function PersonasView() {
  const [personas, setPersonas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Formulario nueva persona
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cargo, setCargo] = useState('Operario');
  const [color, setColor] = useState('#0284c7');
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    const data = await getOperarios();
    setPersonas(data);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setGuardando(true);
    await saveOperario({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      cargo,
      color,
      activo: true
    });

    setNombre('');
    setTelefono('');
    setMostrarModal(false);
    setGuardando(false);
    cargar();
  };

  const handleToggleActivo = async (p) => {
    await saveOperario({ ...p, activo: !p.activo });
    cargar();
  };

  return (
    <div className="pb-28 max-w-lg mx-auto">
      {/* Header móvil */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="w-5 h-5 text-cyan-600" />
            <span>Equipo de Personas</span>
          </h2>
          <p className="text-xs text-slate-500">Colaboradores que asisten a los servicios</p>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="py-2 px-3 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar</span>
        </button>
      </div>

      <div className="p-4 space-y-3">
        {cargando ? (
          <div className="py-16 text-center text-xs text-slate-400">Cargando equipo...</div>
        ) : personas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No hay colaboradores registrados</p>
            <p className="text-xs text-slate-400">Agrega las personas que acudirán a los servicios.</p>
          </div>
        ) : (
          personas.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs"
                  style={{ backgroundColor: p.color || '#0284c7' }}
                >
                  {p.nombre.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{p.nombre}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-600">{p.cargo || 'Operario'}</span>
                    {p.telefono && (
                      <>
                        <span>•</span>
                        <a href={`tel:${p.telefono}`} className="hover:text-cyan-600">
                          📞 {p.telefono}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Activo
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para agregar colaborador */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Nueva Persona / Operario</h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Nombre completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Teléfono móvil</label>
                <input
                  type="tel"
                  placeholder="Ej. 987654321"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Permite enviarle órdenes de trabajo directo por WhatsApp.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Cargo / Rol</label>
                <select
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="Operario">Operario</option>
                  <option value="Líder">Líder de Equipo</option>
                  <option value="Técnico">Técnico Especialista</option>
                  <option value="Apoyo">Apoyo / Asistente</option>
                  <option value="Conductor">Conductor / Van</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Color distintivo</label>
                <div className="flex gap-2">
                  {COLORES_DISPONIBLES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-md shadow-cyan-600/25"
                >
                  {guardando ? 'Guardando...' : 'Guardar Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

