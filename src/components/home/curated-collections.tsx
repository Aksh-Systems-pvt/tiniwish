import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const COLLECTIONS = [
  {
    title: "Festive Radiance",
    subtitle: "Chokers, Jhumkas & Brass Diyas",
    description: "Opulent pieces selected for Diwali, grand weddings, and festive pujas.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    href: "/jewellery?sub=chokers",
    badge: "Trending",
  },
  {
    title: "Gifts Under ₹1,999",
    subtitle: "Everyday Luxuries in Velvet",
    description: "Heartfelt keepsakes and aromatic hampers without compromising elegance.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
    href: "/gifts?sub=under-1999",
    badge: "Popular",
  },
  {
    title: "The Bridal Trousseau",
    subtitle: "Heirloom Bridal Sets",
    description: "Multi-layered Kundan chokers, matching mathapattis, and statement kadas.",
    image: "https://images.unsplash.com/photo-1611591475878-5a676c7c00e1?q=80&w=800&auto=format&fit=crop",
    href: "/jewellery?sub=bridal-sets",
    badge: "Exclusive",
  },
  {
    title: "Sacred Living",
    subtitle: "Brassware & Carved Marble",
    description: "Solid hand-poured brass diyas and Makrana marble for peaceful corners.",
    image: "https://images.unsplash.com/photo-1606744888344-493238955de9?q=80&w=800&auto=format&fit=crop",
    href: "/home-decor?sub=pooja",
    badge: "Artisanal",
  },
];

export function CuratedCollections() {
  return (
    <section className="py-20 lg:py-28 bg-primary-bg border-b border-champagne/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs uppercase tracking-widest font-sans font-medium border border-champagne">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Thematic Edits</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight">
            Curated Collections
          </h2>
          <p className="text-sm sm:text-base text-dark-brown/70 font-light leading-relaxed">
            Thoughtfully grouped by celebration, sentiment, and sacred rituals to help you find the perfect treasure effortlessly.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLLECTIONS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative rounded-2xl overflow-hidden bg-white border border-champagne/60 shadow-subtle hover:shadow-hover hover:border-muted-gold transition-all duration-500 flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary-bg/30">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                {item.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 text-charcoal text-[10px] font-sans font-semibold uppercase tracking-wider shadow-sm">
                    {item.badge}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="text-[10px] uppercase tracking-widest text-champagne font-sans font-medium block">
                    {item.subtitle}
                  </span>
                  <h3 className="font-serif text-xl font-normal text-ivory group-hover:text-champagne transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Bottom description */}
              <div className="p-5 bg-white space-y-3">
                <p className="text-xs text-dark-brown/70 font-light line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-2 border-t border-secondary-bg/60 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-charcoal group-hover:text-muted-gold transition-colors">
                  <span>Explore Edit</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

