"use client";

import { useWizard } from "./wizard-context";
import { formatCurrency } from "@/lib/utils";

export default function StepItems() {
  const {
    state,
    dispatch,
    subtotal,
    taxTotal,
    discountTotal,
    grandTotal,
    onFieldFocus,
    onFieldBlur,
  } = useWizard();

  const isDeliveryNote = state.documentType === "delivery_note";

  return (
    <div>
      <p className="text-sm text-text-secondary mb-4">
        {isDeliveryNote
          ? "Add the items being delivered:"
          : "Add your line items:"}
      </p>

      {/* Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-xs font-medium text-text-secondary w-[40%]">
                Description
              </th>
              <th className="text-right py-2 px-2 text-xs font-medium text-text-secondary w-[12%]">
                Qty
              </th>
              {!isDeliveryNote && (
                <>
                  <th className="text-right py-2 px-2 text-xs font-medium text-text-secondary w-[15%]">
                    Unit Price
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-text-secondary w-[10%]">
                    Tax %
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-text-secondary w-[12%]">
                    Discount
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-text-secondary w-[13%]">
                    Total
                  </th>
                </>
              )}
              <th className="w-[40px]" />
            </tr>
          </thead>
          <tbody>
            {state.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="py-2 px-2">
                  <input
                    type="text"
                    placeholder="Item description"
                    className="w-full px-2 py-2 text-base sm:text-sm rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent"
                    value={item.description}
                    onFocus={() => onFieldFocus(`lineItem.${item.id}.description`)}
                    onBlur={() => onFieldBlur(`lineItem.${item.id}.description`)}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_LINE_ITEM",
                        id: item.id,
                        field: "description",
                        value: e.target.value,
                      })
                    }
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full px-2 py-2 text-base sm:text-sm text-right rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent"
                    value={item.quantity || ""}
                    onFocus={() => onFieldFocus(`lineItem.${item.id}.quantity`)}
                    onBlur={() => onFieldBlur(`lineItem.${item.id}.quantity`)}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_LINE_ITEM",
                        id: item.id,
                        field: "quantity",
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </td>
                {!isDeliveryNote && (
                  <>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-2 py-2 text-base sm:text-sm text-right rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent"
                        value={item.unitPrice || ""}
                        onFocus={() => onFieldFocus(`lineItem.${item.id}.unitPrice`)}
                        onBlur={() => onFieldBlur(`lineItem.${item.id}.unitPrice`)}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_LINE_ITEM",
                            id: item.id,
                            field: "unitPrice",
                            value: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0"
                        className="w-full px-2 py-2 text-base sm:text-sm text-right rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent"
                        value={item.taxRate ?? ""}
                        onFocus={() => onFieldFocus(`lineItem.${item.id}.taxRate`)}
                        onBlur={() => onFieldBlur(`lineItem.${item.id}.taxRate`)}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_LINE_ITEM",
                            id: item.id,
                            field: "taxRate",
                            value:
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-2 py-2 text-base sm:text-sm text-right rounded border border-border bg-white focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent"
                        value={item.discount ?? ""}
                        onFocus={() => onFieldFocus(`lineItem.${item.id}.discount`)}
                        onBlur={() => onFieldBlur(`lineItem.${item.id}.discount`)}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_LINE_ITEM",
                            id: item.id,
                            field: "discount",
                            value:
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-text-primary">
                      {formatCurrency(item.lineTotal, state.currency)}
                    </td>
                  </>
                )}
                <td className="py-2 px-1">
                  {state.lineItems.length > 1 && (
                    <button
                      onClick={() =>
                        dispatch({ type: "REMOVE_LINE_ITEM", id: item.id })
                      }
                      className="p-1 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Button */}
      <button
        onClick={() => dispatch({ type: "ADD_LINE_ITEM" })}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark transition-colors cursor-pointer"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add item
      </button>

      {/* Totals Summary */}
      {!isDeliveryNote && (
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary">
                {formatCurrency(subtotal, state.currency)}
              </span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Discount</span>
                <span className="text-red-500">
                  -{formatCurrency(discountTotal, state.currency)}
                </span>
              </div>
            )}
            {taxTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax</span>
                <span className="text-text-primary">
                  {formatCurrency(taxTotal, state.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-border pt-2">
              <span className="text-text-primary">Total</span>
              <span className="text-primary">
                {formatCurrency(grandTotal, state.currency)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
