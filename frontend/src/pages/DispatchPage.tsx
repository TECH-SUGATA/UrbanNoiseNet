import React, { useState, useEffect, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import { DispatchStation, DispatchResponse } from '../types';

export const DispatchPage: React.FC = () => {
  const { getNearestStation, triggerDispatch, loading } = useAppData();

  const [mode, setMode] = useState<'demo' | 'live_gps'>('demo');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 47.6062,
    lng: -122.3321,
  });
  const [nearestStation, setNearestStation] = useState<DispatchStation | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Detected, 2: Unit Identified, 3: SMS Sent, 4: En Route
  const [dispatchResult, setDispatchResult] = useState<DispatchResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [incidentSeverity, setIncidentSeverity] = useState<'critical' | 'warning'>('critical');
  const [officerNotes, setOfficerNotes] = useState('Excessive acoustic horn and vehicular disturbance reported.');

  const watchIdRef = useRef<number | null>(null);

  // Auto Live GPS tracking
  useEffect(() => {
    if (mode === 'live_gps' && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setCurrentCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation watch error', err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [mode]);

  // Fetch nearest station whenever coordinates change
  useEffect(() => {
    let isMounted = true;
    getNearestStation(currentCoords.lat, currentCoords.lng).then((station) => {
      if (isMounted) {
        setNearestStation(station);
        if (currentStep === 1) setCurrentStep(2);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentCoords.lat, currentCoords.lng]);

  const handleTriggerDispatch = async () => {
    setIsDispatching(true);
    setCurrentStep(2);

    try {
      const res = await triggerDispatch({
        incidentId: `INC-${Date.now().toString().slice(-4)}`,
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        severity: incidentSeverity,
        notes: officerNotes,
      });

      setDispatchResult(res);
      setCurrentStep(3);
      setToastMessage(`Encrypted SMS alert dispatched to unit ${res.station.unitCode} (${res.station.phone})`);

      // Advance to step 4: En Route
      setTimeout(() => {
        setCurrentStep(4);
        setIsDispatching(false);
      }, 1500);

      setTimeout(() => {
        setToastMessage(null);
      }, 6000);
    } catch {
      setIsDispatching(false);
    }
  };

  const handleResetDispatch = () => {
    setCurrentStep(2);
    setDispatchResult(null);
    setToastMessage(null);
  };

  const STEPS = [
    { num: 1, title: 'Acoustic Incident Detected', desc: 'Threshold exceedance & AI classification verified' },
    { num: 2, title: 'Nearest Unit Identified', desc: nearestStation ? `${nearestStation.name} (${nearestStation.distanceKm} km)` : 'Calculating telemetry distance...' },
    { num: 3, title: 'SMS Encrypted Relay Sent', desc: 'Tactical dispatch payload transmitted to patrol radio' },
    { num: 4, title: 'Unit En Route', desc: nearestStation ? `Estimated time of arrival: ${nearestStation.etaMinutes} mins` : 'Patrol moving to coordinates' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-950 border border-cyan-400 text-cyan-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-cyan-400 text-xl">send</span>
          <div className="text-xs font-mono">
            <span className="font-bold block">DISPATCH SMS RELAYED</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">local_police</span>
            <span>Emergency Acoustic Enforcement Dispatch</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rapid patrol vector routing, tactical SMS alerting, and live civic marshal deployment.
          </p>
        </div>

        {/* Mode Toggle: Demo / Auto Live GPS */}
        <div className="flex items-center gap-2 bg-[#090d16] border border-cyan-500/30 p-1 rounded-xl">
          <button
            onClick={() => setMode('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              mode === 'demo' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Manual Simulation
          </button>
          <button
            onClick={() => setMode('live_gps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'live_gps' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xs">my_location</span>
            <span>Auto Live GPS</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 4-Step Stepper & Trigger (5 cols) + Tactical Map (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 4-Step Stepper & Trigger Card */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Dispatch Status Card */}
          <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Dispatch Status Protocol
              </span>
              {currentStep === 4 ? (
                <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>DISPATCH ACTIVE</span>
                </div>
              ) : isDispatching ? (
                <div className="flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>TRANSMITTING...</span>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-slate-400 bg-black/40 px-2.5 py-1 rounded-full border border-white/5">
                  STANDBY
                </div>
              )}
            </div>

            {/* Stepper Display */}
            <div className="space-y-4 pt-2">
              {STEPS.map((s) => {
                const isPassed = currentStep > s.num;
                const isCurrent = currentStep === s.num;

                return (
                  <div key={s.num} className="flex items-start gap-3 relative">
                    {/* Connecting line */}
                    {s.num < STEPS.length && (
                      <div
                        className={`absolute left-4 top-8 w-0.5 h-8 -translate-x-1/2 transition-colors ${
                          isPassed ? 'bg-cyan-400' : 'bg-slate-800'
                        }`}
                      />
                    )}

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 z-10 transition-all ${
                        isPassed
                          ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/20'
                          : isCurrent
                          ? 'bg-cyan-950 text-cyan-300 border-2 border-cyan-400 ring-4 ring-cyan-400/20 animate-pulse'
                          : 'bg-slate-900 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {isPassed ? (
                        <span className="material-symbols-outlined text-sm">check</span>
                      ) : (
                        s.num
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-xs font-mono font-bold ${
                          isPassed || isCurrent ? 'text-slate-100' : 'text-slate-500'
                        }`}
                      >
                        {s.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form Inputs for Dispatch Trigger */}
            {currentStep < 4 && (
              <div className="pt-4 border-t border-cyan-500/20 space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 uppercase text-[10px]">Severity Class</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIncidentSeverity('critical')}
                      className={`py-1.5 px-3 rounded-xl text-center transition-colors cursor-pointer ${
                        incidentSeverity === 'critical'
                          ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold'
                          : 'bg-black/40 text-slate-400 border border-white/5'
                      }`}
                    >
                      Critical Violator (&gt;90 dB)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncidentSeverity('warning')}
                      className={`py-1.5 px-3 rounded-xl text-center transition-colors cursor-pointer ${
                        incidentSeverity === 'warning'
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-black/40 text-slate-400 border border-white/5'
                      }`}
                    >
                      Standard Warning (&gt;75 dB)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 uppercase text-[10px]">Patrol Instructions</label>
                  <textarea
                    rows={2}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  onClick={handleTriggerDispatch}
                  disabled={isDispatching || !nearestStation}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">emergency_share</span>
                  <span>{isDispatching ? 'Initiating Tactical Relay...' : 'Trigger Emergency Dispatch'}</span>
                </button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="pt-4 border-t border-cyan-500/20">
                <button
                  onClick={handleResetDispatch}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-white/10 transition-colors cursor-pointer"
                >
                  Reset / Stand Down Dispatch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tactical Vector Map & Nearest Unit Info (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tactical Map Visualizer */}
          <div className="relative bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl overflow-hidden min-h-[380px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">navigation</span>
                <span className="text-xs font-mono font-bold uppercase text-slate-200">
                  Patrol Intercept Vector Map
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-black/50 px-2 py-0.5 rounded border border-white/5">
                Target: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
              </span>
            </div>

            {/* Simulated Vector Grid Background */}
            <div className="relative flex-1 bg-black/60 rounded-xl border border-cyan-500/20 p-6 flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `radial-gradient(#22d3ee 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Connecting Vector Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1="30%"
                  y1="60%"
                  x2="70%"
                  y2="40%"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  className={currentStep === 4 ? 'animate-pulse' : ''}
                />
              </svg>

              {/* Station Marker */}
              <div className="absolute left-[26%] top-[55%] flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-500/30">
                  <span className="material-symbols-outlined text-xl">local_police</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-300 mt-1 bg-black/80 px-2 py-0.5 rounded border border-white/10">
                  {nearestStation?.unitCode || 'PATROL-7'}
                </span>
              </div>

              {/* Incident Target Marker */}
              <div className="absolute left-[68%] top-[34%] flex flex-col items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-rose-950 border-2 border-rose-400 flex items-center justify-center text-rose-300 shadow-xl shadow-rose-500/30">
                    <span className="material-symbols-outlined text-xl">warning</span>
                  </div>
                  <div className="absolute -inset-2 rounded-2xl bg-rose-500 animate-ping opacity-40" />
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-300 mt-1 bg-black/80 px-2 py-0.5 rounded border border-white/10">
                  Target Violation
                </span>
              </div>
            </div>

            {/* Station Specs Bottom Ribbon */}
            {nearestStation && (
              <div className="mt-3 p-3 rounded-xl bg-black/60 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">STATION HUB</span>
                  <span className="text-slate-200 font-semibold truncate block">{nearestStation.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">OFFICER / BADGE</span>
                  <span className="text-cyan-300 font-semibold truncate block">{nearestStation.officerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">ETA INTERCEPT</span>
                  <span className="text-emerald-400 font-bold">{nearestStation.etaMinutes} Minutes</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">DISTANCE</span>
                  <span className="text-slate-300 font-bold">{nearestStation.distanceKm} km</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
