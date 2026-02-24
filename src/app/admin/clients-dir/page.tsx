"use client";

import { useState, useEffect } from "react";

interface ClientEntry {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactName: string;
  invoicedBy: string[];
  documentCount: number;
  totalValue: number;
  currencies: string[];
  documentTypes: string[];
  firstSeen: string;
  lastSeen: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  invoice: "Invoice", tax_invoice: "Tax Invoice", proforma: "Proforma",
  receipt: "Receipt", sales_receipt: "Sales Receipt", cash_receipt: "Cash Receipt",
  quote: "Quote", estimate: "Estimate", credit_note: "Credit Note",
  purchase_order: "Purchase Order", delivery_note: "Delivery Note",
};

export default function AdminClientsDirectoryPage() {
  const [clients, setClients] = useState<ClientEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedName, setExpandedName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setClients(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) =>
    [c.businessName, c.email, c.city, c.country, c.contactName, ...c.invoicedBy]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalValue = clients.reduce((s, c) => s + c.totalValue, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Directory</h1>
          <p className="text-gray-400 text-sm mt-1">
            {clients.length} unique clients (recipients) — ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total received
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search clients by name, email, invoiced by..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading clients...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-600 py-12">No clients found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.businessName} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <button
                onClick={() => setExpandedName(expandedName === c.businessName ? null : c.businessName)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 text-sm font-bold shrink-0">
                  {c.businessName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{c.businessName}</span>
                    {c.email && <span className="text-xs text-gray-500">{c.email}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span>{c.documentCount} doc{c.documentCount !== 1 ? "s" : ""}</span>
                    <span className="text-amber-400/70">${c.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span>Invoiced by: {c.invoicedBy.join(", ")}</span>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${expandedName === c.businessName ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedName === c.businessName && (
                <div className="border-t border-gray-800 px-5 py-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Contact Name</p>
                      <p className="text-xs text-gray-300">{c.contactName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-xs text-gray-300">{c.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-xs text-gray-300">{c.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Address</p>
                      <p className="text-xs text-gray-300">
                        {[c.address, c.city, c.country].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Invoiced By</p>
                      <div className="flex flex-wrap gap-1">
                        {c.invoicedBy.map((name) => (
                          <span key={name} className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Currencies</p>
                      <p className="text-xs text-gray-300 font-mono">{c.currencies.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Document Types</p>
                      <div className="flex flex-wrap gap-1">
                        {c.documentTypes.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400">
                            {DOC_TYPE_LABELS[t] || t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Active Period</p>
                      <p className="text-xs text-gray-300">
                        {new Date(c.firstSeen).toLocaleDateString()} — {new Date(c.lastSeen).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
