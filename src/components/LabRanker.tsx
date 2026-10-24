import React, { useState } from 'react';
import { LabTargetInput, LabRankerResponse, ApplicationType } from '../types';
import { formatSimpleErrorMessage } from '../utils/errorFormatter';
import {
  Scale,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw
} from 'lucide-react';

interface LabRankerProps {
  cvText: string;
  applicationType: ApplicationType;
  onSelectLabForApplication: (labText: string, labLabel: string) => void;
  onNavigateToCV: () => void;
}

const SAMPLE_THREE_LABS: LabTargetInput[] = [
  {
    id: 'lab-1',
    label: 'ETH Zurich — Visual Learning & Perception (Prof. Richter)',
    text: `Prof. Dr. Florian Richter, Visual Learning and Autonomous Systems (VLAS) Lab, ETH Zurich.
Focus: Self-supervised visual representation learning and active perception for robotic manipulation in unstructured real-world environments.
Current Projects: Contrastive feature learning for sparse multi-view scene graphs; Foundation models for zero-shot object affordance reasoning on mobile manipulators; Sim-to-real transfer with Franka Emika Panda arms.
Requirements: Strong PyTorch, deep learning, computer vision, linear algebra. Familiarity with ROS/ROS2, point cloud processing, or robotics simulation is an asset.`
  },
  {
    id: 'lab-2',
    label: 'Stanford University — Stanford Vision and Learning Lab (Prof. Savarese)',
    text: `Stanford Vision and Learning Lab (SVL), Stanford University.
Focus: 3D computer vision, embodied artificial intelligence, and physical interaction.
Research Thrusts: Neural radiance fields (NeRF) and 3D Gaussian Splatting for real-time spatial scene understanding; Multi-modal generative priors for interactive robot task execution.
Desired Candidate Background: Extensive experience with 3D deep learning, PyTorch, C++ or CUDA optimization, and published benchmark reproducibility.`
  },
  {
    id: 'lab-3',
    label: 'Oxford Robotics Institute — Dynamic Robot Systems (Prof. Fallon)',
    text: `Oxford Robotics Institute (ORI), Dynamic Robot Systems Group, University of Oxford.
Research Focus: Robot localization, multi-sensor SLAM, LiDAR-inertial odometry, and state estimation for legged robots (ANYmal, Boston Dynamics Spot) navigating challenging industrial environments.
Key Skills: C++, ROS 2, factor graphs, optimization algorithms (GTSAM), spatial geometry, embedded systems.`
  }
];

const INITIAL_EMPTY_LABS: LabTargetInput[] = [
  { id: 'lab-1', label: 'Target Lab #1', text: '' },
  { id: 'lab-2', label: 'Target Lab #2', text: '' },
];

