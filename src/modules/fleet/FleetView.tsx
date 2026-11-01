import React, { useState } from 'react';
import { Truck, Plus, ShieldCheck, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { Vehiculo } from '../../types';
import { VANS_DEFAULT } from '../../integrations/supabase-main/services';

export const FleetView: React.FC = () => {
  const [vans] = useState<Vehiculo[]>(VANS_DEFAULT);

  return (
    <div className="pb-28 max-w-lg mx-auto">
      {/* Header móvil */}
      <div className="sticky top-13 z-20 bg-[#0A0E11]/95 backdrop-blur-md px-4 py-3.5 border-b border-[#252D38] flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#F0F4F8] flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#00CED1]" />
            <span>Gestión de Flota & Vans</span>
          </h2>
          <p className="text-[10px] text-[#8A9BB0]">Vehículos de Operación SPLASH</p>
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        <div className="p-3 bg-[#181D22] border border-[#2E3847] rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center font-bold border border-amber-800 shrink-0">
            🚕
          </div>
          <div className="text-xs">
            <span className="font-bold text-[#F0F4F8] block">Modo TAXI Habilitado</span>
            <span className="text-[11px] text-[#8A9BB0]">
              Cuando no haya una Van disponible, puedes marcar cualquier servicio como <strong>TAXI</strong> con un toque desde la agenda.
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#00CED1] block">
            Furgonetas / Vans Activas ({vans.length})
          </span>

          {vans.map(v => (
            <div
              key={v.id}
              className="bg-[#181D22] p-4 rounded-2xl border border-[#252D38] flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00CED1]/15 text-[#00CED1] flex items-center justify-center border border-[#00CED1]/30">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#F0F4F8] text-sm">{v.nombre}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#8A9BB0] mt-0.5">
                    <span className="font-mono text-[#F0F4F8] bg-[#111418] px-1.5 py-0.2 rounded border border-[#252D38]">
                      {v.placa}
                    </span>
                    <span>•</span>
                    <span>{v.sucursal_nombre || 'Sede Las Flores'}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Operativa
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

