import React, { useState } from 'react';
import { playAcousticSound, playChirp } from '../../utils/audioSynth';

export const DispatchTab: React.FC = () => {
  const [dispatchMode, setDispatchMode] = useState<'manual' | 'auto'>('manual');
  const [dispatchStep, setDispatchStep] = useState<number>(3); // 1: Detected, 2: Identified, 3: SMS Sent, 4: En Route
  const [isDispatching, setIsDispatching] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [unitPos, setUnitPos] = useState({ x: 25, y: 33 });
  const [radioCommsPlaying, setRadioCommsPlaying] = useState(false);

  const handleTriggerDispatch = () => {
    setIsDispatching(true);
    playChirp(true);

    setTimeout(() => {
      setIsDispatching(false);
      setIsDispatched(true);
      setDispatchStep(4);
      setUnitPos({ x: 40, y: 44 }); // move unit closer
      playChirp(true);
    }, 1400);
  };

  const handlePlayRadioSnippet = () => {
    setRadioCommsPlaying(true);
    playAcousticSound('siren', 2);
    setTimeout(() => setRadioCommsPlaying(false), 2500);
  };

  return (
    <main className="relative w-full pt-20 pb-28 min-h-screen bg-[#030712] font-sans text-slate-200">
      <div className="flex flex-col w-full max-w-xl mx-auto px-4 md:px-6 gap-4">
        {/* Sticky Sub-header */}
        <div className="py-2 flex justify-between items-center bg-[#090d16]/90 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/20 shadow-md">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Dispatch</h2>
            <p className="text-xs font-mono text-slate-400">Active Incident #UD-992</p>
          </div>

          {/* Mode Switch */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setDispatchMode('manual')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono transition-all ${
                dispatchMode === 'manual'
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MANUAL
            </button>
            <button
              onClick={() => setDispatchMode('auto')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono transition-all ${
                dispatchMode === 'auto'
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AUTO GPS
            </button>
          </div>
        </div>

        {/* Dispatch Map Viewport */}
        <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-lg border border-cyan-500/30">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDeJihawCfaS-wT98nF9OFpm5OcrT64rdrPv7mywFekK9l1suOiQF4dejpA2jKXQ4kGBXgjOQqQ0JZ3MAOYzNSanOUmbaXlCqFIo2RW7e53EWh9G97qfAO_5wlASjVgHNcFy71niuyhPnfHgeqbId823sIP5Jui8RbYVEFGAKskMpAXDax4xlmbNIKsgLxwdl6FlzXNlvvBRqZRStWGWP5cxkD6WBDyDskrWFsJnO5ucjclLhJjo8Q')`,
              filter: 'brightness(0.65) contrast(1.15)',
            }}
          >
            {/* Map Overlay */}
            <div className="absolute inset-0 bg-[#030712]/30 pointer-events-none" />

            {/* Incident Pin (Center) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
              <div className="w-5 h-5 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.9)] ring-2 ring-[#030712] relative z-10" />
              <div className="absolute w-14 h-14 bg-rose-500/30 rounded-full animate-ping" />
            </div>

            {/* Unit Pin (Patrol Vehicle) */}
            <div
              style={{ top: `${unitPos.y}%`, left: `${unitPos.x}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-700 z-20 cursor-pointer"
              title="Unit #SEA-09 (Officer Mark Jensen)"
            >
              <div className="w-7 h-7 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.9)] ring-2 ring-[#030712] flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-slate-950 font-bold">
                  directions_car
                </span>
              </div>
              <span className="mt-1 px-1.5 py-0.2 bg-black/90 rounded text-[9px] font-mono text-cyan-300 border border-cyan-500/40">
                UNIT 09
              </span>
            </div>

            {/* Simulated Animated Route Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <path
                d={`M ${unitPos.x}% ${unitPos.y}% Q 38% 42% 50% 50%`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="6,6"
                className="opacity-90"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  dur="1s"
                  repeatCount="indefinite"
                  values="12;0"
                />
              </path>
            </svg>
          </div>
        </div>

        {/* Critical Alert Card */}
        <div className="bg-[#090d16]/90 rounded-2xl p-4 shadow-md border border-rose-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none">
            <span className="material-symbols-outlined text-6xl text-rose-400">
              campaign
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className="text-[10px] font-mono text-rose-400 uppercase font-bold tracking-widest">
              Critical Alert
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-100">Siren Detected</h3>
          <p className="text-xs font-mono text-slate-400">GPS 40.7128° N, 74.0060° W</p>

          <div className="mt-3 flex gap-3">
            <div className="flex-1 bg-black/40 rounded-xl p-2.5 border border-white/5">
              <span className="block text-[10px] font-mono text-slate-500 uppercase">CONFIDENCE</span>
              <span className="block text-base font-bold font-mono text-cyan-400">98.4%</span>
            </div>
            <div className="flex-1 bg-black/40 rounded-xl p-2.5 border border-white/5">
              <span className="block text-[10px] font-mono text-slate-500 uppercase">DURATION</span>
              <span className="block text-base font-bold font-mono text-amber-400">14s</span>
            </div>
          </div>
        </div>

        {/* Dispatch Status Stepper */}
        <div className="bg-[#090d16]/90 rounded-2xl p-4 shadow-md border border-white/5">
          <h4 className="text-[11px] font-mono text-slate-400 mb-3 tracking-wider uppercase">
            DISPATCH STATUS
          </h4>
          <div className="relative pl-1">
            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-800" />
            <div className="flex flex-col gap-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 relative z-10">
                <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center ring-4 ring-[#090d16] shrink-0 shadow-[0_0_8px_#22d3ee]">
                  <span className="material-symbols-outlined text-xs text-slate-950 font-bold">
                    check
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">Detected</p>
                  <p className="text-[11px] text-slate-400">Acoustic sensor AC-04</p>
                </div>
                <span className="ml-auto text-[10px] font-mono text-slate-500">14:02:11</span>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 relative z-10">
                <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center ring-4 ring-[#090d16] shrink-0 shadow-[0_0_8px_#22d3ee]">
                  <span className="material-symbols-outlined text-xs text-slate-950 font-bold">
                    check
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">Identified</p>
                  <p className="text-[11px] text-slate-400">Pattern matched: Siren (Type B)</p>
                </div>
                <span className="ml-auto text-[10px] font-mono text-slate-500">14:02:14</span>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 relative z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[#090d16] shrink-0 ${
                    dispatchStep >= 3
                      ? 'bg-slate-900 border-2 border-cyan-400'
                      : 'bg-slate-900 border-2 border-slate-700'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">SMS Sent</p>
                  <p className="text-[11px] text-slate-400">
                    {isDispatched ? 'Confirmed by Officer Mark Jensen' : 'Awaiting officer confirmation'}
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-mono text-slate-500">14:02:18</span>
              </div>

              {/* Step 4 */}
              <div className={`flex items-start gap-3.5 relative z-10 ${dispatchStep < 4 ? 'opacity-50' : ''}`}>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-[#090d16] shrink-0 ${
                    dispatchStep >= 4
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_8px_#22d3ee]'
                      : 'bg-slate-900 border-2 border-slate-700'
                  }`}
                >
                  {dispatchStep >= 4 && (
                    <span className="material-symbols-outlined text-xs font-bold">
                      check
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">En Route</p>
                  <p className="text-[11px] text-slate-400">
                    {dispatchStep >= 4 ? 'Unit SEA-09 ETA: 2 mins' : 'Pending dispatch trigger'}
                  </p>
                </div>
                {dispatchStep >= 4 && (
                  <span className="ml-auto text-[10px] font-mono text-cyan-300">ACTIVE</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trigger Dispatch Action Button */}
        <button
          disabled={isDispatching}
          onClick={handleTriggerDispatch}
          className={`w-full py-4 rounded-xl font-mono text-xs font-bold tracking-wider uppercase shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden active:scale-[0.98] ${
            isDispatched
              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
              : isDispatching
              ? 'bg-slate-800 text-cyan-400'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {isDispatched ? 'check_circle' : isDispatching ? 'sync' : 'electric_bolt'}
          </span>
          {isDispatched
            ? 'DISPATCHED • UNIT 09 ACTIVE'
            : isDispatching
            ? 'DISPATCHING TELEMETRY...'
            : 'TRIGGER DISPATCH'}
        </button>

        {/* Audio Intercept Diagnostic */}
        <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-base">
              radio
            </span>
            <span className="text-slate-400">Audio Telemetry Stream</span>
          </div>
          <button
            onClick={handlePlayRadioSnippet}
            className="text-cyan-400 font-mono text-[11px] hover:underline"
          >
            {radioCommsPlaying ? 'STREAMING...' : 'MONITOR CODES'}
          </button>
        </div>
      </div>
    </main>
  );
};
