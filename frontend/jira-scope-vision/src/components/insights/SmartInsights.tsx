import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { smartInsights } from "@/lib/jira/analytics";
import { useIssues } from "@/hooks/useIssues";

export function SmartInsights() {
  const { filtered } = useIssues();
  const insights = smartInsights(filtered);
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-chart-1 to-chart-4 text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Smart Insights</h3>
          <p className="text-xs text-muted-foreground">Auto-generated from current filters</p>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {insights.map((s, i) => (
          <li key={i} className="flex gap-2 rounded-md border border-border bg-card/40 p-2 text-foreground">
            <span className="text-chart-1">•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}