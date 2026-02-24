"use client";

import { useWizard } from "./wizard-context";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";

const TEMPLATES = [
  { id: "classic", name: "Classic", accent: "border-primary", headerBg: "bg-primary/5" },
  { id: "modern", name: "Modern", accent: "border-accent", headerBg: "bg-accent/10" },
  { id: "minimal", name: "Minimal", accent: "border-gray-300", headerBg: "bg-gray-50" },
  { id: "corporate", name: "Corporate", accent: "border-blue-500", headerBg: "bg-blue-50" },
  { id: "creative", name: "Creative", accent: "border-purple-500", headerBg: "bg-purple-50" },
  { id: "dark", name: "Dark", accent: "border-gray-700", headerBg: "bg-gray-800" },
];

export default function StepTemplate() {
  const { state, dispatch, grandTotal } = useWizard();

  const handleDownload = async () => {
    // TODO: Session 4 — PDF generation + save to DB
    alert(
      "PDF generation coming in Session 4! Your document data has been captured."
    );
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
                  template.id === "dark" ? "bg-gray-900" : "bg-white"
                )}
              >
                <div className={cn("h-6 rounded-sm mb-2", template.headerBg)} />
                <div className="flex justify-between mb-3">
                  <div
                    className={cn(
                      "text-[8px] font-bold tracking-wider",
                      template.id === "dark" ? "text-white" : "text-text-primary"
                    )}
                  >
                    {state.documentType
                      ? state.documentType.replace(/_/g, " ").toUpperCase()
                      : "INVOICE"}
                  </div>
                  <div className="w-6 h-6 bg-primary/10 rounded" />
                </div>
                <div className="space-y-1.5 flex-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-1">
                      <div
                        className={cn(
                          "h-1.5 rounded-full flex-1",
                          template.id === "dark" ? "bg-gray-700" : "bg-gray-100"
                        )}
                      />
                      <div
                        className={cn(
                          "h-1.5 rounded-full w-8",
                          template.id === "dark" ? "bg-gray-600" : "bg-gray-200"
                        )}
                      />
                    </div>
                  ))}
                </div>
                <div
                  className={cn(
                    "mt-auto pt-2 border-t",
                    template.id === "dark"
                      ? "border-gray-700"
                      : "border-gray-100"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div
                      className={cn(
                        "h-1.5 w-8 rounded-full",
                        template.id === "dark" ? "bg-gray-600" : "bg-gray-200"
                      )}
                    />
                    <div
                      className={cn(
                        "h-1.5 w-12 rounded-full",
                        template.id === "dark" ? "bg-accent" : "bg-primary/30"
                      )}
                    />
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
        <Button variant="primary" size="lg" onClick={handleDownload}>
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
          Download PDF
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
