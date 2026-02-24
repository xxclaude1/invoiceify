import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/businesses — Extract all unique sender businesses from documents
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const documents = await prisma.document.findMany({
      select: {
        id: true,
        senderInfo: true,
        currency: true,
        grandTotal: true,
        type: true,
        createdAt: true,
        ipCountry: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by sender business name
    const businessMap = new Map<string, {
      businessName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      taxId: string;
      contactName: string;
      documentCount: number;
      totalValue: number;
      currencies: Set<string>;
      documentTypes: Set<string>;
      countries: Set<string>;
      firstSeen: Date;
      lastSeen: Date;
    }>();

    for (const doc of documents) {
      const sender = doc.senderInfo as Record<string, unknown> | null;
      if (!sender?.businessName) continue;
      const name = String(sender.businessName);
      const existing = businessMap.get(name);
      const addr = sender.address as Record<string, string> | null;

      if (existing) {
        existing.documentCount++;
        existing.totalValue += Number(doc.grandTotal);
        existing.currencies.add(doc.currency);
        existing.documentTypes.add(doc.type);
        if (doc.ipCountry) existing.countries.add(doc.ipCountry);
        if (doc.createdAt < existing.firstSeen) existing.firstSeen = doc.createdAt;
        if (doc.createdAt > existing.lastSeen) existing.lastSeen = doc.createdAt;
      } else {
        businessMap.set(name, {
          businessName: name,
          email: String(sender.email ?? ""),
          phone: String(sender.phone ?? ""),
          address: addr?.line1 ?? "",
          city: addr?.city ?? "",
          country: addr?.country ?? "",
          taxId: String(sender.taxId ?? ""),
          contactName: String(sender.contactName ?? ""),
          documentCount: 1,
          totalValue: Number(doc.grandTotal),
          currencies: new Set([doc.currency]),
          documentTypes: new Set([doc.type]),
          countries: doc.ipCountry ? new Set([doc.ipCountry]) : new Set(),
          firstSeen: doc.createdAt,
          lastSeen: doc.createdAt,
        });
      }
    }

    const businesses = Array.from(businessMap.values()).map((b) => ({
      ...b,
      currencies: Array.from(b.currencies),
      documentTypes: Array.from(b.documentTypes),
      countries: Array.from(b.countries),
    }));

    return NextResponse.json({ success: true, data: businesses, total: businesses.length });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch businesses" }, { status: 500 });
  }
}
