import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
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

export default async function DocumentsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const documents = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { lineItems: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Documents</h1>
          <p className="text-text-secondary mt-1">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/create"
          className="bg-accent hover:bg-accent/90 text-white font-medium px-4 py-2.5 rounded-lg transition text-sm"
        >
          + New Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-border px-6 py-16 text-center">
          <svg
            className="w-12 h-12 mx-auto text-text-secondary/30 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <p className="text-text-secondary mb-4">
            You haven&apos;t created any documents yet.
          </p>
          <Link
            href="/create"
            className="inline-block bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-lg transition text-sm"
          >
            Create Your First Document
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-surface text-xs font-medium text-text-secondary uppercase tracking-wider border-b border-border">
            <div className="col-span-3">Document</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Recipient</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {documents.map((doc) => {
              const recipient = doc.recipientInfo as { businessName?: string } | null;
              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-surface/50 transition items-center"
                >
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-text-primary">
                      {doc.documentNumber}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary">
                      {DOC_TYPE_LABELS[doc.type] || doc.type}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary truncate">
                      {recipient?.businessName || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary">
                      {formatDate(doc.issueDate)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[doc.status] || STATUS_COLORS.draft}`}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-semibold text-text-primary">
                      {formatCurrency(Number(doc.grandTotal), doc.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
