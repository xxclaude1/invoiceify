"use client";

import { useState, useEffect } from "react";

interface Business {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  contactName: string;
  documentCount: number;
  totalValue: number;
  currencies: string[];
  documentTypes: string[];
  countries: string[];
  firstSeen: string;
  lastSeen: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  invoice: "Invoice", tax_invoice: "Tax Invoice", proforma: "Proforma",
  receipt: "Receipt", sales_receipt: "Sales Receipt", cash_receipt: "Cash Receipt",
  quote: "Quote", estimate: "Estimate", credit_note: "Credit Note",
  purchase_order: "Purchase Order", delivery_note: "Delivery Note",
};

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedName, setExpandedName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/businesses")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBusinesses(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = businesses.filter((b) =>
    [b.businessName, b.email, b.city, b.country, b.contactName]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalValue = businesses.reduce((s, b) => s + b.totalValue, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Directory</h1>
          <p className="text-gray-400 text-sm mt-1">
            {businesses.length} unique businesses — ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total invoiced
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search businesses by name, email, city, country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading businesses...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-600 py-12">No businesses found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <div key={b.businessName} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <button
                onClick={() => setExpandedName(expandedName === b.businessName ? null : b.businessName)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">
                  {b.businessName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{b.businessName}</span>
                    {b.email && <span className="text-xs text-gray-500">{b.email}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span>{b.documentCount} doc{b.documentCount !== 1 ? "s" : ""}</span>
                    <span className="text-amber-400/70">${b.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {b.city && <span>{b.city}</span>}
                    {b.country && <span>{b.country}</span>}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${expandedName === b.businessName ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedName === b.businessName && (
                <div className="border-t border-gray-800 px-5 py-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Contact Name</p>
                      <p className="text-xs text-gray-300">{b.contactName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-xs text-gray-300">{b.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-xs text-gray-300">{b.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Tax ID</p>
                      <p className="text-xs text-gray-300 font-mono">{b.taxId || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Address</p>
                      <p className="text-xs text-gray-300">
                        {[b.address, b.city, b.country].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Currencies Used</p>
                      <p className="text-xs text-gray-300 font-mono">{b.currencies.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Document Types</p>
                      <div className="flex flex-wrap gap-1">
                        {b.documentTypes.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400">
                            {DOC_TYPE_LABELS[t] || t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Active Period</p>
                      <p className="text-xs text-gray-300">
                        {new Date(b.firstSeen).toLocaleDateString()} — {new Date(b.lastSeen).toLocaleDateString()}
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
