import * as XLSX from 'xlsx';
import { ServicioAgenda } from '../../types';
import { formatearFechaEspanol } from '../../utils/whatsapp';

export const exportarAgendaExcel = (servicios: ServicioAgenda[], fechaStr: string) => {
  const fechaBonita = formatearFechaEspanol(fechaStr) || fechaStr;
  const titulo = `Agenda del Día — ${fechaBonita}`;

  const manana = servicios.filter(s => s.horario === 'Mañana');
  const tarde = servicios.filter(s => s.horario === 'Tarde');
  const extras = servicios.filter(s => s.horario === 'Extras');

  const maxRows = Math.max(manana.length, tarde.length, extras.length, 1);

  // Fila 1: Título Principal
  const filaTitulo = [titulo];
  for (let c = 1; c < 23; c++) filaTitulo.push('');

  // Fila 2: Cabeceras de Turno
  const filaTurnos = [
    '', '', 
    'MAÑANA', '', '', '', '', '', '', 
    'TARDE', '', '', '', '', '', '', 
    'EXTRAS', '', '', '', '', '', ''
  ];

  // Fila 3: Columnas Detalladas
  const filaColumnas = [
    'MOVILIDAD', 'OPERARIO',
    'Cliente', 'Teléfono', 'Distrito', 'Monto (S/)', 'Extra (S/)', 'Método Pago', 'Ingreso Total',
    'Cliente', 'Teléfono', 'Distrito', 'Monto (S/)', 'Extra (S/)', 'Método Pago', 'Ingreso Total',
    'Cliente', 'Teléfono', 'Distrito', 'Monto (S/)', 'Extra (S/)', 'Método Pago', 'Ingreso Total'
  ];

  const aoa: any[][] = [filaTitulo, filaTurnos, filaColumnas];

  for (let i = 0; i < maxRows; i++) {
    const sM = manana[i];
    const sT = tarde[i];
    const sE = extras[i];

    const anyS = sM || sT || sE;
    const movilidad = anyS?.van_nombre || (anyS?.es_taxi ? 'TAXI 1' : 'Sin movilidad');
    const operarioNombre = anyS?.operarios && anyS.operarios.length > 0
      ? anyS.operarios.map(o => o.nombres || o.nombre_completo).join(', ')
      : 'Sin asignar';

    const row = [
      movilidad,
      operarioNombre,

      // MAÑANA
      sM ? sM.cliente_nombre : '',
      sM ? sM.telefono : '',
      sM ? sM.distrito : '',
      sM ? Number(sM.precio_final) || 0 : '',
      sM && sM.monto_extra ? Number(sM.monto_extra) : '',
      sM ? sM.metodo_pago : '',
      sM ? (Number(sM.precio_final) || 0) + (Number(sM.monto_extra) || 0) : '',

      // TARDE
      sT ? sT.cliente_nombre : '',
      sT ? sT.telefono : '',
      sT ? sT.distrito : '',
      sT ? Number(sT.precio_final) || 0 : '',
      sT && sT.monto_extra ? Number(sT.monto_extra) : '',
      sT ? sT.metodo_pago : '',
      sT ? (Number(sT.precio_final) || 0) + (Number(sT.monto_extra) || 0) : '',

      // EXTRAS
      sE ? sE.cliente_nombre : '',
      sE ? sE.telefono : '',
      sE ? sE.distrito : '',
      sE ? Number(sE.precio_final) || 0 : '',
      sE && sE.monto_extra ? Number(sE.monto_extra) : '',
      sE ? sE.metodo_pago : '',
      sE ? (Number(sE.precio_final) || 0) + (Number(sE.monto_extra) || 0) : ''
    ];

    aoa.push(row);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Anchos de columna
  worksheet['!cols'] = [
    { wch: 14 }, // MOVILIDAD
    { wch: 28 }, // OPERARIO
    // MAÑANA
    { wch: 22 }, { wch: 12 }, { wch: 18 }, { wch: 11 }, { wch: 10 }, { wch: 14 }, { wch: 12 },
    // TARDE
    { wch: 22 }, { wch: 12 }, { wch: 18 }, { wch: 11 }, { wch: 10 }, { wch: 14 }, { wch: 12 },
    // EXTRAS
    { wch: 22 }, { wch: 12 }, { wch: 18 }, { wch: 11 }, { wch: 10 }, { wch: 14 }, { wch: 12 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Agenda');

  const cleanDate = fechaStr.replace(/-/g, '');
  XLSX.writeFile(workbook, `SUMAQ_Agenda_${cleanDate}.xlsx`);
};
