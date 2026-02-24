"use client";

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
      "IP Country", "User Agent", "Session ID",
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
        doc.ipCountry || "", doc.userAgent || "", doc.sessionId || "",
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
      "Field Changes", "IP Country", "Referral Source", "Page URL",
      "Device Mobile", "Screen Width", "Screen Height", "Language",
    ];
    const rows = sessions.map((s) => {
      const duration = Math.floor(
        (new Date(s.completedAt || s.lastActivityAt).getTime() - new Date(s.startedAt).getTime()) / 1000
      );
      const d = s.deviceInfo || {};
      return [
        s.id, s.documentType || "", s.startedAt, s.lastActivityAt, duration,
        s.completed ? "Yes" : "No", s.completedAt || "", s.documentId || "",
        s.fieldLogCount, s.ipCountry || "", s.referralSource || "", s.pageUrl || "",
        (d as Record<string, unknown>).mobile ? "Yes" : "No",
        String((d as Record<string, unknown>).screenWidth ?? ""),
        String((d as Record<string, unknown>).screenHeight ?? ""),
        String((d as Record<string, unknown>).language ?? ""),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `invoiceify-sessions-${new Date().toISOString().split("T")[0]}.csv`);
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
      </div>
    </div>
  );
}
