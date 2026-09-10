import { SKILL_DICTIONARY, type SkillCategory, type SkillDef } from "./skillDictionary";
import { cleanText, normaliseLines } from "./textCleaner";

export interface ExtractedSkill {
  name: string;
  category: SkillCategory;
  occurrences: number;
  strength: "strong" | "moderate" | "weak";
}

const SECTION_HEADINGS = {
  education: ["education", "academic", "qualification", "academics", "educational background"],
  projects: ["project", "projects", "academic projects", "personal projects", "key projects"],
  experience: ["experience", "work experience", "employment", "internship", "internships", "professional experience"],
  skills: ["skills", "technical skills", "core competencies", "technologies"],
  summary: ["summary", "objective", "profile", "about me", "career objective"],
  certifications: ["certification", "certifications", "courses", "licenses"],
} as const;

type SectionKey = keyof typeof SECTION_HEADINGS;

function isHeading(line: string, keys: readonly string[]): boolean {
  const l = line.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  if (l.length === 0 || l.length > 45) return false;
  return keys.some((k) => l === k || l.startsWith(`${k} `) || l.endsWith(` ${k}`) || l === `${k}s`);
}

const ALL_HEADINGS: string[] = Object.values(SECTION_HEADINGS).flatMap((v) => [...v]);

/** Splits a resume into logical sections using heading detection. */
export function splitSections(raw: string): Record<SectionKey, string[]> {
  const lines = normaliseLines(raw);
  const sections: Record<SectionKey, string[]> = {
    education: [],
    projects: [],
    experience: [],
    skills: [],
    summary: [],
    certifications: [],
  };
  let current: SectionKey | null = null;
  for (const line of lines) {
    let matched: SectionKey | null = null;
    for (const key of Object.keys(SECTION_HEADINGS) as SectionKey[]) {
      if (isHeading(line, SECTION_HEADINGS[key])) {
        matched = key;
        break;
      }
    }
    if (matched) {
      current = matched;
      continue;
    }
    if (current && isHeading(line, ALL_HEADINGS)) {
      current = null;
      continue;
    }
    if (current) sections[current].push(line);
  }
  return sections;
}

function matchCount(haystack: string, def: SkillDef): number {
  let count = 0;
  for (const alias of def.aliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const boundaryStart = /^[a-z0-9]/.test(alias) ? "(?<![a-z0-9+#.])" : "(?<![a-z0-9])";
    const boundaryEnd = /[a-z0-9]$/.test(alias) ? "(?![a-z0-9+#])" : "";
    try {
      const re = new RegExp(`${boundaryStart}${escaped}${boundaryEnd}`, "g");
      count += (haystack.match(re) ?? []).length;
    } catch {
      count += haystack.split(alias).length - 1;
    }
  }
  return count;
}

export function extractSkills(raw: string): ExtractedSkill[] {
  const text = cleanText(raw);
  const found: ExtractedSkill[] = [];
  for (const def of SKILL_DICTIONARY) {
    const occurrences = matchCount(text, def);
    if (occurrences === 0) continue;
    const strength = occurrences >= 3 ? "strong" : occurrences === 2 ? "moderate" : "weak";
    found.push({ name: def.name, category: def.category, occurrences, strength });
  }
  return found.sort((a, b) => b.occurrences - a.occurrences || a.name.localeCompare(b.name));
}

const DEGREE_RE =
  /(b\.?tech|m\.?tech|b\.?e\b|m\.?e\b|b\.?sc|m\.?sc|bca|mca|bba|mba|b\.?com|m\.?com|ph\.?d|diploma|bachelor|master|intermediate|higher secondary|12th|10th|hsc|ssc)/i;

export interface EducationEntry {
  text: string;
  degree: string | null;
  year: string | null;
}

export function extractEducation(raw: string): EducationEntry[] {
  const sections = splitSections(raw);
  const candidates = sections.education.length > 0 ? sections.education : normaliseLines(raw);
  const entries: EducationEntry[] = [];
  const seen = new Set<string>();
  for (const line of candidates) {
    if (line.length < 6 || line.length > 220) continue;
    const hasDegree = DEGREE_RE.test(line);
    const hasInstitute = /(university|college|institute|school|academy)/i.test(line);
    if (!hasDegree && !hasInstitute) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const degreeMatch = line.match(DEGREE_RE);
    const yearMatch = line.match(/(19|20)\d{2}/);
    entries.push({
      text: line,
      degree: degreeMatch ? degreeMatch[0] : null,
      year: yearMatch ? yearMatch[0] : null,
    });
    if (entries.length >= 8) break;
  }
  return entries;
}

export interface ProjectEntry {
  title: string;
  detail: string;
  technologies: string[];
}

