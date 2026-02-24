-- CreateTable
CREATE TABLE "form_sessions" (
    "id" TEXT NOT NULL,
    "documentType" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "documentId" TEXT,
    "deviceInfo" JSONB,
    "userAgent" TEXT,
    "ipCountry" TEXT,
    "referralSource" TEXT,
    "pageUrl" TEXT,
    "formSnapshot" JSONB,

    CONSTRAINT "form_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_field_logs" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_field_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_sessions_documentType_idx" ON "form_sessions"("documentType");

-- CreateIndex
CREATE INDEX "form_sessions_startedAt_idx" ON "form_sessions"("startedAt");

-- CreateIndex
CREATE INDEX "form_sessions_completed_idx" ON "form_sessions"("completed");

-- CreateIndex
CREATE INDEX "form_field_logs_sessionId_idx" ON "form_field_logs"("sessionId");

-- CreateIndex
CREATE INDEX "form_field_logs_fieldName_idx" ON "form_field_logs"("fieldName");

-- CreateIndex
CREATE INDEX "form_field_logs_loggedAt_idx" ON "form_field_logs"("loggedAt");

-- AddForeignKey
ALTER TABLE "form_field_logs" ADD CONSTRAINT "form_field_logs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "form_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
