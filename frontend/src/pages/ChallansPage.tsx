import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { ChallanRecord } from '../types';
import { ChallanPdfModal } from '../components/ChallanPdfModal';

export const ChallansPage: React.FC = () => {
  const {
    challans,
    createChallan,
    patchChallan,
    selectedEvent,
    setSelectedEvent,
    zones,
    loading,
  } = useAppData();

  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'pending' | 'contested' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [selectedChallan, setSelectedChallan] = useState<ChallanRecord | null>(null);
  const [isNewChallanModalOpen, setIsNewChallanModalOpen] = useState(false);
  const [pdfChallan, setPdfChallan] = useState<ChallanRecord | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // New Challan Form State
  const [newLocation, setNewLocation] = useState('');
  const [newSource, setNewSource] = useState('Modified Exhaust');
  const [newSourceCategory, setNewSourceCategory] = useState<ChallanRecord['sourceCategory']>('exhaust');
  const [newDb, setNewDb] = useState<number>(94.5);
  const [newLicensePlate, setNewLicensePlate] = useState('');
  const [newFineAmount, setNewFineAmount] = useState<number>(250);
  const [newOfficerNotes, setNewOfficerNotes] = useState('');

  // Auto-open modal if `selectedEvent` was passed from Dashboard
  useEffect(() => {
    if (selectedEvent) {
      setIsNewChallanModalOpen(true);
      setNewLocation(`${selectedEvent.zone} - Acoustic Telemetry Point`);
      setNewSource(selectedEvent.title);
      setNewSourceCategory(
        selectedEvent.type === 'siren'
          ? 'horn'
          : selectedEvent.type === 'traffic'
          ? 'vehicle'
          : (selectedEvent.type as ChallanRecord['sourceCategory']) || 'exhaust'
      );
      setNewDb(selectedEvent.db);
      setNewOfficerNotes(`Auto-generated from telemetry event ${selectedEvent.id} (${selectedEvent.db} dBA acoustic spike).`);
    }
  }, [selectedEvent]);

  // Filtered challans
  const filteredChallans = challans.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.licensePlate && c.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesZone = zoneFilter === 'all' || (c.zone && c.zone === zoneFilter) || c.location.includes(zoneFilter);

    return matchesStatus && matchesSearch && matchesZone;
  });

  const handleCreateChallanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createChallan({
      location: newLocation,
      source: newSource,
      sourceCategory: newSourceCategory,
      db: newDb,
      status: 'issued',
      licensePlate: newLicensePlate || 'WA-819-KVL',
      fineAmount: newFineAmount,
      officerNotes: newOfficerNotes,
      confidence: 96,
      duration: '00:04s',
      nodeId: 'SN-402',
    });

    setSelectedEvent(null);
    setIsNewChallanModalOpen(false);
    setSelectedChallan(created);
    setHighlightedId(created.id);
    setTimeout(() => setHighlightedId(null), 3000);

    // Reset Form
    setNewLocation('');
    setNewLicensePlate('');
    setNewOfficerNotes('');
  };

  const handleMarkContested = async (challan: ChallanRecord) => {
    const updated = await patchChallan(challan.id, { status: 'contested' });
    setSelectedChallan(updated);
  };

  const handleResolveChallan = async (challan: ChallanRecord) => {
    const updated = await patchChallan(challan.id, { status: 'resolved' });
    setSelectedChallan(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">receipt_long</span>
            <span>E-Challan Citation Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Legally enforceable acoustic decibel violation citations with cryptographic sensor evidence.
          </p>
        </div>

        <button
          onClick={() => setIsNewChallanModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">post_add</span>
          <span>+ Issue Manual Challan</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'issued', 'pending', 'contested', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Zone Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-slate-500 text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Search by ID, plate, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-cyan-500/20 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Sectors</option>
            {zones.map((z) => (
              <option key={z.id} value={z.name}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Citations Table */}
      <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black/60 text-[10px] uppercase text-slate-400 border-b border-cyan-500/20">
              <tr>
                <th className="py-3 px-4">Citation ID</th>
                <th className="py-3 px-4">Location &amp; Sector</th>
                <th className="py-3 px-4">Source Classification</th>
                <th className="py-3 px-4">Peak Reading</th>
                <th className="py-3 px-4">Fine Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredChallans.map((challan) => {
                const isSelected = selectedChallan?.id === challan.id;
                const isHighlighted = highlightedId === challan.id;

                return (
                  <tr
                    key={challan.id}
                    onClick={() => setSelectedChallan(challan)}
                    className={`transition-colors cursor-pointer ${
                      isHighlighted
                        ? 'bg-cyan-500/20 animate-pulse'
                        : isSelected
                        ? 'bg-cyan-950/40'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <span>{challan.id}</span>
                        {challan.licensePlate && (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-white/5">
                            {challan.licensePlate}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-200">
                      <div>{challan.location}</div>
                      <div className="text-[10px] text-slate-500">{challan.time}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-semibold">{challan.source}</span>
                      <span className="text-[10px] text-slate-500 block">AI Conf: {challan.confidence}%</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-rose-400">
                      {challan.db} dBA
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      ${challan.fineAmount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          challan.status === 'issued'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : challan.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : challan.status === 'contested'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {challan.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfChallan(challan);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-white/10 text-[11px] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredChallans.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No citation records match the active filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Challan Right Drawer */}
      {selectedChallan && (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-[#090d16] border-l border-cyan-500/30 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">receipt</span>
                <h3 className="font-mono font-bold text-sm text-slate-100">Citation Detail &amp; Evidence</h3>
              </div>
              <button
                onClick={() => setSelectedChallan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="mt-6 space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/30 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-bold text-sm">{selectedChallan.id}</span>
                  <span className="text-rose-400 font-bold text-sm">{selectedChallan.db} dBA Peak</span>
                </div>
                <div className="text-slate-200 font-semibold">{selectedChallan.location}</div>
                <div className="text-[10px] text-slate-500">{selectedChallan.timestamp}</div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">License Plate</span>
                  <span className="text-slate-100 font-bold">{selectedChallan.licensePlate || 'N/A'}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Fine Amount</span>
                  <span className="text-emerald-400 font-bold">${selectedChallan.fineAmount.toFixed(2)}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Source Type</span>
                  <span className="text-slate-200">{selectedChallan.source}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Duration</span>
                  <span className="text-slate-200">{selectedChallan.duration}</span>
                </div>
              </div>

              {/* Officer Notes */}
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Officer Enforcement Notes</span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {selectedChallan.officerNotes || 'Exceeded municipal sound pressure threshold.'}
                </p>
              </div>

              {/* Cryptographic Evidence Hash */}
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Cryptographic Audit Hash</span>
                <p className="text-[10px] text-cyan-300 font-mono break-all">
                  SHA256: 8f4a9b2c3d1e0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-cyan-500/20 font-mono text-xs">
            <button
              onClick={() => setPdfChallan(selectedChallan)}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print &amp; Export Official PDF Notice
            </button>

            <div className="flex gap-2">
              {selectedChallan.status !== 'contested' && (
                <button
                  onClick={() => handleMarkContested(selectedChallan)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">gavel</span>
                  Mark Contested
                </button>
              )}
              {selectedChallan.status !== 'resolved' && (
                <button
                  onClick={() => handleResolveChallan(selectedChallan)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Manual Challan Modal */}
      {isNewChallanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsNewChallanModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#090d16] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">post_add</span>
                <h3 className="font-bold text-sm font-mono text-slate-100">Issue Official E-Challan</h3>
              </div>
              <button
                onClick={() => setIsNewChallanModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateChallanSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">Location Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5th Ave & Pine St Corridor"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 uppercase text-[10px]">Source Category</label>
                  <select
                    value={newSourceCategory}
                    onChange={(e) => {
                      const cat = e.target.value as ChallanRecord['sourceCategory'];
                      setNewSourceCategory(cat);
                      setNewSource(cat === 'exhaust' ? 'Modified Exhaust' : cat === 'horn' ? 'Multi-Tone Air Horn' : 'Acoustic Spike');
                    }}
                    className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="exhaust">Modified Vehicular Exhaust</option>
                    <option value="horn">Air Horn / Siren</option>
                    <option value="construction">Unauthorized Construction</option>
                    <option value="music">Commercial Audio / PA</option>
                    <option value="industrial">Industrial Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 uppercase text-[10px]">Recorded Peak (dB)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="140"
                    value={newDb}
                    onChange={(e) => setNewDb(Number(e.target.value))}
                    className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 uppercase text-[10px]">Vehicle License Plate (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. WA-994-XYZ"
                    value={newLicensePlate}
                    onChange={(e) => setNewLicensePlate(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 uppercase text-[10px]">Fine Amount ($)</label>
                  <input
                    type="number"
                    value={newFineAmount}
                    onChange={(e) => setNewFineAmount(Number(e.target.value))}
                    className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">Officer Enforcement Remarks</label>
                <textarea
                  rows={3}
                  value={newOfficerNotes}
                  onChange={(e) => setNewOfficerNotes(e.target.value)}
                  placeholder="Describe evidence and violation context..."
                  className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewChallanModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Issue E-Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      <ChallanPdfModal
        challan={pdfChallan}
        isOpen={Boolean(pdfChallan)}
        onClose={() => setPdfChallan(null)}
      />
    </div>
  );
};
