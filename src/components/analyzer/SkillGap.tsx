import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryOf } from "@/lib/nlp/skillDictionary";
import type { AnalysisResult } from "@/lib/nlp/types";

function GroupedBadges({
  skills,
  tone,
}: {
  skills: string[];
  tone: "found" | "weak" | "missing";
}) {
  const grouped = new Map<string, string[]>();
  for (const s of skills) {
    const cat = categoryOf(s);
    grouped.set(cat, [...(grouped.get(cat) ?? []), s]);
  }
  const classes =
    tone === "found"
      ? "bg-success/12 text-success border-success/30"
      : tone === "weak"
        ? "bg-warning/15 text-warning-foreground border-warning/40"
        : "bg-destructive/10 text-destructive border-destructive/30";

  if (skills.length === 0) {
    return <p className="text-sm text-muted-foreground">None detected.</p>;
  }

  return (
    <div className="space-y-3">
      {[...grouped.entries()].map(([cat, list]) => (
        <div key={cat}>
          <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{cat}</p>
          <div className="flex flex-wrap gap-1.5">
            {list.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <Badge variant="outline" className={classes}>
                  {s}
                </Badge>
              </motion.span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkillGap({ result }: { result: AnalysisResult }) {
  const strong = result.skills.filter((s) => s.strength !== "weak").map((s) => s.name);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="surface-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="size-4 text-success" />
            Skills found ({strong.length})
          </CardTitle>
          <CardDescription>Mentioned at least twice — reads as real evidence.</CardDescription>
        </CardHeader>
        <CardContent>
          <GroupedBadges skills={strong} tone="found" />
        </CardContent>
      </Card>

      <Card className="surface-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-warning" />
            Weak skills ({result.weakSkills.length})
          </CardTitle>
          <CardDescription>Listed once only — reinforce inside projects or experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <GroupedBadges skills={result.weakSkills} tone="weak" />
        </CardContent>
      </Card>

      <Card className="surface-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 textextrabase text-base">
            <XCircle className="size-4 text-destructive" />
            Missing skills ({result.missingSkills.length})
          </CardTitle>
          <CardDescription>Required by your top 3 recommended roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <GroupedBadges skills={result.missingSkills} tone="missing" />
        </CardContent>
      </Card>
    </div>
  );
}
