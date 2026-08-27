import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { MapCanvas } from '../components/MapCanvas';
import { GeoZone } from '../types';
import { useNavigate } from 'react-router-dom';

export const ZonesPage: React.FC = () => {
  const {
    zones,
    updateZone,
    createZone,
    deleteZone,
    draftPolygon,
    setDraftPolygon,
    setSelectedZone,
    loading,
  } = useAppData();
  const navigate = useNavigate();

  const [selectedZoneDetail, setSelectedZoneDetail] = useState<GeoZone | null>(zones[0] || null);
  const [isNewZoneModalOpen, setIsNewZoneModalOpen] = useState(false);
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);

  // New Zone Form State
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDesc, setNewZoneDesc] = useState('');
  const [newZoneClass, setNewZoneClass] = useState<'residential' | 'commercial' | 'industrial' | 'custom'>('commercial');
  const [newZoneThreshold, setNewZoneThreshold] = useState<number>(70);
  const [newZoneQuietHours, setNewZoneQuietHours] = useState('22:00 - 06:00');
  const [newZoneAllowExceptions, setNewZoneAllowExceptions] = useState(false);

  // Auto-open modal if draftPolygon exists from Dashboard freehand drawing tool
  useEffect(() => {
    if (draftPolygon && draftPolygon.length >= 3) {
      setIsNewZoneModalOpen(true);
      setNewZoneName(`Custom Geofence ${zones.length + 1}`);
      setNewZoneDesc(`Defined via manual telemetry coordinate tracing (${draftPolygon.length} vertices)`);
      setNewZoneClass('custom');
    }
  }, [draftPolygon]);

  const handleToggleZoneActive = async (zone: GeoZone, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = zone.status === 'active' ? 'inactive' : 'active';
    await updateZone(zone.id, { status: newStatus });
  };

  const handleDeleteZone = async (zoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveKebabId(null);
    if (window.confirm('Are you sure you want to delete this monitored acoustic geofence?')) {
      await deleteZone(zoneId);
      if (selectedZoneDetail?.id === zoneId) {
        setSelectedZoneDetail(null);
      }
    }
  };

  const handleDuplicateZone = async (zone: GeoZone, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveKebabId(null);
    await createZone({
      name: `${zone.name} (Copy)`,
      description: zone.description,
      classification: zone.classification,
      status: 'active',
      currentDb: zone.currentDb,
      thresholdDb: zone.thresholdDb,
      quietHours: zone.quietHours,
      sparkline: [...zone.sparkline],
      allowExceptions: zone.allowExceptions,
      activeSensors: zone.activeSensors,
      color: zone.color,
      polygon: zone.polygon,
    });
  };

  const handleCreateZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const colors: Record<string, string> = {
      residential: '#22d3ee',
      commercial: '#38bdf8',
      industrial: '#f59e0b',
      custom: '#a855f7',
    };

    const newZone = await createZone({
      name: newZoneName,
      description: newZoneDesc || 'Municipal monitored acoustic sector',
      classification: newZoneClass,
      status: 'active',
      currentDb: +(55 + Math.random() * 20).toFixed(1),
      thresholdDb: newZoneThreshold,
      quietHours: newZoneQuietHours,
      sparkline: [58, 62, 65, 71, 68, 64, newZoneThreshold - 5],
      allowExceptions: newZoneAllowExceptions,
      activeSensors: 4,
      color: colors[newZoneClass] || '#22d3ee',
      polygon: draftPolygon || undefined,
    });

    setDraftPolygon(null);
    setIsNewZoneModalOpen(false);
    setSelectedZoneDetail(newZone);

    // Reset Form
    setNewZoneName('');
    setNewZoneDesc('');
  };

  const handleOpenAnalytics = (zone: GeoZone) => {
    setSelectedZone(zone);
    navigate('/analytics');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">radar</span>
            <span>Acoustic Geofencing &amp; Zone Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure automated sound pressure thresholds, decibel curfews, and exception policies per sector.
          </p>
        </div>

        <button
          onClick={() => setIsNewZoneModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add_location_alt</span>
          <span>+ New Acoustic Zone</span>
        </button>
      </div>

      {/* Main Grid: Zones List (4 cols) + Map Visualizer (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Zones List Sidebar */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-400">
            <span>ACTIVE GEOFENCES ({zones.length})</span>
            <span>{loading.zones ? 'Refreshing...' : 'Auto-Sync'}</span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {zones.map((zone) => {
              const isSelected = selectedZoneDetail?.id === zone.id;
              const isKebabOpen = activeKebabId === zone.id;

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneDetail(zone)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-400 ring-1 ring-cyan-400/30'
                      : 'bg-[#090d16]/90 border-cyan-500/20 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: zone.color || '#22d3ee' }}
                        />
                        <h3 className="font-bold text-sm text-slate-100 truncate">{zone.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            zone.classification === 'residential'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : zone.classification === 'industrial'
                              ? 'bg-amber-500/20 text-amber-300'
                              : zone.classification === 'commercial'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {zone.classification}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{zone.description}</p>
                    </div>

                    {/* Active Toggle & Kebab Menu */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleToggleZoneActive(zone, e)}
                        title={zone.status === 'active' ? 'Disable Zone' : 'Enable Zone'}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          zone.status === 'active' ? 'bg-cyan-500' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                            zone.status === 'active' ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveKebabId(isKebabOpen ? null : zone.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">more_vert</span>
                        </button>

                        {isKebabOpen && (
                          <div className="absolute right-0 mt-1 w-36 bg-[#090d16] border border-cyan-500/30 rounded-xl shadow-2xl py-1 z-40 animate-in fade-in slide-in-from-top-1">
                            <button
                              onClick={(e) => handleDuplicateZone(zone, e)}
                              className="w-full px-3 py-1.5 text-left text-xs font-mono text-slate-200 hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">content_copy</span>
                              Duplicate
                            </button>
                            <button
                              onClick={(e) => handleDeleteZone(zone.id, e)}
                              className="w-full px-3 py-1.5 text-left text-xs font-mono text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">delete</span>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">CURRENT</span>
                      <span className="font-bold text-slate-200">{zone.currentDb} dB</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">LIMIT</span>
                      <span className="font-bold text-cyan-400">{zone.thresholdDb} dB</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SENSORS</span>
                      <span className="text-slate-300">{zone.activeSensors} Active</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map View & Selected Zone Detail Card (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Map Preview */}
          <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Geofence Vector Overlay
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {zones.filter((z) => z.status === 'active').length} Active Sectors Monitored
              </span>
            </div>
            <div className="h-[360px] w-full">
              <MapCanvas showZones={true} />
            </div>
          </div>

          {/* Selected Zone Detail Panel */}
          {selectedZoneDetail && (
            <div className="bg-[#090d16]/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div>
                  <div className="text-xs font-mono text-cyan-400 uppercase">Selected Geofence</div>
                  <h3 className="text-lg font-bold text-slate-100">{selectedZoneDetail.name}</h3>
                </div>
                <button
                  onClick={() => handleOpenAnalytics(selectedZoneDetail)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View Full Analytics</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Noise Limit</span>
                  <span className="text-sm font-bold text-cyan-300">{selectedZoneDetail.thresholdDb} dBA</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Curfew Hours</span>
                  <span className="text-sm text-slate-200">{selectedZoneDetail.quietHours}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Sensor Array</span>
                  <span className="text-sm font-bold text-slate-200">{selectedZoneDetail.activeSensors} Units</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Exception Rule</span>
                  <span className="text-sm text-amber-300 font-bold">
                    {selectedZoneDetail.allowExceptions ? 'Permitted' : 'Strict'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Zone Creation Modal */}
      {isNewZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsNewZoneModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#090d16] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">add_location_alt</span>
                <h3 className="font-bold text-sm font-mono text-slate-100">Create New Acoustic Geofence</h3>
              </div>
              <button
                onClick={() => setIsNewZoneModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {draftPolygon && (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-base">polyline</span>
                <span>Polygon drafted with {draftPolygon.length} custom coordinates attached.</span>
              </div>
            )}

            <form onSubmit={handleCreateZoneSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Waterfront Promenade"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">Description &amp; Location</label>
                <input
                  type="text"
                  placeholder="Commercial boulevard with outdoor dining"
                  value={newZoneDesc}
                  onChange={(e) => setNewZoneDesc(e.target.value)}
                  className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 uppercase text-[10px]">Zoning Classification</label>
                  <select
                    value={newZoneClass}
                    onChange={(e) => setNewZoneClass(e.target.value as any)}
                    className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="residential">Residential (&lt;50 dB)</option>
                    <option value="commercial">Commercial (&lt;70 dB)</option>
                    <option value="industrial">Industrial (&lt;85 dB)</option>
                    <option value="custom">Custom Geofence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 uppercase text-[10px]">Decibel Threshold (dB)</label>
                  <input
                    type="number"
                    min="30"
                    max="120"
                    value={newZoneThreshold}
                    onChange={(e) => setNewZoneThreshold(Number(e.target.value))}
                    className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 uppercase text-[10px]">Quiet Hours Window</label>
                  <input
                    type="text"
                    value={newZoneQuietHours}
                    onChange={(e) => setNewZoneQuietHours(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="allowExceptions"
                    checked={newZoneAllowExceptions}
                    onChange={(e) => setNewZoneAllowExceptions(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                  <label htmlFor="allowExceptions" className="text-slate-300 cursor-pointer">
                    Allow Permit Exceptions
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewZoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Save Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
