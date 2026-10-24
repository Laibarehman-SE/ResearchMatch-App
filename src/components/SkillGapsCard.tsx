import React, { useState } from 'react';
import { SkillGap } from '../types';
import { Lightbulb, Copy, Check, ArrowRight } from 'lucide-react';

interface SkillGapsCardProps {
  skillGaps: SkillGap[];
}

export const SkillGapsCard: React.FC<SkillGapsCardProps> = ({ skillGaps }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = skillGaps
      .map(
        (gap, idx) =>
          `SKILL GAP ${idx + 1}: ${gap.skill}\nRecommended Action: ${gap.practicalAction}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="editorial-card p-6 rounded-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E6DFD5]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-[#EBF3EF] text-[#1F5F4A] flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#141413]">
              Targeted Skill Gaps &amp; Pre-Submission Action Plan
            </h3>
            <p className="text-[11px] text-[#6B665E]">
              Specific courses, seminal papers, or mini-projects to strengthen your candidacy
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
              <span>Copy Action Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Cards */}
      <div className="mt-5 space-y-3">
        {skillGaps.map((gap, idx) => (
          <div
            key={idx}
            className="p-4 rounded-sm border border-[#E6DFD5] bg-[#FAF7F2] hover:border-[#1F5F4A]/60 transition"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#C49B45]">
                  [{idx + 1}]
                </span>
                <h4 className="font-serif font-bold text-sm text-[#141413]">
                  {gap.skill}
                </h4>
              </div>
              <span className="text-[10px] font-mono uppercase text-[#6B665E]">
                Target Remediation
              </span>
            </div>

            <div className="pl-6 flex items-start space-x-2 mt-1">
              <ArrowRight className="w-3.5 h-3.5 text-[#1F5F4A] shrink-0 mt-0.5" />
              <div className="text-xs text-[#2C2B29] leading-relaxed">
                <span className="font-semibold text-[#141413]">Recommended Action: </span>
                {gap.practicalAction}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
