import React from "react";
import { formatINR } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";

interface PriceProps {
  amount: number | string;
  compareAtAmount?: number | string | null;
  className?: string;
  showDiscountBadge?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Price({
  amount,
  compareAtAmount,
  className = "",
  showDiscountBadge = false,
  size = "md",
}: PriceProps) {
  const current = typeof amount === "string" ? parseFloat(amount) : amount;
  const compare =
    compareAtAmount !== null && compareAtAmount !== undefined
      ? typeof compareAtAmount === "string"
        ? parseFloat(compareAtAmount)
        : compareAtAmount
      : null;

  const hasDiscount = compare !== null && compare > current;
  const discountPercent = hasDiscount
    ? Math.round(((compare - current) / compare) * 100)
    : 0;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-xl font-semibold",
    xl: "text-2xl font-bold sm:text-3xl",
  };

  return (
    <div className={`flex items-baseline gap-2 tabular-nums ${className}`}>
      <span className={`text-charcoal font-sans ${sizeClasses[size]}`}>
        {formatINR(current)}
      </span>

      {hasDiscount && (
        <>
          <span className="text-xs sm:text-sm text-stone-light line-through font-normal">
            {formatINR(compare)}
          </span>
          {showDiscountBadge && (
            <Badge
              variant="secondary"
              className="bg-champagne-light text-gold-deep text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded"
            >
              {discountPercent}% OFF
            </Badge>
          )}
        </>
      )}
    </div>
  );
}

