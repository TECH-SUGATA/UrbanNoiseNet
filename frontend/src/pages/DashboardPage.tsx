import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { LiveMicRecorder } from '../components/LiveMicRecorder';
import { MapCanvas } from '../components/MapCanvas';
import { LiveEvent, AcousticNode, GeoZone } from '../types';
import { useNavigate } from 'react-router-dom';
import { ACOUSTIC_NODES } from '../data/mockData';
import { playAcousticSound } from '../utils/audioSynth';

export const DashboardPage: React.FC = () => {
  const {
    events,
    zones,
    complaints,
    setSelectedEvent,
    setSelectedZone,
    ignoreEvent,
    loading,
    backendStatus,
  } = useAppData();
  const navigate = useNavigate();

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState<AcousticNode | null>(ACOUSTIC_NODES[0]);
  const [detailEvent, setDetailEvent] = useState<LiveEvent | null>(null);
  const [playingEventId, setPlayingEventId] = useState<string | null>(null);
  const [showIgnoreConfirmModal, setShowIgnoreConfirmModal] = useState<LiveEvent | null>(null);
  const [selectedZoneTarget, setSelectedZoneTarget] = useState<GeoZone>(zones[0] || null);

  // Compute stats
  const activeZonesCount = zones.filter((z) => z.status === 'active').length;
  const avgDb =
    events.length > 0
      ? (events.reduce((acc, curr) => acc + curr.db, 0) / events.length).toFixed(1)
      : '72.4';
  const activeAlertsCount = events.filter((e) => e.severity === 'critical' && !e.ignored).length;
  const pendingComplaintsCount = complaints.filter((c) => c.status === 'review').length;

  const handlePlaySound = (event: LiveEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingEventId === event.id) {
      setPlayingEventId(null);
    } else {
      setPlayingEventId(event.id);
      playAcousticSound(event.type, 3);
      setTimeout(() => setPlayingEventId(null), 3000);
    }
  };

  const handleGenerateChallanFromEvent = (event: LiveEvent) => {
    setSelectedEvent(event);
    navigate('/challans');
  };

  const handleNavigateToAnalyticsForZone = (zone: GeoZone) => {
    setSelectedZone(zone);
    navigate('/analytics');
  };

  return (
    <div className="space-y-6">
      {/* Top Computed Stats Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Zones */}
        <div
          onClick={() => navigate('/zones')}
          className="bg-[#090d16]/90 border border-cyan-500/20 hover:border-cyan-400/50 rounded-2xl p-4 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Active Geofences
            </span>
            <span className="material-symbols-outlined text-cyan-400 text-lg group-hover:scale-110 transition-transform">
              radar
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{activeZonesCount}</span>
            <span className="text-xs font-mono text-slate-500">/ {zones.length} Zones</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Continuous Telemetry</span>
          </div>
        </div>

        {/* Avg dB Reading */}
        <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Fleet Average dB
            </span>
            <span className="material-symbols-outlined text-amber-400 text-lg">volume_up</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-100">{avgDb}</span>
            <span className="text-xs font-mono text-amber-300 font-bold">dBA</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-400">
            WHO Guideline: &lt;65 dB Daytime
          </div>
        </div>

        {/* Active Acoustic Alerts */}
        <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Active Violations
            </span>
            <span className="material-symbols-outlined text-rose-400 text-lg">warning</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{activeAlertsCount}</span>
            <span className="text-xs font-mono text-rose-300/80">Spikes &gt;85dB</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-rose-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>Automated Citations Ready</span>
          </div>
        </div>

        {/* Pending Complaints */}
        <div
          onClick={() => navigate('/complaints-inbox')}
          className="bg-[#090d16]/90 border border-cyan-500/20 hover:border-cyan-400/50 rounded-2xl p-4 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Citizen Complaints
            </span>
            <span className="material-symbols-outlined text-cyan-400 text-lg group-hover:scale-110 transition-transform">
              inbox
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{pendingComplaintsCount}</span>
            <span className="text-xs font-mono text-cyan-300">Pending Review</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-cyan-400 group-hover:underline flex items-center gap-1">
            <span>Open Officer Inbox</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Interactive Map + Live Event Feed + Mic Test */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Event Feed & Live Mic Recorder (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Live Mic Test Panel */}
          <LiveMicRecorder />

          {/* Live Noise Event Feed */}
          <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-lg">sensors</span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Live Event Telemetry Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {loading.events ? 'Polling...' : `${events.length} Events`}
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {events.map((event) => {
                const isPlaying = playingEventId === event.id;
                const isSelected = detailEvent?.id === event.id;

                return (
                  <div
                    key={event.id}
                    onClick={() => setDetailEvent(event)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/30'
                        : event.ignored
                        ? 'bg-black/30 border-white/5 opacity-50'
                        : event.severity === 'critical'
                        ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                        : 'bg-black/40 border-white/5 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handlePlaySound(event, e)}
                          title="Play Acoustic Waveform Synthesis"
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isPlaying
                              ? 'bg-cyan-400 text-slate-950 animate-pulse'
                              : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isPlaying ? 'volume_up' : 'play_arrow'}
                          </span>
                        </button>
                        <div>
                          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{event.title}</span>
                            {event.ignored && (
                              <span className="text-[9px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.2 rounded">
                                Ignored
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {event.zone} • {event.timeAgo}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-bold font-mono ${
                            event.db > 85
                              ? 'text-rose-400'
                              : event.db > 75
                              ? 'text-amber-400'
                              : 'text-cyan-300'
                          }`}
                        >
                          {event.db} dB
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Interactive Map Canvas + Floating Toolbar (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Map Card */}
          <div className="relative bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-lg">public</span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Acoustic Spatial Map &amp; Geofences
                </h3>
              </div>

              {/* Toolbar: Pen Tool for Drawing Geofences */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDrawingMode(!isDrawingMode)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDrawingMode
                      ? 'bg-cyan-400 text-slate-950 font-bold ring-2 ring-cyan-400/40'
                      : 'bg-black/50 hover:bg-slate-900 text-slate-300 border border-cyan-500/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">edit_location_alt</span>
                  <span>{isDrawingMode ? 'Pen Tool Active' : 'Draw Geofence'}</span>
                </button>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="h-[440px] w-full">
              <MapCanvas
                isDrawingMode={isDrawingMode}
                onToggleDrawingMode={setIsDrawingMode}
                onSelectNode={(node) => setSelectedNode(node)}
                selectedNodeId={selectedNode?.id}
                showZones={true}
              />
            </div>

            {/* Selected Node Bottom Ribbon */}
            {selectedNode && (
              <div className="mt-3 p-3 rounded-xl bg-black/50 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                    <span className="material-symbols-outlined text-base">sensors</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">{selectedNode.name}</div>
                    <div className="text-[10px] text-slate-500">{selectedNode.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Current SPL</span>
                    <span className="font-bold text-cyan-300">{selectedNode.currentDb} dBA</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Peak Level</span>
                    <span className="font-bold text-rose-400">{selectedNode.peakDb} dBA</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Frequency</span>
                    <span className="text-slate-300">{selectedNode.dominantFrequency}</span>
                  </div>
                  <button
                    onClick={() => navigate('/dispatch')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono border border-cyan-500/40 transition-colors cursor-pointer"
                  >
                    Dispatch Unit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Zone Persistence Timeline & WHO Health Risk Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Zone Persistence Timeline */}
            <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Zone Telemetry Persistence
                  </h4>
                  <select
                    value={selectedZoneTarget?.id || ''}
                    onChange={(e) => {
                      const found = zones.find((z) => z.id === e.target.value);
                      if (found) setSelectedZoneTarget(found);
                    }}
                    className="bg-black/50 border border-cyan-500/20 rounded-lg px-2 py-1 text-[11px] font-mono text-cyan-300"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold font-mono text-slate-100">
                    {selectedZoneTarget?.currentDb || 74.8}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">dB Ambient</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    (Limit: {selectedZoneTarget?.thresholdDb || 70} dB)
                  </span>
                </div>

                {/* Sparkline Visual */}
                <div className="mt-3 h-12 flex items-end gap-1.5 bg-black/40 p-2 rounded-xl border border-white/5">
                  {(selectedZoneTarget?.sparkline || [65, 70, 74, 82, 79, 75, 74.8]).map((val, i) => {
                    const heightPct = Math.min(100, Math.max(20, (val / 100) * 100));
                    return (
                      <div
                        key={i}
                        style={{ height: `${heightPct}%` }}
                        className={`flex-1 rounded-t-sm transition-all ${
                          val > 80 ? 'bg-rose-500' : val > 70 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        title={`${val} dB`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Quiet Hours: {selectedZoneTarget?.quietHours || '22:00 - 06:00'}
                </span>
                <button
                  onClick={() => handleNavigateToAnalyticsForZone(selectedZoneTarget)}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Analytics</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* WHO Health Risk Matrix Gauge */}
            <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    WHO Acoustic Health Risk
                  </h4>
                  <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
                    ISO 1996 Standard
                  </span>
                </div>

                <div className="space-y-2 mt-3">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-mono text-slate-300">&lt; 65 dB Daytime</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Safe Baseline</span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="text-xs font-mono text-slate-300">65 - 75 dB Elevated</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">Moderate Strain</span>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                      <span className="text-xs font-mono text-rose-200">&gt; 75 dB Hazardous</span>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">Auditory Risk</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 text-[10px] font-mono text-slate-400">
                Civic Exposure Index: 4.8 hrs cumulative exposure across monitored corridors today.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer for Clicked Event */}
      {detailEvent && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#090d16] border-l border-cyan-500/30 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">graphic_eq</span>
                <h3 className="font-mono font-bold text-sm text-slate-100">Telemetry Incident Log</h3>
              </div>
              <button
                onClick={() => setDetailEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="mt-6 space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase">CLASSIFICATION EVENT</div>
                <div className="text-base font-bold text-cyan-300">{detailEvent.title}</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">{detailEvent.zone}</span>
                  <span className="text-rose-400 font-bold text-sm">{detailEvent.db} dBA Peak</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">INCIDENT ID</span>
                  <span className="text-slate-200 font-bold">{detailEvent.id}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">TIMESTAMP</span>
                  <span className="text-slate-200">{detailEvent.timeAgo}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">SEVERITY</span>
                  <span className="text-rose-400 uppercase font-bold">{detailEvent.severity}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">AI CONFIDENCE</span>
                  <span className="text-cyan-300 font-bold">96.8 %</span>
                </div>
              </div>

              {/* Spectral Visualization */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase">Acoustic Signature Sample</span>
                <div className="h-16 bg-black/60 rounded-xl p-2 border border-white/10 flex items-end justify-between gap-0.5">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const height = 20 + Math.sin(i * 0.4) * 60 + (i % 3) * 10;
                    return (
                      <div
                        key={i}
                        style={{ height: `${height}%` }}
                        className={`flex-1 rounded-t-sm ${
                          height > 70 ? 'bg-rose-500' : height > 40 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-cyan-500/20">
            <button
              onClick={() => handleGenerateChallanFromEvent(detailEvent)}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              Generate Citation E-Challan
            </button>

            {detailEvent.type === 'construction' && (
              <button
                onClick={() => setShowIgnoreConfirmModal(detailEvent)}
                className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">flag</span>
                Ignore &amp; Flag Construction Exception
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ignore & Flag Confirmation Modal */}
      {showIgnoreConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowIgnoreConfirmModal(null)}
          />
          <div className="relative w-full max-w-md bg-[#090d16] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 z-10">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="font-bold text-sm font-mono uppercase">Confirm Construction Exception</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Flagging this incident as an approved construction acoustic exception will suppress
              automated citation generation for event <span className="font-mono text-amber-300">{showIgnoreConfirmModal.id}</span>.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowIgnoreConfirmModal(null)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-mono text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  ignoreEvent(showIgnoreConfirmModal.id);
                  setShowIgnoreConfirmModal(null);
                  setDetailEvent(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs cursor-pointer"
              >
                Confirm &amp; Flag Exception
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
