export function Heatmap({
  rows,
  cols,
  grid,
}: {
  rows: string[];
  cols: string[];
  grid: Array<Record<string, string | number>>;
}) {
  const all: number[] = [];
  grid.forEach((r) => cols.forEach((c) => all.push(Number(r[c]) || 0)));
  const max = Math.max(1, ...all);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left text-muted-foreground"></th>
            {cols.map((c) => (
              <th key={c} className="px-2 py-1 text-left font-medium text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r}>
              <td className="whitespace-nowrap px-2 py-1 font-medium">{r}</td>
              {cols.map((c) => {
                const v = Number(grid[ri]?.[c] ?? 0);
                const alpha = v === 0 ? 0.06 : 0.15 + (v / max) * 0.7;
                return (
                  <td key={c} className="px-1 py-1">
                    <div
                      className="flex h-9 w-12 items-center justify-center rounded text-foreground"
                      style={{ background: `color-mix(in oklab, var(--color-chart-1) ${alpha * 100}%, transparent)` }}
                    >
                      {v || ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}