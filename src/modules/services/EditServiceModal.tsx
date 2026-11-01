import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, DollarSign, 
  Save, AlertTriangle, Truck, Sparkles 
} from 'lucide-react';
import { ServicioAgenda, TurnoHorario, Vehiculo } from '../../types';
import { updateServicio, getVansPersonalizadas, VANS_DEFAULT } from '../../integrations/supabase-main/services';
import { HORAS_POR_TURNO } from '../../utils/businessRules';

interface EditServiceModalProps {
  servicio: ServicioAgenda;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  servicio,
  onClose,
  onSuccess
}) => {
  const [fecha, setFecha] = useState<string>(servicio.fecha);
  const [horario, setHorario] = useState<TurnoHorario>(servicio.horario);
  const [horaEstimada, setHoraEstimada] = useState<string>(servicio.hora_estimada || '');
  const [direccion, setDireccion] = useState<string>(servicio.direccion);
  const [linkMaps, setLinkMaps] = useState<string>(servicio.link_maps || '');
  const [precioFinal, setPrecioFinal] = useState<string>(String(servicio.precio_final));
  const [comentarios, setComentarios] = useState<string>(servicio.comentarios || '');
  const [esTaxi, setEsTaxi] = useState<boolean>(servicio.es_taxi);
  const [vehiculoId, setVehiculoId] = useState<string>(servicio.vehiculo_id || '');
  
  // Regla original de SPLASH para rectificación
  const [esRectificacion, setEsRectificacion] = useState<boolean>(Boolean(servicio.es_rectificacion));
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleToggleRectificacion = (checked: boolean) => {
    setEsRectificacion(checked);
    if (checked) {
      setPrecioFinal('0.00');
    } else {
      setPrecioFinal(String(servicio.precio_final || '75.00'));
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!direccion.trim()) {
      setErrorMsg('La dirección es obligatoria');
      return;
    }

    setGuardando(true);
    try {
      const van = VANS_DEFAULT.find(v => v.id === vehiculoId);

      await updateServicio(servicio.id, {
        fecha,
        horario,
        hora_estimada: horaEstimada,
        direccion: direccion.trim(),
        link_maps: linkMaps.trim(),
        precio_final: esRectificacion ? 0 : (Number(precioFinal) || 0),
        es_rectificacion: esRectificacion,
        es_taxi: esTaxi,
        vehiculo_id: esTaxi ? null : (vehiculoId || null),
        van_nombre: esTaxi ? '' : (van?.nombre || servicio.van_nombre || ''),
        comentarios: comentarios.trim()
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el servicio');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#181D22] rounded-t-3xl sm:rounded-2xl border border-[#252D38] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#252D38] flex items-center justify-between bg-[#111418]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00CED1]/15 text-[#00CED1] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#F0F4F8] text-sm">Editar / Reprogramar</h3>
              <p className="text-[11px] text-[#8A9BB0] truncate max-w-[220px]">
                {servicio.cliente_nombre} • {servicio.distrito}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1E2530] hover:bg-[#252D38] flex items-center justify-center text-[#8A9BB0] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleGuardar} className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Opción de Rectificación (Original de SPLASH) */}
          <div className="bg-[#111418] p-3 rounded-xl border border-[#252D38] space-y-2">
            <label className="flex items-center justify-between text-xs font-bold text-[#F0F4F8] cursor-pointer">
              <span>¿Es una Rectificación (Garantía)?</span>
              <input
                type="checkbox"
                checked={esRectificacion}
                onChange={(e) => handleToggleRectificacion(e.target.checked)}
                className="w-4 h-4 rounded text-[#00CED1] bg-[#1E2530] border-[#2E3847]"
              />
            </label>
            {esRectificacion && (
              <p className="text-[11px] text-cyan-400 bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/60 leading-relaxed">
                ℹ️ Al marcar rectificación, el precio se fijará en <strong>S/ 0.00</strong> y se conservará el mismo personal técnico asignado.
              </p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8A9BB0] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#00CED1]" />
              <span>Fecha del Servicio:</span>
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
            />
          </div>

          {/* Horario y Hora Estimada */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8A9BB0]">Turno:</label>
              <select
                value={horario}
                onChange={(e) => setHorario(e.target.value as TurnoHorario)}
                className="w-full px-2.5 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8]"
              >
                <option value="Mañana">☀️ Mañana</option>
                <option value="Tarde">🌅 Tarde</option>
                <option value="Extras">⏱️ Extras</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8A9BB0]">Hora Estimada:</label>
              <select
                value={HORAS_POR_TURNO[horario].includes(horaEstimada) ? horaEstimada : ''}
                onChange={(e) => {
                  if (e.target.value) setHoraEstimada(e.target.value);
                }}
                className="w-full px-2 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#00CED1]"
              >
                {HORAS_POR_TURNO[horario].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Input manual de hora de llegada */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8A9BB0] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#00CED1]" />
              <span>Hora / Rango de Llegada (editable):</span>
            </label>
            <input
              type="text"
              placeholder="Ej. 1:30pm - 2:30pm Aprox"
              value={horaEstimada}
              onChange={(e) => setHoraEstimada(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8A9BB0] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#00CED1]" />
              <span>Dirección:</span>
            </label>
            <input
              type="text"
              required
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
            />
          </div>

          {/* Link de Google Maps / GPS */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8A9BB0]">Link Google Maps (opcional):</label>
            <input
              type="url"
              placeholder="https://maps.app.goo.gl/... o https://maps.google.com/..."
              value={linkMaps}
              onChange={(e) => setLinkMaps(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#111418] border border-[#252D38] rounded-xl text-[#F0F4F8] focus:outline-none"
            />
          </div>

          {/* Precio Final (Editable salvo rectificación) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8A9BB0] flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#00CED1]" />
              <span>Precio Final (S/):</span>
            </label>
            <input
              type="number"
              step="1"
              disabled={esRectificacion}
              value={precioFinal}
              onChange={(e) => setPrecioFinal(e.target.value)}
              className="w-full px-3 py-2 text-xs font-black bg-[#111418] border border-[#2E3847] rounded-xl text-[#00CED1] disabled:opacity-50 focus:outline-none"
            />
          </div>

                    {/* Movilidad Asignada (Taxi o Van) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#8A9BB0] flex items-center gap-1">
              <Truck className="w-3 h-3 text-[#00CED1]" />
              <span>Movilidad Asignada (Taxi o Van):</span>
            </label>
            <select
              value={movilidad}
              onChange={(e) => setMovilidad(e.target.value)}
              className="w-full px-3 py-2 text-xs font-black bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:border-[#00CED1] focus:outline-none cursor-pointer"
            >
              <option value="">-- Sin movilidad asignada --</option>
              <optgroup label="Taxis (1 al 5)">
                <option value="TAXI 1">TAXI 1</option>
                <option value="TAXI 2">TAXI 2</option>
                <option value="TAXI 3">TAXI 3</option>
                <option value="TAXI 4">TAXI 4</option>
                <option value="TAXI 5">TAXI 5</option>
              </optgroup>
              <optgroup label="Vans de la flota (Choferes)">
                {vans.map(v => (
                  <option key={v.id} value={v.nombre}>{v.nombre}</option>
                ))}
              </optgroup>
              <option value="Sin movilidad">Sin movilidad</option>
            </select>
          </div>

          {/* Observaciones */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8A9BB0]">Observaciones:</label>
            <input
              type="text"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#111418] hover:bg-[#1E2530] text-[#8A9BB0] font-bold text-xs rounded-xl border border-[#2E3847]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-3 bg-[#00CED1] hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-[#00CED1]/25 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

