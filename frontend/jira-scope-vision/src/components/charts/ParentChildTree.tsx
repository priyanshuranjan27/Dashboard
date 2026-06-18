import type { JiraIssue } from "@/lib/jira/types";
import { useMemo } from "react";

export function ParentChildTree({ issues, max = 6 }: { issues: JiraIssue[]; max?: number }) {
  const groups = useMemo(() => {
    const byParent = new Map<string, JiraIssue[]>();
    for (const i of issues) {
      if (i.parentKey) {
        const arr = byParent.get(i.parentKey) ?? [];
        arr.push(i);
        byParent.set(i.parentKey, arr);
      }
    }
    return [...byParent.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, max);
  }, [issues, max]);

  if (!groups.length) return <p className="text-sm text-muted-foreground">No parent-child relationships.</p>;

  return (
    <div className="space-y-3">
      {groups.map(([parent, children]) => (
        <div key={parent} className="rounded-md border border-border bg-card/40 p-3">
          <div className="text-sm font-semibold text-foreground">{parent}</div>
          <ul className="mt-2 space-y-1 pl-4 text-xs text-muted-foreground">
            {children.slice(0, 5).map((c) => (
              <li key={c.key} className="flex items-center gap-2">
                <span className="text-chart-3">└</span>
                <span className="font-mono text-foreground">{c.key}</span>
                <span className="truncate">{c.summary}</span>
              </li>
            ))}
            {children.length > 5 && <li className="text-[11px] italic">+{children.length - 5} more</li>}
          </ul>
        </div>
      ))}
    </div>
  );
}