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
// Template color themes
// ============================================

interface TemplateTheme {
  pageBg: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  headerBarColor: string;
  billToBg: string;
  borderColor: string;
  tableRowBorder: string;
  notesBg: string;
}

const TEMPLATE_THEMES: Record<string, TemplateTheme> = {
  classic: {
    pageBg: "#FFFFFF",
    textColor: "#1A1A2E",
    mutedColor: "#6B7280",
    accentColor: "#003B4D",
    headerBarColor: "#003B4D",
    billToBg: "#F5F7F9",
    borderColor: "#E5E7EB",
    tableRowBorder: "#F5F7F9",
    notesBg: "#F5F7F9",
  },
  modern: {
    pageBg: "#FFFFFF",
    textColor: "#1A1A2E",
    mutedColor: "#6B7280",
    accentColor: "#2563EB",
    headerBarColor: "#2563EB",
    billToBg: "#EFF6FF",
    borderColor: "#BFDBFE",
    tableRowBorder: "#EFF6FF",
    notesBg: "#EFF6FF",
  },
  minimal: {
    pageBg: "#FFFFFF",
    textColor: "#374151",
    mutedColor: "#9CA3AF",
    accentColor: "#374151",
    headerBarColor: "#6B7280",
    billToBg: "#F9FAFB",
    borderColor: "#E5E7EB",
    tableRowBorder: "#F9FAFB",
    notesBg: "#F9FAFB",
  },
  corporate: {
    pageBg: "#FFFFFF",
    textColor: "#1E293B",
    mutedColor: "#64748B",
    accentColor: "#059669",
    headerBarColor: "#059669",
    billToBg: "#ECFDF5",
    borderColor: "#A7F3D0",
    tableRowBorder: "#ECFDF5",
    notesBg: "#ECFDF5",
  },
  creative: {
    pageBg: "#FFFFFF",
    textColor: "#1E293B",
    mutedColor: "#64748B",
    accentColor: "#0D9488",
    headerBarColor: "#0D9488",
    billToBg: "#F0FDFA",
    borderColor: "#99F6E4",
    tableRowBorder: "#F0FDFA",
    notesBg: "#F0FDFA",
  },
  dark: {
    pageBg: "#111827",
    textColor: "#E5E7EB",
    mutedColor: "#6B7280",
    accentColor: "#34D399",
    headerBarColor: "#34D399",
    billToBg: "#1F2937",
    borderColor: "#374151",
    tableRowBorder: "#1F2937",
    notesBg: "#1F2937",
  },
};

