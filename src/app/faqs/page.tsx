"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: "Jewellery & Materials",
    q: "Is TiniWish jewellery made from real gold or artificial materials?",
    a: "All TiniWish jewellery is premium handcrafted artificial (fashion) jewellery. We use high-grade brass alloy cores finished with 18K or 24K gold micro-plating, uncut glass Kundan, simulated polki, and cluster seed pearls to achieve royal heirloom brilliance at accessible price points.",
  },
  {
    category: "Jewellery & Materials",
    q: "Will the jewellery cause allergies or skin reactions?",
    a: "No. All our jewellery is 100% lead, cadmium, and nickel-free, adhering to international hypoallergenic standards. It is safe for all skin types.",
  },
  {
    category: "Shipping & Delivery",
    q: "How long does delivery take across India?",
    a: "For tier-1 metro cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata), delivery takes 2 to 3 business days. For the rest of India, standard express delivery takes 4 to 6 business days via Shiprocket air couriers.",
  },
  {
    category: "Shipping & Delivery",
    q: "What are your shipping charges?",
    a: "We offer Free Express Shipping on all orders of ₹999 and above. For orders under ₹999, a nominal subsidized shipping fee of ₹99 is applied at checkout.",
  },
  {
    category: "Gifting & Packaging",
    q: "Do you include a gift box with every order?",
    a: "Yes! Every single TiniWish creation arrives in our signature champagne or velvet keepsake rigid gift box, complete with a satin ribbon and a personalized handwritten calligraphy gift note at no extra charge.",
  },
  {
    category: "Returns & Exchanges",
    q: "What is your replacement policy if an item arrives damaged?",
    a: "We offer a 7-day hassle-free replacement policy. If any item is damaged during transit or has a missing stone, email care@tiniwish.com with a photo, and our courier partner will arrange a doorstep replacement pickup.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="py-14 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs font-medium uppercase tracking-widest border border-champagne">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Concierge Assistance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Answers to common queries regarding craftsmanship, shipping, gifting boxes, and care.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-xl border border-champagne/60 overflow-hidden shadow-subtle transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-serif text-sm sm:text-base font-medium text-charcoal hover:text-muted-gold transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-dark-brown/50 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-muted-gold" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-dark-brown/75 leading-relaxed font-light border-t border-secondary-bg/60 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Card */}
        <div className="bg-secondary-bg/50 rounded-2xl border border-champagne/60 p-8 text-center space-y-4 max-w-xl mx-auto">
          <MessageCircle className="w-8 h-8 text-muted-gold mx-auto" />
          <h3 className="font-serif text-xl text-charcoal font-medium">
            Still Have a Question?
          </h3>
          <p className="text-xs text-dark-brown/70 max-w-sm mx-auto">
            Our personal shopping concierge is available Mon – Sat (10 AM to 7 PM IST) to assist with styling and order queries.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/contact">
              <Button className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-2 h-10 cursor-pointer">
                Contact Concierge
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
