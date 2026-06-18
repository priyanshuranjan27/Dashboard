import { createFileRoute } from "@tanstack/react-router";
import { Tags, Boxes, Link2, GitBranch } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/cards/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { BubbleChart, TreemapChart } from "@/components/charts/Charts";
import { NetworkGraph } from "@/components/charts/NetworkGraph";
import { ParentChildTree } from "@/components/charts/ParentChildTree";
import { Timeline } from "@/components/charts/Timeline";
import { StaleIssuesTable } from "@/components/tables/StaleIssuesTable";
import { useIssues } from "@/hooks/useIssues";
import { groupCount } from "@/lib/jira/analytics";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Deep Insights — Jira Analytics" },
      { name: "description", content: "Labels, components, linked issues, and stale issue intelligence." },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { filtered } = useIssues();
  const labelSet = new Set<string>();
  const compSet = new Set<string>();
  let linkedCount = 0;
  let parentCount = 0;
  filtered.forEach((i) => {
    i.labels.forEach((l) => labelSet.add(l));
    i.components.forEach((c) => compSet.add(c));
    if (i.linkedIssues.length) linkedCount++;
    if (i.parentKey) parentCount++;
  });

  const labelDist = (() => {
    const m = new Map<string, number>();
    filtered.forEach((i) => i.labels.forEach((l) => m.set(l, (m.get(l) ?? 0) + 1)));
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  })();
  const compDist = groupCount(filtered.flatMap((i) => i.components.map((c) => ({ ...i, _c: c } as never))), (i) => (i as unknown as { _c: string })._c);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Total Labels" value={labelSet.size} icon={Tags} accent="info" />
          <KpiCard label="Total Components" value={compSet.size} icon={Boxes} accent="success" />
          <KpiCard label="Linked Issues" value={linkedCount} icon={Link2} accent="default" />
          <KpiCard label="Parent Issues" value={parentCount} icon={GitBranch} accent="warning" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Labels Distribution" description="Bubble size = issue count">
            <BubbleChart data={labelDist} />
          </ChartCard>
          <ChartCard title="Components Distribution" description="Treemap">
            <TreemapChart data={compDist} />
          </ChartCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Linked Issue Relationships" description="Network of related issues">
            <div className="h-[320px]">
              <NetworkGraph issues={filtered} />
            </div>
          </ChartCard>
          <ChartCard title="Parent-Child Relationships" description="Top epics by child count">
            <ParentChildTree issues={filtered} />
          </ChartCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Recently Updated" description="Latest issue activity">
            <Timeline issues={filtered} />
          </ChartCard>
          <ChartCard title="Stale Issues" description="No update in 30+ days">
            <StaleIssuesTable issues={filtered} />
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}