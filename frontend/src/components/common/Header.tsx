import React from 'react';
import { 
   ShieldCheck, 
   Volume2, 
   VolumeX, 
   Layers, 
   Sparkles, 
   UserCheck, 
   Search, 
   Database,
   Sliders,
   PlayCircle
 } from 'lucide-react';
 import { sound } from '../../utils/audio';

interface HeaderProps {
  activeTab: 'verifier' | 'agents' | 'officer' | 'registry';
  setActiveTab: (tab: 'verifier' | 'agents' | 'officer' | 'registry') => void;
  onOpenRoadmap: () => void;
  onReplayIntro: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  useLiveApi: boolean;
  setUseLiveApi: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenRoadmap,
  onReplayIntro,
  soundEnabled,
  setSoundEnabled,
  useLiveApi,
  setUseLiveApi
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  const handleTabChange = (tab: 'verifier' | 'agents' | 'officer' | 'registry') => {
    sound.playClick();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E0D2] bg-[#FAF7F2]/95 backdrop-blur-md">
      {/* Top Gov Status Ribbon */}
      <div className="w-full bg-[#F0EBE0] px-4 py-1.5 border-b border-[#E5DDD0] text-xs text-[#75634B] flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-xl truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="font-bold text-[#382E22] tracking-tight">Press Registrar General of India (PRGI)</span>
          <span className="hidden sm:inline text-[#CFC0A8]">|</span>
          <span className="hidden sm:inline text-[#564735]">Press and Registration of Periodicals Act 2023</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#564735] font-mono">
            <Database className="w-3 h-3 text-amber-700" />
            <span>160,000+ Master Titles</span>
          </div>

          <button 
            onClick={() => {
              setUseLiveApi(!useLiveApi);
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
              useLiveApi 
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm' 
                : 'bg-white/80 border-[#DDD1BF] text-[#75634B] hover:text-[#1C1917]'
            }`}
            title="Toggle between embedded client-side AI verification engine & FastAPI localhost:8000"
          >
            <Sliders className="w-3 h-3 text-amber-700" />
            <span>{useLiveApi ? 'FastAPI: 8000 (Live)' : 'Engine: Client AI'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('verifier')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900 shadow-md shadow-amber-950/10 text-white font-bold">
            <ShieldCheck className="w-6 h-6 text-amber-100" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-[#1C1917] tracking-tight font-display">
                PRGI <span className="text-amber-800">TitleGuard</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/80 rounded-md uppercase tracking-wider">
                3D AI Suite
              </span>
            </div>
            <p className="text-[11px] text-[#75634B] hidden sm:block">Automated Periodical Verification &amp; Clearance</p>
          </div>
        </div>

        {/* Navigation Tabs (Pill Segmented Control) */}
        <nav className="flex items-center bg-[#EFE8DC] p-1 rounded-xl border border-[#E2D7C5]">
          <button
            onClick={() => handleTabChange('verifier')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'verifier'
                ? 'bg-white text-[#1C1917] shadow-sm border border-[#DDD1BF]'
                : 'text-[#75634B] hover:text-[#1C1917]'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-amber-700" />
            <span>Title Verifier</span>
          </button>

          <button
            onClick={() => handleTabChange('agents')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'agents'
                ? 'bg-white text-[#1C1917] shadow-sm border border-[#DDD1BF]'
                : 'text-[#75634B] hover:text-[#1C1917]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="flex items-center gap-1">
              AI Studio
              <span className="hidden md:inline text-[10px] px-1 bg-amber-100 text-amber-800 font-bold rounded">M5</span>
            </span>
          </button>

          <button
            onClick={() => handleTabChange('officer')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'officer'
                ? 'bg-white text-[#1C1917] shadow-sm border border-[#DDD1BF]'
                : 'text-[#75634B] hover:text-[#1C1917]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-700" />
            <span className="flex items-center gap-1">
              Officer Copilot
              <span className="hidden md:inline text-[10px] px-1 bg-purple-100 text-purple-800 font-bold rounded">M6</span>
            </span>
          </button>

          <button
            onClick={() => handleTabChange('registry')}
            className={`hidden lg:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-white text-[#1C1917] shadow-sm border border-[#DDD1BF]'
                : 'text-[#75634B] hover:text-[#1C1917]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-stone-700" />
            <span>Registry</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReplayIntro}
            aria-label="Replay animated loading intro"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#564735] hover:text-[#1C1917] hover:bg-[#EFE8DC] transition-colors border border-transparent hover:border-[#DDD1BF] cursor-pointer"
            title="Replay Title Scanner Intro Animation"
          >
            <PlayCircle className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Replay Intro</span>
          </button>

          <button
            onClick={toggleSound}
            aria-label="Toggle sound feedback"
            className="p-2 rounded-lg text-[#75634B] hover:text-[#1C1917] hover:bg-[#EFE8DC] transition-colors border border-transparent hover:border-[#DDD1BF] cursor-pointer"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenRoadmap();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1C1917] hover:bg-[#382E22] text-white shadow-sm transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">6-Member Roadmap</span>
            <span className="sm:hidden">Roadmap</span>
          </button>
        </div>
      </div>
    </header>
  );
};
