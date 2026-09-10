import type { AnalysisResult } from "./nlp/types";

const KEY = "ara.history.v1";
const MAX = 20;

export interface HistoryEntry {
  id: string;
  fileName: string;
  analysedAt: string;
  candidateName: string;
  topRole: string;
  score: number;
  atsScore: number;
  skillCount: number;
  missingCount: number;
}

/**
 * Upload history keeps only aggregate metrics in the browser.
 * The resume file and its extracted text are never persisted.
 */
export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendHistory(result: AnalysisResult): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: result.id,
    fileName: result.fileName,
    analysedAt: result.analysedAt,
    candidateName: result.candidateName,
    topRole: result.topRecommendations[0]?.role ?? "—",
    score: result.overallScore,
    atsScore: result.atsScore,
    skillCount: result.skills.length,
    missingCount: result.missingSkills.length,
  };
  const next = [entry, ...readHistory().filter((h) => h.id !== entry.id)].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — history is optional */
  }
  return next;
}

export function clearHistory(): HistoryEntry[] {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return [];
}
