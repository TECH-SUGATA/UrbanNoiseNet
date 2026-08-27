import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  notificationCount: number;
}

const TAB_TITLES: Record<TabType, string> = {
  dashboard: 'DASHBOARD',
  zones: 'ZONES',
  challans: 'CHALLANS',
  dispatch: 'DISPATCH',
  complaints: 'COMPLAINTS',
  analytics: 'ANALYTICS',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  notificationCount,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#030712]/85 backdrop-blur-xl pt-safe shadow-[0_1px_12px_rgba(0,0,0,0.6)] border-b border-cyan-500/10">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <img
            alt="UrbanNoiseNet Logo"
            className="h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJnTcUCUiD8O2MrUJAVBKji-myNVJUcs53OiTC7ZIj5fIN7AJ4hdQ8XpS-Xs_YmxxnNT3wnBANULQT10QRVfISg7ZmP7Q4xXK2ZNGwNg9Y94Osd9WGYGaLPxgdqdfUkAEzW7C3ga9K6yYKIaZULmAma2x8GJs161nUgdxSYQJ7iTU1FWy4Hymyoup3ElGBSEN21RyLW8l9Gpxo7EubG7yM_3r9TI_NvoQEvmq3nsZpES63ygyZ_uE"
          />
          <span className="hidden sm:inline-block font-semibold text-sm tracking-wider text-cyan-400 uppercase font-mono">
            UrbanNoiseNet
          </span>
        </div>

        {/* Command Search Bar Trigger */}
        <div className="flex-1 flex justify-center max-w-xs mx-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center bg-slate-900/60 hover:bg-slate-800/80 rounded-xl px-3 py-2 text-slate-300 hover:text-white transition-all border border-cyan-500/20 group shadow-inner hover:border-cyan-400/40"
            title="Command Search (Ctrl+K)"
          >
            <span className="material-symbols-outlined text-[18px] text-cyan-400 group-hover:scale-110 transition-transform">
              search
            </span>
            <span className="ml-2 text-xs font-mono tracking-wider truncate uppercase">
              COMMAND SEARCH
            </span>
            <span className="hidden md:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-slate-400 border border-white/5">
              ⌘K
            </span>
          </button>
        </div>

        {/* Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNotifications}
            className="relative p-2 flex items-center justify-center text-slate-400 hover:text-cyan-300 transition-colors rounded-lg hover:bg-white/5 active:scale-95"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#030712] animate-pulse" />
            )}
          </button>

          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-cyan-500/40 hover:ring-cyan-300 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            aria-label="Officer Profile"
            title="Officer Mark Jensen - City of Seattle"
          >
            <img
              alt="Officer Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqdrn-sN0P7SAhVN8B8qSy_l8eumTmvkh21t15CwiHcihW1dObU6KVvm7sVm75YDS8m4k1vfUm_4vr8eYgNbdFbALBPD9PANNKGYDBXb4HA3foJv1PEOFdGQa1dw5YaDzsGSw7uQjRgm02-uBi7qQAGM-dJlH0cCpXANn06tEdDovNLJKGCqMAhYgY4t0J6tm-Ez7PH4Rl--muIw2Fz77gljEOth1x60HNZdEqk2nWQE4rTlATjNU"
            />
          </button>
        </div>
      </div>

      {/* Screen Subtitle Tab Name */}
      <div className="px-4 md:px-6 pb-2 flex items-center justify-between">
        <h1 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
          {TAB_TITLES[currentTab]}
        </h1>
        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
          NET_ID: US-PNW-SEA-09
        </span>
      </div>
    </header>
  );
};
