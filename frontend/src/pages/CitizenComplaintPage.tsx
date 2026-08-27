import React, { useState, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Link } from 'react-router-dom';
import { ComplaintReport } from '../types';

export const CitizenComplaintPage: React.FC = () => {
  const { createComplaint, getComplaintById } = useAppData();

  // Active Tab: 'file' | 'track'
  const [activeTab, setActiveTab] = useState<'file' | 'track'>('file');

  // Form Fields
  const [locationStr, setLocationStr] = useState('');
  const [category, setCategory] = useState('Modified Vehicular Exhaust');
  const [description, setDescription] = useState('');
  const [complainantName, setComplainantName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<ComplaintReport | null>(null);

  // Audio Upload & Live Recording
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Tracking Search
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<ComplaintReport | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);

  // GPS Auto Detect
  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStr(`Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Current GPS)`);
        },
        () => {
          setLocationStr('Downtown Central Corridor, 4th & Pike');
        }
      );
    }
  };

  // Mic Recording
  const startCitizenMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(blob);
        setIsRecordingAudio(false);
      };

      mr.start();
      setIsRecordingAudio(true);
    } catch {
      alert('Microphone permission was denied or unavailable.');
    }
  };

  const stopCitizenMic = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Submit Complaint
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationStr.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createComplaint(
        {
          title: `${category} Disturbance`,
          classification: category,
          location: locationStr,
          description,
          submittedBy: complainantName || 'Anonymous Resident',
          contactEmail,
          contactPhone,
        },
        recordedAudioBlob || audioFile || undefined
      );

      setSubmittedComplaint(created);
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
    }
  };

  // Track Complaint by ID
  const handleSearchTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setIsSearchingTrack(true);
    setTrackError(null);
    setTrackedComplaint(null);

    const result = await getComplaintById(trackQuery);
    setIsSearchingTrack(false);

    if (result) {
      setTrackedComplaint(result);
    } else {
      setTrackError(`No complaint record found matching "${trackQuery}". Please verify your ticket reference ID.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col antialiased">
      {/* Public Top Navbar (Light Theme) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <span className="material-symbols-outlined text-2xl">graphic_eq</span>
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">
                UrbanNoiseNet
              </span>
              <span className="text-[11px] font-mono text-cyan-700 uppercase font-semibold block">
                Municipal Civic Acoustics Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('track');
                setSubmittedComplaint(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Track My Complaint
            </button>
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Officer Command Login →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === 'file'
                ? 'border-cyan-600 text-cyan-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            File New Acoustic Report
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === 'track'
                ? 'border-cyan-600 text-cyan-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Track Existing Report
          </button>
        </div>

        {/* Tab 1: File New Complaint */}
        {activeTab === 'file' && (
          <div>
            {!submittedComplaint ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Report Urban Noise &amp; Decibel Violation
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Submit acoustic disturbance grievances directly to the Municipal Environmental Protection Division.
                    Your report will be automatically cross-referenced against real-time acoustic telemetry nodes.
                  </p>
                </div>

                <form onSubmit={handleSubmitComplaint} className="space-y-5 text-sm">
                  {/* Location Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-slate-700 text-xs uppercase tracking-wide">
                        Incident Location *
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">my_location</span>
                        <span>Use My Current Location</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 742 Evergreen Terrace / Near Waterfront Promenade"
                      value={locationStr}
                      onChange={(e) => setLocationStr(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600/30 focus:border-cyan-600 transition-all text-sm"
                    />
                  </div>

                  {/* Noise Category */}
                  <div>
                    <label className="block font-semibold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                      Disturbance Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600/30 focus:border-cyan-600 transition-all text-sm"
                    >
                      <option value="Modified Vehicular Exhaust">Modified Vehicular Exhaust / Street Racing</option>
                      <option value="Loud Commercial Audio / PA">Commercial Audio / Nightclub PA / Bass</option>
                      <option value="Illegal Construction / Curfew Violation">Illegal Construction / Quiet-Hour Power Tools</option>
                      <option value="Multi-Tone Air Horn / Siren Abuse">Air Horn / Siren Abuse</option>
                      <option value="Industrial Machinery Noise">Industrial Machinery / HVAC Resonance</option>
                      <option value="Residential Party / Loud Music">Residential Party / Excessive Decibels</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-semibold text-slate-700 text-xs uppercase tracking-wide mb-1.5">
                      Disturbance Details &amp; Frequency *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Please describe the noise duration, peak times, and any identifying vehicle or property details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600/30 focus:border-cyan-600 transition-all text-sm"
                    />
                  </div>

                  {/* Optional Audio Evidence Attachment */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 text-xs uppercase tracking-wide">
                        Optional Audio Evidence
                      </span>
                      <span className="text-[11px] text-slate-500">.wav, .mp3, .webm</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Live Mic Button */}
                      {!isRecordingAudio ? (
                        <button
                          type="button"
                          onClick={startCitizenMic}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-cyan-600 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base text-cyan-600">mic</span>
                          <span>Record Audio Clip</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopCitizenMic}
                          className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 animate-pulse cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">stop</span>
                          <span>Stop Recording</span>
                        </button>
                      )}

                      {/* File Upload */}
                      <label className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-cyan-600 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-base text-slate-500">upload_file</span>
                        <span>Upload Audio File</span>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        />
                      </label>

                      {/* Evidence Tag */}
                      {(recordedAudioBlob || audioFile) && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Audio Evidence Attached</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Optional Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 text-xs mb-1">Your Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="Jane Doe"
                        value={complainantName}
                        onChange={(e) => setComplainantName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1">Email (For Updates)</label>
                      <input
                        type="email"
                        placeholder="jane@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs mb-1">Phone (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-cyan-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>{isSubmitting ? 'Transmitting Official Report...' : 'Submit Official Noise Complaint'}</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Success Confirmation Card */
              <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in">
                <div className="flex items-center gap-3 text-emerald-700">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Complaint Successfully Lodged</h2>
                    <p className="text-xs text-slate-500">
                      Your civic ticket has been routed to the local acoustic enforcement dispatch queue.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 uppercase">TICKET REFERENCE ID</span>
                    <span className="text-base font-bold text-cyan-700">{submittedComplaint.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">CATEGORY</span>
                    <span className="text-slate-800 font-semibold">{submittedComplaint.classification}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">LOCATION</span>
                    <span className="text-slate-800">{submittedComplaint.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">INITIAL STATUS</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                      {submittedComplaint.status}
                    </span>
                  </div>
                </div>

                {/* 3-Step Live Status Tracker */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Live Grievance Resolution Workflow
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-300 text-cyan-800 font-bold">
                      1. Submitted
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 text-slate-500">
                      2. Under Review
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 text-slate-500">
                      3. Action Taken
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSubmittedComplaint(null);
                      setLocationStr('');
                      setDescription('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    File Another Report
                  </button>
                  <button
                    onClick={() => {
                      setTrackQuery(submittedComplaint.id);
                      setActiveTab('track');
                      setTrackedComplaint(submittedComplaint);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    Track Status Online
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Track Existing Complaint */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Track Civic Grievance Resolution</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your ticket reference number (e.g. #UNC-4891) to view the investigation timeline and enforcement notes.
                </p>
              </div>

              <form onSubmit={handleSearchTrack} className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Enter reference ID (e.g. #UNC-4891)..."
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600/30 focus:border-cyan-600 font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={isSearchingTrack}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  {isSearchingTrack ? 'Locating...' : 'Track Ticket'}
                </button>
              </form>

              {trackError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{trackError}</span>
                </div>
              )}
            </div>

            {/* Tracked Ticket Result */}
            {trackedComplaint && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 uppercase">OFFICIAL CIVIC TICKET</span>
                    <h3 className="text-xl font-bold text-slate-900 font-mono">{trackedComplaint.id}</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase ${
                      trackedComplaint.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : trackedComplaint.status === 'investigating'
                        ? 'bg-cyan-100 text-cyan-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {trackedComplaint.status}
                  </span>
                </div>

                {/* 3-Step Visual Tracker */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                    <span>PROGRESS: {trackedComplaint.progress}%</span>
                    <span>{trackedComplaint.status === 'resolved' ? 'Resolution Complete' : 'Active Investigation'}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-600 h-full transition-all duration-500"
                      style={{ width: `${trackedComplaint.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block">INCIDENT</span>
                    <span className="text-slate-800 font-semibold">{trackedComplaint.title}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block">LOCATION</span>
                    <span className="text-slate-800">{trackedComplaint.location}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block">FILED AT</span>
                    <span className="text-slate-800">{trackedComplaint.timestamp}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block">CATEGORY</span>
                    <span className="text-slate-800">{trackedComplaint.classification}</span>
                  </div>
                </div>

                {/* Officer Notes if Available */}
                {trackedComplaint.officerNotes && (
                  <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-cyan-800 block">
                      Officer Enforcement Action
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {trackedComplaint.officerNotes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        UrbanNoiseNet Civic Acoustic Governance • City Department of Environmental Protection &amp; Public Health
      </footer>
    </div>
  );
};
