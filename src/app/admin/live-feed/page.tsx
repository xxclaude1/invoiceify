"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ============================================
// Types
// ============================================

interface FormSessionItem {
  id: string;
  documentType: string | null;
  startedAt: string;
  lastActivityAt: string;
  completed: boolean;
  completedAt: string | null;
  documentId: string | null;
  ipCountry: string | null;
  formSnapshot: { step?: number; documentType?: string; senderInfo?: Record<string, string>; recipientInfo?: Record<string, string> } | null;
  _count: { fieldLogs: number };
}

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

// ============================================
// Constants
// ============================================

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

const STEP_LABELS = ["Document Type", "Details", "Line Items", "Template"];

// ============================================
// Helpers
// ============================================

function timeAgo(dateStr: string) {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function getSessionStatus(s: FormSessionItem): "active" | "completed" | "abandoned" {
  if (s.completed) return "completed";
  const idle = Date.now() - new Date(s.lastActivityAt).getTime();
  if (idle > 30 * 60 * 1000) return "abandoned";
  return "active";
}

// ============================================
// Delete Confirmation Modal
// ============================================

function DeleteModal({ itemType, onConfirm, onCancel }: { itemType: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white text-center mb-2">Delete {itemType}?</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          Are you sure you want to delete this {itemType.toLowerCase()}? This action is permanent and cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition cursor-pointer"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function AdminLiveFeedPage() {
  const [sessions, setSessions] = useState<FormSessionItem[]>([]);
  const [documents, setDocuments] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tab, setTab] = useState<"all" | "sessions" | "documents">("all");
  const [deleteTarget, setDeleteTarget] = useState<{ type: "document" | "session"; id: string } | null>(null);
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());
  const prevSessionsRef = useRef<FormSessionItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [sessionsRes, docsRes] = await Promise.all([
        fetch("/api/admin/sessions?limit=50"),
        fetch("/api/documents?limit=50"),
      ]);
      const [sessionsData, docsData] = await Promise.all([
        sessionsRes.json(),
        docsRes.json(),
      ]);

      if (sessionsData.success) {
        const newSessions: FormSessionItem[] = sessionsData.data;
        // Detect newly completed sessions for flash animation
        const prevIds = new Set(prevSessionsRef.current.filter(s => s.completed).map(s => s.id));
        const newlyDone = newSessions.filter(s => s.completed && !prevIds.has(s.id)).map(s => s.id);
        if (newlyDone.length > 0) {
          setRecentlyCompleted(prev => new Set([...prev, ...newlyDone]));
          setTimeout(() => {
            setRecentlyCompleted(prev => {
              const next = new Set(prev);
              newlyDone.forEach(id => next.delete(id));
              return next;
            });
          }, 3000);
        }
        prevSessionsRef.current = newSessions;
        setSessions(newSessions);
      }
      if (docsData.success) {
        setDocuments(docsData.data);
      }
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const endpoint = deleteTarget.type === "document" ? "/api/documents" : "/api/sessions";
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const data = await res.json();
      if (data.success) {
        if (deleteTarget.type === "document") {
          setDocuments(prev => prev.filter(d => d.id !== deleteTarget.id));
        } else {
          setSessions(prev => prev.filter(s => s.id !== deleteTarget.id));
        }
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
    setDeleteTarget(null);
  };

  // Stats
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => getSessionStatus(s) === "active").length;
  const completedSessions = sessions.filter(s => s.completed).length;
  const abandonedSessions = sessions.filter(s => getSessionStatus(s) === "abandoned").length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const totalDocs = documents.length;

  return (
    <div>
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          itemType={deleteTarget.type === "document" ? "Document" : "Session"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
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
            Real-time sessions & documents — auto-refreshes every 8 seconds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              autoRefresh
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-gray-800 text-gray-400 border border-gray-700"
            }`}
          >
            {autoRefresh ? "Auto ON" : "Auto OFF"}
          </button>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Sessions</p>
          <p className="text-2xl font-bold text-white mt-1">{totalSessions}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            Active Now
            {activeSessions > 0 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
          </p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{activeSessions}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{completedSessions}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Abandoned</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{abandonedSessions}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Completion Rate</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{completionRate}%</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Documents</p>
          <p className="text-2xl font-bold text-white mt-1">{totalDocs}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900 rounded-lg p-1 w-fit border border-gray-800">
        {(["all", "sessions", "documents"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              tab === t ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t === "all" ? "All Activity" : t === "sessions" ? `Sessions (${totalSessions})` : `Documents (${totalDocs})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading feed...</div>
      ) : (
        <div className="space-y-2">
          {/* Live Sessions */}
          {(tab === "all" || tab === "sessions") && sessions.length > 0 && (
            <>
              {tab === "all" && (
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium px-1 pt-2 pb-1">
                  Live Sessions
                </div>
              )}
              {sessions.map((s) => {
                const status = getSessionStatus(s);
                const step = (s.formSnapshot?.step ?? 1);
                const progress = s.completed ? 100 : (step / 4) * 100;
                const isJustCompleted = recentlyCompleted.has(s.id);
                const senderName = s.formSnapshot?.senderInfo?.businessName;

                return (
                  <div
                    key={`session-${s.id}`}
                    className={`bg-gray-900 rounded-xl border overflow-hidden transition-all ${
                      isJustCompleted
                        ? "border-green-500 shadow-lg shadow-green-500/20 animate-pulse"
                        : status === "active"
                        ? "border-yellow-500/40 shadow-sm shadow-yellow-500/5"
                        : status === "completed"
                        ? "border-green-500/20"
                        : "border-gray-800"
                    }`}
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        {/* Status indicator */}
                        <div className="shrink-0">
                          {status === "active" ? (
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                            </div>
                          ) : status === "completed" ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isJustCompleted ? "bg-green-500" : "bg-green-500/20"}`}>
                              <svg className={`w-4 h-4 ${isJustCompleted ? "text-white" : "text-green-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Time */}
                        <div className="w-16 shrink-0">
                          <span className={`text-xs font-mono ${
                            status === "active" ? "text-yellow-400" : status === "completed" ? "text-green-400" : "text-gray-600"
                          }`}>
                            {timeAgo(s.lastActivityAt)}
                          </span>
                        </div>

                        {/* Status badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          isJustCompleted
                            ? "bg-green-500 text-white animate-pulse"
                            : status === "active"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {isJustCompleted ? "Completed!" : status}
                        </span>

                        {/* Doc type */}
                        {s.documentType && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium text-white shrink-0 ${DOC_TYPE_COLORS[s.documentType] || "bg-gray-600"}`}>
                            {DOC_TYPE_LABELS[s.documentType] || s.documentType}
                          </span>
                        )}

                        {/* Sender name */}
                        <span className="text-sm text-gray-300 truncate flex-1 min-w-0">
                          {senderName || "Anonymous"}
                        </span>

                        {/* Field changes count */}
                        <span className="text-xs text-gray-600 shrink-0">
                          {s._count.fieldLogs} fields
                        </span>

                        {/* Country */}
                        <span className="text-xs text-gray-500 w-8 text-center shrink-0">
                          {s.ipCountry || "—"}
                        </span>

                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "session", id: s.id }); }}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition cursor-pointer"
                          title="Delete session"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              status === "completed"
                                ? "bg-green-500"
                                : status === "active"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {STEP_LABELS.map((label, i) => (
                            <span
                              key={label}
                              className={`text-[9px] px-1.5 py-0.5 rounded ${
                                i + 1 <= step || s.completed
                                  ? status === "completed"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                  : "bg-gray-800 text-gray-600"
                              }`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Completed Documents */}
          {(tab === "all" || tab === "documents") && documents.length > 0 && (
            <>
              {tab === "all" && (
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium px-1 pt-4 pb-1">
                  Completed Documents
                </div>
              )}
              {documents.map((doc) => {
                const sender = doc.senderInfo || {};
                const recipient = doc.recipientInfo || {};
                const isNew = Date.now() - new Date(doc.createdAt).getTime() < 60000;

                return (
                  <div
                    key={`doc-${doc.id}`}
                    className={`bg-gray-900 rounded-xl border overflow-hidden transition-all ${
                      isNew ? "border-green-500/40 shadow-lg shadow-green-500/5" : "border-gray-800"
                    }`}
                  >
                    <div className="px-5 py-4 flex items-center gap-4">
                      {/* Check icon */}
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

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
                      <div className="flex-1 min-w-0 flex items-center">
                        <span className="text-sm text-gray-300 truncate">
                          {String(sender.businessName || "Unknown")}
                        </span>
                        {String(recipient.businessName || "") && (
                          <>
                            <span className="text-gray-600 mx-2 shrink-0">→</span>
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

                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "document", id: doc.id }); }}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition cursor-pointer"
                        title="Delete document"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Empty state */}
          {sessions.length === 0 && documents.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">No activity yet</p>
              <p className="text-gray-600 text-sm mt-1">
                Sessions and documents will appear here in real-time
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
