export type ApplicationType = 'Research Internship' | 'MS' | 'PhD';
export type ToneType = 'Formal' | 'Friendly-Professional';

export interface FitAnalysis {
  score: number;
  oneLineReason: string;
  matchingSkills: string[];
  missingSkills: string[];
}

export interface ColdEmail {
  subject: string;
  body: string;
  wordCount: number;
  professorDetailReferenced: string;
  studentSkillsConnected: string[];
}

export interface SOPSection {
  title: string;
  bullets: string[];
}

export interface SOPOutline {
  sections: SOPSection[];
}

export interface SkillGap {
  skill: string;
  practicalAction: string;
}

export interface InterviewQuestion {
  question: string;
  tip: string;
}

export interface ResearchPackage {
  fitAnalysis: FitAnalysis;
  coldEmail: ColdEmail;
  sopOutline: SOPOutline;
  skillGaps: SkillGap[];
  interviewQuestions: InterviewQuestion[];
  actionChecklist: string[];
}

// 1. CV Overview & Profile
export interface CVProfile {
  name: string;
  education: {
    degree: string;
    institution: string;
    graduationYear?: string;
    gpaOrHonors?: string;
  };
  topSkills: {
    category: string;
    skills: string[];
  }[];
  keyProjects: {
    title: string;
    description: string;
  }[];
  cvStrengthScore: number; // out of 10
  improvementTips: string[]; // exactly 3 actionable tips
  rawText: string;
}

// 2. Lab Ranker
export interface LabTargetInput {
  id: string;
  label: string;
  text: string;
}

export interface RankedLabResult {
  labId: string;
  rank: number;
  title: string;
  fitScore: number;
  shortReason: string;
  topSynergies: string[];
  keyMissingAreas: string[];
  recommendationVerdict: string;
}

export interface LabRankerResponse {
  rankedLabs: RankedLabResult[];
  summaryAdvice: string;
}

// 3. Application Tracker
export type ApplicationStatus = 'To Email' | 'Sent' | 'Replied';

export interface TrackedApplication {
  id: string;
  labName: string;
  professorName: string;
  institution: string;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  fitScore: number;
  dateAdded: string;
  dateSent?: string;
  dateReplied?: string;
  coldEmailSubject: string;
  coldEmailBody: string;
  researchPackage?: ResearchPackage;
  followUpEmail?: {
    subject: string;
    body: string;
  };
  notes?: string;
}

// 4. Follow-up Email
export interface FollowUpEmailResponse {
  subject: string;
  body: string;
  daysRecommendation: string;
  strategyNote: string;
}
