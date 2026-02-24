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
  sortOrder: number;
  extraFields: unknown;
  createdAt: string;
}

interface DocEvent {
  id: string;
  eventType: string;
  eventDate: string;
  metadata: unknown;
}

interface FormSession {
  id: string;
  startedAt: string;
  lastActivityAt: string;
  completed: boolean;
  completedAt: string | null;
  deviceInfo: Record<string, unknown> | null;
  ipAddress: string | null;
  ipGeo: Record<string, unknown> | null;
  ipCountry: string | null;
  referralSource: string | null;
  pageUrl: string | null;
  fingerprintHash: string | null;
  isReturning: boolean;
  trafficSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  behavioral: Record<string, unknown> | null;
  fieldLogCount: number;
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
  ipGeo: Record<string, unknown> | null;
  senderEmailDomain: string | null;
  recipientEmailDomain: string | null;
  detectedIndustry: string | null;
  revenueRange: string | null;
  lineItemCount: number | null;
  avgLineItemPrice: number | null;
  formSessionId: string | null;
  lineItems: LineItem[];
  events: DocEvent[];
  formSession: FormSession | null;
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-800/50">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-300 text-xs text-right max-w-[60%] break-all">{value || "—"}</span>
    </div>
  );
}

// Full View Modal
function FullViewModal({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const sender = doc.senderInfo as Record<string, unknown>;
  const recipient = doc.recipientInfo as Record<string, unknown>;
  const sAddr = (sender?.address as Record<string, string>) || {};
  const rAddr = (recipient?.address as Record<string, string>) || {};
  const geo = doc.ipGeo as Record<string, string> | null;
  const fs = doc.formSession;
  const fsGeo = fs?.ipGeo as Record<string, string> | null;
  const beh = fs?.behavioral as Record<string, unknown> | null;
  const dev = fs?.deviceInfo as Record<string, unknown> | null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-5xl animate-page-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">{doc.documentNumber}</h2>
            <p className="text-xs text-gray-500 mt-1">{doc.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400">{DOC_TYPE_LABELS[doc.type] || doc.type}</span>
            <span className={`text-xs px-2 py-1 rounded ${doc.userId ? "bg-blue-500/20 text-blue-400" : "bg-gray-700 text-gray-400"}`}>
              {doc.userId ? "User" : "Guest"}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition cursor-pointer">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Row 1: Document Info + Financial */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Details */}
            <div className="bg-gray-800/40 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Document Details</h3>
              <div className="space-y-0">
                <InfoRow label="Type" value={DOC_TYPE_LABELS[doc.type] || doc.type} />
                <InfoRow label="Status" value={doc.status} />
                <InfoRow label="Template" value={doc.templateId} />
                <InfoRow label="Industry Preset" value={doc.industryPreset} />
                <InfoRow label="Currency" value={doc.currency} />
                <InfoRow label="Issue Date" value={formatDate(doc.issueDate)} />
                <InfoRow label="Due Date" value={doc.dueDate ? formatDate(doc.dueDate) : null} />
                <InfoRow label="Created" value={new Date(doc.createdAt).toLocaleString()} />
                <InfoRow label="Updated" value={new Date(doc.updatedAt).toLocaleString()} />
                <InfoRow label="User ID" value={doc.userId} />
                <InfoRow label="Session UUID" value={doc.sessionId} />
              </div>
            </div>

            {/* Financial Totals */}
            <div className="bg-gray-800/40 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Financial</h3>
              <div className="space-y-0">
                <InfoRow label="Subtotal" value={`${doc.currency} ${doc.subtotal.toFixed(2)}`} />
                <InfoRow label="Tax Total" value={`${doc.currency} ${doc.taxTotal.toFixed(2)}`} />
                <InfoRow label="Discount Total" value={`${doc.currency} ${doc.discountTotal.toFixed(2)}`} />
                <div className="flex justify-between py-2 border-b border-gray-800/50">
                  <span className="text-white text-sm font-bold">Grand Total</span>
                  <span className="text-white text-sm font-bold">{doc.currency} {doc.grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-4">Business Intelligence</h3>
              <div className="space-y-0">
                <InfoRow label="Detected Industry" value={doc.detectedIndustry} />
                <InfoRow label="Revenue Range" value={doc.revenueRange} />
                <InfoRow label="Line Item Count" value={doc.lineItemCount?.toString()} />
                <InfoRow label="Avg Item Price" value={doc.avgLineItemPrice?.toFixed(2)} />
                <InfoRow label="Sender Email Domain" value={doc.senderEmailDomain} />
                <InfoRow label="Recipient Email Domain" value={doc.recipientEmailDomain} />
              </div>
            </div>

            {/* Network & Tracking */}
            <div className="bg-gray-800/40 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Network & Location</h3>
              <div className="space-y-0">
                <InfoRow label="IP Address" value={doc.ipAddress} />
                <InfoRow label="IP Country" value={doc.ipCountry} />
                {geo && (
                  <>
                    <InfoRow label="City" value={geo.city} />
                    <InfoRow label="Region" value={geo.region} />
                    <InfoRow label="Postal" value={geo.postal} />
                    <InfoRow label="Lat / Lng" value={geo.lat && geo.lng ? `${geo.lat}, ${geo.lng}` : null} />
                    <InfoRow label="ISP" value={geo.isp} />
                    <InfoRow label="Organization" value={geo.org} />
                    <InfoRow label="AS" value={geo.as} />
                    <InfoRow label="Timezone" value={geo.timezone} />
                  </>
                )}
              </div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-4">Browser</h3>
              <div className="space-y-0">
                <InfoRow label="User Agent" value={doc.userAgent} />
              </div>
            </div>
          </div>

          {/* Row 2: Sender + Recipient */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/40 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sender Info</h3>
              <div className="space-y-0">
                <InfoRow label="Business Name" value={String(sender?.businessName ?? "")} />
                <InfoRow label="Contact Name" value={String(sender?.contactName ?? "")} />
                <InfoRow label="Email" value={String(sender?.email ?? "")} />
                <InfoRow label="Phone" value={String(sender?.phone ?? "")} />
                <InfoRow label="Tax ID" value={String(sender?.taxId ?? "")} />
                <InfoRow label="Address Line" value={sAddr?.line1} />
                <InfoRow label="City" value={sAddr?.city} />
                <InfoRow label="State" value={sAddr?.state} />
                <InfoRow label="Postal Code" value={sAddr?.postalCode} />
                <InfoRow label="Country" value={sAddr?.country} />
              </div>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recipient Info</h3>
              <div className="space-y-0">
                <InfoRow label="Business Name" value={String(recipient?.businessName ?? "")} />
                <InfoRow label="Contact Name" value={String(recipient?.contactName ?? "")} />
                <InfoRow label="Email" value={String(recipient?.email ?? "")} />
                <InfoRow label="Phone" value={String(recipient?.phone ?? "")} />
                <InfoRow label="Address Line" value={rAddr?.line1} />
                <InfoRow label="City" value={rAddr?.city} />
                <InfoRow label="State" value={rAddr?.state} />
                <InfoRow label="Postal Code" value={rAddr?.postalCode} />
                <InfoRow label="Country" value={rAddr?.country} />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-gray-800/40 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Line Items ({doc.lineItems.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-700">
                    <th className="text-left py-2 pr-4">#</th>
                    <th className="text-left py-2 pr-4">Description</th>
                    <th className="text-right py-2 px-2">Qty</th>
                    <th className="text-right py-2 px-2">Unit Price</th>
                    <th className="text-right py-2 px-2">Tax %</th>
                    <th className="text-right py-2 px-2">Discount</th>
                    <th className="text-right py-2 pl-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.lineItems.map((li, i) => (
                    <tr key={li.id} className="border-b border-gray-800/50 text-gray-300">
                      <td className="py-2 pr-4 text-gray-600">{i + 1}</td>
                      <td className="py-2 pr-4">{li.description}</td>
                      <td className="text-right py-2 px-2">{li.quantity}</td>
                      <td className="text-right py-2 px-2">{li.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-2 px-2">{li.taxRate ?? "—"}</td>
                      <td className="text-right py-2 px-2">{li.discount ?? "—"}</td>
                      <td className="text-right py-2 pl-2 font-medium text-white">{li.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Terms */}
          {(doc.notes || doc.terms) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {doc.notes && (
                <div className="bg-gray-800/40 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-xs text-gray-300 whitespace-pre-wrap">{doc.notes}</p>
                </div>
              )}
              {doc.terms && (
                <div className="bg-gray-800/40 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Terms</h3>
                  <p className="text-xs text-gray-300 whitespace-pre-wrap">{doc.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Linked Form Session */}
          {fs && (
            <div className="bg-gray-800/40 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Linked Form Session
                {fs.isReturning && <span className="ml-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px]">Returning</span>}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Session Meta */}
                <div className="space-y-0">
                  <InfoRow label="Session ID" value={fs.id} />
                  <InfoRow label="Started" value={new Date(fs.startedAt).toLocaleString()} />
                  <InfoRow label="Last Activity" value={new Date(fs.lastActivityAt).toLocaleString()} />
                  <InfoRow label="Completed" value={fs.completed ? "Yes" : "No"} />
                  <InfoRow label="Completed At" value={fs.completedAt ? new Date(fs.completedAt).toLocaleString() : null} />
                  <InfoRow label="Field Changes" value={fs.fieldLogCount.toString()} />
                  <InfoRow label="Fingerprint" value={fs.fingerprintHash} />
                  <InfoRow label="Page URL" value={fs.pageUrl} />
                  <InfoRow label="Referral Source" value={fs.referralSource} />
                </div>
                {/* Traffic */}
                <div className="space-y-0">
                  <InfoRow label="Traffic Source" value={fs.trafficSource} />
                  <InfoRow label="UTM Source" value={fs.utmSource} />
                  <InfoRow label="UTM Medium" value={fs.utmMedium} />
                  <InfoRow label="UTM Campaign" value={fs.utmCampaign} />
                  <InfoRow label="UTM Term" value={fs.utmTerm} />
                  <InfoRow label="UTM Content" value={fs.utmContent} />
                  <InfoRow label="Session IP" value={fs.ipAddress} />
                  <InfoRow label="Session Country" value={fs.ipCountry} />
                  {fsGeo && (
                    <>
                      <InfoRow label="Session City" value={`${fsGeo.city}, ${fsGeo.region}`} />
                      <InfoRow label="Session ISP" value={fsGeo.isp} />
                      <InfoRow label="Session Org" value={fsGeo.org} />
                    </>
                  )}
                </div>
                {/* Behavioral + Device */}
                <div className="space-y-0">
                  {dev && (
                    <>
                      <InfoRow label="Mobile" value={dev.mobile ? "Yes" : "No"} />
                      <InfoRow label="Screen" value={`${dev.screenWidth}x${dev.screenHeight}`} />
                      <InfoRow label="Language" value={String(dev.language ?? "")} />
                      <InfoRow label="Platform" value={String(dev.platform ?? "")} />
                    </>
                  )}
                  {beh && (
                    <>
                      <InfoRow label="Duration" value={beh.duration ? `${Math.round((beh.duration as number) / 1000)}s` : null} />
                      <InfoRow label="Scroll Depth" value={beh.scrollDepth ? `${beh.scrollDepth}%` : null} />
                      <InfoRow label="Tab Switches" value={(beh.tabSwitches as number)?.toString()} />
                      <InfoRow label="Rage Clicks" value={(beh.rageClicks as number)?.toString()} />
                      <InfoRow label="Paste Events" value={((beh.pasteEvents as string[]) || []).length.toString()} />
                      <InfoRow label="Total Edits" value={
                        Object.values((beh.editCounts as Record<string, number>) || {}).reduce((s, n) => s + n, 0).toString()
                      } />
                      <InfoRow label="Page Load" value={beh.pageLoadTime ? `${beh.pageLoadTime}ms` : null} />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Events */}
          {doc.events.length > 0 && (
            <div className="bg-gray-800/40 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Events</h3>
              <div className="space-y-1">
                {doc.events.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">{new Date(ev.eventDate).toLocaleString()}</span>
                    <span className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{ev.eventType}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDocumentsClient({ documents }: { documents: Doc[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fullViewDoc, setFullViewDoc] = useState<Doc | null>(null);

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
        "senderBusiness", "senderEmail", "senderPhone", "senderTaxId",
        "senderAddress",
        "recipientBusiness", "recipientEmail", "recipientPhone",
        "recipientAddress",
        "lineItemsCount", "lineItemsDetail",
        "notes", "terms", "templateId", "industryPreset",
        "ipCountry", "ipAddress", "ipCity", "ipRegion", "ipISP", "ipOrg", "ipTimezone",
        "detectedIndustry", "revenueRange",
        "senderEmailDomain", "recipientEmailDomain",
        "avgLineItemPrice",
        "userId", "guestOrUser", "userAgent",
        "sessionId", "formSessionId",
        "createdAt",
      ];
      const rows = filtered.map((doc) => {
        const s = doc.senderInfo as Record<string, string>;
        const r = doc.recipientInfo as Record<string, string>;
        const sAddr = (doc.senderInfo as Record<string, Record<string, string>>)?.address || {};
        const rAddr = (doc.recipientInfo as Record<string, Record<string, string>>)?.address || {};
        const geo = doc.ipGeo as Record<string, string> | null;
        const lineDetail = doc.lineItems
          .map((li) => `${li.description} (qty:${li.quantity} x $${li.unitPrice} = $${li.lineTotal})`)
          .join(" | ");

        return [
          doc.id, doc.type, doc.documentNumber, doc.currency,
          doc.subtotal, doc.taxTotal, doc.discountTotal, doc.grandTotal,
          doc.status, doc.issueDate, doc.dueDate || "",
          s?.businessName || "", s?.email || "", s?.phone || "", s?.taxId || "",
          [sAddr?.line1, sAddr?.city, sAddr?.postalCode, sAddr?.country].filter(Boolean).join(", "),
          r?.businessName || "", r?.email || "", r?.phone || "",
          [rAddr?.line1, rAddr?.city, rAddr?.postalCode, rAddr?.country].filter(Boolean).join(", "),
          doc.lineItems.length, lineDetail,
          doc.notes || "", doc.terms || "", doc.templateId, doc.industryPreset || "",
          doc.ipCountry || "", doc.ipAddress || "",
          geo?.city || "", geo?.region || "", geo?.isp || "", geo?.org || "", geo?.timezone || "",
          doc.detectedIndustry || "", doc.revenueRange || "",
          doc.senderEmailDomain || "", doc.recipientEmailDomain || "",
          doc.avgLineItemPrice ?? "",
          doc.userId || "", doc.userId ? "User" : "Guest", doc.userAgent || "",
          doc.sessionId || "", doc.formSessionId || "",
          doc.createdAt,
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
      {fullViewDoc && <FullViewModal doc={fullViewDoc} onClose={() => setFullViewDoc(null)} />}

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
            const geo = doc.ipGeo as Record<string, string> | null;

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
                      {sender?.businessName || "—"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {sender?.email || ""}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-300 truncate">
                      {recipient?.businessName || "—"}
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
                      {doc.ipCountry || "—"}
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

                {/* Expanded Quick View */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-800/20 animate-page-in">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      {/* Quick info grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">IP Address</p>
                          <p className="text-xs text-gray-300 font-mono">{doc.ipAddress || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Location</p>
                          <p className="text-xs text-gray-300">
                            {geo ? `${geo.city}, ${geo.region}, ${geo.country}` : doc.ipCountry || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Industry</p>
                          <p className="text-xs text-gray-300">{doc.detectedIndustry || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Revenue Range</p>
                          <p className="text-xs text-gray-300">{doc.revenueRange || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">ISP / Org</p>
                          <p className="text-xs text-gray-300 truncate">{geo?.isp || "—"} / {geo?.org || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Sender Domain</p>
                          <p className="text-xs text-gray-300">{doc.senderEmailDomain || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Recipient Domain</p>
                          <p className="text-xs text-gray-300">{doc.recipientEmailDomain || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Avg Item Price</p>
                          <p className="text-xs text-gray-300">{doc.avgLineItemPrice?.toFixed(2) || "—"}</p>
                        </div>
                      </div>

                      {/* Sender / Recipient / Metadata row */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 text-xs">
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
                        <div>
                          <p className="text-gray-500 uppercase font-medium mb-2">Metadata</p>
                          <div className="space-y-1 text-gray-300">
                            <p><span className="text-gray-500">Session:</span> {doc.sessionId || "—"}</p>
                            <p><span className="text-gray-500">Template:</span> {doc.templateId}</p>
                            <p><span className="text-gray-500">Preset:</span> {doc.industryPreset || "—"}</p>
                            <p><span className="text-gray-500">Status:</span> {doc.status}</p>
                            <p><span className="text-gray-500">Notes:</span> {doc.notes || "—"}</p>
                            <p><span className="text-gray-500">Terms:</span> {doc.terms || "—"}</p>
                            <p className="mt-2"><span className="text-gray-500">User Agent:</span></p>
                            <p className="text-gray-600 break-all text-[10px]">{doc.userAgent || "—"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Line Items */}
                      <div className="mb-4">
                        <p className="text-gray-500 uppercase font-medium mb-2 text-xs">
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
                                <td className="text-right py-1 px-2">{li.taxRate ?? "—"}</td>
                                <td className="text-right py-1 px-2">{li.discount ?? "—"}</td>
                                <td className="text-right py-1 pl-2 font-medium">{li.lineTotal.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-2 flex justify-end gap-6 text-gray-400 text-xs">
                          <span>Subtotal: {doc.subtotal.toFixed(2)}</span>
                          <span>Tax: {doc.taxTotal.toFixed(2)}</span>
                          <span>Discount: {doc.discountTotal.toFixed(2)}</span>
                          <span className="text-white font-medium">
                            Grand Total: {doc.currency} {doc.grandTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Full View Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setFullViewDoc(doc); }}
                        className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-sm font-medium text-blue-400 transition cursor-pointer"
                      >
                        Open Full View — All Collected Data
                      </button>
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
