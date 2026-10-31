import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, User, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ShareModal({ servicio, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!servicio) return null;

  // Formatear texto para compartir
  const fechaFormateada = new Date(servicio.fecha + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const personasTexto = (servicio.operarios && servicio.operarios.length > 0)
    ? servicio.operarios.map(o => o.nombre).join(', ')
    : 'Por asignar';

  const mensajeWhatsApp = `*CONFIRMACIÓN DE SERVICIO 📅*
--------------------------------
👤 *Cliente:* ${servicio.cliente_nombre}
📞 *Teléfono:* ${servicio.telefono}
📅 *Fecha:* ${fechaFormateada}
⏰ *Turno/Hora:* ${servicio.horario} ${servicio.hora_estimada ? `(${servicio.hora_estimada})` : ''}
📍 *Dirección:* ${servicio.direccion}, ${servicio.distrito}
${servicio.referencia ? `🧭 *Ref:* ${servicio.referencia}\n` : ''}👥 *Personal asignado:* ${personasTexto}
🧼 *Servicio:* ${servicio.servicio_detalle}
💰 *Total:* S/ ${Number(servicio.precio_final).toFixed(2)}
💳 *Método de pago:* ${servicio.metodo_pago}
${servicio.comentarios ? `📝 *Notas:* ${servicio.comentarios}\n` : ''}--------------------------------
¡Muchas gracias por su preferencia! ✨`;

  const mensajeParaOperario = `*ORDEN DE TRABAJO 🛠️*
--------------------------------
📅 *Fecha:* ${fechaFormateada} - ${servicio.horario}
⏰ *Hora:* ${servicio.hora_estimada || 'Por definir'}
👤 *Cliente:* ${servicio.cliente_nombre}
📞 *Teléfono:* ${servicio.telefono}
📍 *Dirección:* ${servicio.direccion}, ${servicio.distrito}
${servicio.referencia ? `🧭 *Ref:* ${servicio.referencia}\n` : ''}🧼 *Servicio a realizar:* ${servicio.servicio_detalle}
💰 *Monto a cobrar:* S/ ${Number(servicio.precio_final).toFixed(2)} (${servicio.metodo_pago})
👥 *Equipo:* ${personasTexto}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mensajeWhatsApp);
    setCopied(true);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Agenda: ${servicio.cliente_nombre}`,
          text: mensajeWhatsApp
        });
      } catch (err) {
        console.log('Cancelado');
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppCliente = () => {
    const tel = servicio.telefono.replace(/\D/g, '');
    const fullNumber = tel.length === 9 ? `51${tel}` : tel;
    const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(mensajeWhatsApp)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Compartir Agenda</h3>
              <p className="text-xs text-slate-500">Enviar confirmación o detalles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vista previa del mensaje */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
            {mensajeWhatsApp}
          </div>

          {/* Opciones directas para enviar */}
          <div className="space-y-2.5">
            <button
              onClick={handleWhatsAppCliente}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/25 transition"
            >
              <Send className="w-4 h-4" />
              <span>Enviar por WhatsApp al Cliente</span>
            </button>

            {servicio.operarios && servicio.operarios.length > 0 && (
              <div className="pt-1">
                <p className="text-xs font-semibold text-slate-500 mb-2">Enviar orden al personal asignado:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {servicio.operarios.map(op => (
                    <button
                      key={op.id}
                      onClick={() => {
                        const tel = (op.telefono || '').replace(/\D/g, '');
                        const full = tel.length === 9 ? `51${tel}` : tel;
                        window.open(`https://wa.me/${full}?text=${encodeURIComponent(mensajeParaOperario)}`, '_blank');
                      }}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg flex items-center justify-between border border-slate-200/80 transition"
                    >
                      <span className="truncate">📲 {op.nombre}</span>
                      <span className="text-[10px] text-slate-500 ml-1">{op.cargo || 'Operario'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>

              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={handleShareNative}
                  className="py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl flex items-center justify-center gap-2 border border-indigo-200 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Más apps</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-800 font-medium"
          >
            Listo, volver a la agenda
          </button>
        </div>
      </div>
    </div>
  );
}

