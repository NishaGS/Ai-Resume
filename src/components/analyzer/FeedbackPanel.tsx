import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FeedbackItem } from "@/lib/nlp/feedback";

const GROUPS: Array<FeedbackItem["category"]> = [
  "ATS",
  "Formatting",
  "Keywords",
  "Projects",
  "Certifications",
  "Summary",
];

const ICONS = {
  critical: AlertCircle,
  improve: Info,
  good: CheckCircle2,
} as const;

const TONES = {
  critical: "text-destructive bg-destructive/8 border-destructive/25",
  improve: "text-warning-foreground bg-warning/12 border-warning/30",
  good: "text-success bg-success/8 border-success/25",
} as const;

export function FeedbackPanel({ items, atsScore }: { items: FeedbackItem[]; atsScore: number }) {
  return (
    <Card className="glass-panel border-0">
      <CardHeader>
        <CardTitle className="text-base">Resume feedback — ATS readiness {atsScore}%</CardTitle>
        <CardDescription>
          Every suggestion below is derived from a measurable signal found in your document. Nothing is invented.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">
        {GROUPS.map((group) => {
          const groupItems = items.filter((i) => i.category === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group} className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group}</p>
              {groupItems.map((item) => {
                const Icon = ICONS[item.severity];
                return (
                  <div
                    key={item.message}
                    className={cn("flex gap-2 rounded-xl border p-3 text-sm", TONES[item.severity])}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0" />
                    <span className="text-foreground/90">{item.message}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
