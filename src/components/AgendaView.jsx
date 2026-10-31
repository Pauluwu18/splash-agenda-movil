import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, 
  MapPin, Phone, MessageSquare, Users, CheckCircle2, 
  AlertCircle, Share2, Trash2, Plus, Sparkles, Navigation 
} from 'lucide-react';
import { 
  getServiciosPorFecha, 
  updateServicioEstado, 
  deleteServicio 
} from '../lib/supabase';

export default function AgendaView({ onNewAgenda, onShareServicio }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroHorario, setFiltroHorario] = useState('TODOS'); // 'TODOS', 'Mañana', 'Tarde', 'Extras'

  const cargarServicios = async (targetFecha = fecha) => {
    setCargando(true);
    const data = await getServiciosPorFecha(targetFecha);
    setServicios(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarServicios(fecha);
  }, [fecha]);

  // Navegar días
  const cambiarDia = (offset) => {
    const cur = new Date(fecha + 'T12:00:00');
    cur.setDate(cur.getDate() + offset);
    const nextStr = cur.toISOString().split('T')[0];
    setFecha(nextStr);
  };

  // Formato bonito de fecha
  const fechaBonita = new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const isToday = fecha === new Date().toISOString().split('T')[0];

  // Filtrado
  const serviciosFiltrados = servicios.filter(s => {
    if (filtroHorario === 'TODOS') return true;
    return s.horario === filtroHorario;
  });

  // Métricas
  const totalMonto = serviciosFiltrados
    .filter(s => s.estado !== 'CANCELADO')
    .reduce((acc, s) => acc + (Number(s.precio_final) || 0), 0);

  const cambiarEstado = async (id, nuevoEstado) => {
    await updateServicioEstado(id, nuevoEstado);
    setServicios(prev => prev.map(s => s.id === id ? { ...s, estado: nuevoEstado } : s));
  };

  const handleEliminar = async (id, nombre) => {
    if (confirm(`¿Eliminar la cita de ${nombre}?`)) {
      await deleteServicio(id);
      setServicios(prev => prev.filter(s => s.id !== id));
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'COMPLETADO':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EN_CAMINO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELADO':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="pb-28 max-w-lg mx-auto">
      {/* Header móvil con selector de día */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => cambiarDia(-1)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition"
              title="Día anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <Calendar className="w-4 h-4 text-cyan-700" />
              <span className="font-bold text-sm text-slate-900 capitalize">
                {isToday ? `Hoy (${fechaBonita})` : fechaBonita}
              </span>
            </div>

            <button
              onClick={() => cambiarDia(1)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition"
              title="Día siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de fecha nativo */}
          <div className="relative">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="text-xs py-1.5 px-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none"
            />
          </div>
        </div>

        {/* Resumen rápido y filtros */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {['TODOS', 'Mañana', 'Tarde', 'Extras'].map(f => (
              <button
                key={f}
                onClick={() => setFiltroHorario(f)}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  filtroHorario === f
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="text-right shrink-0 ml-2">
            <span className="text-[11px] text-slate-400 block leading-tight">Total citas</span>
            <span className="text-xs font-bold text-slate-800">
              {serviciosFiltrados.length} • S/ {totalMonto.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      <div className="p-4 space-y-3.5">
        {cargando ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Cargando agenda del día...</p>
          </div>
        ) : serviciosFiltrados.length === 0 ? (
          <div className="py-16 px-4 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base">Sin citas para este turno</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                No hay servicios agendados el {fechaBonita}. ¡Crea uno nuevo rápidamente!
              </p>
            </div>
            <button
              onClick={onNewAgenda}
              className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-cyan-600/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Primer Servicio</span>
            </button>
          </div>
        ) : (
          serviciosFiltrados.map((item) => {
            const telLimpio = item.telefono.replace(/\D/g, '');
            const telFull = telLimpio.length === 9 ? `51${telLimpio}` : telLimpio;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.direccion + ', ' + item.distrito)}`;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
              >
                {/* Fila superior: Turno, Hora y Estado */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{item.hora_estimada || item.horario}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{item.horario}</span>
                    {item.es_taxi && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        TAXI
                      </span>
                    )}
                  </div>

                  {/* Selector rápido de estado */}
                  <select
                    value={item.estado || 'PENDIENTE'}
                    onChange={(e) => cambiarEstado(item.id, e.target.value)}
                    className={`text-[11px] font-bold px-2 py-0.8 rounded-lg border focus:outline-none cursor-pointer ${getEstadoBadge(item.estado)}`}
                  >
                    <option value="PENDIENTE">⏳ Pendiente</option>
                    <option value="EN_CAMINO">🚗 En camino</option>
                    <option value="COMPLETADO">✅ Realizado</option>
                    <option value="CANCELADO">❌ Cancelado</option>
                  </select>
                </div>

                {/* Cliente y acciones rápidas de contacto */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {item.cliente_nombre}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                      <span>📞 {item.telefono}</span>
                    </div>
                  </div>

                  {/* Botones de llamada y WhatsApp directo */}
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`tel:${telLimpio}`}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                      title="Llamar"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/${telFull}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 transition"
                      title="Abrir WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Dirección y mapa */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-start justify-between gap-2">
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>{item.distrito}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 pl-4.5 leading-snug">{item.direccion}</p>
                    {item.referencia && (
                      <p className="text-[11px] text-slate-400 pl-4.5 mt-0.5 italic">Ref: {item.referencia}</p>
                    )}
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-cyan-700 hover:bg-cyan-50 shrink-0 shadow-2xs"
                    title="Ver en Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* =========================================================
                    PERSONAS ASIGNADAS AL SERVICIO (REQUISITO FUNDAMENTAL)
                   ========================================================= */}
                <div className="pt-0.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <Users className="w-3 h-3 text-cyan-600" />
                    <span>Personal asignado:</span>
                  </div>

                  {item.operarios && item.operarios.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.operarios.map((op, i) => (
                        <div
                          key={op.id || i}
                          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold bg-cyan-50/80 text-cyan-900 border border-cyan-200/80 shadow-2xs"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                            style={{ backgroundColor: op.color || '#0284c7' }}
                          >
                            {op.nombre ? op.nombre.charAt(0) : 'P'}
                          </div>
                          <span>{op.nombre}</span>
                          <span className="text-[10px] text-cyan-600 font-normal">
                            ({op.cargo || 'Técnico'})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-block text-xs italic text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      ⚠️ Sin personal asignado aún
                    </span>
                  )}
                </div>

                {/* Servicio y Precio final */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800 line-clamp-1">{item.servicio_detalle}</p>
                    <span className="text-[11px] text-slate-500">Pago: {item.metodo_pago}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 block leading-tight">
                      S/ {Number(item.precio_final).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botón rápido para compartir esta cita */}
                <div className="pt-1 flex items-center justify-end gap-2 border-t border-slate-50">
                  <button
                    onClick={() => onShareServicio(item)}
                    className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-emerald-200/80 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </button>

                  <button
                    onClick={() => handleEliminar(item.id, item.cliente_nombre)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Eliminar servicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) para agendar rápido */}
      <div className="fixed bottom-20 right-4 z-20">
        <button
          onClick={onNewAgenda}
          className="h-14 px-5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 active:scale-95 text-white font-bold rounded-full shadow-lg shadow-cyan-600/35 flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Agendar Cita</span>
        </button>
      </div>
    </div>
  );
}

