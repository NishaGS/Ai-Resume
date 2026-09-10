import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, BarChart3, FileStack, Layers, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { clearHistory, readHistory, type HistoryEntry } from "@/lib/history";
import { JOB_ROLES } from "@/lib/nlp/jobRoles";
import { SKILL_CATEGORIES } from "@/lib/nlp/skillDictionary";

const TITLE = "Analysis Dashboard — AI Resume Analyzer";
const DESCRIPTION =
  "Review your resume analysis history, average match score, ATS readiness trend and the job-role library used for matching.";

export const Route = createFileRoute("/dashboard")({
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
  component: Dashboard,
});

function avg(nums: number[]) {
  return nums.length === 0 ? 0 : Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function Dashboard() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const stats = [
    { icon: FileStack, label: "Resumes analysed", value: `${history.length}` },
    { icon: TrendingUp, label: "Average match score", value: `${avg(history.map((h) => h.score))}%` },
    { icon: Award, label: "Average ATS readiness", value: `${avg(history.map((h) => h.atsScore))}%` },
    { icon: Layers, label: "Avg skills detected", value: `${avg(history.map((h) => h.skillCount))}` },
  ];

  const roleCounts = Object.entries(
    history.reduce<Record<string, number>>((acc, h) => {
      acc[h.topRole] = (acc[h.topRole] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Analysis <span className="gradient-text">dashboard</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            History is stored only in this browser and contains aggregate metrics — never your resume text.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/">Analyse a resume</Link>
          </Button>
          {history.length > 0 ? (
            <Button variant="outline" onClick={() => setHistory(clearHistory())}>
              <Trash2 className="size-4" />
              Clear history
            </Button>
          ) : null}
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel p-5"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
              <s.icon className="size-5" />
            </span>
            <p className="mt-4 text-3xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="glass-panel border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4 text-primary" />
              Recent analyses
            </CardTitle>
            <CardDescription>The 20 most recent resume analyses from this browser.</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No analyses yet. Upload a resume on the home page to populate this dashboard.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resume</TableHead>
                    <TableHead>Top role</TableHead>
                    <TableHead className="text-right">Match</TableHead>
                    <TableHead className="text-right">ATS</TableHead>
                    <TableHead className="text-right">Gaps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="max-w-[180px]">
                        <p className="truncate font-medium">{h.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(h.analysedAt).toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{h.topRole}</TableCell>
                      <TableCell className="text-right font-semibold">{h.score}%</TableCell>
                      <TableCell className="text-right">{h.atsScore}%</TableCell>
                      <TableCell className="text-right">{h.missingCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="glass-panel border-0">
            <CardHeader>
              <CardTitle className="text-base">Most recommended roles</CardTitle>
              <CardDescription>Across your analysis history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roleCounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing to show yet.</p>
              ) : (
                roleCounts.map(([role, count]) => (
                  <div key={role}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{role}</span>
                      <span className="text-muted-foreground">{count}×</span>
                    </div>
                    <Progress value={(count / history.length) * 100} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-0">
            <CardHeader>
              <CardTitle className="text-base">Matching library</CardTitle>
              <CardDescription>
                {JOB_ROLES.length} role profiles · {SKILL_CATEGORIES.length} skill categories
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {JOB_ROLES.map((r) => (
                <Badge key={r.role} variant="outline" className="text-[11px]">
                  {r.role}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
