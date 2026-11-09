"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowRight,
  Loader2,
  Sparkles,
  TrendingUp,
  History,
  Trash2,
  Tag,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SearchHighlight } from "@/components/search/search-highlight";
import { SearchSuggestionsDTO } from "@/types/search";
import { POPULAR_SEARCH_TERMS } from "@/lib/search-utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_STORAGE_KEY = "tiniwish_recent_searches_v1";

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestionsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>(POPULAR_SEARCH_TERMS);

  // Load recent searches and popular terms safely on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validSearches = parsed.slice(0, 8);
          queueMicrotask(() => {
            setRecentSearches(validSearches);
          });
        }
      }
    } catch {
      // Storage unavailable or disabled
    }

    // Fetch dynamic popular searches
    fetch("/api/v1/search?type=popular&limit=8")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPopularSearches(json.data);
        }
      })
      .catch(() => {
        // Fallback to static list
      });
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage quota
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((t) => t !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage quota
      }
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch {
      // Storage quota
    }
  };

  const handleClose = () => {
    setQuery("");
    setSuggestions(null);
    onClose();
  };

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced search suggestions query with AbortController
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      const timer = setTimeout(() => {
        setSuggestions(null);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/v1/search?type=suggestions&q=${encodeURIComponent(trimmed)}&limit=5`,
          { signal: controller.signal }
        );
        const json = await res.json();
        if (json.success && json.data) {
          setSuggestions(json.data);
        } else {
          setSuggestions(null);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          setSuggestions(null);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const executeSearch = (searchTerm: string) => {
    const cleanTerm = searchTerm.trim();
    if (!cleanTerm) return;
    saveRecentSearch(cleanTerm);
    handleClose();
    router.push(`/search?q=${encodeURIComponent(cleanTerm)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-champagne shadow-modal rounded-xl">
        <DialogTitle className="sr-only">Search Luxury Treasures</DialogTitle>

        {/* Search Input Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center border-b border-champagne/60 px-4 py-3.5 bg-primary-bg/40"
        >
          <Search className="w-5 h-5 text-muted-gold shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name, SKU, category, or materials..."
            className="w-full bg-transparent text-sm sm:text-base text-charcoal placeholder:text-dark-brown/40 placeholder:font-light outline-none"
            aria-label="Search product catalogue"
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
            suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) ? (
              <div className="space-y-4">
                {/* Header Action */}
                <div className="flex items-center justify-between text-xs text-dark-brown/60 pb-2 border-b border-secondary-bg">
                  <span className="uppercase tracking-wider font-medium text-[10px]">
                    Matching Treasures ({suggestions.products.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => executeSearch(query)}
                    className="text-muted-gold hover:text-dark-brown font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all results for &ldquo;{query}&rdquo;</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Category Suggestions if matching */}
                {suggestions.categories.length > 0 && (
                  <div className="space-y-1.5 pb-2 border-b border-secondary-bg">
                    <span className="text-[10px] uppercase tracking-wider text-dark-brown/60 font-semibold block">
                      Categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          onClick={handleClose}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-secondary-bg/60 text-charcoal hover:bg-muted-gold hover:text-white transition-colors"
                        >
                          <Tag className="w-3 h-3 opacity-70" />
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products matching with Highlighting */}
                <div className="divide-y divide-secondary-bg">
                  {suggestions.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => {
                        saveRecentSearch(query);
                        onClose();
                      }}
                      className="py-3 px-2 flex items-center gap-3.5 hover:bg-secondary-bg/40 rounded-lg transition-colors group"
                    >
                      <div className="relative w-12 h-14 rounded overflow-hidden bg-secondary-bg/50 shrink-0 border border-champagne/40">
                        <Image
                          src={product.image}
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
                          <SearchHighlight text={product.title} query={query} />
                        </h4>
                        <span className="font-sans text-xs font-medium text-charcoal mt-0.5 block">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-dark-brown/30 group-hover:text-muted-gold group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-dark-brown/60">
                <Sparkles className="w-8 h-8 text-muted-gold/60 mx-auto mb-2" />
                <p className="font-serif text-base text-charcoal">No matching treasures found</p>
                <p className="text-xs text-dark-brown/60 mt-1 max-w-xs mx-auto">
                  Try checking for spelling or explore our popular collections below.
                </p>
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-charcoal text-white hover:bg-muted-gold transition-colors"
                >
                  <span>See full search page for &ldquo;{query}&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          ) : (
            <div className="space-y-6">
              {/* Recent Searches Section */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-dark-brown/60 font-medium">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <History className="w-3.5 h-3.5 text-muted-gold" />
                      <span>Recent Searches</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[10px] text-dark-brown/50 hover:text-red-700 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear History</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="group inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-champagne/80 bg-white text-charcoal hover:border-muted-gold transition-colors cursor-pointer"
                        onClick={() => executeSearch(term)}
                      >
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="text-dark-brown/40 hover:text-charcoal p-0.5 rounded-full"
                          aria-label={`Remove recent search ${term}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs text-dark-brown/60 font-medium uppercase tracking-wider text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-gold" />
                  <span>Popular Inquiries</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => executeSearch(term)}
                      className="text-xs px-3 py-1.5 rounded-full border border-champagne bg-secondary-bg/30 text-charcoal hover:bg-secondary-bg hover:border-muted-gold transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Quick Links */}
              <div className="pt-4 border-t border-secondary-bg">
                <span className="text-xs uppercase tracking-wider text-dark-brown/60 font-medium block mb-2.5">
                  Browse by Collection
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <Link
                    href="/jewellery"
                    onClick={handleClose}
                    className="p-3 rounded-lg border border-champagne/40 bg-white hover:border-muted-gold transition-colors block text-charcoal hover:text-muted-gold"
                  >
                    <span className="font-serif font-medium block">Artificial Jewellery</span>
                    <span className="text-[10px] text-dark-brown/60">Kundan, Polki & Jhumkas</span>
                  </Link>
                  <Link
                    href="/gifts"
                    onClick={handleClose}
                    className="p-3 rounded-lg border border-champagne/40 bg-white hover:border-muted-gold transition-colors block text-charcoal hover:text-muted-gold"
                  >
                    <span className="font-serif font-medium block">Charming Gifts</span>
                    <span className="text-[10px] text-dark-brown/60">Keepsakes & Hampers</span>
                  </Link>
                  <Link
                    href="/home-decor"
                    onClick={handleClose}
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
