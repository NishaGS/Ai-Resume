import { motion } from "framer-motion";
import { Download, FileWarning, Gauge, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisCharts } from "./AnalysisCharts";
import { FeedbackPanel } from "./FeedbackPanel";
import { ResumeDetails } from "./ResumeDetails";
import { RoadmapTimeline } from "./RoadmapTimeline";
import { RoleRecommendations } from "./RoleRecommendations";
import { ScoreGauge } from "./ScoreGauge";
import { SkillGap } from "./SkillGap";
import { downloadReport } from "@/lib/report";
import type { AnalysisResult } from "@/lib/nlp/types";

export function AnalysisResults({ result }: { result: AnalysisResult }) {
  const top = result.topRecommendations[0];

  return (
    <motion.section
      id="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="glass-panel border-0">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <ScoreGauge value={result.overallScore} label="best match" sublabel={top?.role ?? ""} />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">
                Recommended role: <span className="gradient-text">{top?.role ?? "—"}</span>
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{top?.reason}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="bg-primary/12 text-primary">
                  <Gauge className="mr-1 size-3" /> ATS readiness {result.atsScore}%
                </Badge>
                <Badge variant="secondary">{result.skills.length} skills detected</Badge>
                <Badge variant="secondary">{result.missingSkills.length} missing skills</Badge>
                <Badge variant="secondary">Confidence {top?.confidence ?? 0}%</Badge>
              </div>
            </div>
          </div>
          <Button size="lg" onClick={() => downloadReport(result)}>
            <Download className="size-4" />
            Download PDF report
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 rounded-xl border border-warning/35 bg-warning/10 p-4 text-sm sm:flex-row sm:items-center">
        <ShieldAlert className="size-4 shrink-0 text-warning" />
        <span className="text-foreground/90">{result.disclaimer}</span>
      </div>

      <Tabs defaultValue="recommendations">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="gap">Skill gap</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="parsed">Parsed resume</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="mt-5">
          <RoleRecommendations matches={result.matches} top={result.topRecommendations} />
        </TabsContent>
        <TabsContent value="gap" className="mt-5">
          <SkillGap result={result} />
        </TabsContent>
        <TabsContent value="roadmap" className="mt-5">
          <RoadmapTimeline weeks={result.roadmap} targetRole={top?.role ?? "your target role"} />
        </TabsContent>
        <TabsContent value="charts" className="mt-5">
          <AnalysisCharts result={result} />
        </TabsContent>
        <TabsContent value="feedback" className="mt-5">
          <FeedbackPanel items={result.feedback} atsScore={result.atsScore} />
        </TabsContent>
        <TabsContent value="parsed" className="mt-5">
          <ResumeDetails result={result} />
        </TabsContent>
      </Tabs>

      {result.skills.length < 4 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileWarning className="size-3.5" />
          Few skills were detected — if your resume uses images or unusual formatting, export a text-based PDF for a
          more accurate analysis.
        </p>
      ) : null}
    </motion.section>
  );
}
