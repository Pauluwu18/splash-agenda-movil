import React, { useState } from 'react';
import { 
  X, MessageSquare, Send, Copy, Check, Users, User, Share2, PhoneCall 
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
  const [numeroPersonalizado, setNumeroPersonalizado] = useState('');

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
    if (!telefonoDestino.trim()) return;
    abrirWhatsApp(telefonoDestino, textoActual);
  };

  const handleCompartirNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SUMAQ - ${servicio.cliente_nombre}`,
          text: textoActual
        });
      } catch (e) {
        console.log('Share cancelado o no soportado');
      }
    } else {
      handleCopiar();
    }
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
              <h3 className="font-extrabold text-[#F0F4F8] text-sm">Compartir por WhatsApp</h3>
              <p className="text-[11px] text-[#8A9BB0] truncate max-w-[220px]">
                {servicio.cliente_nombre} • {servicio.distrito}
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
            <span>Plantilla Cliente</span>
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
            <span>Plantilla Operario</span>
          </button>
        </div>

        {/* Vista previa del mensaje */}
        <div className="p-4 overflow-y-auto space-y-4">
          <div className="bg-[#0A0E11] border border-[#252D38] rounded-2xl p-3.5 text-xs font-mono text-[#F0F4F8] whitespace-pre-wrap leading-relaxed shadow-inner select-all">
            {textoActual}
          </div>

          {/* Opciones para escoger a qué número enviar */}
          <div className="space-y-3">
            {/* 1. Enviar a número personalizado */}
            <div className="bg-[#111418] p-3 rounded-2xl border border-[#252D38] space-y-2">
              <span className="text-[10px] font-bold text-[#8A9BB0] block">
                Enviar a cualquier número de WhatsApp / Contacto:
              </span>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Ej. 987654321"
                  value={numeroPersonalizado}
                  onChange={(e) => setNumeroPersonalizado(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2 text-xs font-bold bg-[#181D22] border border-[#2E3847] rounded-xl text-[#F0F4F8] placeholder-[#4A5A70] focus:ring-1 focus:ring-[#00CED1] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={numeroPersonalizado.length < 8}
                  onClick={() => handleEnviarWhatsApp(numeroPersonalizado)}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>

            {/* 2. Enviar directo a contactos predefinidos */}
            <div className="space-y-1.5">
              {/* Botón Cliente */}
              {servicio.telefono && (
                <button
                  type="button"
                  onClick={() => handleEnviarWhatsApp(servicio.telefono)}
                  className="w-full py-2.5 px-3 bg-[#181D22] hover:bg-[#1E2530] border border-[#2E3847] rounded-xl text-[#F0F4F8] text-xs font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Cliente ({servicio.cliente_nombre})</span>
                  </span>
                  <span className="text-[11px] text-[#00CED1] font-mono">{servicio.telefono}</span>
                </button>
              )}

              {/* Botones Operarios */}
              {servicio.operarios && servicio.operarios.length > 0 && (
                servicio.operarios.map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => handleEnviarWhatsApp(op.telefono || '')}
                    className="w-full py-2.5 px-3 bg-[#181D22] hover:bg-[#1E2530] border border-[#2E3847] rounded-xl text-[#F0F4F8] text-xs font-bold flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#00CED1]" />
                      <span>WhatsApp Operario ({op.nombres || op.nombre_completo})</span>
                    </span>
                    <span className="text-[11px] text-[#00CED1] font-mono">{op.telefono || 'Sin teléfono'}</span>
                  </button>
                ))
              )}
            </div>

            {/* 3. Compartir con el selector nativo de WhatsApp del teléfono */}
            <button
              type="button"
              onClick={handleCompartirNativo}
              className="w-full py-3 bg-[#00CED1] hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#00CED1]/25 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span>Elegir contacto o grupo en WhatsApp...</span>
            </button>

            {/* 4. Copiar texto */}
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
