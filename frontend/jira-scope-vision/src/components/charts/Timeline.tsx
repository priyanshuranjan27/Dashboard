import type { JiraIssue } from "@/lib/jira/types";
import { formatDistanceToNow } from "date-fns";

export function Timeline({ issues, limit = 10 }: { issues: JiraIssue[]; limit?: number }) {
  const items = [...issues].sort((a, b) => +new Date(b.updated) - +new Date(a.updated)).slice(0, limit);
  return (
    <ol className="relative space-y-3 border-l border-border pl-4">
      {items.map((i) => (
        <li key={i.key} className="relative">
          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-chart-1 ring-4 ring-background" />
          <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(i.updated), { addSuffix: true })}</div>
          <div className="text-sm">
            <span className="font-mono text-foreground">{i.key}</span>{" "}
            <span className="text-muted-foreground">— {i.summary}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}