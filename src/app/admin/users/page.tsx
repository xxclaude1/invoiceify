import { prisma } from "@/lib/db";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { documents: true, clients: true } },
      documents: { select: { grandTotal: true } },
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

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-12 gap-2 px-4 py-3 bg-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">User</div>
          <div className="col-span-2">Business</div>
          <div className="col-span-1">Role</div>
          <div className="col-span-1">Documents</div>
          <div className="col-span-1">Clients</div>
          <div className="col-span-2">Total Invoiced</div>
          <div className="col-span-2">Signed Up</div>
        </div>

        <div className="divide-y divide-gray-800">
          {users.map((user) => {
            const totalInvoiced = user.documents.reduce(
              (sum, d) => sum + Number(d.grandTotal),
              0
            );

            return (
              <div
                key={user.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-800/30 transition items-center"
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-sm font-bold shrink-0">
                    {(user.name?.[0] || user.email[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 truncate">
                    {user.businessName || "-"}
                  </p>
                </div>
                <div className="col-span-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      user.role === "admin"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="col-span-1">
                  <p className="text-sm text-gray-300">{user._count.documents}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-sm text-gray-300">{user._count.clients}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-300">
                    {formatCurrency(totalInvoiced)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">
                    {formatDate(user.createdAt)}
                  </p>
                  <p className="text-xs text-gray-700">{user.id.slice(0, 8)}...</p>
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-600">
              No users registered yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
