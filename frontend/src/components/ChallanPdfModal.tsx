import React from 'react';
import { ChallanRecord } from '../types';

interface ChallanPdfModalProps {
  challan: ChallanRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChallanPdfModal: React.FC<ChallanPdfModalProps> = ({
  challan,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !challan) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Printable Sheet Container */}
      <div className="relative w-full max-w-2xl bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 text-slate-200">
        {/* Modal Actions Bar (hidden in print) */}
        <div className="p-4 bg-black/50 border-b border-cyan-500/20 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">
              picture_as_pdf
            </span>
            <span className="font-mono text-sm font-semibold text-cyan-300">
              CIVIC ACOUSTIC CITATION NOTICE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-mono hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 transition-colors border border-cyan-500/30"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              PRINT / SAVE PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Legal Document Content */}
        <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-[#090d16] to-[#030712]">
          {/* Header Seal & Municipal Information */}
          <div className="flex items-start justify-between border-b border-cyan-500/20 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/60 flex items-center justify-center border border-cyan-500/40 shadow-lg">
                <span className="material-symbols-outlined text-cyan-400 text-2xl">
                  security
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                  DEPARTMENT OF URBAN ACOUSTIC CONTROL
                </h1>
                <p className="text-xs text-slate-400">
                  Automated Noise Sensor Network & Civic Enforcement Bureau
                </p>
                <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                  MUNICIPAL NOISE CODE § 25.08.410
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 font-mono font-bold text-xs">
                CITATION NOTICE
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1">
                REF: {challan.id}
              </div>
            </div>
          </div>

          {/* Core Violation Information */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Incident ID</span>
              <span className="text-cyan-400 font-bold">{challan.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Timestamp</span>
              <span className="text-slate-200">{challan.timestamp}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Node Sensor ID</span>
              <span className="text-cyan-400">{challan.nodeId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Recorded Location</span>
              <span className="text-slate-200 truncate block">{challan.location}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">GPS Coordinates</span>
              <span className="text-slate-200">{challan.coordinates.lat}° N, {challan.coordinates.lng}° W</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Vehicle / Source</span>
              <span className="text-slate-200">{challan.source} {challan.licensePlate ? `(${challan.licensePlate})` : ''}</span>
            </div>
          </div>

          {/* Decibel Severity Box */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-950/40 via-slate-900 to-black/60 rounded-xl border border-rose-500/30">
            <div>
              <div className="text-xs uppercase font-mono text-rose-400 tracking-wider font-bold">
                Measured Sound Pressure Level
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Baseline Limit: 70.0 dB • Over Limit: +{(challan.db - 70).toFixed(1)} dB
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-rose-400 font-mono">
                {challan.db}
              </span>
              <span className="text-sm text-rose-400/80 ml-1 font-mono">dBA</span>
            </div>
          </div>

          {/* Acoustic Waveform & Spectral Telemetry Proof */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>TELEMETRIC ACOUSTIC SIGNATURE (SPECTROGRAM EVIDENCE)</span>
              <span className="text-cyan-400">AI CONFIDENCE: {challan.confidence}%</span>
            </div>
            <div className="h-16 bg-black/60 rounded-xl p-2 border border-cyan-500/20 flex items-end justify-between gap-1">
              {Array.from({ length: 48 }).map((_, i) => {
                const peak = Math.sin((i / 48) * Math.PI) * 85;
                const noise = (i % 5) * 4;
                const height = Math.max(12, peak + noise);
                return (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`w-full rounded-t-sm ${
                      height > 75 ? 'bg-rose-500' : height > 45 ? 'bg-amber-400' : 'bg-cyan-400/80'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Penalty & Fine Summary */}
          <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="text-xs font-mono text-slate-400 uppercase">Statutory Fine Assessment</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">${challan.fineAmount.toFixed(2)} USD</div>
              <div className="text-[11px] text-slate-400">Due within 15 calendar days to avoid municipal surcharge.</div>
            </div>
            {/* Barcode & Verification */}
            <div className="text-center bg-black/60 p-3 rounded-lg border border-white/10 font-mono text-[10px] text-slate-400">
              <div className="tracking-[0.25em] text-slate-200 font-bold text-xs mb-1">
                |||| | ||||| || |||||| | |||| |||
              </div>
              <span>VERIFICATION HASH: 0x82F9A...C4B</span>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-cyan-500/20 pt-4 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>Official Legal Notice • City Acoustic Telemetry Protocol</span>
            <span className="font-mono text-cyan-400">cloud.urbannoisenet.io/verify/{challan.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
