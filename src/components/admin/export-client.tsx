"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number | null;
  discount: number | null;
  lineTotal: number;
  sortOrder: number;
  extraFields: unknown;
}

interface Doc {
  id: string;
  userId: string | null;
  type: string;
  industryPreset: string | null;
  status: string;
  documentNumber: string;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  senderInfo: Record<string, unknown>;
  recipientInfo: Record<string, unknown>;
  notes: string | null;
  terms: string | null;
  templateId: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  extraFields: unknown;
  userAgent: string | null;
  ipCountry: string | null;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  senderEmailDomain: string | null;
  recipientEmailDomain: string | null;
  detectedIndustry: string | null;
  revenueRange: string | null;
  lineItemCount: number | null;
  avgLineItemPrice: number | null;
  lineItems: LineItem[];
}

interface User {
  id: string;
  email: string;
  name: string | null;
  provider: string;
  role: string;
  businessName: string | null;
  taxId: string | null;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
  totalDocuments: number;
  totalClients: number;
  totalInvoiced: number;
}

interface Session {
  id: string;
  documentType: string | null;
  startedAt: string;
  lastActivityAt: string;
  completed: boolean;
  completedAt: string | null;
  documentId: string | null;
  deviceInfo: Record<string, unknown> | null;
  ipCountry: string | null;
  referralSource: string | null;
  pageUrl: string | null;
  fieldLogCount: number;
  ipAddress: string | null;
  ipGeo: Record<string, unknown> | null;
  fingerprintHash: string | null;
  isReturning: boolean;
  trafficSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  behavioral: Record<string, unknown> | null;
}

