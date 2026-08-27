import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';

export const SettingsPage: React.FC = () => {
  const { apiBaseUrl, setApiBaseUrl, backendStatus, checkBackendHealth } = useAppData();

  const [inputUrl, setInputUrl] = useState(apiBaseUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    const start = performance.now();
    const isOnline = await checkBackendHealth();
    const elapsed = Math.round(performance.now() - start);
    setLatencyMs(elapsed);
    setIsTesting(false);
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(inputUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    handleTestConnection();
  };

  const API_ENDPOINTS = [
    { method: 'GET', path: '/events', desc: 'Stream/fetch live acoustic sound spikes & violations' },
    { method: 'POST', path: '/classify', desc: 'Multipart audio stream inference against classification model' },
    { method: 'GET / POST', path: '/zones', desc: 'Retrieve or register municipal acoustic geofences & polygons' },
    { method: 'PUT / DELETE', path: '/zones/{id}', desc: 'Update threshold rules or delete geofence polygon' },
    { method: 'GET / POST', path: '/challans', desc: 'Ledger citations or issue cryptographic E-Challan' },
    { method: 'GET', path: '/challans/{id}/pdf', desc: 'Generate official PDF citation document' },
    { method: 'GET / POST', path: '/complaints', desc: 'Civic grievance submission with audio attachments' },
    { method: 'GET', path: '/dispatch/nearest-station', desc: 'Calculate nearest patrol marshal station by GPS coordinates' },
    { method: 'POST', path: '/dispatch/trigger', desc: 'Execute emergency tactical dispatch & encrypted SMS alert' },
    { method: 'GET', path: '/analytics/timeseries', desc: 'Retrieve hourly telemetry vs AI forecast curve' },
    { method: 'GET', path: '/analytics/heatmap', desc: 'Aggregated Day × Hour sound exceedance matrix' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400">tune</span>
          <span>System Settings &amp; FastAPI Integration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure real-time backend endpoint URLs, telemetry sampling hardware parameters, and inspect REST endpoints.
        </p>
      </div>

      {/* Backend Base URL Configuration Card */}
      <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">lan</span>
            <h3 className="text-sm font-bold font-mono text-slate-100">FastAPI Backend Connection</h3>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : backendStatus === 'checking'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span className="text-xs font-mono font-bold text-slate-200">
              {backendStatus === 'online'
                ? `LIVE CONNECTED ${latencyMs !== null ? `(${latencyMs}ms)` : ''}`
                : backendStatus === 'checking'
                ? 'TESTING...'
                : 'OFFLINE / LOCAL DEMO FALLBACK'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveApiUrl} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">
              VITE_API_BASE_URL (Target FastAPI Server)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 bg-black/50 border border-cyan-500/20 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                {isTesting ? 'Pinging...' : 'Test Health'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transition-colors cursor-pointer"
              >
                Save URL
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>API Base URL successfully updated in client configuration.</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            The platform communicates directly with your FastAPI endpoints. If the remote service is temporarily
            offline during development, UrbanNoiseNet automatically maintains full operational fidelity via graceful
            in-memory synthetic telemetry.
          </p>
        </form>
      </div>

      {/* REST API Endpoints Specification Table */}
      <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400">api</span>
          <h3 className="text-sm font-bold font-mono text-slate-100">REST API Integration Spec</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black/50 text-[10px] text-slate-400 uppercase border-b border-cyan-500/20">
              <tr>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Endpoint Route</th>
                <th className="py-2.5 px-3">Description &amp; Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {API_ENDPOINTS.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-semibold">{ep.path}</td>
                  <td className="py-2.5 px-3 text-slate-400">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acoustic Hardware & Telemetry Calibration */}
      <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-6 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400">settings_input_antenna</span>
          <h3 className="text-sm font-bold text-slate-100">Sensor Hardware Calibration</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-black/40 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-500 block uppercase">Sampling Frequency</span>
            <span className="text-slate-100 font-bold text-sm">44.1 kHz (Web Audio)</span>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-500 block uppercase">Audio Chunk Duration</span>
            <span className="text-slate-100 font-bold text-sm">3.50 Seconds</span>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-500 block uppercase">Noise Floor Baseline</span>
            <span className="text-cyan-300 font-bold text-sm">70.0 dBA RMS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
