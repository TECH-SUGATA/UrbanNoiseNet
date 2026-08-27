import React, { useState, useEffect } from 'react';
import { ChallanRecord } from '../../types';
import { playAcousticSound } from '../../utils/audioSynth';

interface ChallansTabProps {
  challans: ChallanRecord[];
  onOpenPdf: (challan: ChallanRecord) => void;
  selectedChallanInitial?: ChallanRecord | null;
}

export const ChallansTab: React.FC<ChallansTabProps> = ({
  challans,
  onOpenPdf,
  selectedChallanInitial,
}) => {
  const [selectedChallan, setSelectedChallan] = useState<ChallanRecord | null>(
    selectedChallanInitial || null
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'db' | 'time'>('time');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (selectedChallanInitial) {
      setSelectedChallan(selectedChallanInitial);
    }
  }, [selectedChallanInitial]);

  const handlePlaySound = () => {
    if (!selectedChallan) return;
    setIsPlayingAudio(true);
    playAcousticSound(selectedChallan.source, 4);
    setTimeout(() => setIsPlayingAudio(false), 4000);
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Location,Source,Decibel,Status,Timestamp,NodeID,Fine\n' +
      challans
        .map(
          (c) =>
            `${c.id},"${c.location}","${c.source}",${c.db},${c.status},"${c.timestamp}",${c.nodeId},$${c.fineAmount}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanNoiseNet_Challans_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredChallans = challans
    .filter((c) => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (
        searchQuery &&
        !c.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.source.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'db') return b.db - a.db;
      return 0; // maintain time order
    });

  const getSourceIcon = (source: string) => {
    if (source.includes('Vehicle')) return 'local_shipping';
    if (source.includes('Exhaust')) return 'two_wheeler';
    if (source.includes('Construction')) return 'construction';
    if (source.includes('Horn')) return 'volume_up';
    return 'noise_aware';
  };

  return (
    <main className="relative w-full pt-20 pb-28 min-h-screen bg-[#030712] font-sans text-slate-200">
      <div className="px-4 md:px-6 pb-6 flex flex-col gap-4 max-w-2xl mx-auto">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#090d16]/90 rounded-xl p-4 shadow-lg flex flex-col gap-2 relative overflow-hidden group hover:bg-slate-900/80 transition-colors border border-rose-500/20">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-colors" />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-400 text-lg">
                receipt_long
              </span>
              <span className="text-[11px] font-mono text-slate-400 tracking-wider uppercase">
                ISSUED (7d)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">1,432</span>
              <span className="text-xs font-mono text-rose-400 flex items-center">
                <span className="material-symbols-outlined text-sm">trending_up</span> 12%
              </span>
            </div>
          </div>

          <div className="bg-[#090d16]/90 rounded-xl p-4 shadow-lg flex flex-col gap-2 relative overflow-hidden group hover:bg-slate-900/80 transition-colors border border-amber-500/20">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors" />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-lg">
                gavel
              </span>
              <span className="text-[11px] font-mono text-slate-400 tracking-wider uppercase">
                CONTESTED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">84</span>
              <span className="text-xs font-mono text-amber-400 flex items-center">
                <span className="material-symbols-outlined text-sm">trending_down</span> 3%
              </span>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center justify-between mt-1 gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilterModal(true)}
              className="bg-[#090d16] text-slate-200 px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 hover:bg-slate-800 border border-cyan-500/20 shadow-sm active:scale-95 hover:border-cyan-400/40"
            >
              <span className="material-symbols-outlined text-base text-cyan-400">
                filter_list
              </span>{' '}
              {filterStatus.toUpperCase()}
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'time' ? 'db' : 'time')}
              className="bg-[#090d16] text-slate-200 px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 hover:bg-slate-800 border border-cyan-500/20 shadow-sm active:scale-95 hover:border-cyan-400/40"
            >
              <span className="material-symbols-outlined text-base text-cyan-400">
                sort
              </span>{' '}
              {sortBy === 'db' ? 'MAX dB' : 'RECENT'}
            </button>
          </div>
          <button
            onClick={handleExportCsv}
            className="text-cyan-400 text-xs font-mono font-semibold flex items-center gap-1 hover:text-cyan-300 py-1.5 px-2 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-base">download</span> EXPORT
          </button>
        </div>

        {/* Data List of Challans */}
        <div className="flex flex-col gap-2.5 mt-1">
          {filteredChallans.map((challan) => {
            const isCritical = challan.db >= 85;
            const isWarning = challan.db >= 75 && challan.db < 85;

            return (
              <button
                key={challan.id}
                onClick={() => setSelectedChallan(challan)}
                className="w-full text-left bg-[#090d16]/90 rounded-xl p-4 shadow-sm hover:bg-slate-900 transition-all flex items-center justify-between border border-white/5 hover:border-cyan-500/30 group active:scale-[0.99]"
              >
                <div className="flex flex-col gap-1 w-[62%]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {challan.id}
                    </span>
                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide flex items-center gap-1 ${
                        challan.status === 'issued'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : challan.status === 'contested'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          challan.status === 'issued'
                            ? 'bg-rose-400'
                            : challan.status === 'contested'
                            ? 'bg-amber-400'
                            : 'bg-slate-400'
                        }`}
                      />
                      {challan.status.toUpperCase()}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                    {challan.location}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      {getSourceIcon(challan.source)}
                    </span>{' '}
                    {challan.source}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-lg font-bold font-mono ${
                      isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'
                    }`}
                  >
                    {challan.db}
                    <span className="text-xs ml-0.5 opacity-70 font-normal">dB</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {challan.time}
                  </span>
                </div>
              </button>
            );
          })}

          {filteredChallans.length === 0 && (
            <div className="p-8 text-center bg-[#090d16] rounded-xl text-sm text-slate-400 font-mono border border-white/5">
              No violation records match the active filters.
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer (Slides up from bottom when a challan is selected) */}
      {selectedChallan && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] transition-opacity"
            onClick={() => setSelectedChallan(null)}
          />

          <div className="fixed inset-x-0 bottom-0 z-[70] bg-[#090d16] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border-t border-cyan-500/20 flex flex-col h-[85vh] max-h-[800px] animate-in slide-in-from-bottom duration-300">
            {/* Drawer Handle */}
            <div
              className="w-full flex justify-center py-3 cursor-pointer"
              onClick={() => setSelectedChallan(null)}
            >
              <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto pb-safe px-4 md:px-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-cyan-400 font-mono tracking-wider">
                    {selectedChallan.id}
                  </span>
                  <h2 className="text-xl font-bold text-slate-100 leading-tight">
                    {selectedChallan.location}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded-lg flex items-center gap-1 border border-white/5">
                      <span className="material-symbols-outlined text-[16px]">
                        {getSourceIcon(selectedChallan.source)}
                      </span>{' '}
                      {selectedChallan.source}
                    </span>
                    <div
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wide flex items-center gap-1 ${
                        selectedChallan.status === 'issued'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : selectedChallan.status === 'contested'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {selectedChallan.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <div className="text-3xl font-extrabold text-rose-400 leading-none tracking-tighter flex items-baseline font-mono">
                    {selectedChallan.db}
                    <span className="text-sm ml-1 text-rose-400/70 font-normal">dB</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 mt-1 uppercase font-bold tracking-widest">
                    VIOLATION
                  </span>
                </div>
              </div>

              {/* Satellite Map Snippet with glowing red pinpoint */}
              <div className="w-full h-44 rounded-xl overflow-hidden relative shadow-inner border border-white/10">
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAsG-6wcN6IJl5aaXnL12KuXehJWqmwPrTetLhqoYisVqzTA3aOpwD7Vfi16svz8WEG1fSZj1MM9cJYgcGfWlNwBf1Bw_Tg3lOxRACFJhMhLcq9rsXqHQdBCQa7YS_z_QNIR9CCUOW0i6lLQm8Cr7e-oxvMRGVNkGteevhvBYtZYkAu_qhYUiW1a_mrZj4vgjcWcWN0PQn_dpzzARtRIL3x1lkRUG-K4T9ks904Np7ihZ4Pdw1GmHY')`,
                  }}
                />
                <div className="absolute inset-0 bg-[#030712]/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-60" />
                    <div className="absolute inset-2 bg-rose-500 rounded-full ring-2 ring-[#030712]" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-[#030712]/90 backdrop-blur-md px-2 py-1 rounded text-[10px] text-slate-300 font-mono border border-white/10">
                  LAT: {selectedChallan.coordinates.lat} / LON: {selectedChallan.coordinates.lng}
                </div>
              </div>

              {/* Acoustic Signature Section */}
              <div className="bg-slate-900/60 rounded-xl p-4 flex flex-col gap-3 border border-cyan-500/20">
                <h3 className="text-[11px] font-mono text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-cyan-400">
                    mic
                  </span>{' '}
                  ACOUSTIC SIGNATURE
                </h3>

                {/* Dynamic Waveform Bars */}
                <div className="flex items-end h-16 gap-[2px] w-full bg-black/60 p-2 rounded-lg border border-white/5">
                  {Array.from({ length: 42 }).map((_, i) => {
                    const peak = Math.sin((i / 42) * Math.PI) * 90;
                    const noise = (i % 6) * 4;
                    const height = Math.max(15, peak + noise);
                    return (
                      <div
                        key={i}
                        style={{ height: `${height}%` }}
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          height > 75
                            ? 'bg-rose-400'
                            : height > 50
                            ? 'bg-amber-400'
                            : 'bg-cyan-400/70'
                        } ${isPlayingAudio ? 'animate-pulse' : ''}`}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between items-center bg-black/40 rounded-lg p-3 border border-white/5">
                  <span className="text-xs text-slate-400">AI Confidence Match</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400"
                        style={{ width: `${selectedChallan.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {selectedChallan.confidence}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-200">
                  <button
                    onClick={handlePlaySound}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      isPlayingAudio
                        ? 'bg-cyan-400 text-slate-950 border-cyan-400 font-bold shadow-[0_0_10px_#22d3ee]'
                        : 'bg-slate-800 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isPlayingAudio ? 'volume_up' : 'play_circle'}
                    </span>
                    {isPlayingAudio ? 'Playing Signature...' : 'Play Audio'}
                  </button>
                  <span className="font-mono text-[11px] text-slate-500">
                    {selectedChallan.duration} duration
                  </span>
                </div>
              </div>

              {/* Meta Data Grid */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 bg-black/40 p-3.5 rounded-xl border border-white/5 font-mono text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">TIMESTAMP</span>
                  <span className="text-slate-200">{selectedChallan.timestamp}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">NODE ID</span>
                  <span className="text-cyan-400 font-bold">{selectedChallan.nodeId}</span>
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[10px] text-slate-500 uppercase">EVIDENCE LINK</span>
                  <span className="text-cyan-400 underline truncate">
                    {selectedChallan.evidenceUrl}
                  </span>
                </div>
              </div>

              {/* Generate PDF Button */}
              <div className="pt-2 pb-6">
                <button
                  onClick={() => onOpenPdf(selectedChallan)}
                  className="w-full bg-cyan-400 text-slate-950 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.35)] hover:bg-cyan-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                  GENERATE E-CHALLAN PDF
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowFilterModal(false)}
          />
          <div className="relative w-full max-w-xs bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl p-4 z-10 space-y-3">
            <h3 className="font-bold text-sm text-slate-100">Filter Violations</h3>
            <div className="space-y-1 font-mono text-xs">
              {['all', 'issued', 'contested', 'pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setFilterStatus(st);
                    setShowFilterModal(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl uppercase flex items-center justify-between ${
                    filterStatus === st
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{st}</span>
                  {filterStatus === st && (
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
