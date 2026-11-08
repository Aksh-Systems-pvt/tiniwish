"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "cn";

export interface NavDropdownSection {
  title: string;
  items: {
    label: string;
    href: string;
    badge?: string;
  }[];
}

export interface NavDropdownProps {
  label: string;
  href: string;
  sections: NavDropdownSection[];
  featuredImage?: {
    src: string;
    title: string;
    subtitle: string;
    href: string;
  };
}

export function NavDropdown({
  label,
  href,
  sections,
  featuredImage,
}: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1.5 py-6 text-sm font-sans font-medium tracking-wide transition-colors cursor-pointer",
          isOpen ? "text-muted-gold" : "text-charcoal hover:text-muted-gold"
        )}
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200 text-dark-brown/50",
            isOpen && "rotate-180 text-muted-gold"
          )}
        />
      </Link>

      {/* Mega Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full w-screen max-w-4xl bg-white rounded-xl border border-champagne shadow-modal p-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
        >
          <div className="grid grid-cols-12 gap-8">
            {/* Columns of links */}
            <div className={cn("grid gap-6", featuredImage ? "col-span-8 grid-cols-2" : "col-span-12 grid-cols-3")}>
              {sections.map((section) => (
                <div key={section.title} className="space-y-3">
                  <h4 className="font-serif text-sm font-medium text-charcoal pb-2 border-b border-secondary-bg flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-muted-gold" />
                    <span>{section.title}</span>
                  </h4>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="group/item flex items-center justify-between text-xs text-dark-brown/70 hover:text-charcoal py-1 transition-colors"
                        >
                          <span className="group-hover/item:text-muted-gold transition-colors font-light">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded-full bg-champagne-light text-muted-gold border border-champagne/40">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured Image Editorial Highlight */}
            {featuredImage && (
              <div className="col-span-4 bg-secondary-bg/40 rounded-lg p-4 border border-champagne/40 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden mb-3 border border-champagne/40">
                    <Image
                      src={featuredImage.src}
                      alt={featuredImage.title}
                      fill
                      sizes="280px"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-dark-brown/60 font-medium block">
                    {featuredImage.subtitle}
                  </span>
                  <h5 className="font-serif text-sm font-medium text-charcoal mt-0.5 leading-snug">
                    {featuredImage.title}
                  </h5>
                </div>

                <Link
                  href={featuredImage.href}
                  onClick={() => setIsOpen(false)}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-gold hover:text-dark-brown transition-colors group/cta"
                >
                  <span>Explore Edit</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Bottom Bar: Direct View All Link */}
          <div className="mt-6 pt-4 border-t border-secondary-bg flex items-center justify-between text-xs text-dark-brown/60">
            <span>Discover hand-inspected pieces crafted across Indian heritage hubs.</span>
            <Link
              href={href}
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-charcoal hover:text-muted-gold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View All {label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

