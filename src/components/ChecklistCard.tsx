import React, { useState } from 'react';
import { CheckSquare, Copy, Check, CheckCircle2, Circle } from 'lucide-react';

interface ChecklistCardProps {
  checklist: string[];
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({ checklist }) => {
  const [copied, setCopied] = useState(false);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);

  const toggleStep = (idx: number) => {
    if (completedIndices.includes(idx)) {
      setCompletedIndices(completedIndices.filter((i) => i !== idx));
    } else {
      setCompletedIndices([...completedIndices, idx]);
    }
  };

  const handleCopy = () => {
    const text = checklist
      .map(
        (step, idx) =>
          `[${completedIndices.includes(idx) ? 'x' : ' '}] Step ${idx + 1}: ${step}`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = completedIndices.length;

  return (
    <div className="editorial-card p-6 rounded-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E6DFD5]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-[#EBF3EF] text-[#1F5F4A] flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-base text-[#141413]">
                Pre-Submission Action Checklist (5)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#1F5F4A] font-bold">
                {completedCount}/5 Ready
              </span>
            </div>
            <p className="text-[11px] text-[#6B665E]">
              Diligence checkpoints to maximize faculty open and response rates
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
              <span>Copy Checklist</span>
            </>
          )}
        </button>
      </div>

      {/* Checklist items */}
      <div className="mt-5 space-y-2.5">
        {checklist.map((item, idx) => {
          const isDone = completedIndices.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggleStep(idx)}
              className={`w-full text-left p-3.5 rounded-sm border transition flex items-start space-x-3 cursor-pointer ${
                isDone
                  ? 'border-[#CDE3D8] bg-[#F4F9F6]'
                  : 'border-[#E6DFD5] bg-[#FAF7F2] hover:border-[#1F5F4A]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1F5F4A]" />
                ) : (
                  <Circle className="w-4 h-4 text-[#D4CABF] hover:text-[#1F5F4A]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs font-serif font-bold ${
                    isDone ? 'text-[#1F5F4A] line-through' : 'text-[#141413]'
                  }`}
                >
                  Checkpoint 0{idx + 1}
                </span>
                <p
                  className={`text-xs mt-0.5 leading-relaxed ${
                    isDone ? 'text-[#6B665E] line-through' : 'text-[#2C2B29]'
                  }`}
                >
                  {item}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {completedCount === 5 && (
        <div className="mt-4 p-3 rounded-sm bg-[#EBF3EF] border border-[#CDE3D8] text-center text-xs font-serif font-bold text-[#1F5F4A] animate-in fade-in">
          ★ All 5 checkpoints verified. Your application package is ready for academic dispatch.
        </div>
      )}
    </div>
  );
};
