import { 
  ServicioAgenda, Cliente, Empresa, CanalOrigen, 
  CategoriaCatalogo, Vehiculo, TurnoHorario, EstadoServicio 
} from '../../types';
import { getMainSupabase, isMainSupabaseConfigured } from './client';
import { fetchOperarios } from '../supabase-operators/operators';

// =========================================================================
// DATOS DE CATÁLOGO Y CONFIGURACIÓN REAL DE SUMAQ
// =========================================================================
export const EMPRESAS_DEFAULT: Empresa[] = [
  { id: 'emp-1', nombre: 'SUMAQ', color: '#00CED1', activo: true },
  { id: 'emp-2', nombre: 'SUMAQ Limpieza', color: '#60A5FA', activo: true },
  { id: 'emp-3', nombre: 'SUMAQ Flota', color: '#FB923C', activo: true },
  { id: 'emp-4', nombre: 'CLEANIX', color: '#A855F7', activo: true },
  { id: 'emp-5', nombre: 'SPLASH', color: '#22C55E', activo: true }
];

export const CANALES_DEFAULT: CanalOrigen[] = [
  { id: 'can-1', nombre: 'WhatsApp', activo: true },
  { id: 'can-2', nombre: 'Instagram', activo: true },
  { id: 'can-3', nombre: 'Facebook', activo: true },
  { id: 'can-4', nombre: 'Llamada Directa', activo: true },
  { id: 'can-5', nombre: 'Recomendación / Referido', activo: true }
];

export const TAXIS_DEFAULT = ['TAXI 1', 'TAXI 2', 'TAXI 3', 'TAXI 4', 'TAXI 5'];

export const DEFAULT_VANS: Vehiculo[] = [
  { id: 'van-manuel', nombre: 'VAN Manuel', placa: '', estado: 'ACTIVO' }
];

export const VANS_DEFAULT: Vehiculo[] = DEFAULT_VANS;

