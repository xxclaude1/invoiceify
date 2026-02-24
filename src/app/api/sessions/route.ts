import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/sessions — Create a new form session when user starts typing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, deviceInfo, referralSource, pageUrl } = body;

    const userAgent = request.headers.get("user-agent") ?? undefined;
    const ipCountry = request.headers.get("x-vercel-ip-country") ?? undefined;

    const session = await prisma.formSession.create({
      data: {
        documentType: documentType || undefined,
        deviceInfo: deviceInfo || undefined,
        userAgent,
        ipCountry,
        referralSource: referralSource || undefined,
        pageUrl: pageUrl || undefined,
      },
    });

    return NextResponse.json({ success: true, sessionId: session.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 });
  }
}

// PUT /api/sessions — Update session (activity, snapshot, completion)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, documentType, formSnapshot, completed, documentId } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "sessionId required" }, { status: 400 });
    }

    const data: Record<string, unknown> = {
      lastActivityAt: new Date(),
    };
    if (documentType) data.documentType = documentType;
    if (formSnapshot) data.formSnapshot = formSnapshot;
    if (completed) {
      data.completed = true;
      data.completedAt = new Date();
    }
    if (documentId) data.documentId = documentId;

    await prisma.formSession.update({
      where: { id: sessionId },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ success: false, error: "Failed to update session" }, { status: 500 });
  }
}

// DELETE /api/sessions — Delete a session permanently (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    }

    // fieldLogs cascade delete from schema, but be explicit
    await prisma.formFieldLog.deleteMany({ where: { sessionId: id } });
    await prisma.formSession.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ success: false, error: "Failed to delete session" }, { status: 500 });
  }
}
