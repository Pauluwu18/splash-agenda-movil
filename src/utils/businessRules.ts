import { TurnoHorario } from '../types';

export const HORAS_POR_TURNO: Record<TurnoHorario, string[]> = {
  Mañana: [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', 
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM'
  ],
  Tarde: [
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', 
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
  ],
  Extras: [
    '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', 
    '07:30 PM', '08:00 PM', '08:30 PM'
  ]
};

export const getMananaKey = (d = new Date()): string => {
  const m = new Date(d);
  m.setDate(m.getDate() + 1);
  return m.toISOString().split('T')[0];
};

export const getTodayKey = (d = new Date()): string => {
  return d.toISOString().split('T')[0];
};

/**
 * Regla original de SPLASH:
 * Los servicios de mañana programados después de las 18:00 de hoy
 * requieren asignación manual por sucursal.
 */
export const corteAsignacionYaPaso = (fechaSeleccionada: string, now = new Date()): boolean => {
  const mananaKey = getMananaKey(now);
  const esManana = fechaSeleccionada === mananaKey;
  const pasoLas18 = now.getHours() >= 18;
  return esManana && pasoLas18;
};

export const formatMontoSoles = (monto: number): string => {
  return Number(monto || 0).toFixed(2);
};
