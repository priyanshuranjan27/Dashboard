import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlarmClock,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Flame,
  Hourglass,
  ListTodo,
  Loader,
  ShieldAlert,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/cards/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  DonutChart,
  TreemapChart,
  AreaTrend,
  DualLine,
  Histogram,
  HorizontalBar,
} from "@/components/charts/Charts";
import { SmartInsights } from "@/components/insights/SmartInsights";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { useIssues } from "@/hooks/useIssues";
import {
  kpiSummary,
  groupCount,
  trendByDay,
  agingBuckets,
  workloadByAssignee,
} from "@/lib/jira/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Overview — Jira Analytics" },
      { name: "description", content: "High-level Jira issue analytics and project health overview." },
      { property: "og:title", content: "Executive Overview — Jira Analytics" },
      { property: "og:description", content: "High-level Jira issue analytics and project health overview." },
    ],
  }),
  component: Index,
});

function Index() {
  const { filtered, isLoading } = useIssues();
  const k = kpiSummary(filtered);
  const status = groupCount(filtered, (i) => i.status);
  const priority = groupCount(filtered, (i) => i.priority);
  const types = groupCount(filtered, (i) => i.type);
  const trend = trendByDay(filtered, 45);
  const aging = agingBuckets(filtered);
  const workload = workloadByAssignee(filtered).slice(0, 8).map((w) => ({ name: w.name, value: w.total }));

  return (
    <AppShell>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading project data…</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <KpiCard label="Total Issues" value={k.total} icon={ListTodo} accent="info" trend={4} />
            <KpiCard label="Open" value={k.open} icon={Activity} accent="default" trend={-2} />
            <KpiCard label="Closed" value={k.closed} icon={CheckCircle2} accent="success" trend={6} />
            <KpiCard label="In Progress" value={k.inProgress} icon={Loader} accent="info" />
            <KpiCard label="Blocked" value={k.blocked} icon={ShieldAlert} accent="warning" />
            <KpiCard label="Critical" value={k.critical} icon={Flame} accent="danger" trend={12} />
            <KpiCard label="Overdue" value={k.overdue} icon={AlarmClock} accent="warning" />
            <KpiCard label="Avg Age" value={`${k.avgAge}d`} icon={Hourglass} accent="info" />
            <KpiCard label="Avg Resolution" value={`${k.avgResolution}d`} icon={Clock} accent="success" trend={-18} />
            <KpiCard label="Health Score" value={`${Math.max(0, 100 - k.blocked * 3 - k.critical * 4)}%`} icon={AlertOctagon} accent="default" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Status Distribution" description="Where issues sit today">
              <DonutChart data={status} />
            </ChartCard>
            <ChartCard title="Priority Distribution" description="Severity breakdown">
              <DonutChart data={priority} />
            </ChartCard>
            <ChartCard title="Issue Types" description="Treemap by type">
              <TreemapChart data={types} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Open vs Closed Trend" description="Last 45 days">
              <AreaTrend data={trend} keys={[{ key: "open", label: "Open" }, { key: "closed", label: "Closed" }]} />
            </ChartCard>
            <ChartCard title="Created vs Resolved" description="Daily velocity">
              <DualLine data={trend} keys={[{ key: "created", label: "Created" }, { key: "resolved", label: "Resolved" }]} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Issue Aging" description="Open issues by age">
              <Histogram data={aging} />
            </ChartCard>
            <ChartCard title="Assignee Workload" description="Top contributors" className="lg:col-span-2">
              <HorizontalBar data={workload} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SmartInsights />
            <ActivityFeed />
          </div>
        </div>
      )}
    </AppShell>
  );
}
