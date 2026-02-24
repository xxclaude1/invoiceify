import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/clients — Extract all unique recipient/client businesses from documents
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const documents = await prisma.document.findMany({
      select: {
        id: true,
        recipientInfo: true,
        senderInfo: true,
        currency: true,
        grandTotal: true,
        type: true,
        createdAt: true,
        ipCountry: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by recipient business name
    const clientMap = new Map<string, {
      businessName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      contactName: string;
      invoicedBy: Set<string>;
      documentCount: number;
      totalValue: number;
      currencies: Set<string>;
      documentTypes: Set<string>;
      firstSeen: Date;
      lastSeen: Date;
    }>();

    for (const doc of documents) {
      const recipient = doc.recipientInfo as Record<string, unknown> | null;
      const sender = doc.senderInfo as Record<string, unknown> | null;
      if (!recipient?.businessName) continue;
      const name = String(recipient.businessName);
      const existing = clientMap.get(name);
      const addr = recipient.address as Record<string, string> | null;
      const senderName = sender?.businessName ? String(sender.businessName) : "Unknown";

      if (existing) {
        existing.documentCount++;
        existing.totalValue += Number(doc.grandTotal);
        existing.currencies.add(doc.currency);
        existing.documentTypes.add(doc.type);
        existing.invoicedBy.add(senderName);
        if (doc.createdAt < existing.firstSeen) existing.firstSeen = doc.createdAt;
        if (doc.createdAt > existing.lastSeen) existing.lastSeen = doc.createdAt;
      } else {
        clientMap.set(name, {
          businessName: name,
          email: String(recipient.email ?? ""),
          phone: String(recipient.phone ?? ""),
          address: addr?.line1 ?? "",
          city: addr?.city ?? "",
          country: addr?.country ?? "",
          contactName: String(recipient.contactName ?? ""),
          invoicedBy: new Set([senderName]),
          documentCount: 1,
          totalValue: Number(doc.grandTotal),
          currencies: new Set([doc.currency]),
          documentTypes: new Set([doc.type]),
          firstSeen: doc.createdAt,
          lastSeen: doc.createdAt,
        });
      }
    }

    const clients = Array.from(clientMap.values()).map((c) => ({
      ...c,
      currencies: Array.from(c.currencies),
      documentTypes: Array.from(c.documentTypes),
      invoicedBy: Array.from(c.invoicedBy),
    }));

    return NextResponse.json({ success: true, data: clients, total: clients.length });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 });
  }
}
