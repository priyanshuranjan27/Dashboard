import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { emptyFilters, type IssueFilters } from "@/lib/jira/types";

interface Ctx {
  filters: IssueFilters;
  setFilters: (f: IssueFilters) => void;
  reset: () => void;
}
const FiltersContext = createContext<Ctx | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<IssueFilters>(emptyFilters);
  const value = useMemo<Ctx>(
    () => ({ filters, setFilters, reset: () => setFilters(emptyFilters) }),
    [filters],
  );
  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used inside FiltersProvider");
  return ctx;
}