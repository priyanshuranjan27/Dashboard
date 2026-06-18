import { jiraConfig } from "./config";

export async function jiraFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${jiraConfig.backendBase}${normalizedPath}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Backend ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}