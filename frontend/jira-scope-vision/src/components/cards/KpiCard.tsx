import type { LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card } from "@/components/ui/card";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "default" | "warning" | "danger" | "success" | "info";
  trend?: number; // percentage delta
  spark?: number[];
}

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
  default: "from-chart-1/20 to-chart-2/10 text-chart-1",
  warning: "from-chart-4/20 to-chart-5/10 text-chart-4",
  danger: "from-destructive/30 to-destructive/10 text-destructive",
  success: "from-chart-2/20 to-chart-1/10 text-chart-2",
  info: "from-chart-3/20 to-chart-1/10 text-chart-3",
};

export function KpiCard({ label, value, icon: Icon, accent = "default", trend, spark }: Props) {
  const data = (spark ?? Array.from({ length: 12 }, (_, i) => Math.sin(i / 2) * 4 + 8)).map(
    (v, i) => ({ i, v }),
  );
  return (
    <Card className="relative overflow-hidden p-4">
      <div className={`pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br ${accentMap[accent]} opacity-60`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
          {typeof trend === "number" && (
            <div className={`mt-1 text-xs ${trend >= 0 ? "text-chart-2" : "text-destructive"}`}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md bg-background/60 ${accentMap[accent].split(" ").pop()}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="relative -mx-1 mt-2 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`spk-${label}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.5} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="currentColor" strokeWidth={1.5} fill={`url(#spk-${label})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}