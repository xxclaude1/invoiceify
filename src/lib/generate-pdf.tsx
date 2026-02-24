import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import { WizardState } from "@/components/wizard/wizard-context";

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1A1A2E",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  docType: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#003B4D",
  },
  docNumber: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 4,
  },
  companyName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  companyDetail: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  dateRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 8,
    color: "#6B7280",
  },
  dateValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  billTo: {
    backgroundColor: "#F5F7F9",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  billToName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  billToDetail: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 2,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F5F7F9",
  },
  tableCell: {
    fontSize: 9,
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTax: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totals: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: "#6B7280",
  },
  totalValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#003B4D",
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#003B4D",
  },
  notes: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#F5F7F9",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6B7280",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#1A1A2E",
    lineHeight: 1.5,
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 40,
  },
  signatureBlock: {
    flex: 1,
    alignItems: "center",
  },
  signatureImage: {
    width: 150,
    height: 60,
    marginBottom: 8,
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#6B7280",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
});

// ============================================
// Format helpers
// ============================================

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(date: string): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function getDocLabel(type: string | null): string {
  const labels: Record<string, string> = {
    invoice: "INVOICE",
    tax_invoice: "TAX INVOICE",
    proforma: "PROFORMA INVOICE",
    receipt: "RECEIPT",
    sales_receipt: "SALES RECEIPT",
    cash_receipt: "CASH RECEIPT",
    quote: "QUOTE",
    estimate: "ESTIMATE",
    credit_note: "CREDIT NOTE",
    purchase_order: "PURCHASE ORDER",
    delivery_note: "DELIVERY NOTE",
  };
  return labels[type ?? ""] ?? "DOCUMENT";
}

// ============================================
// PDF Document Component
// ============================================

interface InvoicePDFProps {
  state: WizardState;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
}

function InvoicePDF({
  state,
  subtotal,
  taxTotal,
  discountTotal,
  grandTotal,
}: InvoicePDFProps) {
  const isDeliveryNote = state.documentType === "delivery_note";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.docType}>
              {getDocLabel(state.documentType)}
            </Text>
            {state.documentNumber && (
              <Text style={styles.docNumber}>{state.documentNumber}</Text>
            )}
          </View>
          <View>
            {state.senderInfo.businessName && (
              <Text style={styles.companyName}>
                {state.senderInfo.businessName}
              </Text>
            )}
            {state.senderInfo.email && (
              <Text style={styles.companyDetail}>{state.senderInfo.email}</Text>
            )}
            {state.senderInfo.phone && (
              <Text style={styles.companyDetail}>{state.senderInfo.phone}</Text>
            )}
            {state.senderInfo.address?.line1 && (
              <Text style={styles.companyDetail}>
                {state.senderInfo.address.line1}
              </Text>
            )}
            {state.senderInfo.address?.city && (
              <Text style={styles.companyDetail}>
                {[
                  state.senderInfo.address.city,
                  state.senderInfo.address.state,
                  state.senderInfo.address.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
            {state.senderInfo.taxId && (
              <Text style={styles.companyDetail}>
                Tax ID: {state.senderInfo.taxId}
              </Text>
            )}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.dateRow}>
          {state.issueDate && (
            <View>
              <Text style={styles.dateLabel}>Issue Date</Text>
              <Text style={styles.dateValue}>{formatDate(state.issueDate)}</Text>
            </View>
          )}
          {state.dueDate && (
            <View>
              <Text style={styles.dateLabel}>Due Date</Text>
              <Text style={styles.dateValue}>{formatDate(state.dueDate)}</Text>
            </View>
          )}
          <View>
            <Text style={styles.dateLabel}>Currency</Text>
            <Text style={styles.dateValue}>{state.currency}</Text>
          </View>
        </View>

        {/* Bill To */}
        {state.recipientInfo.businessName && (
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.billToName}>
              {state.recipientInfo.businessName}
            </Text>
            {state.recipientInfo.contactName && (
              <Text style={styles.billToDetail}>
                {state.recipientInfo.contactName}
              </Text>
            )}
            {state.recipientInfo.email && (
              <Text style={styles.billToDetail}>
                {state.recipientInfo.email}
              </Text>
            )}
            {state.recipientInfo.address?.line1 && (
              <Text style={styles.billToDetail}>
                {state.recipientInfo.address.line1}
              </Text>
            )}
            {state.recipientInfo.address?.city && (
              <Text style={styles.billToDetail}>
                {[
                  state.recipientInfo.address.city,
                  state.recipientInfo.address.state,
                  state.recipientInfo.address.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            {!isDeliveryNote && (
              <>
                <Text style={[styles.tableHeaderCell, styles.colPrice]}>
                  Price
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colTax]}>
                  Tax
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colTotal]}>
                  Total
                </Text>
              </>
            )}
          </View>
          {/* Rows */}
          {state.lineItems
            .filter((item) => item.description)
            .map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDesc]}>
                  {item.description}
                </Text>
                <Text style={[styles.tableCell, styles.colQty]}>
                  {item.quantity}
                </Text>
                {!isDeliveryNote && (
                  <>
                    <Text style={[styles.tableCell, styles.colPrice]}>
                      {formatCurrency(item.unitPrice, state.currency)}
                    </Text>
                    <Text style={[styles.tableCell, styles.colTax]}>
                      {item.taxRate ? `${item.taxRate}%` : "-"}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.colTotal,
                        { fontFamily: "Helvetica-Bold" },
                      ]}
                    >
                      {formatCurrency(item.lineTotal, state.currency)}
                    </Text>
                  </>
                )}
              </View>
            ))}
        </View>

        {/* Totals */}
        {!isDeliveryNote && (
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(subtotal, state.currency)}
              </Text>
            </View>
            {discountTotal > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalValue, { color: "#EF4444" }]}>
                  -{formatCurrency(discountTotal, state.currency)}
                </Text>
              </View>
            )}
            {taxTotal > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(taxTotal, state.currency)}
                </Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(grandTotal, state.currency)}
              </Text>
            </View>
          </View>
        )}

        {/* Notes & Terms */}
        {(state.notes || state.terms) && (
          <View style={styles.notes}>
            {state.notes && (
              <View style={{ marginBottom: state.terms ? 8 : 0 }}>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{state.notes}</Text>
              </View>
            )}
            {state.terms && (
              <View>
                <Text style={styles.notesTitle}>Terms & Conditions</Text>
                <Text style={styles.notesText}>{state.terms}</Text>
              </View>
            )}
          </View>
        )}

        {/* Signature */}
        {state.senderSignature && (
          <View style={styles.signatures}>
            <View style={styles.signatureBlock}>
              <Image
                src={state.senderSignature}
                style={styles.signatureImage}
              />
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>
                {state.senderInfo.businessName || "Sender"} Signature
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Created with Invoiceify</Text>
      </Page>
    </Document>
  );
}

// ============================================
// Generate PDF blob
// ============================================

export async function generatePDFBlob(
  state: WizardState,
  subtotal: number,
  taxTotal: number,
  discountTotal: number,
  grandTotal: number
): Promise<Blob> {
  const doc = (
    <InvoicePDF
      state={state}
      subtotal={subtotal}
      taxTotal={taxTotal}
      discountTotal={discountTotal}
      grandTotal={grandTotal}
    />
  );
  return await pdf(doc).toBlob();
}
