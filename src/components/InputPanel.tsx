import React, { useState } from 'react';
import { ApplicationType, ToneType, CVProfile } from '../types';
import { SAMPLE_DATASETS, SampleDataset } from '../data/sampleData';
import { formatSimpleErrorMessage } from '../utils/errorFormatter';
import {
  Sparkles,
  GraduationCap,
  User,
  Trash2,
  FolderDown,
  AlertCircle,
  ChevronDown,
  Check,
  Edit3,
  Eye,
  Award
} from 'lucide-react';

interface InputPanelProps {
  professorDescription: string;
  setProfessorDescription: (val: string) => void;
  cvText: string;
  setCvText: (val: string) => void;
  applicationType: ApplicationType;
  setApplicationType: (val: ApplicationType) => void;
  tone: ToneType;
  setTone: (val: ToneType) => void;
  activeProfile?: CVProfile | null;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
  retryStatusMessage?: string | null;
  errorMessage: string | null;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  professorDescription,
  setProfessorDescription,
  cvText,
  setCvText,
  applicationType,
  setApplicationType,
  tone,
  setTone,
  activeProfile,
  onAnalyze,
  onClear,
  isLoading,
  retryStatusMessage,
  errorMessage,
}) => {
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showManualEdit, setShowManualEdit] = useState(false);

  const handleSelectSample = (sample: SampleDataset) => {
    setProfessorDescription(sample.professorDescription);
    setCvText(sample.cvText);
    setApplicationType(sample.applicationType);
    setTone(sample.tone);
    setShowSampleMenu(false);
    setValidationError(null);
  };

  const effectiveCvText = cvText || activeProfile?.rawText || '';

  const handleAnalyzeClick = () => {
    if (!professorDescription.trim() && !effectiveCvText.trim()) {
      setValidationError('Please enter both the Professor / Program Description and your CV.');
      return;
    }
    if (!professorDescription.trim()) {
      setValidationError('Please paste the Professor / Program description before analyzing.');
      return;
    }
    if (!effectiveCvText.trim()) {
      setValidationError('Please paste your CV or import one in the CV Profile tab before analyzing.');
      return;
    }
    if (professorDescription.trim().length < 25) {
      setValidationError('Professor description is too brief. Provide a few sentences about their lab focus or papers.');
      return;
    }
    if (effectiveCvText.trim().length < 25) {
      setValidationError('CV text is too brief. Include your key courses, projects, or technical tools.');
      return;
    }

    setValidationError(null);
    onAnalyze();
  };

  return (
    <div className="editorial-card p-5 sm:p-6 rounded-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E6DFD5] mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#1F5F4A] text-white flex items-center justify-center font-mono text-xs font-bold">
            01
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-[#141413]">
              Application Context
            </h2>
            <p className="text-[11px] text-[#6B665E]">
              Provide target faculty details and your candidate record
            </p>
          </div>
        </div>

        {/* Sample Preset Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSampleMenu(!showSampleMenu)}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#141413] border border-[#E6DFD5] transition cursor-pointer disabled:opacity-50"
          >
            <FolderDown className="w-3.5 h-3.5 text-[#1F5F4A]" />
            <span>Load Sample</span>
            <ChevronDown className="w-3 h-3 text-[#6B665E]" />
          </button>

          {showSampleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E6DFD5] shadow-xl z-30 p-1 rounded-sm animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#6B665E]">
                Select Academic Scenario
              </div>
              {SAMPLE_DATASETS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#FAF7F2] transition group flex flex-col space-y-0.5 border-b border-[#EFE9DF] last:border-b-0 cursor-pointer"
                >
                  <span className="font-serif font-bold text-[#141413] group-hover:text-[#1F5F4A]">
                    {sample.label}
                  </span>
                  <span className="text-[11px] text-[#6B665E]">
                    {sample.sublabel}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Textarea 1: Professor / Program Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="professor-description"
              className="flex items-center space-x-1.5 text-xs font-semibold text-[#141413]"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#1F5F4A]" />
              <span>Professor / Program Description</span>
              <span className="text-[#C49B45]">*</span>
            </label>
            <span className="text-[10px] font-mono text-[#6B665E]">
              {professorDescription.length} chars
            </span>
          </div>
          <textarea
            id="professor-description"
            rows={6}
            value={professorDescription}
            onChange={(e) => {
              setProfessorDescription(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Paste lab research overview, recent papers, faculty interests, or program guidelines..."
            className="w-full rounded-sm border border-[#E6DFD5] bg-[#FAF7F2] p-3 text-xs text-[#141413] placeholder-[#6B665E]/60 focus:border-[#1F5F4A] focus:bg-white focus:outline-none transition resize-y font-sans leading-relaxed"
          />
        </div>

        {/* Section 2: CV Field (Requirement #2: If active profile exists, hide sample text and show "Using CV: <name>") */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="cv-text"
              className="flex items-center space-x-1.5 text-xs font-semibold text-[#141413]"
            >
              <User className="w-3.5 h-3.5 text-[#1F5F4A]" />
              <span>Your CV / Skills</span>
              <span className="text-[#C49B45]">*</span>
            </label>
            {activeProfile && (
              <span className="text-[10px] font-mono text-[#1F5F4A] font-semibold">
                Active Applicant Linked
              </span>
            )}
          </div>

          {activeProfile ? (
            /* Active Profile Display */
            <div className="p-3.5 bg-white border border-[#1F5F4A]/30 rounded-sm shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6DFD5] mb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="passport-stamp text-[10px] py-0.5 px-2">
                    Using CV: {activeProfile.name || 'Candidate'}
                  </span>
                  <span className="text-[10px] font-mono text-[#6B665E] hidden sm:inline">
                    Strength: {activeProfile.cvStrengthScore ? activeProfile.cvStrengthScore.toFixed(1) : '7.0'}/10
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowManualEdit(!showManualEdit)}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#1F5F4A] hover:underline cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{showManualEdit ? 'Hide Text' : 'View / Edit Text'}</span>
                </button>
              </div>

              <div className="text-xs text-[#2C2B29] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-semibold text-[#141413]">
                    {activeProfile.education?.degree || 'Degree'}
                  </span>
                  <span className="text-[#6B665E]"> — {activeProfile.education?.institution || 'Institution'}</span>
                  {activeProfile.education?.gpaOrHonors && (
                    <span className="text-[#C49B45] font-mono ml-1.5 font-bold">
                      ({activeProfile.education.gpaOrHonors})
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#1F5F4A]">
                  Ready for matching
                </span>
              </div>

              {showManualEdit && (
                <div className="mt-3 pt-2.5 border-t border-[#E6DFD5]">
                  <textarea
                    rows={5}
                    value={cvText}
                    onChange={(e) => {
                      setCvText(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Paste or modify candidate CV text..."
                    className="w-full rounded-sm border border-[#E6DFD5] bg-[#FAF7F2] p-2.5 text-xs text-[#141413] focus:border-[#1F5F4A] focus:outline-none"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Empty Textarea with Placeholder (No pre-filled text) */
            <div>
              <textarea
                id="cv-text"
                rows={6}
                value={cvText}
                onChange={(e) => {
                  setCvText(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Paste your CV text here: degree, coursework, research projects, technical tools, and publications..."
                className="w-full rounded-sm border border-[#E6DFD5] bg-[#FAF7F2] p-3 text-xs text-[#141413] placeholder-[#6B665E]/60 focus:border-[#1F5F4A] focus:bg-white focus:outline-none transition resize-y font-sans leading-relaxed"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-[#6B665E]">
                <span>{cvText.length} characters</span>
                <span>Upload PDF anytime in CV Profile</span>
              </div>
            </div>
          )}
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label
              htmlFor="app-type"
              className="block text-xs font-semibold text-[#2C2B29] mb-1"
            >
              Application Type
            </label>
            <select
              id="app-type"
              value={applicationType}
              onChange={(e) => setApplicationType(e.target.value as ApplicationType)}
              className="w-full rounded-sm border border-[#E6DFD5] bg-[#FAF7F2] px-3 py-2 text-xs text-[#141413] focus:border-[#1F5F4A] focus:outline-none"
            >
              <option value="Research Internship">Research Internship</option>
              <option value="MS">Master of Science (MS)</option>
              <option value="PhD">Doctor of Philosophy (PhD)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="tone-type"
              className="block text-xs font-semibold text-[#2C2B29] mb-1"
            >
              Outreach Tone
            </label>
            <select
              id="tone-type"
              value={tone}
              onChange={(e) => setTone(e.target.value as ToneType)}
              className="w-full rounded-sm border border-[#E6DFD5] bg-[#FAF7F2] px-3 py-2 text-xs text-[#141413] focus:border-[#1F5F4A] focus:outline-none"
            >
              <option value="Formal">Formal &amp; Academic</option>
              <option value="Friendly-Professional">Friendly-Professional</option>
            </select>
          </div>
        </div>

        {/* Retry Status Indicator */}
        {retryStatusMessage && (
          <div className="p-2.5 rounded-sm bg-[#FBF5E8] border border-[#E5DFD5] text-xs text-[#9E782F] font-semibold flex items-center space-x-2 animate-in fade-in">
            <svg className="animate-spin h-3.5 w-3.5 text-[#C49B45]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>{retryStatusMessage}</span>
          </div>
        )}

        {/* Validation Error Message (Formatted in simple language) */}
        {(validationError || errorMessage) && (
          <div className="p-3 rounded-sm bg-[#FDF2F2] border border-[#F5C2C2] text-xs text-red-900 flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
            <div className="flex-1 font-medium leading-relaxed">
              {formatSimpleErrorMessage(validationError || errorMessage)}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            className="w-full sm:flex-1 py-3 px-5 rounded-sm font-bold text-xs uppercase tracking-wider text-white bg-[#1F5F4A] hover:bg-[#174838] shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>{retryStatusMessage || 'Analyzing your profile...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Application</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={isLoading || (!professorDescription && !cvText && !activeProfile)}
            className="w-full sm:w-auto px-4 py-3 rounded-sm text-xs font-semibold text-[#6B665E] hover:text-[#141413] hover:bg-[#FAF7F2] border border-[#E6DFD5] transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        <div className="pt-2 text-[10px] font-mono text-[#6B665E] flex justify-between">
          <span>Server-side verification with Gemini</span>
          <span>Zero fabricated credentials</span>
        </div>
      </div>
    </div>
  );
};
