import React from 'react';
import { BookOpen, Scale, Columns3, UserCheck, Sparkles, GraduationCap } from 'lucide-react';

interface HeaderProps {
  activeView: 'studio' | 'ranker' | 'tracker' | 'cv';
  setActiveView: (view: 'studio' | 'ranker' | 'tracker' | 'cv') => void;
  hasActiveCV: boolean;
  activeCVName?: string;
  trackedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  hasActiveCV,
  activeCVName,
  trackedCount,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="border-b border-[#E6DFD5] bg-[#FAF7F2] sticky top-0 z-40 transition-colors">
      {/* Top Editorial Bar */}
      <div className="border-b border-[#EFE9DF] px-4 sm:px-8 py-1.5 text-[11px] font-mono tracking-wider text-[#6B665E] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>ACADEMIC RESEARCH APPLICATION ADVISOR</span>
          <span className="hidden sm:inline text-[#C49B45]">•</span>
          <span className="hidden sm:inline">EDITION {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>{currentDate}</span>
          {hasActiveCV && (
            <span className="passport-stamp text-[10px] py-0.5 px-2">
              CV: {activeCVName || 'Active'}
            </span>
          )}
        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#1F5F4A] text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs">
            R
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-serif font-bold text-2xl tracking-tight text-[#141413]">
                Research<span className="text-[#1F5F4A] italic font-normal">Match</span>
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#C49B45] border border-[#C49B45]/40 px-1.5 py-0.5 rounded-sm">
                Journal Suite
              </span>
            </div>
            <p className="text-xs text-[#6B665E] font-normal">
              From professor&apos;s lab page to application package in seconds
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveView('studio')}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeView === 'studio'
                ? 'bg-[#1F5F4A] text-white shadow-xs font-semibold'
                : 'text-[#2C2B29] hover:bg-[#EFE9DF]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Application Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('ranker')}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeView === 'ranker'
                ? 'bg-[#1F5F4A] text-white shadow-xs font-semibold'
                : 'text-[#2C2B29] hover:bg-[#EFE9DF]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Lab Ranker (3 Labs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('tracker')}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeView === 'tracker'
                ? 'bg-[#1F5F4A] text-white shadow-xs font-semibold'
                : 'text-[#2C2B29] hover:bg-[#EFE9DF]'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Tracker</span>
            {trackedCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeView === 'tracker' ? 'bg-white/25 text-white' : 'bg-[#E6DFD5] text-[#141413]'
              }`}>
                {trackedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('cv')}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeView === 'cv'
                ? 'bg-[#1F5F4A] text-white shadow-xs font-semibold'
                : 'text-[#2C2B29] hover:bg-[#EFE9DF]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>CV Profile</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
