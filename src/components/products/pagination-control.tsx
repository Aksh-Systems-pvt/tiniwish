"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit?: number;
  className?: string;
}

export function PaginationControl({
  currentPage,
  totalPages,
  totalCount,
  limit = 12,
  className = "",
}: PaginationControlProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1 && totalCount <= limit) {
    return null;
  }

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber === 1) {
      params.delete("page");
    } else {
      params.set("page", pageNumber.toString());
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  // Generate page numbers
  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-champagne/40 ${className}`}
      aria-label="Pagination Navigation"
    >
      <div className="text-xs text-dark-brown/70 font-light">
        Showing <span className="font-medium text-charcoal">{startItem}</span> to{" "}
        <span className="font-medium text-charcoal">{endItem}</span> of{" "}
        <span className="font-medium text-charcoal">{totalCount}</span> treasures
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            aria-label="Go to previous page"
            className="flex items-center justify-center h-9 w-9 rounded-full border border-champagne/80 bg-white text-charcoal hover:border-muted-gold hover:text-muted-gold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="flex items-center justify-center h-9 w-9 rounded-full border border-champagne/40 bg-white/50 text-dark-brown/30 cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </span>
        )}

        {/* Page Number Buttons */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-xs text-dark-brown/50"
              >
                …
              </span>
            );
          }

          const pageNum = Number(p);
          const isCurrent = pageNum === currentPage;

          return (
            <Link
              key={`page-${p}`}
              href={createPageUrl(pageNum)}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex items-center justify-center h-9 min-w-[36px] px-3 rounded-full text-xs font-medium transition-colors ${
                isCurrent
                  ? "bg-charcoal text-white font-semibold shadow-xs"
                  : "border border-champagne/80 bg-white text-charcoal hover:border-muted-gold hover:text-muted-gold"
              }`}
            >
              {p}
            </Link>
          );
        })}

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            aria-label="Go to next page"
            className="flex items-center justify-center h-9 w-9 rounded-full border border-champagne/80 bg-white text-charcoal hover:border-muted-gold hover:text-muted-gold transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="flex items-center justify-center h-9 w-9 rounded-full border border-champagne/40 bg-white/50 text-dark-brown/30 cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
}

