import { Card } from "@/components/ui/card";
import { recentActivity } from "@/lib/jira/analytics";
import { useIssues } from "@/hooks/useIssues";
import { CheckCircle2, FilePlus2, PencilLine } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const icons = {
  created: { icon: FilePlus2, cls: "text-chart-1" },
  updated: { icon: PencilLine, cls: "text-chart-3" },
  resolved: { icon: CheckCircle2, cls: "text-chart-2" },
};

export function ActivityFeed() {
  const { filtered } = useIssues();
  const events = recentActivity(filtered, 15);
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold">Recent Activity</h3>
      <ul className="space-y-3">
        {events.map((e, i) => {
          const Icon = icons[e.kind].icon;
          return (
            <li key={i} className="flex gap-3 text-sm">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icons[e.kind].cls}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate">
                  <span className="font-medium">{e.issue.key}</span>{" "}
                  <span className="text-muted-foreground">{e.kind}</span> — {e.issue.summary}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(e.at), { addSuffix: true })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}