export const LabRanker: React.FC<LabRankerProps> = ({
  cvText,
  applicationType,
  onSelectLabForApplication,
  onNavigateToCV,
}) => {
  // Empty by default, no prefilled text unless user clicks "Load 3 Sample Labs"
  const [labs, setLabs] = useState<LabTargetInput[]>(INITIAL_EMPTY_LABS);
  const [rankingResult, setRankingResult] = useState<LabRankerResponse | null>(null);
  const [isRanking, setIsRanking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddLab = () => {
    if (labs.length >= 3) return;
    const newId = `lab-${Date.now()}`;
    setLabs([
      ...labs,
      {
        id: newId,
        label: `Target Lab #${labs.length + 1}`,
        text: '',
      },
    ]);
  };

  const handleRemoveLab = (id: string) => {
    if (labs.length <= 2) {
      setError('You must compare at least 2 labs to rank.');
      return;
    }
    setLabs(labs.filter((l) => l.id !== id));
  };

  const handleUpdateLab = (id: string, field: 'label' | 'text', value: string) => {
    setLabs(
      labs.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
    if (error) setError(null);
  };

  const handleLoadSampleLabs = () => {
    setLabs(SAMPLE_THREE_LABS);
    setRankingResult(null);
    setError(null);
  };

  const handleRank = async () => {
    if (!cvText || cvText.trim().length < 25) {
      setError('Please provide your CV first (in the CV Profile or Studio tab) so we can rank labs against your real background.');
      return;
    }

    const emptyLabs = labs.filter((l) => !l.text.trim());
    if (emptyLabs.length > 0) {
      setError('Please fill in descriptions for all labs before ranking, or click "Load 3 Sample Labs".');
      return;
    }

    setIsRanking(true);
    setStatusMessage(null);
    setError(null);

    let attempt = 1;
    const maxAttempts = 3;
    let useFallback = false;

    while (attempt <= maxAttempts) {
      try {
        const res = await fetch('/api/rank-labs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText,
            labs,
            applicationType,
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

        setRankingResult(data);
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

        console.error('Ranking error:', err);
        setError(formatSimpleErrorMessage(err));
        break;
      } finally {
        if (attempt >= maxAttempts || !isRanking) {
          setIsRanking(false);
        }
      }
    }

    setIsRanking(false);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-[#E6DFD5] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#141413]">
            Comparative Lab Ranker
          </h2>
          <p className="text-xs sm:text-sm text-[#6B665E] mt-0.5">
            Evaluate up to 3 faculty laboratories concurrently. Identify where your profile holds maximum leverage.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleLoadSampleLabs}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-sm bg-[#FAF7F2] border border-[#E6DFD5] text-[#1F5F4A] hover:bg-[#EFE9DF] cursor-pointer"
          >
            Load 3 Sample Labs
          </button>
        </div>
      </div>

      {/* CV Check Warning */}
      {!cvText && (
        <div className="p-3.5 bg-[#FBF5E8] border border-[#E5DFD5] text-xs text-[#2C2B29] rounded-sm flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#C49B45] shrink-0" />
            <span>
              No CV detected. For accurate comparative ranking, please input your CV text first.
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateToCV}
            className="font-bold text-[#1F5F4A] hover:underline shrink-0"
          >
            Go to CV Profile →
          </button>
        </div>
      )}

      {/* Labs Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {labs.map((lab, idx) => (
          <div
            key={lab.id}
            className="editorial-card p-4 rounded-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E6DFD5]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1F5F4A]">
                  Option #{idx + 1}
                </span>
                {labs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLab(lab.id)}
                    className="text-[#6B665E] hover:text-red-700 transition cursor-pointer"
                    title="Remove Lab"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={lab.label}
                onChange={(e) => handleUpdateLab(lab.id, 'label', e.target.value)}
                placeholder="Lab or Professor Name..."
                className="w-full text-xs font-serif font-bold text-[#141413] bg-transparent border-b border-transparent hover:border-[#E6DFD5] focus:border-[#1F5F4A] focus:outline-none mb-2 pb-0.5"
              />

              <textarea
                rows={7}
                value={lab.text}
                onChange={(e) => handleUpdateLab(lab.id, 'text', e.target.value)}
                placeholder="Paste lab page, recent papers, and student prerequisites here..."
                className="w-full text-xs text-[#2C2B29] bg-[#FAF7F2] border border-[#E6DFD5] p-2.5 rounded-sm focus:outline-none focus:border-[#1F5F4A] resize-y"
              />
            </div>
            <div className="text-[10px] font-mono text-[#6B665E] mt-2 pt-1 border-t border-[#E6DFD5] flex justify-between">
              <span>{lab.text.length} chars</span>
              <span>{lab.text.length > 30 ? 'Ready' : 'Incomplete'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2">
          {labs.length < 3 && (
            <button
              type="button"
              onClick={handleAddLab}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#E6DFD5] text-[#2C2B29] hover:bg-[#FAF7F2] rounded-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add 3rd Target Lab</span>
            </button>
          )}
          <span className="text-[11px] font-mono text-[#6B665E]">
            Comparing {labs.length} Laboratories for {applicationType}
          </span>
        </div>

        <button
          type="button"
          onClick={handleRank}
          disabled={isRanking}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-[#1F5F4A] hover:bg-[#174838] text-white text-xs font-bold rounded-sm shadow-xs cursor-pointer disabled:opacity-50 transition"
        >
          {isRanking ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span>{statusMessage || 'Ranking Laboratories...'}</span>
            </>
          ) : (
            <>
              <Scale className="w-3.5 h-3.5" />
              <span>Rank Labs by Fit</span>
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className="p-2.5 bg-[#FBF5E8] border border-[#E5DFD5] text-[#9E782F] text-xs font-semibold rounded-sm flex items-center space-x-2 animate-in fade-in">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C49B45]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FDF2F2] border border-[#F5C2C2] text-red-900 text-xs rounded-sm">
          {error}
        </div>
      )}

      {/* Ranking Results Display */}
      {rankingResult && (
        <div className="space-y-6 pt-4 animate-in fade-in">
          {/* Executive Strategy Advice */}
          <div className="p-4 bg-[#FBF5E8] border border-[#E5DFD5] rounded-sm text-xs leading-relaxed">
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C49B45]" />
              <span className="font-serif font-bold text-sm text-[#141413]">
                Strategic Recommendation
              </span>
            </div>
            <p className="text-[#2C2B29]">{rankingResult.summaryAdvice}</p>
          </div>

          {/* Ranked Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {rankingResult.rankedLabs.map((ranked) => {
              const matchedInput = labs.find((l) => l.id === ranked.labId);
              return (
                <div
                  key={ranked.labId}
                  className={`editorial-card p-5 rounded-sm relative flex flex-col justify-between ${
                    ranked.rank === 1 ? 'border-[#1F5F4A] ring-1 ring-[#1F5F4A]/30' : ''
                  }`}
                >
                  <div>
                    {/* Rank Badge & Verdict Stamp */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5] mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`w-6 h-6 rounded-sm text-xs font-serif font-bold flex items-center justify-center ${
                          ranked.rank === 1 ? 'bg-[#1F5F4A] text-white' : 'bg-[#E6DFD5] text-[#141413]'
                        }`}>
                          #{ranked.rank}
                        </span>
                        <span className="text-[11px] font-mono uppercase font-bold text-[#6B665E]">
                          Rank {ranked.rank}
                        </span>
                      </div>

                      {/* Passport Stamp */}
                      <span className={`passport-stamp text-[10px] ${
                        ranked.rank === 1 ? '' : 'passport-stamp-gold'
                      }`}>
                        {ranked.fitScore.toFixed(1)} / 10
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-sm text-[#141413] leading-snug">
                      {ranked.title}
                    </h3>
                    <div className="mt-1">
                      <span className="inline-block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#1F5F4A] bg-[#EBF3EF] px-1.5 py-0.5 rounded-2xs">
                        {ranked.recommendationVerdict}
                      </span>
                    </div>

                    <p className="text-xs text-[#2C2B29] mt-3 leading-relaxed">
                      {ranked.shortReason}
                    </p>

                    {/* Synergies */}
                    <div className="mt-4 pt-3 border-t border-[#E6DFD5]">
                      <div className="text-[10px] font-mono uppercase text-[#1F5F4A] font-bold mb-1.5 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-[#1F5F4A]" />
                        <span>Key Overlaps</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ranked.topSynergies.map((syn, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] bg-[#FAF7F2] border border-[#E6DFD5] px-1.5 py-0.5 text-[#2C2B29] rounded-2xs"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Gaps */}
                    <div className="mt-3">
                      <div className="text-[10px] font-mono uppercase text-[#C49B45] font-bold mb-1.5 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-[#C49B45]" />
                        <span>Missing Focus</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ranked.keyMissingAreas.map((gap, gIdx) => (
                          <span
                            key={gIdx}
                            className="text-[10px] bg-[#FAF7F2] border border-[#E6DFD5] px-1.5 py-0.5 text-[#6B665E] rounded-2xs"
                          >
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Apply with This Lab Button */}
                  <div className="mt-5 pt-3 border-t border-[#E6DFD5]">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectLabForApplication(
                          matchedInput?.text || '',
                          matchedInput?.label || ranked.title
                        )
                      }
                      className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#FAF7F2] hover:bg-[#1F5F4A] text-[#1F5F4A] hover:text-white border border-[#E6DFD5] hover:border-[#1F5F4A] rounded-sm text-xs font-bold transition cursor-pointer"
                    >
                      <span>Draft Full Application</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
