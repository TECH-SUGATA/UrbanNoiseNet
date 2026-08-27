import React, { useState } from 'react';

export const AnalyticsTab: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days (Oct 1 - Oct 31)');
  const [selectedZones, setSelectedZones] = useState('Downtown Core, West End');
  const [showDateModal, setShowDateModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: string; y: string; db: number } | null>(null);

  const DATE_OPTIONS = [
    'Last 24 Hours (Real-time stream)',
    'Last 7 Days (Oct 24 - Oct 31)',
    'Last 30 Days (Oct 1 - Oct 31)',
    'Quarter to Date (Q4 2026)',
  ];

  const ZONE_OPTIONS = [
    'Downtown Core, West End',
    'North Residential Sector',
    'Metro Industrial Corridor',
    'All Municipal Geo-Zones',
  ];

  return (
    <main className="relative w-full pt-20 pb-28 min-h-screen bg-[#030712] font-sans text-slate-200">
      <div className="flex flex-col w-full max-w-xl mx-auto px-4 md:px-6 gap-5">
        {/* Header Titles */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-slate-100">
            Analytics &amp; Forecasting
          </h2>
          <p className="text-xs text-slate-400">
            Analyze acoustic data trends and predict future noise levels across urban zones.
          </p>
        </div>

        {/* Filters Section */}
        <section className="flex flex-col gap-3 bg-[#090d16]/90 rounded-2xl p-4 border border-cyan-500/20 shadow-sm">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
              Data Filters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Date Range</label>
              <button
                onClick={() => setShowDateModal(true)}
                className="flex items-center justify-between bg-black/40 hover:bg-slate-900 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-mono border border-white/5 transition-colors"
              >
                <span className="truncate pr-1">{dateRange}</span>
                <span className="material-symbols-outlined text-base text-slate-500">
                  calendar_today
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Zone Selection</label>
              <button
                onClick={() => setShowZoneModal(true)}
                className="flex items-center justify-between bg-black/40 hover:bg-slate-900 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-mono border border-white/5 transition-colors"
              >
                <span className="truncate pr-1">{selectedZones}</span>
                <span className="material-symbols-outlined text-base text-slate-500">
                  arrow_drop_down
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Key Metrics Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div className="flex flex-col bg-[#090d16]/90 rounded-2xl p-4 border border-white/5 shadow-md">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Avg Noise Level
            </span>
            <div className="flex items-end gap-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono text-slate-100">72.4</span>
              <span className="text-sm font-mono text-cyan-400 mb-1 font-bold">dB</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-rose-400 text-[11px] font-mono">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+2.1% from last month</span>
            </div>
          </div>

          <div className="flex flex-col bg-[#090d16]/90 rounded-2xl p-4 border border-white/5 shadow-md">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Peak Incidents
            </span>
            <div className="flex items-end gap-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono text-slate-100">148</span>
              <span className="text-xs text-slate-500 mb-1 font-mono">events</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-cyan-400 text-[11px] font-mono">
              <span className="material-symbols-outlined text-sm">trending_down</span>
              <span>-15% from last month</span>
            </div>
          </div>
        </section>

        {/* Time-Series Chart: Actual vs Predicted dB (24h) */}
        <section className="flex flex-col bg-[#090d16]/90 rounded-2xl p-4 border border-cyan-500/20 shadow-md overflow-hidden relative">
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div>
              <h3 className="text-base font-bold text-slate-100">Noise Forecast</h3>
              <p className="text-xs text-slate-400 mt-0.5">Actual vs Predicted dB (24h)</p>
            </div>
            <div className="flex gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 bg-cyan-400 rounded-full" />
                <span className="text-[11px] text-slate-300">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 bg-amber-400 rounded-full opacity-80 border-b border-dashed border-amber-400" />
                <span className="text-[11px] text-slate-300">Predicted</span>
              </div>
            </div>
          </div>

          {/* Simulated Precise Line Chart with SVG */}
          <div className="w-full h-48 relative z-10 mt-1">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 400 150"
            >
              <defs>
                <linearGradient id="analyticsGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="25" x2="400" y2="25" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1="75" x2="400" y2="75" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1="125" x2="400" y2="125" stroke="#1e293b" strokeWidth="1" />

              {/* Actual Area Fill */}
              <path
                d="M0,125 L0,90 C30,70 60,110 100,80 C140,50 180,90 220,60 C250,40 280,30 300,50 L300,125 Z"
                fill="url(#analyticsGradient)"
              />

              {/* Actual Curve (Cyan) */}
              <path
                d="M0,90 C30,70 60,110 100,80 C140,50 180,90 220,60 C250,40 280,30 300,50"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
              />

              {/* Current Time Marker (18:00) */}
              <line
                x1="300"
                y1="10"
                x2="300"
                y2="125"
                stroke="#22d3ee"
                strokeDasharray="2 2"
                strokeWidth="1.5"
              />

              <circle
                cx="300"
                cy="50"
                r="5"
                fill="#030712"
                stroke="#22d3ee"
                strokeWidth="2.5"
                className="cursor-pointer animate-pulse"
                onClick={() => setHoveredPoint({ x: '18:00', y: 'Current', db: 78.4 })}
              />

              {/* Predicted Curve (Dotted Orange) */}
              <path
                d="M300,50 C330,70 360,40 400,60"
                fill="none"
                stroke="#fbbf24"
                strokeDasharray="5 5"
                strokeWidth="2.5"
              />
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between w-full mt-2 text-[11px] font-mono text-slate-500">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span className="text-cyan-400 font-bold">18:00 (Now)</span>
              <span>24:00</span>
            </div>
          </div>
        </section>

        {/* Zone Comparison Bar Chart */}
        <section className="flex flex-col bg-[#090d16]/90 rounded-2xl p-4 border border-white/5 shadow-md">
          <div className="mb-3">
            <h3 className="text-base font-bold text-slate-100">Zone Comparison</h3>
            <p className="text-xs text-slate-500 mt-0.5">Average dB levels by district</p>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Bar 1 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-200">Downtown Core</span>
                <span className="text-rose-400 font-bold">82 dB</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            {/* Bar 2 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-200">Industrial Park</span>
                <span className="text-amber-400 font-bold">76 dB</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            {/* Bar 3 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-200">West End</span>
                <span className="text-cyan-400 font-bold">64 dB</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>

            {/* Bar 4 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-200">Residential North</span>
                <span className="text-slate-400 font-bold">55 dB</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Frequency Breakdown & Peak Hour Matrix */}
        <section className="bg-[#090d16]/90 rounded-2xl p-4 border border-cyan-500/20 space-y-3">
          <div className="text-[11px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
            Acoustic Spectrum Bands
          </div>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 block">LOW &lt;200Hz</span>
              <span className="text-sm font-bold text-slate-200">42%</span>
              <span className="text-[9px] text-slate-500 block">Diesel/Bass</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 block">MID 200-2kHz</span>
              <span className="text-sm font-bold text-cyan-400">38%</span>
              <span className="text-[9px] text-slate-500 block">Traffic/Voice</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 block">HIGH &gt;2kHz</span>
              <span className="text-sm font-bold text-rose-400">20%</span>
              <span className="text-[9px] text-slate-500 block">Sirens/Horns</span>
            </div>
          </div>
        </section>
      </div>

      {/* Date Filter Modal */}
      {showDateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowDateModal(false)}
          />
          <div className="relative w-full max-w-xs bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl p-4 z-10 space-y-3">
            <h3 className="font-bold text-sm text-slate-100">Select Telemetry Timeframe</h3>
            <div className="space-y-1 font-mono text-xs">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateRange(opt);
                    setShowDateModal(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between ${
                    dateRange === opt
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{opt}</span>
                  {dateRange === opt && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zone Filter Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowZoneModal(false)}
          />
          <div className="relative w-full max-w-xs bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl p-4 z-10 space-y-3">
            <h3 className="font-bold text-sm text-slate-100">Select Target Geo-Zones</h3>
            <div className="space-y-1 font-mono text-xs">
              {ZONE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedZones(opt);
                    setShowZoneModal(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between ${
                    selectedZones === opt
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{opt}</span>
                  {selectedZones === opt && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
