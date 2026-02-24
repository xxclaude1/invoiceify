import { prisma } from "@/lib/db";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { documents: true, clients: true } },
      documents: { select: { grandTotal: true, currency: true, type: true, createdAt: true } },
    },
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">All Users</h1>
          <p className="text-gray-400 mt-1">
            {totalUsers} registered user{totalUsers !== 1 ? "s" : ""} ({adminCount} admin{adminCount !== 1 ? "s" : ""})
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {users.map((user) => {
          const totalInvoiced = user.documents.reduce((sum, d) => sum + Number(d.grandTotal), 0);
          const lastDoc = user.documents.length > 0
            ? user.documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            : null;

          return (
            <div key={user.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              {/* User Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 text-lg font-bold shrink-0">
                  {(user.name?.[0] || user.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {user.name || "Unnamed User"}
                    </h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      user.role === "admin" ? "bg-red-500/20 text-red-400" : "bg-gray-700 text-gray-400"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">User ID</p>
                  <p className="text-xs text-gray-300 font-mono mt-1">{user.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Auth Provider</p>
                  <p className="text-sm text-gray-300 mt-1">{user.provider}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Signed Up</p>
                  <p className="text-sm text-gray-300 mt-1">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</p>
                  <p className="text-sm text-gray-300 mt-1">{formatDate(user.updatedAt)}</p>
                </div>
              </div>

              {/* Business Details */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Business Name</p>
                  <p className="text-sm text-gray-300 mt-1">{user.businessName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tax ID</p>
                  <p className="text-sm text-gray-300 mt-1">{user.taxId || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Default Currency</p>
                  <p className="text-sm text-gray-300 mt-1">{user.defaultCurrency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Password Set</p>
                  <p className="text-sm text-gray-300 mt-1">{user.passwordHash ? "Yes" : "No (OAuth)"}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Documents:</span>
                  <span className="text-sm font-medium text-white">{user._count.documents}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Clients:</span>
                  <span className="text-sm font-medium text-white">{user._count.clients}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Total Invoiced:</span>
                  <span className="text-sm font-medium text-amber-400">{formatCurrency(totalInvoiced)}</span>
                </div>
                {lastDoc && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Last Active:</span>
                    <span className="text-xs text-gray-400">{formatDate(lastDoc.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 px-6 py-12 text-center text-gray-600">
            No users registered yet
          </div>
        )}
      </div>
    </div>
  );
}
