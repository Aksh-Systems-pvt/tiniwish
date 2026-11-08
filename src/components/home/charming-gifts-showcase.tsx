import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Gift } from "lucide-react";
import { ProductDTO } from "@/types/product";
import { ProductGridItem } from "@/components/products/product-grid-item";
import { Button } from "@/components/ui/button";

interface CharmingGiftsShowcaseProps {
  products: ProductDTO[];
}

export function CharmingGiftsShowcase({ products }: CharmingGiftsShowcaseProps) {
  return (
    <section className="py-20 lg:py-28 bg-primary-bg border-b border-champagne/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-champagne/40">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-gold font-sans font-semibold">
              <Gift className="w-3.5 h-3.5" />
              <span>Tokens of Affection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
              Charming Gifts
            </h2>
            <p className="text-xs sm:text-sm text-dark-brown/70 font-light max-w-lg">
              Bespoke celebratory curations wrapped in champagne satin with complimentary personalized calligraphy cards.
            </p>
          </div>

          <Link
            href="/gifts"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-muted-gold transition-colors pb-1"
          >
            <span>Explore All Gifts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Editorial Split Layout: 3 Products on Left, Editorial on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* 3 Live Product Cards (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 order-2 lg:order-1">
            {products.slice(0, 3).map((product) => (
              <ProductGridItem key={product.id} product={product} />
            ))}
          </div>

          {/* Editorial Card (5 cols) */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[440px] lg:min-h-full bg-secondary-bg/50 border border-champagne/60 flex flex-col justify-between p-8 sm:p-10 text-white shadow-subtle group order-1 lg:order-2">
            <Image
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=85&w=1200&auto=format&fit=crop"
              alt="The Art of Thoughtful Gifting"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-charcoal/20" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal/60 backdrop-blur-md border border-muted-gold/60 text-champagne text-[11px] uppercase tracking-widest font-sans font-semibold">
                <Sparkles className="w-3 h-3 text-muted-gold" />
                <span>Signature Unboxing</span>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <span className="text-[11px] uppercase tracking-widest text-champagne font-sans block">
                Keepsake Velvet Packaging
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-normal leading-tight text-ivory">
                The Art of Thoughtful Gifting
              </h3>
              <p className="text-xs sm:text-sm text-ivory/85 font-light leading-relaxed">
                Whether celebrating a wedding, anniversary, or a simple heartfelt thank you, every TiniWish gift is prepared as a keepsake to treasure forever.
              </p>
              <div className="pt-2">
                <Link href="/gifts">
                  <Button className="bg-muted-gold hover:bg-gold-light text-charcoal text-xs uppercase tracking-wider font-semibold px-6 py-5 cursor-pointer">
                    Curate a Gift
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

