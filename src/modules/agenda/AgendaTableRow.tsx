import React, { useState } from 'react';
import { 
  GripVertical, Clock, Phone, MapPin, 
  Edit2, Trash2, Share2, Plus, Check, ChevronDown, Car 
} from 'lucide-react';
import { ServicioAgenda, Operario, Vehiculo } from '../../types';
import { 
  updateServicioOperario, 
  updateServicioMovilidad, 
  updateServicioMontoExtra 
} from '../../integrations/supabase-main/services';
import { formatMontoSoles } from '../../utils/businessRules';

interface AgendaTableRowProps {
  servicio: ServicioAgenda;
  index: number;
  operariosDisponibles: Operario[];
  vehiculosDisponibles: Vehiculo[];
  onShare: (svc: ServicioAgenda) => void;
  onEdit: (svc: ServicioAgenda) => void;
  onCancel: (id: string, cliente: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export const AgendaTableRow: React.FC<AgendaTableRowProps> = ({
  servicio,
  index,
  operariosDisponibles,
  vehiculosDisponibles,
  onShare,
  onEdit,
  onCancel,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging
}) => {
  const [modalExtra, setModalExtra] = useState(false);
  const [extraInput, setExtraInput] = useState(
    servicio.monto_extra ? String(servicio.monto_extra) : ''
  );

  const operarioActualId = servicio.operario_ids?.[0] || servicio.operario_id || '';
  const movilidadActual = servicio.van_nombre || (servicio.es_taxi ? 'TAXI 1' : 'Sin movilidad');

  const handleOperarioChange = async (newId: string) => {
    const op = operariosDisponibles.find(o => o.id === newId);
    await updateServicioOperario(servicio.id, newId, op?.nombre_completo || op?.nombres || '');
  };

  const handleMovilidadChange = async (newMov: string) => {
    await updateServicioMovilidad(servicio.id, newMov);
  };

  const handleGuardarExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(extraInput) || 0;
    await updateServicioMontoExtra(servicio.id, val);
    setModalExtra(false);
  };

  const isCancelado = servicio.estado === 'CANCELADO';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`group relative bg-[#13171C] hover:bg-[#181D23] border border-[#232B36] rounded-xl p-3 lg:px-4 lg:py-3 transition-all ${
        isDragging ? 'opacity-40 border-dashed border-[#00CED1]' : ''
      } ${isCancelado ? 'opacity-50 line-through' : ''}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Lado Izquierdo: Handle + Cliente + Dirección + Tipo */}
        <div className="flex items-start lg:items-center gap-2.5 flex-1 min-w-0">
          {/* Grip Handle para arrastrar con mouse o dedo */}
          <div 
            className="cursor-grab active:cursor-grabbing text-[#4A5A70] hover:text-[#00CED1] p-1 -ml-1.5 touch-none shrink-0"
            title="Arrastra para reordenar"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* 1. CLIENTE */}
          <div className="min-w-[190px] max-w-[240px] space-y-1 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-[#F0F4F8] text-xs uppercase tracking-tight truncate">
                {servicio.cliente_nombre}
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#1E2530] text-[#8A9BB0] border border-[#2E3847]">
                {servicio.sucursal_nombre || 'SUCURSAL LAS FLORES'}
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#00CED1]/15 text-[#00CED1] border border-[#00CED1]/30">
                {servicio.empresa_nombre || 'SUMAQ'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8A9BB0]">
              <span className="font-mono text-[#A0AEC0]">{servicio.telefono}</span>
              {servicio.hora_estimada && (
                <span className="flex items-center gap-0.5 text-[#00CED1] font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>{servicio.hora_estimada}</span>
                </span>
              )}
            </div>

            {servicio.comentarios && (
              <p className="text-[10px] text-amber-400/90 italic truncate max-w-[220px]">
                {servicio.comentarios}
              </p>
            )}
          </div>

          {/* 2. DIRECCIÓN */}
          <div className="min-w-[150px] max-w-[200px] shrink-0 hidden md:block">
            <span className="text-xs font-black text-[#F0F4F8] uppercase block truncate">
              {servicio.distrito}
            </span>
            <span className="text-[11px] text-[#8A9BB0] truncate block">
              {servicio.direccion}
            </span>
          </div>

          {/* 3. TIPO / SERVICIO */}
          <div className="min-w-[160px] max-w-[230px] shrink-0 hidden lg:block">
            <span className="text-[10px] font-black uppercase text-[#8A9BB0] block">
              {servicio.items && servicio.items[0]?.categoria_nombre ? servicio.items[0].categoria_nombre : 'MUEBLES'}
            </span>
            <span className="text-xs font-extrabold text-[#E2E8F0] block truncate">
              {servicio.servicio_detalle}
            </span>
          </div>
        </div>

        {/* Lado Derecho: Precio + Extra + Operario + Movilidad + Acciones */}
        <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1E2530]">
          {/* Vista móvil de dirección y servicio si está en pantalla pequeña */}
          <div className="block lg:hidden w-full text-xs text-[#8A9BB0] pb-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F0F4F8]">{servicio.distrito} - {servicio.direccion}</span>
            </div>
            <span className="text-[#00CED1] font-semibold block">{servicio.servicio_detalle}</span>
          </div>

          {/* PRECIO */}
          <div className="text-left lg:text-right min-w-[85px]">
            <span className="text-xs font-black text-emerald-400 block font-mono">
              S/ {formatMontoSoles(servicio.precio_final)}
            </span>
            <span className="text-[10px] text-[#8A9BB0] block font-medium">
              {servicio.metodo_pago}
            </span>
          </div>

          {/* EXTRA */}
          <div>
            <button
              type="button"
              onClick={() => setModalExtra(true)}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition ${
                servicio.monto_extra && servicio.monto_extra > 0
                  ? 'bg-amber-950/70 border-amber-700 text-amber-300'
                  : 'bg-[#181D22] hover:bg-[#232B36] border-[#2E3847] text-[#8A9BB0] hover:text-[#F0F4F8]'
              }`}
            >
              {servicio.monto_extra && servicio.monto_extra > 0 
                ? `+ S/ ${formatMontoSoles(servicio.monto_extra)}`
                : '+ Extra'}
            </button>
          </div>

