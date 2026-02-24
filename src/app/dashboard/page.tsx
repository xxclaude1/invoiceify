import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

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

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [documents, totalCount] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { lineItems: true },
    }),
    prisma.document.count({ where: { userId } }),
  ]);

  const totalInvoiced = documents.reduce(
    (sum, d) => sum + Number(d.grandTotal),
    0
  );
  const totalPaid = documents
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + Number(d.grandTotal), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Welcome back, {session!.user.name || "there"}
          </p>
        </div>
        <Link
          href="/create"
          className="bg-accent hover:bg-accent/90 text-white font-medium px-4 py-2.5 rounded-lg transition text-sm"
        >
          + New Document
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Total Documents
          </p>
          <p className="text-2xl font-bold text-text-primary mt-1">
            {totalCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Total Invoiced
          </p>
          <p className="text-2xl font-bold text-text-primary mt-1">
            {formatCurrency(totalInvoiced)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Paid
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Outstanding
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Recent Documents</h2>
          {totalCount > 0 && (
            <Link
              href="/dashboard/documents"
              className="text-sm text-accent hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-text-secondary mb-4">
              No documents yet. Create your first one!
            </p>
            <Link
              href="/create"
              className="inline-block bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-lg transition text-sm"
            >
              Create Document
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-surface/50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {doc.documentNumber}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[doc.status] || STATUS_COLORS.draft}`}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {DOC_TYPE_LABELS[doc.type] || doc.type} &middot;{" "}
                    {formatDate(doc.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-text-primary whitespace-nowrap">
                  {formatCurrency(Number(doc.grandTotal))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
