-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "avgLineItemPrice" DECIMAL(12,2),
ADD COLUMN     "detectedIndustry" TEXT,
ADD COLUMN     "formSessionId" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "ipGeo" JSONB,
ADD COLUMN     "lineItemCount" INTEGER,
ADD COLUMN     "recipientEmailDomain" TEXT,
ADD COLUMN     "revenueRange" TEXT,
ADD COLUMN     "senderEmailDomain" TEXT;

-- AlterTable
ALTER TABLE "form_sessions" ADD COLUMN     "behavioral" JSONB,
ADD COLUMN     "clickMap" JSONB,
ADD COLUMN     "fingerprint" JSONB,
ADD COLUMN     "fingerprintHash" TEXT,
ADD COLUMN     "fullReferrer" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "ipGeo" JSONB,
ADD COLUMN     "isReturning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landingPage" TEXT,
ADD COLUMN     "mouseHeatmap" JSONB,
ADD COLUMN     "preferredLangs" TEXT,
ADD COLUMN     "searchQuery" TEXT,
ADD COLUMN     "socialPlatform" TEXT,
ADD COLUMN     "trafficSource" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "utmTerm" TEXT;

-- CreateIndex
CREATE INDEX "documents_senderEmailDomain_idx" ON "documents"("senderEmailDomain");

-- CreateIndex
CREATE INDEX "documents_detectedIndustry_idx" ON "documents"("detectedIndustry");

-- CreateIndex
CREATE INDEX "documents_revenueRange_idx" ON "documents"("revenueRange");

-- CreateIndex
CREATE INDEX "form_sessions_fingerprintHash_idx" ON "form_sessions"("fingerprintHash");

-- CreateIndex
CREATE INDEX "form_sessions_trafficSource_idx" ON "form_sessions"("trafficSource");

-- CreateIndex
CREATE INDEX "form_sessions_utmSource_idx" ON "form_sessions"("utmSource");

-- CreateIndex
CREATE INDEX "form_sessions_ipAddress_idx" ON "form_sessions"("ipAddress");

-- CreateIndex
CREATE INDEX "form_sessions_isReturning_idx" ON "form_sessions"("isReturning");