export const CATALOGO_DEFAULT: CategoriaCatalogo[] = [
  {
    id: 'cat-muebles',
    nombre: 'Muebles y Tapices',
    icono: 'Sofa',
    subcategorias: [
      { id: 'sub-mueble-321', categoria_id: 'cat-muebles', nombre: 'Mueble 3-2-1', tipo_medida: 'unidad', precio_sugerido: 140.0 },
      { id: 'sub-mueble-l-peq', categoria_id: 'cat-muebles', nombre: 'Mueble en L Pequeño', tipo_medida: 'unidad', precio_sugerido: 130.0 },
      { id: 'sub-mueble-l-gde', categoria_id: 'cat-muebles', nombre: 'Mueble en L Grande', tipo_medida: 'unidad', precio_sugerido: 180.0 },
      { id: 'sub-mueble-3c', categoria_id: 'cat-muebles', nombre: 'Mueble 3 Cuerpos', tipo_medida: 'unidad', precio_sugerido: 100.0 },
      { id: 'sub-mueble-2c', categoria_id: 'cat-muebles', nombre: 'Mueble 2 Cuerpos', tipo_medida: 'unidad', precio_sugerido: 80.0 },
      { id: 'sub-sillon-1c', categoria_id: 'cat-muebles', nombre: 'Sillón / Sofá 1 Cuerpo', tipo_medida: 'unidad', precio_sugerido: 50.0 },
      { id: 'sub-butaca', categoria_id: 'cat-muebles', nombre: 'Butaca', tipo_medida: 'unidad', precio_sugerido: 40.0 },
      { id: 'sub-banqueta', categoria_id: 'cat-muebles', nombre: 'Banqueta', tipo_medida: 'unidad', precio_sugerido: 40.0 },
      { id: 'sub-puff', categoria_id: 'cat-muebles', nombre: 'Puff', tipo_medida: 'unidad', precio_sugerido: 25.0 },
      { id: 'sub-sillas-6', categoria_id: 'cat-muebles', nombre: '6 Sillas de Comedor', tipo_medida: 'unidad', precio_sugerido: 90.0 },
      { id: 'sub-sillas-4', categoria_id: 'cat-muebles', nombre: '4 Sillas de Comedor', tipo_medida: 'unidad', precio_sugerido: 60.0 },
      { id: 'sub-silla-unid', categoria_id: 'cat-muebles', nombre: 'Silla (unidad)', tipo_medida: 'unidad', precio_sugerido: 15.0 }
    ]
  },
  {
    id: 'cat-colchones',
    nombre: 'Colchones',
    icono: 'Bed',
    subcategorias: [
      { id: 'sub-colchon-2p', categoria_id: 'cat-colchones', nombre: 'Colchón 2 Plazas', tipo_medida: 'unidad', precio_sugerido: 90.0 },
      { id: 'sub-colchon-queen', categoria_id: 'cat-colchones', nombre: 'Colchón Queen', tipo_medida: 'unidad', precio_sugerido: 110.0 },
      { id: 'sub-colchon-king', categoria_id: 'cat-colchones', nombre: 'Colchón King', tipo_medida: 'unidad', precio_sugerido: 130.0 },
      { id: 'sub-colchon-15p', categoria_id: 'cat-colchones', nombre: 'Colchón 1.5 Plazas', tipo_medida: 'unidad', precio_sugerido: 75.0 },
      { id: 'sub-colchon-1p', categoria_id: 'cat-colchones', nombre: 'Colchón 1 Plaza', tipo_medida: 'unidad', precio_sugerido: 60.0 }
    ]
  },
  {
    id: 'cat-alfombras',
    nombre: 'Alfombras',
    icono: 'Layers',
    subcategorias: [
      { id: 'sub-alfombra-dec', categoria_id: 'cat-alfombras', nombre: 'Alfombra Decorativa', tipo_medida: 'unidad', precio_sugerido: 80.0 },
      { id: 'sub-alfombra-m2', categoria_id: 'cat-alfombras', nombre: 'Alfombra por m2', tipo_medida: 'm2', precio_sugerido: 18.0 }
    ]
  },
  {
    id: 'cat-autos',
    nombre: 'Vehículos',
    icono: 'Car',
    subcategorias: [
      { id: 'sub-auto-tapiz', categoria_id: 'cat-autos', nombre: 'Lavado de Tapiz Auto', tipo_medida: 'unidad', precio_sugerido: 120.0 },
      { id: 'sub-suv-tapiz', categoria_id: 'cat-autos', nombre: 'Lavado de Tapiz Camioneta / SUV', tipo_medida: 'unidad', precio_sugerido: 150.0 }
    ]
  },
  {
    id: 'cat-otros',
    nombre: 'Otros / Personalizado',
    icono: 'Sparkles',
    subcategorias: [
      { id: 'sub-custom-1', categoria_id: 'cat-otros', nombre: 'Servicio Personalizado', tipo_medida: 'unidad', precio_sugerido: 100.0 }
    ]
  }
];

export const DISTRITOS_LIMA = [
  'San Martín de Porres', 'Callao', 'San Juan de Lurigancho', 'La Victoria',
  'Ate', 'Lima', 'Santiago de Surco', 'Miraflores', 'San Isidro', 'San Borja',
  'La Molina', 'Magdalena del Mar', 'Jesús María', 'Lince', 'Surquillo',
  'Barranco', 'San Miguel', 'Pueblo Libre', 'Chorrillos', 'Los Olivos',
  'Independencia', 'San Juan de Miraflores', 'Bellavista', 'La Perla', 'Otro'
];

// Gestión de Catálogo Dinámico en Local y Cloud
export const getCatalogoPersonalizado = (): CategoriaCatalogo[] => {
  try {
    const raw = localStorage.getItem('sumaq_catalogo_servicios');
    if (raw) return JSON.parse(raw);
  } catch {}
  return CATALOGO_DEFAULT;
};

export const saveCatalogoPersonalizado = (catalogo: CategoriaCatalogo[]) => {
  localStorage.setItem('sumaq_catalogo_servicios', JSON.stringify(catalogo));
};

