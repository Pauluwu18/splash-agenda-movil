import { createClient } from '@supabase/supabase-js';

// Intentar leer de variables de entorno o de localStorage
const getSavedConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('app_agenda_supa_url');
  const localKey = localStorage.getItem('app_agenda_supa_key');

  const url = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : (localUrl ? localUrl.trim() : '');
  const key = (envKey && envKey.trim() !== '') ? envKey.trim() : (localKey ? localKey.trim() : '');

  return { url, key };
};

let supabaseClient = null;

export const initSupabase = (customUrl, customKey) => {
  const url = customUrl || getSavedConfig().url;
  const key = customKey || getSavedConfig().key;

  if (url && key && url.startsWith('http')) {
    try {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (err) {
      console.warn('Error inicializando Supabase Client:', err);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
  return null;
};

// Inicializar por defecto
initSupabase();

export const isSupabaseConfigured = () => {
  return supabaseClient !== null;
};

export const saveSupabaseCredentials = (url, key) => {
  if (url) localStorage.setItem('app_agenda_supa_url', url.trim());
  if (key) localStorage.setItem('app_agenda_supa_key', key.trim());
  return initSupabase(url, key);
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('app_agenda_supa_url');
  localStorage.removeItem('app_agenda_supa_key');
  supabaseClient = null;
};

// =========================================================================
// MODO LOCAL / FALLBACK SEED DATA
// =========================================================================
const DEFAULT_OPERARIOS = [
  { id: 'op-1', nombre: 'Carlos Mendoza', telefono: '987111222', cargo: 'Líder', color: '#0284c7', activo: true },
  { id: 'op-2', nombre: 'Miguel Quispe', telefono: '987333444', cargo: 'Operario', color: '#0d9488', activo: true },
  { id: 'op-3', nombre: 'José Ramírez', telefono: '987555666', cargo: 'Apoyo', color: '#f59e0b', activo: true },
  { id: 'op-4', nombre: 'David Flores', telefono: '987777888', cargo: 'Técnico', color: '#8b5cf6', activo: true }
];

const getLocalData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`app_agenda_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(`app_agenda_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error guardando en localStorage:', e);
  }
};

// =========================================================================
// SERVICIO DE OPERARIOS (PERSONAS)
// =========================================================================
export const getOperarios = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseClient
        .from('operarios')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      if (!error && data) return data;
    } catch (e) {
      console.warn('Fallo Supabase operarios, usando local:', e);
    }
  }
  return getLocalData('operarios', DEFAULT_OPERARIOS).filter(o => o.activo !== false);
};

export const saveOperario = async (operario) => {
  if (isSupabaseConfigured()) {
    try {
      if (operario.id && !operario.id.startsWith('op-')) {
        const { data, error } = await supabaseClient
          .from('operarios')
          .update(operario)
          .eq('id', operario.id)
          .select()
          .single();
        if (!error && data) return data;
      } else {
        const { id, ...newOp } = operario;
        const { data, error } = await supabaseClient
          .from('operarios')
          .insert([newOp])
          .select()
          .single();
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('Fallo guardando en Supabase, guardando local:', e);
    }
  }

  const list = getLocalData('operarios', DEFAULT_OPERARIOS);
  let saved;
  if (operario.id) {
    const idx = list.findIndex(o => o.id === operario.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...operario };
      saved = list[idx];
    } else {
      saved = { ...operario, id: operario.id || `op-${Date.now()}` };
      list.push(saved);
    }
  } else {
    saved = { ...operario, id: `op-${Date.now()}`, activo: true };
    list.push(saved);
  }
  setLocalData('operarios', list);
  return saved;
};

// =========================================================================
// SERVICIO DE CLIENTES (AUTOCOMPLETADO POR TELÉFONO)
// =========================================================================
export const buscarClientePorTelefono = async (telefono) => {
  const cleanTel = telefono.replace(/\D/g, '');
  if (cleanTel.length < 5) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseClient
        .from('clientes')
        .select('*')
        .ilike('telefono', `%${cleanTel}%`)
        .limit(1);
      if (!error && data && data.length > 0) return data[0];
    } catch (e) {
      console.warn('Fallo buscando cliente en Supabase:', e);
    }
  }

  const clientes = getLocalData('clientes', []);
  return clientes.find(c => c.telefono && c.telefono.includes(cleanTel)) || null;
};

// =========================================================================
// SERVICIO DE SERVICIOS / AGENDAS
// =========================================================================
export const getServiciosPorFecha = async (fechaStr) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseClient
        .from('servicios_agenda')
        .select(`
          *,
          servicio_operarios (
            operarios (*)
          )
        `)
        .eq('fecha', fechaStr)
        .order('orden', { ascending: true })
        .order('created_at', { ascending: true });

      if (!error && data) {
        // Mapear el resultado para facilitar el consumo
        return data.map(item => ({
          ...item,
          operarios: (item.servicio_operarios || [])
            .map(so => so.operarios)
            .filter(Boolean)
        }));
      }
    } catch (e) {
      console.warn('Fallo Supabase servicios, usando local:', e);
    }
  }

  const all = getLocalData('servicios', []);
  const allOps = getLocalData('operarios', DEFAULT_OPERARIOS);
  
  return all
    .filter(s => s.fecha === fechaStr)
    .map(s => {
      const operariosAsignados = (s.operarios_ids || [])
        .map(id => allOps.find(o => o.id === id))
        .filter(Boolean);
      return { ...s, operarios: operariosAsignados };
    });
};

