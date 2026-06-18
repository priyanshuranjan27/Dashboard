import { staleIssues } from "@/lib/jira/analytics";
import type { JiraIssue } from "@/lib/jira/types";
import { Badge } from "@/components/ui/badge";

export function StaleIssuesTable({ issues }: { issues: JiraIssue[] }) {
  const rows = staleIssues(issues).slice(0, 12);
  if (!rows.length) return <p className="text-sm text-muted-foreground">No stale issues.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <th className="py-2 pr-3">Key</th>
            <th className="py-2 pr-3">Summary</th>
            <th className="py-2 pr-3">Assignee</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3 text-right">Days idle</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-border/60">
              <td className="py-2 pr-3 font-mono text-xs">{r.key}</td>
              <td className="py-2 pr-3 max-w-[280px] truncate">{r.summary}</td>
              <td className="py-2 pr-3">{r.assignee}</td>
              <td className="py-2 pr-3"><Badge variant="secondary">{r.status}</Badge></td>
              <td className="py-2 pr-3 text-right font-medium">{r.daysSinceUpdate}d</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}