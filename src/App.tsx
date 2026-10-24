/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { FitAnalysisCard } from './components/FitAnalysisCard';
import { ColdEmailCard } from './components/ColdEmailCard';
import { SOPOutlineCard } from './components/SOPOutlineCard';
import { SkillGapsCard } from './components/SkillGapsCard';
import { InterviewCard } from './components/InterviewCard';
import { ChecklistCard } from './components/ChecklistCard';
import { CVProfileCard } from './components/CVProfileCard';
import { LabRanker } from './components/LabRanker';
import { ApplicationTracker } from './components/ApplicationTracker';
import { FollowUpModal } from './components/FollowUpModal';
import { Footer } from './components/Footer';
import {
  ApplicationType,
  ToneType,
  ResearchPackage,
  ColdEmail,
  CVProfile,
  TrackedApplication,
  ApplicationStatus,
} from './types';
import { SAMPLE_DATASETS } from './data/sampleData';
import { formatSimpleErrorMessage } from './utils/errorFormatter';
import {
  generateMarkdownReport,
  downloadMarkdownFile,
  printApplicationPackageAsPdf,
} from './utils/markdownExporter';
import {
  Sparkles,
  Download,
  AlertCircle,
  RotateCcw,
  Layers,
  Target,
  Mail,
  FileText,
  Lightbulb,
  HelpCircle,
  CheckSquare,
  ArrowRight,
  Printer,
  BookmarkPlus,
  Check,
  Award,
  RefreshCw
} from 'lucide-react';

