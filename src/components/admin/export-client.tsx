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

interface Stats {
  totalDocuments: number;
  totalValue: number;
  totalUsers: number;
  guestDocuments: number;
  userDocuments: number;
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
  stats,
}: {
  documents: Doc[];
  users: User[];
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Export Data</h1>
        <p className="text-gray-400 mt-1">
          Download all collected data from Invoiceify
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Documents", value: stats.totalDocuments },
          { label: "Total Value", value: formatCurrency(stats.totalValue) },
          { label: "Registered Users", value: stats.totalUsers },
          { label: "Guest Docs", value: stats.guestDocuments },
          { label: "User Docs", value: stats.userDocuments },
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
      </div>
    </div>
  );
}
