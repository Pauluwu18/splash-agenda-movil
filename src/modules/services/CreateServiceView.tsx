import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, User, Phone, MapPin, 
  Sparkles, DollarSign, Send, Save, ArrowLeft, 
  Plus, Trash2, Check, AlertCircle, Users, Truck, Info 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  TurnoHorario, MetodoPago, ItemServicio, 
  Empresa, CanalOrigen, CategoriaCatalogo, Operario, Vehiculo 
} from '../../types';
import { 
  saveServicioAgenda, 
  buscarClientePorTelefono,
  EMPRESAS_DEFAULT, 
  CANALES_DEFAULT, 
  CATALOGO_DEFAULT, 
  VANS_DEFAULT, 
  DISTRITOS_LIMA 
} from '../../integrations/supabase-main/services';
import { fetchOperariosActivos } from '../../integrations/supabase-operators/operators';
import { 
  getTodayKey, 
  getMananaKey, 
  HORAS_POR_TURNO, 
  corteAsignacionYaPaso, 
  formatMontoSoles 
} from '../../utils/businessRules';

interface CreateServiceViewProps {
  onSuccess: (savedService: any, compartirDirecto: boolean) => void;
  onCancel: () => void;
}

export const CreateServiceView: React.FC<CreateServiceViewProps> = ({
  onSuccess,
  onCancel
}) => {
  // 1. Programación
  const [fecha, setFecha] = useState<string>(getTodayKey());
  const [horario, setHorario] = useState<TurnoHorario>('Mañana');
  const [horaEstimada, setHoraEstimada] = useState<string>('09:00 AM');

  // 2. Cliente
  const [telefono, setTelefono] = useState<string>('');
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [clienteEncontrado, setClienteEncontrado] = useState<boolean>(false);
  const [empresaId, setEmpresaId] = useState<string>(EMPRESAS_DEFAULT[0].id);
  const [canalOrigenId, setCanalOrigenId] = useState<string>(CANALES_DEFAULT[0].id);

  // 3. Ubicación
  const [distrito, setDistrito] = useState<string>('Santiago de Surco');
  const [direccion, setDireccion] = useState<string>('');
  const [referencia, setReferencia] = useState<string>('');

  // 4. Servicios e Ítems
  const [items, setItems] = useState<ItemServicio[]>([
    {
      subcategoria_nombre: CATALOGO_DEFAULT[0].subcategorias[0].nombre,
      subcategoria_id: CATALOGO_DEFAULT[0].subcategorias[0].id,
      categoria_id: CATALOGO_DEFAULT[0].id,
      categoria_nombre: CATALOGO_DEFAULT[0].nombre,
      tipo_medida: CATALOGO_DEFAULT[0].subcategorias[0].tipo_medida,
      valor_editable: 1,
      precio: CATALOGO_DEFAULT[0].subcategorias[0].precio_sugerido
    }
  ]);
  const [descuento, setDescuento] = useState<string>('0');

  // 5. Pago
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Yape / Plin');

  // 6. Personal (Segundo Supabase) & Flota
  const [operariosDisponibles, setOperariosDisponibles] = useState<Operario[]>([]);
  const [operariosSeleccionados, setOperariosSeleccionados] = useState<string[]>([]);
  const [esTaxi, setEsTaxi] = useState<boolean>(false);
  const [vehiculoId, setVehiculoId] = useState<string>('');

  // 7. Observaciones
  const [comentarios, setComentarios] = useState<string>('');

  // Estados de control
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Cargar operarios disponibles
  useEffect(() => {
    fetchOperariosActivos().then(setOperariosDisponibles);
  }, []);

  // Actualizar hora estimada por defecto al cambiar de turno
  useEffect(() => {
    const horas = HORAS_POR_TURNO[horario];
    if (horas && horas.length > 0) {
      setHoraEstimada(horas[0]);
    }
  }, [horario]);

  // Búsqueda inteligente de cliente con debounce de 350ms
  useEffect(() => {
    const cleanTel = telefono.replace(/\D/g, '');
    if (cleanTel.length >= 6) {
      const t = setTimeout(async () => {
        const c = await buscarClientePorTelefono(cleanTel);
        if (c) {
          setClienteEncontrado(true);
          if (!clienteNombre) setClienteNombre(c.nombre);
          if (c.distrito) setDistrito(c.distrito);
          if (c.direccion && !direccion) setDireccion(c.direccion);
        } else {
          setClienteEncontrado(false);
        }
      }, 350);
      return () => clearTimeout(t);
    } else {
      setClienteEncontrado(false);
    }
  }, [telefono]);

  // Manejo de ítems
  const handleAddItem = () => {
    const defaultSub = CATALOGO_DEFAULT[0].subcategorias[0];
    setItems(prev => [
      ...prev,
      {
        categoria_id: CATALOGO_DEFAULT[0].id,
        categoria_nombre: CATALOGO_DEFAULT[0].nombre,
        subcategoria_id: defaultSub.id,
        subcategoria_nombre: defaultSub.nombre,
        tipo_medida: defaultSub.tipo_medida,
        valor_editable: 1,
        precio: defaultSub.precio_sugerido
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, updates: Partial<ItemServicio>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  // Cálculos de totales
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.precio) || 0), 0);
  }, [items]);

  const descNumber = Number(descuento) || 0;
  const descuentoAplicado = Math.min(Math.max(descNumber, 0), subtotal);
  const total = Math.max(0, subtotal - descuentoAplicado);

  const toggleOperario = (id: string) => {
    setOperariosSeleccionados(prev => 
      prev.includes(id) ? prev.filter(opId => opId !== id) : [...prev, id]
    );
  };

  // Regla de corte a las 18:00
  const advertenciaCorte = corteAsignacionYaPaso(fecha);

  // Guardar servicio
  const handleGuardar = async (compartirDirecto: boolean) => {
    setErrorMsg('');
    if (!clienteNombre.trim()) {
      setErrorMsg('El nombre del cliente es obligatorio');
      return;
    }
    if (!telefono.trim() || telefono.replace(/\D/g, '').length < 6) {
      setErrorMsg('Ingresa un teléfono válido de 9 dígitos');
      return;
    }
    if (!direccion.trim()) {
      setErrorMsg('La dirección es obligatoria');
      return;
    }

    setGuardando(true);

    try {
      const empresaActual = EMPRESAS_DEFAULT.find(e => e.id === empresaId);
      const canalActual = CANALES_DEFAULT.find(c => c.id === canalOrigenId);
      const vanActual = VANS_DEFAULT.find(v => v.id === vehiculoId);

      // Resumen del detalle concatenado
      const detalleTexto = items.map(it => {
        if (it.tipo_medida && it.tipo_medida !== 'unidad' && it.valor_editable && it.valor_editable > 1) {
          return `${it.subcategoria_nombre} (${it.valor_editable} ${it.tipo_medida})`;
        }
        return it.subcategoria_nombre;
      }).join(' + ');

      const payload = {
        cliente_nombre: clienteNombre.trim(),
        telefono: telefono.trim(),
        empresa_id: empresaId,
        empresa_nombre: empresaActual?.nombre || 'SPLASH',
        empresa_color: empresaActual?.color || '#00CED1',
        canal_origen_id: canalOrigenId,
        canal_origen_nombre: canalActual?.nombre || 'WhatsApp',
        distrito,
        direccion: direccion.trim(),
        referencia: referencia.trim(),
        fecha,
        horario,
        hora_estimada: horaEstimada,
        servicio_detalle: detalleTexto,
        items,
        precio_final: total,
        descuento: descuentoAplicado,
        metodo_pago: metodoPago,
        es_taxi: esTaxi,
        vehiculo_id: esTaxi ? undefined : vehiculoId || undefined,
        van_nombre: esTaxi ? '' : vanActual?.nombre || '',
        comentarios: comentarios.trim(),
        estado: 'PENDIENTE' as const
      };

      const saved = await saveServicioAgenda(payload, operariosSeleccionados);

      // Traer operarios completos para la vista y compartir
      const opsCompletos = operariosDisponibles.filter(o => 
        operariosSeleccionados.includes(o.id)
      );

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      onSuccess({ ...saved, operarios: opsCompletos }, compartirDirecto);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al guardar el servicio');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pb-36 max-w-lg mx-auto">
      {/* Header móvil */}
      <div className="sticky top-0 z-20 bg-[#0A0E11]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#252D38] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onCancel}
            className="p-1.5 -ml-1.5 rounded-xl text-[#8A9BB0] hover:text-[#F0F4F8] hover:bg-[#181D22]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-[#F0F4F8]">Crear Servicio</h2>
            <p className="text-[10px] text-[#8A9BB0]">Formulario Oficial SPLASH</p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#00CED1]/15 text-[#00CED1] border border-[#00CED1]/30">
          Android Touch
        </span>
      </div>

      <div className="p-4 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. SECCIÓN CLIENTE & EMPRESA */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#00CED1] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>1. Cliente y Empresa</span>
          </label>

          {/* Teléfono móvil */}
          <div className="relative">
            <Phone className="w-4 h-4 text-[#8A9BB0] absolute left-3 top-3.5" />
            <input
              type="tel"
              placeholder="Teléfono móvil (9 dígitos) *"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
              className="w-full pl-9 pr-3 py-2.5 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] placeholder-[#4A5A70] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
            />
            {clienteEncontrado && (
              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Cliente existente</span>
              </span>
            )}
          </div>

          {/* Nombre del cliente */}
          <input
            type="text"
            placeholder="Nombre completo del cliente *"
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] placeholder-[#4A5A70] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
          />

          {/* Selección de Empresa / Marca (Multi-brand SPLASH) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-[#8A9BB0]">Empresa / Marca:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {EMPRESAS_DEFAULT.map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setEmpresaId(emp.id)}
                  className={`py-2 px-2.5 text-[11px] font-bold rounded-xl border flex items-center gap-1.5 transition ${
                    empresaId === emp.id
                      ? 'border-[#00CED1] bg-[#00CED1]/15 text-[#F0F4F8]'
                      : 'border-[#252D38] bg-[#111418] text-[#8A9BB0] hover:bg-[#1E2530]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: emp.color }} />
                  <span className="truncate">{emp.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Canal de Origen */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-[#8A9BB0]">Canal de Origen:</span>
            <select
              value={canalOrigenId}
              onChange={(e) => setCanalOrigenId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
            >
              {CANALES_DEFAULT.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. SECCIÓN UBICACIÓN */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#00CED1] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>2. Ubicación del Servicio</span>
          </label>

          {/* Distrito */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#8A9BB0]">Distrito:</span>
            <select
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
            >
              {DISTRITOS_LIMA.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Dirección exacta */}
          <input
            type="text"
            placeholder="Dirección exacta (Calle, Av, Nro, Piso) *"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-semibold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] placeholder-[#4A5A70] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
          />

          {/* Referencia */}
          <input
            type="text"
            placeholder="Referencia (opcional, ej. Frente al parque)"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#111418] border border-[#252D38] rounded-xl text-[#F0F4F8] placeholder-[#4A5A70] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
          />
        </div>

        {/* 3. SECCIÓN PROGRAMACIÓN & HORARIOS */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#00CED1] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>3. Fecha y Horario</span>
          </label>

          {/* Selector de Fecha */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFecha(getTodayKey())}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                fecha === getTodayKey()
                  ? 'bg-[#00CED1] text-slate-950 border-[#00CED1]'
                  : 'bg-[#111418] text-[#8A9BB0] border-[#252D38] hover:text-[#F0F4F8]'
              }`}
            >
              Hoy
            </button>

            <button
              type="button"
              onClick={() => setFecha(getMananaKey())}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                fecha === getMananaKey()
                  ? 'bg-[#00CED1] text-slate-950 border-[#00CED1]'
                  : 'bg-[#111418] text-[#8A9BB0] border-[#252D38] hover:text-[#F0F4F8]'
              }`}
            >
              Mañana
            </button>

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="py-1 px-1.5 bg-[#111418] text-[#F0F4F8] text-xs font-bold rounded-xl border border-[#252D38] text-center focus:outline-none"
            />
          </div>

          {/* Turno */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['Mañana', 'Tarde', 'Extras'] as TurnoHorario[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setHorario(t)}
                className={`py-2 px-2 text-xs font-black rounded-xl border transition flex items-center justify-center gap-1 ${
                  horario === t
                    ? 'bg-[#1E2530] text-[#00CED1] border-[#00CED1]'
                    : 'bg-[#111418] text-[#8A9BB0] border-[#252D38] hover:bg-[#181D22]'
                }`}
              >
                <span>{t === 'Mañana' ? '☀️' : t === 'Tarde' ? '🌅' : '⏱️'}</span>
                <span>{t}</span>
              </button>
            ))}
          </div>

          {/* Hora Estimada de Llegada */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-[#8A9BB0] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#00CED1]" />
              <span>Hora estimada de llegada:</span>
            </span>
            <select
              value={horaEstimada}
              onChange={(e) => setHoraEstimada(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#00CED1] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
            >
              {HORAS_POR_TURNO[horario].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Advertencia de regla de corte 18:00 */}
          {advertenciaCorte && (
            <div className="p-2.5 bg-amber-950/70 border border-amber-800/80 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                Ya pasó el corte de las 18:00 de hoy — este servicio para mañana se asignará manualmente desde la agenda.
              </span>
            </div>
          )}
        </div>

        {/* 4. SECCIÓN SERVICIOS E ÍTEMS MULTI-ITEM */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-wider text-[#00CED1] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>4. Servicios a Realizar ({items.length})</span>
            </label>

            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs font-bold text-[#00CED1] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Agregar ítem</span>
            </button>
          </div>

          {/* Lista de Ítems */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-[#111418] p-3 rounded-xl border border-[#252D38] space-y-2.5 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#8A9BB0]">
                    Ítem #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Eliminar ítem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Subcategoría / Servicio */}
                <select
                  value={item.subcategoria_id}
                  onChange={(e) => {
                    const subId = e.target.value;
                    let foundSub: any = null;
                    let foundCat: any = null;
                    for (const cat of CATALOGO_DEFAULT) {
                      const s = cat.subcategorias.find(x => x.id === subId);
                      if (s) {
                        foundSub = s;
                        foundCat = cat;
                        break;
                      }
                    }
                    if (foundSub) {
                      handleItemChange(idx, {
                        subcategoria_id: foundSub.id,
                        subcategoria_nombre: foundSub.nombre,
                        categoria_id: foundCat?.id,
                        categoria_nombre: foundCat?.nombre,
                        tipo_medida: foundSub.tipo_medida,
                        precio: foundSub.precio_sugerido
                      });
                    }
                  }}
                  className="w-full px-2.5 py-2 text-xs font-bold bg-[#181D22] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
                >
                  {CATALOGO_DEFAULT.map(cat => (
                    <optgroup key={cat.id} label={cat.nombre}>
                      {cat.subcategorias.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.nombre} (Sugerido: S/ {sub.precio_sugerido})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {/* Precio y medida */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {item.tipo_medida && item.tipo_medida !== 'unidad' ? (
                    <div>
                      <span className="text-[10px] text-[#8A9BB0] block capitalize">
                        {item.tipo_medida}:
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={item.valor_editable || 1}
                        onChange={(e) => handleItemChange(idx, { valor_editable: Number(e.target.value) || 1 })}
                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-[#181D22] border border-[#2E3847] rounded-lg text-[#F0F4F8]"
                      />
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-[#8A9BB0] block">Cantidad:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.valor_editable || 1}
                        onChange={(e) => handleItemChange(idx, { valor_editable: Number(e.target.value) || 1 })}
                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-[#181D22] border border-[#2E3847] rounded-lg text-[#F0F4F8]"
                      />
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-[#8A9BB0] block">Precio (S/):</span>
                    <input
                      type="number"
                      step="1"
                      value={item.precio}
                      onChange={(e) => handleItemChange(idx, { precio: Number(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 text-xs font-black bg-[#181D22] border border-[#2E3847] rounded-lg text-[#00CED1]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Descuento */}
          <div className="pt-1 flex items-center justify-between gap-3 border-t border-[#252D38]">
            <span className="text-xs font-bold text-[#8A9BB0]">Descuento especial (S/):</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
              className="w-24 py-1 px-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-center text-rose-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 5. SECCIÓN PAGO Y TOTALES */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#00CED1] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span>5. Método de Pago y Total</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(['Yape / Plin', 'Efectivo', 'Transferencia', 'Tarjeta'] as MetodoPago[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodoPago(m)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                  metodoPago === m
                    ? 'bg-[#00CED1] text-slate-950 border-[#00CED1]'
                    : 'bg-[#111418] text-[#8A9BB0] border-[#252D38] hover:bg-[#1E2530]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Resumen de cobro */}
          <div className="bg-[#111418] p-3 rounded-xl border border-[#252D38] space-y-1 text-xs">
            <div className="flex justify-between text-[#8A9BB0]">
              <span>Subtotal ítems:</span>
              <span>S/ {formatMontoSoles(subtotal)}</span>
            </div>
            {descuentoAplicado > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Descuento aplicado:</span>
                <span>- S/ {formatMontoSoles(descuentoAplicado)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-[#F0F4F8] pt-1 border-t border-[#252D38]">
              <span>Total a cobrar:</span>
              <span className="text-[#00CED1]">S/ {formatMontoSoles(total)}</span>
            </div>
          </div>
        </div>

        {/* 6. SECCIÓN ASIGNACIÓN DE PERSONAL (2do Supabase) */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-wider text-[#00CED1] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>6. Personal Asignado ({operariosSeleccionados.length})</span>
            </label>
            <span className="text-[10px] text-[#8A9BB0]">2do Supabase</span>
          </div>

          <p className="text-[11px] text-[#8A9BB0]">
            Toca a los colaboradores que asistirán:
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {operariosDisponibles.map(op => {
              const selected = operariosSeleccionados.includes(op.id);
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => toggleOperario(op.id)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition active:scale-95 ${
                    selected
                      ? 'bg-[#00CED1] text-slate-950 border-[#00CED1] shadow-xs'
                      : 'bg-[#111418] text-[#8A9BB0] border-[#252D38] hover:text-[#F0F4F8]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selected ? '#0A0E11' : (op.color || '#00CED1') }}
                  />
                  <span>{op.nombres || op.nombre_completo}</span>
                  <span className={`text-[10px] ${selected ? 'text-slate-800' : 'text-[#4A5A70]'}`}>
                    ({op.rol || 'Operario'})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. SECCIÓN FLOTA / MOVILIDAD */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-3">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#00CED1] flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            <span>7. Movilidad (Van o Taxi)</span>
          </label>

          <div className="flex items-center justify-between pb-1">
            <label className="text-xs text-[#F0F4F8] font-bold flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={esTaxi}
                onChange={(e) => setEsTaxi(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-[#111418] border-[#2E3847]"
              />
              <span>Traslado en TAXI (sin furgoneta)</span>
            </label>
            {esTaxi && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                TAXI
              </span>
            )}
          </div>

          {!esTaxi && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#8A9BB0]">Asignar Van de la flota:</span>
              <select
                value={vehiculoId}
                onChange={(e) => setVehiculoId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-[#111418] border border-[#2E3847] rounded-xl text-[#F0F4F8] focus:outline-none"
              >
                <option value="">-- Sin van asignada aún --</option>
                {VANS_DEFAULT.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre} ({v.placa})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 8. SECCIÓN OBSERVACIONES */}
        <div className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#8A9BB0]">
            8. Observaciones / Comentarios
          </label>
          <input
            type="text"
            placeholder="Notas opcionales sobre el servicio o cliente..."
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#111418] border border-[#252D38] rounded-xl text-[#F0F4F8] placeholder-[#4A5A70] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
          />
        </div>
      </div>

      {/* =========================================================================
          BOTONES INFERIORES FIJOS (REQUISITO FUNDAMENTAL DEL SISTEMA)
          1. "Guardar y compartir agenda"
          2. "Solo guardar"
         ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3.5 bg-[#0A0E11]/95 backdrop-blur-md border-t border-[#252D38] shadow-2xl max-w-lg mx-auto safe-area-bottom">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Botón 1: Guardar y compartir agenda */}
          <button
            type="button"
            disabled={guardando}
            onClick={() => handleGuardar(true)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-98 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>{guardando ? 'Guardando...' : 'Guardar y compartir agenda'}</span>
          </button>

          {/* Botón 2: Solo guardar */}
          <button
            type="button"
            disabled={guardando}
            onClick={() => handleGuardar(false)}
            className="w-full py-3 px-4 bg-[#1E2530] hover:bg-[#252D38] active:scale-98 disabled:opacity-50 text-[#F0F4F8] font-bold text-xs rounded-xl border border-[#2E3847] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4 shrink-0 text-[#00CED1]" />
            <span>Solo guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
