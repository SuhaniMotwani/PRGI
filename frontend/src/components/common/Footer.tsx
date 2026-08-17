import React from 'react';
import { Shield, Sparkles, BookOpen, GitBranch } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#E8E0D2] bg-[#FAF7F2] mt-20 py-8 px-4 sm:px-6 lg:px-8 text-[#75634B] text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#1C1917]">
              PRGI Automated Press Title Verification &amp; Clearance Suite
            </div>
            <div className="text-[11px] text-[#75634B]">
              Smart India Hackathon • Problem Statement PSS06 • Press and Registration of Periodicals Act 2023
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#564735]">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>5-Stage AI Verification Pipeline</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>PRGI 2025 Guideline Grounded</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="w-3.5 h-3.5 text-emerald-700" />
            <span>6-Member Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
