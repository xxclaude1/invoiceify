"use client";

import { useState } from "react";
import { useWizard } from "./wizard-context";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";
import { generatePDFBlob } from "@/lib/generate-pdf";

const TEMPLATES = [
  { id: "classic", name: "Classic", accent: "border-primary", headerBg: "bg-primary/5", titleColor: "text-primary", bodyBg: "bg-white", textColor: "text-gray-800", mutedColor: "text-gray-400", lineBg: "bg-gray-100", totalColor: "text-primary" },
  { id: "modern", name: "Modern", accent: "border-accent", headerBg: "bg-accent/10", titleColor: "text-accent", bodyBg: "bg-white", textColor: "text-gray-800", mutedColor: "text-gray-400", lineBg: "bg-accent/5", totalColor: "text-accent" },
  { id: "minimal", name: "Minimal", accent: "border-gray-300", headerBg: "bg-gray-50", titleColor: "text-gray-700", bodyBg: "bg-white", textColor: "text-gray-700", mutedColor: "text-gray-300", lineBg: "bg-gray-50", totalColor: "text-gray-800" },
  { id: "corporate", name: "Corporate", accent: "border-blue-500", headerBg: "bg-blue-50", titleColor: "text-blue-700", bodyBg: "bg-white", textColor: "text-gray-800", mutedColor: "text-gray-400", lineBg: "bg-blue-50/50", totalColor: "text-blue-700" },
  { id: "creative", name: "Creative", accent: "border-purple-500", headerBg: "bg-purple-50", titleColor: "text-purple-700", bodyBg: "bg-white", textColor: "text-gray-800", mutedColor: "text-gray-400", lineBg: "bg-purple-50/50", totalColor: "text-purple-700" },
  { id: "dark", name: "Dark", accent: "border-gray-700", headerBg: "bg-gray-800", titleColor: "text-white", bodyBg: "bg-gray-900", textColor: "text-gray-200", mutedColor: "text-gray-500", lineBg: "bg-gray-800", totalColor: "text-green-400" },
];

export default function StepTemplate() {
  const { state, dispatch, subtotal, taxTotal, discountTotal, grandTotal, completeSession } = useWizard();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // 1) Save full document to the database
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: state.documentType,
          industryPreset: state.industryPreset,
          documentNumber: state.documentNumber,
          issueDate: state.issueDate,
          dueDate: state.dueDate,
          currency: state.currency,
          senderInfo: state.senderInfo,
          recipientInfo: state.recipientInfo,
          lineItems: state.lineItems.filter((item) => item.description),
          notes: state.notes,
          terms: state.terms,
          templateId: state.templateId,
          subtotal,
          taxTotal,
          discountTotal,
          grandTotal,
          extraFields: state.extraFields,
          senderSignature: state.senderSignature,
        }),
      });

      const docData = await res.json();
      const documentId = docData.data?.id;

      // 2) Mark session as completed with the document ID
      await completeSession(documentId);

      // 3) Generate PDF blob
      const blob = await generatePDFBlob(state, subtotal, taxTotal, discountTotal, grandTotal);

      // 4) Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${state.documentNumber || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Something went wrong generating your PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-text-secondary mb-4">
        Choose a template design for your document:
      </p>

      {/* Template Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => {
          const selected = state.templateId === template.id;
          return (
            <button
              key={template.id}
              onClick={() =>
                dispatch({ type: "SET_TEMPLATE", templateId: template.id })
              }
              className={cn(
                "rounded-xl border-2 overflow-hidden transition-all cursor-pointer",
                selected
                  ? `${template.accent} shadow-md ring-2 ring-accent/20`
                  : "border-border hover:border-primary/30 hover:shadow-sm"
              )}
            >
              {/* Mini Preview */}
              <div
                className={cn(
                  "aspect-[3/4] p-3 flex flex-col",
                  template.bodyBg
                )}
              >
                {/* Header bar */}
                <div className={cn("h-5 rounded-sm mb-2", template.headerBg)} />
                {/* Title + Company */}
                <div className="flex justify-between items-start mb-2">
                  <div
                    className={cn(
                      "text-[7px] font-bold tracking-wider leading-tight",
                      template.titleColor
                    )}
                  >
                    {state.documentType
                      ? state.documentType.replace(/_/g, " ").toUpperCase()
                      : "INVOICE"}
                    <div className={cn("text-[5px] font-normal mt-0.5", template.mutedColor)}>
                      #INV-001
                    </div>
                  </div>
                  <div className={cn("text-[5px] text-right leading-tight", template.mutedColor)}>
                    <div className={cn("text-[6px] font-bold", template.textColor)}>Acme Co.</div>
                    hello@acme.com
                  </div>
                </div>
                {/* Bill To */}
                <div className={cn("rounded px-1.5 py-1 mb-2", template.lineBg)}>
                  <div className={cn("text-[4px] uppercase font-bold tracking-wider", template.mutedColor)}>Bill To</div>
                  <div className={cn("text-[5px] font-medium", template.textColor)}>Example Client</div>
                </div>
                {/* Line items */}
                <div className="space-y-0.5 flex-1">
                  <div className={cn("flex justify-between text-[4px] font-bold pb-0.5 border-b", template.mutedColor, template.id === "dark" ? "border-gray-700" : "border-gray-200")}>
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  {["Web Design", "Development", "Hosting"].map((item) => (
                    <div key={item} className="flex justify-between text-[5px]">
                      <span className={template.textColor}>{item}</span>
                      <span className={template.mutedColor}>$XXX.XX</span>
                    </div>
                  ))}
                </div>
                {/* Total */}
                <div
                  className={cn(
                    "mt-auto pt-1.5 border-t",
                    template.id === "dark"
                      ? "border-gray-700"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className={cn("text-[5px]", template.mutedColor)}>Total</span>
                    <span className={cn("text-[7px] font-bold", template.totalColor)}>$X,XXX.XX</span>
                  </div>
                </div>
              </div>

              {/* Template Name */}
              <div
                className={cn(
                  "py-2 text-xs font-medium text-center",
                  selected ? "text-accent" : "text-text-primary"
                )}
              >
                {template.name}
                {selected && " ✓"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center">
        <Button variant="primary" size="lg" onClick={handleDownload} disabled={downloading}>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {downloading ? "Generating..." : "Download PDF"}
        </Button>
        <Button variant="outline" size="lg">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Preview
        </Button>
      </div>
    </div>
  );
}
