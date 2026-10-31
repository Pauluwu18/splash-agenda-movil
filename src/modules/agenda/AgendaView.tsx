import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Search, 
  Download, Filter, Sparkles, AlertCircle, RefreshCw, Plus 
} from 'lucide-react';
import { ServicioAgenda, Operario, Vehiculo, TurnoHorario } from '../../types';
import { fetchServiciosPorFecha, deleteServicioRecord, VANS_DEFAULT } from '../../integrations/supabase-main/services';
import { fetchOperarios } from '../../integrations/supabase-operators/operators';
import { exportarAgendaExcel } from './ExcelExport';
import { AgendaCard } from './AgendaCard';
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
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(VANS_DEFAULT);
  const [cargando, setCargando] = useState<boolean>(true);
  
  // Filtros
  const [filtroTurno, setFiltroTurno] = useState<string>('TODOS');
  const [filtroEspecial, setFiltroEspecial] = useState<'TODOS' | 'TAXI' | 'SIN_OPERARIO' | 'COMPLETADOS'>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  const cargarDatos = async (fechaActual = fecha) => {
    setCargando(true);
    try {
      const [svcData, opsData] = await Promise.all([
        fetchServiciosPorFecha(fechaActual),
        fetchOperarios()
      ]);
      setServicios(svcData);
      setOperarios(opsData);
    } catch (e) {
      console.error('Error cargando agenda:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos(fecha);
  }, [fecha]);

  const cambiarDia = (offset: number) => {
    const cur = new Date(fecha + 'T12:00:00');
    cur.setDate(cur.getDate() + offset);
    setFecha(cur.toISOString().split('T')[0]);
  };

  const handleCancelarServicio = async (id: string, cliente: string) => {
    if (confirm(`¿Confirmas la cancelación del servicio de ${cliente}?`)) {
      await deleteServicioRecord(id);
      cargarDatos(fecha);
    }
  };

  // Conteo por turnos
  const countManana = servicios.filter(s => s.horario === 'Mañana' && s.estado !== 'CANCELADO').length;
  const countTarde = servicios.filter(s => s.horario === 'Tarde' && s.estado !== 'CANCELADO').length;
  const countExtras = servicios.filter(s => s.horario === 'Extras' && s.estado !== 'CANCELADO').length;

  // Filtrado reactivo
  const serviciosFiltrados = servicios.filter(s => {
    // Filtro por Turno
    if (filtroTurno !== 'TODOS' && s.horario !== filtroTurno) return false;

    // Filtro Especial
    if (filtroEspecial === 'TAXI' && !s.es_taxi) return false;
    if (filtroEspecial === 'SIN_OPERARIO' && s.operarios && s.operarios.length > 0) return false;
    if (filtroEspecial === 'COMPLETADOS' && s.estado !== 'COMPLETADO') return false;

    // Búsqueda por texto (Cliente, Teléfono, Dirección)
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase();
      const matchCliente = s.cliente_nombre.toLowerCase().includes(q);
      const matchTel = s.telefono.includes(q);
      const matchDir = s.direccion.toLowerCase().includes(q) || s.distrito.toLowerCase().includes(q);
      const matchSvc = s.servicio_detalle.toLowerCase().includes(q);
      if (!matchCliente && !matchTel && !matchDir && !matchSvc) return false;
    }

    return true;
  });

  const totalRecaudado = serviciosFiltrados
    .filter(s => s.estado !== 'CANCELADO')
    .reduce((acc, s) => acc + (Number(s.precio_final) || 0) + (Number(s.monto_extra) || 0), 0);

  const fechaBonita = new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const isToday = fecha === getTodayKey();

  return (
    <div className="pb-28 max-w-lg mx-auto">
      {/* 1. Barra de Navegación de Fecha Superior */}
      <div className="sticky top-13 z-20 bg-[#0A0E11]/95 backdrop-blur-md px-4 py-3 border-b border-[#252D38] shadow-md space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Navegación de Días */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => cambiarDia(-1)}
              className="w-9 h-9 rounded-xl bg-[#181D22] hover:bg-[#252D38] border border-[#2E3847] active:scale-95 flex items-center justify-center text-[#F0F4F8] transition"
              title="Día anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setFecha(getTodayKey())}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition ${
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
              className="w-9 h-9 rounded-xl bg-[#181D22] hover:bg-[#252D38] border border-[#2E3847] active:scale-95 flex items-center justify-center text-[#F0F4F8] transition"
              title="Día siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de fecha nativo y Exportar Excel */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-9 h-9 py-1 px-1.5 bg-[#181D22] border border-[#2E3847] rounded-xl text-center text-xs font-bold text-[#F0F4F8] focus:outline-none"
              title="Seleccionar fecha"
            />

            <button
              onClick={() => exportarAgendaExcel(servicios, fecha)}
              disabled={servicios.length === 0}
              className="w-9 h-9 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 disabled:opacity-40 flex items-center justify-center text-emerald-400 transition"
              title="Exportar Agenda a Excel"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Pestañas de Turno con Contadores Activos (Original SPLASH) */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'TODOS', label: 'Todos', count: servicios.filter(s => s.estado !== 'CANCELADO').length },
            { id: 'Mañana', label: '☀️ Mañana', count: countManana },
            { id: 'Tarde', label: '🌅 Tarde', count: countTarde },
            { id: 'Extras', label: '⏱️ Extras', count: countExtras }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFiltroTurno(t.id)}
              className={`py-1.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center border transition ${
                filtroTurno === t.id
                  ? 'bg-[#00CED1] text-slate-950 border-[#00CED1] shadow-xs'
                  : 'bg-[#181D22] text-[#8A9BB0] border-[#252D38] hover:bg-[#1E2530]'
              }`}
            >
              <span className="text-[10px] leading-tight">{t.label}</span>
              <span className="text-xs font-black">{t.count}</span>
            </button>
          ))}
        </div>

        {/* 3. Buscador y Filtros Especiales */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A9BB0] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono o dirección..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#111418] border border-[#252D38] rounded-xl text-[#F0F4F8] placeholder-[#4A5A70] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
            />
          </div>

          {/* Chips de filtros especiales */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'TODOS', label: 'Ver todos' },
              { id: 'TAXI', label: '🚕 Solo Taxis' },
              { id: 'SIN_OPERARIO', label: '⚠️ Sin Operario' },
              { id: 'COMPLETADOS', label: '✅ Realizados' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltroEspecial(f.id as any)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                  filtroEspecial === f.id
                    ? 'bg-[#1E2530] text-[#00CED1] border-[#00CED1]/50'
                    : 'bg-[#111418] text-[#8A9BB0] border-[#252D38] hover:text-[#F0F4F8]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen de totales */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1E2530]">
          <span className="text-[#8A9BB0]">
            Mostrando <strong>{serviciosFiltrados.length}</strong> de {servicios.length} citas
          </span>
          <span className="font-extrabold text-[#00CED1]">
            Total: S/ {formatMontoSoles(totalRecaudado)}
          </span>
        </div>
      </div>

      {/* 4. Lista de Tarjetas de Servicios */}
      <div className="p-4 space-y-3.5">
        {cargando ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-9 h-9 border-3 border-[#00CED1] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#8A9BB0] font-medium">Cargando agenda de SPLASH...</p>
          </div>
        ) : serviciosFiltrados.length === 0 ? (
          <div className="py-16 px-4 text-center bg-[#181D22] rounded-3xl border border-[#252D38] space-y-4">
            <div className="w-14 h-14 bg-[#1E2530] text-[#00CED1] rounded-2xl flex items-center justify-center mx-auto border border-[#2E3847]">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-[#F0F4F8] text-base">Sin citas para mostrar</h4>
              <p className="text-xs text-[#8A9BB0] max-w-xs mx-auto">
                No hay servicios programados con los filtros seleccionados para el {fechaBonita}.
              </p>
            </div>
            <button
              onClick={onNewService}
              className="py-3 px-5 bg-gradient-to-r from-[#0090A0] to-[#00CED1] hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-[#00CED1]/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar Servicio Ahora</span>
            </button>
          </div>
        ) : (
          serviciosFiltrados.map((item) => (
            <AgendaCard
              key={item.id}
              servicio={item}
              operariosDisponibles={operarios}
              vehiculosDisponibles={vehiculos}
              onShare={onShareService}
              onEdit={onEditService}
              onCancel={handleCancelarServicio}
              onUpdateSuccess={() => cargarDatos(fecha)}
            />
          ))
        )}
      </div>
    </div>
  );
};
