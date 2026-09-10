import type { AnalysisInputSignals } from "./types";

export interface FeedbackItem {
  category: "ATS" | "Formatting" | "Keywords" | "Projects" | "Certifications" | "Summary";
  severity: "critical" | "improve" | "good";
  message: string;
}

/**
 * Rule-based, evidence-only resume feedback. Every message is derived from a
 * measurable signal in the parsed resume — nothing is invented.
 */
export function generateFeedback(s: AnalysisInputSignals): FeedbackItem[] {
  const items: FeedbackItem[] = [];
  const add = (
    category: FeedbackItem["category"],
    severity: FeedbackItem["severity"],
    message: string,
  ) => items.push({ category, severity, message });

  // ATS
  if (!s.contact.email) add("ATS", "critical", "No email address was detected — ATS systems often reject resumes without a parsable contact email.");
  else add("ATS", "good", "A contact email was detected and parsed correctly.");
  if (!s.contact.phone) add("ATS", "improve", "No phone number was detected. Add one in plain digits, e.g. +91 98765 43210.");
  if (!s.contact.links) add("ATS", "improve", "No GitHub or LinkedIn link was found. Recruiters look for at least one verifiable profile link.");
  else add("ATS", "good", "A profile or portfolio link was detected.");
  if (!s.hasSkillsSection) add("ATS", "critical", 'No dedicated "Skills" section heading was detected — add one so parsers can index your technologies.');
  if (s.wordCount < 220) add("ATS", "critical", `The resume contains only ${s.wordCount} words. Most ATS-friendly resumes contain 350–800 words.`);
  else if (s.wordCount > 1100) add("ATS", "improve", `The resume contains ${s.wordCount} words, which is long. Trim to 1–2 pages of high-signal content.`);
  else add("ATS", "good", `Length looks healthy at ${s.wordCount} words.`);

  // Formatting
  if (s.bulletCount < 5) add("Formatting", "improve", `Only ${s.bulletCount} bullet points were detected. Use bullets for achievements instead of paragraphs.`);
  else add("Formatting", "good", `${s.bulletCount} bullet points detected — good scannable structure.`);
  if (s.avgLineLength > 140) add("Formatting", "improve", "Several lines are very long, which suggests dense paragraphs. Split them into short bullets.");
  if (s.detectedSections.length < 4)
    add(
      "Formatting",
      "improve",
      `Only ${s.detectedSections.length} standard sections were detected (${s.detectedSections.join(", ") || "none"}). Include Summary, Skills, Projects, Experience and Education.`,
    );
  else add("Formatting", "good", `Standard sections detected: ${s.detectedSections.join(", ")}.`);

  // Keywords
  if (s.missingSkills.length > 0)
    add(
      "Keywords",
      "improve",
      `Add evidence for these role keywords if you genuinely have them: ${s.missingSkills.slice(0, 8).join(", ")}.`,
    );
  if (s.weakSkills.length > 0)
    add(
      "Keywords",
      "improve",
      `These skills appear only once, so they read as weak: ${s.weakSkills.slice(0, 8).join(", ")}. Reinforce them inside project or experience bullets.`,
    );
  if (s.quantifiedBullets === 0)
    add("Keywords", "critical", "No measurable outcomes were detected. Add numbers such as accuracy, latency, users or cost saved.");
  else add("Keywords", "good", `${s.quantifiedBullets} bullet points already contain measurable numbers.`);

  // Projects
  if (s.projectCount === 0) add("Projects", "critical", "No projects section was detected. Add 2–3 projects with the problem, your approach, the stack and the result.");
  else if (s.projectCount < 3) add("Projects", "improve", `${s.projectCount} project(s) detected. Aim for 3 well-documented projects for the target role.`);
  else add("Projects", "good", `${s.projectCount} projects detected.`);
  if (s.projectsWithoutTech > 0)
    add("Projects", "improve", `${s.projectsWithoutTech} project(s) list no recognisable technologies. Name the stack explicitly in each project.`);

  // Certifications
  if (s.certificationCount === 0)
    add("Certifications", "improve", "No certifications section was detected. One role-relevant certification adds credibility for early-career profiles.");
  else add("Certifications", "good", `${s.certificationCount} certification entries detected.`);

  // Summary
  if (!s.hasSummarySection)
    add("Summary", "improve", "No summary or objective section was detected. Add 2–3 lines naming your target role and strongest skills.");
  else if (s.summaryWordCount < 15)
    add("Summary", "improve", `The summary is only ${s.summaryWordCount} words. Expand it to 30–60 words with role, skills and one achievement.`);
  else add("Summary", "good", `Summary detected (${s.summaryWordCount} words).`);
  if (!s.summaryMentionsTargetRole)
    add("Summary", "improve", `Your summary does not mention "${s.targetRole}". Aligning the headline with the target role improves keyword match.`);

  return items;
}

export function atsScore(items: FeedbackItem[]): number {
  const critical = items.filter((i) => i.severity === "critical").length;
  const improve = items.filter((i) => i.severity === "improve").length;
  const good = items.filter((i) => i.severity === "good").length;
  const raw = 100 - critical * 12 - improve * 5 + good * 2;
  return Math.max(15, Math.min(99, Math.round(raw)));
}
