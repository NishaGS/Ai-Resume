import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JOB_ROLES } from "@/lib/nlp/jobRoles";
import { SKILL_CATEGORIES, SKILL_DICTIONARY } from "@/lib/nlp/skillDictionary";

const TITLE = "How It Works — AI Resume Analyzer & Job Recommender";
const DESCRIPTION =
  "The NLP pipeline behind the analyzer: text cleaning, skill extraction, TF-IDF vectorisation, cosine similarity scoring, roadmap generation, and our responsible-AI limits.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const PIPELINE = [
  {
    step: "1 · Parse",
    text: "PDF text layers are read page-by-page with pdf.js; DOCX files are converted with Mammoth. Parsing happens in your browser, so the file itself never leaves your device.",
  },
  {
    step: "2 · Clean",
    text: "Text is lowercased, de-hyphenated and stripped of stopwords while technical tokens such as C++, C#, .NET, Node.js and CI/CD are preserved intact.",
  },
  {
    step: "3 · Extract",
    text: `Section headers split the resume into summary, skills, education, projects, experience and certifications. ${SKILL_DICTIONARY.length} canonical skills with aliases are matched by phrase, and occurrence counts decide whether a skill is strong, moderate or weak.`,
  },
  {
    step: "4 · Vectorise",
    text: "Resume text and each role profile become sublinear TF-IDF vectors over a shared vocabulary, with inverse document frequency computed across all role documents.",
  },
  {
    step: "5 · Score",
    text: "The final score blends cosine similarity, required-skill coverage and Jaccard skill overlap, so a role only ranks high when the actual evidence supports it.",
  },
  {
    step: "6 · Recommend",
    text: "Top roles come with a reason, confidence, matched and missing skills, salary band and career path, plus a deterministic 4-week roadmap for the highest-ranked role.",
  },
];

function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">
        How the <span className="gradient-text">analyzer</span> works
      </h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Every number the app shows is traceable to a rule you can read here. There is no black-box model and no
        generative guessing — the pipeline is classical NLP: TF-IDF vectorisation with cosine similarity, combined with
        dictionary-based skill extraction.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PIPELINE.map((p) => (
          <div key={p.step} className="surface-card p-5">
            <Badge variant="secondary" className="bg-primary/12 text-primary">
              {p.step}
            </Badge>
            <p className="mt-3 text-sm text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </div>

      <Card className="glass-panel mt-10 border-0">
        <CardHeader>
          <CardTitle className="text-base">Scoring formula</CardTitle>
          <CardDescription>Weights are fixed and applied identically to every resume.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs leading-relaxed">
{`score = 100 × (0.45 × requiredSkillCoverage
             + 0.35 × cosineSimilarity(resumeTfIdf, roleTfIdf)
             + 0.20 × jaccard(resumeSkills, roleSkills))

requiredSkillCoverage = matchedRequired / totalRequired
cosineSimilarity(a, b) = (a · b) / (‖a‖ ‖b‖)
tfidf(t, d) = (1 + log tf(t, d)) × log((1 + N) / (1 + df(t)))`}
          </pre>
        </CardContent>
      </Card>

      <h2 className="mt-12 text-2xl font-bold">Responsible AI &amp; limitations</h2>
      <Accordion type="single" collapsible className="mt-4">
        <AccordionItem value="a">
          <AccordionTrigger>What data is stored?</AccordionTrigger>
          <AccordionContent>
            Your resume file is parsed in the browser and the extracted text is sent to the analysis endpoint only for
            the duration of the request. Neither the file nor the text is written to any database. Your dashboard
            history keeps aggregate metrics (score, role, counts) in this browser's local storage and you can clear it
            at any time.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>What the analyzer deliberately ignores</AccordionTrigger>
          <AccordionContent>
            Scoring uses only skills, projects, education, certifications and experience signals. Name, gender, age,
            photo, nationality, marital status, address and school prestige never influence the score.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="c">
          <AccordionTrigger>Known limitations</AccordionTrigger>
          <AccordionContent>
            Scanned or image-only PDFs have no text layer and cannot be analysed. Very unusual section headings may be
            missed by the extractor. The role library is curated ({JOB_ROLES.length} roles) and is not a live job feed,
            so results are guidance for upskilling rather than a hiring decision or a guarantee of employment.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="d">
          <AccordionTrigger>Skill coverage</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_CATEGORIES.map((c) => (
                <Badge key={c} variant="outline" className="text-[11px]">
                  {c}
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-10 flex gap-3">
        <Button asChild>
          <Link to="/">Analyse my resume</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard">View dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
