import { Operario } from '../../types';
import { getOperatorsSupabase, isOperatorsSupabaseConfigured } from './client';

const DEFAULT_OPERARIOS: Operario[] = [];

const MOCK_IDS = [
  '65ce6eb7-31fe-4821-886f-6a05a962015a',
  '21caba2d-f700-4268-bffa-c7a5b3ea15e9',
  'b7d22305-0d97-40a8-b3ff-6d4c78ec62db',
  'cbf6fe50-6902-4c40-8edf-bfbb9358adeb'
];

const getLocalOperators = (): Operario[] => {
  try {
    const raw = localStorage.getItem('sumaq_operators_local');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((op: any) => !MOCK_IDS.includes(op.id));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('sumaq_operators_local', JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
    return DEFAULT_OPERARIOS;
  } catch {
    return DEFAULT_OPERARIOS;
  }
};

const setLocalOperators = (list: Operario[]) => {
  localStorage.setItem('sumaq_operators_local', JSON.stringify(list));
};

export const fetchOperarios = async (): Promise<Operario[]> => {
  const supa = getOperatorsSupabase();
  if (supa) {
    try {
      const { data, error } = await supa
        .from('operarios')
        .select('*')
        .order('nombre', { ascending: true });

      if (!error && data) {
        const mapped: Operario[] = data.map((d: any) => {
          const rawName = (d.nombre || '').trim();
          const parts = rawName.split(' ');
          const nombres = d.nombres || parts[0] || '';
          const apellidos = d.apellidos || parts.slice(1).join(' ') || '';

          return {
            id: d.id,
            dni: d.dni || '',
            nombres,
            apellidos,
            nombre_completo: rawName || `${nombres} ${apellidos}`.trim(),
            telefono: d.telefono || '',
            rol: d.cargo || d.rol || 'Operario',
            sucursal: d.sucursal || 'Santa Anita',
            estado: d.activo ? 'ACTIVO' : 'INACTIVO',
            sueldo_por_servicio: Number(d.sueldo_por_servicio) || 25,
            en_capacitacion: Boolean(d.en_capacitacion),
            color: d.color || '#00CED1'
          };
        });

        setLocalOperators(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Error cargando operarios de Supabase, usando local:', e);
    }
  }

  return getLocalOperators();
};

export const fetchOperariosActivos = async (): Promise<Operario[]> => {
  const list = await fetchOperarios();
  return list.filter(o => o.estado === 'ACTIVO');
};

export const saveOperario = async (operario: Partial<Operario>): Promise<Operario> => {
  const supa = getOperatorsSupabase();
  const nombreCompleto = (
    operario.nombre_completo || 
    `${operario.nombres || ''} ${operario.apellidos || ''}`
  ).trim();

  // Columnas exactas de la tabla operarios en Supabase
  const dbPayload = {
    nombre: nombreCompleto,
    telefono: operario.telefono || '',
    cargo: operario.rol || 'Operario',
    color: operario.color || '#00CED1',
    activo: operario.estado !== 'INACTIVO'
  };

  if (supa) {
    try {
      if (operario.id && !operario.id.startsWith('op-')) {
        const { data, error } = await supa
          .from('operarios')
          .update(dbPayload)
          .eq('id', operario.id)
          .select()
          .single();
        if (!error && data) {
          await fetchOperarios();
          return {
            id: data.id,
            dni: operario.dni || '',
            nombres: operario.nombres || '',
            apellidos: operario.apellidos || '',
            nombre_completo: data.nombre,
            telefono: data.telefono,
            rol: data.cargo,
            sucursal: 'Santa Anita',
            estado: data.activo ? 'ACTIVO' : 'INACTIVO',
            sueldo_por_servicio: operario.sueldo_por_servicio || 25,
            en_capacitacion: false,
            color: data.color
          };
        }
      } else {
        const { data, error } = await supa
          .from('operarios')
          .insert([dbPayload])
          .select()
          .single();
        if (!error && data) {
          await fetchOperarios();
          return {
            id: data.id,
            dni: operario.dni || '',
            nombres: operario.nombres || '',
            apellidos: operario.apellidos || '',
            nombre_completo: data.nombre,
            telefono: data.telefono,
            rol: data.cargo,
            sucursal: 'Santa Anita',
            estado: data.activo ? 'ACTIVO' : 'INACTIVO',
            sueldo_por_servicio: operario.sueldo_por_servicio || 25,
            en_capacitacion: false,
            color: data.color
          };
        }
      }
    } catch (e) {
      console.warn('Error guardando operario en Supabase:', e);
    }
  }

  // Fallback Local
  const list = getLocalOperators();
  let saved: Operario;
  if (operario.id) {
    const idx = list.findIndex(o => o.id === operario.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...(operario as Operario) };
      saved = list[idx];
    } else {
      saved = { ...(operario as Operario), id: operario.id };
      list.push(saved);
    }
  } else {
    saved = {
      id: `op-${Date.now()}`,
      nombres: operario.nombres || '',
      apellidos: operario.apellidos || '',
      nombre_completo: nombreCompleto,
      telefono: operario.telefono || '',
      rol: operario.rol || 'Operario',
      sucursal: operario.sucursal || 'Santa Anita',
      estado: operario.estado || 'ACTIVO',
      sueldo_por_servicio: operario.sueldo_por_servicio || 25,
      en_capacitacion: Boolean(operario.en_capacitacion),
      color: operario.color || '#00CED1'
    };
    list.push(saved);
  }
  setLocalOperators(list);
  return saved;
};

export const saveOperarioToSupabase = saveOperario;

export const deleteOperario = async (id: string): Promise<void> => {
  const supa = getOperatorsSupabase();
  if (supa && !id.startsWith('op-')) {
    try {
      await supa.from('operarios').delete().eq('id', id);
    } catch (e) {
      console.warn('Error eliminando operario en Supabase:', e);
    }
  }

  const list = getLocalOperators();
  const filtered = list.filter(o => o.id !== id);
  setLocalOperators(filtered);
};