export const saveServicioAgenda = async (servicioData, operariosIds = []) => {
  // 1. Guardar cliente si es nuevo
  if (servicioData.telefono && servicioData.cliente_nombre) {
    saveClienteLocal({
      nombre: servicioData.cliente_nombre,
      telefono: servicioData.telefono,
      distrito: servicioData.distrito,
      direccion: servicioData.direccion
    });
  }

  if (isSupabaseConfigured()) {
    try {
      // Insertar o actualizar servicio
      const cleanData = {
        cliente_nombre: servicioData.cliente_nombre,
        telefono: servicioData.telefono,
        distrito: servicioData.distrito,
        direccion: servicioData.direccion,
        referencia: servicioData.referencia || '',
        fecha: servicioData.fecha,
        horario: servicioData.horario,
        hora_estimada: servicioData.hora_estimada || '',
        servicio_detalle: servicioData.servicio_detalle,
        precio_final: Number(servicioData.precio_final) || 0,
        monto_extra: Number(servicioData.monto_extra) || 0,
        metodo_pago: servicioData.metodo_pago || 'Efectivo',
        comentarios: servicioData.comentarios || '',
        estado: servicioData.estado || 'PENDIENTE',
        es_taxi: Boolean(servicioData.es_taxi)
      };

      let svcId = servicioData.id;
      if (svcId && !svcId.startsWith('srv-')) {
        const { error } = await supabaseClient
          .from('servicios_agenda')
          .update(cleanData)
          .eq('id', svcId);
        if (error) throw error;
      } else {
        const { data, error } = await supabaseClient
          .from('servicios_agenda')
          .insert([cleanData])
          .select()
          .single();
        if (error) throw error;
        svcId = data.id;
      }

      // Actualizar operarios asignados en tabla intermedia
      if (svcId) {
        await supabaseClient.from('servicio_operarios').delete().eq('servicio_id', svcId);
        if (operariosIds.length > 0) {
          const rows = operariosIds.map(opId => ({
            servicio_id: svcId,
            operario_id: opId
          }));
          await supabaseClient.from('servicio_operarios').insert(rows);
        }
      }

      return { ...cleanData, id: svcId, operarios_ids: operariosIds };
    } catch (e) {
      console.warn('Error guardando en Supabase, respaldando localmente:', e);
    }
  }

  // Guardado en LocalStorage
  const all = getLocalData('servicios', []);
  const newId = servicioData.id || `srv-${Date.now()}`;
  const record = {
    ...servicioData,
    id: newId,
    operarios_ids: operariosIds,
    created_at: new Date().toISOString()
  };

  const existingIdx = all.findIndex(s => s.id === newId);
  if (existingIdx >= 0) {
    all[existingIdx] = record;
  } else {
    all.push(record);
  }
  setLocalData('servicios', all);
  return record;
};

const saveClienteLocal = async (cliente) => {
  if (isSupabaseConfigured()) {
    try {
      await supabaseClient
        .from('clientes')
        .upsert([{
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          distrito: cliente.distrito,
          direccion: cliente.direccion
        }], { onConflict: 'telefono' });
    } catch (e) {
      // Silencioso
    }
  }

  const clientes = getLocalData('clientes', []);
  const idx = clientes.findIndex(c => c.telefono === cliente.telefono);
  if (idx >= 0) {
    clientes[idx] = { ...clientes[idx], ...cliente };
  } else {
    clientes.push({ ...cliente, id: `cli-${Date.now()}` });
  }
  setLocalData('clientes', clientes);
};

export const updateServicioEstado = async (id, nuevoEstado) => {
  if (isSupabaseConfigured() && !id.startsWith('srv-')) {
    try {
      await supabaseClient
        .from('servicios_agenda')
        .update({ estado: nuevoEstado })
        .eq('id', id);
    } catch (e) {
      console.warn('Error actualizando estado en Supabase:', e);
    }
  }

  const all = getLocalData('servicios', []);
  const item = all.find(s => s.id === id);
  if (item) {
    item.estado = nuevoEstado;
    setLocalData('servicios', all);
  }
};

export const deleteServicio = async (id) => {
  if (isSupabaseConfigured() && !id.startsWith('srv-')) {
    try {
      await supabaseClient.from('servicios_agenda').delete().eq('id', id);
    } catch (e) {
      console.warn('Error eliminando en Supabase:', e);
    }
  }

  const all = getLocalData('servicios', []);
  const filtered = all.filter(s => s.id !== id);
  setLocalData('servicios', filtered);
};

