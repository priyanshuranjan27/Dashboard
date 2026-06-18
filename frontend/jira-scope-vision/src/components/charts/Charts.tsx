import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Treemap,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { CHART_COLORS } from "./ChartCard";

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--color-popover-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
};

export function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TreemapChart({ data }: { data: { name: string; value: number }[] }) {
  const Content = (props: unknown) => {
    const p = props as {
      x: number; y: number; width: number; height: number; index: number; name?: string; value?: number;
    };
    const color = CHART_COLORS[p.index % CHART_COLORS.length];
    return (
      <g>
        <rect x={p.x} y={p.y} width={p.width} height={p.height} fill={color} stroke="var(--color-background)" />
        {p.width > 60 && p.height > 24 && (
          <text x={p.x + 6} y={p.y + 16} fill="var(--color-primary-foreground)" fontSize={11} fontWeight={600}>
            {p.name} ({p.value})
          </text>
        )}
      </g>
    );
  };
  return (
    <ResponsiveContainer width="100%" height={260}>
      <Treemap
        data={data}
        dataKey="value"
        nameKey="name"
        stroke="var(--color-background)"
        fill="var(--color-chart-1)"
        content={<Content />}
      />
    </ResponsiveContainer>
  );
}

export function AreaTrend({
  data,
  keys,
  height = 260,
}: {
  data: Array<Record<string, string | number>>;
  keys: { key: string; label: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          {keys.map((k, i) => (
            <linearGradient key={k.key} id={`g-${k.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.6} />
              <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {keys.map((k, i) => (
          <Area
            key={k.key}
            type="monotone"
            name={k.label}
            dataKey={k.key}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fill={`url(#g-${k.key})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DualLine({
  data,
  keys,
  height = 260,
}: {
  data: Array<Record<string, string | number>>;
  keys: { key: string; label: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {keys.map((k, i) => (
          <Line
            key={k.key}
            type="monotone"
            name={k.label}
            dataKey={k.key}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Histogram({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBar({
  data,
  height = 280,
  color = "var(--color-chart-1)",
}: {
  data: { name: string; value: number }[];
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <YAxis
          dataKey="name"
          type="category"
          width={120}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StackedBar({
  data,
  keys,
  height = 280,
}: {
  data: Array<Record<string, string | number>>;
  keys: string[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {keys.map((k, i) => (
          <Bar
            key={k}
            dataKey={k}
            stackId="a"
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            radius={i === keys.length - 1 ? [4, 4, 0, 0] : 0}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BubbleChart({ data }: { data: { name: string; value: number }[] }) {
  const points = data.map((d, i) => ({
    x: (i % 6) + 1 + Math.random() * 0.3,
    y: Math.floor(i / 6) + 1 + Math.random() * 0.3,
    z: d.value,
    name: d.name,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis type="number" dataKey="x" hide />
        <YAxis type="number" dataKey="y" hide />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: unknown, n: unknown, p: { payload?: { name?: string; z?: number } }) =>
            [`${p.payload?.z ?? v} issues`, p.payload?.name ?? String(n)]
          }
        />
        <Scatter data={points}>
          {points.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function FunnelView({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <FunnelChart>
        <Tooltip {...tooltipStyle} />
        <Funnel dataKey="value" data={data} isAnimationActive>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
          <LabelList
            position="right"
            fill="var(--color-foreground)"
            stroke="none"
            dataKey="name"
            style={{ fontSize: 12 }}
          />
          <LabelList
            position="center"
            fill="var(--color-primary-foreground)"
            stroke="none"
            dataKey="value"
            style={{ fontSize: 12, fontWeight: 600 }}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}

// Box-plot simulation as range bars per category.
export function BoxPlotSim({
  data,
}: {
  data: { name: string; min: number; q1: number; median: number; q3: number; max: number }[];
}) {
  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const span = Math.max(1, d.max - d.min);
        return (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <div className="w-24 truncate text-muted-foreground">{d.name}</div>
            <div className="relative h-4 flex-1 rounded bg-muted">
              <div
                className="absolute top-1/2 h-px bg-muted-foreground"
                style={{ left: `${((d.min - d.min) / span) * 100}%`, width: "100%" }}
              />
              <div
                className="absolute top-0 h-4 rounded"
                style={{
                  left: `${((d.q1 - d.min) / span) * 100}%`,
                  width: `${((d.q3 - d.q1) / span) * 100}%`,
                  background: CHART_COLORS[i % CHART_COLORS.length],
                  opacity: 0.6,
                }}
              />
              <div
                className="absolute top-0 h-4 w-0.5 bg-foreground"
                style={{ left: `${((d.median - d.min) / span) * 100}%` }}
              />
            </div>
            <div className="w-16 text-right text-muted-foreground">{d.median}d</div>
          </div>
        );
      })}
    </div>
  );
}