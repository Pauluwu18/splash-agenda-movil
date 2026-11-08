import { Operario } from '../../types';
import { getOperatorsSupabase } from './client';

const DEFAULT_OPERARIOS: Operario[] = [];

const MOCK_IDS = [
  '65ce6eb7-31fe-4821-886f-6a05a962015a',
  '21caba2d-f700-4268-bffa-c7a5b3ea15e9',
  'b7d22305-0d97-40a8-b3ff-6d4c78ec62db',
  'cbf6fe50-6902-4c40-8edf-bfbb9358adeb'
];

interface OperarioMetadata {
  dni?: string;
  nombres?: string;
  apellidos?: string;
  sueldo?: number;
  enCapacitacion?: boolean;
  sucursal?: string;
}

const getStoredMeta = (idOrPhone: string): OperarioMetadata | null => {
  try {
    const raw = localStorage.getItem('sumaq_operators_meta');
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[idOrPhone] || null;
  } catch {
    return null;
  }
};

const saveStoredMeta = (id: string, phone: string, meta: OperarioMetadata) => {
  try {
    const raw = localStorage.getItem('sumaq_operators_meta');
    const map = raw ? JSON.parse(raw) : {};
    if (id) map[id] = meta;
    if (phone) map[phone] = meta;
    localStorage.setItem('sumaq_operators_meta', JSON.stringify(map));
  } catch {}
};

// Codificación de metadatos en la columna 'cargo' de Supabase (DNI, sueldo, capacitación, sucursal, apellidos)
export const encodeOperarioCargo = (
  rol: string = 'Operario',
  meta: {
    dni?: string;
    sueldo?: number;
    enCapacitacion?: boolean;
    sucursal?: string;
    apellidos?: string;
    nombres?: string;
  } = {}
): string => {
  const cleanRol = (rol || 'Operario').replace(/\[[^\]]+\]/g, '').trim() || 'Operario';
  const tags: string[] = [];
  if (meta.dni && meta.dni.trim()) tags.push(`[DNI:${meta.dni.trim()}]`);
  if (meta.sueldo !== undefined && !isNaN(meta.sueldo)) tags.push(`[SUE:${meta.sueldo}]`);
  if (meta.enCapacitacion) tags.push(`[CAP:1]`);
  if (meta.sucursal && meta.sucursal.trim()) tags.push(`[SUC:${meta.sucursal.trim()}]`);
  if (meta.apellidos && meta.apellidos.trim()) tags.push(`[APE:${meta.apellidos.trim()}]`);
  if (meta.nombres && meta.nombres.trim()) tags.push(`[NOM:${meta.nombres.trim()}]`);

  return tags.length > 0 ? `${cleanRol} ${tags.join('')}` : cleanRol;
};