function getTheme(templateId: string): TemplateTheme {
  return TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.classic;
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  headerBar: {
    height: 4,
    marginBottom: 20,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  docType: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  docNumber: {
    fontSize: 9,
    marginTop: 4,
  },
  companyName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  companyDetail: {
    fontSize: 9,
    textAlign: "right",
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
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
  },
  dateValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  billTo: {
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
    marginTop: 2,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
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
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  notes: {
    marginTop: 16,
    padding: 10,
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
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
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    borderTopWidth: 0.5,
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
  const t = getTheme(state.templateId);

  return (
    <Document>
      <Page size="A4" style={[styles.page, { backgroundColor: t.pageBg, color: t.textColor }]}>
        {/* Color bar at top */}
        <View style={[styles.headerBar, { backgroundColor: t.headerBarColor }]} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.docType, { color: t.accentColor }]}>
              {getDocLabel(state.documentType)}
            </Text>
            {state.documentNumber && (
              <Text style={[styles.docNumber, { color: t.mutedColor }]}>{state.documentNumber}</Text>
            )}
          </View>
          <View>
            {state.senderInfo.businessName && (
              <Text style={[styles.companyName, { color: t.textColor }]}>
                {state.senderInfo.businessName}
              </Text>
            )}
            {state.senderInfo.email && (
              <Text style={[styles.companyDetail, { color: t.mutedColor }]}>{state.senderInfo.email}</Text>
            )}
            {state.senderInfo.phone && (
              <Text style={[styles.companyDetail, { color: t.mutedColor }]}>{state.senderInfo.phone}</Text>
            )}
            {state.senderInfo.address?.line1 && (
              <Text style={[styles.companyDetail, { color: t.mutedColor }]}>
                {state.senderInfo.address.line1}
              </Text>
            )}
            {state.senderInfo.address?.city && (
              <Text style={[styles.companyDetail, { color: t.mutedColor }]}>
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
              <Text style={[styles.companyDetail, { color: t.mutedColor }]}>
                Tax ID: {state.senderInfo.taxId}
              </Text>
            )}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.dateRow}>
          {state.issueDate && (
            <View>
              <Text style={[styles.dateLabel, { color: t.mutedColor }]}>Issue Date</Text>
              <Text style={[styles.dateValue, { color: t.textColor }]}>{formatDate(state.issueDate)}</Text>
            </View>
          )}
          {state.dueDate && (
            <View>
              <Text style={[styles.dateLabel, { color: t.mutedColor }]}>Due Date</Text>
              <Text style={[styles.dateValue, { color: t.textColor }]}>{formatDate(state.dueDate)}</Text>
            </View>
          )}
          <View>
            <Text style={[styles.dateLabel, { color: t.mutedColor }]}>Currency</Text>
            <Text style={[styles.dateValue, { color: t.textColor }]}>{state.currency}</Text>
          </View>
        </View>

        {/* Bill To */}
        {state.recipientInfo.businessName && (
          <View style={[styles.billTo, { backgroundColor: t.billToBg }]}>
            <Text style={[styles.sectionTitle, { color: t.mutedColor }]}>Bill To</Text>
            <Text style={[styles.billToName, { color: t.textColor }]}>
              {state.recipientInfo.businessName}
            </Text>
            {state.recipientInfo.contactName && (
              <Text style={[styles.billToDetail, { color: t.mutedColor }]}>
                {state.recipientInfo.contactName}
              </Text>
            )}
            {state.recipientInfo.email && (
              <Text style={[styles.billToDetail, { color: t.mutedColor }]}>
                {state.recipientInfo.email}
              </Text>
            )}
            {state.recipientInfo.address?.line1 && (
              <Text style={[styles.billToDetail, { color: t.mutedColor }]}>
                {state.recipientInfo.address.line1}
              </Text>
            )}
            {state.recipientInfo.address?.city && (
              <Text style={[styles.billToDetail, { color: t.mutedColor }]}>
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
          <View style={[styles.tableHeader, { borderBottomColor: t.borderColor }]}>
            <Text style={[styles.tableHeaderCell, styles.colDesc, { color: t.mutedColor }]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colQty, { color: t.mutedColor }]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice, { color: t.mutedColor }]}>
              Price
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colTax, { color: t.mutedColor }]}>
              Tax
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal, { color: t.mutedColor }]}>
              Total
            </Text>
          </View>
          {/* Rows */}
          {state.lineItems
            .filter((item) => item.description)
            .map((item, i) => (
              <View key={i} style={[styles.tableRow, { borderBottomColor: t.tableRowBorder }]}>
                <Text style={[styles.tableCell, styles.colDesc, { color: t.textColor }]}>
                  {item.description}
                </Text>
                <Text style={[styles.tableCell, styles.colQty, { color: t.textColor }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.colPrice, { color: t.textColor }]}>
                  {formatCurrency(item.unitPrice, state.currency)}
                </Text>
                <Text style={[styles.tableCell, styles.colTax, { color: t.mutedColor }]}>
                  {item.taxRate ? `${item.taxRate}%` : "-"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colTotal,
                    { fontFamily: "Helvetica-Bold", color: t.textColor },
                  ]}
                >
                  {formatCurrency(item.lineTotal, state.currency)}
                </Text>
              </View>
            ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: t.mutedColor }]}>Subtotal</Text>
            <Text style={[styles.totalValue, { color: t.textColor }]}>
              {formatCurrency(subtotal, state.currency)}
            </Text>
          </View>
          {discountTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: t.mutedColor }]}>Discount</Text>
              <Text style={[styles.totalValue, { color: "#EF4444" }]}>
                -{formatCurrency(discountTotal, state.currency)}
              </Text>
            </View>
          )}
          {taxTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: t.mutedColor }]}>Tax</Text>
              <Text style={[styles.totalValue, { color: t.textColor }]}>
                {formatCurrency(taxTotal, state.currency)}
              </Text>
            </View>
          )}
          <View style={[styles.grandTotalRow, { borderTopColor: t.borderColor }]}>
            <Text style={[styles.grandTotalLabel, { color: t.accentColor }]}>Total</Text>
            <Text style={[styles.grandTotalValue, { color: t.accentColor }]}>
              {formatCurrency(grandTotal, state.currency)}
            </Text>
          </View>
        </View>

        {/* Notes & Terms */}
        {(state.notes || state.terms) && (
          <View style={[styles.notes, { backgroundColor: t.notesBg }]}>
            {state.notes && (
              <View style={{ marginBottom: state.terms ? 8 : 0 }}>
                <Text style={[styles.notesTitle, { color: t.mutedColor }]}>Notes</Text>
                <Text style={[styles.notesText, { color: t.textColor }]}>{state.notes}</Text>
              </View>
            )}
            {state.terms && (
              <View>
                <Text style={[styles.notesTitle, { color: t.mutedColor }]}>Terms & Conditions</Text>
                <Text style={[styles.notesText, { color: t.textColor }]}>{state.terms}</Text>
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
              <View style={[styles.signatureLine, { borderBottomColor: t.borderColor }]} />
              <Text style={[styles.signatureLabel, { color: t.mutedColor }]}>
                {state.senderInfo.businessName || "Sender"} Signature
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={[styles.footer, { color: t.mutedColor, borderTopColor: t.borderColor }]}>Created with Invoiceify</Text>
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
