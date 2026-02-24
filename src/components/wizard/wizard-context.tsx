"use client";

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useSessionLogger } from "@/lib/session-logger";
import {
  DocumentType,
  IndustryPreset,
  LineItem,
  SenderInfo,
  RecipientInfo,
  DocumentExtraFields,
  DOCUMENT_TYPE_CONFIGS,
} from "@/types";
import { generateDocumentNumber } from "@/lib/utils";

// ============================================
// State
// ============================================

export interface WizardState {
  step: 1 | 2 | 3 | 4;
  documentType: DocumentType | null;
  industryPreset: IndustryPreset | null;
  senderInfo: Partial<SenderInfo>;
  recipientInfo: Partial<RecipientInfo>;
  documentNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  notes: string;
  terms: string;
  lineItems: LineItem[];
  extraFields: DocumentExtraFields;
  templateId: string;
  senderSignature: string;
}

const today = new Date().toISOString().split("T")[0];

const initialState: WizardState = {
  step: 1,
  documentType: null,
  industryPreset: null,
  senderInfo: {},
  recipientInfo: {},
  documentNumber: "",
  issueDate: today,
  dueDate: "",
  currency: "USD",
  notes: "",
  terms: "",
  lineItems: [
    {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: undefined,
      discount: undefined,
      lineTotal: 0,
    },
  ],
  extraFields: {},
  templateId: "classic",
  senderSignature: "",
};

// ============================================
// Actions
// ============================================

type WizardAction =
  | { type: "SET_STEP"; step: 1 | 2 | 3 | 4 }
  | { type: "SET_DOCUMENT_TYPE"; documentType: DocumentType }
  | { type: "SET_INDUSTRY_PRESET"; preset: IndustryPreset | null }
  | { type: "SET_SENDER_INFO"; info: Partial<SenderInfo> }
  | { type: "SET_RECIPIENT_INFO"; info: Partial<RecipientInfo> }
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "SET_LINE_ITEMS"; items: LineItem[] }
  | { type: "ADD_LINE_ITEM" }
  | { type: "REMOVE_LINE_ITEM"; id: string }
  | { type: "UPDATE_LINE_ITEM"; id: string; field: string; value: string | number | undefined }
  | { type: "SET_EXTRA_FIELDS"; fields: Partial<DocumentExtraFields> }
  | { type: "SET_TEMPLATE"; templateId: string }
  | { type: "RESET" };

// ============================================
// Helpers
// ============================================

function calculateLineTotal(item: LineItem): number {
  const subtotal = item.quantity * item.unitPrice;
  const discount = item.discount ?? 0;
  const taxRate = item.taxRate ?? 0;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (taxRate / 100);
  return Math.round((afterDiscount + tax) * 100) / 100;
}

