"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, ChevronLeft, ChevronRight, Gift, Truck, Tag } from "lucide-react";

interface Announcement {
  id: string;
  icon: React.ElementType;
  text: string;
  highlight?: string;
  href?: string;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "gift-box",
    icon: Gift,
    text: "Complimentary Luxury Gift Box & Handwritten Card on All Orders",
    highlight: "Free Gift Packaging",
    href: "/gifts",
  },
  {
    id: "free-shipping",
    icon: Truck,
    text: "Free Express Shipping Across India on Orders Above ₹999",
    highlight: "Fast Dispatch",
    href: "/shipping-policy",
  },
  {
    id: "welcome-offer",
    icon: Tag,
    text: "Welcome to TiniWish: Enjoy 10% Off with Code",
    highlight: "TINIWISH10",
    href: "/products",
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = ANNOUNCEMENTS.length;

  const next = () => setCurrentIndex((prev) => (prev + 1) % total);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total]);

  const active = ANNOUNCEMENTS[currentIndex];
  const Icon = active.icon;

  return (
    <aside
      aria-label="Promotional Announcement"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative z-50 bg-charcoal text-ivory py-2 px-4 transition-colors border-b border-muted-gold/25"
    >
      <div className="container mx-auto flex items-center justify-between gap-2 max-w-7xl">
        {/* Previous Button */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous announcement"
          className="text-champagne/60 hover:text-muted-gold transition-colors p-1 rounded hover:bg-white/5 cursor-pointer hidden sm:inline-flex items-center justify-center shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Central Content */}
        <div className="flex-1 flex items-center justify-center text-center overflow-hidden">
          <div className="inline-flex items-center justify-center gap-2 text-[11px] tracking-wider uppercase font-sans font-medium transition-opacity duration-300">
            <Sparkles className="w-3 h-3 text-muted-gold shrink-0 animate-pulse" />
            <Icon className="w-3.5 h-3.5 text-champagne shrink-0 hidden md:inline-block" />
            
            {active.href ? (
              <Link
                href={active.href}
                className="hover:text-champagne transition-colors inline-flex items-center gap-1.5 truncate"
              >
                <span className="text-ivory/90 truncate">{active.text}</span>
                {active.highlight && (
                  <span className="text-muted-gold font-semibold underline underline-offset-2 ml-1 shrink-0">
                    {active.highlight}
                  </span>
                )}
              </Link>
            ) : (
              <span className="text-ivory/90 truncate">
                {active.text}
                {active.highlight && (
                  <span className="text-muted-gold font-semibold ml-1 shrink-0">
                    {active.highlight}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={next}
          aria-label="Next announcement"
          className="text-champagne/60 hover:text-muted-gold transition-colors p-1 rounded hover:bg-white/5 cursor-pointer hidden sm:inline-flex items-center justify-center shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
