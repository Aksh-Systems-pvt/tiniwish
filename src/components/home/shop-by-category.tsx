import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CategoryDTO } from "@/types/product";

interface ShopByCategoryProps {
  categories: CategoryDTO[];
}

export function ShopByCategory({ categories }: ShopByCategoryProps) {
  // Primary 3 pillar categories
  const mainCategories = categories.length > 0 ? categories.slice(0, 3) : [
    {
      id: "cat_jewellery",
      name: "Artificial Jewellery",
      slug: "jewellery",
      description: "Kundan, temple motifs, and bridal heirlooms crafted in high-grade brass.",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop",
      subcategories: [],
      displayOrder: 1,
    },
    {
      id: "cat_gifts",
      name: "Charming Gifts",
      slug: "gifts",
      description: "Bespoke keepsake hampers with handwritten calligraphy notes and satin ribbon.",
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop",
      subcategories: [],
      displayOrder: 2,
    },
    {
      id: "cat_decor",
      name: "Timeless Home Décor",
      slug: "home-decor",
      description: "Solid cast brassware, sacred diyas, and carved marble tableware.",
      imageUrl: "https://images.unsplash.com/photo-1606744888344-493238955de9?q=80&w=1000&auto=format&fit=crop",
      subcategories: [],
      displayOrder: 3,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-primary-bg border-b border-champagne/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs uppercase tracking-widest font-sans font-medium border border-champagne">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Three Pillars of TiniWish</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight">
            Shop by Category
          </h2>
          <p className="text-sm sm:text-base text-dark-brown/70 font-light leading-relaxed">
            From the radiant glow of uncut Kundan stones to heartfelt bespoke gift hampers and heirloom brassware, explore our iconic collections.
          </p>
        </div>

        {/* 3 Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mainCategories.map((cat, idx) => {
            const imageSrc =
              cat.imageUrl ||
              (idx === 0
                ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop"
                : idx === 1
                ? "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop"
                : "https://images.unsplash.com/photo-1606744888344-493238955de9?q=80&w=1000&auto=format&fit=crop");

            return (
              <div
                key={cat.id || cat.slug}
                className="group relative bg-white rounded-2xl border border-champagne/60 overflow-hidden shadow-subtle hover:shadow-hover transition-all duration-500 flex flex-col justify-between"
              >
                {/* 4:5 Aspect Ratio Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary-bg/30">
                  <Image
                    src={imageSrc}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />

                  {/* Floating Content over Image */}
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-champagne font-sans font-semibold">
                      Collection 0{idx + 1}
                    </span>
                    <h3 className="font-serif text-2xl font-normal text-white group-hover:text-champagne transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-ivory/80 font-light line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Subcategory Pills & Link */}
                <div className="p-6 bg-white space-y-4">
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories.slice(0, 3).map((sub) => (
                        <Link
                          key={sub.id || sub.slug}
                          href={`/${cat.slug}?sub=${encodeURIComponent(sub.slug)}`}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-secondary-bg/60 hover:bg-secondary-bg text-dark-brown/75 hover:text-charcoal border border-champagne/40 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-secondary-bg/60 flex items-center justify-between">
                    <Link
                      href={`/${cat.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal group-hover:text-muted-gold transition-colors"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

