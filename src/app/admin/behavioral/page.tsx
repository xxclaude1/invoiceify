import { prisma } from "@/lib/db";

interface FieldTiming {
  fieldName: string;
  duration?: number;
}

export default async function AdminBehavioralPage() {
  const sessions = await prisma.formSession.findMany({
    select: {
      id: true,
      behavioral: true,
      completed: true,
      startedAt: true,
      lastActivityAt: true,
      completedAt: true,
      _count: { select: { fieldLogs: true } },
    },
  });

  // Sessions with behavioral data
  const withBehavioral = sessions.filter((s) => s.behavioral);

  // Aggregate field timings
  const fieldTimeMap = new Map<string, number[]>();
  const fieldOrderMap = new Map<string, number>();
  const pasteFieldMap = new Map<string, number>();
  let totalRageClicks = 0;
  let totalTabSwitches = 0;
  let totalScrollDepth = 0;
  let scrollCount = 0;
  let totalDuration = 0;
  let durationCount = 0;
  const completedDurations: number[] = [];
  const abandonedDurations: number[] = [];
  const abandonedLastFields: Map<string, number> = new Map();

  for (const s of withBehavioral) {
    const b = s.behavioral as Record<string, unknown>;

    // Field timings
    const timings = (b.fieldTimings as FieldTiming[]) || [];
    for (const t of timings) {
      if (t.duration && t.duration > 0) {
        if (!fieldTimeMap.has(t.fieldName)) fieldTimeMap.set(t.fieldName, []);
        fieldTimeMap.get(t.fieldName)!.push(t.duration);
      }
    }

    // Field order frequency
    const order = (b.fieldOrder as string[]) || [];
    order.forEach((field, idx) => {
      fieldOrderMap.set(field, (fieldOrderMap.get(field) || 0) + idx);
    });

    // Paste events
    const pastes = (b.pasteEvents as string[]) || [];
    for (const p of pastes) {
      pasteFieldMap.set(p, (pasteFieldMap.get(p) || 0) + 1);
    }

    // Aggregates
    totalRageClicks += (b.rageClicks as number) || 0;
    totalTabSwitches += (b.tabSwitches as number) || 0;
    if (typeof b.scrollDepth === "number") {
      totalScrollDepth += b.scrollDepth;
      scrollCount++;
    }

    // Duration
    const dur = (b.duration as number) || 0;
    if (dur > 0) {
      totalDuration += dur;
      durationCount++;
      if (s.completed) completedDurations.push(dur);
      else abandonedDurations.push(dur);
    }

    // For abandoned sessions, track which field they last touched
    if (!s.completed && order.length > 0) {
      const lastField = order[order.length - 1];
      abandonedLastFields.set(lastField, (abandonedLastFields.get(lastField) || 0) + 1);
    }
  }

  // Compute averages
  const avgFieldTimes = Array.from(fieldTimeMap.entries())
    .map(([field, times]) => ({
      field,
      avg: Math.round(times.reduce((s, t) => s + t, 0) / times.length),
      count: times.length,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 20);

  const avgScrollDepth = scrollCount > 0 ? Math.round(totalScrollDepth / scrollCount) : 0;
  const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount / 1000) : 0;
  const avgCompletedDuration = completedDurations.length > 0
    ? Math.round(completedDurations.reduce((s, d) => s + d, 0) / completedDurations.length / 1000)
    : 0;
  const avgAbandonedDuration = abandonedDurations.length > 0
    ? Math.round(abandonedDurations.reduce((s, d) => s + d, 0) / abandonedDurations.length / 1000)
    : 0;

  const dropOffFields = Array.from(abandonedLastFields.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Edit counts — which fields get the most edits
  const editCountMap = new Map<string, number>();
  for (const s of withBehavioral) {
    const b = s.behavioral as Record<string, unknown>;
    const edits = (b.editCounts as Record<string, number>) || {};
    for (const [field, count] of Object.entries(edits)) {
      editCountMap.set(field, (editCountMap.get(field) || 0) + count);
    }
  }
  const topEditedFields = Array.from(editCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Paste frequency
  const totalPasteEvents = Array.from(pasteFieldMap.values()).reduce((s, n) => s + n, 0);
  const totalTypeEvents = Array.from(editCountMap.values()).reduce((s, n) => s + n, 0);

  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Behavioral Analytics</h1>
        <p className="text-gray-400 mt-1">
          Interaction patterns from {withBehavioral.length} sessions with behavioral data ({sessions.length} total)
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Avg Session Duration", value: formatDuration(avgDuration), sub: "All sessions" },
          { label: "Avg Completed Duration", value: formatDuration(avgCompletedDuration), sub: `${completedDurations.length} completed` },
          { label: "Avg Abandoned Duration", value: formatDuration(avgAbandonedDuration), sub: `${abandonedDurations.length} abandoned` },
          { label: "Avg Scroll Depth", value: `${avgScrollDepth}%`, sub: `${scrollCount} sessions measured` },
          { label: "Total Rage Clicks", value: totalRageClicks, sub: "Across all sessions" },
          { label: "Total Tab Switches", value: totalTabSwitches, sub: "Users leaving and coming back" },
          { label: "Paste Events", value: totalPasteEvents, sub: `vs ${totalTypeEvents} typed edits` },
          { label: "Paste:Type Ratio", value: totalTypeEvents > 0 ? `${Math.round((totalPasteEvents / totalTypeEvents) * 100)}%` : "N/A", sub: "Higher = more copy-paste" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold mt-1 text-white">{stat.value}</p>
            <p className="text-xs text-gray-600 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Time per Field */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Average Time per Field (ms)
          </h2>
          <div className="space-y-2.5">
            {avgFieldTimes.map(({ field, avg, count }) => (
              <div key={field} className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-mono truncate mr-2">{field}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500">{count}x</span>
                  <span className="text-xs font-medium text-white">{(avg / 1000).toFixed(1)}s</span>
                </div>
              </div>
            ))}
            {avgFieldTimes.length === 0 && <p className="text-xs text-gray-600">No timing data yet</p>}
          </div>
        </div>

        {/* Drop-off Analysis */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Drop-off Analysis (Last Field Before Abandon)
          </h2>
          <p className="text-[10px] text-gray-600 mb-3">Which field abandoned users last interacted with</p>
          <div className="space-y-2.5">
            {dropOffFields.map(([field, count]) => (
              <div key={field} className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-mono truncate mr-2">{field}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${abandonedDurations.length > 0 ? (count / abandonedDurations.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-medium text-red-400">{count}</span>
                </div>
              </div>
            ))}
            {dropOffFields.length === 0 && <p className="text-xs text-gray-600">No abandoned sessions with field data</p>}
          </div>
        </div>

        {/* Most Edited Fields */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Most Edited Fields (Total Edits)
          </h2>
          <div className="space-y-2.5">
            {topEditedFields.map(([field, count]) => (
              <div key={field} className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-mono truncate mr-2">{field}</span>
                <span className="text-xs font-medium text-white">{count} edits</span>
              </div>
            ))}
            {topEditedFields.length === 0 && <p className="text-xs text-gray-600">No edit data yet</p>}
          </div>
        </div>

        {/* Paste Events by Field */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Paste Events by Field
          </h2>
          <p className="text-[10px] text-gray-600 mb-3">Fields where users paste content instead of typing</p>
          <div className="space-y-2.5">
            {Array.from(pasteFieldMap.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([field, count]) => (
                <div key={field} className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-mono truncate mr-2">{field}</span>
                  <span className="text-xs font-medium text-amber-400">{count} pastes</span>
                </div>
              ))}
            {pasteFieldMap.size === 0 && <p className="text-xs text-gray-600">No paste events yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
