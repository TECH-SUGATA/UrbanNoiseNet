import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { AnalyticsTimeseriesData, HeatmapCell, GeoZone } from '../types';
import { useNavigate } from 'react-router-dom';
import { getZoneStressIndex } from '../utils/noiseStress';

export const AnalyticsPage: React.FC = () => {
  const { zones, selectedZone, setSelectedZone, getTimeseries, getHeatmap } = useAppData();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('7d');
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>(
    selectedZone ? [selectedZone.id] : zones.map((z) => z.id)
  );
  const [timeseries, setTimeseries] = useState<AnalyticsTimeseriesData[]>([]);
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const zoneStress = zones.map((zone) => ({ zone, index: getZoneStressIndex(zone) }));
  const averageStress = zoneStress.length
    ? zoneStress.reduce((sum, item) => sum + item.index.score, 0) / zoneStress.length
    : 0;

  // Sync selectedZone from context
  useEffect(() => {
    if (selectedZone) {
      setSelectedZoneIds([selectedZone.id]);
    }
  }, [selectedZone]);

  // Load timeseries & heatmap
  useEffect(() => {
    getTimeseries(dateRange, selectedZoneIds).then((data) => setTimeseries(data));
    getHeatmap(selectedZoneIds[0]).then((cells) => setHeatmapCells(cells));
  }, [dateRange, selectedZoneIds]);

  const handleExport = (format: 'PDF' | 'CSV') => {
    setExportToast(`Generating & downloading ${format} acoustic compliance audit...`);
    setTimeout(() => setExportToast(null), 4000);
  };

  const handleBarClick = (zone: GeoZone) => {
    setSelectedZone(zone);
    navigate('/zones');
  };

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {exportToast && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-950 border border-cyan-400 text-cyan-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-cyan-400">download_done</span>
          <span className="text-xs font-mono">{exportToast}</span>
        </div>
      )}

      {/* Top Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">insights</span>
            <span>Acoustic Telemetry Trends &amp; Predictive Forecasting</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporal sound pressure distribution, machine learning predictive load curves, and sector compliance heatmaps.
          </p>
        </div>

        {/* Export Report Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('CSV')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">table_view</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            <span>Export Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Date Range Chips */}
        <div className="flex items-center gap-1.5">
          {(['today', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase transition-colors cursor-pointer ${
                dateRange === r
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {r === 'today' ? 'Today (24h)' : r === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Geofence Scope:</span>
          {zones.map((z) => {
            const isSelected = selectedZoneIds.includes(z.id);
            return (
              <button
                key={z.id}
                onClick={() => {
                  if (isSelected) {
                    if (selectedZoneIds.length > 1) {
                      setSelectedZoneIds(selectedZoneIds.filter((id) => id !== z.id));
                    }
                  } else {
                    setSelectedZoneIds([...selectedZoneIds, z.id]);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-black/40 text-slate-500 border border-white/5 hover:text-slate-300'
                }`}
              >
                {z.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* NSI Exposure Analysis */}
      <section className="bg-[#090d16]/90 border border-emerald-500/25 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-lg">psychology</span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Noise Stress Index · Exposure Analysis</h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Stress-risk estimate from normalized level, exposure duration, time of day, and source severity.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-emerald-300">{Math.round(averageStress * 100)}%</div>
            <div className="text-[10px] uppercase font-mono text-slate-500">Network average risk</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
          {[
            ['L', 'Noise level', 0.45, 'text-cyan-300'],
            ['E', 'Exposure duration', 0.25, 'text-amber-300'],
            ['D', 'Time / environment', 0.15, 'text-violet-300'],
            ['S', 'Source severity', 0.15, 'text-rose-300'],
          ].map(([code, label, weight, color]) => (
            <div key={code as string} className="rounded-xl bg-black/30 border border-white/5 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold font-mono ${color}`}>{code}</span>
                <span className="text-[10px] font-mono text-slate-500">{(Number(weight) * 100).toFixed(0)}% weight</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {zoneStress.map(({ zone, index }) => (
            <div key={zone.id} className="grid grid-cols-[minmax(0,1fr)_5rem_7rem] items-center gap-3 text-xs">
              <div className="min-w-0">
                <div className="flex justify-between gap-2 text-slate-300"><span className="truncate">{zone.name}</span><span className="font-mono text-slate-500">{zone.currentDb} dBA</span></div>
                <div className="h-1.5 mt-1 rounded-full bg-slate-800 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${index.score * 100}%`, backgroundColor: index.color }} /></div>
              </div>
              <span className="font-mono text-right" style={{ color: index.color }}>{Math.round(index.score * 100)}%</span>
              <span className="text-[10px] font-mono uppercase text-right" style={{ color: index.color }}>{index.level}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 border-t border-white/5 pt-3">
          <span className="material-symbols-outlined text-xs text-emerald-400">verified_user</span>
          Risk estimate only; it is not a clinical or cortisol measurement.
        </div>
      </section>

      {/* Chart 1: Time-Series Line Visualizer (Predicted vs Actual) */}
      <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-lg">show_chart</span>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Acoustic Load: Actual Telemetry vs. AI Neural Forecast
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400" />
              <span className="text-cyan-300 font-semibold">Actual Ambient (dBA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 border-b border-dashed border-cyan-400" />
              <span className="text-slate-400">ML Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500" />
              <span className="text-rose-400">70 dB Threshold</span>
            </div>
          </div>
        </div>

        {/* SVG Chart Rendering */}
        <div className="relative h-64 w-full bg-black/50 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
          <svg className="w-full h-48 overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 200">
            {/* Grid Lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

            {/* Threshold Line at 70dB (~y=80) */}
            <line x1="0" y1="80" x2="800" y2="80" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Predicted Line (Dashed) */}
            <polyline
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.6"
              points={timeseries
                .map((d, i) => {
                  const x = (i / Math.max(1, timeseries.length - 1)) * 800;
                  const y = 200 - (d.predictedDb / 100) * 200;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Actual Line (Solid) */}
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              points={timeseries
                .map((d, i) => {
                  const x = (i / Math.max(1, timeseries.length - 1)) * 800;
                  const y = 200 - (d.actualDb / 100) * 200;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Nodes on Actual Line */}
            {timeseries.map((d, i) => {
              const x = (i / Math.max(1, timeseries.length - 1)) * 800;
              const y = 200 - (d.actualDb / 100) * 200;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={d.actualDb > 70 ? '#f43f5e' : '#22d3ee'}
                  stroke="#030712"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* X Axis Time Labels */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
            {timeseries.map((d, i) => (
              <span key={i}>{d.time}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Heatmap Calendar (7 cols) + Sector Comparison Bar Chart (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap Calendar (Day x Hour) */}
        <div className="lg:col-span-7 bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-lg">grid_on</span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Weekly Acoustic Exceedance Heatmap
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Day × 2-Hour Blocks</span>
          </div>

          {/* Grid Layout */}
          <div className="space-y-1.5 font-mono text-xs">
            {/* Header Hours */}
            <div className="grid grid-cols-13 gap-1 text-[10px] text-slate-500 text-center">
              <span className="text-left pl-1">DAY</span>
              {HOURS.map((h) => (
                <span key={h}>{h}h</span>
              ))}
            </div>

            {/* Days Rows */}
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-13 gap-1 items-center">
                <span className="text-[11px] text-slate-400 pl-1 font-bold">{day}</span>
                {HOURS.map((h) => {
                  const cell = heatmapCells.find((c) => c.day === day && c.hour === h) || {
                    day,
                    hour: h,
                    avgDb: 64,
                    incidentCount: 1,
                    topSource: 'Transit',
                  };

                  const isHigh = cell.avgDb > 78;
                  const isMed = cell.avgDb > 68;

                  return (
                    <button
                      key={h}
                      onClick={() => setSelectedCell(cell)}
                      title={`${day} @ ${h}:00 - Avg ${cell.avgDb} dB (${cell.incidentCount} alerts)`}
                      className={`h-7 rounded-md transition-all cursor-pointer flex items-center justify-center text-[10px] font-bold ${
                        isHigh
                          ? 'bg-rose-500/80 hover:bg-rose-400 text-slate-950 shadow-xs'
                          : isMed
                          ? 'bg-amber-500/60 hover:bg-amber-400 text-slate-950'
                          : 'bg-cyan-950/60 hover:bg-cyan-800 text-cyan-300 border border-cyan-500/20'
                      }`}
                    >
                      {Math.round(cell.avgDb)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-slate-400">
            <span>Legend:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-cyan-950 border border-cyan-500/40" />
                <span>&lt; 65 dB (Safe)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-500/70" />
                <span>65 - 75 dB (Elevated)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-rose-500" />
                <span>&gt; 75 dB (Hazard)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sector Comparison Bar Chart */}
        <div className="lg:col-span-5 bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-lg">bar_chart</span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Sector Decibel Comparison
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Click to View Zone</span>
            </div>

            <div className="space-y-3 mt-4">
              {zones.map((zone) => {
                const pct = Math.min(100, Math.round((zone.currentDb / 100) * 100));
                const isOver = zone.currentDb > zone.thresholdDb;

                return (
                  <div
                    key={zone.id}
                    onClick={() => handleBarClick(zone)}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/40 transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-200 font-bold group-hover:text-cyan-300">
                        {zone.name}
                      </span>
                      <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-cyan-300'}`}>
                        {zone.currentDb} / {zone.thresholdDb} dB
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500">
            Sector baseline metrics aggregated across all active node telemetry channels.
          </div>
        </div>
      </div>

      {/* Heatmap Cell Drawer / Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedCell(null)} />
          <div className="relative w-full max-w-md bg-[#090d16] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 z-10 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">analytics</span>
                <h3 className="font-bold text-sm text-slate-100">
                  {selectedCell.day} @ {selectedCell.hour}:00 - {selectedCell.hour + 2}:00 Log
                </h3>
              </div>
              <button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block uppercase">Average Sound Level</span>
                <span className="text-base font-bold text-cyan-300">{selectedCell.avgDb} dBA</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block uppercase">Logged Incidents</span>
                <span className="text-base font-bold text-rose-400">{selectedCell.incidentCount} Spikes</span>
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase">Dominant Acoustic Source</span>
              <span className="text-slate-200 font-semibold">{selectedCell.topSource}</span>
            </div>

            <button
              onClick={() => setSelectedCell(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              Close Snapshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
