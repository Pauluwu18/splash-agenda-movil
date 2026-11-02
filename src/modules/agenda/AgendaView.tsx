import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Search, 
  Download, Filter, Sparkles, AlertCircle, RefreshCw, Plus, 
  Sun, Sunset, Clock 
} from 'lucide-react';
import { ServicioAgenda, Operario, Vehiculo, TurnoHorario } from '../../types';
import { 
  fetchServiciosPorFecha, 
  deleteServicioRecord, 
  subscribeToServiciosRealtime,
  reorderServicios,
  getVansPersonalizadas,
  VANS_DEFAULT 
} from '../../integrations/supabase-main/services';
import { fetchOperarios } from '../../integrations/supabase-operators/operators';
import { exportarAgendaExcel } from './ExcelExport';
import { AgendaTableRow } from './AgendaTableRow';
import { getTodayKey, formatMontoSoles } from '../../utils/businessRules';

interface AgendaViewProps {
  onNewService: () => void;
  onShareService: (svc: ServicioAgenda) => void;
  onEditService: (svc: ServicioAgenda) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  onNewService,
  onShareService,
  onEditService
}) => {
  const [fecha, setFecha] = useState<string>(getTodayKey());
  const [servicios, setServicios] = useState<ServicioAgenda[]>([]);
  const [operarios, setOperarios] = useState<Operario[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(() => getVansPersonalizadas());
  const [cargando, setCargando] = useState<boolean>(true);
  
  // Turno seleccionado: Mañana, Tarde o Extras
  const [filtroTurno, setFiltroTurno] = useState<TurnoHorario>('Mañana');
  const [busqueda, setBusqueda] = useState<string>('');

  // Estado para Drag and Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const cargarDatos = async (fechaActual = fecha, silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const [svcData, opsData] = await Promise.all([
        fetchServiciosPorFecha(fechaActual),
        fetchOperarios()
      ]);
      setServicios(svcData);
      setOperarios(opsData);
      setVehiculos(getVansPersonalizadas());
    } catch (e) {
      console.error('Error cargando agenda:', e);
    } finally {
      if (!silencioso) setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos(fecha, false);

    const unsubscribe = subscribeToServiciosRealtime(() => {
      cargarDatos(fecha, true);
    });

    return () => {
      unsubscribe();
    };
  }, [fecha]);

  const cambiarDia = (offset: number) => {
    const cur = new Date(fecha + 'T12:00:00');
    cur.setDate(cur.getDate() + offset);
    setFecha(cur.toISOString().split('T')[0]);
  };

  const handleCancelarServicio = async (id: string, cliente: string) => {
    if (confirm(`¿Confirmas la cancelación del servicio de ${cliente}?`)) {
      await deleteServicioRecord(id);
      cargarDatos(fecha, true);
    }
  };

  // Conteo por turnos para las pestañas superiores
  const countManana = servicios.filter(s => s.horario === 'Mañana' && s.estado !== 'CANCELADO').length;
  const countTarde = servicios.filter(s => s.horario === 'Tarde' && s.estado !== 'CANCELADO').length;
  const countExtras = servicios.filter(s => s.horario === 'Extras' && s.estado !== 'CANCELADO').length;

  // Filtrado por turno actual y búsqueda
  const serviciosDelTurno = servicios
    .filter(s => s.horario === filtroTurno)
    .sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0));

  const serviciosFiltrados = serviciosDelTurno.filter(s => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      s.cliente_nombre.toLowerCase().includes(q) ||
      s.telefono.includes(q) ||
      s.direccion.toLowerCase().includes(q) ||
      s.distrito.toLowerCase().includes(q) ||
      s.servicio_detalle.toLowerCase().includes(q)
    );
  });

  // Reordenar servicios (soporta tanto PC como Pantallas Táctiles / Android)
  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const list = [...serviciosFiltrados];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    // Asignar nuevo orden numérico
    list.forEach((item, idx) => {
      item.orden = idx;
    });

    // Actualizar estado local inmediatamente
    const otrosServicios = servicios.filter(s => s.horario !== filtroTurno);
    setServicios([...otrosServicios, ...list]);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Persistir orden en Supabase y notificar en tiempo real
    await reorderServicios(list);
  };

  // Drag & Drop para PC / Mouse
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndex;
    if (sourceIndex !== null && sourceIndex !== dropIndex) {
      await handleReorder(sourceIndex, dropIndex);
    } else {
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Drag & Drop Táctil para Móviles (Android / iOS)
  const handleTouchDragStart = (index: number) => {
    setDraggedIndex(index);
    setDragOverIndex(index);
  };

  const handleTouchDragOver = (targetIndex: number) => {
    if (dragOverIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
    }
  };

  const handleTouchDragEnd = async () => {
    const sourceIndex = draggedIndex;
    const targetIndex = dragOverIndex;
    if (sourceIndex !== null && targetIndex !== null && sourceIndex !== targetIndex) {
      await handleReorder(sourceIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const totalRecaudadoTurno = serviciosFiltrados
    .filter(s => s.estado !== 'CANCELADO')
    .reduce((acc, s) => acc + (Number(s.precio_final) || 0) + (Number(s.monto_extra) || 0), 0);

  const fechaBonita = new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const isToday = fecha === getTodayKey();

  return (
    <div className="pb-28 w-full max-w-full lg:max-w-6xl xl:max-w-7xl mx-auto">
      {/* 1. Barra de Controles y Fecha Superior */}
      <div className="sticky top-13 z-20 bg-[#0A0E11]/95 backdrop-blur-md px-4 py-3 border-b border-[#252D38] shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Navegación entre Fechas */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => cambiarDia(-1)}
              className="w-9 h-9 rounded-xl bg-[#181D22] hover:bg-[#252D38] border border-[#2E3847] active:scale-95 flex items-center justify-center text-[#F0F4F8] transition cursor-pointer"
              title="Día anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setFecha(getTodayKey())}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                isToday 
                  ? 'bg-[#00CED1]/15 text-[#00CED1] border-[#00CED1]/40 shadow-xs' 
                  : 'bg-[#181D22] text-[#8A9BB0] border-[#2E3847] hover:text-[#F0F4F8]'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#00CED1]" />
              <span className="capitalize">{isToday ? `Hoy (${fechaBonita})` : fechaBonita}</span>
            </button>

            <button
              onClick={() => cambiarDia(1)}
              className="w-9 h-9 rounded-xl bg-[#181D22] hover:bg-[#252D38] border border-[#2E3847] active:scale-95 flex items-center justify-center text-[#F0F4F8] transition cursor-pointer"
              title="Día siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-9 h-9 py-1 px-1.5 bg-[#181D22] border border-[#2E3847] rounded-xl text-center text-xs font-bold text-[#F0F4F8] focus:outline-none cursor-pointer"
              title="Seleccionar fecha calendario"
            />
          </div>

          {/* Buscador Rápido */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-[#8A9BB0] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar cliente, teléfono, distrito o mueble..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#181D22] border border-[#2E3847] rounded-xl text-[#F0F4F8] placeholder-[#4A5A70] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
            />
          </div>

          {/* Botones de Acción (Crear y Exportar Excel) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportarAgendaExcel(servicios, fecha)}
              disabled={servicios.length === 0}
              className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 disabled:opacity-40 flex items-center gap-1.5 text-emerald-400 text-xs font-black transition cursor-pointer shadow-sm"
              title="Descargar Excel oficial de la agenda"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>

            <button
              onClick={onNewService}
              className="px-3.5 py-2 rounded-xl bg-[#00CED1] hover:brightness-110 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-[#00CED1]/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Agendar</span>
            </button>
          </div>
        </div>

        {/* 2. Pestañas de Turno con Barra Indicadora Turquesa (Idéntico a captura SUMAQ) */}
        <div className="flex items-center border-b border-[#252D38] -mx-4 px-4 gap-6 pt-1">
          {[
            { id: 'Mañana' as TurnoHorario, label: 'Mañana', count: countManana, icon: '☀️' },
            { id: 'Tarde' as TurnoHorario, label: 'Tarde', count: countTarde, icon: '🌅' },
            { id: 'Extras' as TurnoHorario, label: 'Extras', count: countExtras, icon: '⏱️' }
          ].map(t => {
            const isActive = filtroTurno === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setFiltroTurno(t.id)}
                className={`pb-3 pt-1 text-xs font-black flex items-center gap-2 transition relative cursor-pointer ${
                  isActive ? 'text-[#00CED1]' : 'text-[#8A9BB0] hover:text-[#F0F4F8]'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive 
                    ? 'bg-[#00CED1]/20 text-[#00CED1]' 
                    : 'bg-[#181D22] text-[#8A9BB0]'
                }`}>
                  {t.count}
                </span>

                {/* Línea turquesa activa */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00CED1] shadow-sm shadow-[#00CED1]" />
                )}
              </button>
            );
          })}

          <div className="ml-auto text-xs font-extrabold text-[#00CED1] pb-2 hidden sm:block">
            Ingreso Turno: S/ {formatMontoSoles(totalRecaudadoTurno)}
          </div>
        </div>
      </div>

      {/* 3. Encabezados de Tabla en Desktop (Idéntico a captura de referencia) */}
      <div className="px-4 pt-4">
        <div className="hidden lg:flex items-center justify-between text-[10px] font-black tracking-wider uppercase text-[#8A9BB0] px-4 py-2 bg-[#0E1216] rounded-t-xl border-x border-t border-[#232B36]">
          <div className="flex items-center gap-3 flex-1">
            <span className="w-5"></span>
            <span className="min-w-[210px]">CLIENTE</span>
            <span className="min-w-[170px]">DIRECCIÓN</span>
            <span className="min-w-[180px]">TIPO</span>
          </div>
          <div className="flex items-center gap-6 justify-end">
            <span className="min-w-[85px] text-right">PRECIO</span>
            <span className="min-w-[65px] text-center">EXTRA</span>
            <span className="min-w-[170px]">OPERARIO</span>
            <span className="min-w-[90px]">VAN</span>
            <span className="w-20 text-center">ACCIONES</span>
          </div>
        </div>

        {/* 4. Lista de Filas Reordenables */}
        <div className="space-y-2 lg:space-y-1.5 pt-2 lg:pt-0">
          {cargando ? (
            <div className="py-24 text-center text-xs text-[#8A9BB0] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#00CED1]" />
              <p>Cargando agenda de SUMAQ...</p>
            </div>
          ) : serviciosFiltrados.length === 0 ? (
            <div className="text-center py-20 bg-[#13171C] rounded-2xl border border-[#232B36] p-6 space-y-3">
              <p className="text-sm font-bold text-[#F0F4F8]">No hay citas en el turno de {filtroTurno}</p>
              <p className="text-xs text-[#8A9BB0]">
                Puedes agendar un nuevo servicio con el botón superior.
              </p>
              <button
                onClick={onNewService}
                className="mt-2 py-2 px-4 bg-[#00CED1] hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
              >
                + Agendar Cita
              </button>
            </div>
          ) : (
            serviciosFiltrados.map((svc, idx) => (
              <AgendaTableRow
                key={svc.id}
                servicio={svc}
                index={idx}
                operariosDisponibles={operarios}
                vehiculosDisponibles={vehiculos}
                onShare={onShareService}
                onEdit={onEditService}
                onCancel={handleCancelarServicio}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === idx}
                onTouchDragStart={handleTouchDragStart}
                onTouchDragOver={handleTouchDragOver}
                onTouchDragEnd={handleTouchDragEnd}
                isDragOverTarget={dragOverIndex === idx && draggedIndex !== null && draggedIndex !== idx}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
