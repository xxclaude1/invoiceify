"use client";

import { useState, useEffect, useCallback } from "react";

interface FeedItem {
  id: string;
  type: string;
  documentNumber: string;
  currency: string;
  grandTotal: number;
  ipCountry: string | null;
  userId: string | null;
  createdAt: string;
  senderInfo: Record<string, unknown>;
  recipientInfo: Record<string, unknown>;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  invoice: "Invoice", tax_invoice: "Tax Invoice", proforma: "Proforma",
  receipt: "Receipt", sales_receipt: "Sales Receipt", cash_receipt: "Cash Receipt",
  quote: "Quote", estimate: "Estimate", credit_note: "Credit Note",
  purchase_order: "Purchase Order", delivery_note: "Delivery Note",
};

const DOC_TYPE_COLORS: Record<string, string> = {
  invoice: "bg-blue-500", tax_invoice: "bg-indigo-500", proforma: "bg-sky-500",
  receipt: "bg-green-500", sales_receipt: "bg-emerald-500", cash_receipt: "bg-teal-500",
  quote: "bg-amber-500", estimate: "bg-orange-500", credit_note: "bg-red-500",
  purchase_order: "bg-purple-500", delivery_note: "bg-pink-500",
};

export default function AdminLiveFeedPage() {
  const [documents, setDocuments] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents?limit=50");
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchDocs, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDocs]);

  const timeAgo = (dateStr: string) => {
    const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Live Feed
            {autoRefresh && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-normal text-green-400">Live</span>
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time document activity — auto-refreshes every 10 seconds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            Last update: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              autoRefresh
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-gray-800 text-gray-400 border border-gray-700"
            }`}
          >
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </button>
          <button
            onClick={fetchDocs}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading feed...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium">No documents yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Documents will appear here in real-time as users create them
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc, i) => {
            const sender = doc.senderInfo || {};
            const recipient = doc.recipientInfo || {};
            const isNew = Date.now() - new Date(doc.createdAt).getTime() < 60000;
            return (
              <div
                key={doc.id}
                className={`bg-gray-900 rounded-xl border overflow-hidden transition-all ${
                  isNew ? "border-green-500/40 shadow-lg shadow-green-500/5" : "border-gray-800"
                } ${i === 0 ? "ring-1 ring-green-500/20" : ""}`}
              >
                <div className="px-5 py-4 flex items-center gap-4">
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOC_TYPE_COLORS[doc.type] || "bg-gray-500"}`} />

                  {/* Time */}
                  <div className="w-16 shrink-0">
                    <span className={`text-xs font-mono ${isNew ? "text-green-400" : "text-gray-600"}`}>
                      {timeAgo(doc.createdAt)}
                    </span>
                  </div>

                  {/* Type badge */}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium text-white shrink-0 ${DOC_TYPE_COLORS[doc.type] || "bg-gray-600"}`}>
                    {DOC_TYPE_LABELS[doc.type] || doc.type}
                  </span>

                  {/* Doc number */}
                  <span className="text-sm font-medium text-white w-28 shrink-0 truncate">
                    {doc.documentNumber}
                  </span>

                  {/* Sender → Recipient */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-300 truncate">
                      {String(sender.businessName || "Unknown")}
                    </span>
                    {String(recipient.businessName || "") && (
                      <>
                        <span className="text-gray-600 mx-2">→</span>
                        <span className="text-sm text-gray-400 truncate">
                          {String(recipient.businessName || "")}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0 w-28">
                    <span className="text-sm font-semibold text-white">
                      {doc.currency} {Number(doc.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Country */}
                  <span className="text-xs text-gray-500 w-8 text-center shrink-0">
                    {doc.ipCountry || "—"}
                  </span>

                  {/* Guest/User badge */}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                    doc.userId ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-500"
                  }`}>
                    {doc.userId ? "User" : "Guest"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
