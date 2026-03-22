import { NextRequest, NextResponse } from "next/server";
import { VALID_SOURCES } from "./[source]/route";

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");

  // Check INGEST_API_KEY (manual triggers)
  const apiKey = process.env.INGEST_API_KEY;
  if (apiKey && authHeader === `Bearer ${apiKey}`) return true;

  // Check CRON_SECRET (Vercel Cron triggers)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  // Allow if neither key is configured (dev mode)
  if (!apiKey && !cronSecret) return true;

  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const apiKey = process.env.INGEST_API_KEY;
  const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  // Fan out: fire all per-source endpoints in parallel
  const results = await Promise.allSettled(
    VALID_SOURCES.map(async (source) => {
      const res = await fetch(`${baseUrl}/api/ingest/${source}`, { headers });
      const data = await res.json();
      return { source, status: res.status, ...data };
    })
  );

  const summary = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { source: VALID_SOURCES[i], status: "error", message: r.reason?.message };
  });

  const succeeded = summary.filter((s) => s.status === "ok" || s.status === 200).length;

  return NextResponse.json({
    status: "ok",
    sources: VALID_SOURCES.length,
    succeeded,
    failed: VALID_SOURCES.length - succeeded,
    results: summary,
  });
}

// Also support POST for backwards compat
export const POST = GET;
