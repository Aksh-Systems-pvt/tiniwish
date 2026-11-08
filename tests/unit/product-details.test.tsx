import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ProductDetailsClient } from "@/app/products/[slug]/product-details-client";
import { generateMetadata } from "@/app/products/[slug]/page";
import { QuickViewModal } from "@/components/products/quick-view-modal";
import { StoreProvider } from "@/context/store-context";
import { ToastProvider } from "@/components/ui/toast";
import { ProductDTO } from "@/types/product";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  usePathname: () => "/products/noor-meenakari-kundan-choker-set",
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockProduct: ProductDTO = {
  id: "prod-test-1",
  categoryId: "cat_jewellery",
  categoryName: "Artificial Jewellery",
  categorySlug: "jewellery",
  title: "Noor Royal Kundan Choker",
  slug: "noor-royal-kundan-choker",
  description:
    "Handcrafted royal choker with uncut Kundan and Meenakari detailing on brass base.",
  materials: "Brass, 18K gold micro-plating, glass Kundan",
  careInstructions: "Keep away from moisture and perfumes.",
  isFeatured: true,
  isArchived: false,
  rating: 4.9,
  reviewCount: 38,
  createdAt: "2026-10-15T10:00:00.000Z",
  images: [
    {
      id: "img-1",
      productId: "prod-test-1",
      url: "/images/kundan-1.jpg",
      altText: "Noor front view",
      displayOrder: 1,
      isPrimary: true,
    },
    {
      id: "img-2",
      productId: "prod-test-1",
      url: "/images/kundan-2.jpg",
      altText: "Noor side view",
      displayOrder: 2,
      isPrimary: false,
    },
  ],
  variants: [
    {
      id: "var-gold-emerald",
      productId: "prod-test-1",
      sku: "TW-NOOR-EMR",
      title: "18K Gold / Emerald Green",
      attributes: { finish: "18K Gold Plated", stone: "Emerald" },
      mrp: 4999,
      sellingPrice: 3299,
      stockQuantity: 3, // Low stock for urgency check
      lowStockThreshold: 4,
      weightGrams: 220,
      lengthCm: 20,
      widthCm: 15,
      heightCm: 6,
      isDefault: true,
      isActive: true,
    },
    {
      id: "var-gold-ruby",
      productId: "prod-test-1",
      sku: "TW-NOOR-RBY",
      title: "18K Gold / Crimson Ruby",
      attributes: { finish: "18K Gold Plated", stone: "Ruby" },
      mrp: 5499,
      sellingPrice: 3799,
      stockQuantity: 0, // Out of stock variant
      lowStockThreshold: 3,
      weightGrams: 230,
      lengthCm: 20,
      widthCm: 15,
      heightCm: 6,
      isDefault: false,
      isActive: true,
    },
  ],
};

