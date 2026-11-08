import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Our Heritage & Story | TiniWish",
  description:
    "Little wishes. Timeless treasures. Discover the artisans, values, and design philosophy behind TiniWish.",
};

export default function AboutPage() {
  return (
    <div className="py-16 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-muted-gold font-semibold">
            Our Maison & Craftsmanship
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-charcoal font-normal tracking-tight">
            Little wishes. <br />
            <span className="italic text-muted-gold font-serif">Timeless treasures.</span>
          </h1>
          <p className="text-base sm:text-lg text-dark-brown/75 font-light leading-relaxed">
            Founded with a reverent passion for India&apos;s celebrated artisanal traditions, TiniWish crafts artificial jewellery, celebratory gifts, and home accents that bring effortless luxury into modern homes.
          </p>
        </div>

        {/* Narrative Section 1 */}
        <section id="craftsmanship" className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white p-8 sm:p-12 rounded-2xl border border-champagne/60 shadow-subtle">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-muted-gold font-semibold">
              The Heritage
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
              Hand-Set Stones & Royal Enamel
            </h2>
            <p className="text-xs sm:text-sm text-dark-brown/75 leading-relaxed font-light">
              Our artificial jewellery collections originate from traditional jewellery hubs across Jaipur, Hyderabad, and Rajkot. Master silversmiths and artisans hand-cut glass Kundan stones, delicate polki facets, and apply reversible meenakari enameling to high-grade brass.
            </p>
            <p className="text-xs sm:text-sm text-dark-brown/75 leading-relaxed font-light">
              Every choker, jhumka, and kada undergoes a 3-layer protective coating to resist tarnishing and remain hypoallergenic for sensitive skin.
            </p>
          </div>
          <div className="bg-secondary-bg/50 p-6 rounded-xl border border-champagne/40 space-y-4 text-xs text-dark-brown/80">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-muted-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif text-sm text-charcoal font-medium">100% Lead & Nickel Free</h4>
                <p className="text-[11px] text-dark-brown/60 mt-0.5">Compliant with international hypoallergenic safety benchmarks.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-muted-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif text-sm text-charcoal font-medium">Artisanal Fair Wages</h4>
                <p className="text-[11px] text-dark-brown/60 mt-0.5">Directly working with over 45 generational craft families across 4 states.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif text-sm text-charcoal font-medium">Multi-Point Quality Auditing</h4>
                <p className="text-[11px] text-dark-brown/60 mt-0.5">Every setting and stone is inspected under magnification before dispatch.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative Section 2: Sustainability */}
        <section id="sustainability" className="space-y-6 text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-muted-gold font-semibold">
            Conscious Luxury
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Signature Packaging with a Gentle Footprint
          </h2>
          <p className="text-xs sm:text-sm text-dark-brown/75 leading-relaxed font-light">
            We believe unboxing should feel like receiving a heartfelt letter. Every TiniWish treasure arrives nestled in reusable velvet and rigid paper keepsake boxes, tied with satin ribbon and sealed with a handwritten calligraphy note. We eliminate single-use plastics from customer parcels in favor of biodegradable protective cushioning.
          </p>
        </section>

        {/* CTA Banner */}
        <div className="bg-charcoal text-white rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <h3 className="font-serif text-2xl sm:text-3xl font-normal">
            Ready to Discover Your Next Treasure?
          </h3>
          <p className="text-xs sm:text-sm text-ivory/80 max-w-md mx-auto font-light leading-relaxed">
            Explore our curated collections of artificial jewellery, bespoke celebratory gift boxes, and timeless brass home décor.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/jewellery">
              <Button className="bg-muted-gold hover:bg-gold-light text-charcoal text-xs uppercase tracking-wider font-semibold px-6 py-5 cursor-pointer">
                Shop Jewellery
              </Button>
            </Link>
            <Link href="/gifts">
              <Button variant="outline" className="border-champagne/40 text-ivory hover:bg-white/10 text-xs uppercase tracking-wider font-semibold px-6 py-5 cursor-pointer">
                Curate Gifts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
