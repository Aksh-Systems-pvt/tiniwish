import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface SocialPost {
  image: string;
  handle: string;
  caption: string;
  href: string;
}

const SOCIAL_POSTS: SocialPost[] = [
  {
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    handle: "@radhika.weddingdiaries",
    caption: "The Noor choker brought my mehendi look alive ✨",
    href: "/jewellery",
  },
  {
    image: "https://images.unsplash.com/photo-1611591475878-5a676c7c00e1?q=80&w=600&auto=format&fit=crop",
    handle: "@ananya_luxe",
    caption: "Chandrika jhumkas catching the golden hour light",
    href: "/jewellery",
  },
  {
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop",
    handle: "@thepoojahouse",
    caption: "A keepsake hamper made with purest love",
    href: "/gifts",
  },
  {
    image: "https://images.unsplash.com/photo-1606744888344-493238955de9?q=80&w=600&auto=format&fit=crop",
    handle: "@artisan_abode",
    caption: "The gentle morning glow of the Mayur brass diya",
    href: "/home-decor",
  },
  {
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
    handle: "@kavita.styling",
    caption: "Layered elegance for the festive season",
    href: "/jewellery",
  },
  {
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
    handle: "@ritika.vows",
    caption: "Unboxing sacred blessings in signature velvet",
    href: "/gifts",
  },
];

export function InstagramGallery() {
  return (
    <section className="py-20 lg:py-24 bg-white border-b border-champagne/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs uppercase tracking-widest font-sans font-medium border border-champagne">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Community</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
            #TiniWishMoments
          </h2>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light max-w-md mx-auto">
            Share your radiant celebrations and pooja corners. Tag{" "}
            <a
              href="https://www.instagram.com/tiniwish.in/?utm_source=ig_web_button_share_sheet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-gold font-medium hover:underline"
            >
              @tiniwish
            </a>{" "}
            on Instagram to be featured.
          </p>
        </div>

        {/* 6 Square Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {SOCIAL_POSTS.map((post, idx) => (
            <Link
              key={idx}
              href={post.href}
              className="group relative aspect-square rounded-xl overflow-hidden bg-secondary-bg/30 border border-champagne/40 shadow-xs block"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-charcoal/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 text-white text-center">
                <div className="flex justify-end">
                  <svg className="w-3.5 h-3.5 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-champagne block truncate">
                    {post.handle}
                  </span>
                  <p className="text-[9px] text-ivory/80 line-clamp-2 font-light">
                    {post.caption}
                  </p>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-gold inline-flex items-center justify-center gap-1">
                  <span>Shop Look</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