export const addServicioToCatalog = (categoriaNombre: string, subcategoriaNombre: string, precio: number) => {
  const cats = getCatalogoPersonalizado();
  let cat = cats.find(c => c.nombre.toLowerCase().trim() === categoriaNombre.toLowerCase().trim());
  if (!cat) {
    cat = {
      id: `cat-${Date.now()}`,
      nombre: categoriaNombre.trim(),
      icono: 'Sparkles',
      subcategorias: []
    };
    cats.push(cat);
  }
  const id = `sub-${Date.now()}`;
  cat.subcategorias.push({
    id,
    categoria_id: cat.id,
    nombre: subcategoriaNombre.trim(),
    tipo_medida: 'unidad',
    precio_sugerido: Number(precio) || 0
  });
  saveCatalogoPersonalizado(cats);
  return cats;
};


// =========================================================================
// GESTIÓN DE VANS PERSONALIZADAS EN LOCAL Y SUPABASE
// =========================================================================
export const getVansPersonalizadas = (): Vehiculo[] => {
  try {
    const raw = localStorage.getItem('sumaq_vans_personalizadas');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_VANS;
};

export const saveVansPersonalizadas = (vans: Vehiculo[]) => {
  try {
    localStorage.setItem('sumaq_vans_personalizadas', JSON.stringify(vans));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sumaq_servicios_changed', { detail: { time: Date.now() } }));
    }
  } catch {}
};

export const addVanToFlota = (nombreChofer: string): Vehiculo[] => {
  let clean = nombreChofer.trim();
  if (!clean.toUpperCase().startsWith('VAN')) {
    clean = `VAN ${clean}`;
  }
  const vans = getVansPersonalizadas();
  const newVan: Vehiculo = {
    id: `van-${Date.now()}`,
    nombre: clean,
    placa: '',
    estado: 'ACTIVO'
  };
  const updated = [...vans, newVan];
  saveVansPersonalizadas(updated);
  return updated;
};

export const deleteVanFromFlota = (vanId: string): Vehiculo[] => {
  const vans = getVansPersonalizadas().filter(v => v.id !== vanId);
  saveVansPersonalizadas(vans);
  return vans;
};

export const deleteServicioFromCatalog = (subcategoriaId: string) => {
  const cats = getCatalogoPersonalizado();
  for (const cat of cats) {
    cat.subcategorias = cat.subcategorias.filter(s => s.id !== subcategoriaId);
  }
  saveCatalogoPersonalizado(cats);
  return cats;
};

// Fallback local store
const getLocalServices = (): ServicioAgenda[] => {
  try {
    const raw = localStorage.getItem('splash_servicios_local');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalServices = (list: ServicioAgenda[]) => {
  localStorage.setItem('splash_servicios_local', JSON.stringify(list));
};

// =========================================================================
// CONSULTA DE AGENDAS POR FECHA
// =========================================================================
export const fetchServiciosPorFecha = async (fechaStr: string): Promise<ServicioAgenda[]> => {
  const supa = getMainSupabase();
  const allOperators = await fetchOperarios();

  if (supa) {
    try {
      const { data, error } = await supa
        .from('servicios_agenda')
        .select('*')
        .eq('fecha', fechaStr)
        .order('orden', { ascending: true })
        .order('created_at', { ascending: true });

      if (!error && data) {
        const mapped = data.map((item: any) => {
          const opIds: string[] = item.operario_ids || (item.operario_id ? [item.operario_id] : []);
          const operariosAsignados = allOperators.filter(o => opIds.includes(o.id));

          return {
            ...item,
            operario_ids: opIds,
            operarios: operariosAsignados,
            items: item.items || []
          };
        });

        // Guardar en cache local para disponibilidad offline inmediata
        try {
          const local = getLocalServices();
          const filtered = local.filter(s => s.fecha !== fechaStr);
          setLocalServices([...filtered, ...mapped]);
        } catch (e) {}

        return mapped;
      }
    } catch (e) {
      console.warn('Fallo Supabase principal servicios, usando local:', e);
    }
  }

  // Fallback Local
  const local = getLocalServices();
  return local
    .filter(s => s.fecha === fechaStr)
    .sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0))
    .map(s => {
      const opIds = s.operario_ids || (s.operario_id ? [s.operario_id] : []);
      const operariosAsignados = allOperators.filter(o => opIds.includes(o.id));
      return { ...s, operario_ids: opIds, operarios: operariosAsignados };
    });
};

