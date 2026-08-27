import React, { useState } from 'react';
import { TabType, LiveEvent, AcousticNode } from '../../types';
import { ACOUSTIC_NODES } from '../../data/mockData';
import { playAcousticSound } from '../../utils/audioSynth';

interface DashboardTabProps {
  onNavigate: (tab: TabType) => void;
  liveEvents: LiveEvent[];
  onSelectEvent?: (event: LiveEvent) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onNavigate,
  liveEvents,
  onSelectEvent,
}) => {
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(false);
  const [showWhoRisk, setShowWhoRisk] = useState(true);
  const [activeLayer, setActiveLayer] = useState<'heat' | 'contours' | 'sensors'>('heat');
  const [selectedNode, setSelectedNode] = useState<AcousticNode | null>(null);
  const [playingEventId, setPlayingEventId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const handlePlaySound = (event: LiveEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingEventId === event.id) {
      setPlayingEventId(null);
    } else {
      setPlayingEventId(event.id);
      playAcousticSound(event.type, 3);
      setTimeout(() => {
        setPlayingEventId(null);
      }, 3000);
    }
  };

  const handleLocationRecenter = () => {
    setMapCenter({ x: 50, y: 50 });
    setSelectedNode(ACOUSTIC_NODES[0]);
  };

  return (
    <main className="relative w-full min-h-screen bg-[#030712] overflow-hidden pt-20 pb-20 select-none">
      {/* Background Interactive Map Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Satellite Map Background Texture */}
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCf7a5KlvXZxltykyDzgPjf3yDpOGr876biU8_9UIdLrNa9b2EeqSb3wVdK0Lf6Y_LwIwwZQ11Hft41t-EIX4DK9fy29bbY2oYFq1gsmqDXlf1pnDM3UBcem2HLa4jwi9-4AnbAEHBu3aiaJYJMq-N4GRp5aj15Em8VNHm81Q6CaQEUMvV376a4Wc-kw6BVJLcYYAt9DNrTW8AEaL6bbZ7f5Rw7dxGpA7A-Fu8BGpsUuIN4-7CBow4')`,
            filter: 'brightness(0.6) contrast(1.2)',
          }}
        />

        {/* Dynamic Acoustic Heatmap Overlay based on active layer */}
        {activeLayer === 'heat' && (
          <div className="absolute inset-0 pointer-events-none opacity-60 mix-blend-screen">
            <div className="absolute top-[28%] left-[30%] w-72 h-72 rounded-full bg-gradient-to-r from-cyan-500/30 to-transparent blur-3xl" />
            <div className="absolute top-[52%] left-[60%] w-60 h-60 rounded-full bg-gradient-to-r from-rose-500/40 to-transparent blur-3xl" />
            <div className="absolute top-[40%] left-[45%] w-80 h-80 rounded-full bg-gradient-to-r from-amber-500/30 to-transparent blur-3xl" />
          </div>
        )}

        {/* SVG Grid and Radar Vectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Acoustic Zone Polygons */}
          <polygon
            points="15%,25% 42%,18% 48%,42% 20%,48%"
            fill="rgba(56, 189, 248, 0.12)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray={activeLayer === 'contours' ? '4 4' : 'none'}
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />

          <polygon
            points="54%,48% 88%,42% 92%,78% 58%,82%"
            fill="rgba(245, 158, 11, 0.14)"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />

          {/* Sound Travel Wave Lines */}
          <path
            d="M 28% 32% Q 40% 45% 55% 50%"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="opacity-60"
          />
        </svg>

        {/* Interactive Sensor Nodes with Radar Rings on Map */}
        <div className="absolute inset-0 pointer-events-auto">
          {ACOUSTIC_NODES.map((node, index) => {
            const positions = [
              { top: '35%', left: '32%' },
              { top: '56%', left: '68%' },
              { top: '48%', left: '46%' },
              { top: '65%', left: '26%' },
            ];
            const pos = positions[index % positions.length];
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                style={{ top: pos.top, left: pos.left }}
                onClick={() => setSelectedNode(node)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              >
                {/* Radar Ring */}
                <div
                  className={`absolute inset-0 w-12 h-12 -left-3.5 -top-3.5 rounded-full pointer-events-none ${
                    node.status === 'critical'
                      ? 'bg-rose-500/30 animate-radar'
                      : node.status === 'warning'
                      ? 'bg-amber-500/25 animate-radar'
                      : 'bg-cyan-400/20 animate-radar'
                  }`}
                />

                {/* Node Pip */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                    node.status === 'critical'
                      ? 'bg-rose-600 ring-2 ring-rose-400'
                      : node.status === 'warning'
                      ? 'bg-amber-500 ring-2 ring-amber-300'
                      : 'bg-cyan-400 ring-2 ring-cyan-200 shadow-[0_0_10px_#22d3ee]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[11px] text-[#030712] font-bold">
                    mic
                  </span>
                </div>

                {/* Node Tooltip Label */}
                <div className="absolute left-1/2 -translate-x-1/2 top-6 whitespace-nowrap bg-[#090d16]/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-cyan-500/20 text-[10px] font-mono text-slate-200 shadow-xl pointer-events-none group-hover:border-cyan-400">
                  <span className={node.status === 'critical' ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
                    {node.currentDb} dB
                  </span>{' '}
                  • {node.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Vignette & Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/30 to-[#030712]/80 pointer-events-none" />
      </div>

      {/* Top Floating Stats Bar */}
      <div className="relative z-10 w-full px-4 pt-2 flex flex-col gap-2 pointer-events-none">
        <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory pointer-events-auto hide-scrollbar">
          {/* Stat 1 */}
          <div
            onClick={() => onNavigate('zones')}
            className="snap-start flex-none w-32 bg-[#090d16]/80 hover:bg-[#0f172a] backdrop-blur-xl rounded-xl p-3 shadow-lg border border-cyan-500/10 hover:border-cyan-500/30 flex flex-col gap-1 cursor-pointer transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-400">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="text-[11px] font-mono uppercase">Active Zones</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">12</div>
          </div>

          {/* Stat 2 */}
          <div
            onClick={() => onNavigate('analytics')}
            className="snap-start flex-none w-32 bg-[#090d16]/80 hover:bg-[#0f172a] backdrop-blur-xl rounded-xl p-3 shadow-lg border border-cyan-500/20 hover:border-cyan-400/40 flex flex-col gap-1 cursor-pointer transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-1 text-cyan-400">
              <span className="material-symbols-outlined text-sm">graphic_eq</span>
              <span className="text-[11px] font-mono uppercase">Avg Noise</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
              68<span className="text-xs text-cyan-400/70 ml-1 font-normal">dB</span>
            </div>
          </div>

          {/* Stat 3 (Alerts) */}
          <div
            onClick={() => onNavigate('dispatch')}
            className="snap-start flex-none w-32 bg-rose-950/80 hover:bg-rose-900/80 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-rose-500/30 flex flex-col gap-1 cursor-pointer transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-1 text-rose-200">
              <span className="material-symbols-outlined text-sm animate-pulse">warning</span>
              <span className="text-[11px] font-mono uppercase">Alerts</span>
            </div>
            <div className="text-2xl font-bold text-rose-200">5</div>
          </div>

          {/* Stat 4 */}
          <div
            onClick={() => onNavigate('complaints')}
            className="snap-start flex-none w-32 bg-[#090d16]/80 hover:bg-[#0f172a] backdrop-blur-xl rounded-xl p-3 shadow-lg border border-cyan-500/10 hover:border-cyan-500/30 flex flex-col gap-1 cursor-pointer transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-1 text-slate-400 group-hover:text-amber-300">
              <span className="material-symbols-outlined text-sm">forum</span>
              <span className="text-[11px] font-mono uppercase">Complaints</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">24</div>
          </div>

          {/* Stat 5 (Sensors Uptime) */}
          <div className="snap-start flex-none w-32 bg-[#090d16]/80 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-cyan-500/10 flex flex-col gap-1">
            <div className="flex items-center gap-1 text-cyan-400">
              <span className="material-symbols-outlined text-sm">sensors</span>
              <span className="text-[11px] font-mono uppercase">Grid Nodes</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              64<span className="text-xs text-cyan-400 ml-1 font-normal">99%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Map Tools (Right Side) */}
      <div className="absolute right-4 top-40 z-20 flex flex-col gap-2.5 pointer-events-auto">
        <button
          onClick={() => {
            const next = activeLayer === 'heat' ? 'contours' : activeLayer === 'contours' ? 'sensors' : 'heat';
            setActiveLayer(next);
          }}
          className={`w-10 h-10 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-all border active:scale-90 ${
            activeLayer !== 'sensors'
              ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
              : 'bg-[#090d16]/90 text-slate-200 hover:text-cyan-400 border-white/10'
          }`}
          title="Toggle Acoustic Layers (Heatmap, Contours, Nodes)"
        >
          <span className="material-symbols-outlined text-lg">layers</span>
        </button>

        <button
          onClick={handleLocationRecenter}
          className="w-10 h-10 rounded-full bg-[#090d16]/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-200 hover:text-cyan-400 transition-all border border-white/10 active:scale-90"
          title="Recenter GPS Coordinates"
        >
          <span className="material-symbols-outlined text-lg">my_location</span>
        </button>

        <button
          onClick={() => onNavigate('complaints')}
          className="w-10 h-10 rounded-full bg-[#090d16]/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-200 hover:text-rose-400 transition-all border border-white/10 active:scale-90"
          title="Flag Sound Violation"
        >
          <span className="material-symbols-outlined text-lg">flag</span>
        </button>
      </div>

      {/* WHO Risk Score Overlay (Collapsible on top right) */}
      {showWhoRisk && (
        <div className="hidden sm:flex absolute top-40 right-16 z-20 w-64 bg-[#090d16]/90 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-cyan-500/20 flex-col gap-2 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              WHO Risk Score
            </span>
            <button
              onClick={() => setShowWhoRisk(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-amber-400 font-mono leading-none">
              7.2
            </span>
            <span className="text-xs text-slate-400 mb-0.5">/ 10 Moderate</span>
          </div>

          {/* Mini Persistence Graph */}
          <div className="w-full h-12 mt-1">
            <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 30" width="100%">
              <defs>
                <linearGradient id="chartGradDash" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,25 Q10,15 20,20 T40,10 T60,18 T80,5 T100,15 L100,30 L0,30 Z"
                fill="url(#chartGradDash)"
              />
              <path
                d="M0,25 Q10,15 20,20 T40,10 T60,18 T80,5 T100,15"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>12h ago</span>
            <span className="text-amber-400">Peak 8.4</span>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* Selected Node Details Popover */}
      {selectedNode && (
        <div className="absolute top-24 left-4 z-30 w-72 bg-[#090d16]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-cyan-500/40 animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-base">sensors</span>
              <span className="font-mono text-xs font-bold text-cyan-400">{selectedNode.id}</span>
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <h4 className="font-bold text-sm text-slate-100">{selectedNode.name}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{selectedNode.location}</p>

          <div className="grid grid-cols-2 gap-2 mt-3 bg-black/40 p-2.5 rounded-xl text-center border border-white/5">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Current dB</span>
              <div className="text-lg font-bold font-mono text-cyan-400">{selectedNode.currentDb}</div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Dominant Freq</span>
              <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">{selectedNode.dominantFrequency}</div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                onNavigate('challans');
              }}
              className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-mono uppercase hover:bg-slate-700 transition-colors"
            >
              Citations
            </button>
            <button
              onClick={() => {
                onNavigate('dispatch');
              }}
              className="flex-1 py-1.5 rounded-lg bg-cyan-400 text-slate-950 text-[11px] font-mono font-bold uppercase hover:bg-cyan-300 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            >
              Dispatch Unit
            </button>
          </div>
        </div>
      )}

      {/* Bottom Slide-up Panel (Live Feed) */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 bg-[#090d16]/95 backdrop-blur-2xl rounded-t-[1.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.8)] border-t border-cyan-500/20 pb-20 md:pb-8 transition-transform duration-300 ${
          isBottomPanelExpanded ? 'translate-y-0' : 'translate-y-[62%]'
        }`}
      >
        {/* Drag Handle */}
        <div
          onClick={() => setIsBottomPanelExpanded(!isBottomPanelExpanded)}
          className="w-full h-7 flex items-center justify-center cursor-pointer group"
        >
          <div className="w-12 h-1 bg-slate-600 group-hover:bg-cyan-400 rounded-full transition-colors" />
        </div>

        {/* Live Events Header */}
        <div className="px-4 md:px-6 pt-1 pb-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100">Live Events</h2>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_6px_#22d3ee]" />
          </div>
          <button
            onClick={() => onNavigate('challans')}
            className="text-xs font-mono text-cyan-400 uppercase hover:underline"
          >
            VIEW ALL
          </button>
        </div>

        {/* Live Feed Event List */}
        <div className="px-4 md:px-6 flex flex-col gap-2 max-h-72 overflow-y-auto">
          {liveEvents.map((evt) => {
            const isPlaying = playingEventId === evt.id;

            return (
              <div
                key={evt.id}
                onClick={() => {
                  if (onSelectEvent) onSelectEvent(evt);
                  onNavigate('challans');
                }}
                className="flex items-center justify-between p-2.5 bg-slate-900/60 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer group border border-white/5 hover:border-cyan-500/30 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {/* Icon Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ring-1 ${
                      evt.severity === 'critical'
                        ? 'bg-rose-950/60 text-rose-400 ring-rose-500/40'
                        : evt.severity === 'warning'
                        ? 'bg-amber-950/60 text-amber-400 ring-amber-500/40'
                        : 'bg-cyan-950/60 text-cyan-400 ring-cyan-500/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {evt.type === 'siren'
                        ? 'campaign'
                        : evt.type === 'construction'
                        ? 'construction'
                        : evt.type === 'exhaust'
                        ? 'two_wheeler'
                        : evt.type === 'horn'
                        ? 'volume_up'
                        : 'directions_car'}
                    </span>
                  </div>

                  {/* Title & Zone */}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {evt.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      {evt.zone} • {evt.timeAgo}
                    </span>
                  </div>
                </div>

                {/* Right: dB Badge & Sound Play Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handlePlaySound(evt, e)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isPlaying
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 animate-pulse shadow-[0_0_8px_#22d3ee]'
                        : 'bg-black/40 text-slate-400 hover:text-cyan-300 border-white/5'
                    }`}
                    title="Play synthesized acoustic sample"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isPlaying ? 'volume_up' : 'play_circle'}
                    </span>
                  </button>

                  <div
                    className={`px-2 py-0.5 rounded font-mono text-xs flex items-center gap-1.5 ${
                      evt.severity === 'critical'
                        ? 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                        : evt.severity === 'warning'
                        ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {evt.severity === 'critical' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    )}
                    {evt.db}dB
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