describe("Product Detail Experience & Variant Validation", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  function renderProductDetails(product: ProductDTO = mockProduct) {
    return render(
      <ToastProvider>
        <StoreProvider>
          <ProductDetailsClient product={product} />
        </StoreProvider>
      </ToastProvider>
    );
  }

  it("renders product name, dynamic SKU, selling price, MRP, and discount", () => {
    renderProductDetails();

    expect(screen.getByRole("heading", { level: 1, name: /Noor Royal Kundan Choker/i })).toBeDefined();
    expect(screen.getByText(/SKU: TW-NOOR-EMR/i)).toBeDefined();
    expect(screen.getByText("₹3,299")).toBeDefined();
    expect(screen.getByText("₹4,999")).toBeDefined();
    expect(screen.getByText("34% OFF")).toBeDefined();
    expect(screen.getByText(/Only 3 pieces remaining/i)).toBeDefined();
  });

  it("updates SKU, price, and out-of-stock status when switching variants", () => {
    renderProductDetails();

    // Default variant check
    expect(screen.getByText(/SKU: TW-NOOR-EMR/i)).toBeDefined();
    expect(screen.getByText("₹3,299")).toBeDefined();

    // Click ruby variant (which has stockQuantity = 0)
    const rubyVariantButton = screen.getByText(/18K Gold \/ Crimson Ruby/i);
    act(() => {
      fireEvent.click(rubyVariantButton);
    });

    // Variant SKU and Price updated
    expect(screen.getByText(/SKU: TW-NOOR-RBY/i)).toBeDefined();
    expect(screen.getByText("₹3,799")).toBeDefined();
    expect(screen.getByText(/Currently Out of Stock/i)).toBeDefined();

    // Add to cart button is disabled when variant is out of stock
    const addToBagButton = screen.getByRole("button", { name: /Sold Out/i });
    expect(addToBagButton).toBeDefined();
    expect(addToBagButton.getAttribute("disabled")).not.toBeNull();
  });

  it("validates quantity bounds and prevents exceeding available stock", () => {
    renderProductDetails();

    const increaseBtn = screen.getByLabelText("Increase quantity");
    const decreaseBtn = screen.getByLabelText("Decrease quantity");

    // Stock for default variant is 3
    // Initial quantity is 1
    expect(screen.getByText("1", { selector: "span.font-mono" }).textContent).toBe("1");

    // Increase to 2
    act(() => {
      fireEvent.click(increaseBtn);
    });
    expect(screen.getByText("2", { selector: "span.font-mono" }).textContent).toBe("2");

    // Increase to 3 (Max stock)
    act(() => {
      fireEvent.click(increaseBtn);
    });
    expect(screen.getByText("3", { selector: "span.font-mono" }).textContent).toBe("3");

    // Try increasing to 4 (Should be blocked at 3)
    act(() => {
      fireEvent.click(increaseBtn);
    });
    expect(screen.getByText("3", { selector: "span.font-mono" }).textContent).toBe("3");

    // Decrease to 2
    act(() => {
      fireEvent.click(decreaseBtn);
    });
    expect(screen.getByText("2", { selector: "span.font-mono" }).textContent).toBe("2");

    // Decrease to 1
    act(() => {
      fireEvent.click(decreaseBtn);
    });
    expect(screen.getByText("1", { selector: "span.font-mono" }).textContent).toBe("1");

    // Try decreasing below 1 (Should be blocked at 1)
    act(() => {
      fireEvent.click(decreaseBtn);
    });
    expect(screen.getByText("1", { selector: "span.font-mono" }).textContent).toBe("1");
  });

  it("never allows customers to purchase unavailable stock", () => {
    renderProductDetails();

    // Select out-of-stock variant
    const rubyBtn = screen.getByText(/18K Gold \/ Crimson Ruby/i);
    act(() => {
      fireEvent.click(rubyBtn);
    });

    const addBtn = screen.getByRole("button", { name: /Sold Out/i });
    const buyNowBtn = screen.getByRole("button", { name: /Item Unavailable/i });

    expect(addBtn.getAttribute("disabled")).not.toBeNull();
    expect(buyNowBtn.getAttribute("disabled")).not.toBeNull();

    // Attempting click has no effect
    act(() => {
      fireEvent.click(addBtn);
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("executes Buy Now action directly to checkout with selected variant", () => {
    renderProductDetails();

    const buyNowBtn = screen.getByRole("button", { name: /Buy Now with 1-Click/i });
    act(() => {
      fireEvent.click(buyNowBtn);
    });

    expect(mockPush).toHaveBeenCalledWith("/checkout");
  });

  it("toggles product in wishlist and updates heart state", () => {
    renderProductDetails();

    const wishlistBtn = screen.getByLabelText(/Add to wishlist/i);
    act(() => {
      fireEvent.click(wishlistBtn);
    });

    expect(screen.getByLabelText(/Remove from wishlist/i)).toBeDefined();
  });

  it("switches tabs between Artisanal Story, Specifications, Shipping, and Care Guide", () => {
    renderProductDetails();

    // Click Specifications tab
    const specsTab = screen.getByRole("button", { name: /Specifications/i });
    act(() => {
      fireEvent.click(specsTab);
    });

    expect(screen.getByText(/Detailed Product Specifications/i)).toBeDefined();
    expect(screen.getByText(/220 grams/i)).toBeDefined();
    expect(screen.getByText(/20 × 15 × 6 cm/i)).toBeDefined();

    // Click Shipping & Returns tab
    const shippingTab = screen.getByRole("button", { name: /Shipping & Returns/i });
    act(() => {
      fireEvent.click(shippingTab);
    });

    expect(screen.getByText(/Shipping, Packaging & Doorstep Returns/i)).toBeDefined();
  });

  it("checks PIN code serviceability interactively", () => {
    renderProductDetails();

    const pinInput = screen.getByPlaceholderText(/Enter 6-digit PIN code/i);
    const checkBtn = screen.getByRole("button", { name: /Check/i });

    // Enter valid Delhi PIN code
    act(() => {
      fireEvent.change(pinInput, { target: { value: "110001" } });
    });
    act(() => {
      fireEvent.click(checkBtn);
    });

    // Advance simulated network timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Express Delivery to Delhi/i)).toBeDefined();
    expect(screen.getByText(/Cash on Delivery \(COD\) available/i)).toBeDefined();
  });

  it("generates complete SEO metadata with canonical URL and OpenGraph specs", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "noor-meenakari-kundan-choker-set" }),
    });

    expect(meta.title).toContain("Noor Meenakari & Kundan Choker Necklace Set");
    expect(meta.alternates?.canonical).toBe(
      "https://tiniwish.com/products/noor-meenakari-kundan-choker-set"
    );
    expect(meta.openGraph?.siteName).toBe("TiniWish");
  });

  it("renders QuickViewModal and allows adding to bag", () => {
    const handleClose = vi.fn();
    render(
      <ToastProvider>
        <StoreProvider>
          <QuickViewModal product={mockProduct} isOpen={true} onClose={handleClose} />
        </StoreProvider>
      </ToastProvider>
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Quick View: Noor Royal Kundan Choker")).toBeDefined();

    const addToBagBtn = screen.getByRole("button", { name: /Add to Bag/i });
    act(() => {
      fireEvent.click(addToBagBtn);
    });

    expect(handleClose).toHaveBeenCalled();
  });
});
