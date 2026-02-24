import { prisma } from "@/lib/db";
import AdminExportClient from "@/components/admin/export-client";

export default async function AdminExportPage() {
  const [documents, users] = await Promise.all([
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      include: { lineItems: true, events: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { documents: true, clients: true } },
        documents: { select: { grandTotal: true } },
      },
    }),
  ]);

  const serializedDocs = documents.map((doc) => ({
    id: doc.id,
    userId: doc.userId,
    type: doc.type,
    industryPreset: doc.industryPreset,
    status: doc.status,
    documentNumber: doc.documentNumber,
    issueDate: doc.issueDate.toISOString(),
    dueDate: doc.dueDate?.toISOString() || null,
    currency: doc.currency,
    senderInfo: doc.senderInfo as Record<string, unknown>,
    recipientInfo: doc.recipientInfo as Record<string, unknown>,
    notes: doc.notes,
    terms: doc.terms,
    templateId: doc.templateId,
    subtotal: Number(doc.subtotal),
    taxTotal: Number(doc.taxTotal),
    discountTotal: Number(doc.discountTotal),
    grandTotal: Number(doc.grandTotal),
    extraFields: doc.extraFields,
    userAgent: doc.userAgent,
    ipCountry: doc.ipCountry,
    sessionId: doc.sessionId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    lineItems: doc.lineItems.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: Number(li.quantity),
      unitPrice: Number(li.unitPrice),
      taxRate: li.taxRate ? Number(li.taxRate) : null,
      discount: li.discount ? Number(li.discount) : null,
      lineTotal: Number(li.lineTotal),
      sortOrder: li.sortOrder,
      extraFields: li.extraFields,
    })),
  }));

  const serializedUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider,
    role: user.role,
    businessName: user.businessName,
    taxId: user.taxId,
    defaultCurrency: user.defaultCurrency,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    totalDocuments: user._count.documents,
    totalClients: user._count.clients,
    totalInvoiced: user.documents.reduce((s, d) => s + Number(d.grandTotal), 0),
  }));

  const stats = {
    totalDocuments: documents.length,
    totalValue: documents.reduce((s, d) => s + Number(d.grandTotal), 0),
    totalUsers: users.length,
    guestDocuments: documents.filter((d) => !d.userId).length,
    userDocuments: documents.filter((d) => d.userId).length,
  };

  return (
    <AdminExportClient
      documents={serializedDocs}
      users={serializedUsers}
      stats={stats}
    />
  );
}
