import { Operario } from '../../types';
import { getOperatorsSupabase, isOperatorsSupabaseConfigured } from './client';

const DEFAULT_OPERARIOS: Operario[] = [
  {
    id: 'op-001',
    dni: '71234567',
    nombres: 'Yerson Robiño',
    apellidos: 'Alvarado Campos',
    nombre_completo: 'Yerson Robiño Alvarado Campos',
    telefono: '987111222',
    rol: 'Líder',
    sucursal: 'Las Flores',
    estado: 'ACTIVO',
    sueldo_por_servicio: 35.0,
    en_capacitacion: false,
    color: '#00CED1'
  },
  {
    id: 'op-002',
    dni: '72345678',
    nombres: 'Fabrizio Antony',
    apellidos: 'Cruz Martinez',
    nombre_completo: 'Fabrizio Antony Cruz Martinez',
    telefono: '987333444',
    rol: 'Operario',
    sucursal: 'Las Flores',
    estado: 'ACTIVO',
    sueldo_por_servicio: 25.0,
    en_capacitacion: false,
    color: '#0d9488'
  },
  {
    id: 'op-003',
    dni: '73456789',
    nombres: 'Jorge Stephano',
    apellidos: 'Loayza Carlos',
    nombre_completo: 'Jorge Stephano Loayza Carlos',
    telefono: '987555666',
    rol: 'Operario',
    sucursal: 'Las Flores',
    estado: 'ACTIVO',
    sueldo_por_servicio: 25.0,
    en_capacitacion: false,
    color: '#f59e0b'
  },
  {
    id: 'op-004',
    dni: '74567890',
    nombres: 'Lionel Matías',
    apellidos: 'Rojas Picon',
    nombre_completo: 'Lionel Matías Rojas Picon',
    telefono: '987777888',
    rol: 'Técnico',
    sucursal: 'Las Flores',
    estado: 'ACTIVO',
    sueldo_por_servicio: 30.0,
    en_capacitacion: false,
    color: '#8b5cf6'
  },
  {
    id: 'op-005',
    dni: '75678901',
    nombres: 'Carlos',
    apellidos: 'Mendoza Ruiz',
    nombre_completo: 'Carlos Mendoza Ruiz',
    telefono: '987999000',
    rol: 'Líder',
    sucursal: 'Las Flores',
    estado: 'ACTIVO',
    sueldo_por_servicio: 35.0,
    en_capacitacion: false,
    color: '#0284c7'
  }
];

const getLocalOperators = (): Operario[] => {
  try {
    const raw = localStorage.getItem('splash_operators_local');
    return raw ? JSON.parse(raw) : DEFAULT_OPERARIOS;
  } catch {
    return DEFAULT_OPERARIOS;
  }
};

const setLocalOperators = (list: Operario[]) => {
  localStorage.setItem('splash_operators_local', JSON.stringify(list));
};

export const fetchOperarios = async (): Promise<Operario[]> => {
  const supa = getOperatorsSupabase();
  if (supa) {
    try {
      const { data, error } = await supa
        .from('operarios')
        .select('*')
        .order('nombres', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          dni: d.dni || '',
          nombres: d.nombres || d.nombre || '',
          apellidos: d.apellidos || '',
          nombre_completo: `${d.nombres || d.nombre || ''} ${d.apellidos || ''}`.trim(),
          telefono: d.telefono || '',
          rol: d.cargo || d.rol || 'Operario',
          sucursal: d.sucursal || 'Las Flores',
          estado: d.estado || (d.activo ? 'ACTIVO' : 'INACTIVO'),
          sueldo_por_servicio: Number(d.sueldo_por_servicio) || 0,
          en_capacitacion: Boolean(d.en_capacitacion),
          color: d.color || '#00CED1'
        }));
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
  const dbPayload = {
    dni: operario.dni || '',
    nombres: operario.nombres || '',
    apellidos: operario.apellidos || '',
    nombre: `${operario.nombres || ''} ${operario.apellidos || ''}`.trim(),
    telefono: operario.telefono || '',
    cargo: operario.rol || 'Operario',
    rol: operario.rol || 'Operario',
    sucursal: operario.sucursal || 'Las Flores',
    estado: operario.estado || 'ACTIVO',
    sueldo_por_servicio: Number(operario.sueldo_por_servicio) || 0,
    en_capacitacion: Boolean(operario.en_capacitacion),
    color: operario.color || '#00CED1'
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
        if (!error && data) return data;
      } else {
        const { data, error } = await supa
          .from('operarios')
          .insert([dbPayload])
          .select()
          .single();
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('Error guardando operario en 2do Supabase, guardando local:', e);
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
      nombre_completo: `${operario.nombres || ''} ${operario.apellidos || ''}`.trim(),
      telefono: operario.telefono || '',
      rol: operario.rol || 'Operario',
      sucursal: operario.sucursal || 'Las Flores',
      estado: operario.estado || 'ACTIVO',
      sueldo_por_servicio: operario.sueldo_por_servicio || 0,
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
