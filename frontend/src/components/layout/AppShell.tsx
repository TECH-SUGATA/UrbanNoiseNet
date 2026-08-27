import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { CommandSearchModal } from '../CommandSearchModal';
import { OfficerProfileModal } from '../OfficerProfileModal';
import { NotificationsModal } from '../NotificationsModal';
import { ChallanPdfModal } from '../ChallanPdfModal';
import { ChallanRecord } from '../../types';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendStatus, complaints, zones, challans, setSelectedEvent, setSelectedZone } = useAppData();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activePdfChallan, setActivePdfChallan] = useState<ChallanRecord | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pendingComplaintsCount = complaints.filter((c) => c.status === 'review').length;

  const NAV_ITEMS = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'Zones', path: '/zones', icon: 'radar' },
    { label: 'Challans', path: '/challans', icon: 'receipt_long' },
    { label: 'Dispatch', path: '/dispatch', icon: 'local_police' },
    {
      label: 'Complaints',
      path: '/complaints-inbox',
      icon: 'inbox',
      badge: pendingComplaintsCount > 0 ? pendingComplaintsCount : undefined,
    },
    { label: 'Analytics', path: '/analytics', icon: 'insights' },
  ];

  // Derive breadcrumbs
  const getBreadcrumbs = () => {
    const p = location.pathname;
    if (p === '/') return ['Command Center', 'Live Telemetry & Acoustic Map'];
    if (p === '/zones') return ['Command Center', 'Geofencing & Acoustic Zones'];
    if (p === '/challans') return ['Enforcement', 'E-Challan Citation Records'];
    if (p === '/dispatch') return ['Enforcement', 'Emergency Acoustic Dispatch'];
    if (p === '/complaints-inbox') return ['Civic Governance', 'Officer Complaints Inbox'];
    if (p === '/analytics') return ['Analytics', 'Telemetry Trends & AI Forecasting'];
    if (p === '/settings') return ['System', 'Platform Configuration & FastAPI Endpoints'];
    return ['Command Center', 'Overview'];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Left Persistent Navigation Rail */}
      <aside className="w-64 bg-[#090d16] border-r border-cyan-500/20 flex flex-col justify-between shrink-0 z-30 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div>
          <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-lg shadow-cyan-500/10">
                <span className="material-symbols-outlined text-xl">graphic_eq</span>
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-100 group-hover:text-cyan-300 transition-colors">
                  UrbanNoiseNet
                </h1>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Acoustic Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Command Modules
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all relative ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 font-bold border-l-4 border-cyan-400 pl-2.5 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Rail: Public Portal Link & Settings */}
        <div className="p-3 border-t border-cyan-500/20 space-y-1">
          <Link
            to="/complaints"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">public</span>
              <span>Citizen Portal</span>
            </div>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl font-mono text-xs transition-colors ${
              location.pathname === '/settings'
                ? 'bg-cyan-500/15 text-cyan-300 font-bold border-l-4 border-cyan-400 pl-2.5'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
            }`}
          >
            <span className="material-symbols-outlined text-lg">tune</span>
            <span>Settings &amp; APIs</span>
          </Link>

          {/* Backend Status Indicator Card */}
          <div className="mt-2 p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-300 text-[10px]">
                {backendStatus === 'online'
                  ? 'FastAPI Connected'
                  : backendStatus === 'checking'
                  ? 'Connecting...'
                  : 'Offline (Demo Mode)'}
              </span>
            </div>
            <Link to="/settings" className="text-cyan-400 hover:underline text-[10px]">
              Config
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <header className="h-16 bg-[#090d16]/95 backdrop-blur-md border-b border-cyan-500/20 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">{breadcrumbs[0]}</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-semibold">{breadcrumbs[1]}</span>
          </div>

          {/* Search, Notifications & Officer Profile */}
          <div className="flex items-center gap-4">
            {/* Global Command Search Input */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 bg-black/50 hover:bg-slate-900 border border-cyan-500/20 hover:border-cyan-400/40 rounded-xl px-3 py-1.5 text-slate-400 text-xs font-mono transition-all w-64 justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-base text-cyan-400">search</span>
                <span>Search telemetry, nodes, challans...</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-white/5">
                ⌘K
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl bg-black/40 hover:bg-slate-900 border border-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-black animate-pulse" />
            </button>

            {/* Officer Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-black/40 hover:bg-slate-900 border border-cyan-500/20 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
                  MJ
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-200">Officer M. Jensen</div>
                  <div className="text-[10px] font-mono text-cyan-400">Badge #7741</div>
                </div>
                <span className="material-symbols-outlined text-sm text-slate-400">
                  {isUserMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#090d16] border border-cyan-500/30 rounded-xl shadow-2xl py-1 z-40 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProfileOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-mono text-slate-200 hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-cyan-400">badge</span>
                    Officer Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-mono text-slate-200 hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-cyan-400">tune</span>
                    System Settings
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-mono text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-rose-400">logout</span>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Screen Content Outlet */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-6 overflow-y-auto">{children}</main>
      </div>

      {/* Global Modals */}
      <CommandSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => {
          setIsSearchOpen(false);
          if (tab === 'dashboard') navigate('/');
          else if (tab === 'zones') navigate('/zones');
          else if (tab === 'challans') navigate('/challans');
          else if (tab === 'dispatch') navigate('/dispatch');
          else if (tab === 'complaints') navigate('/complaints-inbox');
          else if (tab === 'analytics') navigate('/analytics');
        }}
        zones={zones}
        challans={challans}
        onSelectChallan={(c) => {
          setIsSearchOpen(false);
          navigate('/challans');
        }}
        onSelectZone={(z) => {
          setSelectedZone(z);
          setIsSearchOpen(false);
          navigate('/zones');
        }}
      />

      <OfficerProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={(tab) => {
          setIsNotificationsOpen(false);
          if (tab === 'dashboard') navigate('/');
          else if (tab === 'zones') navigate('/zones');
          else if (tab === 'challans') navigate('/challans');
          else if (tab === 'dispatch') navigate('/dispatch');
          else if (tab === 'complaints') navigate('/complaints-inbox');
          else if (tab === 'analytics') navigate('/analytics');
        }}
      />

      <ChallanPdfModal
        challan={activePdfChallan}
        isOpen={Boolean(activePdfChallan)}
        onClose={() => setActivePdfChallan(null)}
      />
    </div>
  );
};
