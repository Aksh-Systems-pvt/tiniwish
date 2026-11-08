import React from "react";
import { Star, CheckCircle2, Quote, Sparkles } from "lucide-react";

interface Testimonial {
  name: string;
  city: string;
  product: string;
  quote: string;
  date: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aaditi Singhania",
    city: "Mumbai, Maharashtra",
    product: "Noor Meenakari & Kundan Choker Necklace Set",
    quote:
      "The craftsmanship is indistinguishable from real heirloom polki jewellery. The reverse meenakari work and cluster pearls are flawless. Opening the champagne velvet box made me feel like royalty.",
    date: "Verified Purchase • October 2026",
    rating: 5,
  },
  {
    name: "Dr. Meera Iyer",
    city: "Bengaluru, Karnataka",
    product: "Mayur Solid Brass Heritage Diya & Oil Lamp",
    quote:
      "The weight of this solid brass diya is magnificent. It sits as the centerpiece of our pooja sanctuary and radiates such serene warmth. Express air delivery to Bengaluru took just 2 business days.",
    date: "Verified Purchase • November 2026",
    rating: 5,
  },
  {
    name: "Rohan & Priya Saxena",
    city: "New Delhi, NCR",
    product: "Bespoke Keepsake Gift Box & Calligraphy Card",
    quote:
      "We ordered bespoke gift hampers for our sister’s housewarming. The handwritten calligraphy note and satin unboxing brought tears to her eyes. Truly a brand that understands emotional gifting.",
    date: "Verified Purchase • September 2026",
    rating: 5,
  },
];

export function CustomerTestimonials() {
  return (
    <section className="py-20 lg:py-28 bg-primary-bg border-b border-champagne/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs uppercase tracking-widest font-sans font-medium border border-champagne">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cherished Experiences</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight">
            Words of Grace
          </h2>
          <p className="text-sm sm:text-base text-dark-brown/70 font-light leading-relaxed">
            Discover what connoisseurs across India say about their TiniWish unboxing rituals and treasured keepsakes.
          </p>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl border border-champagne/60 p-8 shadow-subtle flex flex-col justify-between hover:shadow-hover hover:border-muted-gold transition-all duration-300"
            >
              <div className="space-y-4">
                {/* 5-star rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-gold">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-muted-gold" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-champagne/40" />
                </div>

                <p className="text-xs sm:text-sm text-dark-brown/80 font-light leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-secondary-bg/80 space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif text-sm font-medium text-charcoal">{t.name}</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <span className="text-[11px] text-muted-gold font-medium block">{t.city}</span>
                <span className="text-[10px] text-dark-brown/50 block font-light">{t.product}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

