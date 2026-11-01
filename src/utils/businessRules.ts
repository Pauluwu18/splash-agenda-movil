import { TurnoHorario } from '../types';

export const HORAS_POR_TURNO: Record<TurnoHorario, string[]> = {
  Mañana: [
    '8:00am - 9:00am Aprox',
    '8:30am - 9:30am Aprox',
    '9:00am - 10:00am Aprox',
    '9:30am - 10:30am Aprox',
    '10:00am - 11:00am Aprox',
    '10:30am - 11:30am Aprox',
    '11:00am - 12:00pm Aprox',
    '11:30am - 12:30pm Aprox',
    '12:00pm - 1:00pm Aprox'
  ],
  Tarde: [
    '1:00pm - 2:00pm Aprox',
    '1:30pm - 2:30pm Aprox',
    '2:00pm - 3:00pm Aprox',
    '2:30pm - 3:30pm Aprox',
    '3:00pm - 4:00pm Aprox',
    '3:30pm - 4:30pm Aprox',
    '4:00pm - 5:00pm Aprox',
    '4:30pm - 5:30pm Aprox',
    '5:00pm - 6:00pm Aprox'
  ],
  Extras: [
    '5:30pm - 6:30pm Aprox',
    '6:00pm - 7:00pm Aprox',
    '6:30pm - 7:30pm Aprox',
    '7:00pm - 8:00pm Aprox',
    '7:30pm - 8:30pm Aprox',
    '8:00pm - 9:00pm Aprox'
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

