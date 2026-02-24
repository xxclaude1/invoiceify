// ============================================
// Document Types
// ============================================

export type DocumentType =
  | "invoice"
  | "tax_invoice"
  | "proforma"
  | "receipt"
  | "sales_receipt"
  | "cash_receipt"
  | "quote"
  | "estimate"
  | "credit_note"
  | "purchase_order"
  | "delivery_note";

export type DocumentStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "overdue"
  | "cancelled";

export type IndustryPreset =
  | "freelance"
  | "contractor"
  | "consultant"
  | "hourly"
  | "service"
  | "sales"
  | "medical"
  | "photography"
  | "rental"
  | "repair"
  | "hotel"
  | "design"
  | "it_tech"
  | "artist"
  | "commercial";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "check"
  | "paypal"
  | "other";

// ============================================
// Form Data Types (what the wizard collects)
// ============================================

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface SenderInfo {
  businessName: string;
  contactName?: string;
  email: string;
  phone?: string;
  address: Address;
  taxId?: string;
  logoUrl?: string;
}

export interface RecipientInfo {
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address: Address;
  taxId?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  lineTotal: number;
  extraFields?: Record<string, string | number>;
}

export interface DocumentExtraFields {
  // Receipt fields
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  amountReceived?: number;
  receivedBy?: string;
  changeGiven?: number;

  // Quote/Estimate fields
  validityPeriod?: string;
  validUntil?: string;
  scopeDescription?: string;

  // Credit Note fields
  originalInvoiceRef?: string;
  creditReason?: string;

  // Purchase Order fields
  requestedDeliveryDate?: string;
  shippingAddress?: Address;
  shippingMethod?: string;
  authorizedBy?: string;

  // Delivery Note fields
  deliveryDate?: string;
  trackingNumber?: string;
  packageCount?: number;
  weightGross?: string;
  weightNet?: string;
  deliveredBy?: string;

  // Commercial/Shipping fields
  hsCode?: string;
  countryOfOrigin?: string;
  incoterms?: string;

  // Sales Receipt fields
  transactionRef?: string;
}

// ============================================
// Full Document (what gets saved to DB)
// ============================================

export interface Document {
  id: string;
  userId?: string;
  clientId?: string;
  type: DocumentType;
  industryPreset?: IndustryPreset;
  status: DocumentStatus;
  documentNumber: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  senderInfo: SenderInfo;
  recipientInfo: RecipientInfo;
  lineItems: LineItem[];
  notes?: string;
  terms?: string;
  templateId: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  extraFields?: DocumentExtraFields;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  paidAt?: string;
}

// ============================================
// Wizard State
// ============================================

export interface WizardState {
  step: 1 | 2 | 3 | 4;
  documentType: DocumentType | null;
  industryPreset?: IndustryPreset;
  senderInfo: Partial<SenderInfo>;
  recipientInfo: Partial<RecipientInfo>;
  documentMeta: {
    documentNumber: string;
    issueDate: string;
    dueDate?: string;
    currency: string;
    notes?: string;
    terms?: string;
  };
  lineItems: LineItem[];
  extraFields: DocumentExtraFields;
  templateId: string;
}

// ============================================
// Document Type Config (labels, numbering, etc.)
// ============================================

export interface DocumentTypeConfig {
  type: DocumentType;
  label: string;
  description: string;
  prefix: string;
  hasDueDate: boolean;
  hasPrices: boolean;
  icon: string;
}

export const DOCUMENT_TYPE_CONFIGS: DocumentTypeConfig[] = [
  {
    type: "invoice",
    label: "Invoice",
    description: "Standard invoice for goods or services",
    prefix: "INV",
    hasDueDate: true,
    hasPrices: true,
    icon: "receipt",
  },
  {
    type: "tax_invoice",
    label: "Tax Invoice",
    description: "Invoice with tax/VAT breakdown",
    prefix: "TINV",
    hasDueDate: true,
    hasPrices: true,
    icon: "receipt-tax",
  },
  {
    type: "proforma",
    label: "Proforma Invoice",
    description: "Pre-sale invoice / price quote before delivery",
    prefix: "PI",
    hasDueDate: false,
    hasPrices: true,
    icon: "document",
  },
  {
    type: "receipt",
    label: "Receipt",
    description: "Proof of payment received",
    prefix: "REC",
    hasDueDate: false,
    hasPrices: true,
    icon: "check-receipt",
  },
  {
    type: "sales_receipt",
    label: "Sales Receipt",
    description: "Receipt for retail/product sales",
    prefix: "SR",
    hasDueDate: false,
    hasPrices: true,
    icon: "shopping-bag",
  },
  {
    type: "cash_receipt",
    label: "Cash Receipt",
    description: "Receipt confirming cash payment",
    prefix: "CR",
    hasDueDate: false,
    hasPrices: true,
    icon: "cash",
  },
  {
    type: "quote",
    label: "Quote",
    description: "Price quotation for potential work",
    prefix: "QUO",
    hasDueDate: false,
    hasPrices: true,
    icon: "quote",
  },
  {
    type: "estimate",
    label: "Estimate",
    description: "Cost estimate for a project",
    prefix: "EST",
    hasDueDate: false,
    hasPrices: true,
    icon: "calculator",
  },
  {
    type: "credit_note",
    label: "Credit Note",
    description: "Document reducing amount owed",
    prefix: "CN",
    hasDueDate: false,
    hasPrices: true,
    icon: "credit",
  },
  {
    type: "purchase_order",
    label: "Purchase Order",
    description: "Formal request to purchase goods/services",
    prefix: "PO",
    hasDueDate: false,
    hasPrices: true,
    icon: "cart",
  },
  {
    type: "delivery_note",
    label: "Delivery Note",
    description: "Confirmation of goods delivered",
    prefix: "DN",
    hasDueDate: false,
    hasPrices: false,
    icon: "truck",
  },
];

// ============================================
// Currency Options
// ============================================

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
] as const;
