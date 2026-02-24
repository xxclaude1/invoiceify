import { prisma } from "@/lib/db";
import AdminExportClient from "@/components/admin/export-client";

export default async function AdminExportPage() {
  const [documents, users, sessions, totalFieldLogs] = await Promise.all([
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
    prisma.formSession.findMany({
      orderBy: { startedAt: "desc" },
      include: {
        _count: { select: { fieldLogs: true } },
      },
    }),
    prisma.formFieldLog.count(),
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
    // New fields
    ipAddress: doc.ipAddress,
    senderEmailDomain: doc.senderEmailDomain,
    recipientEmailDomain: doc.recipientEmailDomain,
    detectedIndustry: doc.detectedIndustry,
    revenueRange: doc.revenueRange,
    lineItemCount: doc.lineItemCount,
    avgLineItemPrice: doc.avgLineItemPrice ? Number(doc.avgLineItemPrice) : null,
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

  const serializedSessions = sessions.map((s) => ({
    id: s.id,
    documentType: s.documentType,
    startedAt: s.startedAt.toISOString(),
    lastActivityAt: s.lastActivityAt.toISOString(),
    completed: s.completed,
    completedAt: s.completedAt?.toISOString() || null,
    documentId: s.documentId,
    deviceInfo: s.deviceInfo as Record<string, unknown> | null,
    ipCountry: s.ipCountry,
    referralSource: s.referralSource,
    pageUrl: s.pageUrl,
    fieldLogCount: s._count.fieldLogs,
    // New fields
    ipAddress: s.ipAddress,
    ipGeo: s.ipGeo as Record<string, unknown> | null,
    fingerprintHash: s.fingerprintHash,
    isReturning: s.isReturning,
    trafficSource: s.trafficSource,
    utmSource: s.utmSource,
    utmMedium: s.utmMedium,
    utmCampaign: s.utmCampaign,
    utmTerm: s.utmTerm,
    utmContent: s.utmContent,
    behavioral: s.behavioral as Record<string, unknown> | null,
  }));

  const stats = {
    totalDocuments: documents.length,
    totalValue: documents.reduce((s, d) => s + Number(d.grandTotal), 0),
    totalUsers: users.length,
    guestDocuments: documents.filter((d) => !d.userId).length,
    userDocuments: documents.filter((d) => d.userId).length,
    totalSessions: sessions.length,
    completedSessions: sessions.filter((s) => s.completed).length,
    totalFieldLogs,
  };

  return (
    <AdminExportClient
      documents={serializedDocs}
      users={serializedUsers}
      sessions={serializedSessions}
      stats={stats}
    />
  );
}
