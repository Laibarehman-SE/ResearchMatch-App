import React, { useState, useRef } from 'react';
import { CVProfile } from '../types';
import { formatSimpleErrorMessage } from '../utils/errorFormatter';
import {
  Upload,
  FileText,
  Sparkles,
  Award,
  GraduationCap,
  Calendar,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Check,
  PlusCircle
} from 'lucide-react';

interface CVProfileCardProps {
  cvProfile: CVProfile | null;
  setCvProfile: (profile: CVProfile | null) => void;
  rawCvText: string;
  setRawCvText: (text: string) => void;
  onUseForApplications: () => void;
}

export const CVProfileCard: React.FC<CVProfileCardProps> = ({
  cvProfile,
  setCvProfile,
  rawCvText,
  setRawCvText,
  onUseForApplications,
}) => {
  // Empty by default, no prefilled Jane Doe sample!
  const [inputText, setInputText] = useState(rawCvText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedFeedback, setUsedFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadedFileName(file.name);

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        analyzeCV(undefined, base64Data, file.name);
      };
      reader.onerror = () => {
        setError('Failed to read PDF file. Please paste text instead.');
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text or markdown
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputText(content);
        setRawCvText(content);
        analyzeCV(content);
      };
      reader.readAsText(file);
    }
  };

  const analyzeCV = async (textToAnalyze?: string, pdfBase64?: string, filename?: string) => {
    const cvToUse = textToAnalyze !== undefined ? textToAnalyze : inputText;

    if (!pdfBase64 && (!cvToUse || cvToUse.trim().length < 25)) {
      setError('Please paste a CV (at least 25 characters) or upload a PDF/text file to extract your profile.');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage(null);
    setError(null);

    let attempt = 1;
    const maxAttempts = 3;
    let useFallback = false;

    while (attempt <= maxAttempts) {
      try {
        const res = await fetch('/api/analyze-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText: cvToUse,
            pdfBase64,
            filename,
            useFallbackModel: useFallback,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const rawErr = data.error || res.statusText;
          const isBusy =
            res.status === 429 ||
            res.status === 503 ||
            rawErr.includes('429') ||
            rawErr.includes('503') ||
            rawErr.includes('busy');

          if (isBusy && attempt < maxAttempts) {
            setStatusMessage(`Model is busy, retrying (${attempt}/3)...`);
            const delay = attempt === 1 ? 2500 : attempt === 2 ? 3500 : 4500;
            await new Promise((r) => setTimeout(r, delay));
            attempt++;
            useFallback = true;
            continue;
          }

          throw new Error(formatSimpleErrorMessage(rawErr));
        }

        const fullProfile: CVProfile = {
          ...data,
          rawText: cvToUse || inputText,
        };

        setCvProfile(fullProfile);
        setRawCvText(cvToUse || inputText);
        setStatusMessage(null);
        break;
      } catch (err: unknown) {
        const errStr = String(err instanceof Error ? err.message : err);
        const isBusy =
          errStr.includes('429') ||
          errStr.includes('503') ||
          errStr.includes('busy');

        if (isBusy && attempt < maxAttempts) {
          setStatusMessage(`Model is busy, retrying (${attempt}/3)...`);
          const delay = attempt === 1 ? 2500 : attempt === 2 ? 3500 : 4500;
          await new Promise((r) => setTimeout(r, delay));
          attempt++;
          useFallback = true;
          continue;
        }

        console.error('Error analyzing CV:', err);
        setError(formatSimpleErrorMessage(err));
        break;
      } finally {
        if (attempt >= maxAttempts || !isAnalyzing) {
          setIsAnalyzing(false);
        }
      }
    }

    setIsAnalyzing(false);
  };

  const handleUseCV = () => {
    onUseForApplications();
    setUsedFeedback(true);
    setTimeout(() => setUsedFeedback(false), 2500);
  };

  // Helper for rendering missing fields per requirement #5
  const renderField = (value: string | undefined | null, fieldLabel: string) => {
    if (
      !value ||
      value.trim() === '' ||
      value.toLowerCase().includes('not specified') ||
      value.toLowerCase().includes('unknown') ||
      value.toLowerCase().includes('none')
    ) {
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#9E782F] bg-[#FBF5E8] border border-[#E5DFD5] px-2 py-0.5 rounded-2xs">
          <PlusCircle className="w-3 h-3 text-[#C49B45]" />
          <span>{fieldLabel}: Add this to your CV</span>
        </span>
      );
    }
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Editorial Section Header */}
      <div className="border-b border-[#E6DFD5] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              Curriculum Vitae Dossier
            </h2>
            <p className="text-xs sm:text-sm text-[#6B665E] mt-0.5">
              Upload your CV once. ResearchMatch parses credentials and calculates your Academic Strength Score.
            </p>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#1F5F4A]">
            Single Source of Truth
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input / Uploader (5 cols) */}
        <div className="lg:col-span-5 editorial-card p-5 sm:p-6 rounded-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5] mb-4">
            <h3 className="font-serif font-bold text-base text-[#141413] flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#1F5F4A]" />
              <span>Import Academic CV</span>
            </h3>
            <span className="text-[10px] font-mono text-[#6B665E]">PDF / TXT / MD</span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-[#D4CABF] hover:border-[#1F5F4A] bg-[#FAF7F2] p-5 rounded-sm text-center cursor-pointer transition group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md,.text"
              className="hidden"
            />
            <div className="w-10 h-10 mx-auto rounded-full bg-[#EBF3EF] text-[#1F5F4A] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-[#141413]">
              {uploadedFileName ? (
                <span className="text-[#1F5F4A] font-mono">Uploaded: {uploadedFileName}</span>
              ) : (
                'Click to upload CV (PDF or Text)'
              )}
            </p>
            <p className="text-[11px] text-[#6B665E] mt-1">
              Gemini directly parses formatting, coursework, and technical tools
            </p>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-[#E6DFD5] w-full" />
            <span className="bg-white px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#6B665E] absolute">
              or paste text
            </span>
          </div>

          {/* Text Area (Empty by default, placeholder only) */}
          <div>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setRawCvText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste your CV text here: Degree, Institution, GPA, Research Projects, Coursework, Technical Skills..."
              className="w-full text-xs font-normal text-[#141413] bg-[#FAF7F2] border border-[#E6DFD5] p-3 rounded-sm focus:outline-none focus:border-[#1F5F4A] leading-relaxed resize-y font-sans"
            />
          </div>

          {/* Retry Status Indicator */}
          {statusMessage && (
            <div className="mt-3 p-2.5 bg-[#FBF5E8] border border-[#E5DFD5] text-[#9E782F] text-xs rounded-sm flex items-center space-x-2 animate-in fade-in">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C49B45]" />
              <span className="font-semibold">{statusMessage}</span>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-[#FDF2F2] border border-[#F5C2C2] text-red-900 text-xs rounded-sm flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-[#E6DFD5] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#6B665E]">
              {inputText.length} characters
            </span>
            <button
              type="button"
              onClick={() => analyzeCV()}
              disabled={isAnalyzing}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-sm text-xs font-bold bg-[#1F5F4A] hover:bg-[#174838] text-white shadow-xs cursor-pointer disabled:opacity-50 transition"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing CV...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract Profile Card</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Parsed Profile Card (7 cols) */}
        <div className="lg:col-span-7">
          {cvProfile ? (
            <div className="editorial-card p-6 rounded-sm relative">
              {/* Header with Candidate Name & Score Stamp */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b border-[#E6DFD5] gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#1F5F4A]">
                      Verified Candidate Record
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#141413] mt-0.5">
                    {renderField(cvProfile.name, 'Name')}
                  </h3>

                  {/* Education details with "Add this to your CV" fallbacks */}
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center space-x-2 text-xs text-[#2C2B29]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#1F5F4A] shrink-0" />
                      <span>
                        {renderField(cvProfile.education.degree, 'Degree')} —{' '}
                        {renderField(cvProfile.education.institution, 'Institution')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {/* GPA or Honors */}
                      {renderField(cvProfile.education.gpaOrHonors, 'GPA / Honors')}

                      {/* Graduation Year */}
                      {cvProfile.education.graduationYear &&
                      !cvProfile.education.graduationYear.toLowerCase().includes('not specified') ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#1F5F4A] bg-[#EBF3EF] px-2 py-0.5 rounded-2xs">
                          <Calendar className="w-3 h-3" />
                          <span>Class of {cvProfile.education.graduationYear}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#9E782F] bg-[#FBF5E8] border border-[#E5DFD5] px-2 py-0.5 rounded-2xs">
                          <PlusCircle className="w-3 h-3 text-[#C49B45]" />
                          <span>Graduation Year: Add this to your CV</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Passport Stamp for CV Strength Score */}
                <div className="flex flex-col items-start sm:items-end">
                  <div className="passport-stamp text-xs px-3 py-1.5 flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>STRENGTH: {cvProfile.cvStrengthScore ? cvProfile.cvStrengthScore.toFixed(1) : '7.0'} / 10</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B665E] mt-1">
                    Academic Competitiveness
                  </span>
                </div>
              </div>

              {/* Top Skills Categorized */}
              <div className="mt-5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#6B665E] mb-2.5">
                  Extracted Technical &amp; Research Competencies
                </h4>
                {cvProfile.topSkills && cvProfile.topSkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cvProfile.topSkills.map((cat, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#FAF7F2] border border-[#E6DFD5] rounded-sm"
                      >
                        <span className="text-[11px] font-bold text-[#1F5F4A] block mb-1.5">
                          {cat.category || 'Skills'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cat.skills && cat.skills.length > 0 ? (
                            cat.skills.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-block text-[11px] font-medium px-2 py-0.5 bg-white border border-[#E6DFD5] text-[#2C2B29] rounded-2xs"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[#9E782F]">
                              Skills: Add this to your CV
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-[#FBF5E8] border border-[#E5DFD5] text-xs text-[#9E782F] rounded-sm">
                    Core Technical Skills: Add this to your CV
                  </div>
                )}
              </div>

              {/* Key Projects */}
              <div className="mt-5 pt-4 border-t border-[#E6DFD5]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#6B665E] mb-2.5">
                  Core Research &amp; Engineering Projects
                </h4>
                {cvProfile.keyProjects && cvProfile.keyProjects.length > 0 ? (
                  <div className="space-y-2.5">
                    {cvProfile.keyProjects.map((proj, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-3 bg-[#FAF7F2] border border-[#E6DFD5] rounded-sm"
                      >
                        <div className="font-serif font-bold text-xs text-[#141413]">
                          {proj.title || 'Research Project: Add title to your CV'}
                        </div>
                        <div className="text-xs text-[#2C2B29] mt-0.5 leading-relaxed">
                          {proj.description || 'Project Summary: Add this to your CV'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-[#FBF5E8] border border-[#E5DFD5] text-xs text-[#9E782F] rounded-sm">
                    Research Projects: Add this to your CV
                  </div>
                )}
              </div>

              {/* Actionable Improvement Tips (Exactly 3) */}
              <div className="mt-5 pt-4 border-t border-[#E6DFD5]">
                <div className="flex items-center space-x-1.5 mb-2.5">
                  <Lightbulb className="w-4 h-4 text-[#C49B45]" />
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#141413] font-bold">
                    3 Actionable CV Improvement Tips
                  </h4>
                </div>
                <div className="space-y-2">
                  {cvProfile.improvementTips && cvProfile.improvementTips.length > 0 ? (
                    cvProfile.improvementTips.map((tip, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3 bg-[#FBF5E8] border border-[#E5DFD5] rounded-sm text-xs text-[#2C2B29] flex items-start space-x-2.5"
                      >
                        <span className="font-mono text-[#9E782F] font-bold text-xs">
                          0{tIdx + 1}.
                        </span>
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#6B665E]">
                      Profile tips will appear here once parsed.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-6 pt-4 border-t border-[#E6DFD5] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-[#6B665E]">
                  This CV is automatically linked to the Application Studio and Lab Ranker.
                </span>
                <button
                  type="button"
                  onClick={handleUseCV}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#1F5F4A] hover:bg-[#174838] text-white text-xs font-bold rounded-sm shadow-xs cursor-pointer transition"
                >
                  {usedFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Linked to Studio!</span>
                    </>
                  ) : (
                    <>
                      <span>Apply with This CV</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="editorial-card p-8 rounded-sm text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-12 h-12 rounded-sm bg-[#EBF3EF] text-[#1F5F4A] flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#141413]">
                No Profile Extracted Yet
              </h3>
              <p className="text-xs text-[#6B665E] max-w-sm mt-1 leading-relaxed">
                Upload your CV document or paste your credentials on the left. ResearchMatch will generate your Academic Profile Card and compute your baseline admission readiness score.
              </p>
              <div className="mt-4 pt-4 border-t border-[#E6DFD5] w-full max-w-xs text-[11px] font-mono text-[#6B665E]">
                STRICT RULE: Zero hallucinated publications or skills.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
