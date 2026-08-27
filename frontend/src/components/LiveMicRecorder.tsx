import React, { useState, useRef, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { AudioClassificationResult } from '../types';
import { useNavigate } from 'react-router-dom';

export const LiveMicRecorder: React.FC = () => {
  const { classifyAudio, setSelectedEvent } = useAppData();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<AudioClassificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    setLastResult(null);
    audioChunksRef.current = [];

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Set up Web Audio API for live level visualizer
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // Realtime level meter loop
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // 3. Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioProcess(audioBlob);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordProgress(0);

      // 4. Progress interval (3.5 seconds record time)
      const durationMs = 3500;
      const startTimestamp = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimestamp;
        const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
        setRecordProgress(pct);

        if (elapsed >= durationMs) {
          if (timerRef.current) clearInterval(timerRef.current);
          stopRecording();
        }
      }, 50);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permission in browser settings.');
      } else {
        setErrorMessage(`Microphone error: ${error.message || 'Unable to capture audio'}`);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioProcess = async (blob: Blob) => {
    setIsProcessing(true);

    // Fetch browser geolocation
    let coords: { lat: number; lng: number } | undefined;
    try {
      coords = await new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(undefined);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(undefined),
          { timeout: 2000 }
        );
      });
    } catch {
      // ignore
    }

    try {
      const result = await classifyAudio(blob, coords);
      setLastResult(result);
    } catch (err: unknown) {
      setErrorMessage('Audio classification failed or backend offline.');
    } finally {
      setIsProcessing(false);
      setAudioLevel(0);
      setRecordProgress(0);
    }
  };

  const handleGenerateChallan = () => {
    if (!lastResult) return;
    setSelectedEvent({
      id: `EVT-${Date.now().toString().slice(-4)}`,
      title: lastResult.class_label,
      zone: lastResult.zone || 'Zone 1',
      timeAgo: 'Just now',
      db: Math.round(lastResult.db_level),
      type: (lastResult.class_label.toLowerCase().includes('exhaust')
        ? 'exhaust'
        : lastResult.class_label.toLowerCase().includes('siren')
        ? 'siren'
        : lastResult.class_label.toLowerCase().includes('horn')
        ? 'horn'
        : 'traffic') as 'exhaust' | 'siren' | 'horn' | 'traffic',
      severity: lastResult.severity,
      lat: lastResult.lat,
      lng: lastResult.lng,
    });
    navigate('/challans');
  };

  return (
    <div className="bg-[#090d16]/95 border border-cyan-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            Live Telemetry Microphone Capture
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
          Web Audio API / 44.1kHz
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-3">
        Capture acoustic environmental signature to run real-time inference against the FastAPI classification model.
      </p>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Record Action and Level Meter */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">mic</span>
              {isProcessing ? 'Processing Classification...' : 'Record 3s Audio Sample'}
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all animate-pulse shadow-lg shadow-rose-500/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">stop</span>
              Recording ({recordProgress}%) — Click to Stop
            </button>
          )}
        </div>

        {/* Live Audio Level Meter */}
        {(isRecording || isProcessing) && (
          <div className="space-y-1.5 bg-black/50 p-2.5 rounded-xl border border-cyan-500/20">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">INPUT SOUND PRESSURE LEVEL</span>
              <span className="text-cyan-300 font-bold">{audioLevel} %</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/5">
              {Array.from({ length: 24 }).map((_, i) => {
                const threshold = (i / 24) * 100;
                const isActive = audioLevel >= threshold;
                const isHigh = i > 18;
                const isMed = i > 12;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-sm transition-all duration-75 ${
                      isActive
                        ? isHigh
                          ? 'bg-rose-500'
                          : isMed
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            {isRecording && (
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-75"
                  style={{ width: `${recordProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Classification Result Card */}
        {lastResult && (
          <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-black/80 border border-cyan-500/40 rounded-xl p-3.5 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-cyan-400 text-base">verified</span>
                <span className="text-[11px] font-mono uppercase font-bold text-cyan-300">
                  FastAPI Inference Result
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  lastResult.severity === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : lastResult.severity === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {lastResult.severity}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-500 block">CLASSIFICATION</span>
                <span className="text-slate-100 font-bold truncate block">{lastResult.class_label}</span>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-500 block">AI CONFIDENCE</span>
                <span className="text-cyan-300 font-bold">{lastResult.confidence}%</span>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-500 block">MEASURED PEAK</span>
                <span className="text-rose-300 font-bold">{lastResult.db_level} dBA</span>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-500 block">GPS COORDINATES</span>
                <span className="text-slate-300 truncate block">
                  {lastResult.lat ? `${lastResult.lat.toFixed(4)}, ${lastResult.lng?.toFixed(4)}` : 'Captured (Live)'}
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={handleGenerateChallan}
                className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold border border-cyan-500/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">receipt_long</span>
                Generate E-Challan
              </button>
              <button
                onClick={() => navigate('/dispatch')}
                className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">local_police</span>
                Dispatch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
