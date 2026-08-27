import React from 'react';

interface OfficerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficerProfileModal: React.FC<OfficerProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Profile Card */}
      <div className="relative w-full max-w-md bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Cover */}
        <div className="h-28 bg-gradient-to-r from-cyan-950 via-slate-900 to-black p-4 flex justify-between items-start relative border-b border-cyan-500/20">
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase tracking-wider border border-cyan-500/40">
            Active Duty • Seattle PNW
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-black/50 text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Officer Image & Badge Info */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-[#090d16] shadow-xl bg-black border border-cyan-500/30">
              <img
                alt="Officer Mark Jensen"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqdrn-sN0P7SAhVN8B8qSy_l8eumTmvkh21t15CwiHcihW1dObU6KVvm7sVm75YDS8m4k1vfUm_4vr8eYgNbdFbALBPD9PANNKGYDBXb4HA3foJv1PEOFdGQa1dw5YaDzsGSw7uQjRgm02-uBi7qQAGM-dJlH0cCpXANn06tEdDovNLJKGCqMAhYgY4t0J6tm-Ez7PH4Rl--muIw2Fz77gljEOth1x60HNZdEqk2nWQE4rTlATjNU"
              />
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-cyan-400">BADGE #SEA-8092</div>
              <div className="text-xs text-slate-400">Acoustic Response Div.</div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100">Mark Jensen</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Senior Field Enforcement Officer • City of Seattle
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-center">
              <span className="block text-[10px] font-mono text-slate-500 uppercase">Shift Time</span>
              <span className="text-sm font-bold text-slate-200 font-mono">06h 42m</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-center">
              <span className="block text-[10px] font-mono text-slate-500 uppercase">Dispatches</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">14 Today</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-center">
              <span className="block text-[10px] font-mono text-slate-500 uppercase">Unit Radio</span>
              <span className="text-sm font-bold text-amber-400 font-mono">CH-04 LINK</span>
            </div>
          </div>

          {/* Hardware & Sensor Pairings */}
          <div className="mt-4 bg-black/40 rounded-xl p-3 border border-white/5 space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Assigned Telemetry Rig</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                ONLINE
              </span>
            </div>
            <div className="text-xs text-slate-200 flex items-center justify-between">
              <span className="text-slate-400">Mobile Sound Spectrometer:</span>
              <span className="font-mono text-cyan-300">Bruel &amp; Kjaer Type 2250-L</span>
            </div>
            <div className="text-xs text-slate-200 flex items-center justify-between">
              <span className="text-slate-400">Patrol Cruiser:</span>
              <span className="font-mono text-cyan-300">Ford Interceptor #SEA-09</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono uppercase tracking-wider hover:bg-slate-800 transition-colors border border-white/5"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert('Officer status toggled to Active Priority Patrol');
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-cyan-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.35)]"
            >
              Duty Standby
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
