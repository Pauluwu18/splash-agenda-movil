import * as XLSX from 'xlsx';
import { ServicioAgenda } from '../../types';

export const exportarAgendaExcel = (servicios: ServicioAgenda[], fechaStr: string) => {
  const filas = servicios.map(s => {
    const operariosStr = s.operarios && s.operarios.length > 0
      ? s.operarios.map(o => o.nombres || o.nombre_completo).join(', ')
      : 'Sin asignar';

    const movilidad = s.van_nombre 
      ? s.van_nombre 
      : (s.es_taxi ? 'TAXI' : 'Sin movilidad');

    return {
      'Movilidad': movilidad,
      'Turno': s.horario,
      'Hora Estimada': s.hora_estimada || '',
      'Operario(s)': operariosStr,
      'Cliente': s.cliente_nombre,
      'Teléfono': s.telefono,
      'Distrito': s.distrito,
      'Dirección': s.direccion,
      'Servicio': s.servicio_detalle,
      'Precio (S/)': Number(s.precio_final) || 0,
      'Extra (S/)': Number(s.monto_extra) || 0,
      'Total (S/)': (Number(s.precio_final) || 0) + (Number(s.monto_extra) || 0),
      'Método Pago': s.metodo_pago,
      'Estado': s.estado,
      'Notas': s.comentarios || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(filas);
  
  // Ajuste de ancho de columnas
  worksheet['!cols'] = [
    { wch: 15 }, // Movilidad
    { wch: 10 }, // Turno
    { wch: 12 }, // Hora
    { wch: 20 }, // Operarios
    { wch: 22 }, // Cliente
    { wch: 12 }, // Teléfono
    { wch: 15 }, // Distrito
    { wch: 28 }, // Dirección
    { wch: 30 }, // Servicio
    { wch: 12 }, // Precio
    { wch: 10 }, // Extra
    { wch: 12 }, // Total
    { wch: 14 }, // Pago
    { wch: 12 }, // Estado
    { wch: 25 }  // Notas
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Agenda');

  const cleanDate = fechaStr.replace(/-/g, '');
  XLSX.writeFile(workbook, `SPLASH_Agenda_${cleanDate}.xlsx`);
};

