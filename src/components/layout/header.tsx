"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  User,
  ChevronRight,
  Package,
  Headphones,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/context/store-context";
import { NavDropdown, NavDropdownProps } from "./nav-dropdown";
import { SearchModal } from "./search-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";

const emptySubscribe = () => () => {};
function useIsHydratedClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const JEWELLERY_DROPDOWN: Omit<NavDropdownProps, "label" | "href"> = {
  sections: [
    {
      title: "Neckpieces & Chokers",
      items: [
        { label: "Kundan & Polki Chokers", href: "/jewellery?sub=chokers", badge: "Trending" },
        { label: "Temple Heritage Necklaces", href: "/jewellery?sub=necklaces" },
        { label: "Delicate Pendants & Chains", href: "/jewellery?sub=pendants" },
        { label: "Bridal Trousseau Sets", href: "/jewellery?sub=bridal-sets" },
      ],
    },
    {
      title: "Earrings & Wristwear",
      items: [
        { label: "Chandrika Pearl Jhumkas", href: "/jewellery?sub=jhumkas" },
        { label: "Statement Chandbalis", href: "/jewellery?sub=chandbalis" },
        { label: "Kada & Bangle Sets", href: "/jewellery?sub=bangles" },
        { label: "Adjustable Cocktail Rings", href: "/jewellery?sub=rings" },
      ],
    },
  ],
  featuredImage: {
    src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop",
    title: "The Kundan Edit",
    subtitle: "Handcrafted Heirlooms",
    href: "/jewellery",
  },
};

const GIFTS_DROPDOWN: Omit<NavDropdownProps, "label" | "href"> = {
  sections: [
    {
      title: "By Recipient & Occasion",
      items: [
        { label: "For Her: Keepsake Boxes", href: "/gifts?occ=for-her" },
        { label: "Wedding & Anniversary Gifts", href: "/gifts?occ=wedding" },
        { label: "Housewarming Blessings", href: "/gifts?occ=housewarming" },
        { label: "Festive Curations", href: "/gifts?occ=festive" },
      ],
    },
    {
      title: "Curated Hampers",
      items: [
        { label: "Bespoke Keepsake Boxes", href: "/gifts?sub=gift-boxes" },
        { label: "Gifts Under ₹1,999", href: "/gifts?sub=under-1999", badge: "Popular" },
        { label: "Personalized Presents", href: "/gifts?sub=personalized" },
        { label: "Corporate Luxe Curations", href: "/gifts?sub=corporate" },
      ],
    },
  ],
  featuredImage: {
    src: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop",
    title: "Bespoke Hampers",
    subtitle: "Wrapped in Signature Champagne Satin",
    href: "/gifts",
  },
};

