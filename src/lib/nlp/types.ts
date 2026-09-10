import type { ExtractedSkill, EducationEntry, ProjectEntry, ExperienceEntry } from "./extract";
import type { FeedbackItem } from "./feedback";
import type { RoadmapWeek } from "./roadmap";
import type { SkillCategory } from "./skillDictionary";

export interface RoleMatch {
  role: string;
  category: string;
  score: number;
  cosineSimilarity: number;
  skillCoverage: number;
  semanticScore: number;
  confidence: number;
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
  careerPath: string;
  salaryRange: string;
  reason: string;
}

export interface CategoryBreakdown {
  category: SkillCategory;
  found: number;
  strong: number;
  skills: string[];
}

export interface AnalysisInputSignals {
  wordCount: number;
  bulletCount: number;
  avgLineLength: number;
  detectedSections: string[];
  hasSkillsSection: boolean;
  hasSummarySection: boolean;
  summaryWordCount: number;
  summaryMentionsTargetRole: boolean;
  quantifiedBullets: number;
  projectCount: number;
  projectsWithoutTech: number;
  certificationCount: number;
  missingSkills: string[];
  weakSkills: string[];
  targetRole: string;
  contact: { email: boolean; phone: boolean; links: boolean };
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  analysedAt: string;
  candidateName: string;
  summary: string;
  wordCount: number;
  yearsOfExperience: number;
  skills: ExtractedSkill[];
  skillsByCategory: CategoryBreakdown[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications: string[];
  matches: RoleMatch[];
  topRecommendations: RoleMatch[];
  overallScore: number;
  atsScore: number;
  missingSkills: string[];
  weakSkills: string[];
  foundSkills: string[];
  roadmap: RoadmapWeek[];
  feedback: FeedbackItem[];
  disclaimer: string;
}

export const DISCLAIMER =
  "This score is an estimate for educational purposes only and is not a hiring decision.";
