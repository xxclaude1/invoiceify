"use client";

import { useState } from "react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number | null;
  discount: number | null;
  lineTotal: number;
}

interface DocEvent {
  id: string;
  eventType: string;
  eventDate: string;
  metadata: unknown;
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
  lineItems: LineItem[];
  events: DocEvent[];
}

const DOC_TYPE_LABELS: Record<string, string> = {
  invoice: "Invoice",
  tax_invoice: "Tax Invoice",
  proforma: "Proforma",
  receipt: "Receipt",
  sales_receipt: "Sales Receipt",
  cash_receipt: "Cash Receipt",
  quote: "Quote",
  estimate: "Estimate",
  credit_note: "Credit Note",
  purchase_order: "Purchase Order",
  delivery_note: "Delivery Note",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDocumentsClient({ documents }: { documents: Doc[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      !search ||
      doc.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(doc.senderInfo).toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(doc.recipientInfo).toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const exportData = (format: "json" | "csv") => {
    if (format === "json") {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], {
        type: "application/json",
      });
      downloadBlob(blob, "invoiceify-documents.json");
    } else {
      const headers = [
        "id", "type", "documentNumber", "currency", "subtotal", "taxTotal",
        "discountTotal", "grandTotal", "status", "issueDate", "dueDate",
        "senderBusiness", "senderEmail", "recipientBusiness", "recipientEmail",
        "ipCountry", "userId", "createdAt",
      ];
      const rows = filtered.map((doc) => {
        const s = doc.senderInfo as Record<string, string>;
        const r = doc.recipientInfo as Record<string, string>;
        return [
          doc.id, doc.type, doc.documentNumber, doc.currency,
          doc.subtotal, doc.taxTotal, doc.discountTotal, doc.grandTotal,
          doc.status, doc.issueDate, doc.dueDate || "",
          s?.businessName || "", s?.email || "",
          r?.businessName || "", r?.email || "",
          doc.ipCountry || "", doc.userId || "", doc.createdAt,
        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
      });
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      downloadBlob(blob, "invoiceify-documents.csv");
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">All Documents</h1>
          <p className="text-gray-400 mt-1">
            {filtered.length} of {documents.length} documents
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportData("csv")}
            className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition cursor-pointer"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportData("json")}
            className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition cursor-pointer"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by doc number, sender, recipient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500"
        >
          <option value="">All Types</option>
          {Object.entries(DOC_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-12 gap-2 px-4 py-3 bg-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-2">Document</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2">Sender</div>
          <div className="col-span-2">Recipient</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-1">Country</div>
          <div className="col-span-1">Source</div>
          <div className="col-span-2">Created</div>
        </div>

        <div className="divide-y divide-gray-800">
          {filtered.map((doc) => {
            const sender = doc.senderInfo as Record<string, string>;
            const recipient = doc.recipientInfo as Record<string, string>;
            const isExpanded = expanded === doc.id;

            return (
              <div key={doc.id}>
                <div
                  onClick={() => setExpanded(isExpanded ? null : doc.id)}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-800/30 transition cursor-pointer items-center"
                >
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-white">
                      {doc.documentNumber}
                    </p>
                    <p className="text-xs text-gray-600">{doc.id.slice(0, 8)}...</p>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-gray-400">
                      {DOC_TYPE_LABELS[doc.type] || doc.type}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-300 truncate">
                      {sender?.businessName || "-"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {sender?.email || ""}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-300 truncate">
                      {recipient?.businessName || "-"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {recipient?.email || ""}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-medium text-white">
                      {doc.currency} {doc.grandTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-gray-500">
                      {doc.ipCountry || "-"}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${doc.userId ? "bg-blue-500/20 text-blue-400" : "bg-gray-700 text-gray-400"}`}
                    >
                      {doc.userId ? "User" : "Guest"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">{formatDate(doc.createdAt)}</p>
                    <p className="text-xs text-gray-700">
                      {new Date(doc.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-800/20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-lg text-xs">
                      {/* Full Sender Info */}
                      <div>
                        <p className="text-gray-500 uppercase font-medium mb-2">Sender Info</p>
                        <div className="space-y-1 text-gray-300">
                          {Object.entries(doc.senderInfo)
                            .filter(([k]) => k !== "signature" && k !== "logoUrl")
                            .map(([k, v]) => (
                              <p key={k}>
                                <span className="text-gray-500">{k}:</span>{" "}
                                {typeof v === "object" ? JSON.stringify(v) : String(v || "—")}
                              </p>
                            ))}
                        </div>
                      </div>
                      {/* Full Recipient Info */}
                      <div>
                        <p className="text-gray-500 uppercase font-medium mb-2">Recipient Info</p>
                        <div className="space-y-1 text-gray-300">
                          {Object.entries(doc.recipientInfo)
                            .filter(([k]) => k !== "signature")
                            .map(([k, v]) => (
                              <p key={k}>
                                <span className="text-gray-500">{k}:</span>{" "}
                                {typeof v === "object" ? JSON.stringify(v) : String(v || "—")}
                              </p>
                            ))}
                        </div>
                      </div>
                      {/* Metadata */}
                      <div>
                        <p className="text-gray-500 uppercase font-medium mb-2">Metadata</p>
                        <div className="space-y-1 text-gray-300">
                          <p><span className="text-gray-500">Session:</span> {doc.sessionId || "-"}</p>
                          <p><span className="text-gray-500">Template:</span> {doc.templateId}</p>
                          <p><span className="text-gray-500">Preset:</span> {doc.industryPreset || "-"}</p>
                          <p><span className="text-gray-500">Status:</span> {doc.status}</p>
                          <p><span className="text-gray-500">Notes:</span> {doc.notes || "-"}</p>
                          <p><span className="text-gray-500">Terms:</span> {doc.terms || "-"}</p>
                          <p className="mt-2"><span className="text-gray-500">User Agent:</span></p>
                          <p className="text-gray-600 break-all">{doc.userAgent || "-"}</p>
                        </div>
                      </div>
                      {/* Line Items */}
                      <div className="lg:col-span-3">
                        <p className="text-gray-500 uppercase font-medium mb-2">
                          Line Items ({doc.lineItems.length})
                        </p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b border-gray-700">
                              <th className="text-left py-1 pr-4">Description</th>
                              <th className="text-right py-1 px-2">Qty</th>
                              <th className="text-right py-1 px-2">Price</th>
                              <th className="text-right py-1 px-2">Tax %</th>
                              <th className="text-right py-1 px-2">Discount</th>
                              <th className="text-right py-1 pl-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {doc.lineItems.map((li) => (
                              <tr key={li.id} className="border-b border-gray-800 text-gray-300">
                                <td className="py-1 pr-4">{li.description}</td>
                                <td className="text-right py-1 px-2">{li.quantity}</td>
                                <td className="text-right py-1 px-2">{li.unitPrice.toFixed(2)}</td>
                                <td className="text-right py-1 px-2">{li.taxRate ?? "-"}</td>
                                <td className="text-right py-1 px-2">{li.discount ?? "-"}</td>
                                <td className="text-right py-1 pl-2 font-medium">{li.lineTotal.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-2 flex justify-end gap-6 text-gray-400">
                          <span>Subtotal: {doc.subtotal.toFixed(2)}</span>
                          <span>Tax: {doc.taxTotal.toFixed(2)}</span>
                          <span>Discount: {doc.discountTotal.toFixed(2)}</span>
                          <span className="text-white font-medium">
                            Grand Total: {doc.currency} {doc.grandTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-600">
              {documents.length === 0
                ? "No documents yet"
                : "No documents match your filters"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
