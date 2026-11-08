"use client";

import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeErrorProps {
  onRetry?: () => void;
}

export function HomeError({ onRetry }: HomeErrorProps) {
  return (
    <div className="py-24 bg-primary-bg min-h-[60vh] flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-champagne-light/70 text-muted-gold mx-auto flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>

        <span className="text-[11px] uppercase tracking-widest text-muted-gold font-semibold block">
          Temporary Connection Pause
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
          Refining Our Collections
        </h1>

        <p className="text-xs sm:text-sm text-dark-brown/70 leading-relaxed font-light">
          Our digital boutique is briefly reconnecting with the atelier database. Please refresh or return shortly.
        </p>

        <div className="pt-2">
          <Button
            onClick={() => onRetry ? onRetry() : window.location.reload()}
            className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-2.5 rounded-lg font-sans tracking-wide cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Boutique</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

