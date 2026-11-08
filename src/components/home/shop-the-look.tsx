"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShoppingBag, Plus, Check } from "lucide-react";
import { useStore } from "@/context/store-context";
import { Button } from "@/components/ui/button";

interface LookItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  xPercent: number; // coordinates for hotspot on image
  yPercent: number;
}

const LOOK_ITEMS: LookItem[] = [
  {
    id: "noor-kundan-choker",
    title: "Noor Meenakari & Kundan Choker Necklace Set",
    slug: "noor-meenakari-kundan-choker-set",
    price: 3299,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    category: "Artificial Jewellery",
    xPercent: 48,
    yPercent: 38,
  },
  {
    id: "chandrika-earrings",
    title: "Chandrika Heritage Pearl Chandelier Earrings",
    slug: "chandrika-heritage-pearl-chandelier-earrings",
    price: 1499,
    image: "https://images.unsplash.com/photo-1611591475878-5a676c7c00e1?q=80&w=800&auto=format&fit=crop",
    category: "Artificial Jewellery",
    xPercent: 38,
    yPercent: 28,
  },
  {
    id: "peacock-brass-diya",
    title: "Mayur Solid Brass Heritage Diya & Oil Lamp",
    slug: "mayur-solid-brass-heritage-diya",
    price: 2199,
    image: "https://images.unsplash.com/photo-1606744888344-493238955de9?q=80&w=800&auto=format&fit=crop",
    category: "Timeless Home Décor",
    xPercent: 78,
    yPercent: 70,
  },
];

export function ShopTheLook() {
  const [activeItemId, setActiveItemId] = useState<string>(LOOK_ITEMS[0].id);
  const { addToCart } = useStore();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const activeItem = LOOK_ITEMS.find((item) => item.id === activeItemId) || LOOK_ITEMS[0];

  const handleAdd = (item: LookItem) => {
    addToCart({
      id: `${item.id}-default`,
      productId: item.id,
      title: item.title,
      slug: item.slug,
      image: item.image,
      price: item.price,
    });
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-champagne/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs uppercase tracking-widest font-sans font-medium border border-champagne">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Styling Ensemble</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight">
            Shop the Look
          </h2>
          <p className="text-sm sm:text-base text-dark-brown/70 font-light leading-relaxed">
            Curated pairings designed to harmonize effortlessly. Tap each hotspot to inspect individual treasures.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-primary-bg rounded-3xl border border-champagne/60 p-6 sm:p-10 shadow-subtle overflow-hidden">
          {/* Left Column: Interactive Image with Hotspots (7 cols) */}
          <div className="lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-secondary-bg/40 border border-champagne/40">
            <Image
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=85&w=1600&auto=format&fit=crop"
              alt="The Royal Soirée Ensemble"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-charcoal/20 pointer-events-none" />

            {/* Hotspots */}
            {LOOK_ITEMS.map((item) => {
              const isActive = item.id === activeItemId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItemId(item.id)}
                  style={{ top: `${item.yPercent}%`, left: `${item.xPercent}%` }}
                  aria-label={`Select ${item.title}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-all duration-300 z-10 ${
                    isActive
                      ? "bg-muted-gold text-white scale-110 ring-4 ring-muted-gold/40 shadow-lg"
                      : "bg-white/90 text-charcoal hover:bg-white hover:scale-105 shadow-md"
                  }`}
                >
                  <Plus className={`w-4 h-4 transition-transform duration-300 ${isActive ? "rotate-45" : ""}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Item Feature & Ensemble List (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-muted-gold font-sans font-semibold block mb-1">
                Featured Ensemble Piece
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal">
                The Royal Soirée
              </h3>
            </div>

            {/* Active Highlight Card */}
            <div className="p-5 rounded-2xl bg-white border border-champagne/60 shadow-subtle space-y-4">
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-secondary-bg/30 shrink-0 border border-champagne/40">
                  <Image
                    src={activeItem.image}
                    alt={activeItem.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-dark-brown/60 block truncate">
                    {activeItem.category}
                  </span>
                  <Link href={`/products/${activeItem.slug}`}>
                    <h4 className="font-serif text-base text-charcoal hover:text-muted-gold transition-colors font-medium truncate">
                      {activeItem.title}
                    </h4>
                  </Link>
                  <span className="font-sans text-base font-semibold text-charcoal mt-1 block">
                    ₹{activeItem.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-secondary-bg/60 flex items-center gap-3">
                <Button
                  onClick={() => handleAdd(activeItem)}
                  className="flex-1 bg-charcoal hover:bg-muted-gold text-white text-xs h-10 font-sans uppercase tracking-wider font-semibold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  {addedIds.has(activeItem.id) ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Shopping Bag</span>
                    </>
                  )}
                </Button>

                <Link href={`/products/${activeItem.slug}`}>
                  <Button variant="outline" className="border-champagne text-charcoal text-xs h-10 px-4 cursor-pointer">
                    View Piece
                  </Button>
                </Link>
              </div>
            </div>

            {/* Ensemble Quick Selector Tabs */}
            <div className="space-y-2 pt-2">
              <span className="text-xs uppercase tracking-wider text-dark-brown/70 font-semibold block">
                All 3 Pieces in This Look:
              </span>
              <div className="space-y-2">
                {LOOK_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveItemId(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      item.id === activeItemId
                        ? "border-muted-gold bg-champagne-light/40 text-charcoal font-medium shadow-xs"
                        : "border-champagne/40 bg-white/70 hover:bg-white text-dark-brown/70"
                    }`}
                  >
                    <span className="truncate pr-2">{item.title}</span>
                    <span className="font-semibold text-charcoal shrink-0">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

