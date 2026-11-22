import "server-only";

/**
 * When store data was last synced, for the "Store data last synced" line.
 *
 * Reads the most recent successful run of the pipeline repo's weekly OSM
 * sync workflow from the public GitHub API. Cached for 6 hours. Never throws:
 * any failure logs and returns `null`, and callers show a generic line.
 *
 * Unauthenticated GitHub API calls are limited to 60/hour per IP (shared on
 * Vercel), so an optional `GITHUB_TOKEN` is sent when set.
 */
const SYNC_RUNS_URL =
  "https://api.github.com/repos/SlightlyLostDave/indie-books-atlas-pipeline/actions/workflows/sync_osm.yml/runs?status=success&per_page=1";

const REVALIDATE_SECONDS = 60 * 60 * 6;

interface WorkflowRunsResponse {
  workflow_runs?: { updated_at?: string }[];
}

export async function getLastSyncedAt(): Promise<Date | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "indie-books-atlas",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(SYNC_RUNS_URL, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      console.error(`Failed to load last sync date: GitHub API ${res.status}`);
      return null;
    }

    const body = (await res.json()) as WorkflowRunsResponse;
    const finishedAt = body.workflow_runs?.[0]?.updated_at;
    if (!finishedAt) return null;

    const date = new Date(finishedAt);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch (err) {
    console.error("Failed to load last sync date:", err);
    return null;
  }
}
