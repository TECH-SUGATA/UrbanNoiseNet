import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  badgeAlertsCount?: number;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'DASH', icon: 'dashboard' },
  { id: 'zones', label: 'ZONES', icon: 'grid_view' },
  { id: 'challans', label: 'FINES', icon: 'receipt_long' },
  { id: 'dispatch', label: 'COMMS', icon: 'radio' },
  { id: 'complaints', label: 'ALERTS', icon: 'campaign' },
  { id: 'analytics', label: 'DATA', icon: 'monitoring' },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  badgeAlertsCount = 5,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#030712]/90 backdrop-blur-2xl border-t border-cyan-500/10 shadow-[0_-8px_30px_rgba(0,0,0,0.7)]">
      <div className="flex justify-between items-center h-16 px-2 md:px-6 max-w-4xl mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all relative group select-none ${
                isActive
                  ? 'text-cyan-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Top Border Glow */}
              {isActive && (
                <div className="absolute top-0 inset-x-3 h-[2px] bg-gradient-to-r from-cyan-500 via-cyan-400 to-sky-400 shadow-[0_0_12px_#38bdf8]" />
              )}

              {/* Icon with optional badge */}
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform group-active:scale-90 ${
                    isActive ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] text-cyan-300' : ''
                  }`}
                >
                  {item.icon}
                </span>

                {item.id === 'complaints' && badgeAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-rose-100 text-[9px] font-mono font-bold px-1 rounded-full border border-[#030712] shadow-[0_0_6px_rgba(244,63,94,0.5)]">
                    {badgeAlertsCount}
                  </span>
                )}
              </div>

              {/* Monospace Label */}
              <span
                className={`text-[10px] sm:text-[11px] font-mono tracking-wider mt-0.5 uppercase ${
                  isActive ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
