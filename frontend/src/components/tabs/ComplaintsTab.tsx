import React, { useState } from 'react';
import { ComplaintReport } from '../../types';
import { playChirp } from '../../utils/audioSynth';

interface ComplaintsTabProps {
  complaints: ComplaintReport[];
  onAddComplaint: (complaint: ComplaintReport) => void;
}

export const ComplaintsTab: React.FC<ComplaintsTabProps> = ({
  complaints,
  onAddComplaint,
}) => {
  const [selectedLocation, setSelectedLocation] = useState('Sector 4, Main Artery');
  const [classification, setClassification] = useState('');
  const [incidentLogs, setIncidentLogs] = useState('');
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const LOCATIONS = [
    'Sector 4, Main Artery',
    'North Lynnwood Residential Zone',
    'Aerocity Road Flyover',
    'Downtown Pine Street Corridor',
    'Industrial Gate 3 Boundary',
    'Harbor West End Waterfront',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classification) {
      alert('Please select an anomaly classification.');
      return;
    }

    setIsSubmitting(true);
    playChirp(true);

    setTimeout(() => {
      const newReport: ComplaintReport = {
        id: `#NX-${Math.floor(Math.random() * 900 + 100)}`,
        title:
          classification === 'industrial'
            ? 'Heavy Industrial Sound Anomaly'
            : classification === 'vehicular'
            ? 'Unregulated Exhaust Resonance'
            : classification === 'commercial'
            ? 'Commercial PA Audio Bleed'
            : classification === 'residential'
            ? 'Residential Quiet Hours Breach'
            : 'Unidentified Acoustic Event',
        timestamp: 'Just now',
        classification: classification,
        status: 'review',
        location: selectedLocation,
        description: incidentLogs || 'Citizen submitted decibel breach telemetry.',
        progress: 35,
        audioFileName: audioFile || 'spectral_capture_01.wav',
      };

      onAddComplaint(newReport);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setIncidentLogs('');
      setAudioFile(null);
      setClassification('');

      setTimeout(() => setSubmittedSuccess(false), 4000);
    }, 1000);
  };

  const handleSimulateAudioUpload = () => {
    setAudioFile('acoustic_sample_48khz.wav');
    playChirp(true);
  };

  return (
    <main className="relative w-full pt-20 pb-28 min-h-screen bg-[#030712] font-sans text-slate-200">
      <div className="flex flex-col w-full max-w-xl mx-auto px-4 md:px-6 gap-6">
        {/* Header Section */}
        <section className="flex flex-col gap-1">
          <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <span className="material-symbols-outlined text-[28px]">campaign</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Report Disturbance
          </h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Submit an acoustic anomaly report for rapid civic dispatch.
          </p>
        </section>

        {/* Success Alert */}
        {submittedSuccess && (
          <div className="p-3.5 bg-cyan-500/20 border border-cyan-400/50 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-base">verified</span>
            Transmission dispatched to acoustic response queue successfully!
          </div>
        )}

        {/* Interactive Form */}
        <section>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 bg-[#090d16]/90 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/20 relative overflow-hidden group shadow-lg"
          >
            {/* Incident Coordinates with Map Reticle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-cyan-400">
                  my_location
                </span>
                Incident Coordinates
              </label>

              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-900 border border-white/10 group/map cursor-crosshair">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/map:scale-105"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCf7a5KlvXZxltykyDzgPjf3yDpOGr876biU8_9UIdLrNa9b2EeqSb3wVdK0Lf6Y_LwIwwZQ11Hft41t-EIX4DK9fy29bbY2oYFq1gsmqDXlf1pnDM3UBcem2HLa4jwi9-4AnbAEHBu3aiaJYJMq-N4GRp5aj15Em8VNHm81Q6CaQEUMvV376a4Wc-kw6BVJLcYYAt9DNrTW8AEaL6bbZ7f5Rw7dxGpA7A-Fu8BGpsUuIN4-7CBow4')`,
                    filter: 'brightness(0.65) contrast(1.2)',
                  }}
                />

                {/* Central Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full border border-cyan-400/60 flex items-center justify-center relative">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
                    <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-30" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 right-2 bg-[#030712]/90 backdrop-blur-sm rounded-lg py-2 px-3 flex justify-between items-center text-xs font-mono border border-cyan-500/30">
                  <span className="text-slate-200 truncate pr-2">{selectedLocation}</span>
                  <button
                    onClick={() => setShowLocationPicker(true)}
                    className="text-cyan-400 hover:text-cyan-300 uppercase text-[10px] tracking-wider font-bold shrink-0"
                    type="button"
                  >
                    Relocate
                  </button>
                </div>
              </div>
            </div>

            {/* Anomaly Classification */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-amber-400">
                  category
                </span>
                Anomaly Classification
              </label>
              <div className="relative">
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="w-full bg-black/60 text-slate-200 text-xs font-sans rounded-xl py-3 px-3.5 appearance-none focus:outline-none focus:border-cyan-400 border border-white/10 transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Select classification...
                  </option>
                  <option value="industrial">Heavy Industrial Operation</option>
                  <option value="vehicular">Unregulated Vehicular Mod</option>
                  <option value="commercial">Commercial PA Bleed</option>
                  <option value="residential">Residential Disturbance</option>
                  <option value="unknown">Unidentified Acoustic Event</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-base">
                  expand_more
                </span>
              </div>
            </div>

            {/* Description Logs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-cyan-400">
                  description
                </span>
                Incident Logs
              </label>
              <textarea
                value={incidentLogs}
                onChange={(e) => setIncidentLogs(e.target.value)}
                placeholder="Detail the duration, frequency, and perceptual impact of the anomaly..."
                rows={3}
                className="w-full bg-black/60 text-slate-200 text-xs font-sans rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-cyan-400 border border-white/10 resize-none transition-all placeholder-slate-600"
              />
            </div>

            {/* Audio Spectral Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-rose-400">
                  graphic_eq
                </span>
                Spectral Evidence
              </label>
              <div
                onClick={handleSimulateAudioUpload}
                className={`w-full bg-black/40 border border-dashed rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  audioFile
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-slate-700 hover:border-cyan-400/60'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                  <span className="material-symbols-outlined text-base">
                    {audioFile ? 'mic' : 'upload_file'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs font-medium text-slate-200 block">
                    {audioFile ? `Attached: ${audioFile}` : 'Click to attach .WAV or .FLAC recording'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Max capacity: 15MB • 48kHz lossless
                  </span>
                </div>
              </div>
            </div>

            {/* Transmit Button */}
            <button
              disabled={isSubmitting}
              type="submit"
              className="mt-1 w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl shadow-[0_4px_16px_rgba(56,189,248,0.35)] transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              <span>{isSubmitting ? 'Transmitting Telemetry...' : 'Transmit Report'}</span>
              <span className="material-symbols-outlined text-[18px]">
                {isSubmitting ? 'sync' : 'send'}
              </span>
            </button>
          </form>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-60" />

        {/* Active Transmissions Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-cyan-400">
                history
              </span>
              Active Transmissions
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded-md border border-white/5">
              {complaints.length} Records
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {complaints.map((comp) => {
              const isResolved = comp.status === 'resolved';
              return (
                <div
                  key={comp.id}
                  className={`rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm border border-white/5 transition-colors ${
                    isResolved
                      ? 'bg-slate-900/40 opacity-70'
                      : 'bg-[#090d16]/90 hover:bg-slate-900/80 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`text-xs font-semibold ${
                          isResolved
                            ? 'line-through text-slate-500'
                            : 'text-slate-200'
                        }`}
                      >
                        {comp.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">
                          calendar_today
                        </span>
                        {comp.timestamp} • ID: {comp.id}
                      </span>
                      <span className="text-[10px] text-slate-400">{comp.location}</span>
                    </div>

                    <div
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        comp.status === 'review'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : comp.status === 'queued'
                          ? 'bg-slate-800 text-slate-300 border border-white/10'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {comp.status === 'review' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                      {comp.status === 'resolved' && (
                        <span className="material-symbols-outlined text-xs">
                          check_circle
                        </span>
                      )}
                      {comp.status}
                    </div>
                  </div>

                  {!isResolved && (
                    <div className="w-full bg-slate-900 rounded-full h-1 mt-0.5 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${comp.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Relocate Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowLocationPicker(false)}
          />
          <div className="relative w-full max-w-sm bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl p-4 z-10 space-y-3">
            <h3 className="font-bold text-sm text-slate-100">Select Incident Coordinates</h3>
            <div className="space-y-1 font-mono text-xs">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocationPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between ${
                    selectedLocation === loc
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{loc}</span>
                  {selectedLocation === loc && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
