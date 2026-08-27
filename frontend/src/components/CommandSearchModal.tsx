import React, { useState, useEffect } from 'react';
import { TabType, GeoZone, ChallanRecord } from '../types';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
  zones: GeoZone[];
  challans: ChallanRecord[];
  onSelectChallan: (c: ChallanRecord) => void;
  onSelectZone: (z: GeoZone) => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  zones,
  challans,
  onSelectChallan,
  onSelectZone,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(query.toLowerCase()) ||
    z.classification.toLowerCase().includes(query.toLowerCase())
  );

  const filteredChallans = challans.filter((c) =>
    c.id.toLowerCase().includes(query.toLowerCase()) ||
    c.location.toLowerCase().includes(query.toLowerCase()) ||
    c.source.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    { id: 'dash', label: 'Go to Real-time Map Dashboard', icon: 'dashboard', tab: 'dashboard' as TabType },
    { id: 'zones', label: 'Manage Acoustic Geo-Zones & Curfews', icon: 'grid_view', tab: 'zones' as TabType },
    { id: 'fines', label: 'View Noise Violations & Challans', icon: 'receipt_long', tab: 'challans' as TabType },
    { id: 'comms', label: 'Open Active Incident Dispatch Console', icon: 'radio', tab: 'dispatch' as TabType },
    { id: 'alerts', label: 'File Acoustic Disturbance Report', icon: 'campaign', tab: 'complaints' as TabType },
    { id: 'data', label: 'View 24h dB Forecast & Analytics', icon: 'monitoring', tab: 'analytics' as TabType },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-cyan-500/20 bg-black/40">
          <span className="material-symbols-outlined text-cyan-400 text-2xl mr-3">
            search
          </span>
          <input
            autoFocus
            type="text"
            placeholder="Search zones, challan IDs, nodes, or trigger actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-100 p-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Navigation */}
          {!query && (
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase px-2 mb-1.5 tracking-wider">
                Quick Navigation
              </div>
              <div className="space-y-1">
                {quickActions.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => {
                      onNavigate(act.tab);
                      onClose();
                    }}
                    className="w-full flex items-center px-3 py-2 rounded-xl text-left text-sm text-slate-200 hover:bg-slate-900 hover:text-cyan-300 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-cyan-400 text-lg mr-3 group-hover:scale-110 transition-transform">
                      {act.icon}
                    </span>
                    <span>{act.label}</span>
                    <span className="material-symbols-outlined text-slate-500 text-sm ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Geo-Zones Search Results */}
          {filteredZones.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase px-2 mb-1.5 tracking-wider">
                Geo-Zones ({filteredZones.length})
              </div>
              <div className="space-y-1">
                {filteredZones.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => {
                      onSelectZone(z);
                      onNavigate('zones');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left bg-black/40 hover:bg-slate-900 transition-colors border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-cyan-400 text-lg">
                        grid_view
                      </span>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{z.name}</div>
                        <div className="text-xs text-slate-400">{z.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-cyan-300">{z.currentDb} dB</span>
                      <span className="block text-[10px] font-mono uppercase text-slate-500">
                        {z.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Challan Violations Search Results */}
          {filteredChallans.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase px-2 mb-1.5 tracking-wider">
                Challan Violations ({filteredChallans.length})
              </div>
              <div className="space-y-1">
                {filteredChallans.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectChallan(c);
                      onNavigate('challans');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left bg-black/40 hover:bg-slate-900 transition-colors border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-rose-400 text-lg">
                        receipt_long
                      </span>
                      <div>
                        <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                          <span className="font-mono text-xs text-cyan-300">{c.id}</span>
                          <span>{c.location}</span>
                        </div>
                        <div className="text-xs text-slate-400">{c.source} • {c.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-rose-400">{c.db} dB</span>
                      <span className="block text-[10px] font-mono uppercase text-slate-500">
                        {c.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredZones.length === 0 && filteredChallans.length === 0 && (
            <div className="py-8 text-center text-slate-500 font-mono text-sm">
              No matching acoustic records or geo-zones found for "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-black/50 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Acoustic Neural Network Search</span>
          <span>ENTER to select • ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