// ============================================
// Reducer
// ============================================

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };

    case "SET_DOCUMENT_TYPE": {
      const config = DOCUMENT_TYPE_CONFIGS.find(
        (c) => c.type === action.documentType
      );
      const docNumber = config
        ? generateDocumentNumber(config.prefix)
        : state.documentNumber;
      return {
        ...state,
        documentType: action.documentType,
        documentNumber: docNumber,
      };
    }

    case "SET_INDUSTRY_PRESET":
      return { ...state, industryPreset: action.preset };

    case "SET_SENDER_INFO":
      return {
        ...state,
        senderInfo: { ...state.senderInfo, ...action.info },
      };

    case "SET_RECIPIENT_INFO":
      return {
        ...state,
        recipientInfo: { ...state.recipientInfo, ...action.info },
      };

    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_LINE_ITEMS":
      return { ...state, lineItems: action.items };

    case "ADD_LINE_ITEM":
      return {
        ...state,
        lineItems: [
          ...state.lineItems,
          {
            id: crypto.randomUUID(),
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRate: undefined,
            discount: undefined,
            lineTotal: 0,
          },
        ],
      };

    case "REMOVE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.id),
      };

    case "UPDATE_LINE_ITEM": {
      const items = state.lineItems.map((item) => {
        if (item.id !== action.id) return item;
        const updated = { ...item, [action.field]: action.value };
        updated.lineTotal = calculateLineTotal(updated);
        return updated;
      });
      return { ...state, lineItems: items };
    }

    case "SET_EXTRA_FIELDS":
      return {
        ...state,
        extraFields: { ...state.extraFields, ...action.fields },
      };

    case "SET_TEMPLATE":
      return { ...state, templateId: action.templateId };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: boolean;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  completeSession: (documentId?: string) => Promise<void>;
  getSessionId: () => string | null;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(wizardReducer, initialState);
  const { ensureSession, logField, updateSession, completeSession, getSessionId } = useSessionLogger();
  const snapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract field name from action for logging
  const getFieldInfoFromAction = useCallback((action: WizardAction): { name: string; value: string } | null => {
    switch (action.type) {
      case "SET_SENDER_INFO": {
        const entries = Object.entries(action.info);
        if (entries.length === 0) return null;
        const [key, val] = entries[0];
        if (key === "address" && typeof val === "object" && val !== null) {
          // Log changed address sub-fields
          const addr = val as unknown as Record<string, string>;
          // Find which sub-field actually changed by comparing
          for (const [subKey, subVal] of Object.entries(addr)) {
            if (subVal) return { name: `senderInfo.address.${subKey}`, value: String(subVal) };
          }
          return null;
        }
        return { name: `senderInfo.${key}`, value: String(val ?? "") };
      }
      case "SET_RECIPIENT_INFO": {
        const entries = Object.entries(action.info);
        if (entries.length === 0) return null;
        const [key, val] = entries[0];
        if (key === "address" && typeof val === "object" && val !== null) {
          const addr = val as unknown as Record<string, string>;
          for (const [subKey, subVal] of Object.entries(addr)) {
            if (subVal) return { name: `recipientInfo.address.${subKey}`, value: String(subVal) };
          }
          return null;
        }
        return { name: `recipientInfo.${key}`, value: String(val ?? "") };
      }
      case "SET_FIELD":
        return { name: action.field, value: action.value };
      case "SET_DOCUMENT_TYPE":
        return { name: "documentType", value: action.documentType };
      case "SET_INDUSTRY_PRESET":
        return { name: "industryPreset", value: action.preset ?? "" };
      case "UPDATE_LINE_ITEM":
        return { name: `lineItem.${action.field}`, value: String(action.value ?? "") };
      case "SET_EXTRA_FIELDS": {
        const entries = Object.entries(action.fields);
        if (entries.length === 0) return null;
        const [key, val] = entries[0];
        return { name: `extraFields.${key}`, value: String(val ?? "") };
      }
      case "SET_TEMPLATE":
        return { name: "templateId", value: action.templateId };
      default:
        return null;
    }
  }, []);

  // Wrapped dispatch that logs field changes
  const dispatch: React.Dispatch<WizardAction> = useCallback(
    (action: WizardAction) => {
      rawDispatch(action);

      // Don't log navigation/reset actions
      if (action.type === "SET_STEP" || action.type === "RESET" || action.type === "ADD_LINE_ITEM" || action.type === "REMOVE_LINE_ITEM" || action.type === "SET_LINE_ITEMS") {
        return;
      }

      // Ensure session exists, then log the field
      const fieldInfo = getFieldInfoFromAction(action);
      if (fieldInfo && fieldInfo.value) {
        const docType = action.type === "SET_DOCUMENT_TYPE" ? action.documentType : undefined;
        ensureSession(docType).then(() => {
          logField(fieldInfo.name, fieldInfo.value);
        });
      }
    },
    [ensureSession, logField, getFieldInfoFromAction]
  );

  // Periodically save form snapshot (every 30 seconds of activity)
  useEffect(() => {
    if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
    snapshotTimerRef.current = setTimeout(() => {
      if (getSessionId()) {
        updateSession({ formSnapshot: state, documentType: state.documentType });
      }
    }, 30000);
    return () => {
      if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
    };
  }, [state, getSessionId, updateSession]);

  const nextStep = useCallback(() => {
    if (state.step < 4) {
      rawDispatch({ type: "SET_STEP", step: (state.step + 1) as 1 | 2 | 3 | 4 });
    }
  }, [state.step]);

  const prevStep = useCallback(() => {
    if (state.step > 1) {
      rawDispatch({ type: "SET_STEP", step: (state.step - 1) as 1 | 2 | 3 | 4 });
    }
  }, [state.step]);

  const canProceed =
    state.step === 1
      ? state.documentType !== null
      : state.step === 2
      ? !!(state.senderInfo.businessName && state.senderInfo.email)
      : state.step === 3
      ? state.lineItems.some((item) => item.description && item.unitPrice > 0)
      : true;

  const subtotal = state.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const discountTotal = state.lineItems.reduce(
    (sum, item) => sum + (item.discount ?? 0),
    0
  );
  const taxTotal = state.lineItems.reduce((sum, item) => {
    const afterDiscount = item.quantity * item.unitPrice - (item.discount ?? 0);
    return sum + afterDiscount * ((item.taxRate ?? 0) / 100);
  }, 0);
  const grandTotal = subtotal - discountTotal + taxTotal;

  return (
    <WizardContext.Provider
      value={{
        state,
        dispatch,
        nextStep,
        prevStep,
        canProceed,
        subtotal,
        taxTotal,
        discountTotal,
        grandTotal,
        completeSession,
        getSessionId,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return context;
}
