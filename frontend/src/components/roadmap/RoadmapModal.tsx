import React from 'react';
import { X, CheckCircle2, GitBranch, Layers, Cpu, Database, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FAF7F2] border border-[#DDD1BF] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E8E0D2] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
              <Layers className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <h2 className="text-xl font-editorial font-bold text-[#1C1917]">
                SIH PSS06 • 6-Member Roadmap &amp; Architecture
              </h2>
              <p className="text-xs text-[#75634B]">
                Three-Layer Architecture • Clear Division of Work • Shared Contracts
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-lg bg-[#F0EBE0] text-[#564735] hover:text-[#1C1917] hover:bg-[#E8E0D2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#44403C]">
          {/* 3-Layer Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#E2D7C5] shadow-sm">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <Database className="w-4 h-4 text-amber-700" />
                <span>Layer 1 — Data &amp; Search</span>
              </div>
              <p className="text-xs text-[#564735] mb-2 leading-relaxed">
                Manages 160,000 title registry, embeddings, PostgreSQL + pgvector, and top-K candidate retrieval.
              </p>
              <div className="text-[11px] font-mono font-bold text-amber-800">Owner: Member 3</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2D7C5] shadow-sm">
              <div className="flex items-center gap-2 text-purple-900 font-bold mb-2">
                <Cpu className="w-4 h-4 text-purple-700" />
                <span>Layer 2 — AI/ML &amp; Rules</span>
              </div>
              <p className="text-xs text-[#564735] mb-2 leading-relaxed">
                Lexical, phonetic, semantic &amp; core-word similarity scoring + deterministic PRGI rules and RAG explanations.
              </p>
              <div className="text-[11px] font-mono font-bold text-purple-800">Owners: Member 2 &amp; Member 4</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2D7C5] shadow-sm">
              <div className="flex items-center gap-2 text-emerald-900 font-bold mb-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Layer 3 — App &amp; Agents</span>
              </div>
              <p className="text-xs text-[#564735] mb-2 leading-relaxed">
                FastAPI orchestration, agentic generator-verifier-ranker loop, Next.js UI &amp; 3D officer dashboard.
              </p>
              <div className="text-[11px] font-mono font-bold text-emerald-800">Owners: Member 1, 5 &amp; 6</div>
            </div>
          </div>

          {/* 6-Member Ownership Table */}
          <div className="border border-[#DDD1BF] rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-[#F0EBE0] px-4 py-2 font-bold text-xs text-[#1C1917] uppercase tracking-wider font-mono">
              6-Member Responsibilities &amp; Technology Stack
            </div>
            <div className="divide-y divide-[#E8E0D2] text-xs">
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#1C1917] mr-2">Member 1 — Backend &amp; System Integration</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold">Layer 3</span>
                  <p className="text-[#564735] mt-1">FastAPI backend, /verify-title orchestration pipeline, error handling &amp; Docker containerization.</p>
                </div>
                <div className="font-mono text-[11px] text-[#75634B]">Python • FastAPI • Pydantic</div>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#1C1917] mr-2">Member 2 — NLP / ML Similarity Engineer</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">Layer 2</span>
                  <p className="text-[#564735] mt-1">Language detection, transliteration, 4-D similarity (Levenshtein, Soundex, Sentence Transformers, Core-word stripping).</p>
                </div>
                <div className="font-mono text-[11px] text-[#75634B]">Sentence Transformers • RapidFuzz</div>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#1C1917] mr-2">Member 3 — Database &amp; Candidate Search</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">Layer 1</span>
                  <p className="text-[#564735] mt-1">Ingest 160k title dataset, PostgreSQL schema, pgvector indexing, and fast top-K candidate retrieval /search/candidates.</p>
                </div>
                <div className="font-mono text-[11px] text-[#75634B]">PostgreSQL • pgvector • Pandas</div>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#1C1917] mr-2">Member 4 — Rules + RAG + Explainability</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">Layer 2</span>
                  <p className="text-[#564735] mt-1">Deterministic government rulebook checks (Emblems Act, Commercial terms, Length, URL ban) and guideline-grounded explanations.</p>
                </div>
                <div className="font-mono text-[11px] text-[#75634B]">Rule Engine • RAG • PRGI 2025</div>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#1C1917] mr-2">Member 5 — Agentic Title Generator</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold">Layer 3</span>
                  <p className="text-[#564735] mt-1">4-Agent workflow (Interviewer → Generator → Verifier → Ranker). Only pre-verified passed titles are presented to users.</p>
                </div>
                <div className="font-mono text-[11px] text-[#75634B]">LangGraph • AI Agents</div>
              </div>

              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50/50">
                <div>
                  <span className="font-bold text-[#1C1917] mr-2">Member 6 — Frontend + 3D Dashboard + QA</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">Layer 3 (Current)</span>
                  <p className="text-[#564735] mt-1">Three.js 3D verification canvas, instant transliteration visualizer, applicant portal, officer queue copilot, and end-to-end integration.</p>
                </div>
                <div className="font-mono text-[11px] text-emerald-800 font-bold">Next.js / Vite • Three.js • Tailwind</div>
              </div>
            </div>
          </div>

          {/* GitHub Branching Guide */}
          <div className="p-4 rounded-xl bg-white border border-[#DDD1BF] shadow-sm">
            <div className="flex items-center gap-2 text-[#1C1917] font-semibold mb-2">
              <GitBranch className="w-4 h-4 text-emerald-700" />
              <span>GitHub Branching &amp; Merging Strategy</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="font-mono bg-[#FAF7F2] p-2.5 rounded-lg border border-[#DDD1BF]">
                <span className="text-[#75634B]">feature/member-1-backend</span><br/>
                <span className="text-[#75634B]">feature/member-2-ml</span><br/>
                <span className="text-[#75634B]">feature/member-3-search</span><br/>
                <span className="text-[#75634B]">feature/member-4-rules-rag</span><br/>
                <span className="text-[#75634B]">feature/member-5-agents</span><br/>
                <span className="text-emerald-800 font-bold">feature/member-6-frontend</span>
              </div>
              <div className="flex flex-col justify-center space-y-1.5 text-[#564735] text-[11px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Never push directly to <code className="text-[#1C1917] font-bold">main</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Open PR into <code className="text-amber-800 font-bold">develop</code> branch</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Run integration tests before demo code freeze</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E8E0D2] bg-white flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1C1917] hover:bg-[#382E22] text-white transition-all shadow-sm cursor-pointer"
          >
            Close Roadmap
          </button>
        </div>
      </div>
    </div>
  );
};
