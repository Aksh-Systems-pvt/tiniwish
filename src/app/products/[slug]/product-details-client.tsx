"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/store-context";
import { ProductDTO, ProductVariantDTO } from "@/types/product";
import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { PincodeChecker } from "@/components/products/pincode-checker";
import { ProductReviewsSection } from "@/components/products/product-reviews-section";
import { RecentlyViewed } from "@/components/products/recently-viewed";
import { ProductShareModal } from "@/components/products/product-share-modal";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Heart,
  ShoppingBag,
  Zap,
  Share2,
  Star,
  Gift,
  Truck,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";

interface ProductDetailsClientProps {
  product: ProductDTO;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants.find((v) => v.isDefault)?.id || product.variants[0]?.id || "default"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"story" | "specs" | "shipping" | "care">("story");
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const selectedVariant: ProductVariantDTO =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0] || {
      id: "default",
      productId: product.id,
      sku: "TW-EXP-001",
      title: "Standard Edition",
      attributes: {},
      mrp: 3999,
      sellingPrice: 2999,
      stockQuantity: 10,
      lowStockThreshold: 3,
      weightGrams: 150,
      lengthCm: 15,
      widthCm: 10,
      heightCm: 5,
      isDefault: true,
      isActive: true,
    };

  const price = selectedVariant.sellingPrice;
  const mrp = selectedVariant.mrp;
  const discountPercent =
    mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  const stock = selectedVariant.stockQuantity;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= (selectedVariant.lowStockThreshold || 4);

  const wishlisted = isWishlisted(product.id);

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop";

  // Clamp quantity if active variant stock is lower than current quantity
  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    const targetVariant = product.variants.find((v) => v.id === variantId);
    if (targetVariant && targetVariant.stockQuantity < quantity) {
      setQuantity(Math.max(1, Math.min(1, targetVariant.stockQuantity)));
    }
  };

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityIncrease = () => {
    if (isOutOfStock) return;
    setQuantity((prev) => {
      if (prev >= stock) {
        toast.info(
          "Maximum Stock Reached",
          `Only ${stock} units are currently available for this selection.`
        );
        return prev;
      }
      return prev + 1;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Item Unavailable", "This variant is currently out of stock.");
      return;
    }

    addToCart(
      {
        id: `${product.id}-${selectedVariant.id}`,
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: primaryImage,
        price: Number(price),
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error("Item Unavailable", "This variant is currently out of stock.");
      return;
    }

    addToCart(
      {
        id: `${product.id}-${selectedVariant.id}`,
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: primaryImage,
        price: Number(price),
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
      },
      quantity
    );

    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      price: Number(price),
    });
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-16">
      {/* Top Section: Media Gallery & Primary Purchase Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Image Gallery with Interactive Zoom */}
        <div className="lg:col-span-7">
          <ProductImageGallery
            images={product.images}
            title={product.title}
            isBestseller={product.isFeatured}
            discountPercent={discountPercent}
            inStock={!isOutOfStock}
          />
        </div>

        {/* Right Column: Detailed Product Info, Variant Picker, Pricing, CTAs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Category Breadcrumb info */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-widest text-muted-gold font-semibold">
                {product.categoryName || "TiniWish Connoisseur"}
              </span>

              {/* SKU Display */}
              <span className="text-[11px] font-mono tracking-wider text-dark-brown/50">
                SKU: {selectedVariant.sku}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal font-normal tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Rating Stars & Customer Review Jump */}
            <div className="mt-2.5 flex items-center gap-3 text-xs">
              <a
                href="#customer-reviews"
                className="flex items-center gap-1.5 text-muted-gold hover:underline cursor-pointer"
              >
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(product.rating || 5)
                          ? "fill-muted-gold text-muted-gold"
                          : "fill-secondary-bg text-champagne"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-charcoal">
                  {(product.rating || 5.0).toFixed(1)}
                </span>
                <span className="text-dark-brown/60">
                  ({product.reviewCount || 38} reviews)
                </span>
              </a>

              <span className="text-champagne/80">•</span>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 text-dark-brown/60 hover:text-charcoal transition-colors cursor-pointer"
                aria-label="Share product"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Pricing Strip & Tax Assurance */}
          <div className="p-4 rounded-xl bg-secondary-bg/25 border border-champagne/50">
            <div className="flex items-baseline gap-3">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-charcoal">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {mrp && mrp > price && (
                <span className="font-sans text-base text-dark-brown/50 line-through">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent && discountPercent > 0 && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-[11px] text-dark-brown/60 mt-1">
              MRP inclusive of all taxes. Free express shipping on all orders above ₹999.
            </p>
          </div>

          {/* Editorial Short Description */}
          <p className="text-xs sm:text-sm text-dark-brown/80 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Variant Selector (if multiple variants available) */}
          {product.variants.length > 1 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-charcoal">
                  Finish & Variant:
                </span>
                <span className="text-muted-gold font-medium">
                  {selectedVariant.title}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  const isVarOutOfStock = v.stockQuantity <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVariantChange(v.id)}
                      className={`text-xs px-4 py-2.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "border-charcoal bg-charcoal text-white shadow-sm ring-1 ring-charcoal"
                          : "border-champagne bg-white text-charcoal hover:border-muted-gold"
                      } ${isVarOutOfStock ? "opacity-60 line-through" : ""}`}
                    >
                      <span>{v.title}</span>
                      {v.sellingPrice !== price && (
                        <span
                          className={`text-[10px] ${
                            isSelected ? "text-champagne" : "text-dark-brown/60"
                          }`}
                        >
                          (₹{v.sellingPrice.toLocaleString("en-IN")})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Availability Indicator */}
          <div className="text-xs">
            {isOutOfStock ? (
              <div className="flex items-center gap-1.5 text-destructive font-medium">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Currently Out of Stock. Reserve notification available.</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Hurry! Only {stock} pieces remaining in this edition.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>In Stock — Dispatched within 24 hours from Jaipur atelier.</span>
              </div>
            )}
          </div>

          {/* Quantity Selector, Add to Bag, Buy Now, and Wishlist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Counter */}
              <div className="inline-flex items-center rounded-lg border border-champagne bg-white h-12 shadow-subtle shrink-0">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={handleQuantityDecrease}
                  className="px-3.5 h-full text-dark-brown/70 hover:text-charcoal disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-2 text-xs font-semibold text-charcoal min-w-[28px] text-center font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= stock || isOutOfStock}
                  onClick={handleQuantityIncrease}
                  className="px-3.5 h-full text-dark-brown/70 hover:text-charcoal disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <Button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 bg-charcoal hover:bg-dark-brown disabled:bg-charcoal/40 text-white text-xs h-12 font-sans uppercase tracking-widest font-semibold rounded-lg shadow-sm cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? "Sold Out" : "Add to Shopping Bag"}</span>
              </Button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`h-12 w-12 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-subtle ${
                  wishlisted
                    ? "border-muted-gold bg-champagne-light/50 text-rose-600"
                    : "border-champagne bg-white text-dark-brown/70 hover:border-muted-gold hover:text-rose-600"
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-transform active:scale-90 ${
                    wishlisted ? "fill-rose-600 text-rose-600" : ""
                  }`}
                />
              </button>
            </div>

            {/* Instant "Buy Now" Direct Checkout Action */}
            <Button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="w-full bg-muted-gold hover:bg-dark-brown disabled:bg-muted-gold/40 text-white text-xs h-12 font-sans uppercase tracking-widest font-semibold rounded-lg shadow-sm cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isOutOfStock ? "Item Unavailable" : "Buy Now with 1-Click"}</span>
            </Button>
          </div>

          {/* Interactive Indian Delivery PIN Code Checker */}
          <PincodeChecker />

          {/* Luxury Brand Trust Badges Strip */}
          <div className="p-4 rounded-xl bg-white border border-champagne/60 space-y-3 text-xs text-dark-brown/80 shadow-subtle">
            <div className="flex items-center gap-3">
              <Gift className="w-4 h-4 text-muted-gold shrink-0" />
              <span>Signature Velvet Keepsake Box & Gold-foil Calligraphy Card</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-muted-gold shrink-0" />
              <span>Free Express Insured Air Delivery across India on orders over ₹999</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-muted-gold shrink-0" />
              <span>7-Day Hassle-Free Doorstep Replacement Guarantee</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-muted-gold shrink-0" />
              <span>100% Skin Safe, Hypoallergenic, Nickel & Lead Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Artisanal Story, Technical Specifications, Shipping Policy, Care Guide */}
      <div className="pt-8 border-t border-champagne/40">
        <div className="flex border-b border-champagne/60 overflow-x-auto scrollbar-none gap-6 sm:gap-8">
          {[
            { id: "story", label: "Artisanal Story" },
            { id: "specs", label: "Specifications" },
            { id: "shipping", label: "Shipping & Returns" },
            { id: "care", label: "Care Guide" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all cursor-pointer border-b-2 shrink-0 ${
                activeTab === tab.id
                  ? "border-muted-gold text-charcoal"
                  : "border-transparent text-dark-brown/60 hover:text-charcoal"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === "story" && (
            <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-dark-brown/80 leading-relaxed font-light">
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal font-normal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-muted-gold" />
                <span>The Story of {product.title}</span>
              </h3>
              <p>{product.description}</p>
              <p>
                Each piece at TiniWish is hand-finished by master artisans in Rajasthan,
                embodying centuries-old heritage techniques infused with contemporary minimal
                aesthetics. From the hand-set stones to the multi-layered gold micro-plating,
                every detail is meticulously crafted to ensure longevity and timeless appeal.
              </p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-3xl">
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal font-normal mb-4">
                Detailed Product Specifications
              </h3>
              <div className="divide-y divide-champagne/40 border-y border-champagne/40 text-xs text-dark-brown/80">
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-charcoal">Master SKU:</span>
                  <span className="font-mono">{selectedVariant.sku}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-charcoal">Materials & Construction:</span>
                  <span>{product.materials || "High-grade brass alloy, 18K gold micro-plating"}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-charcoal">Finish / Shade:</span>
                  <span>{selectedVariant.title}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-charcoal">Weight:</span>
                  <span>{selectedVariant.weightGrams} grams</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-charcoal">Dimensions (L × W × H):</span>
                  <span>
                    {selectedVariant.lengthCm} × {selectedVariant.widthCm} × {selectedVariant.heightCm} cm
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-charcoal">Skin Compatibility:</span>
                  <span>Hypoallergenic, Nickel & Lead Free</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-charcoal">Certificate of Authenticity:</span>
                  <span>Included with signature hallmark</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-dark-brown/80 leading-relaxed font-light">
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal font-normal">
                Shipping, Packaging & Doorstep Returns
              </h3>
              <div className="space-y-3">
                <p>
                  <strong>Insured Express Delivery:</strong> All orders are dispatched within 24 to 48 hours via premium express air couriers (Blue Dart, Delhivery, DTDC). Metro deliveries arrive in 2–3 business days; rest of India within 4–6 business days.
                </p>
                <p>
                  <strong>Luxury Packaging:</strong> Your order arrives in our signature velvet keepsake gift box, tied with champagne satin ribbon and accompanied by a personalized handwritten calligraphy note.
                </p>
                <p>
                  <strong>7-Day Replacement:</strong> We guarantee a 7-day hassle-free doorstep replacement or store credit in the unlikely event of transit damage or sizing discrepancy.
                </p>
              </div>
            </div>
          )}

          {activeTab === "care" && (
            <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-dark-brown/80 leading-relaxed font-light">
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal font-normal">
                Connoisseur Care Guide
              </h3>
              <p>
                {product.careInstructions ||
                  "Store each treasure separately in the provided airtight velvet pouch. Avoid contact with perfumes, sanitizers, chlorine, and moisture. Clean gently with the microfibre polishing cloth after each wear."}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Put jewellery on after applying cosmetics, perfumes, and lotions.</li>
                <li>Store in cool, dry compartments away from direct sunlight.</li>
                <li>Never immerse hand-enamelled Meenakari or Kundan pieces in chemical cleaners.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviewsSection
        productId={product.id}
        productTitle={product.title}
        rating={product.rating || 5.0}
        reviewCount={product.reviewCount || 38}
      />

      {/* Client-Side Recently Viewed Products */}
      <RecentlyViewed currentProduct={product} />

      {/* Luxury Product Share Modal */}
      <ProductShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          price: Number(price),
          image: primaryImage,
          categoryName: product.categoryName,
        }}
      />
    </div>
  );
}
