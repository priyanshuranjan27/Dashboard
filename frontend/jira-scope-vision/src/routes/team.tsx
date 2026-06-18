import { createFileRoute } from "@tanstack/react-router";
import { Users, UserX, Crown, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/cards/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { HorizontalBar, Histogram } from "@/components/charts/Charts";
import { Heatmap } from "@/components/charts/Heatmap";
import { ContributorsTable } from "@/components/tables/ContributorsTable";
import { useIssues } from "@/hooks/useIssues";
import {
  groupCount,
  resolutionByAssignee,
  workloadByAssignee,
  workloadHeatmap,
} from "@/lib/jira/analytics";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team & Ownership — Jira Analytics" },
      { name: "description", content: "Assignee workload, top contributors, and resolution efficiency." },
    ],
  }),
  component: Team,
});

function Team() {
  const { filtered } = useIssues();
  const workload = workloadByAssignee(filtered);
  const reporters = groupCount(filtered, (i) => i.reporter.displayName).sort((a, b) => b.value - a.value).slice(0, 10);
  const creators = groupCount(filtered, (i) => i.creator.displayName).sort((a, b) => b.value - a.value).slice(0, 10);
  const res = resolutionByAssignee(filtered);
  const heat = workloadHeatmap(filtered);

  const activeAssignees = workload.filter((w) => w.name !== "Unassigned").length;
  const unassigned = workload.find((w) => w.name === "Unassigned")?.total ?? 0;
  const heaviest = workload.filter((w) => w.name !== "Unassigned")[0];
  const fastest = res[0];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Active Assignees" value={activeAssignees} icon={Users} accent="info" />
          <KpiCard label="Unassigned" value={unassigned} icon={UserX} accent="warning" />
          <KpiCard label="Heaviest Workload" value={heaviest?.name ?? "—"} icon={Crown} accent="default" />
          <KpiCard label="Fastest Resolver" value={fastest ? `${fastest.name} · ${fastest.value}d` : "—"} icon={Zap} accent="success" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Assignee Workload" description="Total issues per assignee">
            <HorizontalBar data={workload.slice(0, 10).map((w) => ({ name: w.name, value: w.total }))} />
          </ChartCard>
          <ChartCard title="Resolution Time by Assignee" description="Lower is faster">
            <HorizontalBar data={res.slice(0, 10).map((r) => ({ name: r.name, value: r.value }))} color="var(--color-chart-2)" />
          </ChartCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Issues by Reporter" description="Who's filing the most issues">
            <Histogram data={reporters} />
          </ChartCard>
          <ChartCard title="Issues by Creator" description="Issue authorship">
            <Histogram data={creators} />
          </ChartCard>
        </div>

        <ChartCard title="Workload Heatmap" description="Assignee × Status">
          <Heatmap rows={heat.names} cols={heat.statuses} grid={heat.grid} />
        </ChartCard>

        <ChartCard title="Top Contributors" description="Detailed breakdown">
          <ContributorsTable issues={filtered} />
        </ChartCard>
      </div>
    </AppShell>
  );
}