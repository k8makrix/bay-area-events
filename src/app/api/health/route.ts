import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [eventCount, lastIngestion] = await Promise.all([
    prisma.event.count(),
    prisma.ingestionLog.findFirst({
      where: { status: "success" },
      orderBy: { ranAt: "desc" },
    }),
  ]);

  const lastRan = lastIngestion?.ranAt;
  const staleThresholdMs = 24 * 60 * 60 * 1000; // 24 hours
  const isStale = !lastRan || Date.now() - lastRan.getTime() > staleThresholdMs;

  return NextResponse.json({
    status: isStale ? "stale" : "ok",
    eventCount,
    lastIngestion: lastRan?.toISOString() || null,
    isStale,
  });
}
