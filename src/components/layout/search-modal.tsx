"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductDTO } from "@/types/product";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  "Kundan Choker",
  "Chandrika Jhumkas",
  "Luxury Gift Hamper",
  "Brass Peacock Diya",
  "Pearl Earrings",
  "Under ₹1,999",
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setQuery("");
    setResults([]);
    onClose();
  };

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      const timer = setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/products?search=${encodeURIComponent(trimmed)}&limit=5`);
        const json = await res.json();
        if (json.success && json.data?.items) {
          setResults(json.data.items);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handlePopularClick = (term: string) => {
    handleClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-champagne shadow-modal rounded-xl">
        <DialogTitle className="sr-only">Search Catalogue</DialogTitle>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-champagne/60 px-4 py-3.5 bg-primary-bg/40">
          <Search className="w-5 h-5 text-muted-gold shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jewellery, bespoke gifts, brassware..."
            className="w-full bg-transparent text-sm sm:text-base text-charcoal placeholder:text-dark-brown/40 placeholder:font-light outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-dark-brown/40 hover:text-charcoal transition-colors cursor-pointer mr-2"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-wider text-dark-brown/60 hover:text-charcoal font-medium transition-colors cursor-pointer px-2"
          >
            ESC
          </button>
        </form>

        {/* Results / Suggestions Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-dark-brown/50">
              <Loader2 className="w-6 h-6 animate-spin text-muted-gold mb-2" />
              <span className="text-xs font-serif tracking-wider">Searching TiniWish boutique...</span>
            </div>
          ) : query.trim() ? (
            results.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-dark-brown/60 pb-2 border-b border-secondary-bg">
                  <span className="uppercase tracking-wider font-medium text-[10px]">
                    Matching Treasures ({results.length})
                  </span>
                  <button
                    onClick={handleSearchSubmit}
                    className="text-muted-gold hover:text-dark-brown font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all results</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-secondary-bg">
                  {results.map((product) => {
                    const price = product.variants[0]?.sellingPrice || 0;
                    const primaryImg =
                      product.images.find((i) => i.isPrimary)?.url ||
                      product.images[0]?.url ||
                      "/images/placeholder.jpg";

                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="py-3 px-2 flex items-center gap-3.5 hover:bg-secondary-bg/40 rounded-lg transition-colors group"
                      >
                        <div className="relative w-12 h-14 rounded overflow-hidden bg-secondary-bg/50 shrink-0 border border-champagne/40">
                          <Image
                            src={primaryImg}
                            alt={product.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase tracking-wider text-dark-brown/60 block truncate">
                            {product.categoryName}
                          </span>
                          <h4 className="font-serif text-sm text-charcoal group-hover:text-muted-gold transition-colors truncate">
                            {product.title}
                          </h4>
                          <span className="font-sans text-xs font-medium text-charcoal mt-0.5 block">
                            ₹{price.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-dark-brown/30 group-hover:text-muted-gold group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-dark-brown/60">
                <Sparkles className="w-8 h-8 text-muted-gold/60 mx-auto mb-2" />
                <p className="font-serif text-base text-charcoal">No matching treasures found</p>
                <p className="text-xs text-dark-brown/60 mt-1 max-w-xs mx-auto">
                  Try checking for spelling or explore our curated popular collections below.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs text-dark-brown/60 font-medium uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-muted-gold" />
                <span>Popular Inquiries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularClick(term)}
                    className="text-xs px-3 py-1.5 rounded-full border border-champagne bg-secondary-bg/30 text-charcoal hover:bg-secondary-bg hover:border-muted-gold transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>

              {/* Category Quick Links */}
              <div className="pt-4 border-t border-secondary-bg">
                <span className="text-xs uppercase tracking-wider text-dark-brown/60 font-medium block mb-2.5">
                  Browse by Collection
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <Link
                    href="/jewellery"
                    onClick={onClose}
                    className="p-3 rounded-lg border border-champagne/40 bg-white hover:border-muted-gold transition-colors block text-charcoal hover:text-muted-gold"
                  >
                    <span className="font-serif font-medium block">Artificial Jewellery</span>
                    <span className="text-[10px] text-dark-brown/60">Kundan, Polki & Jhumkas</span>
                  </Link>
                  <Link
                    href="/gifts"
                    onClick={onClose}
                    className="p-3 rounded-lg border border-champagne/40 bg-white hover:border-muted-gold transition-colors block text-charcoal hover:text-muted-gold"
                  >
                    <span className="font-serif font-medium block">Charming Gifts</span>
                    <span className="text-[10px] text-dark-brown/60">Keepsakes & Hampers</span>
                  </Link>
                  <Link
                    href="/home-decor"
                    onClick={onClose}
                    className="p-3 rounded-lg border border-champagne/40 bg-white hover:border-muted-gold transition-colors block text-charcoal hover:text-muted-gold"
                  >
                    <span className="font-serif font-medium block">Timeless Home Décor</span>
                    <span className="text-[10px] text-dark-brown/60">Brass & Artisanal Accents</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
