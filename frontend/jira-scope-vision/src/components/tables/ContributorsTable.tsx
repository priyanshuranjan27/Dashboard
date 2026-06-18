import { topContributors } from "@/lib/jira/analytics";
import type { JiraIssue } from "@/lib/jira/types";

export function ContributorsTable({ issues }: { issues: JiraIssue[] }) {
  const rows = topContributors(issues).slice(0, 10);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <th className="py-2 pr-3">Assignee</th>
            <th className="py-2 pr-3 text-right">Open</th>
            <th className="py-2 pr-3 text-right">Closed</th>
            <th className="py-2 pr-3 text-right">Avg resolution</th>
            <th className="py-2 pr-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-border/60">
              <td className="py-2 pr-3 font-medium">{r.name}</td>
              <td className="py-2 pr-3 text-right">{r.open}</td>
              <td className="py-2 pr-3 text-right">{r.closed}</td>
              <td className="py-2 pr-3 text-right">{r.avgResolution !== null ? `${r.avgResolution}d` : "—"}</td>
              <td className="py-2 pr-3 text-right font-semibold">{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}