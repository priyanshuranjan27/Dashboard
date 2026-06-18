import { useQuery } from "@tanstack/react-query";
import { fetchAllIssues, fetchProject } from "@/lib/jira/jiraService";
import { useFilters } from "@/context/FiltersContext";
import { applyFilters } from "@/lib/jira/filterEngine";
import { useMemo } from "react";

export function useIssues() {
  const { filters } = useFilters();
  const query = useQuery({
    queryKey: ["issues"],
    queryFn: fetchAllIssues,
    staleTime: 5 * 60_000,
  });
  const filtered = useMemo(
    () => (query.data ? applyFilters(query.data, filters) : []),
    [query.data, filters],
  );
  return { ...query, all: query.data ?? [], filtered };
}

export function useProject() {
  return useQuery({ queryKey: ["project"], queryFn: fetchProject, staleTime: Infinity });
}