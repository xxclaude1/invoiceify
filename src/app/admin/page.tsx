import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function AdminOverviewPage() {
  const session = await auth();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const [
    totalDocs,
    docsThisMonth,
    docsThisWeek,
    docsToday,
    totalUsers,
    usersThisMonth,
    allDocs,
    guestDocs,
    userDocs,
    docsByType,
    docsByCurrency,
    docsByCountry,
    docsByStatus,
    recentDocs,
    recentUsers,
    totalSessions,
    completedSessions,
    totalFieldLogs,
  ] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.document.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.document.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.document.findMany({ select: { grandTotal: true, currency: true } }),
    prisma.document.count({ where: { userId: null } }),
    prisma.document.count({ where: { userId: { not: null } } }),
    prisma.document.groupBy({ by: ["type"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.document.groupBy({ by: ["currency"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.document.groupBy({ by: ["ipCountry"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, where: { ipCountry: { not: null } } }),
    prisma.document.groupBy({ by: ["status"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, type: true, documentNumber: true, currency: true,
        grandTotal: true, subtotal: true, taxTotal: true, discountTotal: true,
        ipCountry: true, userAgent: true, createdAt: true, userId: true,
        senderInfo: true, recipientInfo: true, status: true, templateId: true,
        notes: true, terms: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, name: true, createdAt: true, provider: true },
    }),
    prisma.formSession.count(),
    prisma.formSession.count({ where: { completed: true } }),
    prisma.formFieldLog.count(),
  ]);

  const totalValue = allDocs.reduce((sum, d) => sum + Number(d.grandTotal), 0);
  const avgValue = totalDocs > 0 ? totalValue / totalDocs : 0;

  const DOC_TYPE_LABELS: Record<string, string> = {
    invoice: "Invoice", tax_invoice: "Tax Invoice", proforma: "Proforma",
    receipt: "Receipt", sales_receipt: "Sales Receipt", cash_receipt: "Cash Receipt",
    quote: "Quote", estimate: "Estimate", credit_note: "Credit Note",
    purchase_order: "Purchase Order", delivery_note: "Delivery Note",
  };

  const STATUS_COLORS: Record<string, string> = {
    draft: "text-gray-400", sent: "text-blue-400", viewed: "text-yellow-400",
    paid: "text-green-400", overdue: "text-red-400", cancelled: "text-gray-600",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session?.user?.name || "Admin"}
        </h1>
        <p className="text-gray-400 mt-1">
          Here&apos;s everything happening on Invoiceify right now
        </p>
      </div>

      {/* Top Stats — 2 rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Total Invoices Created", value: totalDocs, color: "text-white", sub: `${guestDocs} guest / ${userDocs} logged-in` },
          { label: "Total Value Invoiced", value: formatCurrency(totalValue), color: "text-amber-400", sub: `Avg ${formatCurrency(avgValue)} per doc` },
          { label: "Registered Accounts", value: totalUsers, color: "text-purple-400", sub: `${usersThisMonth} new this month` },
          { label: "Today", value: docsToday, color: "text-green-400", sub: `${docsThisWeek} this week / ${docsThisMonth} this month` },
          { label: "Form Sessions", value: totalSessions, color: "text-cyan-400", sub: `${completedSessions} completed / ${totalSessions - completedSessions} abandoned` },
          { label: "Completion Rate", value: totalSessions > 0 ? `${Math.round((completedSessions / totalSessions) * 100)}%` : "N/A", color: "text-emerald-400", sub: `${completedSessions} of ${totalSessions} sessions converted` },
          { label: "Field Changes Logged", value: totalFieldLogs.toLocaleString(), color: "text-orange-400", sub: `Real-time keystroke data` },
          { label: "Avg Fields per Session", value: totalSessions > 0 ? Math.round(totalFieldLogs / totalSessions) : 0, color: "text-pink-400", sub: "Engagement depth metric" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-600 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* Documents by Type */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            By Document Type
          </h2>
          <div className="space-y-2.5">
            {docsByType.map((row) => (
              <div key={row.type} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {DOC_TYPE_LABELS[row.type] || row.type}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${totalDocs > 0 ? (row._count.id / totalDocs) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white w-6 text-right">
                    {row._count.id}
                  </span>
                </div>
              </div>
            ))}
            {docsByType.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* By Currency */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            By Currency
          </h2>
          <div className="space-y-2.5">
            {docsByCurrency.map((row) => (
              <div key={row.currency} className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">{row.currency}</span>
                <span className="text-xs font-medium text-white">{row._count.id}</span>
              </div>
            ))}
            {docsByCurrency.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* By Country */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            By Country
          </h2>
          <div className="space-y-2.5">
            {docsByCountry.slice(0, 8).map((row) => (
              <div key={row.ipCountry} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{row.ipCountry || "Unknown"}</span>
                <span className="text-xs font-medium text-white">{row._count.id}</span>
              </div>
            ))}
            {docsByCountry.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* By Status */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            By Status
          </h2>
          <div className="space-y-2.5">
            {docsByStatus.map((row) => (
              <div key={row.status} className="flex items-center justify-between">
                <span className={`text-xs font-medium ${STATUS_COLORS[row.status] || "text-gray-400"}`}>
                  {row.status}
                </span>
                <span className="text-xs font-medium text-white">{row._count.id}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Guest documents</span>
              <span className="text-gray-400">{guestDocs}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">User documents</span>
              <span className="text-gray-400">{userDocs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Signups */}
      {recentUsers.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <div className="px-6 py-3 border-b border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Recent Signups
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-6 py-2.5 flex items-center gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-[10px] font-bold shrink-0">
                  {(u.name?.[0] || u.email[0]).toUpperCase()}
                </div>
                <span className="text-white font-medium">{u.name || "Unnamed"}</span>
                <span className="text-gray-500">{u.email}</span>
                <span className="text-gray-700 ml-auto">
                  {u.provider} &middot; {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-Time Activity Feed */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-6 py-3 border-b border-gray-800">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Live Activity Feed — All Submitted Documents
          </h2>
        </div>
        <div className="divide-y divide-gray-800">
          {recentDocs.map((doc) => {
            const sender = doc.senderInfo as Record<string, string> | null;
            const recipient = doc.recipientInfo as Record<string, string> | null;
            return (
              <div key={doc.id} className="px-6 py-3 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">{doc.documentNumber}</span>
                    {" "}
                    <span className="text-gray-500">{DOC_TYPE_LABELS[doc.type] || doc.type}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {sender?.businessName || "Unknown sender"}
                    {recipient?.businessName && ` → ${recipient.businessName}`}
                    {doc.notes && ` · "${doc.notes.slice(0, 40)}${doc.notes.length > 40 ? "..." : ""}"`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                  {doc.ipCountry && <span>{doc.ipCountry}</span>}
                  <span className="font-mono">{doc.currency}</span>
                  <span className="font-medium text-gray-300">
                    {Number(doc.grandTotal).toFixed(2)}
                  </span>
                  <span className={doc.userId ? "text-blue-400" : "text-gray-600"}>
                    {doc.userId ? "User" : "Guest"}
                  </span>
                  <span className="text-gray-700">
                    {new Date(doc.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
          {recentDocs.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-600">
              No documents created yet — share the link with friends!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
