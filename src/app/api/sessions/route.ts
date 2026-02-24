import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// POST /api/sessions — Create a new form session when user starts typing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentType, deviceInfo, referralSource, pageUrl,
      fingerprint, fingerprintHash, preferredLangs,
      fullReferrer, utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
      landingPage, searchQuery, trafficSource, socialPlatform,
    } = body;

    const userAgent = request.headers.get("user-agent") ?? undefined;
    const ipCountry = request.headers.get("x-vercel-ip-country") ?? undefined;

    // Extract IP address from x-forwarded-for header
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? undefined;

    // IP Geolocation via ip-api.com (free, 45 req/min)
    let ipGeo: Record<string, unknown> | undefined;
    if (ipAddress && ipAddress !== "127.0.0.1" && ipAddress !== "::1") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,zip,lat,lon,isp,org,as,timezone`, {
          signal: AbortSignal.timeout(3000),
        });
        const geoData = await geoRes.json();
        if (geoData.status === "success") {
          ipGeo = {
            country: geoData.country,
            region: geoData.regionName,
            city: geoData.city,
            postal: geoData.zip,
            lat: geoData.lat,
            lng: geoData.lon,
            isp: geoData.isp,
            org: geoData.org,
            as: geoData.as,
            timezone: geoData.timezone,
          };
        }
      } catch {
        // Geolocation failed — non-critical, continue
      }
    }

    // Check if returning visitor by fingerprint hash
    let isReturning = false;
    if (fingerprintHash) {
      const existing = await prisma.formSession.findFirst({
        where: { fingerprintHash },
        select: { id: true },
      });
      isReturning = !!existing;
    }

    const session = await prisma.formSession.create({
      data: {
        documentType: documentType || undefined,
        deviceInfo: deviceInfo || undefined,
        userAgent,
        ipCountry: ipGeo?.country ? String(ipGeo.country) : ipCountry,
        referralSource: referralSource || undefined,
        pageUrl: pageUrl || undefined,
        ipAddress,
        ipGeo: (ipGeo as Prisma.InputJsonValue) || undefined,
        preferredLangs: preferredLangs || undefined,
        fingerprint: fingerprint || undefined,
        fingerprintHash: fingerprintHash || undefined,
        fullReferrer: fullReferrer || undefined,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        utmTerm: utmTerm || undefined,
        utmContent: utmContent || undefined,
        landingPage: landingPage || undefined,
        searchQuery: searchQuery || undefined,
        trafficSource: trafficSource || undefined,
        socialPlatform: socialPlatform || undefined,
        isReturning,
      },
    });

    return NextResponse.json({ success: true, sessionId: session.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 });
  }
}

// PUT /api/sessions — Update session (activity, snapshot, completion, behavioral)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, documentType, formSnapshot, completed, documentId, behavioral, mouseHeatmap, clickMap } = body;

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
    if (behavioral) data.behavioral = behavioral;
    if (mouseHeatmap) data.mouseHeatmap = mouseHeatmap;
    if (clickMap) data.clickMap = clickMap;

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
