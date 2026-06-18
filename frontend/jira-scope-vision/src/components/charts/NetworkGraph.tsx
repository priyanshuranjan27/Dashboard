import { useMemo } from "react";
import type { JiraIssue } from "@/lib/jira/types";

export function NetworkGraph({ issues, max = 30 }: { issues: JiraIssue[]; max?: number }) {
  const data = useMemo(() => {
    const linked = issues.filter((i) => i.linkedIssues.length > 0).slice(0, max);
    const nodes = new Map<string, { key: string; x: number; y: number; primary: boolean }>();
    linked.forEach((i, idx) => {
      const angle = (idx / Math.max(1, linked.length)) * Math.PI * 2;
      nodes.set(i.key, { key: i.key, x: 200 + Math.cos(angle) * 130, y: 160 + Math.sin(angle) * 110, primary: true });
    });
    const edges: { a: string; b: string }[] = [];
    linked.forEach((i, idx) => {
      i.linkedIssues.slice(0, 2).forEach((k, j) => {
        if (!nodes.has(k)) {
          const angle = ((idx + j * 0.3) / Math.max(1, linked.length)) * Math.PI * 2 + 0.3;
          nodes.set(k, { key: k, x: 200 + Math.cos(angle) * 60, y: 160 + Math.sin(angle) * 50, primary: false });
        }
        edges.push({ a: i.key, b: k });
      });
    });
    return { nodes: [...nodes.values()], edges };
  }, [issues, max]);

  return (
    <svg viewBox="0 0 400 320" className="h-full w-full">
      {data.edges.map((e, i) => {
        const a = data.nodes.find((n) => n.key === e.a);
        const b = data.nodes.find((n) => n.key === e.b);
        if (!a || !b) return null;
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-border)" strokeWidth={1} />;
      })}
      {data.nodes.map((n) => (
        <g key={n.key}>
          <circle cx={n.x} cy={n.y} r={n.primary ? 8 : 4} fill={n.primary ? "var(--color-chart-1)" : "var(--color-chart-3)"} />
          {n.primary && (
            <text x={n.x + 10} y={n.y + 3} fontSize={9} fill="var(--color-muted-foreground)">{n.key}</text>
          )}
        </g>
      ))}
    </svg>
  );
}