// =========================================================================
// BÚSQUEDA DE CLIENTE POR TELÉFONO (CRM EN TIEMPO REAL)
// =========================================================================
export const buscarClientePorTelefono = async (telefono: string): Promise<Cliente | null> => {
  const clean = telefono.replace(/\D/g, '');
  if (clean.length < 5) return null;

  const supa = getMainSupabase();
  if (supa) {
    try {
      const { data, error } = await supa
        .from('clientes')
        .select('*')
        .ilike('telefono', `%${clean}%`)
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0];
      }
    } catch (e) {
      console.warn('Error buscando cliente en Supabase:', e);
    }
  }

  const raw = localStorage.getItem('splash_clientes_local');
  const clientes: Cliente[] = raw ? JSON.parse(raw) : [];
  return clientes.find(c => c.telefono && c.telefono.includes(clean)) || null;
};

// =========================================================================
// GUARDAR SERVICIO / AGENDAR CITA
// =========================================================================
export const saveServicioAgenda = async (
  servicioData: Partial<ServicioAgenda>,
  operarioIds: string[] = []
): Promise<ServicioAgenda> => {
  // Guardar o actualizar cliente
  if (servicioData.telefono && servicioData.cliente_nombre) {
    await saveClienteRecord({
      nombre: servicioData.cliente_nombre,
      telefono: servicioData.telefono,
      distrito: servicioData.distrito,
      direccion: servicioData.direccion,
      empresa_id: servicioData.empresa_id
    });
  }

  const supa = getMainSupabase();
  const payloadToSave = {
    cliente_nombre: servicioData.cliente_nombre,
    telefono: servicioData.telefono,
    distrito: servicioData.distrito,
    direccion: servicioData.direccion,
    referencia: servicioData.referencia || '',
    link_maps: servicioData.link_maps || '',
    fecha: servicioData.fecha,
    horario: servicioData.horario,
    hora_estimada: servicioData.hora_estimada || '',
    servicio_detalle: servicioData.servicio_detalle,
    items: servicioData.items || [],
    precio_final: Number(servicioData.precio_final) || 0,
    descuento: Number(servicioData.descuento) || 0,
    monto_extra: Number(servicioData.monto_extra) || 0,
    metodo_pago: servicioData.metodo_pago || 'Efectivo',
    comentarios: servicioData.comentarios || '',
    estado: servicioData.estado || 'PENDIENTE',
    es_taxi: Boolean(servicioData.es_taxi),
    es_rectificacion: Boolean(servicioData.es_rectificacion),
    sucursal_nombre: servicioData.sucursal_nombre || 'Las Flores',
    vehiculo_id: servicioData.vehiculo_id || null,
    van_nombre: servicioData.van_nombre || 'TAXI 1',
    empresa_id: servicioData.empresa_id || null,
    empresa_nombre: servicioData.empresa_nombre || 'SUMAQ',
    empresa_color: servicioData.empresa_color || '#00CED1',
    canal_origen_id: servicioData.canal_origen_id || null,
    operario_id: operarioIds[0] || null,
    operario_ids: operarioIds,
    orden: Number(servicioData.orden) || 0
  };

  if (supa) {
    try {
      if (servicioData.id && !servicioData.id.startsWith('srv-')) {
        const { data, error } = await supa
          .from('servicios_agenda')
          .update(payloadToSave)
          .eq('id', servicioData.id)
          .select()
          .single();
        if (!error && data) {
          notifyServiciosChange();
          return data;
        }
      } else {
        const { data, error } = await supa
          .from('servicios_agenda')
          .insert([payloadToSave])
          .select()
          .single();
        if (!error && data) {
          notifyServiciosChange();
          return data;
        }
      }
    } catch (e) {
      console.warn('Error guardando en Supabase, guardando en local:', e);
    }
  }

  // Guardado Local
  const list = getLocalServices();
  const id = servicioData.id || `srv-${Date.now()}`;
  const record: ServicioAgenda = {
    ...(payloadToSave as any),
    id,
    created_at: new Date().toISOString()
  };

  const idx = list.findIndex(s => s.id === id);
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.push(record);
  }
  setLocalServices(list);
  notifyServiciosChange();
  return record;
};

