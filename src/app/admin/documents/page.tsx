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

  // Also fetch linked form sessions for documents that have formSessionId
  const sessionIds = documents
    .map((d) => d.formSessionId)
    .filter((id): id is string => !!id);

  const formSessions = sessionIds.length > 0
    ? await prisma.formSession.findMany({
        where: { id: { in: sessionIds } },
        include: { _count: { select: { fieldLogs: true } } },
      })
    : [];

  const sessionMap = new Map(formSessions.map((s) => [s.id, s]));

  // Serialize everything
  const serialized = documents.map((doc) => {
    const session = doc.formSessionId ? sessionMap.get(doc.formSessionId) : null;
    return {
      id: doc.id,
      userId: doc.userId,
      type: doc.type,
      industryPreset: doc.industryPreset,
      status: doc.status,
      documentNumber: doc.documentNumber,
      issueDate: doc.issueDate.toISOString(),
      dueDate: doc.dueDate?.toISOString() || null,
      currency: doc.currency,
      senderInfo: (doc.senderInfo || {}) as Record<string, unknown>,
      recipientInfo: (doc.recipientInfo || {}) as Record<string, unknown>,
      notes: doc.notes,
      terms: doc.terms,
      templateId: doc.templateId,
      subtotal: Number(doc.subtotal),
      taxTotal: Number(doc.taxTotal),
      discountTotal: Number(doc.discountTotal),
      grandTotal: Number(doc.grandTotal),
      extraFields: doc.extraFields as unknown,
      userAgent: doc.userAgent,
      ipCountry: doc.ipCountry,
      sessionId: doc.sessionId,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      // New data fields
      ipAddress: doc.ipAddress,
      ipGeo: (doc.ipGeo || null) as Record<string, unknown> | null,
      senderEmailDomain: doc.senderEmailDomain,
      recipientEmailDomain: doc.recipientEmailDomain,
      detectedIndustry: doc.detectedIndustry,
      revenueRange: doc.revenueRange,
      lineItemCount: doc.lineItemCount,
      avgLineItemPrice: doc.avgLineItemPrice ? Number(doc.avgLineItemPrice) : null,
      formSessionId: doc.formSessionId,
      lineItems: doc.lineItems.map((li) => ({
        id: li.id,
        description: li.description,
        quantity: Number(li.quantity),
        unitPrice: Number(li.unitPrice),
        taxRate: li.taxRate ? Number(li.taxRate) : null,
        discount: li.discount ? Number(li.discount) : null,
        lineTotal: Number(li.lineTotal),
        sortOrder: li.sortOrder,
        extraFields: li.extraFields as unknown,
        createdAt: li.createdAt.toISOString(),
      })),
      events: doc.events.map((ev) => ({
        id: ev.id,
        eventType: ev.eventType,
        eventDate: ev.eventDate.toISOString(),
        metadata: ev.metadata,
      })),
      // Linked form session data
      formSession: session ? {
        id: session.id,
        startedAt: session.startedAt.toISOString(),
        lastActivityAt: session.lastActivityAt.toISOString(),
        completed: session.completed,
        completedAt: session.completedAt?.toISOString() || null,
        deviceInfo: session.deviceInfo as Record<string, unknown> | null,
        ipAddress: session.ipAddress,
        ipGeo: (session.ipGeo || null) as Record<string, unknown> | null,
        ipCountry: session.ipCountry,
        referralSource: session.referralSource,
        pageUrl: session.pageUrl,
        fingerprintHash: session.fingerprintHash,
        isReturning: session.isReturning,
        trafficSource: session.trafficSource,
        utmSource: session.utmSource,
        utmMedium: session.utmMedium,
        utmCampaign: session.utmCampaign,
        utmTerm: session.utmTerm,
        utmContent: session.utmContent,
        behavioral: session.behavioral as Record<string, unknown> | null,
        fieldLogCount: session._count.fieldLogs,
      } : null,
    };
  });

  return <AdminDocumentsClient documents={serialized} />;
}
