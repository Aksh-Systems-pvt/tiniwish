import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
import { StoreProvider } from "@/context/store-context";
import { ProductDTO, CategoryDTO } from "@/types/product";
import { BannerDTO } from "@/types/banner";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockBanners: BannerDTO[] = [
  {
    id: "banner-1",
    title: "Little Things. Beautiful Moments.",
    subtitle: "Discover thoughtfully curated jewellery, charming gifts and timeless pieces for your home.",
    linkUrl: "/products",
    desktopImageUrl: "/images/hero.jpg",
    placement: "HOMEPAGE_HERO",
    displayOrder: 1,
    isActive: true,
    ctaText: "Explore Collection",
  },
];

const mockCategories: CategoryDTO[] = [
  {
    id: "cat_jewellery",
    name: "Artificial Jewellery",
    slug: "jewellery",
    description: "Kundan, temple motifs, and bridal heirlooms.",
    imageUrl: "/images/jewellery.jpg",
    displayOrder: 1,
    subcategories: [
      { id: "sub_1", categoryId: "cat_jewellery", name: "Chokers", slug: "chokers" },
    ],
  },
  {
    id: "cat_gifts",
    name: "Charming Gifts",
    slug: "gifts",
    description: "Bespoke keepsake hampers.",
    imageUrl: "/images/gifts.jpg",
    displayOrder: 2,
    subcategories: [],
  },
  {
    id: "cat_decor",
    name: "Timeless Home Décor",
    slug: "home-decor",
    description: "Solid cast brassware.",
    imageUrl: "/images/decor.jpg",
    displayOrder: 3,
    subcategories: [],
  },
];

const mockProducts: ProductDTO[] = [
  {
    id: "prod-1",
    categoryId: "cat_jewellery",
    categoryName: "Artificial Jewellery",
    categorySlug: "jewellery",
    title: "Noor Meenakari Choker Set",
    slug: "noor-meenakari-choker-set",
    description: "Hand-set uncut Kundan stones with seed pearls.",
    isFeatured: true,
    isArchived: false,
    rating: 5,
    reviewCount: 12,
    createdAt: new Date().toISOString(),
    variants: [
      {
        id: "var-1",
        productId: "prod-1",
        sku: "TW-JWL-NOOR",
        title: "18K Gold Plated",
        attributes: { finish: "18K Gold" },
        mrp: 4999,
        sellingPrice: 3299,
        stockQuantity: 10,
        lowStockThreshold: 2,
        weightGrams: 200,
        isDefault: true,
        isActive: true,
      },
    ],
    images: [
      {
        id: "img-1",
        productId: "prod-1",
        url: "/images/noor.jpg",
        isPrimary: true,
        displayOrder: 1,
      },
    ],
  },
];

describe("TiniWish Luxury Homepage Sections", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("HeroBanner", () => {
    it("renders headline, subheading, and primary CTA button", () => {
      render(<HeroBanner banners={mockBanners} />);

      expect(screen.getByText(/Little Things\./i)).toBeDefined();
      expect(screen.getByText(/Beautiful Moments\./i)).toBeDefined();
      expect(
        screen.getByText(/Discover thoughtfully curated jewellery/i)
      ).toBeDefined();
      expect(screen.getByText("Explore Collection")).toBeDefined();
    });
  });

  describe("ShopByCategory", () => {
    it("renders the three flagship category pillars", () => {
      render(<ShopByCategory categories={mockCategories} />);

      expect(screen.getByText("Shop by Category")).toBeDefined();
      expect(screen.getByText("Artificial Jewellery")).toBeDefined();
      expect(screen.getByText("Charming Gifts")).toBeDefined();
      expect(screen.getByText("Timeless Home Décor")).toBeDefined();
      expect(screen.getByText("Chokers")).toBeDefined();
    });
  });

  describe("NewArrivals & BestSellers", () => {
    it("renders New Arrivals section with products", () => {
      render(
        <StoreProvider>
          <NewArrivals products={mockProducts} />
        </StoreProvider>
      );

      expect(screen.getByText("Fresh from the Atelier")).toBeDefined();
      expect(screen.getByText("Noor Meenakari Choker Set")).toBeDefined();
      expect(screen.getByText("View All New Arrivals")).toBeDefined();
    });

    it("renders Best Sellers section with products", () => {
      render(
        <StoreProvider>
          <BestSellers products={mockProducts} />
        </StoreProvider>
      );

      expect(screen.getByText("Most Cherished Treasures")).toBeDefined();
      expect(screen.getByText("Noor Meenakari Choker Set")).toBeDefined();
      expect(screen.getByText("View All Best Sellers")).toBeDefined();
    });
  });

  describe("Category Showcases", () => {
    it("renders Featured Jewellery editorial split banner", () => {
      render(
        <StoreProvider>
          <FeaturedJewellery products={mockProducts} />
        </StoreProvider>
      );

      expect(screen.getByText("Featured Jewellery")).toBeDefined();
      expect(screen.getByText("The Kundan Heritage Edit")).toBeDefined();
    });

    it("renders Charming Gifts showcase", () => {
      render(
        <StoreProvider>
          <CharmingGiftsShowcase products={mockProducts} />
        </StoreProvider>
      );

      expect(screen.getByText("Charming Gifts")).toBeDefined();
      expect(screen.getByText("The Art of Thoughtful Gifting")).toBeDefined();
    });

    it("renders Timeless Home Décor showcase", () => {
      render(
        <StoreProvider>
          <TimelessHomeDecorShowcase products={mockProducts} />
        </StoreProvider>
      );

      expect(screen.getByText("Timeless Home Décor")).toBeDefined();
      expect(screen.getByText("Sacred Spaces & Living Warmth")).toBeDefined();
    });
  });

  describe("Curated Collections & Shop the Look", () => {
    it("renders 4 curated seasonal collections", () => {
      render(<CuratedCollections />);

      expect(screen.getByText("Curated Collections")).toBeDefined();
      expect(screen.getByText("Festive Radiance")).toBeDefined();
      expect(screen.getByText("Gifts Under ₹1,999")).toBeDefined();
      expect(screen.getByText("The Bridal Trousseau")).toBeDefined();
      expect(screen.getByText("Sacred Living")).toBeDefined();
    });

    it("renders interactive Shop the Look styling ensemble", () => {
      render(
        <StoreProvider>
          <ShopTheLook />
        </StoreProvider>
      );

      expect(screen.getByText("Shop the Look")).toBeDefined();
      expect(screen.getByText("The Royal Soirée")).toBeDefined();
      expect(screen.getByText(/Add to Shopping Bag/i)).toBeDefined();
    });
  });

  describe("Social, Testimonials & Newsletter", () => {
    it("renders verified buyer customer testimonials", () => {
      render(<CustomerTestimonials />);

      expect(screen.getByText("Words of Grace")).toBeDefined();
      expect(screen.getByText("Aaditi Singhania")).toBeDefined();
      expect(screen.getByText("Dr. Meera Iyer")).toBeDefined();
    });

    it("renders Instagram-style editorial social gallery", () => {
      render(<InstagramGallery />);

      expect(screen.getByText("#TiniWishMoments")).toBeDefined();
      expect(screen.getByText("@radhika.weddingdiaries")).toBeDefined();
    });

    it("renders homepage newsletter subscription invitation", () => {
      render(<NewsletterInvitation />);

      expect(screen.getByText("Join the TiniWish Circle")).toBeDefined();
      expect(screen.getByPlaceholderText(/Enter your email address/i)).toBeDefined();
    });
  });
});

