"use client";

import { useState, useEffect } from "react";

interface FieldLog {
  id: string;
  fieldName: string;
  fieldValue: string;
  loggedAt: string;
}

interface FormSession {
  id: string;
  documentType: string | null;
  startedAt: string;
  lastActivityAt: string;
  completed: boolean;
  completedAt: string | null;
  documentId: string | null;
  deviceInfo: Record<string, unknown> | null;
  userAgent: string | null;
  ipCountry: string | null;
  referralSource: string | null;
  pageUrl: string | null;
  formSnapshot: Record<string, unknown> | null;
  fieldLogs: FieldLog[];
  _count: { fieldLogs: number };
  // New fields
  fingerprintHash: string | null;
  isReturning: boolean;
  trafficSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ipAddress: string | null;
  ipGeo: Record<string, unknown> | null;
  behavioral: Record<string, unknown> | null;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  invoice: "Invoice", tax_invoice: "Tax Invoice", proforma: "Proforma",
  receipt: "Receipt", sales_receipt: "Sales Receipt", cash_receipt: "Cash Receipt",
  quote: "Quote", estimate: "Estimate", credit_note: "Credit Note",
  purchase_order: "Purchase Order", delivery_note: "Delivery Note",
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<FormSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (filter) params.set("filter", filter);

    fetch(`/api/admin/sessions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSessions(data.data);
          setTotal(data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const getStatusBadge = (s: FormSession) => {
    if (s.completed) return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">Completed</span>;
    const idle = Date.now() - new Date(s.lastActivityAt).getTime();
    if (idle > 30 * 60 * 1000) return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400">Abandoned</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-400">Active</span>;
  };

  const getDuration = (s: FormSession) => {
    const start = new Date(s.startedAt).getTime();
    const end = s.completedAt ? new Date(s.completedAt).getTime() : new Date(s.lastActivityAt).getTime();
    const secs = Math.floor((end - start) / 1000);
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
    return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Session Explorer</h1>
          <p className="text-gray-400 text-sm mt-1">
            {total} total sessions — every user interaction tracked in real time
          </p>
        </div>
        <div className="flex gap-2">
          {["", "active", "completed", "abandoned"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter === f
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center text-gray-600 py-12">No sessions found</div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {/* Session Header */}
              <button
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(s)}
                    {s.isReturning && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-400">Returning</span>
                    )}
                    <span className="text-sm font-medium text-white">
                      {s.documentType ? DOC_TYPE_LABELS[s.documentType] || s.documentType : "Unknown Type"}
                    </span>
                    <span className="text-xs text-gray-600 font-mono">{s.id.slice(0, 8)}...</span>
                    {s.trafficSource && (
                      <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">{s.trafficSource}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{new Date(s.startedAt).toLocaleString()}</span>
                    <span>Duration: {getDuration(s)}</span>
                    <span>{s._count.fieldLogs} field changes</span>
                    {s.deviceInfo && (
                      <span>{(s.deviceInfo as { mobile?: boolean }).mobile ? "Mobile" : "Desktop"}</span>
                    )}
                    {s.ipCountry && <span>{s.ipCountry}</span>}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${expandedId === s.id ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Details */}
              {expandedId === s.id && (
                <div className="border-t border-gray-800 px-5 py-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Session ID</p>
                      <p className="text-xs text-gray-300 font-mono break-all">{s.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Page URL</p>
                      <p className="text-xs text-gray-300 truncate">{s.pageUrl || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Referral</p>
                      <p className="text-xs text-gray-300 truncate">{s.referralSource || "Direct"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Device</p>
                      <p className="text-xs text-gray-300 truncate">
                        {s.deviceInfo
                          ? `${(s.deviceInfo as { screenWidth?: number }).screenWidth}x${(s.deviceInfo as { screenHeight?: number }).screenHeight} · ${(s.deviceInfo as { language?: string }).language}`
                          : "—"}
                      </p>
                    </div>
                    {s.fingerprintHash && (
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Fingerprint Hash</p>
                        <p className="text-xs text-gray-300 font-mono truncate">{s.fingerprintHash.slice(0, 16)}...</p>
                      </div>
                    )}
                    {s.trafficSource && (
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Traffic Source</p>
                        <p className="text-xs text-gray-300">{s.trafficSource}</p>
                      </div>
                    )}
                    {(s.utmSource || s.utmMedium || s.utmCampaign) && (
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">UTM Params</p>
                        <p className="text-xs text-gray-300 truncate">
                          {[s.utmSource && `src=${s.utmSource}`, s.utmMedium && `med=${s.utmMedium}`, s.utmCampaign && `camp=${s.utmCampaign}`].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    )}
                    {s.ipAddress && (
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">IP Address</p>
                        <p className="text-xs text-gray-300 font-mono">{s.ipAddress}</p>
                      </div>
                    )}
                    {s.ipGeo && (
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">IP Geolocation</p>
                        <p className="text-xs text-gray-300">
                          {[(s.ipGeo as Record<string, string>).city, (s.ipGeo as Record<string, string>).region, (s.ipGeo as Record<string, string>).country].filter(Boolean).join(", ")}
                          {(s.ipGeo as Record<string, string>).isp && ` · ${(s.ipGeo as Record<string, string>).isp}`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Behavioral Summary */}
                  {s.behavioral && (
                    <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Behavioral Summary</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                        {[
                          { label: "Duration", value: `${Math.round(((s.behavioral as Record<string, number>).duration || 0) / 1000)}s` },
                          { label: "Fields", value: Object.keys((s.behavioral as Record<string, Record<string, number>>).editCounts || {}).length },
                          { label: "Edits", value: Object.values((s.behavioral as Record<string, Record<string, number>>).editCounts || {}).reduce((sum, n) => sum + n, 0) },
                          { label: "Scroll", value: `${(s.behavioral as Record<string, number>).scrollDepth || 0}%` },
                          { label: "Tab Switches", value: (s.behavioral as Record<string, number>).tabSwitches || 0 },
                          { label: "Rage Clicks", value: (s.behavioral as Record<string, number>).rageClicks || 0 },
                        ].map((m) => (
                          <div key={m.label}>
                            <p className="text-xs font-medium text-white">{m.value}</p>
                            <p className="text-[9px] text-gray-500">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.documentId && (
                    <div className="mb-4 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-green-400">
                        Converted to document: <span className="font-mono">{s.documentId}</span>
                      </p>
                    </div>
                  )}

                  {/* Field Logs Timeline */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Field Change Log ({s._count.fieldLogs} total)
                    </h3>
                    <div className="space-y-1 max-h-80 overflow-y-auto">
                      {s.fieldLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 py-1.5 text-xs">
                          <span className="text-gray-700 font-mono shrink-0 w-20">
                            {new Date(log.loggedAt).toLocaleTimeString()}
                          </span>
                          <span className="text-blue-400 font-mono shrink-0 w-48 truncate">
                            {log.fieldName}
                          </span>
                          <span className="text-gray-300 truncate">
                            {log.fieldValue.length > 100 ? log.fieldValue.slice(0, 100) + "..." : log.fieldValue}
                          </span>
                        </div>
                      ))}
                      {s.fieldLogs.length === 0 && (
                        <p className="text-gray-600 text-xs">No field logs recorded</p>
                      )}
                    </div>
                  </div>

                  {/* Form Snapshot */}
                  {s.formSnapshot && (
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Last Form Snapshot
                      </h3>
                      <pre className="text-[10px] text-gray-500 bg-gray-950 rounded-lg p-3 overflow-x-auto max-h-48">
                        {JSON.stringify(s.formSnapshot, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
