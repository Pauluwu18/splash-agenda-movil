import { ServicioAgenda } from '../types';
import { formatMontoSoles } from './businessRules';

export const generarMensajeWhatsAppCliente = (svc: ServicioAgenda): string => {
  const fechaObj = new Date(svc.fecha + 'T12:00:00');
  const fechaStr = fechaObj.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const fechaCapitalizada = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);

  // Formateo de precio con tachado de descuento si existe
  const subtotal = (Number(svc.precio_final) || 0) + (Number(svc.descuento) || 0);
  let precioTexto = `S/ ${formatMontoSoles(svc.precio_final)}`;
  if (svc.descuento && svc.descuento > 0) {
    precioTexto = `~S/ ${formatMontoSoles(subtotal)}~ S/ ${formatMontoSoles(svc.precio_final)}`;
  }

  const direccionCompleta = svc.referencia 
    ? `${svc.direccion}, ${svc.distrito} (Ref: ${svc.referencia})`
    : `${svc.direccion}, ${svc.distrito}`;

  const lineas = [
    `Fecha 📅: ${fechaCapitalizada}`,
    `Hora de llegada ⏰: ${svc.hora_estimada || svc.horario}`,
    `Nombre 📇: ${svc.cliente_nombre}`,
    `Teléfono 📱: ${svc.telefono}`,
    `Dirección 🧭: ${direccionCompleta}`,
    `Servicio 🧴: ${svc.servicio_detalle}`,
    `Precio 🏷️: ${precioTexto}`,
    `Método de pago 💳: ${svc.metodo_pago}`
  ];

  if (svc.comentarios && svc.comentarios.trim()) {
    lineas.push(`Observaciones 📝: ${svc.comentarios.trim()}`);
  }

  return lineas.join('\n');
};

export const generarOrdenWhatsAppOperario = (svc: ServicioAgenda): string => {
  const fechaObj = new Date(svc.fecha + 'T12:00:00');
  const fechaStr = fechaObj.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric'
  });

  const equipo = (svc.operarios && svc.operarios.length > 0)
    ? svc.operarios.map(o => o.nombres || o.nombre_completo).join(' + ')
    : 'Sin asignar';

  const lineas = [
    `*🛠️ ORDEN DE SERVICIO — SPLASH*`,
    `--------------------------------`,
    `📅 *Fecha:* ${fechaStr} (${svc.horario})`,
    `⏰ *Hora llegada:* ${svc.hora_estimada || 'Por coordinar'}`,
    `👤 *Cliente:* ${svc.cliente_nombre}`,
    `📞 *Teléfono:* ${svc.telefono}`,
    `📍 *Dirección:* ${svc.direccion}, ${svc.distrito}`,
    svc.referencia ? `🧭 *Referencia:* ${svc.referencia}` : '',
    `🧼 *Servicio:* ${svc.servicio_detalle}`,
    `💰 *Cobro:* S/ ${formatMontoSoles(svc.precio_final)} (${svc.metodo_pago})`,
    svc.van_nombre ? `🚐 *Movilidad:* ${svc.van_nombre}` : (svc.es_taxi ? `🚕 *Movilidad:* TAXI` : ''),
    `👥 *Equipo:* ${equipo}`,
    svc.comentarios ? `📝 *Nota:* ${svc.comentarios}` : '',
    `--------------------------------`
  ].filter(Boolean);

  return lineas.join('\n');
};

export const abrirWhatsApp = (telefono: string, mensaje: string) => {
  const clean = telefono.replace(/\D/g, '');
  const fullNumber = clean.length === 9 ? `51${clean}` : clean;
  const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
};
