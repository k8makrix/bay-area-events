import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Simple API key protection
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.INGEST_API_KEY;

  if (apiKey && authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Dynamic import to avoid loading scraper deps on every request
  try {
    const { execSync } = await import("child_process");
    execSync("npx tsx src/lib/scrapers/ingest.ts", {
      cwd: process.cwd(),
      timeout: 300000, // 5 minutes
      stdio: "pipe",
    });

    return NextResponse.json({ status: "ok", message: "Ingestion completed" });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: (err as Error).message },
      { status: 500 }
    );
  }
}