interface Stats {
  totalDocuments: number;
  totalValue: number;
  totalUsers: number;
  guestDocuments: number;
  userDocuments: number;
  totalSessions: number;
  completedSessions: number;
  totalFieldLogs: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminExportClient({
  documents,
  users,
  sessions,
  stats,
}: {
  documents: Doc[];
  users: User[];
  sessions: Session[];
  stats: Stats;
}) {
  const exportFullJSON = () => {
    const report = {
      exportedAt: new Date().toISOString(),
      platform: "Invoiceify",
      summary: {
        totalDocumentsCreated: stats.totalDocuments,
        totalValueInvoiced: stats.totalValue,
        totalRegisteredUsers: stats.totalUsers,
        guestDocuments: stats.guestDocuments,
        userDocuments: stats.userDocuments,
        averageDocumentValue: stats.totalDocuments > 0 ? stats.totalValue / stats.totalDocuments : 0,
      },
      users,
      documents,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    downloadBlob(blob, `invoiceify-full-export-${new Date().toISOString().split("T")[0]}.json`);
  };

  const exportDocumentsCSV = () => {
    const headers = [
      "Document ID", "Document Number", "Type", "Status", "Currency",
      "Subtotal", "Tax", "Discount", "Grand Total",
      "Issue Date", "Due Date",
      "Sender Business", "Sender Email", "Sender Phone", "Sender Address",
      "Sender Tax ID",
      "Recipient Business", "Recipient Email", "Recipient Phone", "Recipient Address",
      "Line Items Count", "Line Items Detail",
      "Notes", "Terms",
      "Template", "Industry Preset",
      "User ID", "Guest or User",
      "IP Country", "IP Address",
      "Detected Industry", "Revenue Range",
      "Sender Email Domain", "Recipient Email Domain",
      "Avg Line Item Price",
      "User Agent", "Session ID",
      "Created At",
    ];

    const rows = documents.map((doc) => {
      const s = doc.senderInfo as Record<string, string>;
      const r = doc.recipientInfo as Record<string, string>;
      const sAddr = (doc.senderInfo as Record<string, Record<string, string>>)?.address || {};
      const rAddr = (doc.recipientInfo as Record<string, Record<string, string>>)?.address || {};

      const lineDetail = doc.lineItems
        .map((li) => `${li.description} (qty:${li.quantity} x $${li.unitPrice} = $${li.lineTotal})`)
        .join(" | ");

      return [
        doc.id, doc.documentNumber, doc.type, doc.status, doc.currency,
        doc.subtotal, doc.taxTotal, doc.discountTotal, doc.grandTotal,
        doc.issueDate, doc.dueDate || "",
        s?.businessName || "", s?.email || "", s?.phone || "",
        [sAddr?.line1, sAddr?.city, sAddr?.state, sAddr?.postalCode, sAddr?.country].filter(Boolean).join(", "),
        s?.taxId || "",
        r?.businessName || "", r?.email || "", r?.phone || "",
        [rAddr?.line1, rAddr?.city, rAddr?.state, rAddr?.postalCode, rAddr?.country].filter(Boolean).join(", "),
        doc.lineItems.length, lineDetail,
        doc.notes || "", doc.terms || "",
        doc.templateId, doc.industryPreset || "",
        doc.userId || "", doc.userId ? "User" : "Guest",
        doc.ipCountry || "", doc.ipAddress || "",
        doc.detectedIndustry || "", doc.revenueRange || "",
        doc.senderEmailDomain || "", doc.recipientEmailDomain || "",
        doc.avgLineItemPrice ?? "",
        doc.userAgent || "", doc.sessionId || "",
        doc.createdAt,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-documents-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const exportUsersCSV = () => {
    const headers = [
      "User ID", "Email", "Name", "Provider", "Role",
      "Business Name", "Tax ID", "Default Currency",
      "Total Documents", "Total Clients", "Total Invoiced",
      "Signed Up At", "Last Updated",
    ];

    const rows = users.map((u) => [
      u.id, u.email, u.name || "", u.provider, u.role,
      u.businessName || "", u.taxId || "", u.defaultCurrency,
      u.totalDocuments, u.totalClients, u.totalInvoiced,
      u.createdAt, u.updatedAt,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-users-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const exportCombinedReport = () => {
    let report = `INVOICEIFY — COMPLETE DATA EXPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `${"=".repeat(60)}\n\n`;

    report += `PLATFORM SUMMARY\n`;
    report += `${"-".repeat(40)}\n`;
    report += `Total Documents Created: ${stats.totalDocuments}\n`;
    report += `Total Value Invoiced:    ${formatCurrency(stats.totalValue)}\n`;
    report += `Average Document Value:  ${formatCurrency(stats.totalDocuments > 0 ? stats.totalValue / stats.totalDocuments : 0)}\n`;
    report += `Registered Users:        ${stats.totalUsers}\n`;
    report += `Guest Documents:         ${stats.guestDocuments}\n`;
    report += `User Documents:          ${stats.userDocuments}\n\n`;

    report += `${"=".repeat(60)}\n`;
    report += `ALL REGISTERED USERS (${users.length})\n`;
    report += `${"=".repeat(60)}\n\n`;

    users.forEach((u, i) => {
      report += `User #${i + 1}\n`;
      report += `  ID:              ${u.id}\n`;
      report += `  Email:           ${u.email}\n`;
      report += `  Name:            ${u.name || "N/A"}\n`;
      report += `  Provider:        ${u.provider}\n`;
      report += `  Role:            ${u.role}\n`;
      report += `  Business:        ${u.businessName || "N/A"}\n`;
      report += `  Tax ID:          ${u.taxId || "N/A"}\n`;
      report += `  Currency:        ${u.defaultCurrency}\n`;
      report += `  Documents:       ${u.totalDocuments}\n`;
      report += `  Clients Saved:   ${u.totalClients}\n`;
      report += `  Total Invoiced:  ${formatCurrency(u.totalInvoiced)}\n`;
      report += `  Signed Up:       ${new Date(u.createdAt).toLocaleString()}\n\n`;
    });

    report += `${"=".repeat(60)}\n`;
    report += `ALL DOCUMENTS (${documents.length})\n`;
    report += `${"=".repeat(60)}\n\n`;

    documents.forEach((doc, i) => {
      const s = doc.senderInfo as Record<string, string>;
      const r = doc.recipientInfo as Record<string, string>;

      report += `${"─".repeat(50)}\n`;
      report += `Document #${i + 1}: ${doc.documentNumber}\n`;
      report += `${"─".repeat(50)}\n`;
      report += `  ID:              ${doc.id}\n`;
      report += `  Type:            ${doc.type}\n`;
      report += `  Status:          ${doc.status}\n`;
      report += `  Template:        ${doc.templateId}\n`;
      report += `  Industry:        ${doc.industryPreset || "N/A"}\n`;
      report += `  Currency:        ${doc.currency}\n`;
      report += `  Issue Date:      ${doc.issueDate}\n`;
      report += `  Due Date:        ${doc.dueDate || "N/A"}\n`;
      report += `  Created:         ${new Date(doc.createdAt).toLocaleString()}\n`;
      report += `  Source:          ${doc.userId ? "Logged-in User" : "Guest"}\n`;
      report += `  User ID:         ${doc.userId || "N/A"}\n`;
      report += `  IP Country:      ${doc.ipCountry || "N/A"}\n`;
      report += `  IP Address:      ${doc.ipAddress || "N/A"}\n`;
      report += `  Detected Industry: ${doc.detectedIndustry || "N/A"}\n`;
      report += `  Revenue Range:   ${doc.revenueRange || "N/A"}\n`;
      report += `  Sender Domain:   ${doc.senderEmailDomain || "N/A"}\n`;
      report += `  Recipient Domain: ${doc.recipientEmailDomain || "N/A"}\n`;
      report += `  Avg Item Price:  ${doc.avgLineItemPrice != null ? `$${doc.avgLineItemPrice.toFixed(2)}` : "N/A"}\n`;
      report += `  Session:         ${doc.sessionId || "N/A"}\n\n`;

      report += `  SENDER:\n`;
      report += `    Business:      ${s?.businessName || "N/A"}\n`;
      report += `    Email:         ${s?.email || "N/A"}\n`;
      report += `    Phone:         ${s?.phone || "N/A"}\n`;
      report += `    Tax ID:        ${s?.taxId || "N/A"}\n\n`;

      report += `  RECIPIENT:\n`;
      report += `    Business:      ${r?.businessName || "N/A"}\n`;
      report += `    Contact:       ${r?.contactName || "N/A"}\n`;
      report += `    Email:         ${r?.email || "N/A"}\n`;
      report += `    Phone:         ${r?.phone || "N/A"}\n\n`;

      report += `  LINE ITEMS (${doc.lineItems.length}):\n`;
      doc.lineItems.forEach((li, j) => {
        report += `    ${j + 1}. ${li.description}\n`;
        report += `       Qty: ${li.quantity}  |  Unit Price: $${li.unitPrice.toFixed(2)}  |  Tax: ${li.taxRate ?? 0}%  |  Total: $${li.lineTotal.toFixed(2)}\n`;
      });

      report += `\n  TOTALS:\n`;
      report += `    Subtotal:      ${doc.currency} ${doc.subtotal.toFixed(2)}\n`;
      report += `    Tax:           ${doc.currency} ${doc.taxTotal.toFixed(2)}\n`;
      report += `    Discount:      ${doc.currency} ${doc.discountTotal.toFixed(2)}\n`;
      report += `    GRAND TOTAL:   ${doc.currency} ${doc.grandTotal.toFixed(2)}\n`;

      if (doc.notes) report += `\n  Notes: ${doc.notes}\n`;
      if (doc.terms) report += `  Terms: ${doc.terms}\n`;
      report += `\n  User Agent: ${doc.userAgent || "N/A"}\n\n`;
    });

    const blob = new Blob([report], { type: "text/plain" });
    downloadBlob(blob, `invoiceify-complete-report-${new Date().toISOString().split("T")[0]}.txt`);
  };

  const exportBusinessContactsCSV = () => {
    const businessMap = new Map<string, Record<string, string>>();
    for (const doc of documents) {
      const s = doc.senderInfo as Record<string, unknown>;
      if (!s?.businessName) continue;
      const name = String(s.businessName);
      if (businessMap.has(name)) continue;
      const addr = (s.address as Record<string, string>) || {};
      businessMap.set(name, {
        businessName: name,
        contactName: String(s.contactName ?? ""),
        email: String(s.email ?? ""),
        phone: String(s.phone ?? ""),
        address: [addr.line1, addr.city, addr.postalCode, addr.country].filter(Boolean).join(", "),
        taxId: String(s.taxId ?? ""),
      });
    }
    const headers = ["Business Name", "Contact Name", "Email", "Phone", "Address", "Tax ID"];
    const rows = Array.from(businessMap.values()).map((b) =>
      [b.businessName, b.contactName, b.email, b.phone, b.address, b.taxId]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-business-contacts-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const exportClientContactsCSV = () => {
    const clientMap = new Map<string, Record<string, string>>();
    for (const doc of documents) {
      const r = doc.recipientInfo as Record<string, unknown>;
      if (!r?.businessName) continue;
      const name = String(r.businessName);
      if (clientMap.has(name)) continue;
      const addr = (r.address as Record<string, string>) || {};
      clientMap.set(name, {
        businessName: name,
        contactName: String(r.contactName ?? ""),
        email: String(r.email ?? ""),
        phone: String(r.phone ?? ""),
        address: [addr.line1, addr.city, addr.postalCode, addr.country].filter(Boolean).join(", "),
      });
    }
    const headers = ["Client Name", "Contact Name", "Email", "Phone", "Address"];
    const rows = Array.from(clientMap.values()).map((c) =>
      [c.businessName, c.contactName, c.email, c.phone, c.address]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-client-contacts-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const exportLineItemsCSV = () => {
    const headers = [
      "Document Number", "Document Type", "Currency",
      "Description", "Quantity", "Unit Price", "Tax Rate %", "Discount", "Line Total",
      "Sender Business", "Created At",
    ];
    const rows: string[] = [];
    for (const doc of documents) {
      const s = doc.senderInfo as Record<string, string>;
      for (const li of doc.lineItems) {
        rows.push(
          [
            doc.documentNumber, doc.type, doc.currency,
            li.description, li.quantity, li.unitPrice, li.taxRate ?? 0, li.discount ?? 0, li.lineTotal,
            s?.businessName || "", doc.createdAt,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );
      }
    }
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-line-items-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const exportSessionsCSV = () => {
    const headers = [
      "Session ID", "Document Type", "Started At", "Last Activity", "Duration (s)",
      "Completed", "Completed At", "Document ID",
      "Field Changes", "IP Country", "IP Address",
      "Geo Country", "Geo Region", "Geo City", "Geo ISP", "Geo Org", "Geo Timezone",
      "Referral Source", "Page URL",
      "Traffic Source", "UTM Source", "UTM Medium", "UTM Campaign", "UTM Term", "UTM Content",
      "Returning Visitor", "Fingerprint Hash",
      "Device Mobile", "Screen Width", "Screen Height", "Language",
    ];
    const rows = sessions.map((s) => {
      const duration = Math.floor(
        (new Date(s.completedAt || s.lastActivityAt).getTime() - new Date(s.startedAt).getTime()) / 1000
      );
      const d = (s.deviceInfo || {}) as Record<string, unknown>;
      const g = (s.ipGeo || {}) as Record<string, string>;
      return [
        s.id, s.documentType || "", s.startedAt, s.lastActivityAt, duration,
        s.completed ? "Yes" : "No", s.completedAt || "", s.documentId || "",
        s.fieldLogCount, s.ipCountry || "", s.ipAddress || "",
        g?.country || "", g?.region || "", g?.city || "",
        g?.isp || "", g?.org || "", g?.timezone || "",
        s.referralSource || "", s.pageUrl || "",
        s.trafficSource || "", s.utmSource || "", s.utmMedium || "",
        s.utmCampaign || "", s.utmTerm || "", s.utmContent || "",
        s.isReturning ? "Yes" : "No", s.fingerprintHash || "",
        d.mobile ? "Yes" : "No",
        String(d.screenWidth ?? ""),
        String(d.screenHeight ?? ""),
        String(d.language ?? ""),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-sessions-${new Date().toISOString().split("T")[0]}.csv`);
  };

  // XLSX Full Workbook Export
  const exportFullXLSX = () => {
    const wb = XLSX.utils.book_new();

    // Documents sheet — ALL fields
    const docRows = documents.map((doc) => {
      const s = doc.senderInfo as Record<string, string>;
      const r = doc.recipientInfo as Record<string, string>;
      const sAddr = (doc.senderInfo as Record<string, Record<string, string>>)?.address || {};
      const rAddr = (doc.recipientInfo as Record<string, Record<string, string>>)?.address || {};
      return {
        "ID": doc.id,
        "Doc Number": doc.documentNumber, Type: doc.type, Status: doc.status,
        Currency: doc.currency, Subtotal: doc.subtotal, Tax: doc.taxTotal,
        Discount: doc.discountTotal, "Grand Total": doc.grandTotal,
        "Issue Date": doc.issueDate, "Due Date": doc.dueDate || "",
        "Sender Business": s?.businessName || "", "Sender Email": s?.email || "",
        "Sender Phone": s?.phone || "", "Sender Tax ID": s?.taxId || "",
        "Sender Address": [sAddr?.line1, sAddr?.city, sAddr?.postalCode, sAddr?.country].filter(Boolean).join(", "),
        "Recipient Business": r?.businessName || "", "Recipient Email": r?.email || "",
        "Recipient Phone": r?.phone || "",
        "Recipient Address": [rAddr?.line1, rAddr?.city, rAddr?.postalCode, rAddr?.country].filter(Boolean).join(", "),
        "Line Items": doc.lineItemCount || doc.lineItems.length,
        "Line Items Detail": doc.lineItems.map((li) => `${li.description} (${li.quantity}x$${li.unitPrice}=$${li.lineTotal})`).join(" | "),
        "Avg Item Price": doc.avgLineItemPrice ?? "",
        Notes: doc.notes || "", Terms: doc.terms || "",
        Template: doc.templateId, "Industry Preset": doc.industryPreset || "",
        "Detected Industry": doc.detectedIndustry || "", "Revenue Range": doc.revenueRange || "",
        "Sender Domain": doc.senderEmailDomain || "", "Recipient Domain": doc.recipientEmailDomain || "",
        "Country": doc.ipCountry || "", "IP Address": doc.ipAddress || "",
        "User Agent": doc.userAgent || "",
        "User ID": doc.userId || "", "Guest/User": doc.userId ? "User" : "Guest",
        "Session ID": doc.sessionId || "",
        "Created": doc.createdAt,
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(docRows), "Documents");

    // Users sheet
    const userRows = users.map((u) => ({
      Email: u.email, Name: u.name || "", Provider: u.provider, Role: u.role,
      Business: u.businessName || "", "Tax ID": u.taxId || "", Currency: u.defaultCurrency,
      Documents: u.totalDocuments, Clients: u.totalClients, "Total Invoiced": u.totalInvoiced,
      "Signed Up": u.createdAt,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(userRows), "Users");

    // Sessions sheet — ALL fields
    const sessRows = sessions.map((s) => {
      const duration = Math.floor(
        (new Date(s.completedAt || s.lastActivityAt).getTime() - new Date(s.startedAt).getTime()) / 1000
      );
      const g = (s.ipGeo || {}) as Record<string, string>;
      const d = (s.deviceInfo || {}) as Record<string, unknown>;
      return {
        ID: s.id, Type: s.documentType || "", Started: s.startedAt,
        "Last Activity": s.lastActivityAt, "Duration (s)": duration,
        Completed: s.completed ? "Yes" : "No", "Completed At": s.completedAt || "",
        "Document ID": s.documentId || "",
        "Field Changes": s.fieldLogCount,
        Returning: s.isReturning ? "Yes" : "No",
        "Fingerprint Hash": s.fingerprintHash || "",
        "Traffic Source": s.trafficSource || "",
        "UTM Source": s.utmSource || "", "UTM Medium": s.utmMedium || "",
        "UTM Campaign": s.utmCampaign || "", "UTM Term": s.utmTerm || "", "UTM Content": s.utmContent || "",
        "Referral": s.referralSource || "", "Page URL": s.pageUrl || "",
        Country: s.ipCountry || "", "IP Address": s.ipAddress || "",
        "Geo Country": g?.country || "", "Geo Region": g?.region || "",
        "Geo City": g?.city || "", "Geo ISP": g?.isp || "",
        "Geo Org": g?.org || "", "Geo Timezone": g?.timezone || "",
        "Device Mobile": d.mobile ? "Yes" : "No",
        "Screen": d.screenWidth ? `${d.screenWidth}x${d.screenHeight}` : "",
        "Language": String(d.language ?? ""),
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sessRows), "Sessions");

    // Line Items sheet
    const liRows: Record<string, unknown>[] = [];
    for (const doc of documents) {
      const s = doc.senderInfo as Record<string, string>;
      for (const li of doc.lineItems) {
        liRows.push({
          "Doc Number": doc.documentNumber, Type: doc.type, Currency: doc.currency,
          Description: li.description, Qty: li.quantity, "Unit Price": li.unitPrice,
          "Tax %": li.taxRate ?? 0, Discount: li.discount ?? 0, "Line Total": li.lineTotal,
          "Sender": s?.businessName || "", Created: doc.createdAt,
        });
      }
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(liRows), "Line Items");

    // Business Contacts sheet
    const bizMap = new Map<string, Record<string, string>>();
    for (const doc of documents) {
      const s = doc.senderInfo as Record<string, unknown>;
      if (!s?.businessName) continue;
      const name = String(s.businessName);
      if (bizMap.has(name)) continue;
      bizMap.set(name, { Business: name, Email: String(s.email ?? ""), Phone: String(s.phone ?? ""), "Tax ID": String(s.taxId ?? "") });
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(Array.from(bizMap.values())), "Businesses");

    // Client Contacts sheet
    const cliMap = new Map<string, Record<string, string>>();
    for (const doc of documents) {
      const r = doc.recipientInfo as Record<string, unknown>;
      if (!r?.businessName) continue;
      const name = String(r.businessName);
      if (cliMap.has(name)) continue;
      cliMap.set(name, { Client: name, Email: String(r.email ?? ""), Phone: String(r.phone ?? "") });
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(Array.from(cliMap.values())), "Clients");

    // Behavioral sheet
    const behRows = sessions.filter((s) => s.behavioral).map((s) => {
      const b = s.behavioral as Record<string, unknown>;
      return {
        "Session ID": s.id, Type: s.documentType || "",
        "Duration (ms)": (b.duration as number) || 0,
        "Scroll Depth %": (b.scrollDepth as number) || 0,
        "Tab Switches": (b.tabSwitches as number) || 0,
        "Rage Clicks": (b.rageClicks as number) || 0,
        "Paste Events": ((b.pasteEvents as string[]) || []).length,
        "Fields Edited": Object.keys((b.editCounts as Record<string, number>) || {}).length,
        "Total Edits": Object.values((b.editCounts as Record<string, number>) || {}).reduce((sum, n) => sum + n, 0),
        "Page Load (ms)": (b.pageLoadTime as number) || 0,
        Completed: s.completed ? "Yes" : "No",
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(behRows), "Behavioral");

    // Network sheet
    const netRows = sessions.filter((s) => s.ipGeo).map((s) => {
      const g = s.ipGeo as Record<string, string>;
      return {
        "Session ID": s.id, IP: s.ipAddress || "",
        Country: g?.country || "", Region: g?.region || "", City: g?.city || "",
        Postal: g?.postal || "", Lat: g?.lat || "", Lng: g?.lng || "",
        ISP: g?.isp || "", Org: g?.org || "", AS: g?.as || "",
        Timezone: g?.timezone || "",
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(netRows), "Network");

    XLSX.writeFile(wb, `invoiceify-full-workbook-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Behavioral Data CSV/XLSX
  const exportBehavioralCSV = () => {
    const headers = [
      "Session ID", "Document Type", "Duration (ms)", "Scroll Depth %",
      "Tab Switches", "Rage Clicks", "Paste Events", "Fields Edited",
      "Total Edits", "Page Load (ms)", "Completed",
    ];
    const rows = sessions.filter((s) => s.behavioral).map((s) => {
      const b = s.behavioral as Record<string, unknown>;
      return [
        s.id, s.documentType || "", (b.duration as number) || 0,
        (b.scrollDepth as number) || 0, (b.tabSwitches as number) || 0,
        (b.rageClicks as number) || 0, ((b.pasteEvents as string[]) || []).length,
        Object.keys((b.editCounts as Record<string, number>) || {}).length,
        Object.values((b.editCounts as Record<string, number>) || {}).reduce((sum, n) => sum + n, 0),
        (b.pageLoadTime as number) || 0, s.completed ? "Yes" : "No",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-behavioral-${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Network/Geo CSV
  const exportNetworkCSV = () => {
    const headers = [
      "Session ID", "IP Address", "Country", "Region", "City",
      "Postal", "Lat", "Lng", "ISP", "Org", "AS", "Timezone",
    ];
    const rows = sessions.filter((s) => s.ipGeo).map((s) => {
      const g = s.ipGeo as Record<string, string>;
      return [
        s.id, s.ipAddress || "", g?.country || "", g?.region || "",
        g?.city || "", g?.postal || "", g?.lat || "", g?.lng || "",
        g?.isp || "", g?.org || "", g?.as || "", g?.timezone || "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-network-geo-${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Traffic Sources CSV
  const exportTrafficCSV = () => {
    const headers = [
      "Session ID", "Traffic Source", "UTM Source", "UTM Medium",
      "UTM Campaign", "UTM Term", "UTM Content", "Returning",
      "Referral", "Completed", "Document Type",
    ];
    const rows = sessions.map((s) => [
      s.id, s.trafficSource || "direct", s.utmSource || "", s.utmMedium || "",
      s.utmCampaign || "", s.utmTerm || "", s.utmContent || "",
      s.isReturning ? "Yes" : "No", s.referralSource || "", s.completed ? "Yes" : "No",
      s.documentType || "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-traffic-sources-${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Export Data</h1>
        <p className="text-gray-400 mt-1">
          Download all collected data from Invoiceify
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Documents", value: stats.totalDocuments },
          { label: "Total Value", value: formatCurrency(stats.totalValue) },
          { label: "Registered Users", value: stats.totalUsers },
          { label: "Form Sessions", value: stats.totalSessions },
          { label: "Guest Docs", value: stats.guestDocuments },
          { label: "User Docs", value: stats.userDocuments },
          { label: "Sessions Completed", value: stats.completedSessions },
          { label: "Field Changes", value: stats.totalFieldLogs.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Full Combined Report */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Complete Report</h3>
              <p className="text-xs text-gray-500">Everything in one readable document</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Combines all {stats.totalDocuments} documents and {stats.totalUsers} users into a single report with full details — every sender, recipient, line item, total, and metadata. Includes platform summary with total $$ invoiced.
          </p>
          <button
            onClick={exportCombinedReport}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Complete Report (.txt)
          </button>
        </div>

        {/* Full JSON Export */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Full JSON Export</h3>
              <p className="text-xs text-gray-500">Raw structured data for analysis</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Complete JSON with summary stats, all users, and all documents including nested line items. Perfect for data analysis, importing into tools, or feeding into AI.
          </p>
          <button
            onClick={exportFullJSON}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Full JSON
          </button>
        </div>

        {/* Documents CSV */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Documents CSV</h3>
              <p className="text-xs text-gray-500">Spreadsheet-friendly format</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Every document as a row with 30+ columns: sender details, recipient details, all line items, totals, metadata. Opens in Excel / Google Sheets.
          </p>
          <button
            onClick={exportDocumentsCSV}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Documents CSV
          </button>
        </div>

        {/* Users CSV */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Users CSV</h3>
              <p className="text-xs text-gray-500">All registered accounts</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Every user: email, name, auth provider, role, business name, tax ID, document count, total invoiced, signup date. Opens in Excel / Google Sheets.
          </p>
          <button
            onClick={exportUsersCSV}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Users CSV
          </button>
        </div>

        {/* Business Contacts CSV */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Business Contacts</h3>
              <p className="text-xs text-gray-500">All sender businesses (deduplicated)</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Unique business contact list: name, email, phone, address, tax ID. Extracted from all document senders.
          </p>
          <button
            onClick={exportBusinessContactsCSV}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Business Contacts CSV
          </button>
        </div>

        {/* Client Contacts CSV */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Client Contacts</h3>
              <p className="text-xs text-gray-500">All recipient clients (deduplicated)</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Unique client contact list: name, email, phone, address. Extracted from all document recipients.
          </p>
          <button
            onClick={exportClientContactsCSV}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Client Contacts CSV
          </button>
        </div>

        {/* Line Items CSV */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Line Items CSV</h3>
              <p className="text-xs text-gray-500">Every line item from every document</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            One row per line item across all documents: description, quantity, unit price, tax, discount, line total, linked to document number and sender.
          </p>
          <button
            onClick={exportLineItemsCSV}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Line Items CSV
          </button>
        </div>

        {/* Sessions CSV */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Sessions CSV</h3>
              <p className="text-xs text-gray-500">All form sessions (completed + abandoned)</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Every form session: duration, completion status, field change count, device info, referral source. Includes abandoned sessions for funnel analysis.
          </p>
          <button
            onClick={exportSessionsCSV}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Sessions CSV
          </button>
        </div>

        {/* Full XLSX Workbook */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Full XLSX Workbook</h3>
              <p className="text-xs text-gray-500">Multi-sheet Excel workbook with everything</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            8 sheets: Documents, Users, Sessions, Line Items, Businesses, Clients, Behavioral, Network. One-click download of ALL data in Excel format.
          </p>
          <button
            onClick={exportFullXLSX}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Full XLSX Workbook
          </button>
        </div>

        {/* Behavioral Data CSV */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Behavioral Data CSV</h3>
              <p className="text-xs text-gray-500">Interaction metrics from tracked sessions</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Duration, scroll depth, tab switches, rage clicks, paste events, edit counts, page load times. {sessions.filter((s) => s.behavioral).length} sessions with behavioral data.
          </p>
          <button
            onClick={exportBehavioralCSV}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Behavioral CSV
          </button>
        </div>

        {/* Network/Geo CSV */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Network / Geo CSV</h3>
              <p className="text-xs text-gray-500">IP geolocation data from sessions</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            IP address, country, region, city, postal code, coordinates, ISP, organization, AS number. {sessions.filter((s) => s.ipGeo).length} geolocated sessions.
          </p>
          <button
            onClick={exportNetworkCSV}
            className="w-full bg-teal-500 hover:bg-teal-600 text-black font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Network/Geo CSV
          </button>
        </div>

        {/* Traffic Sources CSV */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-6.364-6.364L4.5 8.257" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Traffic Sources CSV</h3>
              <p className="text-xs text-gray-500">UTM parameters and traffic categorization</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Traffic source type, all UTM parameters, returning visitor flag, referral URL. Full marketing attribution for every session.
          </p>
          <button
            onClick={exportTrafficCSV}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-lg transition cursor-pointer"
          >
            Download Traffic Sources CSV
          </button>
        </div>
      </div>

      {/* Custom Export */}
      <CustomExportSection documents={documents} />
    </div>
  );
}

const CUSTOM_FIELDS = [
  { key: "documentNumber", label: "Document Number" },
  { key: "type", label: "Document Type" },
  { key: "status", label: "Status" },
  { key: "currency", label: "Currency" },
  { key: "subtotal", label: "Subtotal" },
  { key: "taxTotal", label: "Tax Total" },
  { key: "discountTotal", label: "Discount Total" },
  { key: "grandTotal", label: "Grand Total" },
  { key: "issueDate", label: "Issue Date" },
  { key: "dueDate", label: "Due Date" },
  { key: "senderBusiness", label: "Sender Business" },
  { key: "senderEmail", label: "Sender Email" },
  { key: "senderPhone", label: "Sender Phone" },
  { key: "senderAddress", label: "Sender Address" },
  { key: "senderTaxId", label: "Sender Tax ID" },
  { key: "recipientBusiness", label: "Recipient Business" },
  { key: "recipientEmail", label: "Recipient Email" },
  { key: "recipientPhone", label: "Recipient Phone" },
  { key: "recipientAddress", label: "Recipient Address" },
  { key: "lineItemsCount", label: "Line Items Count" },
  { key: "lineItemsDetail", label: "Line Items Detail" },
  { key: "notes", label: "Notes" },
  { key: "terms", label: "Terms" },
  { key: "templateId", label: "Template" },
  { key: "industryPreset", label: "Industry Preset" },
  { key: "userId", label: "User ID" },
  { key: "guestOrUser", label: "Guest/User" },
  { key: "ipCountry", label: "Country" },
  { key: "createdAt", label: "Created At" },
  { key: "detectedIndustry", label: "Detected Industry" },
  { key: "revenueRange", label: "Revenue Range" },
  { key: "senderEmailDomain", label: "Sender Email Domain" },
  { key: "recipientEmailDomain", label: "Recipient Email Domain" },
  { key: "avgLineItemPrice", label: "Avg Line Item Price" },
  { key: "ipAddress", label: "IP Address" },
];

const DOC_TYPES = [
  "invoice", "tax_invoice", "proforma", "receipt", "sales_receipt",
  "cash_receipt", "quote", "estimate", "credit_note", "purchase_order", "delivery_note",
];

function CustomExportSection({ documents }: { documents: Doc[] }) {
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(CUSTOM_FIELDS.map((f) => f.key))
  );
  const [docTypeFilter, setDocTypeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState<"csv" | "json">("csv");

  const toggleField = (key: string) => {
    const next = new Set(selectedFields);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedFields(next);
  };

  const selectAll = () => setSelectedFields(new Set(CUSTOM_FIELDS.map((f) => f.key)));
  const selectNone = () => setSelectedFields(new Set());

  const getFilteredDocs = () => {
    let filtered = documents;
    if (docTypeFilter) filtered = filtered.filter((d) => d.type === docTypeFilter);
    if (dateFrom) filtered = filtered.filter((d) => d.createdAt >= dateFrom);
    if (dateTo) filtered = filtered.filter((d) => d.createdAt <= dateTo + "T23:59:59");
    return filtered;
  };

  const getFieldValue = (doc: Doc, key: string): string => {
    const s = doc.senderInfo as Record<string, unknown>;
    const r = doc.recipientInfo as Record<string, unknown>;
    const sAddr = (s?.address as Record<string, string>) || {};
    const rAddr = (r?.address as Record<string, string>) || {};
    switch (key) {
      case "documentNumber": return doc.documentNumber;
      case "type": return doc.type;
      case "status": return doc.status;
      case "currency": return doc.currency;
      case "subtotal": return String(doc.subtotal);
      case "taxTotal": return String(doc.taxTotal);
      case "discountTotal": return String(doc.discountTotal);
      case "grandTotal": return String(doc.grandTotal);
      case "issueDate": return doc.issueDate;
      case "dueDate": return doc.dueDate || "";
      case "senderBusiness": return String(s?.businessName ?? "");
      case "senderEmail": return String(s?.email ?? "");
      case "senderPhone": return String(s?.phone ?? "");
      case "senderAddress": return [sAddr.line1, sAddr.city, sAddr.postalCode, sAddr.country].filter(Boolean).join(", ");
      case "senderTaxId": return String(s?.taxId ?? "");
      case "recipientBusiness": return String(r?.businessName ?? "");
      case "recipientEmail": return String(r?.email ?? "");
      case "recipientPhone": return String(r?.phone ?? "");
      case "recipientAddress": return [rAddr.line1, rAddr.city, rAddr.postalCode, rAddr.country].filter(Boolean).join(", ");
      case "lineItemsCount": return String(doc.lineItems.length);
      case "lineItemsDetail": return doc.lineItems.map((li) => `${li.description} ($${li.lineTotal})`).join(" | ");
      case "notes": return doc.notes || "";
      case "terms": return doc.terms || "";
      case "templateId": return doc.templateId;
      case "industryPreset": return doc.industryPreset || "";
      case "userId": return doc.userId || "";
      case "guestOrUser": return doc.userId ? "User" : "Guest";
      case "ipCountry": return doc.ipCountry || "";
      case "createdAt": return doc.createdAt;
      case "detectedIndustry": return doc.detectedIndustry || "";
      case "revenueRange": return doc.revenueRange || "";
      case "senderEmailDomain": return doc.senderEmailDomain || "";
      case "recipientEmailDomain": return doc.recipientEmailDomain || "";
      case "avgLineItemPrice": return doc.avgLineItemPrice != null ? String(doc.avgLineItemPrice) : "";
      case "ipAddress": return doc.ipAddress || "";
      default: return "";
    }
  };

  const exportCustom = () => {
    const filtered = getFilteredDocs();
    const fields = CUSTOM_FIELDS.filter((f) => selectedFields.has(f.key));

    if (format === "json") {
      const data = filtered.map((doc) => {
        const row: Record<string, string> = {};
        fields.forEach((f) => { row[f.key] = getFieldValue(doc, f.key); });
        return row;
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `invoiceify-custom-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } else {
      const headers = fields.map((f) => f.label).join(",");
      const rows = filtered.map((doc) =>
        fields.map((f) => `"${getFieldValue(doc, f.key).replace(/"/g, '""')}"`).join(",")
      );
      const csv = [headers, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `invoiceify-custom-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }
  };

  const filteredCount = getFilteredDocs().length;

  return (
    <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Custom Export</h3>
          <p className="text-xs text-gray-500">Pick fields, filter by type/date, export as CSV or JSON</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Document Type</label>
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
          >
            <option value="">All types</option>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">From Date</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">To Date</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Format</label>
          <div className="flex gap-2">
            <button onClick={() => setFormat("csv")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${format === "csv" ? "bg-violet-500 text-white" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
              CSV
            </button>
            <button onClick={() => setFormat("json")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${format === "json" ? "bg-violet-500 text-white" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Field Picker */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-gray-500 uppercase tracking-wider">
            Select Fields ({selectedFields.size} of {CUSTOM_FIELDS.length})
          </label>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-[10px] text-violet-400 hover:text-violet-300 cursor-pointer">Select All</button>
            <button onClick={selectNone} className="text-[10px] text-gray-500 hover:text-gray-400 cursor-pointer">Clear All</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CUSTOM_FIELDS.map((f) => (
            <button
              key={f.key}
              onClick={() => toggleField(f.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                selectedFields.has(f.key)
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-gray-800 text-gray-500 border border-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={exportCustom}
        disabled={selectedFields.size === 0}
        className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-lg transition cursor-pointer"
      >
        Export {filteredCount} documents as {format.toUpperCase()} ({selectedFields.size} fields)
      </button>
    </div>
  );
}
