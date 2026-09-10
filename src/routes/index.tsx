import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, BrainCircuit, FileSearch, GaugeCircle, Route as RouteIcon, ShieldCheck, Sparkles } from "lucide-react";
import { ResumeUpload } from "@/components/analyzer/ResumeUpload";
import { AnalysisResults } from "@/components/analyzer/AnalysisResults";
import { analyzeResume } from "@/lib/analyze.functions";
import { appendHistory } from "@/lib/history";
import type { AnalysisResult } from "@/lib/nlp/types";
import { JOB_ROLES } from "@/lib/nlp/jobRoles";
import { SKILL_DICTIONARY } from "@/lib/nlp/skillDictionary";

const TITLE = "AI Resume Analyzer & Job Recommendation System";
const DESCRIPTION =
  "Upload a PDF or DOCX resume to extract skills, match against curated job roles with TF-IDF cosine similarity, see your skill gap, get a 4-week roadmap and download a PDF report.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Resume Analyzer & Job Recommendation System" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = [
  {
    icon: FileSearch,
    title: "Resume parsing",
    text: "Every PDF page and DOCX paragraph is extracted and cleaned while preserving C++, C#, .NET and Node.js.",
  },
  {
    icon: Sparkles,
    title: "Skill extraction",
    text: `${SKILL_DICTIONARY.length} skills across 12 categories detected with alias-aware phrase matching.`,
  },
  {
    icon: GaugeCircle,
    title: "TF-IDF matching",
    text: `Cosine similarity against ${JOB_ROLES.length} job-role profiles plus required-skill coverage scoring.`,
  },
  {
    icon: RouteIcon,
    title: "Learning roadmap",
    text: "A deterministic 4-week plan with topics, courses, practice work, mini projects and certifications.",
  },
  {
    icon: BarChart3,
    title: "Interactive dashboard",
    text: "Pie, bar and radar charts, animated progress bars, circular gauges and upload history.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible AI",
    text: "Only skills, projects, education and experience are evaluated. Files are discarded after processing.",
  },
];

function Index() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const analyze = useServerFn(analyzeResume);

  const handleAnalyze = useCallback(
    async (text: string, fileName: string) => {
      setBusy(true);
      try {
        const data = await analyze({ data: { text, fileName } });
        setResult(data);
        appendHistory(data);
        requestAnimationFrame(() =>
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      } finally {
        setBusy(false);
      }
    },
    [analyze],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <section className="relative overflow-hidden rounded-3xl">
        <div className="gradient-hero absolute inset-0 opacity-95" />
        <div className="relative grid gap-10 px-6 py-16 sm:px-12 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div className="text-primary-foreground">
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1.5 text-xs font-medium ring-1 ring-background/25 backdrop-blur"
            >
              <BrainCircuit className="size-3.5" />
              NLP · TF-IDF · Cosine similarity
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-4xl leading-[1.1] font-bold sm:text-5xl lg:text-6xl"
            >
              Match your resume to the right job role in seconds
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 max-w-xl text-base/relaxed opacity-90 sm:text-lg"
            >
              Upload a PDF or DOCX resume. The analyzer extracts your skills, education, projects and experience, scores
              you against {JOB_ROLES.length} role profiles, highlights missing skills, and builds a personalised 4-week
              learning roadmap with a downloadable report.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 grid max-w-lg grid-cols-3 gap-4"
            >
              {[
                { k: `${JOB_ROLES.length}`, v: "job roles" },
                { k: `${SKILL_DICTIONARY.length}`, v: "skills tracked" },
                { k: "4", v: "week roadmap" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl bg-background/12 p-4 ring-1 ring-background/20 backdrop-blur">
                  <p className="text-2xl font-bold">{s.k}</p>
                  <p className="text-xs opacity-80">{s.v}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <ResumeUpload onAnalyze={handleAnalyze} busy={busy} />
          </motion.div>
        </div>
      </section>

      {result ? (
        <div className="mt-12">
          <AnalysisResults result={result} />
        </div>
      ) : (
        <section className="mt-14">
          <h2 className="text-2xl font-bold">What the analyzer does</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A complete NLP pipeline: parse → clean → extract → vectorise → rank → recommend → roadmap → report.
          </p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="surface-card p-5"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
