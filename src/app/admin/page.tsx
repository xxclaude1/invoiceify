import { prisma } from "@/lib/db";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function AdminOverviewPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalDocs,
    docsThisMonth,
    docsToday,
    totalUsers,
    allDocs,
    docsByType,
    docsByCurrency,
    docsByCountry,
    recentDocs,
  ] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.document.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.user.count(),
    prisma.document.findMany({ select: { grandTotal: true } }),
    prisma.document.groupBy({ by: ["type"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.document.groupBy({ by: ["currency"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    prisma.document.groupBy({ by: ["ipCountry"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, where: { ipCountry: { not: null } } }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        type: true,
        documentNumber: true,
        currency: true,
        grandTotal: true,
        ipCountry: true,
        userAgent: true,
        createdAt: true,
        userId: true,
        senderInfo: true,
      },
    }),
  ]);

  const totalValue = allDocs.reduce((sum, d) => sum + Number(d.grandTotal), 0);
  const guestDocs = await prisma.document.count({ where: { userId: null } });

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-gray-400 mt-1">
          Full visibility into all Invoiceify data
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Documents", value: totalDocs, color: "text-white" },
          { label: "This Month", value: docsThisMonth, color: "text-blue-400" },
          { label: "Today", value: docsToday, color: "text-green-400" },
          { label: "Total Value", value: formatCurrency(totalValue), color: "text-amber-400" },
          { label: "Registered Users", value: totalUsers, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Documents by Type */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
            By Document Type
          </h2>
          <div className="space-y-3">
            {docsByType.map((row) => (
              <div key={row.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {DOC_TYPE_LABELS[row.type] || row.type}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${totalDocs > 0 ? (row._count.id / totalDocs) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-8 text-right">
                    {row._count.id}
                  </span>
                </div>
              </div>
            ))}
            {docsByType.length === 0 && (
              <p className="text-sm text-gray-600">No data yet</p>
            )}
          </div>
        </div>

        {/* Documents by Currency */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
            By Currency
          </h2>
          <div className="space-y-3">
            {docsByCurrency.map((row) => (
              <div key={row.currency} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{row.currency}</span>
                <span className="text-sm font-medium text-white">{row._count.id}</span>
              </div>
            ))}
            {docsByCurrency.length === 0 && (
              <p className="text-sm text-gray-600">No data yet</p>
            )}
          </div>
        </div>

        {/* Documents by Country */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
            By Country
          </h2>
          <div className="space-y-3">
            {docsByCountry.map((row) => (
              <div key={row.ipCountry} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{row.ipCountry || "Unknown"}</span>
                <span className="text-sm font-medium text-white">{row._count.id}</span>
              </div>
            ))}
            {docsByCountry.length === 0 && (
              <p className="text-sm text-gray-600">No data yet</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs">
            <span className="text-gray-500">Guest documents</span>
            <span className="text-gray-400 font-medium">{guestDocs}</span>
          </div>
        </div>
      </div>

      {/* Real-Time Activity Feed */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-gray-800">
          {recentDocs.map((doc) => {
            const sender = doc.senderInfo as { businessName?: string } | null;
            return (
              <div key={doc.id} className="px-6 py-3 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">
                      {doc.documentNumber}
                    </span>
                    {" "}
                    <span className="text-gray-500">
                      {DOC_TYPE_LABELS[doc.type] || doc.type}
                    </span>
                    {sender?.businessName && (
                      <span className="text-gray-500">
                        {" "}by {sender.businessName}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                  {doc.ipCountry && (
                    <span>{doc.ipCountry}</span>
                  )}
                  <span>{doc.currency}</span>
                  <span className="font-medium text-gray-300">
                    {Number(doc.grandTotal).toFixed(2)}
                  </span>
                  <span className={doc.userId ? "text-blue-400" : "text-gray-600"}>
                    {doc.userId ? "User" : "Guest"}
                  </span>
                  <span className="text-gray-600">
                    {new Date(doc.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
          {recentDocs.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-600">
              No documents created yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
