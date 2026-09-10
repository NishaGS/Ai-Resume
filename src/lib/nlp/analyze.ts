import {
  extractCandidateName,
  extractCertifications,
  extractEducation,
  extractExperience,
  extractProjects,
  extractSkills,
  extractSummary,
  estimateYearsOfExperience,
  hasContactBlock,
  splitSections,
} from "./extract";
import { atsScore, generateFeedback } from "./feedback";
import { JOB_ROLES } from "./jobRoles";
import { generateRoadmap, prioritiseSkills } from "./roadmap";
import { SKILL_CATEGORIES } from "./skillDictionary";
import { cleanText, normaliseLines } from "./textCleaner";
import { cosineSimilarity, fitTfidf, jaccard, transformTfidf } from "./tfidf";
import { DISCLAIMER, type AnalysisResult, type CategoryBreakdown, type RoleMatch } from "./types";

function roleDocument(roleIndex: number): string {
  const r = JOB_ROLES[roleIndex]!;
  return [
    r.role,
    r.role,
    r.category,
    r.requiredSkills.join(" "),
    r.requiredSkills.join(" "),
    r.optionalSkills.join(" "),
    r.keywords.join(" "),
    r.description,
  ].join(" ");
}

const roleDocs = JOB_ROLES.map((_, i) => roleDocument(i));
const { model: TFIDF_MODEL, vectors: ROLE_VECTORS } = fitTfidf(roleDocs);

function reasonFor(match: {
  role: string;
  matchedSkills: string[];
  missingSkills: string[];
  skillCoverage: number;
  cosineSimilarity: number;
}): string {
  const matched = match.matchedSkills.slice(0, 4).join(", ");
  const coverage = Math.round(match.skillCoverage * 100);
  const sim = Math.round(match.cosineSimilarity * 100);
  const base = matched
    ? `Your resume evidences ${matched}, covering ${coverage}% of the core skills for ${match.role}.`
    : `Your resume shows little direct evidence of the core ${match.role} skills (${coverage}% coverage).`;
  const gap =
    match.missingSkills.length > 0
      ? ` Closing ${match.missingSkills.slice(0, 3).join(", ")} would raise this match.`
      : " No core skill gap was detected for this role.";
  return `${base} Textual similarity with the role profile is ${sim}%.${gap}`;
}

export function analyseResumeText(rawText: string, fileName: string): AnalysisResult {
  const cleaned = cleanText(rawText);
  const lines = normaliseLines(rawText);
  const sections = splitSections(rawText);

  const skills = extractSkills(rawText);
  const foundSkills = skills.map((s) => s.name);
  const foundSet = new Set(foundSkills.map((s) => s.toLowerCase()));
  const weakSkills = skills.filter((s) => s.strength === "weak").map((s) => s.name);

  const resumeVector = transformTfidf(cleaned, TFIDF_MODEL);

  const matches: RoleMatch[] = JOB_ROLES.map((role, i) => {
    const cos = cosineSimilarity(resumeVector, ROLE_VECTORS[i]!);
    const allRoleSkills = [...role.requiredSkills, ...role.optionalSkills];
    const matchedRequired = role.requiredSkills.filter((s) => foundSet.has(s.toLowerCase()));
    const matchedOptional = role.optionalSkills.filter((s) => foundSet.has(s.toLowerCase()));
    const missing = role.requiredSkills.filter((s) => !foundSet.has(s.toLowerCase()));
    const coverage =
      role.requiredSkills.length === 0
        ? 0
        : (matchedRequired.length + 0.35 * matchedOptional.length) /
          (role.requiredSkills.length + 0.35 * role.optionalSkills.length);
    const semantic = jaccard(foundSkills, allRoleSkills);

    // Hybrid score: skill coverage (lexical evidence) + TF-IDF cosine + set semantics
    const score = Math.round(
      Math.max(0, Math.min(100, (0.55 * coverage + 0.3 * Math.min(1, cos * 1.9) + 0.15 * semantic) * 100)),
    );
    const spread = Math.abs(coverage - Math.min(1, cos * 1.9));
    const confidence = Math.round(Math.max(35, Math.min(98, 100 - spread * 55 - (missing.length > 3 ? 10 : 0))));

    const partial = {
      role: role.role,
      matchedSkills: [...matchedRequired, ...matchedOptional],
      missingSkills: missing,
      skillCoverage: coverage,
      cosineSimilarity: cos,
    };

    return {
      role: role.role,
      category: role.category,
      score,
      cosineSimilarity: Number(cos.toFixed(4)),
      skillCoverage: Number(coverage.toFixed(4)),
      semanticScore: Number(semantic.toFixed(4)),
      confidence,
      matchedSkills: partial.matchedSkills,
      missingSkills: missing,
      description: role.description,
      careerPath: role.careerPath,
      salaryRange: role.salaryRange,
      reason: reasonFor(partial),
    };
  }).sort((a, b) => b.score - a.score);

  const top = matches.slice(0, 3);
  const target = top[0]!;

  const skillsByCategory: CategoryBreakdown[] = SKILL_CATEGORIES.map((category) => {
    const inCat = skills.filter((s) => s.category === category);
    return {
      category,
      found: inCat.length,
      strong: inCat.filter((s) => s.strength === "strong").length,
      skills: inCat.map((s) => s.name),
    };
  }).filter((c) => c.found > 0);

  const projects = extractProjects(rawText);
  const certifications = extractCertifications(rawText);
  const contact = hasContactBlock(rawText);
  const bulletLines = lines.filter((l) => /^[-•*·>»]/.test(l) || /^\d+[.)]\s/.test(l));
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  const summary = extractSummary(rawText);

  const detectedSections = (Object.keys(sections) as Array<keyof typeof sections>).filter(
    (k) => sections[k].length > 0,
  );

  const feedback = generateFeedback({
    wordCount,
    bulletCount: bulletLines.length,
    avgLineLength: lines.length ? lines.reduce((a, l) => a + l.length, 0) / lines.length : 0,
    detectedSections,
    hasSkillsSection: sections.skills.length > 0,
    hasSummarySection: sections.summary.length > 0,
    summaryWordCount: summary.split(/\s+/).filter(Boolean).length,
    summaryMentionsTargetRole: cleanText(summary).includes(target.role.toLowerCase()),
    quantifiedBullets: bulletLines.filter((l) => /\d+(\.\d+)?\s?(%|x|k|m|users|ms|hours|days)?/i.test(l) && /\d/.test(l))
      .length,
    projectCount: projects.length,
    projectsWithoutTech: projects.filter((p) => p.technologies.length === 0).length,
    certificationCount: certifications.length,
    missingSkills: target.missingSkills,
    weakSkills,
    targetRole: target.role,
    contact,
  });

  const missingSkills = [
    ...new Set(top.flatMap((m) => m.missingSkills)),
  ];

  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    fileName,
    analysedAt: new Date().toISOString(),
    candidateName: extractCandidateName(rawText),
    summary,
    wordCount,
    yearsOfExperience: estimateYearsOfExperience(rawText),
    skills,
    skillsByCategory,
    education: extractEducation(rawText),
    projects,
    experience: extractExperience(rawText),
    certifications,
    matches,
    topRecommendations: top,
    overallScore: target.score,
    atsScore: atsScore(feedback),
    missingSkills,
    weakSkills,
    foundSkills,
    roadmap: generateRoadmap(target.role, prioritiseSkills(target.missingSkills, weakSkills)),
    feedback,
    disclaimer: DISCLAIMER,
  };
}
