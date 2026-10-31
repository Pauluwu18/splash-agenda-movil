import React, { useState } from 'react';
import { 
  Clock, MapPin, Phone, MessageSquare, Users, 
  Truck, Navigation, Share2, Edit3, Trash2, 
  AlertTriangle, CheckCircle2, ChevronDown, DollarSign 
} from 'lucide-react';
import { ServicioAgenda, EstadoServicio, Operario, Vehiculo } from '../../types';
import { updateServicio } from '../../integrations/supabase-main/services';
import { formatMontoSoles } from '../../utils/businessRules';

interface AgendaCardProps {
  servicio: ServicioAgenda;
  operariosDisponibles: Operario[];
  vehiculosDisponibles: Vehiculo[];
  onShare: (svc: ServicioAgenda) => void;
  onEdit: (svc: ServicioAgenda) => void;
  onCancel: (id: string, cliente: string) => void;
  onUpdateSuccess: () => void;
}

export const AgendaCard: React.FC<AgendaCardProps> = ({
  servicio,
  operariosDisponibles,
  vehiculosDisponibles,
  onShare,
  onEdit,
  onCancel,
  onUpdateSuccess
}) => {
  const [montoExtra, setMontoExtra] = useState<string>(
    servicio.monto_extra ? String(servicio.monto_extra) : ''
  );
  const [showAssignOperario, setShowAssignOperario] = useState(false);
  const [showAssignVan, setShowAssignVan] = useState(false);

  const telLimpio = servicio.telefono.replace(/\D/g, '');
  const telFull = telLimpio.length === 9 ? `51${telLimpio}` : telLimpio;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${servicio.direccion}, ${servicio.distrito}`
  )}`;

  const handleEstadoChange = async (nuevoEstado: EstadoServicio) => {
    await updateServicio(servicio.id, { estado: nuevoEstado });
    onUpdateSuccess();
  };

  const handleGuardarMontoExtra = async () => {
    const val = montoExtra.trim() === '' ? 0 : Math.max(0, Number(montoExtra));
    if (val !== servicio.monto_extra) {
      await updateServicio(servicio.id, { monto_extra: val });
      onUpdateSuccess();
    }
  };

  const handleToggleTaxi = async () => {
    const nuevoTaxi = !servicio.es_taxi;
    await updateServicio(servicio.id, { 
      es_taxi: nuevoTaxi,
      van_nombre: nuevoTaxi ? '' : servicio.van_nombre 
    });
    onUpdateSuccess();
  };

  const handleAsignarOperario = async (opId: string) => {
    const currentIds = servicio.operario_ids || (servicio.operario_id ? [servicio.operario_id] : []);
    const newIds = currentIds.includes(opId)
      ? currentIds.filter(id => id !== opId)
      : [...currentIds, opId];

    await updateServicio(servicio.id, {
      operario_ids: newIds,
      operario_id: newIds[0] || null
    });
    setShowAssignOperario(false);
    onUpdateSuccess();
  };

  const handleAsignarVan = async (van: Vehiculo | null) => {
    await updateServicio(servicio.id, {
      vehiculo_id: van?.id || null,
      van_nombre: van?.nombre || '',
      es_taxi: false
    });
    setShowAssignVan(false);
    onUpdateSuccess();
  };

  const getEstadoClasses = (estado: EstadoServicio) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80';
      case 'EN_CAMINO':
        return 'bg-blue-950/70 text-blue-400 border-blue-800/80';
      case 'CANCELADO':
        return 'bg-rose-950/70 text-rose-400 border-rose-800/80';
      default:
        return 'bg-amber-950/70 text-amber-400 border-amber-800/80';
    }
  };

  const isCancelled = servicio.estado === 'CANCELADO';

  return (
    <div className={`bg-[#181D22] rounded-2xl border transition-all space-y-3.5 p-4 shadow-md ${
      isCancelled 
        ? 'opacity-60 border-rose-950/60' 
        : servicio.es_taxi 
          ? 'border-amber-500/40 bg-gradient-to-b from-[#1E2530] to-[#181D22]' 
          : 'border-[#252D38] hover:border-[#3D4E63]'
    }`}>
      {/* 1. Header Fila Superior: Hora, Turno, Badges y Estado */}
      <div className="flex items-center justify-between gap-2 border-b border-[#252D38] pb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#0A0E11] text-[#F0F4F8] border border-[#2E3847] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00CED1]" />
            <span>{servicio.hora_estimada || servicio.horario}</span>
          </span>

          <span className="text-xs text-[#8A9BB0] font-medium">{servicio.horario}</span>

          {servicio.es_rectificacion && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              RECTIFICACIÓN
            </span>
          )}

          {servicio.es_taxi && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
              TAXI
            </span>
          )}
        </div>

        {/* Selector de Estado */}
        <div className="relative">
          <select
            value={servicio.estado || 'PENDIENTE'}
            onChange={(e) => handleEstadoChange(e.target.value as EstadoServicio)}
            className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none appearance-none pr-6 cursor-pointer ${getEstadoClasses(
              servicio.estado
            )}`}
          >
            <option value="PENDIENTE">⏳ Pendiente</option>
            <option value="EN_CAMINO">🚗 En camino</option>
            <option value="COMPLETADO">✅ Realizado</option>
            <option value="CANCELADO">❌ Cancelado</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 pointer-events-none text-current opacity-70" />
        </div>
      </div>

      {/* 2. Cliente y Acciones Rápidas */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-[#F0F4F8] text-base leading-snug">
              {servicio.cliente_nombre}
            </h3>
            {servicio.empresa_nombre && (
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                style={{
                  color: servicio.empresa_color || '#00CED1',
                  backgroundColor: `${servicio.empresa_color || '#00CED1'}15`,
                  borderColor: `${servicio.empresa_color || '#00CED1'}40`
                }}
              >
                {servicio.empresa_nombre}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-[#8A9BB0]">📞 {servicio.telefono}</p>
        </div>

        {/* Botones de contacto directo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`tel:${telLimpio}`}
            className="w-9 h-9 rounded-xl bg-[#252D38] hover:bg-[#2E3847] active:scale-90 flex items-center justify-center text-[#F0F4F8] transition"
            title="Llamar"
          >
            <Phone className="w-4 h-4 text-[#00CED1]" />
          </a>
          <a
            href={`https://wa.me/${telFull}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 active:scale-90 flex items-center justify-center text-emerald-400 border border-emerald-800/80 transition"
            title="WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 3. Ubicación y Maps */}
      <div className="bg-[#111418] rounded-xl p-3 border border-[#252D38] flex items-start justify-between gap-2">
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-[#F0F4F8] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00CED1] shrink-0" />
            <span>{servicio.distrito}</span>
          </div>
          <p className="text-[#8A9BB0] pl-5 leading-relaxed">{servicio.direccion}</p>
          {servicio.referencia && (
            <p className="text-[11px] text-[#4A5A70] pl-5 italic">Ref: {servicio.referencia}</p>
          )}
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-[#1E2530] hover:bg-[#252D38] border border-[#2E3847] text-[#00CED1] shrink-0 transition"
          title="Abrir en Google Maps"
        >
          <Navigation className="w-4 h-4" />
        </a>
      </div>

      {/* 4. Asignación de Personas (2do Supabase) y Movilidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
        {/* Personal asignado */}
        <div className="bg-[#111418] p-2.5 rounded-xl border border-[#252D38] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8A9BB0]">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#00CED1]" />
              <span>Personal ({servicio.operarios?.length || 0})</span>
            </span>
            <button
              onClick={() => setShowAssignOperario(!showAssignOperario)}
              className="text-[10px] text-[#00CED1] hover:underline"
            >
              {showAssignOperario ? 'Cerrar' : 'Cambiar'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {servicio.operarios && servicio.operarios.length > 0 ? (
              servicio.operarios.map(op => (
                <span
                  key={op.id}
                  className="inline-flex items-center gap-1 py-0.5 px-2 rounded-lg text-[11px] font-semibold bg-[#1E2530] text-[#F0F4F8] border border-[#2E3847]"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: op.color || '#0284c7' }}
                  />
                  <span>{op.nombres || op.nombre_completo}</span>
                  {op.en_capacitacion && (
                    <span className="text-[9px] text-[#F59E0B]">(Capacitación)</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#F59E0B] italic">⚠️ Sin operario asignado</span>
            )}
          </div>

          {/* Selector desplegable de operarios */}
          {showAssignOperario && (
            <div className="mt-2 pt-2 border-t border-[#252D38] space-y-1 max-h-40 overflow-y-auto">
              <p className="text-[10px] text-[#8A9BB0] font-semibold">Toca para asignar / quitar:</p>
              {operariosDisponibles.map(op => {
                const assigned = (servicio.operario_ids || []).includes(op.id);
                return (
                  <button
                    key={op.id}
                    onClick={() => handleAsignarOperario(op.id)}
                    className={`w-full text-left py-1 px-2 rounded-lg text-xs flex items-center justify-between transition ${
                      assigned 
                        ? 'bg-[#00CED1]/20 text-[#00CED1] font-bold border border-[#00CED1]/40' 
                        : 'hover:bg-[#1E2530] text-[#8A9BB0]'
                    }`}
                  >
                    <span>{op.nombres || op.nombre_completo}</span>
                    <span className="text-[10px]">{op.rol || 'Operario'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Movilidad (Van / Taxi) */}
        <div className="bg-[#111418] p-2.5 rounded-xl border border-[#252D38] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8A9BB0]">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#00CED1]" />
              <span>Movilidad</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleTaxi}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  servicio.es_taxi 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'bg-[#1E2530] text-[#8A9BB0] hover:text-[#F0F4F8]'
                }`}
              >
                {servicio.es_taxi ? 'Quitar Taxi' : '+ Taxi'}
              </button>
              <button
                onClick={() => setShowAssignVan(!showAssignVan)}
                className="text-[10px] text-[#00CED1] hover:underline"
              >
                {showAssignVan ? 'Cerrar' : 'Van'}
              </button>
            </div>
          </div>

          <p className="text-xs font-semibold text-[#F0F4F8]">
            {servicio.es_taxi 
              ? '🚕 Asignado a TAXI' 
              : (servicio.van_nombre || 'Sin vehículo asignado')}
          </p>

          {/* Selector de Van */}
          {showAssignVan && (
            <div className="mt-2 pt-2 border-t border-[#252D38] space-y-1">
              <button
                onClick={() => handleAsignarVan(null)}
                className="w-full text-left py-1 px-2 rounded-lg text-xs text-rose-400 hover:bg-[#1E2530]"
              >
                Quitar Van
              </button>
              {vehiculosDisponibles.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleAsignarVan(v)}
                  className={`w-full text-left py-1 px-2 rounded-lg text-xs flex items-center justify-between ${
                    servicio.van_nombre === v.nombre
                      ? 'bg-[#00CED1]/20 text-[#00CED1] font-bold'
                      : 'hover:bg-[#1E2530] text-[#8A9BB0]'
                  }`}
                >
                  <span>{v.nombre}</span>
                  <span className="text-[10px] text-[#4A5A70]">{v.placa}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Servicio, Precios y Monto Extra Inline */}
      <div className="border-t border-[#252D38] pt-2.5 flex items-center justify-between gap-2">
        <div className="space-y-0.5 flex-1 pr-2">
          <p className="text-xs font-bold text-[#F0F4F8] line-clamp-1">
            {servicio.servicio_detalle}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#8A9BB0]">
            <span>Pago: <strong className="text-[#F0F4F8]">{servicio.metodo_pago}</strong></span>
            {servicio.descuento && servicio.descuento > 0 ? (
              <span className="text-emerald-400">Desc: S/ {formatMontoSoles(servicio.descuento)}</span>
            ) : null}
          </div>
        </div>

        {/* Monto Extra inline */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-[#8A9BB0] block">Extra (S/)</span>
            <input
              type="number"
              placeholder="0"
              value={montoExtra}
              onChange={(e) => setMontoExtra(e.target.value)}
              onBlur={handleGuardarMontoExtra}
              className="w-16 py-1 px-1.5 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-lg text-center text-[#F0F4F8] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
            />
          </div>

          {/* Precio Total */}
          <div className="text-right pl-2 border-l border-[#252D38]">
            <span className="text-[10px] text-[#8A9BB0] block">Total</span>
            <span className="text-base font-black text-[#00CED1] block leading-tight">
              S/ {formatMontoSoles((Number(servicio.precio_final) || 0) + (Number(servicio.monto_extra) || 0))}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Barra de Acciones Inferior */}
      <div className="border-t border-[#252D38] pt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onShare(servicio)}
            className="py-1.5 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 active:scale-95 text-emerald-400 border border-emerald-800/80 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>

          <button
            onClick={() => onEdit(servicio)}
            className="py-1.5 px-3 rounded-xl bg-[#1E2530] hover:bg-[#252D38] active:scale-95 text-[#F0F4F8] border border-[#2E3847] text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#00CED1]" />
            <span>Editar</span>
          </button>
        </div>

        <button
          onClick={() => onCancel(servicio.id, servicio.cliente_nombre)}
          className="p-1.5 rounded-xl text-[#4A5A70] hover:text-rose-400 hover:bg-rose-950/30 transition"
          title="Cancelar cita"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
