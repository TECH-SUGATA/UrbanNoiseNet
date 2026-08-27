import React from 'react';
import { TabType } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Critical Decibel Breach - Siren Detected',
      location: 'Sector 4, Main Artery',
      db: '92 dB',
      time: '2m ago',
      type: 'critical',
      tab: 'dispatch' as TabType,
    },
    {
      id: 2,
      title: 'Contested E-Challan Filed',
      location: 'Aerocity Road (CH-9922)',
      db: '102.1 dB',
      time: '15m ago',
      type: 'warning',
      tab: 'challans' as TabType,
    },
    {
      id: 3,
      title: 'New Disturbance Complaint #NX-885',
      location: 'North Lynnwood Residential',
      db: '58 dB drone',
      time: '34m ago',
      type: 'info',
      tab: 'complaints' as TabType,
    },
    {
      id: 4,
      title: 'Quiet Hours Enforcement Active',
      location: 'North Residential Zone',
      db: 'Threshold 50 dB',
      time: '1h ago',
      type: 'normal',
      tab: 'zones' as TabType,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 pt-16 md:pr-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popover Sheet */}
      <div className="relative w-full max-w-sm bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-top-4 duration-200">
        <div className="p-4 bg-black/40 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-xl">
              notifications_active
            </span>
            <h3 className="font-bold text-sm text-slate-100">Telemetry Alerts</h3>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
              4 New
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                onNavigate(n.tab);
                onClose();
              }}
              className="w-full text-left p-3.5 hover:bg-slate-900 transition-colors flex items-start gap-3 group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'critical'
                    ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40'
                    : n.type === 'warning'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {n.type === 'critical' ? 'warning' : n.type === 'warning' ? 'gavel' : 'campaign'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                  {n.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{n.location}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/60 text-cyan-300 border border-cyan-500/20">
                    {n.db}
                  </span>
                  <span className="text-[10px] text-slate-500">{n.time}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 bg-black/40 border-t border-cyan-500/20 text-center">
          <button
            onClick={() => {
              onNavigate('dispatch');
              onClose();
            }}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-wider"
          >
            Open Dispatch Response Log
          </button>
        </div>
      </div>
    </div>
  );
};
