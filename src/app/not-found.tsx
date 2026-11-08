import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="py-24 bg-primary-bg min-h-[70vh] flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-champagne-light/70 text-muted-gold mx-auto flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>

        <span className="text-[11px] uppercase tracking-widest text-muted-gold font-semibold block">
          Page Not Located • 404
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
          A Lost Treasure
        </h1>

        <p className="text-xs sm:text-sm text-dark-brown/70 leading-relaxed font-light">
          The page or piece you are searching for might have moved, retired from our boutique, or had its address adjusted.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-2.5 rounded-lg font-sans tracking-wide cursor-pointer flex items-center gap-2">
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link href="/products">
            <Button
              variant="outline"
              className="border-champagne text-charcoal hover:bg-secondary-bg text-xs px-6 py-2.5 rounded-lg font-sans tracking-wide cursor-pointer flex items-center gap-2"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

