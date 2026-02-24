import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/sessions/log — Log field changes (batch)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, fields } = body;

    if (!sessionId || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { success: false, error: "sessionId and fields[] required" },
        { status: 400 }
      );
    }

    // Batch insert all field logs
    await prisma.formFieldLog.createMany({
      data: fields.map((f: { fieldName: string; fieldValue: string }) => ({
        sessionId,
        fieldName: f.fieldName,
        fieldValue: String(f.fieldValue),
      })),
    });

    // Update last activity
    await prisma.formSession.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging fields:", error);
    return NextResponse.json({ success: false, error: "Failed to log fields" }, { status: 500 });
  }
}