export const decodeOperarioCargo = (cargo: string = '', nombreCompleto: string = '') => {
  const rawCargo = cargo || '';
  const dniMatch = rawCargo.match(/\[DNI:([^\]]+)\]/);
  const sueMatch = rawCargo.match(/\[SUE:([^\]]+)\]/);
  const capMatch = rawCargo.match(/\[CAP:([^\]]+)\]/);
  const sucMatch = rawCargo.match(/\[SUC:([^\]]+)\]/);
  const apeMatch = rawCargo.match(/\[APE:([^\]]+)\]/);
  const nomMatch = rawCargo.match(/\[NOM:([^\]]+)\]/);

  const cleanRol = rawCargo.replace(/\[[^\]]+\]/g, '').trim() || 'Operario';
  const dni = dniMatch ? dniMatch[1].trim() : '';
  const sueldo = sueMatch ? Number(sueMatch[1]) : 25;
  const enCapacitacion = capMatch ? capMatch[1] === '1' : false;
  const sucursal = sucMatch ? sucMatch[1].trim() : 'Santa Anita';

  let apellidos = apeMatch ? apeMatch[1].trim() : '';
  let nombres = nomMatch ? nomMatch[1].trim() : '';

  if (!nombres && !apellidos) {
    const rawClean = (nombreCompleto || '').trim();
    const parts = rawClean.split(' ');
    nombres = parts[0] || '';
    apellidos = parts.slice(1).join(' ') || '';
  } else if (!nombres && apellidos) {
    nombres = (nombreCompleto || '').replace(apellidos, '').trim();
  }

  return {
    rol: cleanRol,
    dni,
    sueldo,
    enCapacitacion,
    sucursal,
    nombres,
    apellidos
  };
};

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
          const decoded = decodeOperarioCargo(d.cargo, rawName);
          const cached = getStoredMeta(d.id) || getStoredMeta(d.telefono) || {};

          const dni = decoded.dni || cached.dni || d.dni || '';
          const sueldo = decoded.sueldo !== 25 ? decoded.sueldo : (cached.sueldo ?? 25);
          const enCapacitacion = decoded.enCapacitacion || Boolean(cached.enCapacitacion);
          const sucursal = decoded.sucursal !== 'Santa Anita' ? decoded.sucursal : (cached.sucursal || 'Santa Anita');
          const nombres = decoded.nombres || cached.nombres || d.nombres || rawName.split(' ')[0] || '';
          const apellidos = decoded.apellidos || cached.apellidos || d.apellidos || rawName.split(' ').slice(1).join(' ') || '';

          // Persistir en cache local para acceso rápido
          saveStoredMeta(d.id, d.telefono, {
            dni,
            nombres,
            apellidos,
            sueldo,
            enCapacitacion,
            sucursal
          });

          return {
            id: d.id,
            dni,
            nombres,
            apellidos,
            nombre_completo: rawName || `${nombres} ${apellidos}`.trim(),
            telefono: d.telefono || '',
            rol: decoded.rol || 'Operario',
            sucursal,
            estado: d.activo ? 'ACTIVO' : 'INACTIVO',
            sueldo_por_servicio: sueldo,
            en_capacitacion: enCapacitacion,
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
  const nombres = (operario.nombres || '').trim();
  const apellidos = (operario.apellidos || '').trim();
  const nombreCompleto = (
    operario.nombre_completo || 
    `${nombres} ${apellidos}`
  ).trim();

  const dni = (operario.dni || '').trim();
  const sueldo = operario.sueldo_por_servicio !== undefined ? Number(operario.sueldo_por_servicio) : 25;
  const enCap = Boolean(operario.en_capacitacion);
  const sucursal = operario.sucursal || 'Santa Anita';
  const rol = operario.rol || 'Operario';
  const telefono = (operario.telefono || '').trim();
  const color = operario.color || '#00CED1';
  const estado = operario.estado !== 'INACTIVO' ? 'ACTIVO' : 'INACTIVO';

  // Codificar metadatos en cargo para persistir 100% en Supabase sin pérdida
  const cargoEncoded = encodeOperarioCargo(rol, {
    dni,
    sueldo,
    enCapacitacion: enCap,
    sucursal,
    apellidos,
    nombres
  });

  const dbPayload = {
    nombre: nombreCompleto,
    telefono,
    cargo: cargoEncoded,
    color,
    activo: estado === 'ACTIVO'
  };

  let savedOperario: Operario = {
    id: operario.id || `op-${Date.now()}`,
    dni,
    nombres,
    apellidos,
    nombre_completo: nombreCompleto,
    telefono,
    rol,
    sucursal,
    estado,
    sueldo_por_servicio: sueldo,
    en_capacitacion: enCap,
    color
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
          savedOperario.id = data.id;
        } else if (error) {
          console.warn('Error al actualizar operario en Supabase:', error);
        }
      } else {
        const { data, error } = await supa
          .from('operarios')
          .insert([dbPayload])
          .select()
          .single();
        if (!error && data) {
          savedOperario.id = data.id;
        } else if (error) {
          console.warn('Error al insertar operario en Supabase:', error);
        }
      }
    } catch (e) {
      console.warn('Error guardando operario en Supabase:', e);
    }
  }

  // Guardar en cache de metadatos
  saveStoredMeta(savedOperario.id, savedOperario.telefono || '', {
    dni,
    nombres,
    apellidos,
    sueldo,
    enCapacitacion: enCap,
    sucursal
  });

  // Actualizar lista local
  const list = getLocalOperators();
  const idx = list.findIndex(o => o.id === savedOperario.id || (o.telefono && o.telefono === savedOperario.telefono));
  if (idx >= 0) {
    list[idx] = savedOperario;
  } else {
    list.push(savedOperario);
  }
  setLocalOperators(list);

  return savedOperario;
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