const HOME_DECOR_DROPDOWN: Omit<NavDropdownProps, "label" | "href"> = {
  sections: [
    {
      title: "Artisanal Accents",
      items: [
        { label: "Brass Peacock Diyas & Lanterns", href: "/home-decor?sub=diyas" },
        { label: "Handcrafted Urns & Vases", href: "/home-decor?sub=vases" },
        { label: "Carved Marble Trays", href: "/home-decor?sub=marble" },
        { label: "Aromatic Soy Candles", href: "/home-decor?sub=candles" },
      ],
    },
    {
      title: "Living & Pooja Spaces",
      items: [
        { label: "Sacred Pooja Sanctuary", href: "/home-decor?sub=pooja" },
        { label: "Dining & Centerpiece Tableware", href: "/home-decor?sub=tableware" },
        { label: "Entryway Statement Accents", href: "/home-decor?sub=entryway" },
        { label: "New Season Heritage Accents", href: "/home-decor?sub=new", badge: "New" },
      ],
    },
  ],
  featuredImage: {
    src: "https://images.unsplash.com/photo-1606744888344-493238955de9?q=80&w=1000&auto=format&fit=crop",
    title: "Artisanal Brassware",
    subtitle: "Sacred Living Accents",
    href: "/home-decor",
  },
};

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const isMounted = useIsHydratedClient();

  const { cartCount, wishlistCount, isHydrated, openCartDrawer } = useStore();

  // Keyboard shortcut (Cmd+K / Ctrl+K or /) to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleMobileCategory = (cat: string) => {
    setExpandedMobileCategory((prev) => (prev === cat ? null : cat));
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-primary-bg/95 backdrop-blur-md border-b border-champagne/50 transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Mobile Menu Trigger */}
            <div className="flex items-center lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger
                  aria-label="Open Mobile Menu"
                  className="inline-flex items-center justify-center h-11 w-11 rounded-lg text-charcoal hover:bg-secondary-bg hover:text-muted-gold transition-colors cursor-pointer"
                >
                  <Menu className="h-6 w-6" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[380px] bg-primary-bg p-0 flex flex-col justify-between overflow-y-auto">
                  <div>
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-champagne/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src="/icons/logo.png"
                          alt="TiniWish Logo"
                          width={38}
                          height={34}
                          className="h-9 w-auto object-contain shrink-0"
                        />
                        <SheetTitle className="font-serif text-2xl font-medium tracking-tight text-charcoal leading-none">
                          TiniWish
                        </SheetTitle>
                      </div>
                    </div>

                    {/* Search Bar Shortcut */}
                    <div className="p-4 border-b border-champagne/30">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsSearchOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-white border border-champagne/60 text-dark-brown/60 hover:border-muted-gold text-xs transition-colors cursor-pointer text-left"
                      >
                        <Search className="w-4 h-4 text-muted-gold shrink-0" />
                        <span className="flex-1">Search jewellery, gifts, décor...</span>
                      </button>
                    </div>

                    {/* Mobile Navigation Links */}
                    <nav className="p-4 space-y-1">
                      {/* Artificial Jewellery Accordion */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleMobileCategory("jewellery")}
                          className="w-full flex items-center justify-between py-3 px-2 text-sm font-serif font-medium text-charcoal hover:text-muted-gold transition-colors cursor-pointer"
                        >
                          <span>Artificial Jewellery</span>
                          <ChevronRight
                            className={`w-4 h-4 text-dark-brown/40 transition-transform ${
                              expandedMobileCategory === "jewellery" ? "rotate-90 text-muted-gold" : ""
                            }`}
                          />
                        </button>
                        {expandedMobileCategory === "jewellery" && (
                          <div className="pl-4 pb-2 space-y-1.5 border-l-2 border-muted-gold/30 ml-2">
                            <Link
                              href="/jewellery"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1.5 text-xs font-medium text-muted-gold hover:underline"
                            >
                              Explore All Jewellery →
                            </Link>
                            <Link
                              href="/jewellery?sub=chokers"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Kundan & Polki Chokers
                            </Link>
                            <Link
                              href="/jewellery?sub=jhumkas"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Chandrika Pearl Jhumkas
                            </Link>
                            <Link
                              href="/jewellery?sub=bangles"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Kada & Bangle Sets
                            </Link>
                            <Link
                              href="/jewellery?sub=bridal-sets"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Bridal Trousseau Sets
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Charming Gifts Accordion */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleMobileCategory("gifts")}
                          className="w-full flex items-center justify-between py-3 px-2 text-sm font-serif font-medium text-charcoal hover:text-muted-gold transition-colors cursor-pointer"
                        >
                          <span>Charming Gifts</span>
                          <ChevronRight
                            className={`w-4 h-4 text-dark-brown/40 transition-transform ${
                              expandedMobileCategory === "gifts" ? "rotate-90 text-muted-gold" : ""
                            }`}
                          />
                        </button>
                        {expandedMobileCategory === "gifts" && (
                          <div className="pl-4 pb-2 space-y-1.5 border-l-2 border-muted-gold/30 ml-2">
                            <Link
                              href="/gifts"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1.5 text-xs font-medium text-muted-gold hover:underline"
                            >
                              Explore All Gifts →
                            </Link>
                            <Link
                              href="/gifts?sub=gift-boxes"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Bespoke Keepsake Boxes
                            </Link>
                            <Link
                              href="/gifts?sub=under-1999"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Gifts Under ₹1,999 (Popular)
                            </Link>
                            <Link
                              href="/gifts?occ=wedding"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Wedding & Anniversary Gifts
                            </Link>
                            <Link
                              href="/gifts?sub=personalized"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Personalized Presents
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Timeless Home Décor Accordion */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleMobileCategory("home-decor")}
                          className="w-full flex items-center justify-between py-3 px-2 text-sm font-serif font-medium text-charcoal hover:text-muted-gold transition-colors cursor-pointer"
                        >
                          <span>Timeless Home Décor</span>
                          <ChevronRight
                            className={`w-4 h-4 text-dark-brown/40 transition-transform ${
                              expandedMobileCategory === "home-decor" ? "rotate-90 text-muted-gold" : ""
                            }`}
                          />
                        </button>
                        {expandedMobileCategory === "home-decor" && (
                          <div className="pl-4 pb-2 space-y-1.5 border-l-2 border-muted-gold/30 ml-2">
                            <Link
                              href="/home-decor"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1.5 text-xs font-medium text-muted-gold hover:underline"
                            >
                              Explore All Home Décor →
                            </Link>
                            <Link
                              href="/home-decor?sub=diyas"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Brass Peacock Diyas & Lanterns
                            </Link>
                            <Link
                              href="/home-decor?sub=vases"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Handcrafted Urns & Vases
                            </Link>
                            <Link
                              href="/home-decor?sub=marble"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Carved Marble Trays & Coasters
                            </Link>
                            <Link
                              href="/home-decor?sub=candles"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs text-dark-brown/70 hover:text-charcoal"
                            >
                              Aromatic Soy Candles
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* All Collections */}
                      <Link
                        href="/products"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 px-2 text-sm font-serif font-medium text-charcoal hover:text-muted-gold transition-colors"
                      >
                        All Collections
                      </Link>
                    </nav>

                    {/* Secondary Customer Care Links */}
                    <div className="p-4 border-t border-champagne/40 space-y-2.5">
                      <Link
                        href="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 px-2 text-xs font-medium text-dark-brown/80 hover:text-charcoal"
                      >
                        <User className="w-4 h-4 text-muted-gold" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 px-2 text-xs font-medium text-dark-brown/80 hover:text-charcoal"
                      >
                        <span className="flex items-center gap-3">
                          <Heart className="w-4 h-4 text-muted-gold" />
                          <span>My Wishlist</span>
                        </span>
                        {isMounted && isHydrated && wishlistCount > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted-gold text-white">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/track-order"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 px-2 text-xs font-medium text-dark-brown/80 hover:text-charcoal"
                      >
                        <Package className="w-4 h-4 text-muted-gold" />
                        <span>Track Your Order</span>
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 px-2 text-xs font-medium text-dark-brown/80 hover:text-charcoal"
                      >
                        <Headphones className="w-4 h-4 text-muted-gold" />
                        <span>Customer Concierge</span>
                      </Link>
                    </div>
                  </div>

                  {/* Drawer Footer Badge */}
                  <div className="p-4 bg-secondary-bg/60 border-t border-champagne/40 text-center">
                    <p className="text-[11px] font-medium text-dark-brown/70 flex items-center justify-center gap-1.5">
                      <span>🇮🇳</span>
                      <span>Pan-India Express Delivery • INR (₹)</span>
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center">
              <Link href="/" className="group flex items-center gap-3">
                <Image
                  src="/icons/logo.png"
                  alt="TiniWish Logo"
                  width={44}
                  height={40}
                  priority
                  className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
                />
                <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-charcoal group-hover:text-muted-gold transition-colors leading-none">
                  TiniWish
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links with Mega Dropdowns */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <NavDropdown
                label="Artificial Jewellery"
                href="/jewellery"
                sections={JEWELLERY_DROPDOWN.sections}
                featuredImage={JEWELLERY_DROPDOWN.featuredImage}
              />
              <NavDropdown
                label="Charming Gifts"
                href="/gifts"
                sections={GIFTS_DROPDOWN.sections}
                featuredImage={GIFTS_DROPDOWN.featuredImage}
              />
              <NavDropdown
                label="Timeless Home Décor"
                href="/home-decor"
                sections={HOME_DECOR_DROPDOWN.sections}
                featuredImage={HOME_DECOR_DROPDOWN.featuredImage}
              />
              <Link
                href="/products"
                className="py-6 text-sm font-sans font-medium tracking-wide text-charcoal hover:text-muted-gold transition-colors"
              >
                All Collections
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search Collection"
                className="inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-lg text-charcoal hover:text-muted-gold hover:bg-secondary-bg/70 transition-colors cursor-pointer"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Account Link */}
              <Link
                href="/account"
                aria-label="My Account"
                className="inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-lg text-charcoal hover:text-muted-gold hover:bg-secondary-bg/70 transition-colors"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Wishlist Link with Live Badge */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-lg text-charcoal hover:text-muted-gold hover:bg-secondary-bg/70 transition-colors"
              >
                <Heart className="h-5 w-5" />
                {isMounted && isHydrated && wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-muted-gold text-[9px] font-bold text-white shadow-sm animate-in zoom-in-75 duration-150">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Button with Live Badge & Drawer */}
              <button
                type="button"
                onClick={openCartDrawer}
                aria-label="Shopping Bag"
                className="relative inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-lg text-charcoal hover:text-muted-gold hover:bg-secondary-bg/70 transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5" />
                {isMounted && isHydrated && cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-charcoal text-[9px] font-bold text-primary-bg shadow-sm animate-in zoom-in-75 duration-150">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Accessible Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Luxury Cart Drawer */}
      <CartDrawer />
    </>
  );
}
