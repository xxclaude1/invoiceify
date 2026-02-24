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

  // Fetch ALL form sessions so we can link them both ways:
  // 1. document.formSessionId -> session  (new documents)
  // 2. session.documentId -> document     (old documents)
  const allSessions = await prisma.formSession.findMany({
    include: { _count: { select: { fieldLogs: true } } },
  });

  // Build two lookup maps
  const sessionByIdMap = new Map(allSessions.map((s) => [s.id, s]));
  const sessionByDocIdMap = new Map(
    allSessions.filter((s) => s.documentId).map((s) => [s.documentId!, s])
  );

  const serializeSession = (session: typeof allSessions[number]) => ({
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
    mouseHeatmap: session.mouseHeatmap as unknown,
    clickMap: session.clickMap as unknown,
    fingerprint: session.fingerprint as Record<string, unknown> | null,
    preferredLangs: session.preferredLangs,
    fullReferrer: session.fullReferrer,
    landingPage: session.landingPage,
    searchQuery: session.searchQuery,
    socialPlatform: session.socialPlatform,
    fieldLogCount: session._count.fieldLogs,
    userAgent: session.userAgent,
    documentType: session.documentType,
  });

  // Serialize everything
  const serialized = documents.map((doc) => {
    // Try formSessionId first, then fall back to session.documentId lookup
    const rawSession = doc.formSessionId
      ? sessionByIdMap.get(doc.formSessionId)
      : sessionByDocIdMap.get(doc.id);

    const formSession = rawSession ? serializeSession(rawSession) : null;

    // Merge: use document's own IP data, fall back to session's IP data
    const effectiveIpAddress = doc.ipAddress || formSession?.ipAddress || null;
    const effectiveIpCountry = doc.ipCountry || formSession?.ipCountry || null;
    const effectiveIpGeo = (doc.ipGeo || formSession?.ipGeo || null) as Record<string, unknown> | null;
    const effectiveUserAgent = doc.userAgent || formSession?.userAgent || null;

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
      userAgent: effectiveUserAgent,
      ipCountry: effectiveIpCountry,
      sessionId: doc.sessionId,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      // Network - merged from doc + session
      ipAddress: effectiveIpAddress,
      ipGeo: effectiveIpGeo,
      // Business Intel
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
      // Linked form session — ALL data
      formSession,
    };
  });

  return <AdminDocumentsClient documents={serialized} />;
}