          {/* OPERARIO SELECTOR (Dropdown en fila exacto a captura de referencia) */}
          <div className="relative min-w-[150px] max-w-[190px]">
            <select
              value={operarioActualId}
              onChange={(e) => handleOperarioChange(e.target.value)}
              className="w-full pl-2.5 pr-6 py-1.5 text-xs font-bold bg-[#181D22] hover:bg-[#222A36] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:border-[#00CED1] focus:outline-none appearance-none truncate cursor-pointer"
            >
              <option value="">Sin asignar</option>
              {operariosDisponibles.map(op => (
                <option key={op.id} value={op.id}>
                  {op.nombre_completo || `${op.nombres} ${op.apellidos || ''}`.trim()}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A9BB0] absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* MOVILIDAD SELECTOR (Píldora dorada TAXI 1 exacto a captura de referencia) */}
          <div className="relative">
            <select
              value={movilidadActual}
              onChange={(e) => handleMovilidadChange(e.target.value)}
              className="pl-2.5 pr-6 py-1.5 text-xs font-black uppercase rounded-xl border border-amber-600/80 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40 focus:outline-none appearance-none cursor-pointer"
            >
              <optgroup label="Taxis (1 al 5)" className="bg-[#181D22] text-[#8A9BB0]">
                <option value="TAXI 1" className="bg-[#181D22] text-[#F0F4F8]">TAXI 1</option>
                <option value="TAXI 2" className="bg-[#181D22] text-[#F0F4F8]">TAXI 2</option>
                <option value="TAXI 3" className="bg-[#181D22] text-[#F0F4F8]">TAXI 3</option>
                <option value="TAXI 4" className="bg-[#181D22] text-[#F0F4F8]">TAXI 4</option>
                <option value="TAXI 5" className="bg-[#181D22] text-[#F0F4F8]">TAXI 5</option>
              </optgroup>
              <optgroup label="Vans de la flota" className="bg-[#181D22] text-[#8A9BB0]">
                {vehiculosDisponibles.map(v => (
                  <option key={v.id} value={v.nombre} className="bg-[#181D22] text-[#F0F4F8]">
                    {v.nombre}
                  </option>
                ))}
              </optgroup>
              <option value="Sin movilidad" className="bg-[#181D22] text-[#8A9BB0]">Sin movilidad</option>
            </select>
            <ChevronDown className="w-3 h-3 text-amber-400 absolute right-1.5 top-2.5 pointer-events-none" />
          </div>

          {/* ACCIONES (Editar, Compartir, Cancelar) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(servicio)}
              className="p-1.5 rounded-lg bg-[#181D22] hover:bg-[#252D38] text-[#8A9BB0] hover:text-[#00CED1] border border-[#252D38] transition"
              title="Editar servicio"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onShare(servicio)}
              className="p-1.5 rounded-lg bg-[#181D22] hover:bg-emerald-950/80 text-[#8A9BB0] hover:text-emerald-400 border border-[#252D38] transition"
              title="Compartir por WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onCancel(servicio.id, servicio.cliente_nombre)}
              className="p-1.5 rounded-lg bg-[#181D22] hover:bg-rose-950/80 text-[#8A9BB0] hover:text-rose-400 border border-[#252D38] transition"
              title="Cancelar / Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mini-Modal para editar Extra */}
      {modalExtra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
          <form 
            onSubmit={handleGuardarExtra}
            className="w-full max-w-xs bg-[#181D22] border border-[#2E3847] rounded-2xl p-4 space-y-3 shadow-2xl"
          >
            <h4 className="text-xs font-black text-[#F0F4F8]">Monto Extra (S/) — {servicio.cliente_nombre}</h4>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="Ej. 20"
              value={extraInput}
              onChange={(e) => setExtraInput(e.target.value)}
              className="w-full px-3 py-2 text-xs font-black bg-[#111418] border border-[#2E3847] rounded-xl text-amber-400 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalExtra(false)}
                className="flex-1 py-1.5 bg-[#111418] text-[#8A9BB0] text-xs font-bold rounded-lg border border-[#252D38]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg"
              >
                Guardar Extra
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