export default function App() {
  // Navigation View State
  const [activeView, setActiveView] = useState<'studio' | 'ranker' | 'tracker' | 'cv'>('studio');

  // Candidate CV State (Empty by default per Requirement #1, never prefilled with Jane Doe)
  const [cvProfile, setCvProfile] = useState<CVProfile | null>(() => {
    try {
      const saved = localStorage.getItem('rm_cv_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cvText, setCvText] = useState<string>(() => {
    try {
      return localStorage.getItem('rm_cv_text') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rm_cv_text', cvText);
    } catch {
      // Ignore storage errors
    }
  }, [cvText]);

  useEffect(() => {
    try {
      if (cvProfile) {
        localStorage.setItem('rm_cv_profile', JSON.stringify(cvProfile));
      }
    } catch {
      // Ignore storage errors
    }
  }, [cvProfile]);

  // Form State for Application Studio (Empty by default)
  const [professorDescription, setProfessorDescription] = useState<string>('');
  const [applicationType, setApplicationType] = useState<ApplicationType>('Research Internship');
  const [tone, setTone] = useState<ToneType>('Formal');

  // Active Output Package
  const [researchPackage, setResearchPackage] = useState<ResearchPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'fit' | 'email' | 'sop' | 'gaps' | 'interview' | 'checklist'>('fit');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [isRegeneratingEmail, setIsRegeneratingEmail] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAllMarkdown, setCopiedAllMarkdown] = useState<boolean>(false);

  // Application Tracker State (Persisted in localStorage)
  const [trackedApplications, setTrackedApplications] = useState<TrackedApplication[]>(() => {
    try {
      const saved = localStorage.getItem('rm_tracked_apps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rm_tracked_apps', JSON.stringify(trackedApplications));
    } catch {
      // Ignore
    }
  }, [trackedApplications]);

  const [savedToTrackerToast, setSavedToTrackerToast] = useState(false);

  // Follow-up Email Modal State
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  // Effective CV text: use activeProfile's raw text if available and cvText is empty
  const effectiveCv = cvText || cvProfile?.rawText || '';

  // Full Analysis execution with automatic retry (Requirement #3 & #4)
  const handleAnalyze = async () => {
    setIsLoading(true);
    setRetryStatus(null);
    setErrorMessage(null);

    let attempt = 1;
    const maxAttempts = 3;
    let useFallback = false;

    while (attempt <= maxAttempts) {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            professorDescription,
            cvText: effectiveCv,
            applicationType,
            tone,
            useFallbackModel: useFallback,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const rawErr = data.error || response.statusText;
          const isBusy =
            response.status === 429 ||
            response.status === 503 ||
            rawErr.includes('429') ||
            rawErr.includes('503') ||
            rawErr.includes('busy') ||
            rawErr.includes('overloaded');

          if (isBusy && attempt < maxAttempts) {
            setRetryStatus(`Model is busy, retrying (${attempt}/3)...`);
            const delay = attempt === 1 ? 2500 : attempt === 2 ? 3500 : 4500;
            await new Promise((r) => setTimeout(r, delay));
            attempt++;
            useFallback = true;
            continue;
          }

          throw new Error(formatSimpleErrorMessage(rawErr));
        }

        setResearchPackage(data);
        setActiveTab('fit');
        setRetryStatus(null);
        break;
      } catch (err: unknown) {
        const errStr = String(err instanceof Error ? err.message : err);
        const isBusy =
          errStr.includes('429') ||
          errStr.includes('503') ||
          errStr.includes('busy') ||
          errStr.includes('overloaded');

        if (isBusy && attempt < maxAttempts) {
          setRetryStatus(`Model is busy, retrying (${attempt}/3)...`);
          const delay = attempt === 1 ? 2500 : attempt === 2 ? 3500 : 4500;
          await new Promise((r) => setTimeout(r, delay));
          attempt++;
          useFallback = true;
          continue;
        }

        console.error('Analysis error:', err);
        setErrorMessage(formatSimpleErrorMessage(err));
        break;
      } finally {
        if (attempt >= maxAttempts || !isLoading) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(false);
  };

  // Cold Email Regeneration with retry
  const handleRegenerateEmail = async (variation: string = 'standard') => {
    if (!researchPackage) return;
    setIsRegeneratingEmail(true);

    let attempt = 1;
    const maxAttempts = 3;
    let useFallback = false;

    while (attempt <= maxAttempts) {
      try {
        const response = await fetch('/api/regenerate-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            professorDescription,
            cvText: effectiveCv,
            applicationType,
            tone,
            variation,
            useFallbackModel: useFallback,
          }),
        });

        const newColdEmail: ColdEmail = await response.json();

        if (!response.ok) {
          const rawErr = (newColdEmail as any).error || response.statusText;
          const isBusy =
            response.status === 429 ||
            response.status === 503 ||
            rawErr.includes('429') ||
            rawErr.includes('503');

          if (isBusy && attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 2500));
            attempt++;
            useFallback = true;
            continue;
          }

          throw new Error(formatSimpleErrorMessage(rawErr));
        }

        setResearchPackage({
          ...researchPackage,
          coldEmail: newColdEmail,
        });
        break;
      } catch (err: unknown) {
        console.error('Email regeneration error:', err);
        setErrorMessage(formatSimpleErrorMessage(err));
        break;
      } finally {
        setIsRegeneratingEmail(false);
      }
    }

    setIsRegeneratingEmail(false);
  };

  // Clear Form
  const handleClear = () => {
    setProfessorDescription('');
    setCvText('');
    setResearchPackage(null);
    setErrorMessage(null);
  };

  // Save to Tracker
  const handleSaveToTracker = () => {
    if (!researchPackage) return;

    const firstLine = professorDescription.trim().split('\n')[0].slice(0, 75);
    const labTitle = firstLine || 'Target Academic Lab';

    const newApp: TrackedApplication = {
      id: `app-${Date.now()}`,
      labName: labTitle,
      professorName: researchPackage.coldEmail.professorDetailReferenced.slice(0, 60),
      institution: applicationType,
      applicationType,
      status: 'To Email',
      fitScore: researchPackage.fitAnalysis.score,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      coldEmailSubject: researchPackage.coldEmail.subject,
      coldEmailBody: researchPackage.coldEmail.body,
      researchPackage,
    };

    setTrackedApplications([newApp, ...trackedApplications]);
    setSavedToTrackerToast(true);
    setTimeout(() => setSavedToTrackerToast(false), 2500);
  };

  const handleUpdateTrackerStatus = (id: string, newStatus: ApplicationStatus) => {
    setTrackedApplications(
      trackedApplications.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const handleDeleteTrackedApplication = (id: string) => {
    setTrackedApplications(trackedApplications.filter((app) => app.id !== id));
  };

  const handleViewApplicationPackage = (app: TrackedApplication) => {
    if (app.researchPackage) {
      setResearchPackage(app.researchPackage);
      setActiveView('studio');
      setActiveTab('fit');
    }
  };

  // Transition from Lab Ranker to Application Studio
  const handleSelectLabForApplication = (labText: string, labLabel: string) => {
    setProfessorDescription(labText);
    setActiveView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Download Markdown
  const handleDownloadMarkdown = () => {
    if (!researchPackage) return;
    const report = generateMarkdownReport(researchPackage, {
      applicationType,
      tone,
      candidateName: cvProfile?.name,
    });
    const filename = `ResearchMatch_${applicationType.replace(/\s+/g, '_')}_Dossier.md`;
    downloadMarkdownFile(report, filename);
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (!researchPackage) return;
    printApplicationPackageAsPdf(researchPackage, {
      applicationType,
      tone,
      candidateName: cvProfile?.name,
      labName: professorDescription.slice(0, 50),
    });
  };

  // Copy Full Markdown
  const handleCopyAllMarkdown = () => {
    if (!researchPackage) return;
    const report = generateMarkdownReport(researchPackage, {
      applicationType,
      tone,
      candidateName: cvProfile?.name,
    });
    navigator.clipboard.writeText(report);
    setCopiedAllMarkdown(true);
    setTimeout(() => setCopiedAllMarkdown(false), 2000);
  };

  // Studio tabs
  const tabs = [
    {
      id: 'fit' as const,
      label: 'Fit Analysis',
      icon: Target,
      badge: researchPackage ? `${researchPackage.fitAnalysis.score.toFixed(1)}/10` : undefined,
    },
    {
      id: 'email' as const,
      label: 'Cold Email',
      icon: Mail,
      badge: researchPackage ? `<150w` : undefined,
    },
    {
      id: 'sop' as const,
      label: 'SOP Outline',
      icon: FileText,
      badge: researchPackage ? `5 parts` : undefined,
    },
    {
      id: 'gaps' as const,
      label: 'Skill Gaps',
      icon: Lightbulb,
      badge: researchPackage ? `${researchPackage.skillGaps.length}` : undefined,
    },
    {
      id: 'interview' as const,
      label: 'Interview Questions',
      icon: HelpCircle,
      badge: researchPackage ? '6 Qs' : undefined,
    },
    {
      id: 'checklist' as const,
      label: 'Action Checklist',
      icon: CheckSquare,
      badge: researchPackage ? '5 steps' : undefined,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#141413] selection:bg-[#1F5F4A] selection:text-white transition-colors">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        hasActiveCV={Boolean(cvProfile || (cvText && cvText.trim().length > 20))}
        activeCVName={cvProfile?.name}
        trackedCount={trackedApplications.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Global Error Banner (Simple Language) */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-sm bg-[#FDF2F2] border border-[#F5C2C2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-red-900 animate-in fade-in">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-sm font-semibold bg-[#1F5F4A] text-white hover:bg-[#174838] shrink-0 cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
          </div>
        )}

        {/* 1. CV PROFILE VIEW */}
        {activeView === 'cv' && (
          <CVProfileCard
            cvProfile={cvProfile}
            setCvProfile={setCvProfile}
            rawCvText={cvText}
            setRawCvText={setCvText}
            onUseForApplications={() => setActiveView('studio')}
          />
        )}

        {/* 2. LAB RANKER VIEW */}
        {activeView === 'ranker' && (
          <LabRanker
            cvText={effectiveCv}
            applicationType={applicationType}
            onSelectLabForApplication={handleSelectLabForApplication}
            onNavigateToCV={() => setActiveView('cv')}
          />
        )}

        {/* 3. APPLICATION TRACKER VIEW */}
        {activeView === 'tracker' && (
          <ApplicationTracker
            applications={trackedApplications}
            onUpdateStatus={handleUpdateTrackerStatus}
            onDeleteApplication={handleDeleteTrackedApplication}
            onViewApplicationPackage={handleViewApplicationPackage}
            studentName={cvProfile?.name}
            cvText={effectiveCv}
          />
        )}

        {/* 4. APPLICATION STUDIO (PRIMARY ANALYSIS) */}
        {activeView === 'studio' && (
          <div className="space-y-6">
            {/* Academic Masthead Sub-Banner */}
            <div className="editorial-card p-5 rounded-sm bg-[#FFFDF9] border border-[#E6DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#C49B45] uppercase font-bold">
                  Academic Editorial Suite
                </span>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#141413] mt-0.5">
                  Application Dossier Studio
                </h1>
                <p className="text-xs text-[#6B665E] mt-0.5 leading-relaxed">
                  Tailor your outreach email, statement of purpose outline, skill remedies, and interview strategies.
                </p>
              </div>

              {cvProfile ? (
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#6B665E] block">Active Applicant:</span>
                    <span className="font-serif font-bold text-xs text-[#141413]">{cvProfile.name}</span>
                  </div>
                  <div className="passport-stamp text-[10px] py-1 px-2">
                    CV: {cvProfile.cvStrengthScore ? cvProfile.cvStrengthScore.toFixed(1) : '7.0'}/10
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveView('cv')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#FAF7F2] border border-[#E6DFD5] text-[#1F5F4A] hover:bg-[#EFE9DF] cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Audit &amp; Score CV First</span>
                </button>
              )}
            </div>

            {/* Two-Column Studio Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Inputs (5 cols) */}
              <div className="lg:col-span-5 w-full">
                <InputPanel
                  professorDescription={professorDescription}
                  setProfessorDescription={setProfessorDescription}
                  cvText={cvText}
                  setCvText={setCvText}
                  applicationType={applicationType}
                  setApplicationType={setApplicationType}
                  tone={tone}
                  setTone={setTone}
                  activeProfile={cvProfile}
                  onAnalyze={handleAnalyze}
                  onClear={handleClear}
                  isLoading={isLoading}
                  retryStatusMessage={retryStatus}
                  errorMessage={errorMessage}
                />
              </div>

              {/* Right Column: Output or Empty/Loading (7 cols) */}
              <div className="lg:col-span-7 w-full">
                {isLoading ? (
                  /* Loading State with Real-Time Retry Status */
                  <div className="editorial-card p-10 rounded-sm text-center flex flex-col items-center justify-center min-h-[460px]">
                    <div className="w-12 h-12 rounded-sm bg-[#EBF3EF] text-[#1F5F4A] flex items-center justify-center mb-4">
                      <svg
                        className="animate-spin h-7 w-7 text-[#1F5F4A]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#141413]">
                      {retryStatus || 'Analyzing your profile...'}
                    </h3>
                    <p className="mt-1 text-xs text-[#6B665E] max-w-sm leading-relaxed">
                      {retryStatus
                        ? 'The model is currently experiencing high demand. We are automatically retrying with fallback capacity...'
                        : 'Gemini is auditing research synergy, validating technical overlap, and composing your academic dossier.'}
                    </p>

                    <div className="mt-5 w-full max-w-xs space-y-2 text-left text-xs text-[#6B665E] font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1F5F4A] animate-pulse" />
                        <span>Evaluating faculty papers &amp; core thrusts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C49B45] animate-pulse" />
                        <span>Drafting sub-150-word cold outreach</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1F5F4A] animate-pulse" />
                        <span>Generating SOP, interview Qs &amp; gap remedy</span>
                      </div>
                    </div>
                  </div>
                ) : researchPackage ? (
                  /* Results View */
                  <div className="space-y-4">
                    {/* Top Action Bar */}
                    <div className="editorial-card p-3.5 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="passport-stamp text-xs py-0.5 px-2">
                          SCORE {researchPackage.fitAnalysis.score.toFixed(1)}/10
                        </span>
                        <span className="text-xs font-serif font-bold text-[#141413]">
                          Dossier Prepared
                        </span>
                      </div>

                      {/* Export & Tracker Controls */}
                      <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end flex-wrap">
                        {/* Save to Tracker Button */}
                        <button
                          type="button"
                          onClick={handleSaveToTracker}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#1F5F4A] border border-[#E6DFD5] transition cursor-pointer"
                        >
                          {savedToTrackerToast ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#1F5F4A]" />
                              <span>Saved to Tracker!</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>Save to Tracker</span>
                            </>
                          )}
                        </button>

                        {/* Copy Markdown */}
                        <button
                          type="button"
                          onClick={handleCopyAllMarkdown}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#141413] border border-[#E6DFD5] transition cursor-pointer"
                        >
                          {copiedAllMarkdown ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#1F5F4A]" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Layers className="w-3.5 h-3.5" />
                              <span>Copy MD</span>
                            </>
                          )}
                        </button>

                        {/* Download Markdown */}
                        <button
                          type="button"
                          onClick={handleDownloadMarkdown}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#141413] border border-[#E6DFD5] transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Markdown</span>
                        </button>

                        {/* Download as PDF */}
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-bold bg-[#1F5F4A] hover:bg-[#174838] text-white shadow-xs transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="editorial-card p-1 rounded-sm overflow-x-auto scrollbar-none">
                      <div className="flex space-x-1 min-w-max">
                        {tabs.map((tab) => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center space-x-1.5 px-3 py-2 rounded-sm text-xs font-medium transition cursor-pointer ${
                                isActive
                                  ? 'bg-[#1F5F4A] text-white font-bold shadow-xs'
                                  : 'text-[#2C2B29] hover:bg-[#FAF7F2]'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{tab.label}</span>
                              {tab.badge && (
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded-2xs font-mono font-bold ${
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-[#FAF7F2] text-[#6B665E] border border-[#E6DFD5]'
                                  }`}
                                >
                                  {tab.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Tab Card */}
                    <div>
                      {activeTab === 'fit' && (
                        <FitAnalysisCard fit={researchPackage.fitAnalysis} />
                      )}

                      {activeTab === 'email' && (
                        <ColdEmailCard
                          email={researchPackage.coldEmail}
                          onRegenerate={handleRegenerateEmail}
                          isRegenerating={isRegeneratingEmail}
                          onOpenFollowUp={() => setShowFollowUpModal(true)}
                          onSaveToTracker={handleSaveToTracker}
                          isSavedToTracker={savedToTrackerToast}
                        />
                      )}

                      {activeTab === 'sop' && (
                        <SOPOutlineCard sop={researchPackage.sopOutline} />
                      )}

                      {activeTab === 'gaps' && (
                        <SkillGapsCard skillGaps={researchPackage.skillGaps} />
                      )}

                      {activeTab === 'interview' && (
                        <InterviewCard questions={researchPackage.interviewQuestions} />
                      )}

                      {activeTab === 'checklist' && (
                        <ChecklistCard checklist={researchPackage.actionChecklist} />
                      )}
                    </div>
                  </div>
                ) : (
                  /* Initial Empty State */
                  <div className="editorial-card p-8 rounded-sm text-center flex flex-col justify-center min-h-[460px]">
                    <div className="w-12 h-12 mx-auto rounded-sm bg-[#EBF3EF] text-[#1F5F4A] flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#141413]">
                      Ready to Build Your Application Package
                    </h3>
                    <p className="text-xs text-[#6B665E] max-w-sm mx-auto mt-1 leading-relaxed">
                      Enter the target faculty description on the left, or use the sample scenario to preview the full dossier suite.
                    </p>

                    <div className="mt-6 pt-5 border-t border-[#E6DFD5] text-left max-w-md mx-auto space-y-2.5">
                      <div className="flex items-start space-x-2 text-xs">
                        <span className="font-mono font-bold text-[#1F5F4A]">01.</span>
                        <div>
                          <strong className="text-[#141413]">Synergy Fit Score &amp; Verification</strong> —{' '}
                          <span className="text-[#6B665E]">Intersects verified coursework with target papers.</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-xs">
                        <span className="font-mono font-bold text-[#1F5F4A]">02.</span>
                        <div>
                          <strong className="text-[#141413]">Sub-150-Word Cold Outreach</strong> —{' '}
                          <span className="text-[#6B665E]">Cites one real lab milestone without invented achievements.</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-xs">
                        <span className="font-mono font-bold text-[#1F5F4A]">03.</span>
                        <div>
                          <strong className="text-[#141413]">SOP Outline &amp; Interview Inquiries</strong> —{' '}
                          <span className="text-[#6B665E]">Full dossier downloadable as PDF or Markdown.</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleAnalyze}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1F5F4A] hover:bg-[#174838] text-white text-xs font-bold rounded-sm shadow-xs cursor-pointer transition"
                      >
                        <span>Analyze Sample Laboratory</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Follow-Up Modal */}
      {showFollowUpModal && (
        <FollowUpModal
          isOpen={true}
          onClose={() => setShowFollowUpModal(false)}
          professorNameOrLab={professorDescription.slice(0, 80)}
          initialSubject={researchPackage?.coldEmail.subject || 'Prospective Research Inquiry'}
          studentName={cvProfile?.name}
          cvText={effectiveCv}
        />
      )}

      <Footer />
    </div>
  );
}
