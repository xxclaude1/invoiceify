import Link from "next/link";
import Button from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Welcome Message */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-4">
              Create professional invoices{" "}
              <span className="text-accent">for free</span>
            </h1>
            <p className="text-lg text-text-secondary mb-8 max-w-lg">
              Generate invoices, receipts, quotes, estimates, and more in just a
              few clicks. No account needed — download your PDF instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/create">
                <Button variant="primary" size="lg">
                  Start creating your invoice
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  See how it works
                </Button>
              </a>
            </div>

            {/* Quick stats */}
            <div className="mt-10 flex items-center gap-8">
              <div>
                <div className="text-2xl font-bold text-primary">11</div>
                <div className="text-xs text-text-secondary">Document types</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="text-2xl font-bold text-primary">6</div>
                <div className="text-xs text-text-secondary">Templates</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-xs text-text-secondary">Free</div>
              </div>
            </div>
          </div>

          {/* Right — Document Types Preview Card */}
          <div className="bg-white rounded-2xl border border-border shadow-lg p-6">
            <p className="text-sm font-medium text-text-secondary mb-4">
              Choose from 11 document types:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {DOCUMENT_TYPES.map((doc) => (
                <Link
                  key={doc.label}
                  href={`/create`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.bgColor} ${doc.iconColor}`}
                  >
                    {doc.icon}
                  </div>
                  <span className="text-[11px] font-medium text-text-primary leading-tight text-center group-hover:text-accent transition-colors">
                    {doc.label}
                  </span>
                </Link>
              ))}
              {/* View all link */}
              <Link
                href="/create"
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-accent transition-all group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface text-text-secondary group-hover:text-accent">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-text-secondary group-hover:text-accent transition-colors">
                  View all
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Document types with individual colors for the icons
const DOCUMENT_TYPES = [
  {
    label: "Invoice",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Tax Invoice",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    label: "Proforma",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Receipt",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Sales Receipt",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    label: "Quote",
    bgColor: "bg-violet-50",
    iconColor: "text-violet-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    label: "Estimate",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Credit Note",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Purchase Order",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
  },
  {
    label: "Delivery Note",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
];
