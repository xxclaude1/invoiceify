"use client";

import { useWizard } from "./wizard-context";
import { DOCUMENT_TYPE_CONFIGS, DocumentType } from "@/types";
import { cn } from "@/lib/utils";

// Each icon type gets its own color
const ICON_STYLES: Record<string, { bg: string; text: string; selectedBg: string; selectedText: string }> = {
  receipt:        { bg: "bg-teal-50",    text: "text-teal-600",    selectedBg: "bg-teal-100",    selectedText: "text-teal-700" },
  "receipt-tax":  { bg: "bg-emerald-50", text: "text-emerald-600", selectedBg: "bg-emerald-100", selectedText: "text-emerald-700" },
  document:       { bg: "bg-cyan-50",    text: "text-cyan-600",    selectedBg: "bg-cyan-100",    selectedText: "text-cyan-700" },
  "check-receipt":{ bg: "bg-green-50",   text: "text-green-600",   selectedBg: "bg-green-100",   selectedText: "text-green-700" },
  "shopping-bag": { bg: "bg-blue-50",    text: "text-blue-600",    selectedBg: "bg-blue-100",    selectedText: "text-blue-700" },
  cash:           { bg: "bg-lime-50",    text: "text-lime-600",    selectedBg: "bg-lime-100",    selectedText: "text-lime-700" },
  quote:          { bg: "bg-violet-50",  text: "text-violet-600",  selectedBg: "bg-violet-100",  selectedText: "text-violet-700" },
  calculator:     { bg: "bg-amber-50",   text: "text-amber-600",   selectedBg: "bg-amber-100",   selectedText: "text-amber-700" },
  credit:         { bg: "bg-rose-50",    text: "text-rose-600",    selectedBg: "bg-rose-100",    selectedText: "text-rose-700" },
  cart:           { bg: "bg-indigo-50",  text: "text-indigo-600",  selectedBg: "bg-indigo-100",  selectedText: "text-indigo-700" },
  truck:          { bg: "bg-orange-50",  text: "text-orange-600",  selectedBg: "bg-orange-100",  selectedText: "text-orange-700" },
};

const ICONS: Record<string, React.ReactNode> = {
  receipt: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "receipt-tax": (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  ),
  document: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  "check-receipt": (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "shopping-bag": (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  cash: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  quote: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  calculator: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  credit: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  cart: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  ),
  truck: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
};

export default function StepDocument() {
  const { state, dispatch } = useWizard();

  return (
    <div>
      <p className="text-sm text-text-secondary mb-4">
        Choose the document you want to generate:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {DOCUMENT_TYPE_CONFIGS.map((config) => {
          const selected = state.documentType === config.type;
          const style = ICON_STYLES[config.icon] ?? ICON_STYLES.receipt;
          return (
            <button
              key={config.type}
              onClick={() =>
                dispatch({
                  type: "SET_DOCUMENT_TYPE",
                  documentType: config.type as DocumentType,
                })
              }
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center cursor-pointer",
                selected
                  ? "border-accent bg-accent/5 shadow-sm"
                  : "border-border hover:border-primary/30 hover:bg-surface"
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-lg flex items-center justify-center",
                  selected
                    ? `${style.selectedBg} ${style.selectedText}`
                    : `${style.bg} ${style.text}`
                )}
              >
                {ICONS[config.icon] || ICONS.receipt}
              </div>
              <span className="text-xs font-medium text-text-primary leading-tight">
                {config.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
