import { 
  ServicioAgenda, Cliente, Empresa, CanalOrigen, 
  CategoriaCatalogo, Vehiculo, TurnoHorario, EstadoServicio 
} from '../../types';
import { getMainSupabase, isMainSupabaseConfigured } from './client';
import { fetchOperarios } from '../supabase-operators/operators';

// =========================================================================
// DATOS DE CATÁLOGO Y CONFIGURACIÓN REAL DE SPLASH
// =========================================================================
export const EMPRESAS_DEFAULT: Empresa[] = [
  { id: 'emp-1', nombre: 'SPLASH Principal', color: '#00CED1', activo: true },
  { id: 'emp-2', nombre: 'SPLASH Detailing', color: '#60A5FA', activo: true },
  { id: 'emp-3', nombre: 'SPLASH Flota', color: '#FB923C', activo: true },
  { id: 'emp-4', nombre: 'SPLASH Express', color: '#4ADE80', activo: true }
];

export const CANALES_DEFAULT: CanalOrigen[] = [
  { id: 'can-1', nombre: 'WhatsApp', activo: true },
  { id: 'can-2', nombre: 'Instagram', activo: true },
  { id: 'can-3', nombre: 'Facebook', activo: true },
  { id: 'can-4', nombre: 'Llamada Directa', activo: true },
  { id: 'can-5', nombre: 'Recomendación / Referido', activo: true }
];

export const VANS_DEFAULT: Vehiculo[] = [
  { id: 'van-1', nombre: 'Van 01 (Las Flores)', placa: 'ABC-123', estado: 'ACTIVO' },
  { id: 'van-2', nombre: 'Van 02 (Surco)', placa: 'DEF-456', estado: 'ACTIVO' },
  { id: 'van-3', nombre: 'Van 03 (Miraflores)', placa: 'GHI-789', estado: 'ACTIVO' },
  { id: 'van-4', nombre: 'Van 04 (San Isidro)', placa: 'JKL-012', estado: 'ACTIVO' }
];

export const CATALOGO_DEFAULT: CategoriaCatalogo[] = [
  {
    id: 'cat-lavado',
    nombre: 'Lavado y Detallado Automotriz',
    icono: 'Car',
    subcategorias: [
      { id: 'sub-lav-auto', categoria_id: 'cat-lavado', nombre: 'Lavado Premium Auto', tipo_medida: 'unidad', precio_sugerido: 75.0 },
      { id: 'sub-lav-camioneta', categoria_id: 'cat-lavado', nombre: 'Lavado Premium Camioneta / SUV', tipo_medida: 'unidad', precio_sugerido: 95.0 },
      { id: 'sub-lav-van', categoria_id: 'cat-lavado', nombre: 'Lavado Camioneta 3 Filas / Van', tipo_medida: 'unidad', precio_sugerido: 120.0 },
      { id: 'sub-lav-motor', categoria_id: 'cat-lavado', nombre: 'Lavado de Motor al Detalle', tipo_medida: 'unidad', precio_sugerido: 60.0 },
      { id: 'sub-pulido', categoria_id: 'cat-lavado', nombre: 'Pulido y Encerado Protector', tipo_medida: 'unidad', precio_sugerido: 180.0 }
    ]
  },
  {
    id: 'cat-tapiz',
    nombre: 'Limpieza de Tapices y Muebles',
    icono: 'Sofa',
    subcategorias: [
      { id: 'sub-tap-auto', categoria_id: 'cat-tapiz', nombre: 'Lavado de Tapiz Auto Completo', tipo_medida: 'asientos', precio_sugerido: 160.0 },
      { id: 'sub-tap-suv', categoria_id: 'cat-tapiz', nombre: 'Lavado de Tapiz Camioneta Completa', tipo_medida: 'asientos', precio_sugerido: 200.0 },
      { id: 'sub-mueble-2c', categoria_id: 'cat-tapiz', nombre: 'Sofá / Mueble de 2 Cuerpos', tipo_medida: 'plazas', precio_sugerido: 120.0 },
      { id: 'sub-mueble-3c', categoria_id: 'cat-tapiz', nombre: 'Sofá / Mueble de 3 Cuerpos', tipo_medida: 'plazas', precio_sugerido: 150.0 },
      { id: 'sub-colchon-2p', categoria_id: 'cat-tapiz', nombre: 'Colchón 2 Plazas', tipo_medida: 'plazas', precio_sugerido: 110.0 },
      { id: 'sub-alfombra-m2', categoria_id: 'cat-tapiz', nombre: 'Limpieza de Alfombra', tipo_medida: 'm2', precio_sugerido: 18.0 }
    ]
  },
  {
    id: 'cat-tratamiento',
    nombre: 'Tratamientos y Especiales',
    icono: 'Sparkles',
    subcategorias: [
      { id: 'sub-cuero', categoria_id: 'cat-tratamiento', nombre: 'Hidratación y Tratamiento de Cuero', tipo_medida: 'asientos', precio_sugerido: 90.0 },
      { id: 'sub-desinfeccion', categoria_id: 'cat-tratamiento', nombre: 'Desinfección con Ozono', tipo_medida: 'unidad', precio_sugerido: 50.0 },
      { id: 'sub-faros', categoria_id: 'cat-tratamiento', nombre: 'Restauración de Faros', tipo_medida: 'piezas', precio_sugerido: 70.0 }
    ]
  }
];

export const DISTRITOS_LIMA = [
  'Santiago de Surco', 'Miraflores', 'San Isidro', 'San Borja',
  'La Molina', 'Magdalena del Mar', 'Jesús María', 'Lince',
  'Surquillo', 'Barranco', 'San Miguel', 'Pueblo Libre',
  'Chorrillos', 'Ate', 'Los Olivos', 'Independencia', 'San Juan de Miraflores',
  'Callao', 'Bellavista', 'La Perla', 'Otro'
];

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
        return data.map((item: any) => {
          // Relacionar operarios desde el segundo Supabase mediante los IDs
          const opIds: string[] = item.operario_ids || (item.operario_id ? [item.operario_id] : []);
          const operariosAsignados = allOperators.filter(o => opIds.includes(o.id));

          return {
            ...item,
            operario_ids: opIds,
            operarios: operariosAsignados,
            items: item.items || []
          };
        });
      }
    } catch (e) {
      console.warn('Fallo Supabase principal servicios, usando local:', e);
    }
  }

  // Fallback Local
  const local = getLocalServices();
  return local
    .filter(s => s.fecha === fechaStr)
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
    van_nombre: servicioData.van_nombre || '',
    empresa_id: servicioData.empresa_id || null,
    empresa_nombre: servicioData.empresa_nombre || '',
    empresa_color: servicioData.empresa_color || '#00CED1',
    canal_origen_id: servicioData.canal_origen_id || null,
    operario_id: operarioIds[0] || null,
    operario_ids: operarioIds
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
        if (!error && data) return data;
      } else {
        const { data, error } = await supa
          .from('servicios_agenda')
          .insert([payloadToSave])
          .select()
          .single();
        if (!error && data) return data;
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
  return record;
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
    } catch (e) {
      // Silencioso
    }
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
