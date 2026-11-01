import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Phone, Briefcase, Shield, 
  DollarSign, Check, X, AlertCircle, Sparkles, Building 
} from 'lucide-react';
import { Operario } from '../../types';
import { fetchOperarios, saveOperarioToSupabase } from '../../integrations/supabase-operators/operators';
import { isOperatorsSupabaseConfigured } from '../../integrations/supabase-operators/client';
import { formatMontoSoles } from '../../utils/businessRules';

const COLORES = [
  '#0284c7', '#0d9488', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#ef4444', '#10b981', '#00CED1'
];

export const PeopleView: React.FC = () => {
  const [personas, setPersonas] = useState<Operario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [editando, setEditando] = useState<Operario | null>(null);

  // Campos del formulario
  const [nombres, setNombres] = useState<string>('');
  const [apellidos, setApellidos] = useState<string>('');
  const [dni, setDni] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [rol, setRol] = useState<string>('Operario');
  const [sucursal, setSucursal] = useState<string>('Las Flores');
  const [sueldo, setSueldo] = useState<string>('25');
  const [enCapacitacion, setEnCapacitacion] = useState<boolean>(false);
  const [color, setColor] = useState<string>('#0284c7');
  const [guardando, setGuardando] = useState<boolean>(false);

  const isOpsSupa = isOperatorsSupabaseConfigured();

  const cargar = async () => {
    setCargando(true);
    const data = await fetchOperarios();
    setPersonas(data);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setNombres('');
    setApellidos('');
    setDni('');
    setTelefono('');
    setRol('Operario');
    setSucursal('Las Flores');
    setSueldo('25');
    setEnCapacitacion(false);
    setColor('#0284c7');
    setMostrarModal(true);
  };

  const abrirEditar = (op: Operario) => {
    setEditando(op);
    setNombres(op.nombres);
    setApellidos(op.apellidos || '');
    setDni(op.dni || '');
    setTelefono(op.telefono || '');
    setRol(op.rol || 'Operario');
    setSucursal(op.sucursal || 'Las Flores');
    setSueldo(String(op.sueldo_por_servicio || 25));
    setEnCapacitacion(Boolean(op.en_capacitacion));
    setColor(op.color || '#0284c7');
    setMostrarModal(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres.trim()) return;

    setGuardando(true);
    try {
      await saveOperarioToSupabase({
        id: editando ? editando.id : undefined,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        dni: dni.trim(),
        telefono: telefono.trim(),
        rol,
        sucursal,
        sueldo_por_servicio: Number(sueldo) || 0,
        en_capacitacion: enCapacitacion,
        color,
        estado: editando ? editando.estado : 'ACTIVO'
      });

      setMostrarModal(false);
      cargar();
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pb-28 max-w-lg mx-auto">
      {/* Header móvil */}
      <div className="sticky top-13 z-20 bg-[#0A0E11]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#252D38] flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#F0F4F8] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#00CED1]" />
            <span>Colaboradores / Personal</span>
          </h2>
          <p className="text-[10px] text-[#8A9BB0]">Segundo Supabase (Operarios)</p>
        </div>

        <button
          onClick={abrirNuevo}
          className="py-2 px-3 bg-[#00CED1] hover:brightness-110 active:scale-95 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-[#00CED1]/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo</span>
        </button>
      </div>

      <div className="p-4 space-y-3.5">
        {/* Banner de estado del 2do Supabase */}
        {!isOpsSupa && (
          <div className="p-3 bg-[#181D22] border border-[#2E3847] rounded-2xl flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold text-[#F0F4F8] block">Directorio de Operarios (Local)</span>
              <span className="text-[11px] text-[#8A9BB0]">
                Puedes conectar las credenciales del segundo Supabase en la pestaña <strong>Más</strong> cuando las tengas.
              </span>
            </div>
          </div>
        )}

        {cargando ? (
          <div className="py-20 text-center text-xs text-[#8A9BB0]">Cargando personal...</div>
        ) : personas.length === 0 ? (
          <div className="text-center py-16 bg-[#181D22] rounded-3xl border border-[#252D38] p-6 space-y-3">
            <Users className="w-12 h-12 text-[#4A5A70] mx-auto" />
            <p className="text-sm font-bold text-[#F0F4F8]">No hay colaboradores registrados</p>
            <p className="text-xs text-[#8A9BB0]">Agrega a las personas que atenderán las órdenes.</p>
          </div>
        ) : (
          personas.map(p => (
            <div
              key={p.id}
              onClick={() => abrirEditar(p)}
              className="bg-[#181D22] hover:bg-[#1E2530] rounded-2xl p-3.5 border border-[#252D38] hover:border-[#3D4E63] shadow-sm flex items-center justify-between gap-3 cursor-pointer transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-950 font-black text-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: p.color || '#00CED1' }}
                >
                  {p.nombres.charAt(0)}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-extrabold text-[#F0F4F8] text-sm truncate">
                      {p.nombres} {p.apellidos}
                    </h4>
                    {p.en_capacitacion && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        CAPACITACIÓN
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#8A9BB0] flex-wrap">
                    <span className="font-bold text-[#00CED1]">{p.rol || 'Operario'}</span>
                    <span>•</span>
                    <span>{p.sucursal || 'Las Flores'}</span>
                    {p.dni && (
                      <>
                        <span>•</span>
                        <span className="text-[11px] text-[#4A5A70]">DNI: {p.dni}</span>
                      </>
                    )}
                  </div>

                  {p.telefono && (
                    <p className="text-[11px] text-[#8A9BB0]">📞 {p.telefono}</p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-[#8A9BB0] block">Sueldo / svc</span>
                <span className="text-xs font-black text-emerald-400">
                  S/ {formatMontoSoles(p.sueldo_por_servicio || 0)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para Crear / Editar Colaborador */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#181D22] rounded-t-3xl sm:rounded-2xl border border-[#252D38] p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#252D38] pb-3">
              <h3 className="font-extrabold text-[#F0F4F8] text-sm">
                {editando ? 'Editar Colaborador' : 'Nuevo Colaborador'}
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="w-8 h-8 rounded-full bg-[#111418] flex items-center justify-center text-[#8A9BB0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8A9BB0] mb-1 block">Nombres *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#8A9BB0] mb-1 block">Apellidos</label>
                  <input
                    type="text"
                    placeholder="Ej. Pérez Quispe"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8A9BB0] mb-1 block">DNI (8 dígitos)</label>
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="71234567"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#8A9BB0] mb-1 block">Teléfono móvil</label>
                  <input
                    type="tel"
                    placeholder="987654321"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8A9BB0] mb-1 block">Rol / Cargo</label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
                  >
                    <option value="Operario">Operario</option>
                    <option value="Líder">Líder</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Apoyo">Apoyo</option>
                    <option value="Conductor">Conductor</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#8A9BB0] mb-1 block">Sucursal</label>
                  <select
                    value={sucursal}
                    onChange={(e) => setSucursal(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
                  >
                    <option value="Las Flores">Las Flores</option>
                    <option value="Surco">Surco</option>
                    <option value="Miraflores">Miraflores</option>
                    <option value="San Isidro">San Isidro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8A9BB0] mb-1 block">Sueldo por Servicio (S/)</label>
                <input
                  type="number"
                  step="1"
                  value={sueldo}
                  onChange={(e) => setSueldo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-black bg-[#111418] border border-[#2E3847] rounded-xl text-emerald-400 focus:outline-none"
                />
              </div>

              {/* En Capacitación */}
              <div className="bg-[#111418] p-3 rounded-xl border border-[#252D38]">
                <label className="flex items-center justify-between text-xs text-[#F0F4F8] font-bold cursor-pointer">
                  <span>¿Está en capacitación?</span>
                  <input
                    type="checkbox"
                    checked={enCapacitacion}
                    onChange={(e) => setEnCapacitacion(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-[#1E2530]"
                  />
                </label>
              </div>

              {/* Color distintivo */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8A9BB0] block">Color de identificación</label>
                <div className="flex gap-2">
                  {COLORES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-[#00CED1] scale-110' : 'opacity-70'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 py-2.5 bg-[#111418] text-[#8A9BB0] font-bold text-xs rounded-xl border border-[#252D38]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-2.5 bg-[#00CED1] hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-[#00CED1]/25"
                >
                  {guardando ? 'Guardando...' : (editando ? 'Guardar Cambios' : 'Registrar Colaborador')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

