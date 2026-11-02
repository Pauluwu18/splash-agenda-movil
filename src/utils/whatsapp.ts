import { ServicioAgenda } from '../types';

/**
 * Formatea una fecha YYYY-MM-DD al formato exacto de SUMAQ:
 * Ej: "2026-11-01" -> "Domingo 1 noviembre"
 */
export const formatearFechaEspanol = (fechaStr: string): string => {
  if (!fechaStr) return '';
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return fechaStr;
  const year = parseInt(partes[0], 10);
  const month = parseInt(partes[1], 10) - 1;
  const day = parseInt(partes[2], 10);
  const d = new Date(year, month, day);

  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const diaSemana = dias[d.getDay()] || '';
  const mesNombre = meses[d.getMonth()] || '';
  return `${diaSemana} ${day} ${mesNombre}`;
};

/**
 * Formatea un número de soles sin decimales innecesarios:
 * Ej: 140 -> "S/140", 140.5 -> "S/140.50"
 */
export const formatearPrecioLimpio = (monto: number): string => {
  const num = Number(monto) || 0;
  return num % 1 === 0 ? `S/${num.toFixed(0)}` : `S/${num.toFixed(2)}`;
};

/**
 * Genera la plantilla exacta oficial de SUMAQ para enviar al operario:
 * 
 * Fecha 📆: Domingo 1 noviembre
 * Hora de llegada⌚: 1:30pm - 2:30pm Aprox 
 * Nombre 📛: Alexandra Roulet Origgi
 * Teléfono📱: 987768805 / 912345678 (si hay número opcional)
 * Dirección 🧭: Clemente X 110 dpto.502 (Magdalena del Mar) 
 * (Solo se incluye link si fue agendado explícitamente)
 * Servicio 🧽: 6 sillas + 6 sillas + butaca 
 * Precio 🏷️: S/140
 * Método de pago: Yape o Plin
 */
export const generarOrdenWhatsAppOperario = (svc: ServicioAgenda): string => {
  const fechaStr = formatearFechaEspanol(svc.fecha);
  const horaStr = svc.hora_estimada || svc.horario || 'Por coordinar';

  // Dirección con distrito entre paréntesis
  let direccionCompleta = svc.direccion;
  if (svc.distrito && !svc.direccion.toLowerCase().includes(svc.distrito.toLowerCase())) {
    direccionCompleta = `${svc.direccion} (${svc.distrito})`;
  }
  if (svc.referencia && svc.referencia.trim()) {
    direccionCompleta += ` (Ref: ${svc.referencia.trim()})`;
  }

  // Teléfono principal y teléfono secundario opcional
  const telefonoTexto = (svc.telefono_secundario && svc.telefono_secundario.trim())
    ? `${svc.telefono} / ${svc.telefono_secundario.trim()}`
    : svc.telefono;

  // Servicio detalle: si tiene items los une con " + "
  let servicioTexto = svc.servicio_detalle;
  if (svc.items && svc.items.length > 0) {
    const itemsNombres = svc.items
      .map(it => {
        if (it.valor_editable && it.tipo_medida && it.tipo_medida !== 'unidad' && it.tipo_medida !== 'cantidad') {
          return `${it.valor_editable} ${it.subcategoria_nombre}`;
        }
        return it.subcategoria_nombre;
      })
      .filter(Boolean);
    if (itemsNombres.length > 0) {
      servicioTexto = itemsNombres.join(' + ');
    }
  }

  // Formateo de precio con posible descuento tachado
  const precioFinalStr = formatearPrecioLimpio(svc.precio_final);
  let precioTexto = precioFinalStr;
  if (svc.descuento && svc.descuento > 0) {
    const subtotal = (Number(svc.precio_final) || 0) + Number(svc.descuento);
    precioTexto = `~${formatearPrecioLimpio(subtotal)}~ ${precioFinalStr}`;
  }

  // Método de pago (Yape / Plin -> Yape o Plin)
  let metodoPago = svc.metodo_pago;
  if (metodoPago === 'Yape / Plin') {
    metodoPago = 'Yape o Plin' as any;
  }

  const lineas = [
    `Fecha 📆: ${fechaStr}`,
    `Hora de llegada⌚: ${horaStr}`,
    `Nombre 📛: ${svc.cliente_nombre}`,
    `Teléfono📱: ${telefonoTexto}`,
    `Dirección 🧭: ${direccionCompleta}`,
  ];

  // REQUISITO: Que NO se genere un link de dirección si no hay uno agendado
  if (svc.link_maps && svc.link_maps.trim().startsWith('http')) {
    lineas.push(svc.link_maps.trim());
  }

  lineas.push(
    `Servicio 🧽: ${servicioTexto}`,
    `Precio 🏷️: ${precioTexto}`,
    `Método de pago: ${metodoPago}`
  );

  if (svc.comentarios && svc.comentarios.trim()) {
    lineas.push(`Observaciones 📝: ${svc.comentarios.trim()}`);
  }

  return lineas.join('\n');
};

/**
 * Plantilla de confirmación para el cliente
 */
export const generarMensajeWhatsAppCliente = (svc: ServicioAgenda): string => {
  return generarOrdenWhatsAppOperario(svc);
};

export const abrirWhatsApp = (telefono: string, mensaje: string) => {
  const clean = telefono.replace(/\D/g, '');
  const fullNumber = clean.length === 9 ? `51${clean}` : clean;
  const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
};
