import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/sessions — Fetch all form sessions with field logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const filter = searchParams.get("filter"); // "completed", "abandoned", "active"

    const where: Record<string, unknown> = {};
    if (filter === "completed") where.completed = true;
    else if (filter === "abandoned") {
      where.completed = false;
      where.lastActivityAt = { lt: new Date(Date.now() - 30 * 60 * 1000) }; // 30min idle = abandoned
    } else if (filter === "active") {
      where.completed = false;
      where.lastActivityAt = { gte: new Date(Date.now() - 30 * 60 * 1000) };
    }

    const [sessions, total] = await Promise.all([
      prisma.formSession.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { startedAt: "desc" },
        include: {
          fieldLogs: {
            orderBy: { loggedAt: "desc" },
            take: 50,
          },
          _count: { select: { fieldLogs: true } },
        },
      }),
      prisma.formSession.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: sessions, total, limit, offset });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch sessions" }, { status: 500 });
  }
}
