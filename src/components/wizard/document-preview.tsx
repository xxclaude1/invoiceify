"use client";

import { useWizard } from "./wizard-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DOCUMENT_TYPE_CONFIGS } from "@/types";
import { cn } from "@/lib/utils";

const TEMPLATE_STYLES: Record<string, { bg: string; titleColor: string; textColor: string; mutedColor: string; accentBg: string; borderColor: string; totalColor: string }> = {
  classic: { bg: "bg-white", titleColor: "text-primary", textColor: "text-gray-800", mutedColor: "text-gray-400", accentBg: "bg-gray-50", borderColor: "border-gray-200", totalColor: "text-primary" },
  modern: { bg: "bg-white", titleColor: "text-accent", textColor: "text-gray-800", mutedColor: "text-gray-400", accentBg: "bg-accent/5", borderColor: "border-accent/20", totalColor: "text-accent" },
  minimal: { bg: "bg-white", titleColor: "text-gray-700", textColor: "text-gray-600", mutedColor: "text-gray-300", accentBg: "bg-gray-50", borderColor: "border-gray-100", totalColor: "text-gray-800" },
  corporate: { bg: "bg-white", titleColor: "text-blue-700", textColor: "text-gray-800", mutedColor: "text-gray-400", accentBg: "bg-blue-50", borderColor: "border-blue-200", totalColor: "text-blue-700" },
  creative: { bg: "bg-white", titleColor: "text-purple-700", textColor: "text-gray-800", mutedColor: "text-gray-400", accentBg: "bg-purple-50", borderColor: "border-purple-200", totalColor: "text-purple-700" },
  dark: { bg: "bg-gray-900", titleColor: "text-white", textColor: "text-gray-200", mutedColor: "text-gray-500", accentBg: "bg-gray-800", borderColor: "border-gray-700", totalColor: "text-green-400" },
};

export default function DocumentPreview() {
  const { state, subtotal, taxTotal, discountTotal, grandTotal } = useWizard();

  const config = DOCUMENT_TYPE_CONFIGS.find(
    (c) => c.type === state.documentType
  );
  const docLabel = config?.label.toUpperCase() ?? "DOCUMENT";
  const isDeliveryNote = state.documentType === "delivery_note";
  const t = TEMPLATE_STYLES[state.templateId] || TEMPLATE_STYLES.classic;

  if (!state.documentType) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-6 h-full">
        <h3 className="text-lg font-bold text-text-primary mb-2">
          Live Preview
        </h3>
        <div className="bg-white rounded-xl border border-border aspect-[3/4] flex items-center justify-center">
          <div className="text-center px-8">
            <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">
              Select a document type to see a live preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <h3 className="text-sm font-bold text-text-primary mb-3">
        Live Preview
        <span className="text-xs font-normal text-text-secondary ml-2">
          {state.templateId.charAt(0).toUpperCase() + state.templateId.slice(1)} template
        </span>
      </h3>
      <div className={cn("rounded-xl border p-5 text-[11px] leading-relaxed shadow-sm transition-colors duration-300", t.bg, t.borderColor)}>
        {/* Document Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className={cn("text-base font-bold", t.titleColor)}>{docLabel}</div>
            <div className={cn("mt-1", t.mutedColor)}>
              {state.documentNumber && <span>{state.documentNumber}</span>}
            </div>
          </div>
          <div className="text-right">
            {state.senderInfo.businessName && (
              <div className={cn("font-bold", t.textColor)}>
                {state.senderInfo.businessName}
              </div>
            )}
            {state.senderInfo.email && (
              <div className={t.mutedColor}>{state.senderInfo.email}</div>
            )}
            {state.senderInfo.address?.city && (
              <div className={t.mutedColor}>
                {state.senderInfo.address.city}
                {state.senderInfo.address.country &&
                  `, ${state.senderInfo.address.country}`}
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className={cn("flex gap-4 mb-4", t.mutedColor)}>
          {state.issueDate && (
            <div>
              <span className="font-medium">Date: </span>
              {formatDate(state.issueDate)}
            </div>
          )}
          {state.dueDate && (
            <div>
              <span className="font-medium">Due: </span>
              {formatDate(state.dueDate)}
            </div>
          )}
        </div>

        {/* Bill To */}
        {state.recipientInfo.businessName && (
          <div className={cn("mb-4 p-2 rounded", t.accentBg)}>
            <div className={cn("text-[10px] font-medium uppercase tracking-wider mb-1", t.mutedColor)}>
              Bill To
            </div>
            <div className={cn("font-medium", t.textColor)}>
              {state.recipientInfo.businessName}
            </div>
            {state.recipientInfo.email && (
              <div className={t.mutedColor}>
                {state.recipientInfo.email}
              </div>
            )}
          </div>
        )}

        {/* Line Items */}
        {state.lineItems.some((item) => item.description) && (
          <div className="mb-4">
            <table className="w-full text-[10px]">
              <thead>
                <tr className={cn("border-b", t.borderColor)}>
                  <th className={cn("text-left py-1 font-medium", t.mutedColor)}>
                    Description
                  </th>
                  <th className={cn("text-right py-1 font-medium", t.mutedColor)}>
                    Qty
                  </th>
                  {!isDeliveryNote && (
                    <>
                      <th className={cn("text-right py-1 font-medium", t.mutedColor)}>
                        Price
                      </th>
                      <th className={cn("text-right py-1 font-medium", t.mutedColor)}>
                        Total
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {state.lineItems
                  .filter((item) => item.description)
                  .map((item) => (
                    <tr key={item.id} className={cn("border-b", t.borderColor, "border-opacity-30")}>
                      <td className={cn("py-1", t.textColor)}>
                        {item.description}
                      </td>
                      <td className={cn("py-1 text-right", t.textColor)}>
                        {item.quantity}
                      </td>
                      {!isDeliveryNote && (
                        <>
                          <td className={cn("py-1 text-right", t.textColor)}>
                            {formatCurrency(item.unitPrice, state.currency)}
                          </td>
                          <td className={cn("py-1 text-right font-medium", t.textColor)}>
                            {formatCurrency(item.lineTotal, state.currency)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        {!isDeliveryNote && grandTotal > 0 && (
          <div className={cn("border-t pt-2 space-y-1", t.borderColor)}>
            <div className={cn("flex justify-between", t.mutedColor)}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, state.currency)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>-{formatCurrency(discountTotal, state.currency)}</span>
              </div>
            )}
            {taxTotal > 0 && (
              <div className={cn("flex justify-between", t.mutedColor)}>
                <span>Tax</span>
                <span>{formatCurrency(taxTotal, state.currency)}</span>
              </div>
            )}
            <div className={cn("flex justify-between font-bold text-xs pt-1 border-t", t.totalColor, t.borderColor)}>
              <span>Total</span>
              <span>{formatCurrency(grandTotal, state.currency)}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {state.notes && (
          <div className={cn("mt-3 pt-2 border-t", t.borderColor)}>
            <div className={cn("text-[10px] font-medium mb-0.5", t.mutedColor)}>
              Notes
            </div>
            <div className={t.textColor}>{state.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className={cn("mt-4 pt-2 border-t text-center text-[9px]", t.borderColor, t.mutedColor)}>
          Created with Invoiceify
        </div>
      </div>
    </div>
  );
}
