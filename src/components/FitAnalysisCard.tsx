import React, { useState } from 'react';
import { FitAnalysis } from '../types';
import { CheckCircle2, AlertTriangle, Copy, Check, Target } from 'lucide-react';

interface FitAnalysisCardProps {
  fit: FitAnalysis;
}

export const FitAnalysisCard: React.FC<FitAnalysisCardProps> = ({ fit }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `FIT ANALYSIS
Score: ${fit.score} / 10
Reason: ${fit.oneLineReason}

Matching Skills:
${fit.matchingSkills.map((s) => `• ${s}`).join('\n')}

Missing Skills:
${fit.missingSkills.map((s) => `• ${s}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scorePercent = Math.min(100, Math.max(0, (fit.score / 10) * 100));

  const getVerdictStamp = (score: number) => {
    if (score >= 8.5) return '★ TOP ADMIT SYNERGY ★';
    if (score >= 7.0) return '★ SOLID PROFILE ALIGNMENT ★';
    if (score >= 5.5) return '★ MODERATE REACH ★';
    return '★ HIGH REACH / PREREQ GAP ★';
  };

  return (
    <div className="editorial-card p-6 rounded-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E6DFD5]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-[#EBF3EF] text-[#1F5F4A] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#141413]">
              Fit Analysis &amp; Admission Synergy
            </h3>
            <p className="text-[11px] text-[#6B665E]">
              Evaluated against faculty research focus and required tooling
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#141413] border border-[#E6DFD5] transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#1F5F4A]" />
              <span className="text-[#1F5F4A]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Passport Stamp Score Block */}
      <div className="mt-5 p-4 bg-[#FAF7F2] border border-[#E6DFD5] rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          {/* Passport Stamp Badge */}
          <div className="flex items-center space-x-2">
            <span className="passport-stamp text-xs px-3 py-1">
              SCORE: {fit.score.toFixed(1)} / 10
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#1F5F4A] font-bold">
              {getVerdictStamp(fit.score)}
            </span>
          </div>

          <span className="text-[11px] font-mono text-[#6B665E]">
            Profile Match Benchmark
          </span>
        </div>

        {/* Progress Bar in Forest Green */}
        <div className="w-full bg-[#E6DFD5] h-2.5 rounded-2xs overflow-hidden">
          <div
            className="h-full bg-[#1F5F4A] transition-all duration-700 ease-out"
            style={{ width: `${scorePercent}%` }}
          />
        </div>

        {/* One Line Reason */}
        <p className="mt-3 text-xs sm:text-sm text-[#2C2B29] font-normal leading-relaxed">
          {fit.oneLineReason}
        </p>
      </div>

      {/* Matching Skills & Missing Skills */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matching Skills */}
        <div className="p-4 rounded-sm border border-[#CDE3D8] bg-[#F4F9F6]">
          <div className="flex items-center space-x-1.5 mb-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5F4A]" />
            <h4 className="text-[11px] font-mono font-bold text-[#1F5F4A] uppercase tracking-wider">
              Matching Skills ({fit.matchingSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fit.matchingSkills.length > 0 ? (
              fit.matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-2xs text-xs font-medium bg-white text-[#1F5F4A] border border-[#CDE3D8]"
                >
                  ✓ {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-[#6B665E] italic">
                No direct keyword overlap found; emphasize problem-solving versatility.
              </p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="p-4 rounded-sm border border-[#EFE2C9] bg-[#FCF8F1]">
          <div className="flex items-center space-x-1.5 mb-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#9E782F]" />
            <h4 className="text-[11px] font-mono font-bold text-[#9E782F] uppercase tracking-wider">
              Missing or Lab-Specific Skills ({fit.missingSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fit.missingSkills.length > 0 ? (
              fit.missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-2xs text-xs font-medium bg-white text-[#9E782F] border border-[#EFE2C9]"
                >
                  • {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-[#1F5F4A] font-medium">
                Comprehensive skill coverage! No major prerequisites unaddressed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
