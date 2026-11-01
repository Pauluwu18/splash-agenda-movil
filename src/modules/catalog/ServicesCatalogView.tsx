import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit2, Check, X, 
  DollarSign, Tag, Sofa, Bed, Layers, Car, CheckCircle2 
} from 'lucide-react';
import { CategoriaCatalogo, SubcategoriaCatalogo } from '../../types';
import { 
  getCatalogoPersonalizado, 
  addServicioToCatalog, 
  deleteServicioFromCatalog,
  saveCatalogoPersonalizado
} from '../../integrations/supabase-main/services';
import { formatMontoSoles } from '../../utils/businessRules';

const CATEGORIAS_PREDEFINIDAS = [
  'Muebles y Tapices',
  'Colchones',
  'Alfombras',
  'Vehículos',
  'Otros / Personalizado'
];

export const ServicesCatalogView: React.FC = () => {
  const [catalogo, setCatalogo] = useState<CategoriaCatalogo[]>([]);
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Muebles y Tapices');
  const [nombreServicio, setNombreServicio] = useState<string>('');
  const [precioServicio, setPrecioServicio] = useState<string>('120');
  const [mensaje, setMensaje] = useState<string>('');

  const cargar = () => {
    setCatalogo(getCatalogoPersonalizado());
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreServicio.trim() || !precioServicio) return;

    addServicioToCatalog(
      categoriaSeleccionada.trim(),
      nombreServicio.trim(),
      Number(precioServicio) || 0
    );

    setNombreServicio('');
    setPrecioServicio('100');
    setMostrarModal(false);
    cargar();
    setMensaje('✅ Servicio agregado al catálogo.');
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleEliminar = (subId: string, nombre: string) => {
    if (confirm(`¿Eliminar el servicio "${nombre}" del catálogo?`)) {
      deleteServicioFromCatalog(subId);
      cargar();
      setMensaje('🗑️ Servicio eliminado.');
      setTimeout(() => setMensaje(''), 2500);
    }
  };

  const getIcono = (nombreCat: string) => {
    const n = nombreCat.toLowerCase();
    if (n.includes('mueble') || n.includes('tapiz')) return <Sofa className="w-4 h-4 text-[#00CED1]" />;
    if (n.includes('colch')) return <Bed className="w-4 h-4 text-[#60A5FA]" />;
    if (n.includes('alfombra')) return <Layers className="w-4 h-4 text-[#FB923C]" />;
    if (n.includes('veh') || n.includes('auto')) return <Car className="w-4 h-4 text-[#4ADE80]" />;
    return <Sparkles className="w-4 h-4 text-[#A855F7]" />;
  };

  const totalServicios = catalogo.reduce((acc, c) => acc + c.subcategorias.length, 0);

  return (
    <div className="pb-28 max-w-lg lg:max-w-4xl mx-auto">
      {/* Header móvil y desktop */}
      <div className="sticky top-13 z-20 bg-[#0A0E11]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#252D38] flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#F0F4F8] flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-[#00CED1]" />
            <span>Catálogo de Servicios SUMAQ</span>
          </h2>
          <p className="text-[10px] text-[#8A9BB0]">
            {totalServicios} servicios y precios configurados
          </p>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="py-2 px-3 bg-[#00CED1] hover:brightness-110 active:scale-95 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-[#00CED1]/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Agregar Servicio</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {mensaje && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensaje}</span>
          </div>
        )}

        {/* Lista de Categorías y Servicios */}
        <div className="space-y-4">
          {catalogo.map(cat => (
            <div key={cat.id} className="bg-[#181D22] rounded-2xl border border-[#252D38] overflow-hidden">
              <div className="px-4 py-3 bg-[#111418] border-b border-[#252D38] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1E2530] flex items-center justify-center">
                    {getIcono(cat.nombre)}
                  </div>
                  <h3 className="font-extrabold text-xs text-[#F0F4F8]">{cat.nombre}</h3>
                </div>
                <span className="text-[10px] font-bold text-[#8A9BB0] px-2 py-0.5 rounded-full bg-[#1E2530]">
                  {cat.subcategorias.length} servicios
                </span>
              </div>

              <div className="divide-y divide-[#252D38]">
                {cat.subcategorias.map(sub => (
                  <div key={sub.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-[#1E2530]/50 transition">
                    <span className="text-xs font-semibold text-[#F0F4F8]">{sub.nombre}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-800/60 font-mono">
                        S/ {formatMontoSoles(sub.precio_sugerido)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEliminar(sub.id, sub.nombre)}
                        className="p-1 rounded-lg text-[#8A9BB0] hover:text-rose-400 hover:bg-rose-950/40 transition"
                        title="Eliminar del catálogo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Agregar Nuevo Servicio */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#181D22] rounded-t-3xl sm:rounded-2xl border border-[#252D38] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#252D38] pb-3">
              <h3 className="text-sm font-extrabold text-[#F0F4F8] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#00CED1]" />
                <span>Nuevo Servicio y Precio</span>
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="w-7 h-7 rounded-full bg-[#1E2530] text-[#8A9BB0] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8A9BB0]">Categoría:</label>
                <select
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
                >
                  {CATEGORIAS_PREDEFINIDAS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8A9BB0]">Nombre del Servicio (Ítem):</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mueble en L Pequeño, Colchón Queen, etc."
                  value={nombreServicio}
                  onChange={(e) => setNombreServicio(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8A9BB0]">Precio en Soles (S/):</label>
                <input
                  type="number"
                  required
                  step="1"
                  min="0"
                  placeholder="140"
                  value={precioServicio}
                  onChange={(e) => setPrecioServicio(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-black bg-[#111418] border border-[#2E3847] rounded-xl text-emerald-400 focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 py-2.5 bg-[#111418] text-[#8A9BB0] font-bold text-xs rounded-xl border border-[#2E3847]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00CED1] text-slate-950 font-black text-xs rounded-xl shadow-md transition"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
