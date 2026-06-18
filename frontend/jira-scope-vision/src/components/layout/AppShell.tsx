import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, GitBranch, Users, Sparkles, Moon, Sun, RefreshCw } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { GlobalFilters } from "@/components/filters/GlobalFilters";
import { useProject } from "@/hooks/useIssues";

const NAV = [
  { to: "/", label: "Executive Overview", icon: LayoutDashboard },
  { to: "/flow", label: "Issue Flow", icon: GitBranch },
  { to: "/team", label: "Team & Ownership", icon: Users },
  { to: "/insights", label: "Deep Insights", icon: Sparkles },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const project = useProject();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar p-4 md:flex">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-chart-1 to-chart-4 text-sm font-bold text-primary-foreground">
            J
          </div>
          <div>
            <div className="text-sm font-semibold text-sidebar-foreground">Jira Analytics</div>
            <div className="text-xs text-muted-foreground">{project.data?.name ?? "Loading…"}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto text-xs text-muted-foreground">
          <div className="rounded-md border border-border bg-card/50 p-3">
            <div className="mb-1 font-medium text-foreground">Project</div>
            <div>{project.data?.key ?? "—"}</div>
            <div className="mt-2 text-[11px] opacity-70">
              Replace dummy values in <code>src/lib/jira/config.ts</code> to connect live data.
            </div>
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
            <div className="flex items-center gap-2 md:hidden">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-md px-2 py-1 text-xs hover:bg-accent"
                  activeProps={{ className: "rounded-md px-2 py-1 text-xs bg-accent font-medium" }}
                >
                  {n.label.split(" ")[0]}
                </Link>
              ))}
            </div>
            <div className="hidden text-sm font-medium md:block">
              {NAV.find((n) => n.to === pathname)?.label ?? "Dashboard"}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => location.reload()} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggle} title="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="border-t border-border px-4 py-3 md:px-8">
            <GlobalFilters />
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}