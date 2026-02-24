"use client";

import { useWizard } from "./wizard-context";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Document" },
  { num: 2, label: "Content" },
  { num: 3, label: "Items" },
  { num: 4, label: "Template" },
] as const;

export default function StepIndicator() {
  const { state } = useWizard();

  return (
    <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto">
      {STEPS.map((step) => (
        <div
          key={step.num}
          className={cn(
            "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0",
            state.step === step.num
              ? "bg-primary text-white"
              : state.step > step.num
              ? "bg-accent/10 text-accent"
              : "bg-surface text-text-secondary"
          )}
        >
          <span
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
              state.step === step.num
                ? "bg-white/20 text-white"
                : state.step > step.num
                ? "bg-accent/20 text-accent"
                : "bg-black/5 text-text-secondary"
            )}
          >
            {state.step > step.num ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step.num
            )}
          </span>
          <span className="hidden sm:inline">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
