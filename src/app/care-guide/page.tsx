import React from "react";
import { Sparkles, Shield, Droplets, Sun, Wind } from "lucide-react";

export const metadata = {
  title: "Jewellery & Brass Care Guide | TiniWish",
  description:
    "Preserve the luster and life of your handcrafted Kundan jewellery and artisanal brassware.",
};

export default function CareGuidePage() {
  return (
    <div className="py-14 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs font-medium uppercase tracking-widest border border-champagne">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preserving Heirlooms</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Jewellery & Brass Care Guide
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Simple rituals to maintain the royal sparkle of your Kundan, polki stones, and brass accents for years to come.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rule 1 */}
          <div className="bg-white rounded-xl border border-champagne/60 p-6 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-full bg-champagne-light/70 text-muted-gold flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base text-charcoal font-medium">Keep Away from Water & Perfumes</h3>
            <p className="text-xs text-dark-brown/75 leading-relaxed font-light">
              Always apply perfumes, hairsprays, and lotions first, letting them dry completely before putting on your jewellery. Never wear jewellery while bathing or swimming.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="bg-white rounded-xl border border-champagne/60 p-6 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-full bg-champagne-light/70 text-muted-gold flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base text-charcoal font-medium">Store in Airtight Pouches</h3>
            <p className="text-xs text-dark-brown/75 leading-relaxed font-light">
              Store each piece individually in your complimentary TiniWish zip lock and velvet pouch to prevent exposure to humidity and prevent stones from scratching each other.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="bg-white rounded-xl border border-champagne/60 p-6 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-full bg-champagne-light/70 text-muted-gold flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base text-charcoal font-medium">Gentle Dry Microfibre Wipe</h3>
            <p className="text-xs text-dark-brown/75 leading-relaxed font-light">
              After wearing, gently wipe away sweat or natural skin oils with a soft microfibre cloth before storing. Never use chemical jewellery dips or abrasive cleaners on artificial stones.
            </p>
          </div>

          {/* Rule 4: Brassware */}
          <div className="bg-white rounded-xl border border-champagne/60 p-6 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-full bg-champagne-light/70 text-muted-gold flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base text-charcoal font-medium">Caring for Artisanal Brassware</h3>
            <p className="text-xs text-dark-brown/75 leading-relaxed font-light">
              Solid brass naturally develops a warm antique patina over time. To restore its bright golden luster, polish gently using traditional Pitambari powder or lemon with a pinch of salt, followed by a dry soft cloth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
