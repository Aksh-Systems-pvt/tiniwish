"use client";

import React from "react";
import { Check } from "lucide-react";

export type CheckoutStep = "address" | "payment" | "review";

interface CheckoutStepsNavProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
}

const STEPS: { id: CheckoutStep; label: string; number: number }[] = [
  { id: "address", label: "Delivery Address", number: 1 },
  { id: "payment", label: "Payment Method", number: 2 },
  { id: "review", label: "Review & Place Order", number: 3 },
];

export function CheckoutStepsNav({ currentStep, onStepClick }: CheckoutStepsNavProps) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Checkout Progress" className="w-full mb-8">
      <ol className="flex items-center justify-between max-w-xl mx-auto">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isClickable = isCompleted && onStepClick;

          return (
            <li key={step.id} className="flex-1 flex items-center">
              <div
                onClick={() => isClickable && onStepClick(step.id)}
                className={`flex items-center gap-2.5 ${
                  isClickable ? "cursor-pointer group" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isCompleted
                      ? "bg-muted-gold text-white"
                      : isCurrent
                      ? "bg-charcoal text-white ring-4 ring-muted-gold/20"
                      : "bg-secondary-bg text-dark-brown/50 border border-champagne/40"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.number}
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium transition-colors ${
                    isCurrent
                      ? "text-charcoal font-semibold"
                      : isCompleted
                      ? "text-dark-brown/80 group-hover:text-muted-gold"
                      : "text-dark-brown/40"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 mx-3 sm:mx-4 h-0.5 transition-colors ${
                    idx < currentIdx ? "bg-muted-gold" : "bg-champagne/50"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

