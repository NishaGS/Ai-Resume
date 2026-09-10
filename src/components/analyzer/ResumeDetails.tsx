import { motion } from "framer-motion";
import { Briefcase, FolderGit2, GraduationCap, Sparkles, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/nlp/types";

export function ResumeDetails({ result }: { result: AnalysisResult }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="glass-panel border-0 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-4 text-primary" />
            {result.candidateName}
          </CardTitle>
          <CardDescription>
            Parsed from {result.fileName} · {result.wordCount} words · estimated {result.yearsOfExperience} year(s) of
            experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{result.summary}</p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            Extracted skills ({result.skills.length})
          </CardTitle>
          <CardDescription>Badge shade reflects how often each skill appears.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.skillsByCategory.map((cat) => (
            <div key={cat.category}>
              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {cat.category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.skills
                  .filter((s) => s.category === cat.category)
                  .map((s, i) => (
                    <motion.span
                      key={s.name}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <Badge
                        variant="secondary"
                        className={
                          s.strength === "strong"
                            ? "bg-primary/15 text-primary"
                            : s.strength === "moderate"
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                        }
                      >
                        {s.name}
                        <span className="ml-1 opacity-60">×{s.occurrences}</span>
                      </Badge>
                    </motion.span>
                  ))}
              </div>
            </div>
          ))}
          {result.skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recognised technical skills were detected.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="size-4 text-primary" />
            Education ({result.education.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.education.length === 0 ? (
            <p className="text-sm text-muted-foreground">No education section was detected.</p>
          ) : (
            result.education.map((e) => (
              <div key={e.text} className="rounded-lg border border-border/70 bg-card/60 p-3 text-sm">
                <p>{e.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.degree ? `Degree: ${e.degree}` : "Degree not identified"}
                  {e.year ? ` · ${e.year}` : ""}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderGit2 className="size-4 text-primary" />
            Projects ({result.projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects section was detected.</p>
          ) : (
            result.projects.map((p) => (
              <div key={p.title} className="rounded-lg border border-border/70 bg-card/60 p-3">
                <p className="text-sm font-medium">{p.title}</p>
                {p.detail ? <p className="mt-1 text-xs text-muted-foreground">{p.detail}</p> : null}
                {p.technologies.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.technologies.map((t) => (
                      <Badge key={t} variant="outline" className="text-[11px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="size-4 text-primary" />
            Experience ({result.experience.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.experience.length === 0 ? (
            <p className="text-sm text-muted-foreground">No experience section was detected.</p>
          ) : (
            result.experience.map((x) => (
              <div key={x.text} className="rounded-lg border border-border/70 bg-card/60 p-3 text-sm">
                <p>{x.text}</p>
                {x.duration ? <p className="mt-1 text-xs text-muted-foreground">{x.duration}</p> : null}
              </div>
            ))
          )}
          {result.certifications.length > 0 ? (
            <div className="pt-2">
              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Certifications
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.certifications.map((c) => (
                  <Badge key={c} variant="outline" className="text-[11px]">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
