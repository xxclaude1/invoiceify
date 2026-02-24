import { prisma } from "@/lib/db";
import AdminDocumentsClient from "@/components/admin/documents-client";

export default async function AdminDocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lineItems: true,
      events: true,
    },
  });

  // Serialize Decimal fields to numbers, Dates to strings, JsonValue to Record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serialized = documents.map((doc) => ({
    ...doc,
    senderInfo: (doc.senderInfo || {}) as Record<string, unknown>,
    recipientInfo: (doc.recipientInfo || {}) as Record<string, unknown>,
    extraFields: doc.extraFields as unknown,
    subtotal: Number(doc.subtotal),
    taxTotal: Number(doc.taxTotal),
    discountTotal: Number(doc.discountTotal),
    grandTotal: Number(doc.grandTotal),
    issueDate: doc.issueDate.toISOString(),
    dueDate: doc.dueDate?.toISOString() || null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    sentAt: doc.sentAt?.toISOString() || null,
    paidAt: doc.paidAt?.toISOString() || null,
    lineItems: doc.lineItems.map((li) => ({
      ...li,
      quantity: Number(li.quantity),
      unitPrice: Number(li.unitPrice),
      taxRate: li.taxRate ? Number(li.taxRate) : null,
      discount: li.discount ? Number(li.discount) : null,
      lineTotal: Number(li.lineTotal),
      createdAt: li.createdAt.toISOString(),
    })),
    events: doc.events.map((ev) => ({
      ...ev,
      eventDate: ev.eventDate.toISOString(),
    })),
  }));

  return <AdminDocumentsClient documents={serialized} />;
}
