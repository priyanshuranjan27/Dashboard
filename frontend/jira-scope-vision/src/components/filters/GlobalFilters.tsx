import { useMemo } from "react";
import { useIssues } from "@/hooks/useIssues";
import { useFilters } from "@/context/FiltersContext";
import { uniqueValues } from "@/lib/jira/filterEngine";
import type { IssuePriority, IssueStatus, IssueType } from "@/lib/jira/types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

const STATUSES: IssueStatus[] = ["To Do", "In Progress", "In Review", "Blocked", "Done", "Cancelled"];
const PRIORITIES: IssuePriority[] = ["Critical", "High", "Medium", "Low"];
const TYPES: IssueType[] = ["Story", "Bug", "Task", "Epic", "Sub-task"];

function MultiPick<T extends string>({
  label,
  options,
  values,
  labels,
  onChange,
}: {
  label: string;
  options: readonly T[];
  values: T[];
  labels?: Record<string, string>;
  onChange: (v: T[]) => void;
}) {
  const toggle = (v: T) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          {label}
          {values.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {values.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="max-h-64 space-y-1 overflow-auto">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-accent"
            >
              <Checkbox checked={values.includes(opt)} onCheckedChange={() => toggle(opt)} />
              <span className="text-sm">{labels?.[opt] ?? opt}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function GlobalFilters() {
  const { all } = useIssues();
  const { filters, setFilters, reset } = useFilters();
  const opts = useMemo(() => uniqueValues(all), [all]);
  const assigneeOpts = useMemo(
    () => ["unassigned", ...opts.assignees.map((a) => a[0])],
    [opts.assignees],
  );
  const assigneeLabels = useMemo(() => {
    const map: Record<string, string> = { unassigned: "Unassigned" };
    opts.assignees.forEach(([id, name]) => (map[id] = name));
    return map;
  }, [opts.assignees]);
  const reporterLabels = useMemo(() => {
    const m: Record<string, string> = {};
    opts.reporters.forEach(([id, n]) => (m[id] = n));
    return m;
  }, [opts.reporters]);

  const activeCount =
    filters.statuses.length +
    filters.priorities.length +
    filters.types.length +
    filters.assignees.length +
    filters.reporters.length +
    filters.labels.length +
    filters.components.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        Filters
      </div>
      <Input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
        className="h-8 w-[140px]"
      />
      <span className="text-xs text-muted-foreground">→</span>
      <Input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
        className="h-8 w-[140px]"
      />
      <MultiPick
        label="Status"
        options={STATUSES}
        values={filters.statuses}
        onChange={(v) => setFilters({ ...filters, statuses: v })}
      />
      <MultiPick
        label="Priority"
        options={PRIORITIES}
        values={filters.priorities}
        onChange={(v) => setFilters({ ...filters, priorities: v })}
      />
      <MultiPick
        label="Type"
        options={TYPES}
        values={filters.types}
        onChange={(v) => setFilters({ ...filters, types: v })}
      />
      <MultiPick
        label="Assignee"
        options={assigneeOpts}
        values={filters.assignees}
        labels={assigneeLabels}
        onChange={(v) => setFilters({ ...filters, assignees: v })}
      />
      <MultiPick
        label="Reporter"
        options={opts.reporters.map((r) => r[0])}
        values={filters.reporters}
        labels={reporterLabels}
        onChange={(v) => setFilters({ ...filters, reporters: v })}
      />
      <MultiPick
        label="Labels"
        options={opts.labels}
        values={filters.labels}
        onChange={(v) => setFilters({ ...filters, labels: v })}
      />
      <MultiPick
        label="Components"
        options={opts.components}
        values={filters.components}
        onChange={(v) => setFilters({ ...filters, components: v })}
      />
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={reset}>
          <X className="h-3 w-3" /> Clear ({activeCount})
        </Button>
      )}
    </div>
  );
}