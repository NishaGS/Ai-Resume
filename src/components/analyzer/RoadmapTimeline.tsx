import { motion } from "framer-motion";
import { Award, BookOpen, CalendarDays, FlaskConical, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoadmapWeek } from "@/lib/nlp/roadmap";

export function RoadmapTimeline({ weeks, targetRole }: { weeks: RoadmapWeek[]; targetRole: string }) {
  return (
    <Card className="glass-panel border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-primary" />
          4-week personalised learning roadmap
        </CardTitle>
        <CardDescription>Sequenced to close the skill gap for {targetRole}.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-6 border-l border-border pl-6">
          {weeks.map((w, i) => (
            <motion.li
              key={w.week}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative"
            >
              <span className="absolute -left-[31px] grid size-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-glow">
                {w.week}
              </span>
              <div className="rounded-xl border border-border/70 bg-card/70 p-4">
                <p className="text-sm font-semibold">Week {w.week} — {w.focus}</p>
                {w.skills.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {w.skills.map((s) => (
                      <Badge key={s} className="bg-primary/12 text-primary" variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      <BookOpen className="size-3.5" /> Topics
                    </p>
                    <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                      {w.topics.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      <FlaskConical className="size-3.5" /> Courses & practice
                    </p>
                    <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                      {w.courses.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                      {w.practiceProjects.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-3 flex items-start gap-2 rounded-lg bg-primary/8 p-2.5 text-xs text-foreground">
                  <Rocket className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold">Mini project:</strong> {w.miniProject}
                  </span>
                </p>
                {w.certifications.length > 0 ? (
                  <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                    <Award className="mt-0.5 size-3.5 shrink-0 text-warning" />
                    Certifications: {w.certifications.join(", ")}
                  </p>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
