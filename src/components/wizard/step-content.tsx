"use client";

import { useWizard } from "./wizard-context";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import SignaturePad from "@/components/ui/signature-pad";
import { CURRENCIES, DOCUMENT_TYPE_CONFIGS } from "@/types";

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "JP", label: "Japan" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "NZ", label: "New Zealand" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "ZA", label: "South Africa" },
  { value: "IE", label: "Ireland" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "CH", label: "Switzerland" },
  { value: "OTHER", label: "Other" },
];

export default function StepContent() {
  const { state, dispatch } = useWizard();

  const config = DOCUMENT_TYPE_CONFIGS.find(
    (c) => c.type === state.documentType
  );
  const showDueDate = config?.hasDueDate ?? false;
  const isReceipt = ["receipt", "sales_receipt", "cash_receipt"].includes(
    state.documentType ?? ""
  );
  const isCreditNote = state.documentType === "credit_note";
  const isPurchaseOrder = state.documentType === "purchase_order";
  const isDeliveryNote = state.documentType === "delivery_note";

  return (
    <div className="space-y-8">
      {/* FROM — Sender Info */}
      <div>
        <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
            1
          </span>
          {isPurchaseOrder ? "From (Buyer)" : "From (Your Business)"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Business Name *"
            placeholder="Your Company Ltd."
            value={state.senderInfo.businessName ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_SENDER_INFO",
                info: { businessName: e.target.value },
              })
            }
          />
          <Input
            label="Contact Name"
            placeholder="John Smith"
            value={state.senderInfo.contactName ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_SENDER_INFO",
                info: { contactName: e.target.value },
              })
            }
          />
          <Input
            label="Email *"
            type="email"
            placeholder="hello@company.com"
            value={state.senderInfo.email ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_SENDER_INFO",
                info: { email: e.target.value },
              })
            }
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={state.senderInfo.phone ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_SENDER_INFO",
                info: { phone: e.target.value },
              })
            }
          />
          <Input
            label="Address"
            placeholder="123 Main Street"
            value={state.senderInfo.address?.line1 ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_SENDER_INFO",
                info: {
                  address: {
                    ...state.senderInfo.address,
                    line1: e.target.value,
                    city: state.senderInfo.address?.city ?? "",
                    postalCode: state.senderInfo.address?.postalCode ?? "",
                    country: state.senderInfo.address?.country ?? "",
                  },
                },
              })
            }
          />
          <Input
            label="City"
            placeholder="New York"
            value={state.senderInfo.address?.city ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_SENDER_INFO",
                info: {
                  address: {
                    ...state.senderInfo.address,
                    line1: state.senderInfo.address?.line1 ?? "",
                    city: e.target.value,
                    postalCode: state.senderInfo.address?.postalCode ?? "",
                    country: state.senderInfo.address?.country ?? "",
                  },
                },
              })
            }
          />
          <Input
            label="Postal / ZIP Code"
            placeholder="10001"
            value={state.senderInfo.address?.postalCode ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_SENDER_INFO",
                info: {
                  address: {
                    ...state.senderInfo.address,
                    line1: state.senderInfo.address?.line1 ?? "",
                    city: state.senderInfo.address?.city ?? "",
                    postalCode: e.target.value,
                    country: state.senderInfo.address?.country ?? "",
                  },
                },
              })
            }
          />
          <Select
            label="Country"
            value={state.senderInfo.address?.country ?? ""}
            options={[{ value: "", label: "Select country" }, ...COUNTRIES]}
            onChange={(e) =>
              dispatch({
                type: "SET_SENDER_INFO",
                info: {
                  address: {
                    ...state.senderInfo.address,
                    line1: state.senderInfo.address?.line1 ?? "",
                    city: state.senderInfo.address?.city ?? "",
                    postalCode: state.senderInfo.address?.postalCode ?? "",
                    country: e.target.value,
                  },
                },
              })
            }
          />
          <Input
            label="Tax ID / VAT Number"
            placeholder="US12-3456789"
            value={state.senderInfo.taxId ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_SENDER_INFO",
                info: { taxId: e.target.value },
              })
            }
          />
        </div>
      </div>

      {/* TO — Recipient Info */}
      <div>
        <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
            2
          </span>
          {isPurchaseOrder ? "To (Supplier)" : "To (Client)"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Client / Business Name *"
            placeholder="Client Company Inc."
            value={state.recipientInfo.businessName ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_RECIPIENT_INFO",
                info: { businessName: e.target.value },
              })
            }
          />
          <Input
            label="Contact Name"
            placeholder="Jane Doe"
            value={state.recipientInfo.contactName ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_RECIPIENT_INFO",
                info: { contactName: e.target.value },
              })
            }
          />
          <Input
            label="Email"
            type="email"
            placeholder="client@company.com"
            value={state.recipientInfo.email ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_RECIPIENT_INFO",
                info: { email: e.target.value },
              })
            }
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+1 (555) 987-6543"
            value={state.recipientInfo.phone ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_RECIPIENT_INFO",
                info: { phone: e.target.value },
              })
            }
          />
          <Input
            label="Address"
            placeholder="456 Oak Avenue"
            value={state.recipientInfo.address?.line1 ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_RECIPIENT_INFO",
                info: {
                  address: {
                    ...state.recipientInfo.address,
                    line1: e.target.value,
                    city: state.recipientInfo.address?.city ?? "",
                    postalCode: state.recipientInfo.address?.postalCode ?? "",
                    country: state.recipientInfo.address?.country ?? "",
                  },
                },
              })
            }
          />
          <Input
            label="City"
            placeholder="Los Angeles"
            value={state.recipientInfo.address?.city ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_RECIPIENT_INFO",
                info: {
                  address: {
                    ...state.recipientInfo.address,
                    line1: state.recipientInfo.address?.line1 ?? "",
                    city: e.target.value,
                    postalCode: state.recipientInfo.address?.postalCode ?? "",
                    country: state.recipientInfo.address?.country ?? "",
                  },
                },
              })
            }
          />
          <Input
            label="Postal / ZIP Code"
            placeholder="90001"
            value={state.recipientInfo.address?.postalCode ?? ""}
            onChange={(e) =>
              dispatch({
                type: "SET_RECIPIENT_INFO",
                info: {
                  address: {
                    ...state.recipientInfo.address,
                    line1: state.recipientInfo.address?.line1 ?? "",
                    city: state.recipientInfo.address?.city ?? "",
                    postalCode: e.target.value,
                    country: state.recipientInfo.address?.country ?? "",
                  },
                },
              })
            }
          />
          <Select
            label="Country"
            value={state.recipientInfo.address?.country ?? ""}
            options={[{ value: "", label: "Select country" }, ...COUNTRIES]}
            onChange={(e) =>
              dispatch({
                type: "SET_RECIPIENT_INFO",
                info: {
                  address: {
                    ...state.recipientInfo.address,
                    line1: state.recipientInfo.address?.line1 ?? "",
                    city: state.recipientInfo.address?.city ?? "",
                    postalCode: state.recipientInfo.address?.postalCode ?? "",
                    country: e.target.value,
                  },
                },
              })
            }
          />
        </div>
      </div>

      {/* Document Details */}
      <div>
        <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
            3
          </span>
          Document Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Document Number"
            value={state.documentNumber}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "documentNumber",
                value: e.target.value,
              })
            }
          />
          <Input
            label="Issue Date"
            type="date"
            value={state.issueDate}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "issueDate",
                value: e.target.value,
              })
            }
          />
          {showDueDate && (
            <Input
              label="Due Date"
              type="date"
              value={state.dueDate}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "dueDate",
                  value: e.target.value,
                })
              }
            />
          )}
          <Select
            label="Currency"
            value={state.currency}
            options={CURRENCIES.map((c) => ({
              value: c.code,
              label: `${c.code} (${c.symbol}) — ${c.name}`,
            }))}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "currency",
                value: e.target.value,
              })
            }
          />

          {/* Receipt-specific fields */}
          {isReceipt && (
            <Select
              label="Payment Method"
              value={state.extraFields.paymentMethod ?? ""}
              options={[
                { value: "", label: "Select method" },
                { value: "cash", label: "Cash" },
                { value: "card", label: "Card" },
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "check", label: "Check" },
                { value: "paypal", label: "PayPal" },
                { value: "other", label: "Other" },
              ]}
              onChange={(e) =>
                dispatch({
                  type: "SET_EXTRA_FIELDS",
                  fields: { paymentMethod: e.target.value as "cash" | "card" | "bank_transfer" | "check" | "paypal" | "other" },
                })
              }
            />
          )}

          {/* Credit Note-specific fields */}
          {isCreditNote && (
            <>
              <Input
                label="Original Invoice Reference"
                placeholder="INV-001"
                value={state.extraFields.originalInvoiceRef ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_EXTRA_FIELDS",
                    fields: { originalInvoiceRef: e.target.value },
                  })
                }
              />
              <Select
                label="Reason for Credit"
                value={state.extraFields.creditReason ?? ""}
                options={[
                  { value: "", label: "Select reason" },
                  { value: "returned_goods", label: "Returned Goods" },
                  { value: "overcharge", label: "Overcharge" },
                  { value: "damaged_goods", label: "Damaged Goods" },
                  { value: "service_not_provided", label: "Service Not Provided" },
                  { value: "other", label: "Other" },
                ]}
                onChange={(e) =>
                  dispatch({
                    type: "SET_EXTRA_FIELDS",
                    fields: { creditReason: e.target.value },
                  })
                }
              />
            </>
          )}

          {/* Delivery Note-specific fields */}
          {isDeliveryNote && (
            <>
              <Input
                label="Shipping Method"
                placeholder="FedEx Ground"
                value={state.extraFields.shippingMethod ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_EXTRA_FIELDS",
                    fields: { shippingMethod: e.target.value },
                  })
                }
              />
              <Input
                label="Tracking Number"
                placeholder="1Z999AA10123456784"
                value={state.extraFields.trackingNumber ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_EXTRA_FIELDS",
                    fields: { trackingNumber: e.target.value },
                  })
                }
              />
            </>
          )}
        </div>

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-secondary">
              Notes
            </label>
            <textarea
              className="w-full px-3 py-2.5 text-base sm:text-sm rounded-lg border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-none"
              rows={3}
              placeholder="Thank you for your business!"
              value={state.notes}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "notes",
                  value: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-secondary">
              Terms & Conditions
            </label>
            <textarea
              className="w-full px-3 py-2.5 text-base sm:text-sm rounded-lg border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-none"
              rows={3}
              placeholder="Payment due within 30 days..."
              value={state.terms}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "terms",
                  value: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div>
        <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
            4
          </span>
          Signatures (Optional)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SignaturePad
            label="Your Signature"
            value={state.senderSignature}
            onChange={(dataUrl) =>
              dispatch({
                type: "SET_FIELD",
                field: "senderSignature",
                value: dataUrl,
              })
            }
            onClear={() =>
              dispatch({
                type: "SET_FIELD",
                field: "senderSignature",
                value: "",
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
