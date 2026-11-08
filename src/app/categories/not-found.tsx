import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Home } from "lucide-react";

export default function CategoryNotFound() {
  return (
    <div className="py-20 sm:py-32 bg-primary-bg min-h-[70vh] flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-secondary-bg border border-champagne flex items-center justify-center mx-auto text-muted-gold shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-muted-gold font-semibold">
            Collection Not Found
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            A Treasure Yet to Be Discovered
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light leading-relaxed">
            The collection or category you are looking for does not exist or may have been retired into our archives. Explore our flagship categories below.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-charcoal text-white text-xs uppercase tracking-wider font-medium hover:bg-muted-gold transition-colors shadow-xs"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-champagne bg-white text-charcoal text-xs font-medium hover:border-muted-gold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

