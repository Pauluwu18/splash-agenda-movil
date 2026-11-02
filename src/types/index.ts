export type TurnoHorario = 'Mañana' | 'Tarde' | 'Extras';
export type EstadoServicio = 'PENDIENTE' | 'EN_CAMINO' | 'COMPLETADO' | 'CANCELADO';
export type MetodoPago = 'Efectivo' | 'Yape / Plin' | 'Transferencia' | 'Tarjeta';

export interface ItemServicio {
  id?: string;
  categoria_id?: string;
  categoria_nombre?: string;
  subcategoria_id?: string;
  subcategoria_nombre: string;
  tipo_medida?: 'cantidad' | 'm2' | 'asientos' | 'plazas' | 'piezas' | 'unidad';
  valor_editable?: number;
  precio_unitario?: number;
  precio: number;
}

export interface ServicioAgenda {
  id: string;
  cliente_id?: string;
  cliente_nombre: string;
  telefono: string;
  telefono_secundario?: string;
  empresa_id?: string;
  empresa_nombre?: string;
  empresa_color?: string;
  canal_origen_id?: string;
  canal_origen_nombre?: string;
  distrito: string;
  direccion: string;
  referencia?: string;
  link_maps?: string;
  fecha: string; // 'YYYY-MM-DD'
  horario: TurnoHorario;
  hora_estimada?: string; // ej. '09:30 AM'
  servicio_detalle: string;
  items?: ItemServicio[];
  precio_final: number;
  descuento?: number;
  monto_extra?: number;
  metodo_pago: MetodoPago;
  comentarios?: string;
  estado: EstadoServicio;
  es_taxi: boolean;
  es_rectificacion?: boolean;
  sucursal_id?: string;
  sucursal_nombre?: string;
  vehiculo_id?: string;
  van_nombre?: string;
  operario_id?: string; // Identificador estable hacia 2do Supabase
  operario_ids?: string[]; // IDs de colaboradores asignados
  operarios?: Operario[]; // Datos poblados de los colaboradores
  orden?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  telefono_secundario?: string;
  distrito?: string;
  direccion?: string;
  empresa_id?: string;
  created_at?: string;
}

export interface Empresa {
  id: string;
  nombre: string;
  color: string;
  activo?: boolean;
}

export interface CanalOrigen {
  id: string;
  nombre: string;
  icono?: string;
  activo?: boolean;
}

export interface SubcategoriaCatalogo {
  id: string;
  categoria_id: string;
  nombre: string;
  tipo_medida?: 'cantidad' | 'm2' | 'asientos' | 'plazas' | 'piezas' | 'unidad';
  precio_sugerido: number;
  descripcion?: string;
}

export interface CategoriaCatalogo {
  id: string;
  nombre: string;
  icono?: string;
  subcategorias: SubcategoriaCatalogo[];
}

export interface Operario {
  id: string; // UUID estable
  dni?: string;
  nombres: string;
  apellidos?: string;
  nombre_completo?: string;
  telefono?: string;
  rol?: string; // 'Operario' | 'Líder' | 'Técnico' | 'Apoyo' | 'Conductor'
  sucursal?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  sueldo_por_servicio?: number;
  en_capacitacion?: boolean;
  color?: string;
}

export interface Vehiculo {
  id: string;
  nombre: string; // ej. 'Van 01', 'Van 02'
  placa?: string;
  sucursal_id?: string;
  sucursal_nombre?: string;
  estado: 'ACTIVO' | 'MANTENIMIENTO' | 'INACTIVO';
}

export interface Sucursal {
  id: string;
  nombre: string;
  distritos_cobertura?: string[];
}

