import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Phone, MapPin, 
  DollarSign, Check, Plus, Users, Sparkles, 
  Send, Save, ArrowLeft, ShieldCheck, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getOperarios, 
  buscarClientePorTelefono, 
  saveServicioAgenda 
} from '../lib/supabase';

const DISTRITOS_LIMA = [
  'Miraflores', 'San Isidro', 'Santiago de Surco', 'San Borja', 
  'La Molina', 'Magdalena del Mar', 'Jesús María', 'Lince', 
  'Pueblo Libre', 'Barranco', 'Surquillo', 'San Miguel', 
  'Chorrillos', 'Ate', 'Los Olivos', 'Independencia', 'Callao', 'Otro'
];

const SERVICIOS_SUGERIDOS = [
  { nombre: 'Lavado Básico Auto', precio: 45 },
  { nombre: 'Lavado Premium Auto', precio: 75 },
  { nombre: 'Lavado Camioneta / SUV', precio: 95 },
  { nombre: 'Lavado de Tapiz y Asientos', precio: 150 },
  { nombre: 'Limpieza de Mueble / Sofá', precio: 120 },
  { nombre: 'Tratamiento de Cuero', precio: 90 },
  { nombre: 'Pulido y Encerado', precio: 160 }
];

export default function CreateAgendaForm({ onSaveSuccess, onCancel, onOpenAddPersona }) {
  // Estado de fecha y turno
  const todayStr = new Date().toISOString().split('T')[0];
  const mananaDate = new Date();
  mananaDate.setDate(mananaDate.getDate() + 1);
  const mananaStr = mananaDate.toISOString().split('T')[0];

  const [fecha, setFecha] = useState(todayStr);
  const [horario, setHorario] = useState('Mañana'); // 'Mañana', 'Tarde', 'Extras'
  const [horaEstimada, setHoraEstimada] = useState('09:00 AM');

  // Estado del cliente y ubicación
  const [telefono, setTelefono] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [distrito, setDistrito] = useState('Santiago de Surco');
  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);

  // Personas / Operarios que van al servicio
  const [operariosDisponibles, setOperariosDisponibles] = useState([]);
  const [operariosSeleccionados, setOperariosSeleccionados] = useState([]);

  // Servicio, precios y pagos
  const [servicioDetalle, setServicioDetalle] = useState('');
  const [precioFinal, setPrecioFinal] = useState('');
  const [metodoPago, setMetodoPago] = useState('Yape / Plin');
  const [comentarios, setComentarios] = useState('');
  const [esTaxi, setEsTaxi] = useState(false);

  // Estados de interfaz
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar lista de operarios/personas
  const cargarOperarios = async () => {
    const ops = await getOperarios();
    setOperariosDisponibles(ops);
  };

  useEffect(() => {
    cargarOperarios();
  }, []);

  // Búsqueda inteligente de cliente por teléfono
  useEffect(() => {
    const cleanTel = telefono.replace(/\D/g, '');
    if (cleanTel.length >= 6) {
      const timer = setTimeout(async () => {
        const c = await buscarClientePorTelefono(cleanTel);
        if (c) {
          setClienteEncontrado(c);
          if (!clienteNombre) setClienteNombre(c.nombre);
          if (c.distrito) setDistrito(c.distrito);
          if (c.direccion && !direccion) setDireccion(c.direccion);
        } else {
          setClienteEncontrado(null);
        }
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setClienteEncontrado(null);
    }
  }, [telefono]);

  // Manejar selección de operario (toggle)
  const toggleOperario = (opId) => {
    setOperariosSeleccionados(prev => 
      prev.includes(opId) ? prev.filter(id => id !== opId) : [...prev, opId]
    );
  };

  // Manejar selección de servicio sugerido
  const selectServicioSugerido = (sug) => {
    setServicioDetalle(sug.nombre);
    if (!precioFinal || Number(precioFinal) === 0) {
      setPrecioFinal(sug.precio.toString());
    }
  };

  // Validación y guardado
  const procesarGuardado = async (compartirDirecto = false) => {
    setErrorMsg('');
    if (!clienteNombre.trim()) {
      setErrorMsg('Por favor ingresa el nombre del cliente');
      return;
    }
    if (!telefono.trim() || telefono.replace(/\D/g, '').length < 6) {
      setErrorMsg('Por favor ingresa un número de teléfono válido');
      return;
    }
    if (!direccion.trim()) {
      setErrorMsg('Por favor ingresa la dirección del servicio');
      return;
    }
    if (!servicioDetalle.trim()) {
      setErrorMsg('Por favor especifica el servicio a realizar');
      return;
    }

    setGuardando(true);

    try {
      const servicioData = {
        cliente_nombre: clienteNombre.trim(),
        telefono: telefono.trim(),
        distrito,
        direccion: direccion.trim(),
        referencia: referencia.trim(),
        fecha,
        horario,
        hora_estimada: horaEstimada,
        servicio_detalle: servicioDetalle.trim(),
        precio_final: Number(precioFinal) || 0,
        metodo_pago: metodoPago,
        comentarios: comentarios.trim(),
        es_taxi: esTaxi,
        estado: 'PENDIENTE'
      };

      const saved = await saveServicioAgenda(servicioData, operariosSeleccionados);

      // Traer los objetos completos de los operarios para el modal de compartir
      const operariosCompletos = operariosDisponibles.filter(o => 
        operariosSeleccionados.includes(o.id)
      );

      const servicioCompleto = {
        ...saved,
        operarios: operariosCompletos
      };

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      
      if (onSaveSuccess) {
        onSaveSuccess(servicioCompleto, compartirDirecto);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al guardar en la base de datos');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pb-28 max-w-lg mx-auto animate-in fade-in duration-150">
      {/* Header móvil */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="p-1.5 -ml-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <span>Nueva Cita</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold">
              Móvil
            </span>
          </h2>
        </div>
        <span className="text-xs text-slate-400">Paso 1 de 1</span>
      </div>

      <div className="p-4 space-y-5">
        {/* Error alert */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. FECHA Y HORARIO */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-600" />
            <span>Fecha y Turno</span>
          </label>

          {/* Selector rápido de fecha */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFecha(todayStr)}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                fecha === todayStr 
                  ? 'bg-cyan-600 border-cyan-600 text-white shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setFecha(mananaStr)}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                fecha === mananaStr 
                  ? 'bg-cyan-600 border-cyan-600 text-white shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Mañana
            </button>
            <div className="relative">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full h-full py-1 px-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-center focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Turno */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { id: 'Mañana', label: 'Mañana', icon: '☀️' },
              { id: 'Tarde', label: 'Tarde', icon: '🌅' },
              { id: 'Extras', label: 'Extras', icon: '⏱️' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setHorario(t.id)}
                className={`py-2 px-2 text-xs font-medium rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  horario === t.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Hora estimada */}
          <div className="flex items-center gap-2 pt-1">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-medium">Hora estimada:</span>
            <input
              type="text"
              placeholder="Ej. 09:30 AM"
              value={horaEstimada}
              onChange={(e) => setHoraEstimada(e.target.value)}
              className="flex-1 py-1.5 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* 2. PERSONAS QUE VAN AL SERVICIO (REQUISITO CLAVE) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span>¿Quién va al servicio? ({operariosSeleccionados.length})</span>
            </label>
            {onOpenAddPersona && (
              <button
                type="button"
                onClick={onOpenAddPersona}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva persona</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Toca a los colaboradores que realizarán esta atención:
          </p>

          {/* Chips de personas */}
          <div className="flex flex-wrap gap-2 pt-1">
            {operariosDisponibles.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay operarios registrados aún.</p>
            ) : (
              operariosDisponibles.map(op => {
                const isSelected = operariosSeleccionados.includes(op.id);
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => toggleOperario(op.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm ring-2 ring-cyan-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ backgroundColor: isSelected ? '#ffffff30' : (op.color || '#0891b2') }}
                    >
                      {isSelected ? <Check className="w-3 h-3 text-white" /> : op.nombre.charAt(0)}
                    </div>
                    <span>{op.nombre}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-500'
                    }`}>
                      {op.cargo || 'Técnico'}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 3. CLIENTE Y UBICACIÓN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-600" />
            <span>Datos del Cliente</span>
          </label>

          {/* Teléfono con detección automática */}
          <div>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                placeholder="Teléfono móvil (9 dígitos)"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition"
              />
              {clienteEncontrado && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3" />
                  <span>Cliente habitual</span>
                </div>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <input
              type="text"
              placeholder="Nombre del cliente *"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Distrito */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 mb-1 block">Distrito</label>
            <select
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
            >
              {DISTRITOS_LIMA.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Dirección */}
          <div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Dirección exacta (Calle, Nro, Urb) *"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Referencia opcional */}
          <div>
            <input
              type="text"
              placeholder="Referencia (Frente al parque, portón blanco)"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. SERVICIO Y PRECIO */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Servicios y Cobro</span>
          </label>

          {/* Chips de sugerencias rápidas */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SERVICIOS_SUGERIDOS.slice(0, 5).map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectServicioSugerido(sug)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 text-slate-600 transition"
              >
                + {sug.nombre}
              </button>
            ))}
          </div>

          {/* Detalle del servicio */}
          <div>
            <textarea
              rows={2}
              placeholder="Detalle del servicio (ej. Lavado Completo + Tratamiento de Cuero) *"
              value={servicioDetalle}
              onChange={(e) => setServicioDetalle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Precio y Método de pago */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Precio Final (S/)</label>
              <div className="relative">
                <span className="text-sm font-bold text-slate-400 absolute left-3 top-2.5">S/</span>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0.00"
                  value={precioFinal}
                  onChange={(e) => setPrecioFinal(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Método de pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none h-[44px]"
              >
                <option value="Yape / Plin">📱 Yape / Plin</option>
                <option value="Efectivo">💵 Efectivo</option>
                <option value="Transferencia">🏦 Transferencia</option>
                <option value="Tarjeta">💳 Tarjeta (POS)</option>
              </select>
            </div>
          </div>

          {/* Taxi toggle */}
          <div className="pt-1 flex items-center justify-between">
            <label className="text-xs text-slate-600 font-medium flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={esTaxi}
                onChange={(e) => setEsTaxi(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 border-slate-300"
              />
              <span>Traslado en Taxi (sin van)</span>
            </label>
            {esTaxi && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                TAXI
              </span>
            )}
          </div>

          {/* Notas */}
          <div>
            <input
              type="text"
              placeholder="Notas u observaciones (opcional)"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTONES DE GUARDADO INFERIORES FIJOS (REQUISITO FUNDAMENTAL)
          1. "Guardar y compartir agenda"
          2. "Solo guardar"
         ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl max-w-lg mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Botón 1: Guardar y compartir agenda */}
          <button
            type="button"
            disabled={guardando}
            onClick={() => procesarGuardado(true)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition cursor-pointer"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>{guardando ? 'Guardando...' : 'Guardar y compartir agenda'}</span>
          </button>

          {/* Botón 2: Solo guardar */}
          <button
            type="button"
            disabled={guardando}
            onClick={() => procesarGuardado(false)}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4 shrink-0 text-slate-300" />
            <span>Solo guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

