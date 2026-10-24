import React, { useState } from 'react';
import { InterviewQuestion } from '../types';
import { HelpCircle, Copy, Check, Lightbulb } from 'lucide-react';

interface InterviewCardProps {
  questions: InterviewQuestion[];
}

export const InterviewCard: React.FC<InterviewCardProps> = ({ questions }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = questions
      .map(
        (q, idx) =>
          `Q${idx + 1}: ${q.question}\nTip: ${q.tip}`
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
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#141413]">
              Targeted Interview Questions (6)
            </h3>
            <p className="text-[11px] text-[#6B665E]">
              Anticipated faculty inquiries probing technical rigor and research motivation
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
              <span>Copy Questions</span>
            </>
          )}
        </button>
      </div>

      {/* Questions list */}
      <div className="mt-5 space-y-3.5">
        {questions.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-sm border border-[#E6DFD5] bg-[#FAF7F2] hover:border-[#1F5F4A]/60 transition"
          >
            <div className="flex items-start space-x-2.5 mb-2">
              <span className="w-5 h-5 rounded-sm bg-[#1F5F4A] text-white text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#141413] leading-snug">
                {item.question}
              </h4>
            </div>

            <div className="ml-7 p-3 rounded-sm bg-white border border-[#E6DFD5] text-xs text-[#2C2B29] flex items-start space-x-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#C49B45] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-[#1F5F4A]">Answering Strategy: </span>
                <span>{item.tip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
