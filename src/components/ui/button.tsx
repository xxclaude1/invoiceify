"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 cursor-pointer",
          {
            "bg-accent text-white hover:bg-accent-dark":
              variant === "primary",
            "bg-primary text-white hover:bg-primary-light":
              variant === "secondary",
            "border-2 border-primary text-primary hover:bg-primary hover:text-white":
              variant === "outline",
            "text-primary hover:bg-surface": variant === "ghost",
          },
          {
            "px-4 py-1.5 text-sm": size === "sm",
            "px-6 py-2.5 text-sm": size === "md",
            "px-8 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
