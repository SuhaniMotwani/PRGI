import React, { useState } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Filter, 
  ShieldAlert, 
  Edit3
} from 'lucide-react';
import type { OfficerCase } from '../../types';
import { sound } from '../../utils/audio';

export const OfficerDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'MANUAL_REVIEW' | 'REJECTED' | 'APPROVED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [cases, setCases] = useState<OfficerCase[]>([
    {
      id: 'CASE-2026-0811',
      applicantName: 'M/s Vidarbha Media Network LLP',
      proposedTitle: 'The Vidarbha Daily Express',
      language: 'Marathi, English',
      state: 'Maharashtra',
      periodicity: 'Daily',
      submissionDate: '15 Aug 2026',
      riskScore: 78,
      verdict: 'MANUAL_REVIEW',
      primaryConflict: 'Vidarbha Patrika (MAHMAR/2015/64294) - Shares core root token "Vidarbha"',
      status: 'UNDER_REVIEW',
      copilotDecisionNote: `OFFICIAL PRGI DECISION MEMORANDUM
Application ID: CASE-2026-0811
Proposed Title: "The Vidarbha Daily Express" (State: Maharashtra)

FINDING & CITATION:
Under PRGI Guidelines 2025, Clause 2.3(c) (Core Token Protection in Jurisdiction), the applicant's title shares the core root identifier "Vidarbha" with registered publication "Vidarbha Patrika" (MAHMAR/2015/64294). Adding generic prefixes like "The" and periodicity "Daily Express" is insufficient to prevent public confusion.

RECOMMENDED DISPOSITION:
Recommend conditional rejection or request addition of a distinctive sub-district qualifier.`
    },
    {
      id: 'CASE-2026-0812',
      applicantName: 'Suresh Kumar Agrawal',
      proposedTitle: 'The Royal Matrimonial Classifieds',
      language: 'Hindi, English',
      state: 'Uttar Pradesh',
      periodicity: 'Weekly',
      submissionDate: '14 Aug 2026',
      riskScore: 92,
      verdict: 'REJECTED',
      primaryConflict: 'PRGI Rule 4.1a Commercial & Matrimonial Catalog Ban',
      status: 'REJECTED',
      copilotDecisionNote: `OFFICIAL PRGI DECISION MEMORANDUM
Application ID: CASE-2026-0812
Proposed Title: "The Royal Matrimonial Classifieds"

FINDING & CITATION:
The proposed title contains explicit commercial advertising catalogue terminology ("Matrimonial Classifieds"). This directly violates PRGI Title Verification Guidelines 2025, Section 4.1(a) prohibiting periodical registrations for dedicated commercial advertising or matrimonial listings.

RECOMMENDED DISPOSITION:
Summary rejection under Rule 4.1a.`
    },
    {
      id: 'CASE-2026-0813',
      applicantName: 'Ananya Roy & Associates',
      proposedTitle: 'Bengal Heritage & Policy Review',
      language: 'Bengali, English',
      state: 'West Bengal',
      periodicity: 'Monthly',
      submissionDate: '13 Aug 2026',
      riskScore: 12,
      verdict: 'APPROVED',
      primaryConflict: 'No registered conflicts found within state/language registry',
      status: 'APPROVED',
      copilotDecisionNote: `OFFICIAL PRGI DECISION MEMORANDUM
Application ID: CASE-2026-0813
Proposed Title: "Bengal Heritage & Policy Review"

FINDING & CITATION:
Title passes all 6 statutory rulebook checks under Press and Registration of Periodicals Act 2023. 4-D similarity score is 12% (well below the 45% threshold).

RECOMMENDED DISPOSITION:
Approved for issuance of Certificate of Title Verification.`
    }
  ]);

  const [selectedCase, setSelectedCase] = useState<OfficerCase>(cases[0]);
  const [editableNote, setEditableNote] = useState<string>(cases[0].copilotDecisionNote || '');

  const handleSelectCase = (c: OfficerCase) => {
    sound.playClick();
    setSelectedCase(c);
    setEditableNote(c.copilotDecisionNote || '');
  };

  const handleStatusUpdate = (newStatus: OfficerCase['status']) => {
    sound.playClick();
    const updated = cases.map((item) =>
      item.id === selectedCase.id
        ? { ...item, status: newStatus, copilotDecisionNote: editableNote }
        : item
    );
    setCases(updated);
    setSelectedCase({ ...selectedCase, status: newStatus, copilotDecisionNote: editableNote });
  };

  const copyDecisionNote = () => {
    sound.playClick();
    navigator.clipboard.writeText(editableNote);
    setCopiedId(selectedCase.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCases = cases.filter((c) => {
    if (filter === 'ALL') return true;
    return c.verdict === filter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="border-b border-[#E8E0D2] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold mb-2">
          <UserCheck className="w-3.5 h-3.5 text-purple-700" />
          <span>Member 6 • Officer Verification Queue &amp; AI Copilot</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-editorial font-extrabold text-[#1C1917]">
          PRGI Officer Review Docket
        </h1>
        <p className="text-sm text-[#564735] mt-1 max-w-3xl leading-relaxed">
          Risk-prioritized officer workflow with borderline Amber cases sorted first. AI Copilot drafts legally grounded decision notes citing exact PRGI 2025 clauses.
        </p>
      </div>

      {/* Case Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Queue List */}
        <div className="lg:col-span-5 beige-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-3">
            <div className="flex items-center gap-2 text-[#1C1917] font-bold text-sm">
              <Filter className="w-4 h-4 text-amber-700" />
              <span>Pending Cases ({filteredCases.length})</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[11px]">
              {(['ALL', 'MANUAL_REVIEW', 'REJECTED', 'APPROVED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === f
                      ? 'bg-[#1C1917] text-white shadow-sm'
                      : 'text-[#75634B] hover:text-[#1C1917] hover:bg-[#F0EBE0]'
                  }`}
                >
                  {f === 'MANUAL_REVIEW' ? 'Amber' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredCases.map((c) => {
              const isSelected = selectedCase.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCase(c)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-500 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-white border-[#DDD1BF] hover:border-[#CFC0A8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-[#75634B]">
                      {c.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      c.verdict === 'APPROVED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      c.verdict === 'REJECTED' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                      'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {c.verdict === 'MANUAL_REVIEW' ? 'Borderline Amber' : c.verdict}
                    </span>
                  </div>

                  <div className="font-bold text-[#1C1917] text-sm mb-1 font-display">
                    {c.proposedTitle}
                  </div>

                  <div className="text-[11px] text-[#75634B] flex items-center gap-2">
                    <span>{c.applicantName}</span>
                    <span>•</span>
                    <span>{c.state}</span>
                  </div>

                  <div className="mt-2 text-[11px] text-[#564735] flex items-center justify-between">
                    <span className="truncate max-w-[220px] text-[#75634B]">{c.primaryConflict}</span>
                    <span className="font-mono font-bold text-amber-800">Risk: {c.riskScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Case File & Copilot Decision Drafter */}
        <div className="lg:col-span-7 beige-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-3">
            <div>
              <div className="text-xs font-mono text-[#75634B] font-bold">{selectedCase.id}</div>
              <h2 className="text-xl font-editorial font-bold text-[#1C1917]">
                "{selectedCase.proposedTitle}"
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                selectedCase.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                selectedCase.status === 'REJECTED' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                Current: {selectedCase.status}
              </span>
            </div>
          </div>

          {/* Details Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-[#DDD1BF] shadow-sm">
              <div className="text-[#75634B] text-[10px] font-semibold">Applicant</div>
              <div className="font-bold text-[#1C1917] truncate">{selectedCase.applicantName}</div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-[#DDD1BF] shadow-sm">
              <div className="text-[#75634B] text-[10px] font-semibold">Jurisdiction</div>
              <div className="font-bold text-[#1C1917]">{selectedCase.state}</div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-[#DDD1BF] shadow-sm">
              <div className="text-[#75634B] text-[10px] font-semibold">Periodicity</div>
              <div className="font-bold text-[#1C1917]">{selectedCase.periodicity}</div>
            </div>
          </div>

          {/* Primary Conflict Evidence */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Conflict Flag Evidence:</span>
            </div>
            <p className="text-xs text-[#564735] leading-relaxed font-sans">
              {selectedCase.primaryConflict}
            </p>
          </div>

          {/* AI Copilot Decision Note Drafter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>AI Copilot Official Decision Note (Editable)</span>
              </span>
              <button
                onClick={copyDecisionNote}
                className="px-2.5 py-1 rounded bg-white hover:bg-[#F8F6F0] text-[#564735] hover:text-[#1C1917] border border-[#DDD1BF] flex items-center gap-1 cursor-pointer font-semibold shadow-sm"
              >
                {copiedId === selectedCase.id ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === selectedCase.id ? 'Copied' : 'Copy Memo'}</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={editableNote}
              onChange={(e) => setEditableNote(e.target.value)}
              className="w-full bg-white border border-[#DDD1BF] rounded-xl p-3.5 font-mono text-xs text-[#1C1917] focus:outline-none focus:border-amber-600 leading-relaxed shadow-sm"
            />
          </div>

          {/* Officer Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E8E0D2]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStatusUpdate('APPROVED')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Endorse &amp; Approve</span>
              </button>

              <button
                onClick={() => handleStatusUpdate('REJECTED')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Issue Rejection Order</span>
              </button>
            </div>

            <span className="text-[11px] text-[#948063] font-mono">
              Signed via PRGI Officer E-Token
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
