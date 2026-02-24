"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("divide-y divide-border", className)}>
      {items.map((item, index) => (
        <div key={index} className="py-5">
          <button
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
            className="flex w-full items-center justify-between text-left cursor-pointer"
          >
            <span className="text-base font-medium text-text-primary">
              {item.question}
            </span>
            <svg
              className={cn(
                "h-5 w-5 shrink-0 text-text-secondary transition-transform duration-200",
                openIndex === index && "rotate-45"
              )}
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
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              openIndex === index
                ? "mt-3 max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            )}
          >
            <p className="text-text-secondary text-sm leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
