-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('invoice', 'tax_invoice', 'proforma', 'receipt', 'sales_receipt', 'cash_receipt', 'quote', 'estimate', 'credit_note', 'purchase_order', 'delivery_note');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "IndustryPreset" AS ENUM ('freelance', 'contractor', 'consultant', 'hourly', 'service', 'sales', 'medical', 'photography', 'rental', 'repair', 'hotel', 'design', 'it_tech', 'artist', 'commercial');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('created', 'sent', 'viewed', 'paid', 'overdue_flagged', 'cancelled');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "businessName" TEXT,
    "businessAddress" JSONB,
    "businessLogoUrl" TEXT,
    "taxId" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "defaultPaymentTerms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clientId" TEXT,
    "type" "DocumentType" NOT NULL,
    "industryPreset" "IndustryPreset",
    "status" "DocumentStatus" NOT NULL DEFAULT 'draft',
    "documentNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "senderInfo" JSONB NOT NULL,
    "recipientInfo" JSONB NOT NULL,
    "notes" TEXT,
    "terms" TEXT,
    "templateId" TEXT NOT NULL DEFAULT 'classic',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pdfUrl" TEXT,
    "extraFields" JSONB,
    "userAgent" TEXT,
    "ipCountry" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_items" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2),
    "discount" DECIMAL(12,2),
    "lineTotal" DECIMAL(12,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "extraFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_events" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "document_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "documents_createdAt_idx" ON "documents"("createdAt");

-- CreateIndex
CREATE INDEX "documents_currency_idx" ON "documents"("currency");

-- CreateIndex
CREATE INDEX "documents_industryPreset_idx" ON "documents"("industryPreset");

-- CreateIndex
CREATE INDEX "documents_ipCountry_idx" ON "documents"("ipCountry");

-- CreateIndex
CREATE INDEX "line_items_documentId_idx" ON "line_items"("documentId");

-- CreateIndex
CREATE INDEX "document_events_documentId_idx" ON "document_events"("documentId");

-- CreateIndex
CREATE INDEX "document_events_eventType_idx" ON "document_events"("eventType");

-- CreateIndex
CREATE INDEX "document_events_eventDate_idx" ON "document_events"("eventDate");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_events" ADD CONSTRAINT "document_events_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
