"use client";

import { useWizard } from "./wizard-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DOCUMENT_TYPE_CONFIGS } from "@/types";

export default function DocumentPreview() {
  const { state, subtotal, taxTotal, discountTotal, grandTotal } = useWizard();

  const config = DOCUMENT_TYPE_CONFIGS.find(
    (c) => c.type === state.documentType
  );
  const docLabel = config?.label.toUpperCase() ?? "DOCUMENT";
  const isDeliveryNote = state.documentType === "delivery_note";

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
      <h3 className="text-sm font-bold text-text-primary mb-3">Live Preview</h3>
      <div className="bg-white rounded-xl border border-border p-5 text-[11px] leading-relaxed shadow-sm">
        {/* Document Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-base font-bold text-primary">{docLabel}</div>
            <div className="text-text-secondary mt-1">
              {state.documentNumber && <span>{state.documentNumber}</span>}
            </div>
          </div>
          <div className="text-right">
            {state.senderInfo.businessName && (
              <div className="font-bold text-text-primary">
                {state.senderInfo.businessName}
              </div>
            )}
            {state.senderInfo.email && (
              <div className="text-text-secondary">{state.senderInfo.email}</div>
            )}
            {state.senderInfo.address?.city && (
              <div className="text-text-secondary">
                {state.senderInfo.address.city}
                {state.senderInfo.address.country &&
                  `, ${state.senderInfo.address.country}`}
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-4 mb-4 text-text-secondary">
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
          <div className="mb-4 p-2 bg-surface rounded">
            <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1">
              Bill To
            </div>
            <div className="font-medium text-text-primary">
              {state.recipientInfo.businessName}
            </div>
            {state.recipientInfo.email && (
              <div className="text-text-secondary">
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
                <tr className="border-b border-border">
                  <th className="text-left py-1 font-medium text-text-secondary">
                    Description
                  </th>
                  <th className="text-right py-1 font-medium text-text-secondary">
                    Qty
                  </th>
                  {!isDeliveryNote && (
                    <>
                      <th className="text-right py-1 font-medium text-text-secondary">
                        Price
                      </th>
                      <th className="text-right py-1 font-medium text-text-secondary">
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
                    <tr key={item.id} className="border-b border-border/30">
                      <td className="py-1 text-text-primary">
                        {item.description}
                      </td>
                      <td className="py-1 text-right text-text-primary">
                        {item.quantity}
                      </td>
                      {!isDeliveryNote && (
                        <>
                          <td className="py-1 text-right text-text-primary">
                            {formatCurrency(item.unitPrice, state.currency)}
                          </td>
                          <td className="py-1 text-right font-medium text-text-primary">
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
          <div className="border-t border-border pt-2 space-y-1">
            <div className="flex justify-between text-text-secondary">
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
              <div className="flex justify-between text-text-secondary">
                <span>Tax</span>
                <span>{formatCurrency(taxTotal, state.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-primary text-xs pt-1 border-t border-border">
              <span>Total</span>
              <span>{formatCurrency(grandTotal, state.currency)}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {state.notes && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <div className="text-[10px] font-medium text-text-secondary mb-0.5">
              Notes
            </div>
            <div className="text-text-primary">{state.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-border/30 text-center text-text-muted text-[9px]">
          Created with Invoiceify
        </div>
      </div>
    </div>
  );
}
