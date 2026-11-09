"use client";

import React from "react";
import { highlightSearchMatches } from "@/lib/search-utils";

interface SearchHighlightProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Renders text with search query tokens highlighted with luxury styling.
 */
export function SearchHighlight({
  text,
  query,
  className = "",
  highlightClassName = "bg-champagne/45 text-charcoal font-medium rounded-sm px-0.5 shadow-xs",
}: SearchHighlightProps) {
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const segments = highlightSearchMatches(text, query);

  return (
    <span className={className}>
      {segments.map((segment, idx) =>
        segment.isMatch ? (
          <mark key={idx} className={highlightClassName}>
            {segment.text}
          </mark>
        ) : (
          <span key={idx}>{segment.text}</span>
        )
      )}
    </span>
  );
}

