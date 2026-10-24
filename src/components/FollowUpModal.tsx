import React, { useState } from 'react';
import { FollowUpEmailResponse } from '../types';
import { formatSimpleErrorMessage } from '../utils/errorFormatter';
import { Mail, Copy, Check, X, RefreshCw, Clock, Sparkles } from 'lucide-react';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  professorNameOrLab: string;
  initialSubject: string;
  studentName?: string;
  cvText?: string;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  professorNameOrLab,
  initialSubject,
  studentName,
  cvText,
}) => {
  const [followUpData, setFollowUpData] = useState<FollowUpEmailResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [daysAgo, setDaysAgo] = useState(8);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/followup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorDescription: professorNameOrLab,
          initialSubject,
          studentName,
          cvText,
          daysAgo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate follow-up email.');
      }

      setFollowUpData(data);
    } catch (err: unknown) {
      console.error('Follow-up error:', err);
      setError(formatSimpleErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!followUpData) return;
    const text = `Subject: ${followUpData.subject}\n\n${followUpData.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] shadow-2xl rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6B665E] hover:text-[#141413] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-[#E6DFD5] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-[#1F5F4A]" />
            <h3 className="font-serif text-lg font-bold text-[#141413]">
              Generate Respectful Follow-up Email
            </h3>
          </div>
          <p className="text-xs text-[#6B665E] mt-0.5">
            Designed for faculty members who have not responded after 7–10 days.
          </p>
        </div>

        {/* Context Preview */}
        <div className="p-3 bg-white border border-[#E6DFD5] rounded-sm text-xs mb-4 space-y-1">
          <div>
            <span className="font-mono text-[#6B665E] text-[10px] uppercase">Recipient Lab:</span>{' '}
            <span className="font-semibold text-[#141413]">{professorNameOrLab || 'Target Laboratory'}</span>
          </div>
          <div>
            <span className="font-mono text-[#6B665E] text-[10px] uppercase">Initial Subject:</span>{' '}
            <span className="text-[#2C2B29]">{initialSubject || 'Prospective Research Inquiry'}</span>
          </div>
        </div>

        {/* Timing Control */}
        <div className="flex items-center space-x-3 mb-4">
          <label className="text-xs font-semibold text-[#2C2B29] flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C49B45]" />
            <span>Days since first email:</span>
          </label>
          <select
            value={daysAgo}
            onChange={(e) => setDaysAgo(Number(e.target.value))}
            className="text-xs bg-white border border-[#E6DFD5] px-2.5 py-1 rounded-sm focus:outline-none focus:border-[#1F5F4A]"
          >
            <option value={7}>7 business days</option>
            <option value={8}>8 days (Recommended)</option>
            <option value={10}>10 days</option>
            <option value={14}>14 days (2 weeks)</option>
          </select>
        </div>

        {!followUpData && (
          <div className="text-center py-6">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1F5F4A] hover:bg-[#174838] text-white text-xs font-bold rounded-sm shadow-xs cursor-pointer disabled:opacity-50 transition"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting Follow-up...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft Polite Follow-Up</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm mb-4">
            {error}
          </div>
        )}

        {followUpData && (
          <div className="space-y-4">
            {/* Subject */}
            <div className="p-3 bg-white border border-[#E6DFD5] rounded-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B665E] block mb-1">
                Subject Line
              </span>
              <div className="text-xs font-semibold text-[#141413]">
                {followUpData.subject}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B665E] block mb-2">
                Email Body (&lt;100 words)
              </span>
              <pre className="whitespace-pre-wrap font-sans text-xs text-[#2C2B29] leading-relaxed">
                {followUpData.body}
              </pre>
            </div>

            {/* Strategic Advice */}
            <div className="p-3 bg-[#FBF5E8] border border-[#E5DFD5] rounded-sm text-xs text-[#2C2B29] space-y-1">
              <div className="font-semibold text-[#9E782F] flex items-center space-x-1">
                <span>Academic Etiquette Note:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {followUpData.daysRecommendation} — {followUpData.strategyNote}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs text-[#6B665E] hover:text-[#1F5F4A] underline cursor-pointer"
              >
                Regenerate Variation
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1F5F4A] hover:bg-[#174838] text-white text-xs font-bold rounded-sm shadow-xs cursor-pointer transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Follow-Up Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
