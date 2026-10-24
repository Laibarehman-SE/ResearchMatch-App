import React, { useState } from 'react';
import { SOPOutline } from '../types';
import { FileText, Copy, Check } from 'lucide-react';

interface SOPOutlineCardProps {
  sop: SOPOutline;
}

export const SOPOutlineCard: React.FC<SOPOutlineCardProps> = ({ sop }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = sop.sections
      .map(
        (sec, i) =>
          `§${i + 1}. ${sec.title.toUpperCase()}\n` +
          sec.bullets.map((b) => `  • ${b}`).join('\n')
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
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#141413]">
              Statement of Purpose (SOP) Outline
            </h3>
            <p className="text-[11px] text-[#6B665E]">
              5 narrative pillars tailored to this laboratory&apos;s research thrusts
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
              <span>Copy Outline</span>
            </>
          )}
        </button>
      </div>

      {/* Sections List */}
      <div className="mt-5 space-y-3.5">
        {sop.sections.map((section, idx) => (
          <div
            key={idx}
            className="p-4 rounded-sm border border-[#E6DFD5] bg-[#FAF7F2] hover:border-[#1F5F4A]/60 transition"
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-serif font-bold text-xs text-[#1F5F4A]">
                § 0{idx + 1}.
              </span>
              <h4 className="font-serif font-bold text-sm text-[#141413]">
                {section.title}
              </h4>
            </div>

            <ul className="space-y-1.5 pl-6">
              {section.bullets.map((bullet, bIdx) => (
                <li
                  key={bIdx}
                  className="text-xs text-[#2C2B29] relative pl-3 leading-relaxed before:content-['—'] before:absolute before:left-0 before:text-[#1F5F4A] before:font-bold"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
