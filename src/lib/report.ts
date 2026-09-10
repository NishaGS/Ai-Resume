import { jsPDF } from "jspdf";
import type { AnalysisResult } from "./nlp/types";

const BRAND = { r: 88, g: 80, b: 236 };
const BRAND2 = { r: 140, g: 92, b: 232 };
const INK = { r: 30, g: 32, b: 54 };
const MUTED = { r: 110, g: 116, b: 140 };

interface Cursor {
  y: number;
  page: number;
}

/** Generates the downloadable professional analysis report as a multi-page PDF. */
export function generateReport(result: AnalysisResult): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 44;
  const cur: Cursor = { y: 0, page: 1 };

  const ensure = (needed: number) => {
    if (cur.y + needed > H - 60) {
      footer();
      doc.addPage();
      cur.page += 1;
      cur.y = M;
    }
  };

  const footer = () => {
    doc.setFontSize(8);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(result.disclaimer, M, H - 34, { maxWidth: W - M * 2 });
    doc.text(`Page ${cur.page}`, W - M, H - 20, { align: "right" });
    doc.text("AI Resume Analyzer — generated report", M, H - 20);
  };

  const heading = (text: string) => {
    ensure(40);
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.rect(M, cur.y, 4, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(text, M + 12, cur.y + 12);
    cur.y += 26;
  };

  const body = (text: string, size = 10) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(INK.r, INK.g, INK.b);
    const lines = doc.splitTextToSize(text, W - M * 2);
    for (const line of lines) {
      ensure(14);
      doc.text(line, M, cur.y);
      cur.y += 13;
    }
  };

  const bullet = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, W - M * 2 - 14);
    lines.forEach((line: string, i: number) => {
      ensure(14);
      if (i === 0) {
        doc.setFillColor(BRAND2.r, BRAND2.g, BRAND2.b);
        doc.circle(M + 3, cur.y - 3, 2, "F");
      }
      doc.setTextColor(INK.r, INK.g, INK.b);
      doc.text(line, M + 14, cur.y);
      cur.y += 13;
    });
  };

  const gap = (v = 8) => {
    cur.y += v;
  };

  // ---------- Cover ----------
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, W, 150, "F");
  doc.setFillColor(BRAND2.r, BRAND2.g, BRAND2.b);
  doc.triangle(W * 0.55, 0, W, 0, W, 150, "F");

  // Company logo placeholder
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.roundedRect(M, 26, 92, 32, 6, 6, "S");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("COMPANY LOGO", M + 46, 46, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Resume Analysis Report", M, 96);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`AI Resume Analyzer & Job Recommendation System`, M, 116);
  doc.text(new Date(result.analysedAt).toLocaleString(), M, 132);

  cur.y = 186;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.text(result.candidateName, M, cur.y);
  cur.y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(
    `Source file: ${result.fileName}  ·  ${result.wordCount} words  ·  ${result.skills.length} skills detected`,
    M,
    cur.y,
  );
  cur.y += 26;

  // Score cards
  const cards = [
    { label: "Best Role Match", value: `${result.overallScore}%` },
    { label: "ATS Readiness", value: `${result.atsScore}%` },
    { label: "Skills Detected", value: `${result.skills.length}` },
    { label: "Est. Experience", value: `${result.yearsOfExperience} yr` },
  ];
  const cw = (W - M * 2 - 24) / 4;
  cards.forEach((c, i) => {
    const x = M + i * (cw + 8);
    doc.setFillColor(244, 244, 255);
    doc.roundedRect(x, cur.y, cw, 56, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text(c.value, x + cw / 2, cur.y + 28, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(c.label, x + cw / 2, cur.y + 44, { align: "center" });
  });
  cur.y += 78;

  // ---------- Summary ----------
  heading("Resume Summary");
  body(result.summary);
  gap();

  // ---------- Skills ----------
  heading("Extracted Skills by Category");
  for (const cat of result.skillsByCategory) {
    bullet(`${cat.category} (${cat.found}): ${cat.skills.join(", ")}`);
  }
  if (result.skillsByCategory.length === 0) body("No recognised technical skills were detected.");
  gap();

  // ---------- Education ----------
  heading("Education");
  if (result.education.length === 0) body("No education section was detected.");
  for (const e of result.education) bullet(`${e.text}${e.year ? ` (${e.year})` : ""}`);
  gap();

  // ---------- Projects ----------
  heading("Projects");
  if (result.projects.length === 0) body("No projects section was detected.");
  for (const p of result.projects) {
    bullet(`${p.title}${p.technologies.length ? ` — Tech: ${p.technologies.join(", ")}` : ""}`);
    if (p.detail) body(`   ${p.detail}`, 9);
  }
  gap();

  // ---------- Experience ----------
  heading("Experience");
  if (result.experience.length === 0) body("No experience section was detected.");
  for (const x of result.experience) bullet(`${x.text}${x.duration ? ` (${x.duration})` : ""}`);
  gap();

  // ---------- Chart: role match scores ----------
  doc.addPage();
  cur.page += 1;
  cur.y = M;
  heading("Role Match Scores");
  const chartRoles = result.matches.slice(0, 10);
  const barW = W - M * 2 - 150;
  for (const m of chartRoles) {
    ensure(22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(m.role, M, cur.y + 9, { maxWidth: 140 });
    doc.setFillColor(232, 232, 246);
    doc.roundedRect(M + 148, cur.y, barW, 11, 5, 5, "F");
    const filled = Math.max(6, (barW * m.score) / 100);
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.roundedRect(M + 148, cur.y, filled, 11, 5, 5, "F");
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(`${m.score}%`, W - M, cur.y + 9, { align: "right" });
    cur.y += 20;
  }
  gap();

  // ---------- Top recommendations ----------
  heading("Top 3 Recommended Roles");
  result.topRecommendations.forEach((m, i) => {
    ensure(90);
    doc.setFillColor(249, 249, 255);
    doc.roundedRect(M, cur.y, W - M * 2, 8, 6, 6, "F");
    cur.y += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text(`${i + 1}. ${m.role} — ${m.score}% match (confidence ${m.confidence}%)`, M, cur.y);
    cur.y += 15;
    body(m.description, 9.5);
    body(`Why: ${m.reason}`, 9.5);
    body(`Career path: ${m.careerPath}`, 9.5);
    body(`Typical salary range: ${m.salaryRange}`, 9.5);
    body(`Cosine similarity: ${(m.cosineSimilarity * 100).toFixed(1)}%  ·  Skill coverage: ${(m.skillCoverage * 100).toFixed(1)}%`, 9);
    gap(6);
  });

  // ---------- Skill gap ----------
  heading("Skill Gap Analysis");
  body(`Skills found (${result.foundSkills.length}): ${result.foundSkills.join(", ") || "none"}`);
  gap(4);
  body(`Weak skills (mentioned once) (${result.weakSkills.length}): ${result.weakSkills.join(", ") || "none"}`);
  gap(4);
  body(`Missing skills for the top roles (${result.missingSkills.length}): ${result.missingSkills.join(", ") || "none"}`);
  gap();

  // ---------- Roadmap ----------
  doc.addPage();
  cur.page += 1;
  cur.y = M;
  heading(`4-Week Learning Roadmap — target: ${result.topRecommendations[0]?.role ?? "your top role"}`);
  for (const w of result.roadmap) {
    ensure(110);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND2.r, BRAND2.g, BRAND2.b);
    doc.text(`Week ${w.week} — ${w.focus}`, M, cur.y);
    cur.y += 15;
    body(`Topics: ${w.topics.join(", ")}`, 9.5);
    body(`Courses: ${w.courses.join(" | ")}`, 9.5);
    body(`Practice: ${w.practiceProjects.join(" | ")}`, 9.5);
    body(`Mini project: ${w.miniProject}`, 9.5);
    if (w.certifications.length) body(`Certifications: ${w.certifications.join(", ")}`, 9.5);
    gap(8);
  }

  // ---------- Feedback ----------
  heading("Resume Feedback");
  const groups = ["ATS", "Formatting", "Keywords", "Projects", "Certifications", "Summary"] as const;
  for (const g of groups) {
    const items = result.feedback.filter((f) => f.category === g);
    if (items.length === 0) continue;
    ensure(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(g, M, cur.y);
    cur.y += 14;
    for (const item of items) bullet(`[${item.severity.toUpperCase()}] ${item.message}`);
    gap(4);
  }

  gap(10);
  heading("Responsible AI Notice");
  body(
    "This analysis evaluates only skills, projects, education and experience extracted from the uploaded document. Gender, religion, nationality, age, marital status, disability and photographs are never read, inferred or stored. The uploaded file is deleted from memory immediately after processing.",
    9.5,
  );
  gap(4);
  body(result.disclaimer, 9.5);

  footer();
  return doc;
}

export function downloadReport(result: AnalysisResult) {
  const doc = generateReport(result);
  const safeName = result.candidateName.replace(/[^A-Za-z0-9]+/g, "_");
  doc.save(`Resume_Analysis_${safeName}.pdf`);
}
