import { motion } from "framer-motion";
import { ArrowUpRight, Banknote, Route, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScoreGauge } from "./ScoreGauge";
import type { RoleMatch } from "@/lib/nlp/types";

export function RoleRecommendations({ matches, top }: { matches: RoleMatch[]; top: RoleMatch[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-3">
        {top.map((m, i) => (
          <motion.div
            key={m.role}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="surface-card relative h-full overflow-hidden border-0">
              {i === 0 ? (
                <span className="absolute top-4 right-4 rounded-full bg-primary/12 px-3 py-1 text-[11px] font-semibold tracking-wide text-primary uppercase">
                  Best match
                </span>
              ) : null}
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="size-4 text-primary" />
                  {m.role}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <ScoreGauge value={m.score} size={132} label="match" />
                </div>
                <p className="text-sm text-muted-foreground">{m.description}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Confidence</span>
                    <span className="font-semibold text-foreground">{m.confidence}%</span>
                  </div>
                  <Progress value={m.confidence} className="h-1.5" />
                </div>
                <p className="flex gap-2 text-xs text-muted-foreground">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {m.reason}
                </p>
                <div className="space-y-2 border-t border-border/60 pt-3 text-xs">
                  <p className="flex gap-2 text-muted-foreground">
                    <Route className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {m.careerPath}
                  </p>
                  <p className="flex gap-2 text-muted-foreground">
                    <Banknote className="mt-0.5 size-3.5 shrink-0 text-success" />
                    {m.salaryRange}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.matchedSkills.slice(0, 8).map((s) => (
                    <Badge key={s} variant="secondary" className="bg-success/12 text-success">
                      {s}
                    </Badge>
                  ))}
                  {m.missingSkills.slice(0, 5).map((s) => (
                    <Badge key={s} variant="outline" className="border-destructive/40 text-destructive">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass-panel border-0">
        <CardHeader>
          <CardTitle className="text-base">All role match scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {matches.map((m, i) => (
            <div key={m.role} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  {m.role}
                  <span className="text-xs font-normal text-muted-foreground">{m.category}</span>
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="hidden sm:inline">
                    cosine {(m.cosineSimilarity * 100).toFixed(0)}% · coverage {(m.skillCoverage * 100).toFixed(0)}%
                  </span>
                  <span className="font-semibold text-foreground">{m.score}%</span>
                </span>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.03, duration: 0.5 }}
                style={{ transformOrigin: "left" }}
              >
                <Progress value={m.score} className="h-2" />
              </motion.div>
            </div>
          ))}
          <p className="flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
            <ArrowUpRight className="size-3.5" />
            Scores blend TF-IDF cosine similarity (30%), required-skill coverage (55%) and skill-set overlap (15%).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
