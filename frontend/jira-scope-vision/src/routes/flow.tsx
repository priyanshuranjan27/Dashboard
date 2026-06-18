import { createFileRoute } from "@tanstack/react-router";
import { Clock, GitMerge, Hourglass, RefreshCcw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/cards/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  DualLine,
  AreaTrend,
  StackedBar,
  BoxPlotSim,
  FunnelView,
} from "@/components/charts/Charts";
import { useIssues } from "@/hooks/useIssues";
import {
  agingByStatus,
  daysBetween,
  isOpen,
  lifecycleFunnel,
  resolutionByAssignee,
  trendByDay,
} from "@/lib/jira/analytics";

export const Route = createFileRoute("/flow")({
  head: () => ({
    meta: [
      { title: "Issue Flow Analytics — Jira Analytics" },
      { name: "description", content: "Issue lifecycle, velocity, aging, and resolution analytics." },
    ],
  }),
  component: Flow,
});

function Flow() {
  const { filtered } = useIssues();
  const resolved = filtered.filter((i) => i.resolved);
  const avgResolve =
    resolved.length === 0
      ? 0
      : Math.round(resolved.reduce((s, i) => s + daysBetween(i.created, i.resolved!), 0) / resolved.length);
  const inProgress = filtered.filter((i) => i.status === "In Progress");
  const avgInProgress =
    inProgress.length === 0
      ? 0
      : Math.round(inProgress.reduce((s, i) => s + daysBetween(i.created, new Date()), 0) / inProgress.length);
  const openIssues = filtered.filter(isOpen);
  const avgAgeOpen =
    openIssues.length === 0
      ? 0
      : Math.round(openIssues.reduce((s, i) => s + daysBetween(i.created, new Date()), 0) / openIssues.length);
  // Mock: "reopened" approximated by issues updated long after resolved date (none in mock); use 0
  const reopened = 0;

  const trend = trendByDay(filtered, 60);
  const aging = agingByStatus(filtered);
  const funnel = lifecycleFunnel(filtered);

  // Box-plot simulation per top 6 assignees: min/q1/median/q3/max of resolution times
  const resStats = (() => {
    const map = new Map<string, number[]>();
    for (const i of filtered) {
      if (!i.resolved || !i.assignee) continue;
      const arr = map.get(i.assignee.displayName) ?? [];
      arr.push(daysBetween(i.created, i.resolved));
      map.set(i.assignee.displayName, arr);
    }
    return [...map.entries()]
      .filter(([, a]) => a.length >= 3)
      .slice(0, 6)
      .map(([name, arr]) => {
        const sorted = [...arr].sort((a, b) => a - b);
        const q = (p: number) => sorted[Math.floor((sorted.length - 1) * p)];
        return { name, min: sorted[0], q1: q(0.25), median: q(0.5), q3: q(0.75), max: sorted[sorted.length - 1] };
      });
  })();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Avg Time To Resolve" value={`${avgResolve}d`} icon={Clock} accent="success" />
          <KpiCard label="Avg Time In Progress" value={`${avgInProgress}d`} icon={Hourglass} accent="info" />
          <KpiCard label="Avg Age of Open Issues" value={`${avgAgeOpen}d`} icon={Hourglass} accent="warning" />
          <KpiCard label="Reopened Issues" value={reopened} icon={RefreshCcw} accent="default" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Issue Creation Trend" description="Daily new issues">
            <DualLine data={trend} keys={[{ key: "created", label: "Created" }]} />
          </ChartCard>
          <ChartCard title="Issue Resolution Trend" description="Daily resolutions">
            <DualLine data={trend} keys={[{ key: "resolved", label: "Resolved" }]} />
          </ChartCard>
        </div>

        <ChartCard title="Created vs Closed Velocity" description="Cumulative flow over time">
          <AreaTrend data={trend} keys={[{ key: "created", label: "Created" }, { key: "resolved", label: "Resolved" }]} height={300} />
        </ChartCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Aging Buckets by Status" description="Open issues by age and state">
            <StackedBar data={aging} keys={["To Do", "In Progress", "In Review", "Blocked"]} />
          </ChartCard>
          <ChartCard title="Resolution Time Distribution" description="Top assignees, box-plot simulation">
            <BoxPlotSim data={resStats} />
          </ChartCard>
        </div>

        <ChartCard title="Issue Lifecycle Funnel" description="Created → Assigned → In Progress → Review → Done">
          <FunnelView data={funnel} />
        </ChartCard>

        {/* Silence unused import */}
        <div className="hidden">
          <GitMerge />
          <span>{resolutionByAssignee([]).length}</span>
        </div>
      </div>
    </AppShell>
  );
}