// =========================================================================
// REORDENAMIENTO DE SERVICIOS (DRAG & DROP CON DEDO O RATÓN)
// =========================================================================
export const reorderServicios = async (reordered: ServicioAgenda[]): Promise<void> => {
  const supa = getMainSupabase();
  const list = getLocalServices();

  for (let i = 0; i < reordered.length; i++) {
    const s = reordered[i];
    s.orden = i;

    // Actualizar local
    const localIdx = list.findIndex(item => item.id === s.id);
    if (localIdx >= 0) {
      list[localIdx].orden = i;
    }

    // Actualizar Supabase
    if (supa && !s.id.startsWith('srv-')) {
      supa.from('servicios_agenda').update({ orden: i }).eq('id', s.id).catch(() => {});
    }
  }

  setLocalServices(list);
  notifyServiciosChange();
};

// =========================================================================
// ACTUALIZAR ASIGNACIÓN DIRECTA DE OPERARIO DESDE LA TABLA
// =========================================================================
export const updateServicioOperario = async (servicioId: string, operarioId: string, operarioNombre: string): Promise<void> => {
  const supa = getMainSupabase();
  const opIds = operarioId ? [operarioId] : [];

  if (supa && !servicioId.startsWith('srv-')) {
    try {
      await supa.from('servicios_agenda').update({
        operario_id: operarioId || null,
        operario_ids: opIds
      }).eq('id', servicioId);
    } catch (e) {}
  }

  const list = getLocalServices();
  const item = list.find(s => s.id === servicioId);
  if (item) {
    item.operario_id = operarioId || undefined;
    item.operario_ids = opIds;
    setLocalServices(list);
  }
  notifyServiciosChange();
};

// =========================================================================
// ACTUALIZAR MOVILIDAD (TAXI 1, VAN, ETC.) DIRECTAMENTE
// =========================================================================
export const updateServicioMovilidad = async (servicioId: string, vanNombre: string): Promise<void> => {
  const esTaxi = vanNombre.toUpperCase().includes('TAXI');
  const supa = getMainSupabase();

  if (supa && !servicioId.startsWith('srv-')) {
    try {
      await supa.from('servicios_agenda').update({
        van_nombre: vanNombre,
        es_taxi: esTaxi
      }).eq('id', servicioId);
    } catch (e) {}
  }

  const list = getLocalServices();
  const item = list.find(s => s.id === servicioId);
  if (item) {
    item.van_nombre = vanNombre;
    item.es_taxi = esTaxi;
    setLocalServices(list);
  }
  notifyServiciosChange();
};

// =========================================================================
// AGREGAR COBRO EXTRA (+ EXTRA) DIRECTAMENTE
// =========================================================================
export const updateServicioMontoExtra = async (servicioId: string, nuevoExtra: number): Promise<void> => {
  const supa = getMainSupabase();

  if (supa && !servicioId.startsWith('srv-')) {
    try {
      await supa.from('servicios_agenda').update({
        monto_extra: nuevoExtra
      }).eq('id', servicioId);
    } catch (e) {}
  }

  const list = getLocalServices();
  const item = list.find(s => s.id === servicioId);
  if (item) {
    item.monto_extra = nuevoExtra;
    setLocalServices(list);
  }
  notifyServiciosChange();
};

// =========================================================================
// ACTUALIZAR ESTADO / ASIGNACIÓN / VEHÍCULO DE UN SERVICIO
// =========================================================================
export const updateServicio = async (
  id: string, 
  updates: Partial<ServicioAgenda>
): Promise<void> => {
  const supa = getMainSupabase();
  if (supa && !id.startsWith('srv-')) {
    try {
      await supa
        .from('servicios_agenda')
        .update(updates)
        .eq('id', id);
    } catch (e) {
      console.warn('Error actualizando servicio en Supabase:', e);
    }
  }

  const list = getLocalServices();
  const item = list.find(s => s.id === id);
  if (item) {
    Object.assign(item, updates);
    setLocalServices(list);
  }
  notifyServiciosChange();
};

