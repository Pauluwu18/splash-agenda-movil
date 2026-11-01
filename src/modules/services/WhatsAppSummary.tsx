import React, { useState } from 'react';
import { 
  X, MessageSquare, Send, Copy, Check, Users, User, Share2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ServicioAgenda } from '../../types';
import { 
  generarMensajeWhatsAppCliente, 
  generarOrdenWhatsAppOperario, 
  abrirWhatsApp 
} from '../../utils/whatsapp';

interface WhatsAppSummaryProps {
  servicio: ServicioAgenda;
  onClose: () => void;
}

export const WhatsAppSummary: React.FC<WhatsAppSummaryProps> = ({
  servicio,
  onClose
}) => {
  const [tab, setTab] = useState<'cliente' | 'operario'>('cliente');
  const [copiado, setCopiado] = useState(false);

  const mensajeCliente = generarMensajeWhatsAppCliente(servicio);
  const mensajeOperario = generarOrdenWhatsAppOperario(servicio);
  const textoActual = tab === 'cliente' ? mensajeCliente : mensajeOperario;

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoActual);
    setCopiado(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleEnviarWhatsApp = (telefonoDestino: string) => {
    abrirWhatsApp(telefonoDestino, textoActual);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#181D22] rounded-t-3xl sm:rounded-2xl border border-[#252D38] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#252D38] flex items-center justify-between bg-[#111418]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold border border-emerald-800">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#F0F4F8] text-sm">Resumen WhatsApp</h3>
              <p className="text-[11px] text-[#8A9BB0] truncate max-w-[220px]">
                {servicio.cliente_nombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1E2530] hover:bg-[#252D38] flex items-center justify-center text-[#8A9BB0] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas: Para Cliente vs Para Operario */}
        <div className="grid grid-cols-2 p-3 bg-[#111418] border-b border-[#252D38] gap-2">
          <button
            onClick={() => setTab('cliente')}
            className={`py-2 px-3 text-xs font-extrabold rounded-xl border flex items-center justify-center gap-1.5 transition ${
              tab === 'cliente'
                ? 'bg-emerald-600 text-slate-950 border-emerald-500 shadow-sm'
                : 'bg-[#181D22] text-[#8A9BB0] border-[#252D38] hover:text-[#F0F4F8]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Confirmación Cliente</span>
          </button>

          <button
            onClick={() => setTab('operario')}
            className={`py-2 px-3 text-xs font-extrabold rounded-xl border flex items-center justify-center gap-1.5 transition ${
              tab === 'operario'
                ? 'bg-[#00CED1] text-slate-950 border-[#00CED1] shadow-sm'
                : 'bg-[#181D22] text-[#8A9BB0] border-[#252D38] hover:text-[#F0F4F8]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Orden Personal</span>
          </button>
        </div>

        {/* Vista previa del mensaje */}
        <div className="p-4 overflow-y-auto space-y-4">
          <div className="bg-[#0A0E11] border border-[#252D38] rounded-2xl p-3.5 text-xs font-mono text-[#F0F4F8] whitespace-pre-wrap leading-relaxed shadow-inner">
            {textoActual}
          </div>

          {/* Botones directos de envío */}
          <div className="space-y-2">
            {tab === 'cliente' ? (
              <button
                type="button"
                onClick={() => handleEnviarWhatsApp(servicio.telefono)}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar al WhatsApp del Cliente ({servicio.telefono})</span>
              </button>
            ) : (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#8A9BB0] block">
                  Enviar orden al personal asignado:
                </span>
                {servicio.operarios && servicio.operarios.length > 0 ? (
                  servicio.operarios.map(op => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => handleEnviarWhatsApp(op.telefono || '')}
                      className="w-full py-2.5 px-3 bg-[#1E2530] hover:bg-[#252D38] border border-[#2E3847] text-[#F0F4F8] text-xs font-bold rounded-xl flex items-center justify-between transition"
                    >
                      <span>📲 {op.nombres || op.nombre_completo}</span>
                      <span className="text-[10px] text-[#00CED1] font-semibold">
                        {op.telefono || 'Sin teléfono'}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800">
                    ⚠️ No hay operarios asignados a este servicio aún.
                  </p>
                )}
              </div>
            )}

            {/* Copiar texto */}
            <button
              type="button"
              onClick={handleCopiar}
              className="w-full py-2.5 px-4 bg-[#111418] hover:bg-[#1E2530] text-[#F0F4F8] text-xs font-bold rounded-xl border border-[#2E3847] flex items-center justify-center gap-2 transition"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#8A9BB0]" />}
              <span>{copiado ? '¡Mensaje Copiado!' : 'Copiar Texto al Portapapeles'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#111418] border-t border-[#252D38] text-center">
          <button
            onClick={onClose}
            className="text-xs text-[#8A9BB0] hover:text-[#F0F4F8] font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

