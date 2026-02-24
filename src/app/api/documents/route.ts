import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/documents — Save a complete document to the database (raw, not anonymized)
export async function POST(request: NextRequest) {
  try {
    // Attach userId if user is logged in (guest users still allowed)
    const session = await auth();
    const userId = session?.user?.id || undefined;

    const body = await request.json();

    const {
      type,
      industryPreset,
      documentNumber,
      issueDate,
      dueDate,
      currency,
      senderInfo,
      recipientInfo,
      lineItems,
      notes,
      terms,
      templateId,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal,
      extraFields,
      senderSignature,
    } = body;

    // Capture metadata for data collection
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipCountry = request.headers.get("x-vercel-ip-country") ?? undefined;

    // Save the COMPLETE document — every field, nothing anonymized
    const document = await prisma.document.create({
      data: {
        userId,
        type,
        industryPreset: industryPreset || undefined,
        status: "draft",
        documentNumber,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        currency,
        senderInfo: {
          ...senderInfo,
        },
        recipientInfo,
        notes: notes || undefined,
        terms: terms || undefined,
        templateId: templateId || "classic",
        subtotal,
        taxTotal,
        discountTotal,
        grandTotal,
        extraFields: extraFields || undefined,
        userAgent,
        ipCountry,
        sessionId: crypto.randomUUID(),
        lineItems: {
          create: lineItems.map(
            (
              item: {
                description: string;
                quantity: number;
                unitPrice: number;
                taxRate?: number;
                discount?: number;
                lineTotal: number;
                extraFields?: Record<string, unknown>;
              },
              index: number
            ) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate ?? undefined,
              discount: item.discount ?? undefined,
              lineTotal: item.lineTotal,
              sortOrder: index,
              extraFields: item.extraFields || undefined,
            })
          ),
        },
        events: {
          create: {
            eventType: "created",
            metadata: {
              source: "wizard",
              userAgent,
              ipCountry,
              timestamp: new Date().toISOString(),
            },
          },
        },
      },
      include: {
        lineItems: true,
        events: true,
      },
    });

    return NextResponse.json(
      { success: true, data: document },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving document:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save document",
      },
      { status: 500 }
    );
  }
}

// GET /api/documents — List all documents (for admin panel later)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          lineItems: true,
          events: true,
        },
      }),
      prisma.document.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: documents,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch documents",
      },
      { status: 500 }
    );
  }
}