export function extractProjects(raw: string): ProjectEntry[] {
  const sections = splitSections(raw);
  const lines = sections.projects;
  const projects: ProjectEntry[] = [];
  let current: ProjectEntry | null = null;
  const skillNames = SKILL_DICTIONARY;
  const pushCurrent = () => {
    if (current && current.title.length > 2) projects.push(current);
  };
  for (const line of lines) {
    const isBullet = /^[-•*·>»]/.test(line) || /^\d+[.)]\s/.test(line) === false === false;
    const bullet = /^[-•*·>»]\s?/.test(line);
    if (!bullet && (line.length < 95 || /[:|–—-]/.test(line.slice(0, 60)))) {
      pushCurrent();
      const title = line.replace(/^\d+[.)]\s*/, "").split(/[|–—]/)[0] ?? line;
      current = { title: title.trim().slice(0, 120), detail: "", technologies: [] };
      const rest = line.slice(title.length).replace(/^[|–—:\s]+/, "");
      if (rest) current.detail = rest;
    } else if (current) {
      current.detail = `${current.detail} ${line.replace(/^[-•*·>»]\s?/, "")}`.trim();
    } else {
      current = { title: line.slice(0, 120), detail: "", technologies: [] };
    }
    void isBullet;
  }
  pushCurrent();
  for (const p of projects) {
    const blob = cleanText(`${p.title} ${p.detail}`);
    p.technologies = skillNames.filter((s) => matchCount(blob, s) > 0).map((s) => s.name).slice(0, 10);
    p.detail = p.detail.slice(0, 400);
  }
  return projects.slice(0, 8);
}

export interface ExperienceEntry {
  text: string;
  duration: string | null;
}

export function extractExperience(raw: string): ExperienceEntry[] {
  const sections = splitSections(raw);
  const entries: ExperienceEntry[] = [];
  for (const line of sections.experience) {
    if (line.length < 5) continue;
    const duration = line.match(
      /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s?\d{4}\s?[-–to]+\s?((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s?\d{4}|present|current))|((19|20)\d{2}\s?[-–]\s?((19|20)\d{2}|present))/i,
    );
    entries.push({ text: line.slice(0, 240), duration: duration ? duration[0] : null });
    if (entries.length >= 12) break;
  }
  return entries;
}

/** Estimated total years of professional experience from date ranges. */
export function estimateYearsOfExperience(raw: string): number {
  const years = [...raw.matchAll(/(19|20)\d{2}/g)].map((m) => Number(m[0])).filter((y) => y >= 1990 && y <= 2100);
  const experienceHints = /(\d+(\.\d+)?)\+?\s*(years?|yrs?)\s*(of)?\s*(experience|exp)/i.exec(raw);
  if (experienceHints?.[1]) return Math.min(40, Number(experienceHints[1]));
  if (years.length < 2) return 0;
  const min = Math.min(...years);
  const max = Math.max(...years);
  return Math.max(0, Math.min(40, max - min));
}

/**
 * Extracts a candidate display name from the resume header.
 * Responsible AI: only the name is taken — no gender, age, photo, marital or
 * nationality signals are read or stored anywhere in this pipeline.
 */
export function extractCandidateName(raw: string): string {
  const lines = normaliseLines(raw).slice(0, 8);
  for (const line of lines) {
    const stripped = line.replace(/[^A-Za-z .'-]/g, "").trim();
    if (stripped.length < 4 || stripped.length > 45) continue;
    if (/(resume|curriculum vitae|cv|profile|portfolio)/i.test(stripped)) continue;
    const words = stripped.split(/\s+/);
    if (words.length < 2 || words.length > 4) continue;
    if (words.every((w) => /^[A-Za-z][A-Za-z.'-]*$/.test(w))) return words.join(" ");
  }
  return "Candidate";
}

export function extractSummary(raw: string): string {
  const sections = splitSections(raw);
  const summary = sections.summary.join(" ").trim();
  if (summary.length > 40) return summary.slice(0, 600);
  const lines = normaliseLines(raw);
  const body = lines.slice(1, 12).filter((l) => l.split(" ").length > 6);
  return body.join(" ").slice(0, 400) || "No written summary section was detected in this resume.";
}

export function extractCertifications(raw: string): string[] {
  const sections = splitSections(raw);
  return sections.certifications
    .map((l) => l.replace(/^[-•*·>»]\s?/, "").trim())
    .filter((l) => l.length > 3)
    .slice(0, 10);
}

export function hasContactBlock(raw: string): { email: boolean; phone: boolean; links: boolean } {
  return {
    email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(raw),
    phone: /(\+?\d[\d\s().-]{7,}\d)/.test(raw),
    links: /(linkedin\.com|github\.com|https?:\/\/)/i.test(raw),
  };
}
