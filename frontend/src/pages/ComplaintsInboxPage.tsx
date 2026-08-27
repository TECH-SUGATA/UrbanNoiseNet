import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { ComplaintReport } from '../types';
import { useNavigate } from 'react-router-dom';

export const ComplaintsInboxPage: React.FC = () => {
  const { complaints, patchComplaint, setSelectedEvent, loading } = useAppData();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'all' | 'review' | 'queued' | 'investigating' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintReport | null>(null);
  const [officerNoteInput, setOfficerNoteInput] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.classification.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (complaint: ComplaintReport, nextStatus: ComplaintReport['status']) => {
    const updated = await patchComplaint(complaint.id, {
      status: nextStatus,
      officerNotes: officerNoteInput || complaint.officerNotes,
    });
    setSelectedComplaint(updated);
  };

  const handleEscalateToChallan = (complaint: ComplaintReport) => {
    setSelectedEvent({
      id: `EVT-${complaint.id.replace('#', '')}`,
      title: complaint.classification,
      zone: complaint.location,
      timeAgo: complaint.timestamp,
      db: 88,
      type: 'exhaust',
      severity: 'critical',
    });
    navigate('/challans');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">inbox</span>
            <span>Citizen Noise Complaint Inbox</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Triage, investigate, and resolve acoustic disturbance grievances submitted through the civic portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open('/complaints', '_blank')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            <span>Open Citizen Portal</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'review', 'queued', 'investigating', 'resolved'] as const).map((st) => (
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

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-500 text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Search by ticket ID, location, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-cyan-500/20 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-[#090d16]/90 border border-cyan-500/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black/60 text-[10px] uppercase text-slate-400 border-b border-cyan-500/20">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Audio Proof</th>
                <th className="py-3 px-4">Status &amp; Progress</th>
                <th className="py-3 px-4 text-right">Filed Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredComplaints.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;

                return (
                  <tr
                    key={c.id}
                    onClick={() => {
                      setSelectedComplaint(c);
                      setOfficerNoteInput(c.officerNotes || '');
                    }}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-cyan-950/40' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-cyan-300">{c.id}</td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200">{c.title}</td>

                    <td className="py-3.5 px-4 text-slate-400">{c.location}</td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-white/5">
                        {c.classification}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {c.audioFileName ? (
                        <span className="inline-flex items-center gap-1 text-cyan-400 text-[11px]">
                          <span className="material-symbols-outlined text-sm">audio_file</span>
                          <span>Attached</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            c.status === 'review'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : c.status === 'investigating'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : c.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {c.status}
                        </span>
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full transition-all"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-500">{c.timestamp}</td>
                  </tr>
                );
              })}

              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No citizen complaints match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Complaint Detail Drawer */}
      {selectedComplaint && (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-[#090d16] border-l border-cyan-500/30 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">report</span>
                <h3 className="font-mono font-bold text-sm text-slate-100">Grievance Investigation</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="mt-6 space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/30 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-bold text-sm">{selectedComplaint.id}</span>
                  <span className="text-slate-400 text-[10px]">{selectedComplaint.timestamp}</span>
                </div>
                <div className="text-slate-100 font-bold text-sm">{selectedComplaint.title}</div>
                <div className="text-slate-400 text-xs">{selectedComplaint.location}</div>
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Citizen Statement</span>
                <p className="text-slate-200 text-xs leading-relaxed">{selectedComplaint.description}</p>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Complainant</span>
                  <span className="text-slate-200">{selectedComplaint.submittedBy || 'Anonymous'}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Audio Evidence</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedComplaint.audioFileName ? '1 File Attached' : 'None'}
                  </span>
                </div>
              </div>

              {/* Officer Note Field */}
              <div className="space-y-1">
                <label className="block text-slate-400 uppercase text-[10px]">Officer Investigation Remarks</label>
                <textarea
                  rows={3}
                  value={officerNoteInput}
                  onChange={(e) => setOfficerNoteInput(e.target.value)}
                  placeholder="Enter findings, patrol verification notes..."
                  className="w-full bg-black/50 border border-cyan-500/20 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-cyan-500/20 font-mono text-xs">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleUpdateStatus(selectedComplaint, 'investigating')}
                className="py-2 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-center cursor-pointer"
              >
                Investigate
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedComplaint, 'resolved')}
                className="py-2 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-center cursor-pointer"
              >
                Resolve
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedComplaint, 'queued')}
                className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-center cursor-pointer"
              >
                Queue
              </button>
            </div>

            <button
              onClick={() => handleEscalateToChallan(selectedComplaint)}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              Escalate to E-Challan Citation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
