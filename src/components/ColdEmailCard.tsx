import React, { useState } from 'react';
import { ColdEmail } from '../types';
import { Mail, Copy, Check, RefreshCw, BookOpen, UserCheck, Clock, Send, MessageSquare } from 'lucide-react';

interface ColdEmailCardProps {
  email: ColdEmail;
  onRegenerate: (variation?: string) => Promise<void>;
  isRegenerating: boolean;
  onOpenFollowUp?: () => void;
  onSaveToTracker?: () => void;
  isSavedToTracker?: boolean;
}

export const ColdEmailCard: React.FC<ColdEmailCardProps> = ({
  email,
  onRegenerate,
  isRegenerating,
  onOpenFollowUp,
  onSaveToTracker,
  isSavedToTracker,
}) => {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState('Standard Concise');

  const fullEmailText = `Subject: ${email.subject}\n\n${email.body}`;

  const handleCopyFull = () => {
    navigator.clipboard.writeText(fullEmailText);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(email.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(email.body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const actualWordCount = email.body.trim().split(/\s+/).filter(Boolean).length;
  const isWithinLimit = actualWordCount <= 150;

  return (
    <div className="editorial-card p-6 rounded-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#E6DFD5] gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-[#EBF3EF] text-[#1F5F4A] flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#141413]">
              Personalized Cold Outreach
            </h3>
            <p className="text-[11px] text-[#6B665E]">
              Strictly under 150 words with verified research citations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Word count stamp */}
          <span className="passport-stamp text-[10px] py-1 px-2.5">
            {actualWordCount} WORDS {isWithinLimit ? '• < 150 LIMIT' : '• REVIEW'}
          </span>

          {/* Copy Full Email */}
          <button
            type="button"
            onClick={handleCopyFull}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-bold bg-[#1F5F4A] hover:bg-[#174838] text-white shadow-xs transition cursor-pointer"
          >
            {copiedFull ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Email</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verified Context Insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[#FAF7F2] border border-[#E6DFD5] rounded-sm flex items-start space-x-2">
          <BookOpen className="w-3.5 h-3.5 text-[#1F5F4A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#141413] block text-[11px] font-mono uppercase">
              Referenced Lab Work:
            </span>
            <span className="text-[#2C2B29] leading-relaxed">
              {email.professorDetailReferenced}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#FAF7F2] border border-[#E6DFD5] rounded-sm flex items-start space-x-2">
          <UserCheck className="w-3.5 h-3.5 text-[#1F5F4A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#141413] block text-[11px] font-mono uppercase">
              Connected Student Strengths:
            </span>
            <span className="text-[#2C2B29] leading-relaxed">
              {email.studentSkillsConnected.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Academic Mail Composer */}
      <div className="mt-5 border border-[#E6DFD5] bg-[#FAF7F2] rounded-sm overflow-hidden">
        {/* Subject Bar */}
        <div className="px-4 py-2.5 border-b border-[#E6DFD5] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B665E] shrink-0">
              Subject:
            </span>
            <span className="text-xs font-semibold text-[#141413] truncate font-sans">
              {email.subject}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopySubject}
            className="text-[11px] font-medium text-[#1F5F4A] hover:underline shrink-0 ml-2 cursor-pointer"
          >
            {copiedSubject ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Email Body */}
        <div className="p-5 bg-white">
          <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#141413] leading-relaxed font-normal">
            {email.body}
          </pre>

          <div className="mt-4 pt-3 border-t border-[#E6DFD5] flex items-center justify-between">
            <div className="text-[11px] text-[#6B665E] font-mono">
              ~{actualWordCount} words • No fabricated achievements
            </div>
            <button
              type="button"
              onClick={handleCopyBody}
              className="text-xs font-semibold text-[#1F5F4A] hover:underline inline-flex items-center space-x-1 cursor-pointer"
            >
              {copiedBody ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1F5F4A]" />
                  <span>Body Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Body Only</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Controls: Regenerate & Follow-up */}
      <div className="mt-5 p-3.5 bg-[#FAF7F2] border border-[#E6DFD5] rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-[#2C2B29]">Angle:</span>
          <select
            value={selectedVariation}
            onChange={(e) => setSelectedVariation(e.target.value)}
            disabled={isRegenerating}
            className="rounded-sm border border-[#E6DFD5] bg-white px-2.5 py-1 text-xs text-[#141413] focus:outline-none focus:border-[#1F5F4A]"
          >
            <option value="Standard Concise">Standard Concise (&lt;120 words)</option>
            <option value="Project-Deep Dive">Project-First Emphasis</option>
            <option value="High-Curiosity Research Hook">Publication Curiosity Hook</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {onOpenFollowUp && (
            <button
              type="button"
              onClick={onOpenFollowUp}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#FBF5E8] border border-[#E5DFD5] text-[#9E782F] hover:bg-white transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Draft Follow-Up Email</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onRegenerate(selectedVariation)}
            disabled={isRegenerating}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-sm text-xs font-bold bg-white hover:bg-[#EFE9DF] text-[#1F5F4A] border border-[#E6DFD5] shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Drafting...' : 'Regenerate Email'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