export const deleteServicioRecord = async (id: string): Promise<void> => {
  const supa = getMainSupabase();
  if (supa && !id.startsWith('srv-')) {
    try {
      await supa.from('servicios_agenda').delete().eq('id', id);
    } catch (e) {
      console.warn('Error eliminando servicio en Supabase:', e);
    }
  }

  const list = getLocalServices();
  setLocalServices(list.filter(s => s.id !== id));
  notifyServiciosChange();
};

const saveClienteRecord = async (cliente: Partial<Cliente>) => {
  const supa = getMainSupabase();
  if (supa && cliente.telefono) {
    try {
      await supa
        .from('clientes')
        .upsert([{
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          distrito: cliente.distrito,
          direccion: cliente.direccion,
          empresa_id: cliente.empresa_id
        }], { onConflict: 'telefono' });
    } catch (e) {}
  }

  const raw = localStorage.getItem('splash_clientes_local');
  const clientes: Cliente[] = raw ? JSON.parse(raw) : [];
  const idx = clientes.findIndex(c => c.telefono === cliente.telefono);
  if (idx >= 0) {
    clientes[idx] = { ...clientes[idx], ...(cliente as Cliente) };
  } else {
    clientes.push({ ...(cliente as Cliente), id: `cli-${Date.now()}` });
  }
  localStorage.setItem('splash_clientes_local', JSON.stringify(clientes));
};

// =========================================================================
// SINCRONIZACIÓN EN TIEMPO REAL (PC <-> MÓVIL Y MULTIPESTAÑA)
// =========================================================================
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('sumaq_sync_channel');
  }
} catch (e) {}

export const notifyServiciosChange = () => {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'SERVICIOS_CHANGED', time: Date.now() });
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sumaq_servicios_changed', { detail: { time: Date.now() } }));

    try {
      localStorage.setItem('sumaq_last_sync_time', String(Date.now()));
    } catch (e) {}
  }

  const supa = getMainSupabase();
  if (supa) {
    try {
      const channel = supa.channel('sumaq_realtime_broadcast');
      channel.send({
        type: 'broadcast',
        event: 'servicios_changed',
        payload: { time: Date.now() }
      }).catch(() => {});
    } catch (e) {}
  }
};

export const subscribeToServiciosRealtime = (onUpdate: () => void): (() => void) => {
  const cleanups: (() => void)[] = [];

  const handleCustom = () => onUpdate();
  window.addEventListener('sumaq_servicios_changed', handleCustom);
  cleanups.push(() => window.removeEventListener('sumaq_servicios_changed', handleCustom));

  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel('sumaq_sync_channel');
      const handleBC = (ev: MessageEvent) => {
        if (ev.data?.type === 'SERVICIOS_CHANGED') {
          onUpdate();
        }
      };
      bc.addEventListener('message', handleBC);
      cleanups.push(() => {
        bc.removeEventListener('message', handleBC);
        bc.close();
      });
    } catch (e) {}
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'sumaq_last_sync_time' || e.key === 'splash_servicios_local') {
      onUpdate();
    }
  };
  window.addEventListener('storage', handleStorage);
  cleanups.push(() => window.removeEventListener('storage', handleStorage));

  const handleFocus = () => onUpdate();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      onUpdate();
    }
  };
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);
  cleanups.push(() => window.removeEventListener('focus', handleFocus));
  cleanups.push(() => document.removeEventListener('visibilitychange', handleVisibility));

  const intervalId = setInterval(() => {
    if (document.visibilityState === 'visible') {
      onUpdate();
    }
  }, 6000);
  cleanups.push(() => clearInterval(intervalId));

  const supa = getMainSupabase();
  if (supa) {
    try {
      const channelId = `agenda_live_${Math.random().toString(36).substring(7)}`;
      const channel = supa.channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'servicios_agenda' },
          () => onUpdate()
        )
        .on(
          'broadcast',
          { event: 'servicios_changed' },
          () => onUpdate()
        )
        .subscribe();

      cleanups.push(() => {
        try {
          supa.removeChannel(channel);
        } catch (e) {}
      });
    } catch (err) {}
  }

  return () => {
    cleanups.forEach(fn => {
      try { fn(); } catch (e) {}
    });
  };
};
