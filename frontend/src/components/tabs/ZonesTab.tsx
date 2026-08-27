import React, { useState } from 'react';
import { GeoZone } from '../../types';

interface ZonesTabProps {
  zones: GeoZone[];
  onAddZone: (zone: GeoZone) => void;
  onToggleZoneStatus: (id: string) => void;
  onUpdateZone: (zone: GeoZone) => void;
}

export const ZonesTab: React.FC<ZonesTabProps> = ({
  zones,
  onAddZone,
  onToggleZoneStatus,
  onUpdateZone,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<GeoZone | null>(null);

  // New Zone Form State
  const [zoneName, setZoneName] = useState('');
  const [classification, setClassification] = useState<'residential' | 'commercial' | 'industrial' | 'custom'>('residential');
  const [thresholdDb, setThresholdDb] = useState(55);
  const [allowExceptions, setAllowExceptions] = useState(true);
  const [quietHours, setQuietHours] = useState('22:00 - 07:00');

  const activeCount = zones.filter((z) => z.status === 'active').length;

  const handleDeployZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    const newZone: GeoZone = {
      id: `zone-${Date.now()}`,
      name: zoneName.trim(),
      description:
        classification === 'residential'
          ? 'Strict quiet hours enforced'
          : classification === 'industrial'
          ? 'High tolerance threshold'
          : classification === 'commercial'
          ? 'Commercial & retail noise limits'
          : 'Custom telemetry monitoring zone',
      classification,
      status: 'active',
      currentDb: Math.floor(Math.random() * 25) + 45,
      thresholdDb: Number(thresholdDb),
      quietHours,
      sparkline: [40, 45, 48, 52, 49, 53, Number(thresholdDb) - 5],
      allowExceptions,
      activeSensors: Math.floor(Math.random() * 8) + 4,
      color:
        classification === 'residential'
          ? '#8aebff'
          : classification === 'industrial'
          ? '#ffb147'
          : '#2fd9f4',
    };

    onAddZone(newZone);
    setZoneName('');
    setIsModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      onUpdateZone(editingZone);
      setEditingZone(null);
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-[#030712] font-sans text-slate-200 pt-20 pb-28">
      {/* Interactive Map Background */}
      <div
        className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-cover bg-center opacity-85"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCf7a5KlvXZxltykyDzgPjf3yDpOGr876biU8_9UIdLrNa9b2EeqSb3wVdK0Lf6Y_LwIwwZQ11Hft41t-EIX4DK9fy29bbY2oYFq1gsmqDXlf1pnDM3UBcem2HLa4jwi9-4AnbAEHBu3aiaJYJMq-N4GRp5aj15Em8VNHm81Q6CaQEUMvV376a4Wc-kw6BVJLcYYAt9DNrTW8AEaL6bbZ7f5Rw7dxGpA7A-Fu8BGpsUuIN4-7CBow4')`,
          filter: 'brightness(0.6) contrast(1.2)',
        }}
      >
        {/* Map Overlays (Simulated Polygons) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="zone-grad-main" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="zone-grad-ind" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.55" />
            </linearGradient>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeOpacity="0.12" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid overlay */}
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Active Zone A Polygon */}
          <polygon
            points="10%,20% 40%,15% 45%,40% 15%,45%"
            fill="url(#zone-grad-main)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />

          {/* Active Zone B Polygon */}
          <polygon
            points="55%,50% 85%,45% 90%,75% 60%,80%"
            fill="url(#zone-grad-ind)"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />

          {/* Inactive Zone C Polygon */}
          <polygon
            points="10%,70% 30%,65% 35%,85% 15%,90%"
            fill="#1e293b"
            fillOpacity="0.3"
            stroke="#64748b"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Map Pulse Pin */}
          <g transform="translate(150, 180)">
            <circle cx="0" cy="0" r="16" fill="#38bdf8" fillOpacity="0.2">
              <animate attributeName="r" dur="2s" repeatCount="indefinite" values="16; 32; 16" />
              <animate attributeName="fill-opacity" dur="2s" repeatCount="indefinite" values="0.2; 0; 0.2" />
            </circle>
            <circle cx="0" cy="0" r="4" fill="#38bdf8" />
          </g>
        </svg>

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-[#030712]/80 pointer-events-none" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col flex-1 pb-16 pointer-events-none">
        {/* Top Bar / Quick Stats Card */}
        <div className="p-4 mx-4 mt-2 bg-[#090d16]/85 backdrop-blur-xl rounded-2xl shadow-xl border border-cyan-500/20 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Active Geo-Zones</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring {activeCount} active boundaries ({zones.length} total defined)
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-cyan-500/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_6px_#22d3ee]" />
              <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold tracking-widest">
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-[140px]" />

        {/* Zone List Bottom Sheet */}
        <div className="mt-auto pointer-events-auto bg-[#090d16]/95 backdrop-blur-2xl rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)] border-t border-cyan-500/20">
          {/* Drag handle */}
          <div className="w-full flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
          </div>

          <div className="px-4 pb-8 space-y-3 max-h-[460px] overflow-y-auto">
            {zones.map((zone) => {
              const isActive = zone.status === 'active';
              return (
                <div
                  key={zone.id}
                  className={`group relative overflow-hidden p-4 rounded-xl transition-all duration-300 shadow-md border border-white/5 ${
                    isActive ? 'bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-500/30' : 'bg-black/60 opacity-65'
                  }`}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute top-0 left-0 w-1.5 h-full"
                    style={{ backgroundColor: isActive ? zone.color : '#64748b' }}
                  />

                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-100">{zone.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {zone.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{zone.description}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleZoneStatus(zone.id)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-700 transition-colors"
                        title={isActive ? 'Deactivate Zone' : 'Activate Zone'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isActive ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      <button
                        onClick={() => setEditingZone(zone)}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition-colors"
                        title="Tune Zone Rules"
                      >
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                      </button>
                    </div>
                  </div>

                  {/* Sparkline & Current dB */}
                  <div className="mt-3 flex justify-between items-end border-t border-white/5 pt-2.5 pl-2">
                    <div>
                      <span className="block font-mono text-[10px] text-slate-500 uppercase mb-0.5">
                        Current dB / Limit: {zone.thresholdDb} dB
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-100">
                        {zone.currentDb} dB
                      </span>
                    </div>

                    {/* Mini sparkline */}
                    <div className="h-7 w-28">
                      <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 30" width="100%">
                        <path
                          d={`M0,20 L20,${zone.sparkline[1] || 15} L40,${zone.sparkline[2] || 22} L60,${
                            zone.sparkline[3] || 12
                          } L80,${zone.sparkline[4] || 18} L100,8`}
                          fill="none"
                          stroke={zone.color}
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button: Define New Zone */}
      <button
        aria-label="Create New Zone"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-cyan-400 text-slate-950 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(56,189,248,0.5)] hover:scale-105 active:scale-95 transition-transform font-bold"
        title="Define New Acoustic Zone"
      >
        <span className="material-symbols-outlined text-2xl font-bold">add</span>
      </button>

      {/* Create New Zone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-8 duration-200">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-100">Define New Geo-Zone</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleDeployZone} className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">
                    Zone Identifier / Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 7G Commercial Hub"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    className="w-full bg-black/60 text-slate-100 font-mono text-sm px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Primary Classification */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">
                    Primary Classification
                  </label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as any)}
                    className="w-full bg-black/60 text-slate-100 text-sm px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="residential">Residential (Strict: 50-55 dB)</option>
                    <option value="commercial">Commercial (Medium: 65-70 dB)</option>
                    <option value="industrial">Industrial/Construction (High: 85 dB)</option>
                    <option value="custom">Custom Policy / Waterfront</option>
                  </select>
                </div>

                {/* Sound Limit Slider */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span className="uppercase">Threshold Limit</span>
                    <span className="text-cyan-400 font-bold">{thresholdDb} dB</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="105"
                    value={thresholdDb}
                    onChange={(e) => setThresholdDb(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Exception Rules Toggle */}
                <div className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-white/5">
                  <div>
                    <p className="text-xs font-semibold text-slate-100">Exception Rules</p>
                    <p className="text-[11px] text-slate-500">Allow scheduled civic threshold overrides</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowExceptions}
                    onChange={(e) => setAllowExceptions(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-mono uppercase text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                  >
                    Deploy Zone
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Rules Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setEditingZone(null)}
          />

          <div className="relative w-full max-w-md bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl p-5 z-10">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Tune Rules: {editingZone.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Update decibel sensitivity and quiet hours curfew.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Threshold Limit</span>
                  <span className="text-cyan-400 font-bold">{editingZone.thresholdDb} dB</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="105"
                  value={editingZone.thresholdDb}
                  onChange={(e) =>
                    setEditingZone({ ...editingZone, thresholdDb: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Quiet Hours Curfew
                </label>
                <input
                  type="text"
                  value={editingZone.quietHours}
                  onChange={(e) =>
                    setEditingZone({ ...editingZone, quietHours: e.target.value })
                  }
                  className="w-full bg-black/60 text-slate-100 font-mono text-xs px-3 py-2 rounded-xl border border-white/10 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-400 text-slate-950 text-xs font-mono font-bold uppercase hover:bg-cyan-300 transition-colors shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
