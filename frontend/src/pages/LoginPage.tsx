import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [badgeNumber, setBadgeNumber] = useState('7741');
  const [password, setPassword] = useState('••••••••••••');
  const [department, setDepartment] = useState('Environmental Acoustic Enforcement');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex flex-col justify-between p-4 selection:bg-cyan-500/30 selection:text-cyan-300 font-sans">
      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <span className="material-symbols-outlined text-2xl">graphic_eq</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">UrbanNoiseNet</h1>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              Municipal Control Room
            </span>
          </div>
        </div>

        <Link
          to="/complaints"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-xl border border-cyan-500/20"
        >
          <span>Public Citizen Portal</span>
          <span className="material-symbols-outlined text-xs">open_in_new</span>
        </Link>
      </div>

      {/* Center Sign In Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-[#090d16]/95 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">Officer Command Access</h2>
            <p className="text-xs text-slate-400">
              Enter your municipal enforcement credentials or use quick demo access.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                Badge / Officer ID
              </label>
              <input
                type="text"
                required
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                Department Division
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="Environmental Acoustic Enforcement">Environmental Acoustic Enforcement</option>
                <option value="Municipal Traffic & Highway Patrol">Municipal Traffic &amp; Highway Patrol</option>
                <option value="Civic Control Room Dispatch">Civic Control Room Dispatch</option>
                <option value="City Public Health Inspection">City Public Health Inspection</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                Security Passcode
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10" />
            <span className="shrink-0 mx-3 text-[10px] font-mono text-slate-500 uppercase">Or Demo Access</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <button
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-xs border border-cyan-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">badge</span>
            <span>Quick Login as Senior Officer M. Jensen</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] font-mono text-slate-500 py-2">
        UrbanNoiseNet Acoustic Intelligence • Municipal Enterprise Command System
      </footer>
    </div>
  );
};
