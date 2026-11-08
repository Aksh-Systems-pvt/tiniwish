import React, { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { bannerService } from "@/services/banner.service";
import { productService } from "@/services/product.service";
import { HeroBanner } from "@/components/home/hero-banner";
import { ShopByCategory } from "@/components/home/shop-by-category";
import { NewArrivals } from "@/components/home/new-arrivals";
import { BestSellers } from "@/components/home/best-sellers";
import { FeaturedJewellery } from "@/components/home/featured-jewellery";
import { CharmingGiftsShowcase } from "@/components/home/charming-gifts-showcase";
import { TimelessHomeDecorShowcase } from "@/components/home/timeless-home-decor-showcase";
import { CuratedCollections } from "@/components/home/curated-collections";
import { ShopTheLook } from "@/components/home/shop-the-look";
import { CustomerTestimonials } from "@/components/home/customer-testimonials";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { NewsletterInvitation } from "@/components/home/newsletter-invitation";
import { HomeLoading } from "@/components/home/home-loading";

export const metadata: Metadata = {
  title: "TiniWish | Little Things. Beautiful Moments. | Luxury Indian Boutique",
  description:
    "Discover handcrafted artificial jewellery, bespoke celebratory gifts, and artisanal brass home décor. Little wishes. Timeless treasures. Complimentary keepsake packaging across India.",
  keywords: [
    "artificial jewellery",
    "kundan choker",
    "polki earrings",
    "jhumkas",
    "luxury gifts",
    "wedding hampers",
    "brass home decor",
    "tiniwish",
    "indian luxury jewellery",
  ],
  openGraph: {
    title: "TiniWish | Little Things. Beautiful Moments.",
    description: "Discover handcrafted artificial jewellery, charming gifts, and timeless home décor.",
    url: "https://tiniwish.com",
    siteName: "TiniWish",
    locale: "en_IN",
    type: "website",
  },
};

async function HomePageContent() {
  await connection();

  const [
    banners,
    categories,
    newArrivals,
    bestSellers,
    jewelleryProducts,
    giftProducts,
    decorProducts,
  ] = await Promise.all([
    bannerService.getActiveBanners("HOMEPAGE_HERO").catch(() => []),
    productService.getCategories().catch(() => []),
    productService.getNewArrivals(4).catch(() => []),
    productService.getBestSellers(4).catch(() => []),
    productService.getProductsByCategory("jewellery", 3).catch(() => []),
    productService.getProductsByCategory("gifts", 3).catch(() => []),
    productService.getProductsByCategory("home-decor", 3).catch(() => []),
  ]);

  return (
    <div className="space-y-0">
      {/* 3. Hero Banner */}
      <HeroBanner banners={banners} />

      {/* 4. Shop by Category */}
      <ShopByCategory categories={categories} />

      {/* 5. New Arrivals */}
      <NewArrivals products={newArrivals} />

      {/* 6. Best Sellers */}
      <BestSellers products={bestSellers} />

      {/* 7. Featured Jewellery */}
      <FeaturedJewellery products={jewelleryProducts} />

      {/* 8. Charming Gifts */}
      <CharmingGiftsShowcase products={giftProducts} />

      {/* 9. Timeless Home Décor */}
      <TimelessHomeDecorShowcase products={decorProducts} />

      {/* 10. Curated Collections */}
      <CuratedCollections />

      {/* 11. Shop the Look */}
      <ShopTheLook />

      {/* 12. Customer Testimonials */}
      <CustomerTestimonials />

      {/* 13. Instagram-style Gallery */}
      <InstagramGallery />

      {/* 14. Newsletter Invitation */}
      <NewsletterInvitation />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomePageContent />
    </Suspense>
  );
}
