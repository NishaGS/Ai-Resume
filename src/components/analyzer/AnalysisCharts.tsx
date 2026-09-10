import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/nlp/types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

export function AnalysisCharts({ result }: { result: AnalysisResult }) {
  const pieData = result.skillsByCategory.map((c) => ({ name: c.category, value: c.found }));
  const barData = result.matches.slice(0, 8).map((m) => ({ role: m.role, score: m.score }));
  const radarData = result.topRecommendations.map((m) => ({
    role: m.role,
    coverage: Math.round(m.skillCoverage * 100),
    similarity: Math.round(m.cosineSimilarity * 100),
  }));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Skill distribution by category</CardTitle>
          <CardDescription>Where your detected skills concentrate.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="var(--card)" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top role match scores</CardTitle>
          <CardDescription>Hybrid TF-IDF + skill coverage score per role.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 24, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis
                type="category"
                dataKey="role"
                width={132}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="score" radius={[0, 8, 8, 0]} fill="var(--chart-1)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-panel border-0 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Coverage vs semantic similarity</CardTitle>
          <CardDescription>How lexical evidence compares to textual similarity for your top roles.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="role" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Radar name="Skill coverage" dataKey="coverage" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} />
              <Radar
                name="Cosine similarity"
                dataKey="similarity"
                stroke="var(--chart-2)"
                fill="var(--chart-2)"
                fillOpacity={0.28}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
